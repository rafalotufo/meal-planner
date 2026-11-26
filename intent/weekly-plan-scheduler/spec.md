# Hosted weekly plan scheduler — specification

- Author: architect
- Date: 2026-11-26
- Status: Approved
- Independent approval: `org/reviews/design-weekly-plan-scheduler-001.md`;
  `org/reviews/security-weekly-plan-scheduler-design-001.md`
- Owner amendment: Wednesday09:00 America/Toronto; Hobby delay within one hour
  accepted in the active chat on2026-11-26
- Input: accepted sibling `intent.md`; PM review
  `org/reviews/intent-weekly-plan-scheduler-001.md`
- Source grounding and platform limitations: sibling `design-notes.md`

## Outcome and trigger — owner-selected Wednesday Hobby schedule

Add a hosted authenticated service route invoking the existing weekly generator.
The owner amended the intended calendar to Wednesday at09:00 America/Toronto for the next
strictly subsequent Sunday. Do not change recipe selection or regenerate
existing drafts/final plans. No schema migration or paid provider operation.

Proposed native trigger: two `vercel.json` entries for exact
`/api/plans/generate`, schedules `0 13 * * 3` and `0 14 * * 3`. These cover EDT
and EST without seasonal deployment. The actual Toronto due check skips the
08EST call and safely retries at10EDT if the earlier call failed. Wednesday09:00 is the scheduled target; the owner explicitly accepts Hobby's
delivery window09:00–09:59. Native delivery remains best effort and may miss;
it is not an exact-minute SLA. The later summer10EDT entry can reconcile an
earlier failed invocation, potentially as late as10:59; it normally reports
existing. This is a bounded recovery opportunity, not a change to the first
scheduled09:00–09:59 window.
Do not introduce a paid plan, beta Schedules feature, new repository publication
or external scheduler account. Any different selected trigger updates this spec
and plan before implementation.

Native cron is Production only. Preview has the same handler, reached by direct
manual authenticated HTTPS calls, with no claim of an unattended Preview run.
Keep unrelated `vercel.json` settings unchanged. Production definitions and
credential configuration remain unapplied until the separate release approval.

## Service configuration and authentication

Use server-only `MEAL_PLAN_SCHEDULER_ENABLED=true` and `CRON_SECRET`, absent by
default. Disabled/unset means404 and no DB effect. Malformed enabled value or
missing/malformed configured secret fails closed with503, never authenticates
`Bearer undefined` or an empty value. Require a random secret of at least32
bytes, represented as64 hexadecimal characters or a documented equivalent
header-safe form. Stage and Production use independent secrets. Do not reuse
Better Auth, Google, verification, database or provider credentials.

The exact route is excluded from Next Proxy only because it owns a separate
service guard. It is not added to `isPublicRequest` and cannot be reached by a
Google session or verification cookie alone. Protect every supported HTTP
method, including error/405 responses, with the same private/security headers
as the existing exact menu handler: Cache-Control private,no-store, Pragma
no-cache, CSP default-src none/frame-ancestors none/base-uri none, nosniff,
X-Frame-Options DENY, Referrer-Policy no-referrer and HTTPS HSTS.

Compare exact `Authorization: Bearer <secret>` with fixed-length digest or
constant-time byte comparison. Reject missing, malformed, duplicate/coalesced,
incorrect and overlong credentials before DB access. Do not log credentials,
headers, request bodies, URLs with credentials or internal errors. No successful
service response sets a browser session/cookie or returns a family identifier.

The route must enforce a server-configured exact Host and exact path on every
method; do not trust arbitrary forwarding/Host headers or wildcard generated
hostnames. Existing browser/user/menu canonical-host rules remain unchanged.
Use explicit server-only `MEAL_PLAN_SCHEDULER_ORIGIN` as this route's one exact
service origin. It must be a plain HTTPS origin (no credentials, path, query,
fragment, wildcard or port) and its Host must match the request exactly. Enable
hosted configuration only when `VERCEL_PROJECT_ID` equals the existing
`prj_ntxXnJAVA977jHjLNDR7xJuwSx4V` and `VERCEL_ENV` is exactly `production` or
`preview`. On Preview the service origin must be exactly
`https://meal-planner-staging-rafalotufos.vercel.app`, matching its existing
browser canonical origin. Require `BETTER_AUTH_URL` to match the fixed browser
origin for the actual environment: staging above or Production
`https://lotufo-meals.vercel.app`. Missing/malformed/mismatched host/project/env
configuration fails closed before DB access. No wildcard/client forwarding
header or arbitrary `VERCEL_URL` becomes an accepted service origin.

For the owner-selected native trigger, the Production machine origin is the
inspected `targets.production.automaticAliases` hostname:
`https://meal-planner-rafalotufos-projects.vercel.app`. Runtime Production
configuration must equal this exact origin; any other configured origin
fails503. That is a distinct
service-only boundary, not permission to alter browser/menu canonical rules.
Require independent security approval of this exact choice, reinspection at
release, and actual registered cron target/Host observation after activation.
Do not silently accept extra aliases or claim a secure origin allowlist proves
native cron dispatch. No redirect or proxy-forwarding workaround is introduced.
The service route never issues browser session cookies.

