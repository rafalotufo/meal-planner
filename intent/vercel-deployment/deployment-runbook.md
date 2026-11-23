# Meal Planner — Vercel deployment runbook

Account scope: `rafalotufos-projects`, **Hobby only**. New project preference:
`meal-planner`; record actual assigned name/ID and origin before configuration.
CLI: exact `66.6.0`, run with install scripts disabled:
`pnpm --config.ignore-scripts=true dlx vercel@66.6.0 <command>`.
This tool is separate from the application lockfile. Never enable paid features,
start a Pro trial or change OpenAI billing controls as part of this deployment.

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

The release record must name the reviewed source SHA, actual project ID,
deployment scope, expiry and authorized recovery. It must cover production-
target staging, promotion, a 15-minute first-live check window, one normal
provider search, at most one disconnect search and one anonymous WAF burst.
No action below overrides those gates. Do not retry paid searches to obtain
missing evidence or deploy from a dirty/unmerged checkout.

## Project and exact settings

After explicit configuration authority, create an empty project in the Vercel
dashboard without a Git integration or initial automatic deployment. If the
dashboard requires an initial deployment, stop and obtain release authority
first. Select an available name if meal-planner is unavailable; record it and
its stable assigned `https://<name>.vercel.app` production origin. Never assume
the name is available or use an unverified origin as an OAuth callback.

Use Next.js preset, root directory `.`, Node **24.x**, Fluid compute, default
framework output and the committed `vercel.json` commands. Disable automatic
production domain assignment. Keep Preview protection where free/available;
the owner must authorize any Production protection setting change needed to
let allowed Google users access the app without Vercel accounts. No paid
password protection, Marketplace integrations or analytics add-ons.

Link this checkout only to that project:

```bash
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 link --project meal-planner --scope rafalotufos-projects
```

Replace meal-planner with the recorded actual name when necessary. `.vercel/`
stays ignored. Linking/inspecting is not a production deployment.

## Production environment and Google

Set values privately through the Vercel dashboard; never use `env pull` or copy
local `.env.local` into the upload. Production values must not target Preview
or Development. Use Secret/sensitive type for the auth secret, Google secret
and OpenAI key; no NEXT_PUBLIC variables. Avoid screenshots showing values.

