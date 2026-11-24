# Isolated Preview staging — operator runbook

Status: local tooling verified; a separate owner-authorized Preview setup is
recorded in `hosted-setup.md` and its actual execution in `hosted-results.md`.
The setup instructions below remain approval-scoped for future changes.
Use with sibling approved `spec.md` and `plan.md`. Staging is a separate Preview
build with separate credentials/database; it does not certify the Production
artifact. Future releases follow the
[staging-first amendment](../staging-first-release/spec.md) and the
[Production runbook](../vercel-deployment/deployment-runbook.md): exact-source
staging validation and owner scope/gap acceptance precede a separate Production
build, manual promotion and minimal anonymous health/recovery.

## Keyless staging profile and one-time setup authority

The following is the existing keyless helper profile. New setup/configuration,
identity/data effects and any paid exercise still need concrete scoped authority.
Do not infer fresh permission from this runbook or an old setup approval.
For routine releases, reuse the recorded stable origin
`https://meal-planner-staging-rafalotufos.vercel.app` and existing isolated
configuration after fresh inspection. The numbered steps below are one-time
setup/change guidance, not instructions to create aliases or rotate credentials
every release. Verify actual branch classification and deployment-ref matching;
no domain/key change is authorized here.

1. Confirm the existing Hobby project `meal-planner`, scope
   `rafalotufos-projects`, team `team_2c0O29FMb91g7L6sUChc9v6J`, project
   `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, with no Git integration. Inspect current
   project/Production deployment/domain assignments and paused state. Do not
   resume a paused shared project to enable Preview without owner authorization.
2. Select one available account-controlled single-label `*.vercel.app` alias,
   distinct from all Production and generated deployment hostnames. No name in
   this document is reserved. Verify complete alias/domain inventories and that
   this alias is outside the Production/default domain set. Ordinary project
   domains without Preview branch assignment can become Production domains;
   manual assignment is not proof of safe classification. If the account cannot
   establish this within existing Hobby resources, stop and return to Design.
   Do not buy a domain, upgrade, create another project or add Git integration.
3. Privately configure only Preview: exact alias `BETTER_AUTH_URL`, independent
   random `BETTER_AUTH_SECRET` (at least32bytes), dedicated staging Google Web
   OAuth client/secret, `RECIPE_SEARCH_PROVIDER=openai`, and the existing build
   configuration. Leave `OPENAI_API_KEY` empty/absent. Verify effective values,
   including branch/build overrides, are Preview-only and distinct from
   Production. Preserve Development/Production variables and existing protection.
4. Keep the already configured restricted pooled Preview `DATABASE_URL` with
   verified TLS, recorded in `intent/postgresql-persistence/hosted-resources.json`:
   Neon project `withered-night-50194672`, branch `br-dark-term-bbqhnxi5`,
   database `meal_planner`. Never use Production `plain-pond-82425009`, import
   its data, migrate/reset either database, or upload bootstrap credentials.
5. Register exactly `https://<actual-staging-alias>/api/auth/callback/google` on
   the dedicated Google client. Privately verify consent/test-user eligibility.
   Keep the server-only allowlist unchanged. Select an already eligible real
   staging identity privately, with explicit authority for callback verified-email
   writes and, if needed, one normal UI household provisioning on Preview.
   Retain that owner-controlled staging household; validation never deletes or
   resets data, creates invitations or hosts fake identities/transport fixtures.

Approval of local tooling is not approval of those settings or a deployment.
After authorization, record actual alias/client/configuration verification and
permitted identity/data effects privately/sanitized as appropriate before any
hosted validation. No provider search, paid feature or Production action is
part of this proposal.

## Inspection sources and trusted evidence

Use exact pinned scripts-disabled CLI66.6.0 with explicit scope:

```text
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 inspect <deployment-url> --scope rafalotufos-projects --json
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 alias ls --scope rafalotufos-projects --json --limit 100
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 alias ls --scope rafalotufos-projects --json --limit 100 --next <cursor>
pnpm --config.ignore-scripts=true dlx vercel@66.6.0 domains inspect <hostname> --scope rafalotufos-projects --json
```

The cached pinned CLI help verified these flags without account effects. Their
output is not the helper's schema. Inspect privately and use an allowlisted
projection/private dashboard review; never print secret values or save/copy raw
inspection JSON, environment files, OAuth URLs or personal metadata into audit
records. Do not assume undocumented JSON field names or use `env pull`.
Every continuation page must be inspected. Also inspect the complete project
domain list and domain classifications in the dashboard: a paginated alias list
alone does not prove Production exclusion or name availability. Unknown target,
source, domain classification, effective config or project state means stop.

