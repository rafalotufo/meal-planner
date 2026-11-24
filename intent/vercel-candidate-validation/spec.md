# Isolated Vercel staging validation — specification

- Author: architect
- Date: 2026-11-24
- Status: Independently reviewed — owner approval pending
- Reviews: `org/reviews/security-vercel-candidate-validation-design-001.md`;
  `org/reviews/spec-vercel-candidate-validation-001.md`
- Intent: sibling `intent.md`, accepted by PM in
  `org/reviews/intent-vercel-candidate-validation-001.md` after `ceo-0028`.
- Scope: local operator tooling and documented staging operations; this document
  does not authorize external configuration, deployment, database writes or release.

## Outcome and architecture

Validate a reviewed source revision in the existing Vercel project's **Preview**
environment at one stable HTTPS alias. Configure that deployment's existing
`BETTER_AUTH_URL` to the alias, with separate staging Google credentials/auth
secret and the recorded Preview database. Preserve all application code,
single-origin guards, verified Google subject/admission/family checks and
host-only session cookies. No OAuth Proxy, multiple trusted origins, synthetic
hosted identity, custom paid environment, Git integration or new project.

A staging pass concerns its Preview deployment ID and source SHA. It does not
certify an unchanged Production artifact: Production is built/deployed separately
from that source under the existing manual release runbook. Never promote a
Preview deployment or move a Production hostname as a staging action.

## Resource and configuration contract

Verify the following recorded targets before operational effects; stop on drift:

- Vercel Hobby scope `rafalotufos-projects`, team
  `team_2c0O29FMb91g7L6sUChc9v6J`, project `meal-planner`, ID
  `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`; no Git integration.
- Preview Neon project `withered-night-50194672`, branch
  `br-dark-term-bbqhnxi5`, database `meal_planner`, as recorded in
  `intent/postgresql-persistence/hosted-resources.json`. Keep its existing
  sensitive pooled runtime `DATABASE_URL`, restricted role and verified TLS.
- Production Neon project `plain-pond-82425009` is excluded. Neither runtime
  credentials nor data may be copied between environments. Migration/bootstrap
  credentials remain outside Vercel; no migration or data import is introduced.

Choose an available, account-controlled single-label `*.vercel.app` manual alias
that is distinct from all Production/generated deployment hostnames. Record the
actual alias only after ownership, availability and account behavior checks;
no particular name is currently reserved. Use no purchased domain or paid
Preview Deployment Suffix. If this cannot work within existing Hobby resources,
stop for a revised reviewed proposal rather than change projects or plans.

