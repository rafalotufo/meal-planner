# Agent deployment verification — specification

- Author: architect; date: 2026-11-25
- Status: Revised for security review; independent peer review and owner spec approval pending
- Inputs: accepted sibling intent/options; security assessment `org/reviews/agent-deployment-verification-security-001.md`
- Approval boundary: local implementation needs an approved plan; hosted schema/configuration/data/deployment changes need separate exact-scope authority.

## Decision and scope

Provide operator-issued, single-use access to a synthetic member on isolated staging.
A normal browser opens a staging entry page and submits a run ID and short-lived
credential; the server issues a separate, revocable verification session cookie.
Keep Google sign-in and its Better Auth JWE transport unchanged. Never mint a fake
Google subject, add a synthetic email to the Google allowlist, or import a test
transport fixture into production code. Unattended issuance is deferred.

V1 covers the existing home/search UI, family summary, saved-result menu snapshot
save/list/lookup/remove, and weekly-plan read/approve/suggest actions within a
synthetic household. Existing provider/keyless behavior and paid budgets apply.
It denies Google onboarding/provisioning, invitation create/accept/revoke, and
URL import/retry/background curation for synthetic principals. These are explicit
coverage gaps, not successful checks. Denials apply in route and store/delegation
authorization, including direct API calls; hiding a UI control is insufficient.
No authenticated Production verification or public anonymous demo is introduced.

## Ordinary-browser entry and issuance

A trusted operator runs an explicit local issuer command against the approved
Preview target, using separately held operator database credentials. There is no
HTTP mint endpoint or reusable browser-agent issuer secret. The command checks
recorded target identity, exact deployment/source/profile and granted run scope,
then creates the family, synthetic members and run atomically under the existing
transaction advisory lock/timeouts. One family belongs to exactly one run; use
two synthetic members only when plan collaboration coverage is requested.

The issuer generates a CSPRNG 256-bit capability per member and stores only its
SHA-256 digest. Expiry is five minutes after issuance, one successful redemption.
It writes a mode0600 temporary handoff file through an explicit output path;
never print the credential to ordinary logs, arguments, chat or audit records.
The operator transfers it using an approved private run channel. The agent needs
only this capability and, if necessary, scoped platform access. The capability
is a bearer secret: a thief may redeem it first; recipient/run labels are audit
attribution, not cryptographic proof of who possesses it. Delete the handoff file
after use/expiry and exclude it from screenshots, git and sanitized evidence.

`GET /verification` returns a no-store, same-origin HTML form with run ID and
password-style credential fields, no query/fragment token or external assets.
A five-minute HttpOnly preflight nonce cookie is paired with a hidden form value;
no DB setup or credential consumption occurs on GET/HEAD. Browser POST goes to
`/api/verification/session` as `application/x-www-form-urlencoded` with exactly
runId, capability and nonce fields. Reject duplicate/unknown fields, malformed
IDs, bodies above2KiB, requests taking over5s, missing/exact-mismatched Origin,
cross-site fetch metadata and nonce mismatch. Do not log request bodies.

Capability exchange uses one READ COMMITTED transaction and common advisory lock:
recheck target/run/member/expiry/revocation, atomically consume a matching unused
digest, insert a fresh session digest, then commit before setting its cookie.
Concurrent redemption has one winner; replay/expired/revoked/unknown credentials
return the same generic401. Lost success responses require a new operator-issued
capability; exchange is deliberately unsafe to retry. Success is303 to canonical
`/`, clears the nonce, and never reflects the capability. No client-selected
family, member, redirect, scope or expiry is accepted. Invalid form is400,
Origin/nonce failure403, configured throttle429, storage outage503.

Rate-limit exchange through PostgreSQL shared counters: maximum10 attempts per
run ID in five minutes, plus100 attempts per deployment in five minutes; unknown
IDs count toward the deployment bucket. Counters have bounded retention; lock,
statement and request deadlines fail closed. Vercel protection remains an outer
abuse layer. No IP/header-based identity claim or in-memory-only limiter.

## Principal, storage and sessions

Use a discriminated internal principal: existing verified Google identity versus
`verification` with runId/memberId. Store helpers accept that union through one
central member/admission resolver; Google-only helpers require the Google branch.
`requireFamilyContext` still derives both IDs server-side. No caller may construct
an authenticated verification principal from body/header IDs alone.

Existing plan/invitation foreign keys point to app_users, so a separate fake-user
map would not support actual app behavior. Propose one reviewed UUID migration:
add `identity_kind` default google to families and app_users; make app_users'
google_subject and verified_email nullable only for verification rows; add
verification_run_id for that branch. A check requires Google rows to retain their
current nonempty subject/normalized verified email and null run ID; verification
rows require null Google fields, null invitation grant and a nonnull run ID.
Existing Google data/unique indexes remain preserved. Match family/member kind
through a composite FK to a unique families(id,identity_kind) key, and bind each
verification member's (runId,familyId) by FK to its run's unique pair.
Synthetic labels are derived display text, never presented as verified email.
Family summary/types/UI must handle that branch without weakening Google checks.