The helper consumes deliberately normalized **operator-attested** public JSON.
It validates target/type/time consistency; it cannot authenticate fabricated
metadata, detect an out-of-band move-and-restore, or prove source bytes from an
arbitrary user-supplied Vercel meta tag. Bind the inspected deployment to the
reviewed clean uploaded revision and record its SHA/ID under the same run.

## Serialize one complete validation run

Use one operator and agree that other operators/CI will not change the alias.
Create a private exclusive local lane lock **before** deploy/alias/login work:

```sh
umask 077
mkdir -p .data
mkdir .data/staging-validation-lane.lock
printf '%s\n' 'staging-20261124-001' > .data/staging-validation-lane.lock/run-id
```

The run ID above is illustrative; choose a new safe identifier. If the lane lock
exists, stop and contact its owner. Never auto-break a stale lock. Retain it
through inspection, browser login, HTTP checks and finalization/abort. Remove
only this run's `run-id` file and lane directory after checking ownership and
the current recorded run ID. A killed process may leave a lock requiring manual
reconciliation. This is cooperative local serialization, not a Vercel global lock.
The helper independently takes `.data/staging-validation-process.lock` for each
invocation; it releases only the process lock it acquired, including normal error
paths, and never removes the lane lock or any unrelated file.

After separate authorization, manually deploy a reviewed clean revision to
Preview (no `--prod`, custom target or prebuilt Production output), inspect its
actual Preview target/readiness/team/project/source, then assign only the safe
staging alias to its exact deployment ID. Capture Production assignments before
and after alias assignment and compare them. Do not infer target from URL shape.
Never promote Preview, change Production domains, pause/resume the shared project
or recover by deleting deployments. An alias restore needs separate authority,
a recorded safe Preview target and a matching expected current alias mapping.

## Public input files

Keep public evidence under a private per-run `.data/` directory, with no secrets.
Each file must be valid JSON at most64KiB, exact keys and proper types. Unknown
keys fail. Origin strings must be canonical HTTPS single-label `*.vercel.app`
origins without slash/path/port/query/fragment/credentials. Arrays are unique and
bounded to100 origins. SHA is40 lowercase hex; IDs are bounded safe identifiers.
Use actual account-inspected values, not the illustrative aliases below.

`expected.json`:

```json
{
  "version": 1,
  "runId": "staging-20261124-001",
  "origin": "https://meal-planner-staging-example.vercel.app",
  "sourceSha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "deploymentId": "dpl_preview_example",
  "teamId": "team_2c0O29FMb91g7L6sUChc9v6J",
  "projectId": "prj_ntxXnJAVA977jHjLNDR7xJuwSx4V",
  "productionDeploymentId": "dpl_production_example",
  "productionOrigins": ["https://meal-planner-production-example.vercel.app"]
}
```

`pre.json` repeats all expected keys, plus:

```json
{
  "capturedAt": "2026-11-24T15:00:00.000Z",
  "environment": "preview",
  "ready": true,
  "generatedOrigins": ["https://meal-planner-generated-example.vercel.app"],
  "aliasesComplete": true,
  "domainsComplete": true,
  "aliasIsProduction": false,
  "previewConfigurationVerified": true,
  "providerKeyAbsent": true
}
```

The two objects above describe one merged pre-inspection object, not separate
documents to concatenate. Use the actual ISO UTC capture time. Before reading
private stdin or making HTTP requests, the helper verifies the exact approved
team/project, distinct Preview/Production IDs and origins, manual alias versus
generated URLs, complete/safe inspected state and a pre snapshot no older than
five minutes with no future timestamp. False/unknown safety assertions are
inconclusive and cause no HTTP/private-input effects. Never set them true merely
to get through validation. `providerKeyAbsent` is required even when no search
is selected; this helper's keyless profile never carries a provider key. A
separately authorized keyed staging exercise must use its own bounded operator
evidence and reviewed configuration profile, not false key-absence metadata or
an altered helper. Never copy a Production key into Preview.

## Genuine browser checks and private session handling

With a supported normal browser and Vercel protection still enabled, use the
stable staging URL and approved real identity. Complete Google round trip and
observe allowed onboarding/member behavior; separately check denial with an
ineligible identity. If Preview lacks the approved household, stop member tests
at onboarding until normal UI provisioning is separately authorized. Never
forge a user/session, copy a Production app cookie or use a local fixture against
the hosted application. Google consent/MFA/security challenges may need the owner.

