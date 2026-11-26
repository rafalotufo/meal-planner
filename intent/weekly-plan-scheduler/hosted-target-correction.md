# Corrective design — bind the machine route to its own deployment

- Author: architect
- Date: 2026-11-26
- Status: Proposed; independent design/security approval required before code
- Governs: corrective implementation only, after the first Production attempt
- Inputs: accepted scheduler intent, Wednesday/Hobby owner amendment, sibling
  specification/plan, actual registered cron target observed during the release

## Intent and observed failure

The owner-approved first release attempt promoted Production candidate Ed9c at
approximately17:36UTC. Anonymous health initially passed. Subsequent read-only
inspection found both registered cron definitions targeted the generated host
`meal-planner-8judu2h75-rafalotufos-projects.vercel.app`. The released source's
service guard accepted only the stable automatic alias
`meal-planner-rafalotufos-projects.vercel.app`, so genuine native invocations
would be rejected421 before authentication/generation.

This is a concrete integration defect. The first staging evidence proved only
the stable Preview hostname; it did not exercise the generated deployment Host
used by native cron. A correct anonymous browser smoke could not discover the
service-only mismatch. Preserve the failed attempt, original exact-source
acceptance and approvals as historical evidence. The orchestrator records the
actual authorized rollback, final traffic state and preservation separately;
this document does not assert a rollback outcome that has not been observed.

The existing request to fix the scheduler, validate staging and prepare approval
continues to authorize local correction and the existing isolated Preview
validation. The consumed one-attempt Production authorization grants no new
configuration, build, promotion or activation. Obtain fresh approval for a new
fixed source/profile after independent reviews and staging results.

## Corrected service Host contract

