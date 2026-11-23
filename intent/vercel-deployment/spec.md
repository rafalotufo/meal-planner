# Meal Planner — Vercel deployment specification

- Derived from: `intent/vercel-deployment/intent.md`
- Author: architect (Codex)
- Status: Approved by Rafael — implementation planning authorized
- Approval: `org/reviews/spec-vercel-deployment-approval-001.md`
- Date: 2026-11-23
- Intent acceptance: `org/reviews/intent-vercel-deployment-001.md`

## Outcome and current system

Deploy a new `meal-planner` project in `rafalotufos-projects` on the Hobby plan
to one stable Vercel-provided production HTTPS origin. Check name availability
before creation; if unavailable, use Vercel's available assigned project name
and record it without changing the requested account or plan.
Keep Google sign-in, server-side allowlist checks, recipe search, photos
and fallbacks. Introduce no database, new product UI or alternative auth path.

Today Next.js App Router runs with `pnpm run build` and `pnpm run start`.
`lib/auth.ts` requires one exact configured origin and verifies Google identity;
sessions are encrypted cookies, expire after one hour and need no database.
`app/api/recipes/search/route.ts` authenticates before calling the provider.
`lib/recipes/search.ts` owns a 60-second search deadline, two concurrent searches
and twenty accepted searches/minute **per process**. `lib/recipes/photos.ts`
and `photo-transport.ts` implement optional, bounded publisher HTML enrichment
with DNS validation and pinned native HTTPS. No Vercel project is configured
in this checkout. None has been provisioned or inspected during Design.

## Deployment architecture and requirements

### D1 — Reproducible Node deployment

Use Vercel's Next.js framework preset, repository root, managed Node.js **24.x**
and Fluid compute. Set `package.json` engines to `24.x` during Build so the
current broad `>=22.0.0` cannot select a newer major on Vercel. Document that
Vercel controls patch versions; record actual build/runtime versions in evidence.
Do not claim an exact hosted Node patch pin. Preserve all dependency versions.

Install with `pnpm install --frozen-lockfile`; retain exact `pnpm@10.33.0`, the
lockfile and reviewed install-script policy. Enable Vercel Corepack support
(`ENABLE_EXPERIMENTAL_COREPACK=1`) and verify the effective manager version in
the build log. Build with `pnpm run build`, retaining webpack. Use the framework's
output defaults; no static export, custom output directory or custom server.
Version non-secret install/build settings in root `vercel.json` during Build.

Retain the search route's `runtime = "nodejs"`; add `maxDuration = 90` there.
The platform limit must exceed the existing 60-second application deadline to
allow authentication, cleanup and response delivery. The application deadline
and photo bounds do not increase. Reject a hosting configuration unable to
honor this setting; do not reduce safety or silently shorten search behavior.
Use Node for auth/session handling as today. Do not substitute the Edge runtime.
Enable `supportsCancellation: true` only for
`functions["app/api/recipes/search/route.ts"]` in `vercel.json`. Verify Vercel's
generated function configuration honors that exact path. Reuse the existing
`request.signal` propagation; no detached background provider work. Vercel may
reclaim the function after disconnect, so no recovery procedure can depend on
cleanup completing after termination.

### D2 — Origin, secrets and environment isolation

Choose the project's stable production `https://<assigned-name>.vercel.app`
origin after account/project selection. The placeholder is not a reserved URL.
Use that exact origin as `BETTER_AUTH_URL` and register exactly
`<origin>/api/auth/callback/google` in the Google Web application client.
Keep Google consent/test-user configuration compatible with intended users.
Do not derive trusted origins from request headers, wildcards, VERCEL_URL or
per-deployment aliases. Verify the ingress Host/origin behavior against existing
auth and search checks; a mismatch blocks release rather than loosening checks.

| Variable | Production value/policy |
| --- | --- |
| `BETTER_AUTH_URL` | Stable HTTPS production origin; server configuration |
| `BETTER_AUTH_SECRET` | Independently generated secret, at least 32 bytes |
| `GOOGLE_CLIENT_ID` | Google Web client identifier for the configured callback |
| `GOOGLE_CLIENT_SECRET` | Google Web client secret |
| `OPENAI_API_KEY` | Existing approved project key; preserve existing project limits |
| `RECIPE_SEARCH_PROVIDER` | Explicit `openai` |
| `OPENAI_RECIPE_MODEL` | Explicit `gpt-6.2-sol`, matching current README; verify project access during Build |