Verify390px/1440px layouts, keyboard use, no overflow, sign-out and fresh sign-in.
Capture only sanitized/cropped screenshots with new feature evidence names;
omit identity/family data, account credentials, cookies and OAuth URLs. Reusing a
current staging session automates application checks but does not prove a new
Google round trip on this deployment. Sessions expire after one hour without
refresh; expiry/unprovisioned membership is inconclusive for member validation.

Start with anonymous checks (exit2 is expected for a provisional report):

```sh
node --import tsx tests/deployment/staging.ts check .data/staging-run/expected.json .data/staging-run/pre.json anonymous < /dev/null > .data/staging-run/check.json
```

For member checks, pass a staging Cookie header privately through stdin. A local
interactive Python prompt can write directly to the pipe, without a secret in
argv, exported environment or a saved file:

```sh
python3 -c 'import getpass,json,subprocess,sys; values={"sessionCookie":getpass.getpass("Staging Cookie header: "),"protectionBypass":getpass.getpass("Authorized platform bypass (leave empty otherwise): ")}; sys.exit(subprocess.run(["node","--import","tsx","tests/deployment/staging.ts","check",".data/staging-run/expected.json",".data/staging-run/pre.json","member"],input=json.dumps({k:v for k,v in values.items() if v}),text=True).returncode)' > .data/staging-run/check.json
```

This collects both prompts before starting the helper, so human input time does
not consume its10s stdin deadline. The subprocess receives secrets only through
private stdin and propagates the helper exit code. Never add `tee`, echo secrets
or paste them into chat. Stdin accepts only
one JSON object, at most24KiB within10s, with optional `sessionCookie` (16KiB)
and `protectionBypass` (4KiB); control characters and unknown fields fail.
Anonymous requests never carry the app cookie. No cookie parser can prove a
raw header's issuing host: the operator must establish its staging provenance.

If separately authorized, the platform bypass is a project-wide Vercel access
credential, not an app login or Preview-scoped token. The helper sends its header
only to the exact staging origin, never follows redirects and never sends it
to Google/photos/other hosts. Browser access should use owner Vercel login;
never inject a global browser header. Bypassed traffic does not prove WAF, bot
or platform rate-limit enforcement. A challenge remains inconclusive.

`missing-provider` mode explicitly adds one valid member search expecting503
`error.code: SEARCH_UNAVAILABLE` with the key absent. It tests error handling,
not recipes, photos or provider availability. Default/member modes do no
authenticated search. No paid model request is authorized by this runbook.

## Fresh post-check evidence and finalization

`check` performs at most four anonymous requests, three additional member reads
and, only in `missing-provider` mode, one missing-key search. It sends only known
paths, with10s request/60s run limits and1MiB HTML/64KiB JSON response bounds.
Redirects are inspected, never followed. Its report contains fixed check names,
status/timing/result codes and target attribution; no raw bodies/headers/PII.
Successful HTTP observations yield `POSTCHECK_REQUIRED`, exit2, not a final pass.
Concrete app assertion/input failures use exit1; transport/platform/expired
session or missing evidence is inconclusive, exit2. Do not retry automatically.

After HTTP checks finish, freshly inspect the alias/deployment/source and complete
Production-domain/deployment set. Write `post.json` with the same inspection
schema and an actual `capturedAt` at/after `check.json`'s `endedAt`. Its target
and Production assignments must still match. A pre-created post snapshot fails;
the post snapshot must be no older than five minutes when finalized. Changed
mapping/source/Production assignments invalidate the run, even if HTTP passed.

Write same-run owner evidence in `attestations.json`, with actual capture time:

```json
{
  "version": 1,
  "runId": "staging-20261124-001",
  "capturedAt": "2026-11-24T15:03:00.000Z",
  "googleAllowed": true,
  "googleDenied": true,
  "browser390": true,
  "browser1440": true,
  "keyboard": true,
  "signOutAndFreshSignIn": true,
  "stagingSessionProvenance": true
}
```

Use false for any check not completed; never fabricate a pass. The file has no
identity or cookie value. Then finalize without private input or network:

```sh
node --import tsx tests/deployment/staging.ts finalize .data/staging-run/expected.json .data/staging-run/pre.json .data/staging-run/check.json .data/staging-run/post.json .data/staging-run/attestations.json > .data/staging-run/final.json
```

