---
feature: vercel-deployment
spec: ./spec.md
approval_level: elevated
---

# Meal Planner — Vercel deployment implementation plan

- Status: Draft — independent review passed; awaiting human plan approval
- Review: `org/reviews/plan-vercel-deployment-001.md`
- Author: senior-developer (Codex)
- Date: 2026-11-23
- Specification approval: `org/reviews/spec-vercel-deployment-approval-001.md`

## Approach and decisions

Implement the approved Node 24 / pnpm Next.js deployment with minimal app
configuration changes. Reuse authentication, provider and photo transport code.
Add strict TypeScript operator smoke checks and a concrete release runbook.
Use manual Vercel CLI deployment; no Git integration, new CI service, database,
runtime SDK, dependency upgrade or paid hosting feature.

Vercel CLI is an operator tool, pinned to **66.6.0** (npm registry metadata
checked 2026-11-23; Node >=20). Run via
`pnpm --config.ignore-scripts=true dlx vercel@66.6.0`; verify version before use.
Review tool dependencies/advisories before executing it; stop if it requires
unreviewed install scripts. Do not change app dependencies or lockfile for CLI.
Use the current checkout/branch. Work sequentially; independent reviewer reads
each completed artifact. Track implementation in `progress.md`, never by
editing an approved plan. Material departures require plan reapproval.

## Files that change

- package.json
- app/api/recipes/search/route.ts
- vercel.json
- .vercelignore
- .gitignore
- .env.example
- README.md
- AGENTS.md
- CLAUDE.md
- tests/deployment/smoke.ts
- tests/deployment/smoke.test.ts
- intent/vercel-deployment/deployment-runbook.md
- intent/vercel-deployment/progress.md
- org/reviews/vercel-deployment-build-verification.md
- org/reviews/vercel-deployment-release-verification.md
- org/reviews/code-vercel-deployment-001.md
- org/reviews/security-vercel-deployment-001.md
- org/reviews/vercel-deployment-390.png
- org/reviews/vercel-deployment-1440.png
- org/loop/config.yaml
- org/loop/state.yaml
- org/loop/history.jsonl
- org/status.yaml
- org/messages/
- org/memory/context.md
- org/memory/events.jsonl
- gates/ledger.jsonl
- workflow-graph.yaml

Create `tests/deployment/`; all other parent directories exist. New config,
helpers, runbook, progress and evidence files above are created; remaining
listed files are modified only as described. Review files/screenshots are
created only when the corresponding review/check actually occurs. No deletion.

## Work sequence

### 1. Establish baseline and gate evidence

After human plan approval, record it in the ledger and graph. Read current
intent/spec/plan, inspect Git status and preserve unrelated work. Create
`progress.md` with tasks/results and source revision. Run the full local suite
below; record baseline failures rather than rewriting existing tests.
Verify exact Node 24.x and pnpm 10.33.0; install frozen. Inspect native audit
findings for reachable high/critical issues and document mitigation/blockers.
No forced dependency fix is authorized.

### 2. Add deployment configuration

Set `package.json` engines.node to `24.x`; keep every dependency/packageManager
pin. Add `export const maxDuration = 90` beside the existing Node runtime
export in the search route. Create `vercel.json` with schema URL,
`framework: "nextjs"`, `installCommand: "pnpm install --frozen-lockfile"`,
`buildCommand: "pnpm run build"` and
`functions: { "app/api/recipes/search/route.ts": { "supportsCancellation": true } }`.
Do not set outputDirectory, rewrites, auth exceptions, wildcard origins or Edge.

Create `.vercelignore` excluding `.env`, `.env.*`, `.vercel`, `.git`,
`node_modules`, `.next`, `build`, `dist`, `out`, `org`, `intent`, `tests`,
`scripts`, `hooks` and `.worktreeinclude` from CLI upload. Vercel's application
build must still include app/lib/package/lock/compiler/config/public files.
Add `.vercel/` to `.gitignore`. Do not alter `.worktreeinclude` or local secrets.
Add placeholder recipe provider/model/key and Corepack settings to `.env.example`;
document which setting belongs in Vercel's build environment. No secret values.
Update Node/setup/deployment guidance in README, AGENTS and CLAUDE consistently.