After service authentication, allow only GET to generate. Export GET, HEAD,
POST, OPTIONS, PUT, PATCH and DELETE explicitly; authenticated unsupported
methods return405 with `Allow: GET`, never automatic successful HEAD/OPTIONS
execution. Reject query parameters, body/transfer declarations and nonexact
route targets before generation; no date, family, identity or clock override.
Ignore `x-vercel-cron-schedule` and User-Agent for authentication. No Origin
requirement is added because this is a Bearer-authenticated machine operation;
browser cookies cannot substitute for its credential.

Validate the server Google allowlist before any DB work even on skip paths;
malformed policy denies all generation. Hosted configuration accepts only the
explicit `MEAL_PLAN_DRAFT_DAY=Wednesday`; unset/another/invalid day fails503,
avoiding a stale Wednesday trigger paired with the historical CLI default.
The CLI keeps its existing configurable-weekday behavior.

## Execution, deadlines and persistence

Export explicit Node runtime, dynamic execution and `maxDuration=90`. Apply a
60-second wall-clock exchange deadline starting before DB admission, leaving
platform headroom. Guard and due check precede pool creation. Off-day/before09
returns200 aggregate `skipped:true` counts with no DB connection.

Extend `generateDuePlans` with an internal optional execution-deadline option,
never supplied by request input. Existing CLI/tests without an option retain
current behavior. Deadline-aware calls use the existing request-owned
`openVerificationDatabase` admission and its deadline read/write transaction
methods. Deadline methods destroy their owned connection at expiry and prevent
later SQL. Apply the same remaining deadline to every family page read and
per-family transaction; no unbounded background `after`/waitUntil work or
Promise.race that lets mutations continue after a successful/error response.
Close the request-owned pool before completing the response.