Full exit0 requires member HTTP checks, fresh unchanged post evidence, and every
same-run owner assertion. Anonymous-only or missing real-Google/browser evidence
cannot become an authenticated-validation pass. The helper cannot establish
that owner assertions or operator snapshots are truthful. Record fixture/local,
session-reuse, genuine Google and provider-unverified proof separately. Archive
only sanitized metadata/reports/screenshots, never the private Cookie input.

## Functional validation and exact-source release handoff

For each release, deploy the exact reviewed `releaseSourceSha` to the stable
staging lane, inspect source/Preview ID/project/team/target and pre/post alias
attribution, and complete the agreed functional scope there: real allowed/denied
Google sign-in, session/household behavior, logout, keyboard/mobile/desktop/UI and
recipe behavior needed for that release. Label observed Google, owner-reported
behavior, reused session, local fixtures and provider evidence distinctly.
Existing real identity/provisioning authority remains separately scoped; no new
persistent data, invitation, reset or migration is implied.

The last recorded Preview setup is keyless; verify the actual configuration
profile before release. Missing-key503 proves only error handling; paid
provider/recipe/photo success and hosted cancellation/WAF enforcement are not
established by that result. Required live coverage needs separate bounded staging
authority naming credentials/configuration, request counts, cost/budget,
origin/IP/window and real correlation evidence. Do not copy a Production key,
modify WAF policy or run retries as part of this process amendment. Bypassed
platform traffic cannot certify WAF/bot/platform rate limits. A keyed exercise
cannot be forced through this helper's `providerKeyAbsent` contract; after a
relevant configuration change, revalidate/accept the intended actual profile.

Record a sanitized acceptance artifact before Production. Illustrative Markdown
fields below are **not an actual acceptance or pre-filled pass**:

```markdown
# Staging acceptance — EXAMPLE ONLY
releaseSourceSha: <exact reviewed 40-character source SHA>
previewDeploymentId: <actual inspected Preview ID>
stagingOrigin: https://meal-planner-staging-rafalotufos.vercel.app
project/team/target: <actual inspected attribution, Preview>
validationInterval: <actual UTC start/end>
configurationProfile: <sanitized version, verified parity/intentional differences>
localVerificationAndReviews: <actual evidence references>
performedChecksAndProofClasses: <actual checks/outcomes and owner/observed/session/fixture labels>
helperReports: <actual references/results, including inconclusive reports>
gapsAndResidualRisk: <every missing check, e.g. provider success unverified>
ownerDecision: <actual owner acceptance of this exact source/profile/scope and named gaps, with reference>
productionReleaseAuthority: <separate or explicit combined decision naming exact source/project/actions/expiry/health/recovery>
```

Full required checks must be completed or explicitly accepted as named gaps by
that owner. Such acceptance is a release-scope decision; it does not turn an
inconclusive/protected helper report into a pass or justify invented per-check
attestations. Never move a missing staging functional check to Production as an
automatic fallback. Broad “working as expected” statements remain owner-reported
behavior unless individual checks were actually established.

Compare accepted staging and proposed Production source by **exact SHA**.
A new SHA must be staged, validated and accepted even if main contains the old
commit or application files look equal. Existing source9fc13ff acceptance does
not certify current main or a new release SHA. Acceptance/gate audit commits may
come later while referring to a fixed release source: keep that source pinned
and deploy its clean checkout/export, not the latest audit HEAD. Alias moves,
redeployment, relevant environment/schema/runtime or scope drift invalidate
readiness and require refreshed attributed validation/acceptance.

Verify intentional Production origin/OAuth/auth-secret/database/provider-key
configuration differences privately; reconcile unexpected differences before
readiness. The [Production runbook](../vercel-deployment/deployment-runbook.md)
requires separately authorized canonical lotufo-meals routing/auth/callback
configuration, fresh committed human release authority, a separate Production
build with `--prod --skip-domain`, manual promotion and minimal anonymous
canonical/configuration health plus scoped recovery. Do not promote Preview.
An explicit combined staging acceptance/Production approval is permitted once
that concrete scope is reviewable; record the separate gates without asking the
same permission again. Existing helpers/hooks do not automatically enforce these
SHA/profile requirements; the operator verifies and records them.

On failure, stop and preserve sanitized evidence. Do not reset DB data, weaken
protection or move Production. Release only this run's owned local lane lock
after reconciling the alias; recovery effects need their own authority. Any
later Production release uses the exact accepted release source, a separate
Production build, manual promotion and minimal anonymous/configuration health
under the linked runbook. This staging runbook grants no release authority.