Retain the exact configured stable machine origin checks already implemented:
Preview `https://meal-planner-staging-rafalotufos.vercel.app`, Production
`https://meal-planner-rafalotufos-projects.vercel.app`. Keep the corresponding
browser origins unchanged: Preview above and Production
`https://lotufo-meals.vercel.app`. Fixed project
`prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, exact Preview/Production environment,
`MEAL_PLAN_SCHEDULER_ENABLED=true`, explicit Wednesday, independent64hex
`CRON_SECRET` and all other guard requirements remain mandatory.

Add a second service Host derived only from this deployment's trusted
server-side `VERCEL_URL`. Official Vercel documentation describes that system
variable as the generated deployment hostname, available at build and runtime,
without an HTTPS scheme. It separately identifies `VERCEL_PROJECT_ID` as the
project identity and `VERCEL_ENV` as the deployment environment.
[System environment variables](https://vercel.com/docs/environment-variables/system-environment-variables#vercel_url).

Before accepting either service Host, validate `VERCEL_URL` as a nonempty,
lowercase ASCII plain DNS hostname with total length at most253, labels1–63,
alphanumeric label ends and internal hyphens only, ending in `.vercel.app`
with a nonempty deployment label before that suffix. Reject schemes, ports,
paths, credentials, queries, fragments, whitespace, uppercase, wildcard, empty
labels, a leading/trailing dot and noncanonical URL normalization. Do not
reconstruct a hostname from project name, branch name, an alias list or client
headers. Missing/malformed system metadata fails503 before DB admission even
when the incoming request uses the stable machine Host. Deployment configuration
inspection must establish that the actual runtime receives its own generated
hostname; do not create a project environment override or fill a guessed value.

The accepted incoming Host set is exactly the stable service origin's hostname
and the validated `VERCEL_URL` string. Compare request Host by exact equality
against those two strings. The `.vercel.app` syntax restriction validates the
trusted environment value only; it is never a wildcard/suffix match applied to
incoming requests. A different generated deployment hostname, sibling project's
hostname, arbitrary alias, Production browser canonical Host or client-supplied
`x-forwarded-host` cannot add an accepted Host, even with a valid service token.
A hostile forwarding header does not override a valid direct Host either.

Apply this rule exclusively inside the exact `/api/plans/generate` service
handler. Ordinary browser pages, Proxy, menu handlers, Better Auth and session
admission retain their existing canonical Host rules and must continue to
return421 on generated-host requests. No user cookie, verification capability,
User-Agent, cron schedule header or Origin can substitute for service Bearer
authentication. Every method still receives the same private/security headers;
wrong credentials401, unsupported authenticated methods405 and invalid target
400 never reach the DB. A generated Host passing the Host guard grants no
operation until the independent64hex secret passes its constant-time check.

Vercel documents an interaction between `VERCEL_URL` and Standard Deployment
Protection. Inspect the actual Preview/Production configuration and system
variable availability. Missing metadata/platform interception is a stated
blocking or inconclusive result, not authority to weaken Host checks, alter
protection, trust forwarded metadata or guess a fallback hostname.

## Preserved runtime and data contract

Keep dual Wednesday13/14UTC expressions, America/Toronto due checks and accepted
Hobby09:00–09:59 delivery unchanged. Keep the later summer recovery opportunity
and no off-day backfill. No runtime clock/family override, schema/grant change,
new identity, paid provider call or provider/dependency change is introduced.
Preserve60second request-owned deadline/pool, common locked per-family writes,
partial-progress reconciliation, abort scheduling checks, started-work
settlement, same bounded waitUntil promise and close-before-response behavior.
Existing/final plans and synthetic-family exclusion remain intact.

## Regression evidence before staging

Add failing tests before changing the guard. Cover both Preview and Production
with a fixed trusted own generated hostname in test configuration:

- Stable service Host still works under valid configuration and Bearer.
- Own generated Host reaches authentication: no/wrong token401, valid token
  follows due/off-day behavior, all methods preserve the expected guard/header
  outcomes, and no anonymous rejection opens the DB.
- A different plausible generated Host returns421 even with the valid token;
  malformed or missing trusted `VERCEL_URL` returns503 for either allowed Host.
- Hostile forwarded metadata cannot admit another Host. No client field can
  change project/environment or choose a deployment hostname.
- Real built HTTP tests and compiled packaging tests exercise the own generated
  service Host, while ordinary page/menu/auth requests on that Host still421.
- Due clock, eligibility, idempotency, failure redaction, pool settlement and
  cancellation regressions remain green. No test bypass weakens production.

Run focused scheduler/compiled packaging tests and all mandatory repository
checks appropriate to the final change: lint, typecheck, build, recipe, plans,
family/menu/auth/deployment, Python workflow, real Chrome mobile/desktop plan
verification, plan-sync/diff and zero-secret checks. Reuse passing evidence only
where no changed input invalidates it and state that provenance explicitly.
Independent security and final code review cover the corrected source before
selecting the clean staging release SHA.

## Exact-source Preview validation

Deploy the corrected reviewed clean source into the existing isolated Preview
lane with its own secret, restricted DB and keyless profile. Inspect actual
source/project/environment/deployment ID, generated URL, stable staging alias,
runtime contract and configuration attribution. `VERCEL_URL` must equal that
inspected generated hostname. No Production credential/configuration/alias
change is part of these checks.

Test the exact service route through BOTH the stable staging origin and this
Preview deployment's exact generated HTTPS origin. Use separately scoped
private platform access where required; preserve unrelated protection settings.
Verify no/wrong Bearer401, authenticated unsupported method405, invalid target
400 and valid Bearer off-day200 on both actual origins, with security headers.
The current validation day is Thursday, so successful service calls should
skip before DB access. Do not claim a due HTTP write or automatic Preview cron
run. Test a different generated hostname in local/built HTTP fixtures rather
than contacting somebody else's deployment or spoofing their identity.

Through the same exact generated Preview origin, ordinary browser page/menu
requests must still421. Platform interception must be reported as such; it
cannot be counted as application421/401. Keep the existing rollback-only
Preview probe's deterministic Wednesday core proof distinct from deployed HTTP
and from local disposable DB evidence. Preserve bounded existing row counts/
hashes and verify rollback. No persistent fake data or new Google identity.
Revoke this validation run's platform links and remove temporary credentials.

## Fresh Production approval and first-run proof

Prepare a new release package naming the corrected fixed source, Preview ID,
profile, both-origin results, reviews and actual gaps. Old source7fe approval
and original staging acceptance do not approve the correction. Owner acceptance
of the new source/profile and fresh one-attempt Production authority must precede
ANY new Production environment/configuration change, candidate build or
promotion. Separate the fixed source from later audit commits.

If a later fresh approval authorizes a candidate build, inspect its own
generated hostname and runtime system-variable attribution before promotion.
A no-credential GET to the generated candidate's service path must reach the
application guard and return401 with private/security headers, without DB or
provider effects. This is a narrowly scoped service Host/authentication boundary
check. Ordinary candidate browser routes must still421. Neither check certifies
authenticated generation or native dispatch. Platform-blocked observations are
inconclusive and must not be rewritten as a pass.

After a separately authorized promotion, inspect BOTH installed cron definitions:
exact `/api/plans/generate`, unchanged schedules, owning deployment ID and host
equal to the inspected current deployment's own generated hostname/system
`VERCEL_URL`. Compare with actual canonical Production routing too; equal aliases
alone are insufficient. A host/deployment mismatch fails the release check and
uses only that approval's recovery authority; do not widen acceptance in place
or automatically start another attempt. Keep no-provider anonymous health and
bounded observation/recovery from the existing runbook.

Actual unattended delivery remains unobserved until the next Wednesday. Record
that future limitation plainly; no manual Preview result, candidate401, installed
cron definition or rollback-only DB probe fabricates a native scheduled run.