Verify JSON parses, `git diff -- pnpm-lock.yaml` is empty and the full local suite
passes. Install/build in a temporary clean tracked-file export using the same
exclusions to catch missing source, with no secrets copied. This is a local
packaging check, not hosted platform evidence. Platform function-path mapping
and effective cancellation require inspection during the authorized deployment.

### 3. Add bounded operator checks, tests first

Create strict TS `tests/deployment/smoke.test.ts` using Node's runner and an
isolated local HTTP server. Test refusal of invalid/non-HTTPS targets, redirects,
unexpected status/cache behavior and bounded disconnect/burst behavior before
implementing the helper. Local tests use injected base URL/transport; CLI mode
allows HTTPS DNS hosts ending `.vercel.app` only, with no credentials, port,
path, query, fragment or IP literal in the configured origin.

`smoke.ts` exports `runSmoke({ origin, mode, fetchImpl, sessionCookie? })`;
mode is `candidate | anonymous | disconnect | waf`. Return only mode, status,
elapsedMs and pass/fail. Use redirect:manual only for the expected anonymous
root redirect assertion and redirect:error elsewhere, finite timeouts, no response-body
printing, no cookie/query/token logging and no Host/header spoofing. No fixture
route or production code import. CLI origin comes from `MEAL_PLANNER_ORIGIN`;
mode from its single positional argument. Module import must not run the CLI.
A required session cookie is read from stdin for disconnect, never argv, env,
committed files or output; acquire it from the operator's real authorized session.
It is used only against the exact validated origin and only for that process.
For candidate checks behind Vercel Authentication, accept an optional operator
protection cookie via the same private stdin path; never a production app
session. Without platform authorization return inconclusive, not application
success. Use redirect:manual for the anonymous root redirect assertion so its
307/Location can be inspected; all other checks reject redirects.

- candidate: GET `/`, `/sign-in`, `/api/session`; expect 421 and no-store for
  each after platform protection has been satisfied by the operator. Static
  asset candidate 421 is checked manually from an actual build asset path.
- anonymous: GET `/` without following redirects, expect 307 to the exact
  `/sign-in` origin; GET `/sign-in` expects 200; GET `/api/session` and POST
  `/api/recipes/search` expect 401, all with no-store. Set same-origin Origin
  and JSON content type on POST; never submit a live search in this mode.
- disconnect: one authenticated POST with fixed nonpersonal query `potato
  gnocchi`, abort after two seconds; no retries. A completed response before
  abort means inconclusive, not a pass. Record start/disconnect time, then
  correlate sanitized Vercel invocation timing with effective cancellation
  config. A client AbortError alone does not prove server/provider cancellation.
- waf: 21 sequential **anonymous** POSTs with empty JSON, no redirects or
  retries, ten-second overall bound. Early replies must be application 401;
  later replies must include WAF 429. Correlate firewall events so a process-local
  application limit cannot be mistaken for WAF. Run against a quiet IP/window;
  interference/inability to complete inside a window is inconclusive. No model
  call is authorized by this burst.

Verify `node --import tsx --test tests/deployment/smoke.test.ts` and full suite.
Keep helpers under existing strict tsconfig. Run them explicitly; do not change
`pnpm test`'s recipe glob or authentication fixture boundary.

### 4. Write runbook and complete local readiness

Create `deployment-runbook.md` with the account/project/origin/env matrix from
the spec, exact operator commands below and a release checklist. Record CLI
version and source revision, safe upload inventory, secret injection through
the Vercel dashboard (Production only; Secret type), and exact Google callback.
Never use env pull, token command arguments or raw config/log dumps in evidence.
Describe free Hobby quotas, the one POST/search WAF IP rule (20/60s, 429),
unchanged OpenAI limits, no shared global cap and no paid upgrades/add-ons.
Use a 15-minute first-live verification window; failed or incomplete mandatory
checks pause production. Do not repeatedly make paid searches to force timeout.

