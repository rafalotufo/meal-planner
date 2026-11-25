# Meal Planner — Vercel deployment runbook

Existing project: `meal-planner`, ID `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`,
team `team_2c0O29FMb91g7L6sUChc9v6J`, scope `rafalotufos-projects`, **Hobby only**.
Verify these recorded targets and the actual account state before release effects.
CLI: exact `66.6.0`, run with install scripts disabled:
`pnpm --config.ignore-scripts=true dlx vercel@66.6.0 <command>`.
This tool is separate from the application lockfile. Never enable paid features,
start a Pro trial or change OpenAI billing controls as part of this deployment.

Future releases follow the approved
[staging-first amendment](../staging-first-release/spec.md): validate the exact
release revision on isolated staging, obtain owner acceptance of its scope/gaps,
then create and promote a separate Production build. Use the
[staging runbook](../vercel-candidate-validation/staging-runbook.md) for functional
validation. Production checks below cover configuration, packaging, anonymous
canonical health and recovery. Earlier specs/releases and their recorded checks
remain historical; their first-live OAuth/search/cancellation/WAF certification
requirements do not govern future releases under this amendment.

## Synthetic staging evidence is a separate proof class

The approved [Google-free verification design](../agent-deployment-verification/spec.md)
adds operator-issued synthetic staging sessions, described in the staging runbook's
[synthetic lane](../vercel-candidate-validation/staging-runbook.md#google-free-synthetic-verification-lane).
Its local implementation approval is not hosted migration/grant/issuance/data,
configuration, paid-provider or deployment authority. The verification schema and
runtime catalog must be reviewed together before any separately authorized cutover;
older artifacts are not assumed compatible rollback targets. Preserve all data.

A `synthetic-app` artifact binds its verification run/member IDs to the exact source,
Preview deployment, configuration profile and actual browser/version/width results.
The staging helper's `synthetic` validator reports only that app proof class and
always returns `releaseAccepted: false`. Exit0 means the declared synthetic-app
matrix passed; it proves neither real Google allowed/denied callbacks, live provider
success, platform protection nor Production behavior. Missing browsers, keyless
provider behavior, excluded invitations/URL curation and platform-bypassed traffic
remain named gaps. The existing real-Google finalizer cannot accept this artifact
and its Google assertions must never be populated from synthetic login results.

Owner release-source acceptance must explicitly distinguish these proof classes
and accept any required OAuth/provider/browser gaps, separately for that exact
source/profile. Scoped shareable-link/canonical-origin access, deployment pinning,
private credential transfer and trace handling must be proved under separately
approved hosted scope before declaring the lane ready. No project-wide bypass
secret is provided to browser agents and no public-protection-removal fallback is
implied. Production retains the same separate build/manual promotion and minimal
canonical anonymous health/recovery process below; no authenticated Production
verification route is introduced.

## Login and gates

1. Run the pinned CLI `login`; the owner approves its Vercel device flow.
   No credentials or token belong in chat, command arguments or Git.
2. Check `whoami`, then `teams ls` and `project ls --scope rafalotufos-projects`.
   Confirm Hobby and the correct scope. Do not rely on the CLI's default team.
3. Local plan approval permits implementation. Human merge approval, project/
   Production configuration authorization and release authorization are separate.
   Authentication does not grant production release approval.
4. Record each authorized decision using `scripts/gate_ledger.py`; commit it.
   Before production-target staging or promotion verify the release record:

   ```bash
   python3 scripts/gate_ledger.py verify --record "$RELEASE_RECORD" --require-committed --require-gate release_authorization
   ```

The committed, unexpired release record must name the fixed `releaseSourceSha`,
actual project ID, accepted staging artifact/configuration profile and validation
scope/gaps, Production candidate creation/promotion, a bounded 15-minute anonymous
health/recovery window (or stricter scope) and authorized safe rollback/pause.
Routine Production login, paid search, disconnect search and WAF bursts are not
part of future release certification. Functional checks belong on staging under
their own concrete authority. The owner may explicitly accept staging and
approve that concrete Production scope in one decision; record the appropriate
separate gate decisions without requesting the same permission again. This
process amendment and old approvals are not a current release authorization.

## Exact-source staging acceptance before Production

Select a reviewed clean `releaseSourceSha`, complete applicable local checks and
independent reviews, then deploy/validate that exact source on the isolated
Preview lane. Owner acceptance must bind its Preview deployment ID, stable
origin, actual project/team/target, validation interval, inspected alias/source
attribution and a sanitized configuration profile/version. Record actual checks,
proof classes, evidence references and explicitly accepted missing coverage.
See the staging runbook's acceptance example. Operator reports and generic hooks
do not automatically enforce this source/profile relationship; verify it before
release effects.

Proposed Production source must equal the accepted source **by exact SHA**.
“Main contains that commit,” similar application files, or a moving branch is
insufficient. A different release SHA requires staging deployment/validation/
acceptance of that SHA. In particular, owner acceptance of Preview
`dpl_ALHqB6jCB6emyBNHTTbBzmfsV5Hi`/source
`9fc13ff27a636483fdf3503d5c8bf9f149550e45` does not certify current main or
another revision; it did not establish an unspecified paid-provider pass.

Later acceptance/gate audit commits may reference the fixed release source.
Verify the committed gate in the audit checkout, but upload only a clean
checkout/export of that pinned source, not the later audit HEAD. Record source
SHA separately from audit commit IDs. An alias move, staging redeployment,
relevant schema/environment/runtime change or validation-scope change invalidates
readiness: refresh attributed staging validation and owner acceptance. Do not
silently move a missing staging check to Production.

The last recorded staging setup is keyless; inspect the actual release profile
before proceeding. Its optional missing-provider503 check is
error-path evidence, not recipe/photo/provider success. Required provider,
cancellation or WAF evidence needs separately scoped staging credentials,
request/cost bounds, origin/IP/window and real evidence. No Production-key copying,
paid call, bypass or retry loop is authorized here. Otherwise explicitly record
provider success unverified and obtain owner acceptance of that named gap.
An inconclusive/protected helper result stays inconclusive even when the owner
accepts its declared coverage limits; never forge a helper pass or attestations.

## Project and exact settings

Inspect the existing project/team, deployment history, domain assignments,
paused state, protection and effective configuration. Stop on target drift or
unknown state. This runbook uses the recorded project ID explicitly; no new
project or default relinking is part of release. A different project requires
separate future design/configuration authority. Confirm the intended canonical
lotufo-meals routing and auth prerequisites below before any Production build.

Use Next.js preset, root directory `.`, Node **24.x**, Fluid compute, default
framework output and the committed `vercel.json` commands. Verify automatic
Production domain assignment remains disabled; change it only with configuration
authority. Keep Preview protection where free/available;
the owner must authorize any Production protection setting change needed to
let allowed Google users access the app without Vercel accounts. No paid
password protection, Marketplace integrations or analytics add-ons.

Use explicit `--project prj_ntxXnJAVA977jHjLNDR7xJuwSx4V` and recorded scope
for deployments rather than relying on a default project. Any existing local
link must match this target; `.vercel/` stays ignored. Read-only inspection does
not authorize a configuration change, project resume or deployment.

## Production environment and Google

Set values privately through the Vercel dashboard; never use `env pull` or copy
local `.env.local` into the upload. Production values must not target Preview
or Development. Use Secret/sensitive type for the auth secret, Google secret
and OpenAI key; no NEXT_PUBLIC variables. Avoid screenshots showing values.

| Key | Value / required verification |
| --- | --- |
| `BETTER_AUTH_URL` | Exact stable production HTTPS origin, no path/query/credentials |
| `BETTER_AUTH_SECRET` | Preserve the existing independent Production secret, at least32 bytes; creation/rotation needs separate authority |
| `GOOGLE_CLIENT_ID` | Google Web application client ID |
| `GOOGLE_CLIENT_SECRET` | That client's secret |
| `OPENAI_API_KEY` | Existing authorized project key, same existing limits |
| `RECIPE_SEARCH_PROVIDER` | `openai` |
| `OPENAI_RECIPE_MODEL` | `gpt-6.2-sol`, verify existing project access |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1`, build setting honoring pnpm 10.33.0 |

Before any Production candidate, verify the intended canonical origin
`https://lotufo-meals.vercel.app` serves the app directly. Its last recorded routing
redirects to the old hostname; that is not canonical readiness.
Separately authorized configuration must set Production `BETTER_AUTH_URL` to this
exact origin and register
`https://lotufo-meals.vercel.app/api/auth/callback/google` on the actual Production
Google Web client. Verify consent/eligibility, the recorded restricted verified-TLS
Production DB target and effective configuration privately. This document does
not authorize changing domains, Google settings or credentials. Preserve the
staging branch-qualified domain and unrelated Production mappings; name any
approved routing changes precisely. Unknown/incorrect routing, auth, callback
or database configuration blocks Production. Do not weaken Host rejection.

Production intentionally differs from staging in origin, Google credentials,
auth secret, database URL and any separately authorized provider key. Record
only a sanitized parity/profile inventory of those reviewed differences. Other
release-relevant model/build/runtime/duration/cancellation settings must match
accepted staging or be explicitly reconciled; unexpected/unknown differences
invalidate readiness and require revalidation/acceptance of the revised profile.
Staging never receives Production secrets/data. Staging success cannot prove
actual Production OAuth/provider/authenticated database behavior; these residual
limits must remain explicit in acceptance and release evidence.

Register exactly `<BETTER_AUTH_URL>/api/auth/callback/google` with the Google
Web application client. Confirm consent-screen/test-user settings permit the
intended allowed users. Do not change the checked-in allowlist or expose it.
Do not add wildcard callbacks/trusted origins. Missing configuration must
continue to fail closed. Host-only cookies do not transfer between origins.

Inspect existing OpenAI model/rate/spend controls read-only, or have the owner
verify them; record key names and effective limits, never credential values.
Preserve billing settings. Existing project limits may permit delayed spend
overshoot; alerts do not themselves stop requests. No new exact global cap is
promised. Do not revoke a shared key without explicit incident authority.

## Usage controls

Privately verify the existing reviewed WAF configuration. Any new publication
requires separate configuration authority. The reviewed rule is:
request method POST AND path equals `/api/recipes/search`, Fixed Window,
20 requests / 60 seconds, key IP, action Too Many Requests **429**. Counts
include anonymous/failed requests and can affect users sharing an IP. Confirm
the rule was published, not left in Log mode. WAF counts are regional; app
limits (two active / twenty accepted per minute) remain per process.

Confirm Hobby and included quotas in the account. Hobby has no Spend Management;
do not configure Pro budget controls or upgrades. Monitor usage manually and
accept potential service interruption when free quotas are exhausted.

## Local and upload verification

Run frozen install, lint, strict typecheck, recipe tests, build, auth regression,
Python workflow tests, deployment helper tests, native audit, secret scan and
plan-sync check as listed in the approved plan. Record any audit findings with
reachability/deferral; never force upgrades or weaken checks.

Upload only the reviewed clean revision. `.vercelignore` excludes local env,
Git/operator state, dependencies/build outputs and audit/test/script folders.
Check the resulting source inventory includes app/lib/package manifest, lock,
pnpm build-script policy, tsconfig, Next/PostCSS config and CSS. Perform a clean
install/build of an export with those same exclusions; that verifies packaging,
not Vercel function behavior. Secret scan must report zero findings.

Local browser QA: `node --import tsx tests/auth/browser.ts`. It runs isolated
Chrome with test-process Google/search fixtures and a real publisher image.
Do not describe its fixtures as live OAuth/provider grounding. Required hosted
functional/OAuth/browser/provider validation and any authorized cancellation/WAF
exercise occur on staging, recorded distinctly from local fixtures. Keep existing
screenshot names intact.

## Authorized stage and promote

After exact-source staging acceptance, reviewed parity, human merge and fresh
committed release authority, verify the real gate in the audit checkout:

```bash
RELEASE_SOURCE_SHA="<accepted full source SHA>"
RELEASE_SOURCE_DIR="<clean checkout/export of that exact source>"
RELEASE_RECORD="<actual committed release_authorization record ID>"
python3 scripts/gate_ledger.py verify --record "$RELEASE_RECORD" --require-committed --require-gate release_authorization
```

The generic verifier checks ledger/gate/expiry, not the staging SHA/profile
contract. The operator must compare the acceptance and release record to
`RELEASE_SOURCE_SHA` and verify the clean source checkout/export provenance.
Later audit HEAD is not the upload source. Invoke the pinned CLI with that
explicit source directory and the existing verified project ID:

```bash
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 deploy "$RELEASE_SOURCE_DIR" --prod --skip-domain --project prj_ntxXnJAVA977jHjLNDR7xJuwSx4V --scope rafalotufos-projects
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 inspect "$DEPLOYMENT_URL" --scope rafalotufos-projects
```

Verify the resulting Production deployment's exact source/project/target and
export/checkout attribution before promotion. A user-provided metadata string
alone is not proof of source bytes; unknown/mismatched provenance blocks release.

Inspect build readiness/logs without dumping secrets. Verify effective Node24,
pnpm 10.33.0, search Node runtime, 90-second maximum and supportsCancellation.
Do not claim exact hosted patch versions unless provider metadata shows them.
The app deadline remains 60 seconds; photo/network policies remain unchanged.

Set non-secret `MEAL_PLANNER_ORIGIN` to the candidate origin, then:

```bash
node --import tsx tests/deployment/smoke.ts candidate
```

Expected app responses are 421/no-store for `/`, `/sign-in`, `/api/session`
and an actual built static path (check the latter manually). Proxy rejects
noncanonical Host before public routes. If Vercel Authentication intercepts,
the operator may privately supply its protection cookie on stdin. Never use a
production app cookie for candidate checks. Platform denial, refused login
redirect or missing candidate response is inconclusive (exit 2);
never spoof Host or loosen auth to make the candidate appear healthy.

Candidate421 checks prove the noncanonical-origin boundary, not OAuth or
functional readiness. Preserve an inconclusive platform-protected result; it
cannot silently satisfy a required packaging check. Resolve required evidence
within the release's scope rather than bypassing authentication.

After required packaging/readiness/config checks, promote that same Production
artifact (never the Preview deployment):

```bash
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 promote "$DEPLOYMENT_URL" --scope rafalotufos-projects
```

Ordinary Preview promotion may rebuild with Production env; do not substitute
that workflow. Record source SHA, deployment ID and promotion time in release
evidence. Set `MEAL_PLANNER_ORIGIN` to the stable production origin for all
remaining checks.

## Minimal Production health — bounded 15-minute window

- Inspect the actual Production alias/deployment ID and configured canonical
  routing after promotion. Preserve the staging domain and unrelated mappings.
- Set non-secret `MEAL_PLANNER_ORIGIN` to `https://lotufo-meals.vercel.app` and run
  `node --import tsx tests/deployment/smoke.ts anonymous`. Require root307
  exactly to same-origin `/sign-in`, sign-in200, protected session/search401,
  and no-store headers. Its anonymous empty search POST has no provider effect.
- Inspect runtime/configuration errors privately and monitor within the release's
  bounded observation window. Required failed or incomplete canonical/health
  evidence triggers only the scoped authorized recovery below.

Do not require real Production OAuth login, a paid normal/disconnect search, a
WAF burst or full browser regression as routine release certification. Functional
checks occur on staging. Minimal anonymous/configuration health does not prove
real Production OAuth, provider availability or authenticated DB behavior; record
those residual limits. Existing helper modes remain unchanged, but their dormant
paid/burst modes are not authorized by this process. No automatic fallback to
Production is allowed for missing staging coverage.

Helper stdout contains only mode/status/elapsedMs/pass: exit0 assertions passed,
exit1 failed, exit2 inconclusive. Platform denial is not application success.
Record sanitized deployment/status/timing evidence; never log emails, cookies,
OAuth query strings, prompts or response bodies. Earlier release budgets and
observed results, including the original D3a deadline amendment, remain historical
without being reused as current per-check proof or authority.

## Recovery and incident diagnosis

For required canonical/configuration/anonymous health failure or incomplete
evidence, stop and use only the recovery explicitly covered by the release
record. Prefer a safe known-good Production rollback when one exists. If none is
safe, a scoped project pause must be authorized; it can also affect Preview.
Record why and verify the resulting traffic state. Never assume an old first-
release recovery authorization applies to a future release. Scoped pause command:

```bash
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 project pause meal-planner --scope rafalotufos-projects
```

This is interactive; the owner types the actual project name if required. Do
not bypass the confirmation. Resume only after a reviewed correction and
renewed release authority. Do not pause all team projects or revoke shared keys.
When a known-good artifact is safe and rollback is explicitly authorized:

```bash
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 rollback "$KNOWN_GOOD_DEPLOYMENT" --scope rafalotufos-projects
```

Old deployments retain old env/allowlist. Never roll back to revoked secrets or
removed membership; rebuild safe code with current config instead. This ordinary
artifact procedure does not roll back database schema. Strict-catalog changes
such as saved-menu0001 make initial-only artifacts incompatible: follow the
[target-specific cutover/recovery plan](../saved-recipe-menu/hosted-cutover-plan.md),
preserve new data, and never infer DROP/history rewrite/backup-restore authority.
Repeat minimal canonical anonymous/configuration
health after recovery. Functional remediation and any further paid/provider
validation belong on staging under separate scope; no Production retry storm.

| Symptom | Inspect without sensitive data | Action |
| --- | --- | --- |
| Build fails | Build exit/config/dependency version | Fix reviewed source/config; keep live revision |
| 421 at canonical URL / observed OAuth incident | Stable Host, auth origin, exact Google URI | Scoped safe rollback/pause; correct configuration only with authority |
| 503 auth unavailable | Presence/scope of required keys, policy validity | Correct config privately; redeploy with authority |
| Observed provider 429 / search 502 | Status/timing and existing project limits | Follow scoped incident recovery; staging diagnosis, no billing change/retry storm |
| Search 504 | App 60s deadline vs platform 90s, provider timing | Preserve cancellation; capture bounded evidence |
| Missing photos | Source availability and function transport compatibility | Retain fallback; unsafe transport workaround forbidden |
| Abnormal usage | WAF events, Hobby quotas, existing OpenAI usage | Use scoped authorized recovery; preserve shared keys/settings |

The owner monitors minimal post-promotion health and ongoing usage. Sanitized deployment
status, timing/error counts and WAF/provider dashboards are sufficient; do not
introduce query logs, new analytics or persisted personal data.

## PostgreSQL proxy packaging guard (2026-11-23)

After every production build, run `node --import tsx --test tests/deployment/*.test.ts`.
The compiled-artifact regression must exercise real Google-fixture onboarding,
provisioning and protected home/session through the proxy in an isolated compiled
package with no source or migration directory. Runtime uses bundled reviewed
metadata; mandatory prebuild verification rejects SQL/journal/manifest drift.
A green route-only bundle check is insufficient. Preserve strict checking and fail-closed
storage; never modify vendor code or bypass family authorization to pass a live check.
The first PostgreSQL attempt is recorded in org/reviews/postgresql-production-live-001.md.
