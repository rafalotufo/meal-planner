# Wednesday scheduler — independent final security assessment

- Reviewer: security-researcher
- Date: 2026-11-26
- Fixed release source: `7fe1531d07f2fb6028c98e4f38b73d20f805e5fa`
- Runtime implementation: `6920b943e0ec9c952cf62c172dab036bd4c0aac9`
- Operator probe: `8cc2760`; included in the fixed source
- Verdict: **Approved for isolated staging validation and release preparation**
- Unresolved blocking security findings: **none**
- This is not owner staging acceptance, merge approval or Production authority.

## Resolved finding — request cancellation

**[P2] Bugs / Compliance — resolved before fixed-source approval.** The initial
implementation checked `Request.signal` but enabled Vercel cancellation only
for recipe search. Official [Functions API documentation](https://vercel.com/docs/functions/functions-api-reference#cancel-requests)
requires per-function opt-in and lifecycle retention for cleanup after client
cancellation. Without those settings, local injected-abort tests did not
establish the promised hosted stop-new-families behavior.

The correction in `vercel.json:11` enables cancellation for this exact scheduler
function while preserving search configuration. `app/api/plans/generate/route.ts:10`
creates the handler work once, registers **that same bounded promise** with the
existing `waitUntil`, and returns it. This retains the current transaction/pool
cleanup without duplicate generation or an unbounded detached task. The
configuration regression and promise-identity regression first failed, then
passed; the final deployment suite passed41/41 according to the committed
developer verification. I independently reran the lifecycle and built HTTP
regressions as part of the14-test focused run below.

Actual hosted disconnect delivery remains unobserved. Platform configuration,
local abort tests and lifecycle retention are distinct evidence; do not report
them as a hosted disconnect exercise.

## Boundary and persistence assessment

- `lib/plans/scheduler.ts:32`–47 fails closed on disabled/malformed configuration,
  enforces the fixed project/environment/browser/service-origin bindings, exact
  Host and constant-time fixed-length dedicated Bearer comparison before any
  database admission. Missing, wrong, malformed/coalesced credentials cannot
  authenticate. Cookies, forwarded Host, User-Agent and cron headers confer no
  authority. Google authentication and public auth-policy exceptions are unchanged.
- GET alone can act; all other explicit methods remain authenticated405 with
  `Allow: GET`. The exact handler rejects query/body declarations and has no
  family, identity or runtime date override. All handler outcomes receive
  private/no-store and restrictive security headers. Only the exact Proxy path
  is excluded; neighboring paths retain ordinary session enforcement.
- `lib/plans/scheduler.ts:52`–69 validates the allowlist before effects, skips
  offday/before09 without opening storage, uses an owned deadline database and
  waits for pool closure. Responses/events contain fixed fields and aggregate
  counts; no identities, recipe/query evidence, credentials or internal errors.
- `lib/plans/generate.ts` retains bounded keyset pages, the common advisory lock,
  current eligible Google membership, synthetic exclusion, curated snapshots,
  unique family/week creation and preservation of existing/final plans. Deadline
  reads/writes reuse connection-destruction facilities; abort never starts the
  next family after the current transaction settles. Partial committed families
  remain safely reconcilable. No migration, grant, provider call or ORM runtime
  change was introduced.
- The fixed Production **machine route only** accepts its reviewed automatic
  alias; ordinary browser/menu canonical Host remains `lotufo-meals.vercel.app`.
  This narrow service boundary is approved. Actual native cron target/Host must
  still be reinspected and observed under later activation authority; a mismatch
  is not permission to broaden the allowlist.

## Operator probe and staging configuration

The probe requires a distinct private environment URL, full verified TLS, the
exact recorded Preview hostname or its pooled variant, database `meal_planner`,
role `mp_runtime`, default5432 and no arguments. It refuses Production and
existing target weeks. One common-locked transaction rechecks the existing real
family's eligibility, inserts one transient menu snapshot, invokes the same
per-family core with an operator-only Wednesday clock, checks repeat draft/final
preservation, then throws an owned rollback sentinel before commit. Every path
rolls back; bounded before/after counts/hashes must match. No fake Google
identity, permanent fixture, schema/grant change or HTTP clock bypass is added.
I independently verified missing-target, Production-target and `--commit`
rejections:3/3 passed with only generic credential-free errors and no DB attempt.

The already authorized isolated Preview validation may use deployment-only
environment overrides, with secret and restricted Preview database URL loaded
from owner-only files into the CLI child environment and **names only** in argv.
Bind the existing project, exact source and Preview target; never print raw env
payloads, enable verbose tracing, copy Production credentials or mutate shared
Preview settings. Profile hashes cover nonsecret database identity only.
Platform access is separate: establish a scoped protection cookie privately,
then call the no-query service endpoint with its independent bearer. Revoke
temporary platform access and verify revocation after the bounded run.

These are approved procedures within the owner's staging scope. This reviewer
did not perform hosted mutations or certify their outcome. Today is Thursday;
deployed HTTP should skip before DB admission. The rollback-only Wednesday
storage exercise cannot substitute for hosted due-day HTTP/native delivery.

## Supply-chain and advisory assessment

The only added dependency is exact dev-only `@types/ws@8.18.1`. The installed
Vercel SDK public declaration barrel reexports optional `ws` declarations and
devpins this same type version. Registry metadata identifies DefinitelyTyped,
no install scripts and only `@types/node` as a dependency. The generated lock
resolves that dependency to the existing24.19.2 pin; no runtime WebSocket package,
feature, new Node type version, vendor patch or checking suppression was added.
The SDK's WebSocket runtime import remains lazy and unused by this route.

I reran full native `pnpm audit --json` after this change: **exit1, one existing
moderate esbuild finding, zero high/critical**. The audit is not clean. The known
[GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99)
concerns affected development-server cross-origin reads. Current app/operator
source introduces no esbuild serve invocation; Next webpack, native pg and the
public migration loader remain the execution paths. Retain the documented
tooling deferral and **2026-12-01** reassessment deadline from
`security-saved-recipe-menu-release-audit-001.md`, earlier on tooling/serving
changes. No forced upgrade or deadline extension is approved.

## Verification and practical limits

Independent final command:
`node --import tsx --test tests/plans/scheduler.test.ts tests/plans/scheduler-http.test.ts tests/plans/generate.test.ts`
completed **exit0,14/14**, covering hostile credentials/configuration, no-cookie
substitution, all methods, Host/target/body rejection, offday/DST, pool closure,
restricted concurrent/final preservation, deadline rollback, abort progression,
same-promise retention and real built HTTP/matcher behavior. Disposable databases
and servers were owned by the tests; local fixture access required sandbox
escalation. An earlier sandbox-only attempt failedEPERM, not an app assertion.

Read the committed `intent/weekly-plan-scheduler/verification.md`: developer
records frozen install, lint/typecheck/build, recipes112, plans32, family35,
menu69, auth16, deployment41, verification29, Python7 and real Chrome320/1440
passing. These broader runs and screenshots are developer evidence; I did not
rerun all of them. No source changed during this review. Diff check passed;
staged secret scan is recorded with this report's audit commit.

Final readiness still requires actual exact-source staging evidence, explicit
owner acceptance of its named gaps, the human merge gate and a fresh bounded
Production release/activation decision. Preview does not execute native cron;
real hosted due-day HTTP, disconnect delivery and first unattended Production
Wednesday remain unobserved here. No paid plan/provider use, Production write,
deployment/promotion, migration, grant or destructive recovery is authorized.