Register that exact same bounded `schedulerResponse` promise once with the
existing `@vercel/functions` `waitUntil` and return it to Next. Together with
`supportsCancellation:true` for this function, this retains cleanup lifetime
after disconnect while the signal stops new family work. It never starts a
second generator or an unbounded post-response task. The60second deadline,
started-work settlement and pool-close-before-response rules remain unchanged.
Independent security/reviewer lifecycle consultation approved this clarification
on2026-11-26; actual hosted disconnect delivery remains unobserved before release.
The public SDK barrel exposes optional `ws` declarations even for waitUntil.
Independent review approved exact dev-only `@types/ws@8.18.1` (matching the
installed SDK's own type pin) and generated lockfile to satisfy strict checking.
No WebSocket runtime package/feature, vendor patch or compiler suppression is
added. The runtime's lazy WebSocket branch is unused.

Preserve current common transaction advisory lock acquired before decision
reads, READ COMMITTED per-family writes, runtime metadata validation, restricted
DB role and verified TLS. Persisted member eligibility, synthetic-family
exclusion, ready curation snapshots, keyset100 family pages, seven-source
selection and unique `(family_id,week_start)` remain unchanged. Existing plans
and family edits are never overwritten. Partial completed family transactions
remain committed if a later family fails; retries reconcile through the same
idempotency check. Failures return generic503 without SQL/configuration detail;
request abort must prevent further page/family scheduling. Await any already
started transaction's settlement before returning, then close the pool. No
work may continue mutating after the response. Abort never advances to the next
family or reports a full successful run.

Success exposes only aggregate `skipped,created,existing,empty,ineligible`
counts. Emit one bounded credential-free completion/failure event for an
authenticated invocation with UTC timestamp, outcome and aggregate counts on
success. Do not log queries, evidence, recipe titles, family/member IDs or
secrets. Vercel invocation status/timing remains operational evidence; no new
telemetry service or alert subscription.

## Retries and missed runs

Native delivery is best effort and does not retry failed requests. Duplicate
and concurrent requests are safe. The second EDT entry is a bounded extra
same-day opportunity; winter's early entry is skipped. Operators may retry
manually with the dedicated credential on the same Wednesday after09; use
actual time and no date override. Existing dueWeek has no off-day backfill.
A full-day outage therefore misses a week and requires a separately scoped
recovery decision. Never delete a plan, rewrite its date, reset history or relax
admission to force recovery. Check the first actual scheduled run after
activation; a passing manual request alone is not proof of unattended delivery.

## Staging and release evidence

Deploy the reviewed clean exact source to the existing branch-qualified Preview
lane using its isolated restricted DB and existing keyless configuration.
Configure only its separate scheduler enablement/secret/service origin. Reinspect source,
Preview ID, alias, target and private environment attribution. Preserve all
Production deployment/domain/configuration assignments.

On today's actual Thursday (off-day for the amended schedule), invoke its canonical handler without a secret,
with a wrong secret, unsupported method, invalid target and correct credential.
Use a private operator process, no browser injection or secret command argv.
Protect any platform share-link separately; revoke it after the bounded check.
For existing eligible real Google staging households with ready menus, save a bounded count and
hash projection of existing plans before invocation, record aggregate result,
and verify only missing upcoming weeks are created from their existing menus.
Invoke again, proving unchanged plan snapshots/revisions. Do not provision fake
Google identities, widen the allowlist, process synthetic families globally,
import Production data or persist fake records. No paid provider call is needed.
The read-only staging inventory found one real Google family, zero saved menu
recipes and zero plans. Today's actual Thursday handler therefore should
return `skipped:true` and zero counters, then the same on a repeat, before DB
admission. This proves deployed guard/offday behavior, not due-day DB admission
or draft creation. Add a separately reviewed operator rollback-only probe
on the exact recorded Preview database: acquire the existing common lock in one
transaction, verify the same current real family/member eligibility, insert at
most seven transient fixture menu snapshots, exercise the same per-family core
with a deterministic Wednesday09:00 test clock confined to the operator probe, verify created plan and repeat idempotency inside
that transaction, then deliberately roll back every change. Recheck bounded
before/after counts and hashes to prove no fixture rows escaped. The probe has
no Production target, no schema/grant changes and no commit option; it must fail
closed outside the recorded verified-TLS staging target:
`ep-wandering-breeze-bbtscekj.c-15.us-east-1.aws.neon.tech`, database
`meal_planner` (only its exact `-pooler` hostname variant is also permitted).
Require a distinct private `MEAL_PLAN_SCHEDULER_PROBE_DATABASE_URL`, validated by
the existing remote URL rules and exact target match; no command-line URL or
Production fallback. The transient probe must test existing/final preservation
and throw an owned rollback sentinel before outer commit, including on failure.
No catch may convert the sentinel into a transaction commit. Its operator credentials
remain private outside Vercel. Extract only the existing transaction-owned
per-family generator core needed to share this code path; do not add a clock,
family or recipe override to HTTP. Record rollback-only DB proof separately
from the hosted offday `skipped:true` handler result and local disposable DB tests. If the
probe cannot complete, record its coverage gap rather than invent hosted proof.
Do not add a runtime clock bypass.

Inspect the authenticated staging plan page at mobile and desktop widths where
an existing real staging session is available; do not copy a Production cookie.
If unavailable, record that gap and use owned local real-Chrome fixtures for
visible responsive behavior as a distinct proof class. Preview does not execute
cron: automatic delivery and actual Production cron Host remain explicit
unobserved items until a separately authorized activation/observation.

Prepare `release-preparation.md` with fixed releaseSourceSha, reviewed local
results, actual staging deployment/profile/results/gaps, remaining owner staging
acceptance and human merge gate, proposed Production enablement/secret/cron
settings, platform precision choice, credential lifecycle, canonical service
Host verification, no-migration statement and bounded recovery. Production uses
separate `--prod --skip-domain` build then manual promotion only after fresh
approval. Capture installed definitions and source/target binding read-only;
never accept READY alone. Recovery disables only this scheduler through a
reviewed compatible correction or explicitly approved project cron toggle,
never drops tables or reverts to an incompatible migration catalog. No
Production action is authorized by this specification.

## Acceptance verification

Test-first strict TypeScript checks cover no/wrong/malformed secret, disabled
or malformed config, all methods, Host/path/query/body rejection, no-cookie
substitution, security headers, malformed allowlist, due/offday/DST/rollover,
no DB admission on skip, request deadline/abort and underlying SQL settlement,
generic failures and no leaked diagnostic values. Real HTTP tests must traverse
the built exact route and prove matcher behavior; direct handler tests alone
are insufficient. Reuse disposable PostgreSQL tests for creation, concurrency,
unchanged existing/final plans, partial progress and synthetic exclusion.

Run required lint/typecheck/build, recipe/family/menu/auth/plans/deployment and
Python workflow regressions, real Chrome mobile/desktop checks, diff/plan-sync
checks and zero staged-secret findings. Independent design/security/code
reviews precede fixed-source staging release preparation. Source, audit commits
and proof classes stay distinct. Preserve the original weekly implementation
records; the old unactivated runbook gains a clear supersession link only.

## Corrective amendment after first Production attempt — pending review

The first promoted candidate's registered cron host was its generated deployment
hostname, outside the original fixed service Host rule. The original source and
acceptance remain historical; they do not certify a working native dispatch.
For corrective work, `hosted-target-correction.md` supersedes only the original
one-service-Host requirement and the associated staging/candidate/registered-host
proof. It specifies the exact trusted current deployment `VERCEL_URL` as a
second machine-only Host, with unchanged browser canonical rules and full service
authentication, plus fresh review/staging/owner approval before another Production
attempt. That corrective amendment is proposed, not yet independently approved.