Add run records (id, unique familyId, target binding, created/expires/revoked
state, approved scope), capability records (digest, run/member, expiry,
consumedAt), session records (digest, run/member, fixed expiry, revokedAt), and
shared throttle buckets. Enforce uniqueness, foreign keys, safe timestamps and
state checks in SQL. Runtime grants permit needed run/session reads and atomic
exchange/revocation only; issuer setup/cleanup stays operator-owned. Update
reviewed catalog/security/runtime compatibility metadata and migration tests.
No runtime creates tables, migrates, grants privileges or seeds households.
Exact migration SQL/grants and compatibility profile require plan/review before
execution; older artifacts may reject the new catalog and are not assumed safe.

The verification cookie is a fresh random256-bit opaque credential, stored only
as a digest in the database. Use `__Host-mp-verification`, Secure, HttpOnly,
SameSite=Lax, Path=/, no Domain, fixed15-minute expiry without refresh, bounded
by the run's30-minute maximum. Cryptographic identity means proof of possession
of that unguessable credential, not a Better Auth user/JWE. Every shared session
read rechecks its current digest/run/member, live target binding, expiry,
revocation and synthetic family ownership. No cross-request admission cache.
Reject duplicate verification cookies and simultaneous Google+verification
credentials rather than silently selecting the broader identity.

Existing same-origin logout gains an explicit verification branch that revokes
the current session before clearing its cookie. Operator run revocation invalidates
all its capabilities/sessions on subsequent checks. Expired/revoked cookies may
be cleared by logout despite lost admission, without restoring app access.
A request already admitted can finish; mutations recheck run admission within
their decision transaction. Revocation does not cancel a provider request already
started, and provider cancellation rules remain unchanged.

## Target isolation and every authorization path

Require all of: Vercel Preview at build and runtime, recorded project ID and
exact deployment ID, fixed staging HTTPS origin, expected source SHA and reviewed
configuration-profile digest, Preview database identity, and live run binding to
those same values. Missing/mismatched metadata denies verification. Build an
immutable verification manifest containing build-known source SHA, profile digest,
Preview build target and project/origin policy from trusted build inputs, with no
secrets. The exact deployment ID is bound at runtime using trusted platform
metadata and the issuer's independently checked deployment record; it need not
be present during build. Never substitute a generated placeholder or alias for
missing deployment evidence. Runtime metadata must match both manifest policy
and the run record before exchange or session admission.
Ordinary Production builds omit an enabled manifest. Production runtime target
always denies verification even if Preview settings, capability/session digests
or database credentials are copied. Noncanonical Host still421 before entry.
Production origins are never accepted as verification origins. Local tests use
an explicit test-process target fixture that cannot be selected in hosted runtime.

This is defense against configuration mistakes and stolen run credentials under
trusted source/build/platform administration. Environment variables are trusted
platform signals, not cryptographic attestation against a malicious administrator
who can alter code, platform identity and signing/build inputs. Do not claim
security against that authority. Capability/session digest lookup and all checks
bind the actual deployment/source/profile; alias movement invalidates the run.

Proxy keeps canonical Host/security headers and consults the shared typed session
adapter. The exact GET/HEAD `/verification` entry exception remains behind Proxy
and requires the staging target guard. Exclude exactly `/api/verification/session`
from the Proxy matcher for **all methods**, preserving the existing exact menu
exclusions. Do not exclude trailing-slash/child/encoded lookalike path shapes;
they retain normal Proxy protection. This avoids Next16.4.6's documented wait for
unfinished request-body EOF before handler dispatch, recorded in
`intent/saved-recipe-menu/request-timeout-note.md`.

The direct exchange handler supplies the complete equivalent guard: target and
canonical Host validation, private/no-store and all existing security headers,
explicit POST-only method policy, exact Origin/fetch-site/nonce checks, shared
PostgreSQL throttle and the bounded5s/2KiB parser. Start the deadline on handler
entry before reading any body; race/cancel body reading and any throttle/storage
work against it. Check target/Host before method rejection, returning421 for
noncanonical Host and404 for disabled targets; permitted staging unsupported
methods return405 with Allow: POST and the same headers without reading the body.
For POST, cheap target/Host/Origin/content-type checks and the shared deployment
throttle precede bounded body parsing; run throttling and nonce validation follow
validated parsing. Incomplete body at the deadline returns408 without awaiting
EOF or consuming credentials. No issuance transaction starts until the full
validated body, nonce and both throttle checks pass. Storage failure503 and
throttle429 remain bounded by the same deadline. Never trust forwarded identity
headers. Pages, API handlers and stores still authorize independently.