| Key | Value / required verification |
| --- | --- |
| `BETTER_AUTH_URL` | Exact stable production HTTPS origin, no path/query/credentials |
| `BETTER_AUTH_SECRET` | New random secret, at least 32 bytes; preserve securely for recovery |
| `GOOGLE_CLIENT_ID` | Google Web application client ID |
| `GOOGLE_CLIENT_SECRET` | That client's secret |
| `OPENAI_API_KEY` | Existing authorized project key, same existing limits |
| `RECIPE_SEARCH_PROVIDER` | `openai` |
| `OPENAI_RECIPE_MODEL` | `gpt-6.2-sol`, verify existing project access |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1`, build setting honoring pnpm 10.33.0 |

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

Publish one free-tier-eligible Vercel WAF rule under configuration authority:
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
Do not describe its fixtures as live OAuth/provider grounding. Hosted checks
below are separate. Keep its existing screenshot names out of this change.

## Authorized stage and promote

After human merge and committed release authority:

```bash
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 deploy --prod --skip-domain --scope rafalotufos-projects
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 inspect "$DEPLOYMENT_URL" --scope rafalotufos-projects
```

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

After passing candidate/config checks, promote that same Production artifact:

```bash
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 promote "$DEPLOYMENT_URL" --scope rafalotufos-projects
```

Ordinary Preview promotion may rebuild with Production env; do not substitute
that workflow. Record source SHA, deployment ID and promotion time in release
evidence. Set `MEAL_PLANNER_ORIGIN` to the stable production origin for all
remaining checks.

## First-live verification — 15 minutes

- Run `node --import tsx tests/deployment/smoke.ts anonymous`. Expect exact
  root 307 redirect, sign-in 200, protected session/search 401, all no-store.
- Owner signs in with a real allowed Google account and separately checks denial
  with a nonallowed identity. Observe secure HttpOnly/SameSite=Lax host-only
  cookies without recording their values; verify sign-out and fresh sign-in.
- Make one normal nonpersonal search. Check same-origin POST, loading/disabled
  controls, valid links/method/time, loaded source-bound photos or intentional
  fallback; distinguish source access denial from blanket transport failure.
- Verify layout, keyboard and no overflow at 390px/1440px. Disable browser
  networking before another submit to verify error/restored controls without a
  provider call; restore networking. Label that induced error separately.
- Run `node --import tsx tests/deployment/smoke.ts disconnect` with the operator's
  current app Cookie header supplied **privately on stdin**, not in chat, argv,
  env or a saved file. It makes one search and disconnects after two seconds.
  The helper returns inconclusive: correlate invocation timing and cancellation
  metadata to establish server cancellation. Do not infer provider cancellation
  from a client AbortError. No retries.
- Run `node --import tsx tests/deployment/smoke.ts waf` from a quiet IP/window;
  maximum 21 anonymous empty-JSON POSTs / ten seconds, no provider calls. Match
  observed 429 to WAF events. A helper pass is provisional until correlation;
  early throttling is inconclusive. Wait for a fresh window before separately
  authorized retest; do not loop automatically.
- D3a deadline-evidence amendment (Rafael, ceo-0009): use deterministic local
  deadline/abort regressions and hosted90s configuration as application/config
  evidence. Neither proves a real hosted60s/504; label that unverified if absent.
  Its absence alone is explicitly accepted and does not require pause. Keep
  the live success/cancellation checks, two-search budget and all other mandatory
  checks/pause rules. Never force delays, add fixtures or spend repeatedly.

Helper stdout contains only mode/status/elapsedMs/pass. Exit 0 means its local
assertions passed, 1 failed, 2 inconclusive. Hosted cancellation and WAF require
the external evidence above even with successful client observations.
Store sanitized screenshots/results under the approved feature evidence paths.
Never record emails, tokens, prompts or response bodies in runtime/audit logs.

## Recovery and incident diagnosis

Failed/incomplete mandatory checks within the first-live window: pause this
project, record why and verify traffic is closed. No previous good deployment
exists for the first release:

```bash
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 project pause meal-planner --scope rafalotufos-projects
```

This is interactive; the owner types the actual project name if required. Do
not bypass the confirmation. Resume only after a reviewed correction and
renewed release authority. Do not pause all team projects or revoke shared keys.
On subsequent releases, under approved incident authority:

```bash
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 rollback "$KNOWN_GOOD_DEPLOYMENT" --scope rafalotufos-projects
```

Old deployments retain old env/allowlist. Never roll back to revoked secrets or
removed membership; rebuild safe code with current config instead. No database
migration/rollback is involved. Repeat anonymous/auth/search smoke checks.

| Symptom | Inspect without sensitive data | Action |
| --- | --- | --- |
| Build fails | Build exit/config/dependency version | Fix reviewed source/config; keep live revision |
| 421 at stable URL / OAuth callback mismatch | Stable Host, auth origin, exact Google URI | Pause, correct authorized config; no wildcard trust |
| 503 auth unavailable | Presence/scope of required keys, policy validity | Correct config privately; redeploy with authority |
| Provider 429 / search 502 | Status/timing and existing project limits | Pause or wait; no billing adjustment or retry storm |
| Search 504 | App 60s deadline vs platform 90s, provider timing | Preserve cancellation; capture bounded evidence |
| Missing photos | Source availability and function transport compatibility | Retain fallback; unsafe transport workaround forbidden |
| Abnormal usage | WAF events, Hobby quotas, existing OpenAI usage | Pause this project; preserve shared keys/settings |

The owner monitors first-live checks and ongoing usage. Sanitized deployment
status, timing/error counts and WAF/provider dashboards are sufficient; do not
introduce query logs, new analytics or persisted personal data.