Store secret values as Vercel Secret/sensitive environment variables. Scope
production secrets only to Production; never use NEXT_PUBLIC prefixes. Google
client ID is not a credential but remains server configuration. Do not print
environment values, pull production env files into the repository, or put
credentials/tokens in command arguments or audit evidence. Upload from a clean
committed checkout excluding local `.env*`, `.vercel`, `.git` and build outputs;
prepare ignore rules during Build. Local worktree env copying grants no upload
permission. Builds need no credentials to succeed, though Vercel may make
production variables available during a production-target build.

Ordinary Preview deployments receive no production credentials. They may show
the existing unavailable state and are not OAuth acceptance evidence. A future
authenticated staging environment needs its own stable origin, isolated secrets
and Google callback; that work is deferred. Per-deployment URLs are not supported
login entry points and must not become wildcard trusted origins.

### D3 — Authentication and network protections

Reuse `lib/session.ts`, `lib/auth-policy.ts` and the server-only allowlist as-is.
No membership change, fake-user verifier, test fixture route or auth exception.
Preserve no-store responses and encrypted HttpOnly/Secure/SameSite=Lax cookies.
No database/session migration. Logout still cannot revoke a copied unexpired
cookie; changing hosts requires fresh sign-in.

Validate the actual deployed Node transport with a live recipe search and
source-bound photo evidence. Preserve all-address DNS checks, pinned lookup,
TLS identity verification, dedicated no-proxy agent, no redirects/credential
forwarding, byte/encoding/time limits and process-wide two-job photo bound.
Blocked publisher access may retain existing photos/fallback; blanket runtime
incompatibility must not be reported as successful enrichment. Parent abort
must still stop search. Do not add a debug endpoint to expose transport details.

### D4 — Usage and spending controls

Keep existing process-local guards; they provide no project-wide concurrency,
rate or spend guarantee on Vercel. No new shared-store service in this scope.
Propose one WAF rule matching POST `/api/recipes/search`, fixed window
20 requests per 60 seconds per IP, return 429 for excess. This is additional admission
control, counts unsuccessful attempts and may affect users sharing an IP.
Vercel WAF counting is regional, so this is **not** a global twenty/minute limit.
Verify rule availability and enforcement on the chosen account before release.
Do not assume project region makes firewall counters global.

Rafael selected existing OpenAI project limits with **no billing changes**.
Reuse that project/key; read and record effective model/rate/spend controls
without changing them or creating a new billable project. Alerts alone do not
stop requests; where hard-limit enforcement is already enabled it acts on
tracked spend and may overshoot. If existing controls cannot be inspected,
ask the owner to verify them before release; never invent a numeric cap. Vercel
Hobby is the owner's zero-hosting-charge choice: use included resources, no
Pro trial, paid upgrade, Marketplace service or paid add-on. Hobby has no Spend
Management budget/pause feature; rely on its documented included quotas and
usage restrictions, inspect usage and accept potential downtime when exhausted.
Provider alerts/enforcement may have reporting delay and are not an exact
maximum liability. Set no invented monetary amount.
Spec approval accepts the documented existing limits and residual exposure
(C2 below). If a strict
global request/concurrency or monetary cap is required, return to Design for a
shared admission/budget mechanism; do not release under this limited design.

### D5 — Manual release, verification and rollback

Use an operator-driven deployment from the reviewed, human-merged revision.
Do not enable Git-triggered production deployment or automatic domain assignment.
Build with Vercel's production target and `--skip-domain`; later promotion
assigns the stable production domain. An ordinary preview promotion can rebuild
with production variables, so preview evidence does not certify that artifact.
Pin and document the Vercel CLI version in the Build plan after official
version verification; do not add a runtime Vercel SDK.

**Both** production-target staging (it contains real secrets and has a reachable
deployment URL) and promotion require an explicit human release authorization
record in the committed gate ledger. Intent/spec approval is insufficient.
Obtain authority for account/project and production environment configuration
before making those changes. Record project identity, source SHA, effective
runtime/config, deployment ID and candidate URL without secret values.