Run local Chrome QA using existing `tests/auth/browser.ts`; label its Google/
search fixtures and real image loads explicitly, and retain existing helper
screenshots under its existing filenames without adding them to this feature's
commit. Inspect real browser output at mobile/desktop; hosted checks later use
390/1440 widths. No UI changes are intended. Record command results in build
verification. Assign independent code and security reviewers, resolve findings
and obtain human merge approval. Local readiness does not equal deployment.

### 5. Configure account and project — separate authorization

Only after presenting the concrete settings/runbook, obtain owner authorization
for creating the free project and configuring Production env/Google callback/WAF.
Use `vercel whoami` and project inspection through the pinned CLI to verify
rafalotufos-projects and Hobby before mutations; redact identities in evidence.
Create/link the new project with the dashboard without a Git integration or
automatic deployment; prefer `meal-planner`, accept an available Vercel name
if unavailable. Record assigned name/project ID and stable production origin.
If setup cannot avoid an initial deployment, stop before creation and obtain
release authorization first. No silent auto-production bootstrap.

Configure Node 24.x, Fluid compute, Corepack=1 and spec's Production values;
ensure auto production assignment remains disabled. Verify exact Google callback
and server-only allowlist inclusion in built output without listing addresses.
Inspect/record existing OpenAI controls read-only or obtain owner verification;
do not change billing. Publish WAF rule only under configuration authorization.
Keep free Deployment Protection for candidate/operator checks where available;
do not add paid password protection. The stable app must remain reachable by
allowed Google users without requiring Vercel accounts; scope any necessary
Production protection change explicitly in configuration authorization.

### 6. Deploy and verify — human release gate

From a clean human-merged revision, get committed ledger authorization covering
production-target staging, later promotion, first-live 15-minute checks, WAF
burst, at most one cancellation probe plus one normal live search, and recovery.
Record project ID, source SHA and expiry in authorization. Verify ledger with
`--require-committed`. Commands below are templates executed only with actual
validated IDs/origins substituted; no command here is authorization.

Deploy `--prod --skip-domain`; inspect deployment readiness, effective Node24,
90s duration and cancellation. Record build/runtime versions using provider
metadata; if runtime patch version is unavailable, mark it unverified rather
than adding a production debug route. Candidate checks must observe application
421, not merely platform denial. After successful candidate checks, promote
that same production-target deployment without rebuilding. Record its ID.

At the stable origin run anonymous checks, real Google allowed/denied sign-in,
session/sign-out and same-origin recipe search, links/photos/fallback, CSP,
cookie flags, keyboard and no overflow at 390/1440 widths. Observe the loading
state and disabled submission during the single normal live search. Separately
disable browser networking before submitting a query, verify the visible error
and restored controls, then restore connectivity. This incurs no extra provider
call; label it browser-induced network-error evidence, not a live provider
failure or deadline test. Inspect loading/error layout at both widths using
that live loading observation and the browser-induced failure without extra
paid searches. The owner handles
Google credentials/consent; no production fixtures or auth bypass. Save sanitized
screenshots and summaries. Run the one disconnect probe and anonymous WAF burst.
Correlate invocation and firewall evidence. Existing tests prove local abort/
deadline propagation; per D3a a real hosted 60s deadline must also be observed
naturally. If it is not observed within authorized work, record unverified and
pause rather than expanding spend, forcing delays or claiming release success.
Never treat skipped hosted checks as passed.

Populate release verification with actual results and remaining blockers. On
first-release failure/incomplete verification pause only this project using the
interactive project pause command and verify traffic is closed. Owner types the
project confirmation if required. For later releases use known-good deployment
rollback only if its allowlist/secrets are still valid; otherwise rebuild safe
code with current config. Never revoke a shared OpenAI key without authorization.

## Validation and exact commands

Local baseline/after each implementation slice:

```bash
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
pnpm run test:auth
python3 -m unittest discover -s tests
pnpm audit
python3 scripts/scan_secrets.py --staged
git diff --check
```

Additional Build commands:

```bash
node --import tsx --test tests/deployment/smoke.test.ts
node --import tsx tests/auth/browser.ts
python3 scripts/check_plan_sync.py --hook --plan intent/vercel-deployment/plan.md
```

Operator commands (all use pinned tool prefix; no secrets as arguments):

```bash
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 --version
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 whoami
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 project inspect meal-planner --scope rafalotufos-projects
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 link --project meal-planner --scope rafalotufos-projects
python3 scripts/gate_ledger.py verify --record "$RELEASE_RECORD" --require-committed --require-gate release_authorization
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 deploy --prod --skip-domain --scope rafalotufos-projects
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 inspect "$DEPLOYMENT_URL" --scope rafalotufos-projects
node --import tsx tests/deployment/smoke.ts candidate
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 promote "$DEPLOYMENT_URL" --scope rafalotufos-projects
node --import tsx tests/deployment/smoke.ts anonymous
node --import tsx tests/deployment/smoke.ts disconnect
node --import tsx tests/deployment/smoke.ts waf
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 project pause meal-planner --scope rafalotufos-projects
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 rollback "$KNOWN_GOOD_DEPLOYMENT" --scope rafalotufos-projects
```

Set non-secret `MEAL_PLANNER_ORIGIN` to the candidate or stable origin before
the matching helper. For disconnect, supply session cookie via stdin privately.
Use the actual assigned project name in place of meal-planner if it differs.

| Spec criterion | Proof |
| --- | --- |
| D1 | Clean upload export build, frozen lock, provider build/config/runtime metadata, 90s/cancellation effective config |
| D2 | Env scope/key-only inventory, exact Google callback, real OAuth, no values in assets/evidence, staged secret scan |
| D3 | Full existing auth/recipe/photo regressions; real allowed/denied Google, stable-origin browser 390/1440, live source/image evidence |
| D3a | Local abort/deadline tests, TS disconnect helper plus hosted invocation evidence, natural hosted deadline sample or release remains unverified/paused |
| D4 | Hobby plan/quotas, unchanged OpenAI controls inventory, isolated anonymous WAF burst and firewall events |
| D5 | Committed authorization, source/deploy ID, no automatic promotion, candidate 421, stable-origin acceptance, documented pause/rollback rehearsal |
| D6 | Walk through each runbook failure case against sanitized status/log categories and recovery; no PII/query logging |

## Risks and approval level

Elevated: production secrets, OAuth, paid provider calls, SSRF-safe native
transport and live access. Human plan approval opens local implementation only;
human merge/configuration/release gates remain separate. Do not alter the
approved spec to relax an inconvenient hosted test during implementation.

| Risk | Mitigation / rollback |
| --- | --- |
| Vercel function mapping/cancellation differs | Inspect effective config; stop release, revise approved plan if required |
| Host/callback mismatch | Preserve exact origin checks; candidate 421 expected; pause on stable-origin failure |
| Hobby quotas or regional/process counters | Monitor free usage; accept downtime/no global guarantee; no paid upgrade |
| Secret upload / evidence leakage | Clean export + exclusions, Production Secret variables, scan and redact |
| First-live checks fail or no natural timeout occurs | Pause within 15-minute window, mark incomplete, request next bounded evidence action |
| Restoring old secret or membership | Never promote unsafe old build; rebuild safe code/current config |

Local rollback: revert this feature's config/helper changes through reviewed Git
changes; no data migration. Hosted rollback: scoped pause first release, safe
known-good rollback thereafter under explicit incident authority.

References: approved spec sources; [Vercel CLI package](https://www.npmjs.com/package/vercel),
[project commands](https://vercel.com/docs/cli/project),
[promotion](https://vercel.com/docs/cli/promote). Plan uses existing user choices;
no additional product or implementation architecture decision is open.