Proposed amendment to the mandatory menu JWE contract: Google continues the exact
current `getCookieCache` JWE/current session-token/subject/email equality checks.
Verification instead validates its raw current cookie digest and principal/run
binding independently in the equivalent menu handler guard, then performs the
same family/current-admission check. It must match the token/principal returned
by the shared reader; never trust forwarded Proxy headers or a cached identity.
Every menu method, including405, keeps canonical Host and private/security
headers. Exact menu APIs retain the existing Proxy body-buffering exemption.
No broad menu guard relaxation or fake Better Auth cookie is permitted.

## Hosted prerequisites, data lifecycle and platform ingress

Before any hosted run, separately authorize the exact Preview deployment, schema
migration/grants, operator setup, run duration, synthetic seed data/write scope,
provider budget and cleanup. Keep both recorded databases isolated. Synthetic
rows are never imported from real users; new run family IDs own every seeded row.
Explicit cleanup first revokes the run, then deletes only its proven-owned rows
in FK order with counts/rollback on ownership mismatch. No GET reset, broad
TRUNCATE, global test-data deletion or Production access. Retain sanitized run
results, not credential material; remove expired capability/session/throttle rows
with the separately authorized targeted cleanup command. Global operator or
background plan-generation scans must exclude verification families by default,
even before run expiry. A dedicated invocation may include only the exact family
of a live run whose approved scope explicitly authorizes that work, after current
target/run checks; expired/revoked runs never remain eligible for provider jobs.

For V1, an operator supplies a scoped Vercel Shareable Link if protection blocks
ordinary navigation. Never give the browser a project-wide automation-bypass
secret or Vercel account. Before declaring ready, prove a fresh browser can use
the scoped link, reach the canonical staging origin with platform access intact,
and remain on the run's exact deployment. Share links/branch aliases alone do
not establish deployment pinning or cross-host cookie compatibility. Serialize
alias movement during a run, check binding on every app request, and revoke the
share link at completion. If current plan/link limits or canonical-host behavior
prevent this, hosted readiness is blocked pending a separately reviewed ingress
change; no fallback to project-wide credentials or public protection removal.
Actual account availability, link revocation behavior and cookie scope are
uninspected prerequisites, not asserted successes.

## Verification evidence and acceptance

Amend active staging runbooks/helper contracts during implementation, preserving
historical records. New evidence explicitly distinguishes synthetic-app checks,
real-Google OAuth, local-fixture results, provider checks, platform-bypassed traffic
and anonymous Production health. A synthetic run cannot populate real-Google
allowed/denied flags or pass today's finalize helper unchanged. Each check records
run/member labels, exact source/deployment/profile, browser/version, actual result
and gaps. Existing Google requirements need separate real checks or explicit
release-specific owner gap acceptance; this spec does not grant that acceptance.
Keyless provider errors, blocked ingress and unexecuted curation remain named gaps.

| Acceptance case | Required result |
| --- | --- |
| Fresh ordinary browser, valid run | Form entry and authenticated real deployed pages without Google, injected cookies or custom headers |
| Replay, concurrent exchange, expiry, revocation | One winner; generic rejection thereafter; revoked sessions fail current reads/effects |
| Copied settings/cookies/DB credentials on Production; origin/source/profile/alias drift | Verification rejected before private reads/provider effects; Google path unaffected |
| Foreign family/member/run or client-selected identity | Denied in handlers/stores/transactions; no data/provisioning side effects |
| Menu/exchange direct requests and unsupported methods | Complete equivalent guards/headers remain; exact matcher exemptions only |
| Raw HTTP exchange with partial chunked body and no EOF |408 reaches client within5s plus measured transport tolerance; no consumed capability/session/issuance transaction; test valid-looking and unknown run prefixes |
| Synthetic invitations/provision/curation delegation | Server-side403 without invitation, membership, task or paid effect |
| Cookie conflicts, missing DB, malformed/oversized/slow input, CSRF, throttle | Fail closed with defined bounded response and no leaked credential |
| Browser QA | Current stable Chrome, Firefox and Safari at390px and1440px; actual versions/results recorded, unavailable browsers are gaps |
| Google and app regressions | Existing Google/session, family, menu, plans, recipe/photo, migration and deployment suites retain their assertions |

Before code, verify pinned APIs in this worktree's bundled Next docs. For this
proposal, matching Next16.4.6 route-handler/cookie/Proxy guides and Better Auth1.7.27
`getCookieCache` implementation were read from the installed reference checkout
`/Users/rafael/projects/meal-planner/node_modules`; this worktree has no dependencies.
The design uses public request/cookie primitives and no private Better Auth mint API.
Implementation verification includes strict TypeScript negative tests first, all
repository checks, secret scan and real browser evidence. This docs-only proposal
has no runtime, hosted or browser-success claim.

Official capability references consulted2026-11-25: [Vercel system metadata](https://vercel.com/docs/environment-variables/system-environment-variables),
[Vercel Shareable Links](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/sharable-links),
and [Better Auth sessions](https://better-auth.com/docs/concepts/session-management).