Before promotion, run the full local suite and candidate hosted smoke checks.
`proxy.ts` rejects an incorrect Host before public-path handling: requests to
the candidate URL with production auth configuration must return 421/no-store
for `/`, `/sign-in`, `/api/session` and matched static asset paths. If Vercel
Deployment Protection intercepts first, authenticate as operator to observe
the application response; a platform access-denial alone proves no app check.
Do not spoof the production Host to bypass this isolation. Check platform build
and function readiness separately. Successful public page/static responses,
anonymous redirect/401 and signed-in browser behavior are all tested at the
stable production origin in the authorized first-live window. Do not claim
full browser sign-in works on a candidate URL
whose configured callback points to the stable origin. The release approval
must expressly cover the first-live verification window: promote, immediately
verify real OAuth and same-origin search on the stable production URL, then
keep serving only if acceptance passes. This resolves the initial-origin
bootstrap without changing auth or routing callbacks between environments.

Subsequent releases keep the last known-good production deployment ID. Roll
back with Vercel Instant Rollback, under incident authority covered by the
release approval, then repeat auth/search smoke checks. Existing deployments
retain their old environment and allowlist; never roll back to revoked secrets
or disallowed membership. Rebuild a safe revision with current configuration
instead. On the first release, with no known-good version, pause this project's
deployment. If the existing OpenAI key is shared with another application,
do not revoke it without explicit owner incident authorization; pausing this
project is the default containment. Local development
is not a hosted rollback target. No database rollback is needed.

### D6 — Operations and evidence

Use Vercel deployment/runtime status and request timing/error counts, WAF events
and OpenAI usage dashboard; no new analytics, persisted queries or PII logging.
Do not log cookies, tokens, prompts, responses or allowed email addresses.
Record sanitized test summaries and screenshots with identifying details omitted.
Operator runbook must cover failed build, OAuth origin mismatch, configuration
503, provider 429/502/504, missing photos, abnormal spend, pause and recovery.
Owner monitors the first-live verification window and alerts thereafter.

## Acceptance and verification mapping

Each row is a requirement-level acceptance case; Build plan assigns exact tests
and sanitized evidence files. New automated helpers/tests use strict TypeScript
with the existing tsx/Node runner, preserving Python workflow regressions.

| ID | Given / When / Then | Evidence |
| --- | --- | --- |
| D1 | Given a clean revision, when installed/built on Vercel, then Node 24.x, pnpm 10.33.0, frozen lock and 90s route setting are effective without dependency drift. | Build log, function configuration, unchanged lockfile; local full suite |
| D2 | Given the assigned stable origin and Production secrets, when Google starts/callback completes, then redirects use the exact registered URI and no credential appears in assets/evidence; previews have no production secrets. | Redacted env scope inventory, real OAuth round trip, browser assets inspection, secret scan |
| D3 | Given anonymous, denied and allowed Google identities, when accessing the app/API or signing out, then access follows current policy; an allowed search loads usable cards and optional source photos/fallback with unchanged transport guards. | Auth regression; real Google allowed/denied tests without email disclosure; hosted desktop/mobile browser and live-source evidence |
| D3a | Given an allowed live search at the stable origin, when its client disconnects, then Vercel cancellation terminates the invocation and prevents continued application work; when a search reaches its existing deadline, then it aborts with the existing 504 contract before the 90s platform limit. | Effective supportsCancellation configuration, strict TS hosted disconnect helper and sanitized invocation timing/status evidence; local provider/photo abort and fake-clock deadline tests prove propagation; if a live deadline is not observed naturally, mark hosted deadline unverified and block release rather than add fixture endpoints or force paid repeated searches |
| D4 | Given Hobby quotas, approved provider limits and matching traffic, when the WAF threshold is exceeded, then excess traffic receives 429; Hobby stays free with no paid features, and provider spend/alert controls are documented without deliberate spend. | WAF test on an isolated bounded request burst; redacted plan/provider settings; owner residual-risk decision; never burn budget to trigger a limit |
| D5 | Given an approved revision and release authorization, when deploying, then no automatic promotion occurs and the authorized stable-origin smoke checks pass; on failure the approved rollback/pause path restores a closed or known-good state. | Gate verification, deploy/promotion IDs, first-live checks, rollback rehearsal or first-release pause procedure |
| D6 | Given a failed hosted request, when the operator follows the runbook, then they can identify the failure category and recovery action without viewing user queries or credentials. | Runbook walkthrough and sanitized runtime/status evidence |