| Preview variable | Contract |
| --- | --- |
| `BETTER_AUTH_URL` | Exact staging HTTPS origin, root path, no query/credentials |
| `BETTER_AUTH_SECRET` | New independent random secret, at least 32 bytes |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Dedicated staging Web OAuth client; only its exact staging callback registered |
| `DATABASE_URL` | Existing separately configured Preview restricted pooled URL |
| `OPENAI_API_KEY` | Empty/absent; do not copy a Production key |
| `RECIPE_SEARCH_PROVIDER` | `openai`, preserving current missing-key failure behavior |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1`, preserving pinned pnpm build policy |

Privately inspect effective Preview values and branch overrides, not just key
presence. Require credentials distinct from Production and confirm no runtime
or build override targets Production. Record only variable names/scopes and
verification outcomes; never download env files, print secret values or upload
local `.env*`. Secrets use sensitive storage. Preserve Production/Development
variables, existing protection/WAF settings, Node24, pinned build commands and
`vercel.json` runtime/duration/cancellation settings.

Register `<staging-origin>/api/auth/callback/google` exactly in the dedicated
Google client and verify consent/test-user eligibility. The app uses the server
redirect flow; adding an Authorized JavaScript Origin alone is insufficient.
The existing server-only allowlist is unchanged and must never enter reports,
props, screenshots or logs. No test identity bypass or allowlist broadening.

## Stable alias and production-domain safety

Use the pinned install-scripts-disabled `vercel@66.6.0` CLI from the existing
runbook. CLI Preview deployment is manual, without `--prod`, custom target,
prebuilt Production output or automatic Git trigger. Inspect its returned ID,
project/team, readiness and Preview target before alias assignment; do not infer
Preview merely from a generated hostname. Existing first-deployment history must
be confirmed, because Vercel documents first deployments as Production.

Keep the staging alias out of the project's Production/default domain set.
Vercel documents that ordinary custom project domains without Preview branch
assignment are automatically assigned to Production. A bare alias assignment
must not be assumed to avoid that behavior. Enumerate **all** alias/domain pages,
confirm the staging hostname's classification and capture the exact approved
Production-domain set and deployment ID before any assignment. Recheck them
after assignment and again before future Production promotions. Unknown or
Production-classified staging aliases fail the setup prerequisite.

The selected mechanism is manual alias routing, not adding an unqualified
Production domain in the dashboard. The pinned CLI/account behavior for an
available free `*.vercel.app` alias has not been verified in this checkout.
Operational setup must prove safe classification; do not claim it is already
available or solve uncertainty by temporarily moving a Production domain.
No staging check requires promotion to establish this proof.

One operator owns the lane for the complete deploy/alias/login/check interval.
A local exclusive lock prevents overlapping invocations from this checkout;
the runbook also excludes other operators/CI from alias changes during a run.
This is cooperative serialization, not a globally enforced Vercel lock. Capture
fresh control-plane alias-to-deployment metadata before credentials/session use
and after checks. Any mapping/source/project/target drift invalidates the run,
even if individual HTTP assertions passed. Pre/post snapshots cannot detect
arbitrary out-of-band move-and-restore; such concurrent writes are out of contract.

## Operator helper and evidence

Add a separate strict-TypeScript staging helper under `tests/deployment/`, kept
out of application imports and CLI uploads by existing `.vercelignore`. Preserve
`smoke.ts` Production modes and their expected noncanonical-candidate421 checks.
Use native Node APIs and the existing tsx runner, with no new dependency.

The staging helper runs validation only: no deployment, alias mutation, config
write, database provisioning, promotion or recovery action. Its explicit public
inputs bind approved team/project, source SHA, Preview deployment ID, stable
origin, run ID and fresh sanitized inspected deployment/alias metadata. The
runbook obtains metadata through authenticated read-only control-plane inspection,
with complete pagination and pinned CLI output verified during implementation.
Metadata files contain no tokens, env values, personal data or raw responses.
Require a fresh preflight (within five minutes); an expired or incomplete
snapshot is inconclusive. Final pass requires the operator's fresh post-check
mapping and unchanged Production-domain assertion for the same run. Without
that final evidence, HTTP success alone remains provisional/inconclusive.

Reject malformed origins, credentials/paths/query/fragment, non-HTTPS, a
Production origin/ID, wrong project/team/target, missing source attribution or
mapping mismatch before reading private session input or sending requests.
Send requests only to fixed allowlisted paths on the exact approved staging
origin, with a 10-second request deadline, 60-second run deadline, 1MiB HTML/
64KiB JSON response limits and no automatic redirects/retries.
Do not spoof Host or use generated candidate URLs for authenticated checks.
HTTP transport failures, platform denials/challenges or missing app evidence
are inconclusive, never a passing assertion or automatic redeploy trigger.

Use one private stdin JSON object (at most 24KiB) with optional `sessionCookie`
and `protectionBypass` string fields; reject unknown fields and control
characters in either value. Limit cookie to 16KiB and bypass value to 4KiB. Use it
for the staging app Cookie header and platform credential;
never argv, public metadata, environment dumps or saved browser-state files.
Do not accept or copy Production app cookies. Keep app session and platform
protection credentials distinct. Logs and reports contain only run/target IDs,
origin, SHA, mode, bounded status/timing, pass/fail/inconclusive and fixed reason
codes; no bodies, Locations with OAuth parameters, cookies, emails or family IDs.
Exit0 is pass, exit1 failed assertion/invalid input, exit2 inconclusive/incomplete.

## Checks and genuine authentication evidence

1. Anonymous: root redirects307 exactly to staging `/sign-in`; sign-in200;
   session GET401 and search POST401; existing no-store headers required.
2. Real Google round trip: owner uses a normal supported browser at the stable
   staging URL, signs in with an already eligible approved identity, observes
   onboarding/member behavior and cookies, then separately checks denial with an
   ineligible identity. No account credentials or OAuth URLs are recorded.
3. Authenticated reads: using that host's genuine current member session, home200,
   session200 with `{ authenticated: true }`, family GET200 with its expected
   existing shape. Validate bounded JSON in memory; discard all personal fields.
   Unprovisioned identities yield onboarding/family denial, not a member pass.
4. Missing provider configuration: an optional explicitly selected valid search
   request by a member must return current503 `SEARCH_UNAVAILABLE` with no key
   configured; this proves error handling only, not recipe/provider/photo success.
   Default staging validation performs no search. No paid searches are authorized.
5. Browser: verify staging at390px and1440px, keyboard use, no overflow, sign-out
   and fresh sign-in. Screenshots crop/redact identity/family data and omit
   credentials/auth URLs. Keep new evidence names separate from historical QA.

Sessions last one hour without refresh. Reused sessions automate app checks but
do not prove a new Google round trip on this deployment. Evidence has separate
`google-round-trip` (owner-attested for this run), `session-reuse`, local fixture
and provider-unverified categories. Missing live Google evidence leaves that
check inconclusive. No attempt to automate passwords, consent, MFA or challenges.

Keep Vercel protection enabled. Prefer owner Vercel authentication for browser
work; if separately authorized, automation bypass is a platform-only secret
with project-wide reach, not a Preview-scoped app identity. Inject it only on
exact staging-origin requests, including callback requests, and never via query
strings or global browser headers that could reach Google/photos/other hosts.
No WAF, bot or platform rate-limit enforcement claims from bypassed requests.
A challenge is inconclusive; do not weaken protection to make checks pass.

## Staging identities, data effects and recovery

Use owner-approved real identities already eligible under unchanged admission
rules. Existing callback may update a member's verified email. If Preview has no
member, stop member checks at onboarding until a separately authorized one-time
normal UI provisioning creates the owner's real staging household. No synthetic
users, seeded fake Google subjects, invitations, SQL writes or fixtures hosted.
A future operational authorization must name the identity privately, permitted
callback/provisioning effects, Preview target and retention. Retain only this
owner-controlled staging household until an explicit cleanup decision; automated
validation never deletes rows, resets databases or cleans other households.

On failure stop the run and record sanitized results. Do not pause the entire
shared project, resume Production, rollback Production or delete deployments.
Restore only the staging alias to a recorded safe Preview target if separately
authorized and its current mapping matches this run; otherwise leave it and
report. Do not reattach old credential-revoked deployments. Production domains,
configuration, database and current paused/running state remain unchanged.

## Acceptance and next-stage verification

Local implementation is limited to the operator helper/tests and a staging
runbook plus a small link from the existing deployment runbook. No app behavior
or schema/dependency change is needed. Meaningful TypeScript tests first cover
wrong-target rejection before private input/network, metadata freshness/mapping
attribution, drift, no credential forwarding or redirect following, bounded
responses, expected status/shape checks, session expiry outcomes, missing Google
attestation and failed/inconclusive exit semantics. Keep strict tests included.

After approved implementation, run frozen install, pnpm lint/typecheck/build,
`pnpm test`, deployment tests, auth and family regressions after build, Python
workflow tests and staged zero-secret scan. Verify relevant visible UI in real
mobile/desktop browsers; label isolated fixtures separately. Hosted evidence
requires separately authorized setup and Preview deployment after all local
checks/reviews, with actual hostname/client/protection/identity values resolved.
A green local build or fixture suite cannot substitute for that hosted gate.

## Primary references and unresolved operational prerequisites

Checked 2026-11-24: [Vercel environments](https://vercel.com/docs/deployments/environments),
[manual aliases and Production-domain warning](https://vercel.com/docs/cli/alias),
[CLI deploy](https://vercel.com/docs/cli/deploy),
[generated URLs](https://vercel.com/docs/deployments/generated-urls),
[platform bypass](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation),
[Google server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server).
These support the architecture, not a claim about current account settings or
pinned CLI output. Exact free alias availability/safe classification, project
state/protection, Preview effective values, staging OAuth client and approved
identity/provisioning remain setup preflights. If any cannot be satisfied within
this scope, stop and return to Design; do not silently substitute another option.