Required local commands: `pnpm install --frozen-lockfile`, `pnpm run lint`,
`pnpm run typecheck`, `pnpm test`, `pnpm run build`, `pnpm run test:auth`,
`python3 -m unittest discover -s tests`, `pnpm audit`, and
`python3 scripts/scan_secrets.py --staged`. Triage reachable high/critical audit
findings before release without forced upgrades or suppressed checks. Browser
checks use 390px and 1440px widths: sign-in/out, search, loading/error states,
card links/photos/fallback, keyboard use and horizontal overflow. Label local
fixtures separately from real hosted Google/provider/source observations.

## Alternatives considered

- Static export or Edge functions: rejected because server sessions, provider
  credentials and native DNS/HTTPS metadata transport require the Node service.
- Floating Node/pnpm defaults: rejected for reproducibility and runtime drift.
- Git auto-production deployment: deferred to keep human release gates enforceable.
- Wildcard callback/trusted origins: rejected; one stable production origin
  preserves current origin checks with no new auth mechanism.
- Shared Redis/database limiter now: deferred to avoid a new service without an
  owner requirement; strict global caps require a revised design, not WAF claims.
- Broad team spend pause: rejected because it could affect unrelated projects.
- Custom domain, authenticated preview environment and new CI platform: deferred;
  the approved outcome needs one stable Vercel production URL and existing checks.

## Concerns and decision owners

| ID | Concern / required decision | Owner / gate |
| --- | --- | --- |
| C1 | Resolved: Rafael selected rafalotufos-projects, Hobby and a new project. Propose meal-planner; verify account access, name and free-tier capabilities before provisioning. No paid upgrade. | Operator |
| C2 | Resolved: free Hobby only; existing OpenAI project limits with no billing changes, as requested by Rafael. Intended traffic is the existing restricted allowed-user group, with no new capacity promise. Spec approval accepts proposed WAF policy and regional/process limits plus delayed provider controls; strict new caps require redesign. Inspect and record existing controls before release. | Rafael at spec approval; operator before release |
| C3 | Exact assigned origin and OAuth callback follow project selection; verify availability and configuration before release. | Operator with Rafael's configuration authorization |
| C4 | Live Node transport, Host preservation, Google consent and provider access have not been tested on Vercel. All block release until evidence passes. | Developer and independent reviewer |
| C5 | Manual promotion is the proposed release policy; spec approval accepts it. A first-live OAuth test necessarily follows promotion; authorize its bounded window and rollback/pause explicitly. | Rafael at spec and release gates |

No implementation, production configuration or release occurs in Design.
Plan work follows spec acceptance; runtime changes follow plan acceptance.

## Sources and applied guidance

Official documentation checked 2026-11-23; recheck account-specific capabilities
during Build. Documentation supports platform behavior, not a verified deployment.

- [Node versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
  and [function duration](https://vercel.com/docs/functions/configuring-functions/duration).
- [Request cancellation](https://vercel.com/docs/functions/functions-api-reference#cancel-requests).
- [Package managers](https://vercel.com/docs/package-managers) and
  [Corepack build setup](https://vercel.com/docs/builds/configure-a-build#corepack).
- [Production staging](https://vercel.com/docs/cli/deploy#skip-domain),
  [promotion](https://vercel.com/docs/deployments/promoting-a-deployment) and
  [Instant Rollback](https://vercel.com/docs/instant-rollback).
- [Secret environment variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables).
- [WAF limits](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)
  and [Hobby plan quotas](https://vercel.com/docs/plans/hobby).
- [OpenAI project budgets and rate limits](https://help.openai.com/en/articles/9186755-managing-projects-in-the-api-platform).
- Applied SDLC Design, security-and-hardening, ci-cd-and-automation and
  shipping-and-launch guidance: explicit boundaries, frozen installs, secret
  separation, independent review, verifiable release gates and recovery.
