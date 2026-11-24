# Preview-only hosted setup — execution evidence

Date: 2026-11-24. Scope: owner-authorized worktree Preview setup under
`org/messages/ceo-0040.md`, reviewed in
`org/reviews/hosted-vercel-candidate-validation-001.md`. Production release,
merge, paid usage, migrations and project resumption are excluded.

## Configuration completed before deployment

- Existing Vercel Hobby project/team IDs match the approved scope; full project
  API reported paused false and Node24. No project/Git integration was created.
- Registered and read back verified domain
  `meal-planner-staging-rafalotufos.vercel.app`, atomically qualified with
  `gitBranch: codex/vercel-candidate-validation` in the recorded project.
  It is excluded from the unqualified Production-domain set. No Preview was
  present yet, so the staging alias was not mapped to a deployment at this step.
- Existing Production domain `meal-planner-delta-six-55.vercel.app` and alias
  `meal-planner-rafalotufos-projects.vercel.app` remain on
  `dpl_Hf41h7Cr65E6U2UBv3duCa83FYFT`. Complete inventory showed no other pages.
- Google project `meal-planner-515616` had no OAuth clients/consent configuration.
  Created **Meal Planner Staging** in External/Testing mode and the dedicated
  **Meal Planner Staging Web** Web client. User explicitly approved Google's
  User Data Policy and this scoped client in `org/messages/ceo-0041.md`.
- Saved client details were independently re-opened in Google Console and show
  exactly one redirect URI:
  `https://meal-planner-staging-rafalotufos.vercel.app/api/auth/callback/google`.
  JavaScript origins remain empty for the app's server redirect flow; the AI-agent
  client option stays off. No existing Production Google client was changed.
- The new credential-download browser operation timed out. The original creation
  dialog remained open; credentials were preserved privately from that same
  displayed client, without another client or credential rotation. The local
  staging credential file is owner-only and ignored/excluded from upload. No
  credential values are included in this evidence or command arguments.
- Preview now has seven scoped variables: preserved `DATABASE_URL`, staging
  `BETTER_AUTH_URL`, independent `BETTER_AUTH_SECRET`, new `GOOGLE_CLIENT_ID`,
  `GOOGLE_CLIENT_SECRET`, `RECIPE_SEARCH_PROVIDER`, and
  `ENABLE_EXPERIMENTAL_COREPACK`. Secrets use sensitive storage. No
  `OPENAI_API_KEY` is present in Preview. Production environment metadata and
  Preview database metadata were compared unchanged before/after creation.
- An initial batch environment request failed with no variables created; metadata
  inspection confirmed no partial effect. Individual JSON requests succeeded.
  Private temporary request files were removed after use. No env pull or data
  migration was performed.

## Approved test user saved

Rafael explicitly approved the sole staging Google test user in
`org/messages/ceo-0042.md`. Google Console now shows one saved test-user row
for that approved account, with publishing status still Testing. No other users
were added. The earlier automatic approval rejection caused no mutation; the
specific approval was obtained before the successful action. Production access
and the application's private admission configuration remain unchanged. Google
shows an inconsistent total/other cap counter immediately after save; the saved
single test-user row is the configuration evidence. Actual OAuth round-trip and
member validation are not yet claimed.

## Upload verification

The original pinned CLI dry run excluded private file contents, but still
included compiler cache and nonruntime workflow/audit files. The small packaging
amendment narrows `.vercelignore`, adds it to the plan manifest and records the
observed assumption correction. Independent review approved in
`org/reviews/hosted-vercel-candidate-validation-packaging-001.md`.

Revised exact-project, explicit-Preview dry run:76 files,358474 bytes,23 ignored
entries, Next.js detected; zero forbidden private/env/Git/test/script/org/intent/
audit/cache paths and22/22 required runtime/package/config/SQL/runtime-metadata
inputs present. App/lib counts are25/29. A clean payload install/build and actual
Preview deployment/readiness/domain mapping are recorded below when complete.
No paid bypass, custom environment, Git integration or new project is introduced.

### Clean upload build

The exact76-file/358474-byte payload was copied to an owner-only temporary
export. Every input resolved within the repository, was a regular nonsymlink
file, and matched source bytes; zero forbidden inputs. With Node24.15.0 and
pnpm10.33.0, frozen install exited0 (434 reused,0 downloaded) and
`pnpm run build` exited0: migration metadata matched SQL/journal, Next16.4.6
webpack compiled, strict TypeScript passed and12/12 static pages generated.
An initial offline store miss was resolved with the frozen network-enabled
install; neither source dependencies nor lockfile changed. Root build state was
untouched. Actual deployment follows a clean reviewed-source commit.

## Actual Preview deployment

The single authorized deployment exited0 and reached READY:

- Deployment: `dpl_ALHqB6jCB6emyBNHTTbBzmfsV5Hi`.
- Generated URL: `https://meal-planner-nq54abywc-rafalotufos-projects.vercel.app`.
- Actual Vercel environment: Preview (`target: null`), recorded team/project match.
- Actual Git metadata: commit `9fc13ff27a636483fdf3503d5c8bf9f149550e45`,
  branch `codex/vercel-candidate-validation`; source was clean at submission.
- Pinned CLI66.6.0, existing project and explicit Preview environment; no second
  deployment, Production flag, promotion, link, protection bypass or migration.

Vercel did not attach the staging hostname automatically. Before manually
assigning it, complete fresh inventory found concurrent Production-domain drift:
`lotufo-meals.vercel.app` was added with null gitBranch, verified true, redirecting
to `meal-planner-delta-six-55.vercel.app`, and mapped to the existing Production
ID. Both original Production aliases remain unchanged. This workflow did not
create that new domain. Manual staging assignment was held pending the owner's
confirmation of that concurrent change; no Production mapping was overwritten.
An anonymous browser visit to the still-unmapped staging host showed Vercel404
DEPLOYMENT_NOT_FOUND; it sent no credentials and is not a validation pass.

## Owner reconciliation

Rafael confirmed in `org/messages/ceo-0043.md` that he added
`lotufo-meals.vercel.app` and intends it as the Production URL. Preserve that
owner-added domain, its current redirect and deployment mapping, together with
both original Production aliases. The original baseline remains intact; a fresh
reconciled baseline includes all three Production aliases. This confirmation
unblocks the previously authorized staging-only alias assignment, without any
Production routing/OAuth/deployment change or another Preview deployment.

## Stable staging mapping and bounded checks

The reconciled preflight verified the recorded READY Preview, source/ref/team/
project, project paused false, complete domain/alias inventory, unchanged
Production environment metadata, unchanged seven Preview variables and existing
Preview database metadata, and absent paid provider key. Original baseline was
retained; the owner-confirmed new Production domain was included in a separate
reconciled baseline.

A single pinned CLI alias assignment exited0. Fresh readback at
2026-11-24T15:17:35.923Z confirms:
`https://meal-planner-staging-rafalotufos.vercel.app` maps to
`dpl_ALHqB6jCB6emyBNHTTbBzmfsV5Hi`. The domain remains verified, qualified to
`codex/vercel-candidate-validation`, and has no redirect. All three Production
aliases/domains retain their reconciled classification/mappings; the Production
deployment remains `dpl_Hf41h7Cr65E6U2UBv3duCa83FYFT`.

The implemented anonymous helper's initial sandbox invocation could not perform
its first request (exit2 REQUEST_UNAVAILABLE). After allowing network access,
a bounded invocation received302 to Vercel's SSO endpoint on its first request,
so it again correctly returned exit2 REQUEST_UNAVAILABLE without a pass. A
minimal status/redirect diagnostic confirmed `/`, `/sign-in` and `/api/session`
are platform-protected for the unauthenticated CLI. No redirect was followed,
private cookie/bypass credential sent, protection changed or provider called.
The check cannot be finalized as an authenticated validation pass.

The authenticated platform browser reached the stable staging `/sign-in` page
and showed the expected heading and Google button. At390px and1440px, document
scroll width equaled viewport width; screenshots are
`org/reviews/vercel-candidate-validation-hosted-mobile.jpg` and
`org/reviews/vercel-candidate-validation-hosted-desktop.jpg`. The viewport was
reset after checks. An attempted keyboard sequence did not establish focus and
one body-key action timed out; keyboard validation remains unverified, not passed.
No Google button activation, real Google round-trip, ineligible identity test,
sign-out/fresh sign-in, app session reuse, family provisioning or DB write was
performed. Those and paid provider behavior remain unverified. Private truthful
attestations retain false for uncompleted checks; anonymous CLI proof is
inconclusive. This completes configuration/deployment and visible public sign-in
layout evidence only, not the full authenticated staging certification.

## Post-check reconciliation

Fresh post-inspection captured2026-11-24T15:19:54.958Z, after the HTTP and
browser observations, retained the exact READY Preview/source/ref/staging mapping.
The complete3-domain/4-alias inventories were unchanged from the reconciled
baseline plus the intended staging assignment. All three Production mappings,
Production deployment, branch-qualified staging classification, project paused
false, Production environment metadata and configured Preview/DB metadata were
unchanged. The paid provider key remains absent. No full pass was finalized from
the inconclusive platform-protected check; no additional deployment or alias
mutation was performed. Independent final review and owned-lock release are
recorded at completion.

Final independent review approved the bounded setup/deployment scope in
`org/reviews/hosted-vercel-candidate-validation-final-001.md`. The matching
Preview-verification gate records only this scoped completion; full authenticated
certification remains unverified. After final reconciliation, the owned lane
run-id was checked against `preview-1795530899553` and only that run-id file and
empty lane directory were removed. No unrelated lock/state was removed.

## Owner acceptance

Rafael subsequently confirmed: “staging is working as expected. approved.”
Recorded in `org/messages/ceo-0044.md` on2026-11-24 for the current stable
staging deployment `dpl_ALHqB6jCB6emyBNHTTbBzmfsV5Hi`, source
`9fc13ff27a636483fdf3503d5c8bf9f149550e45`. Staging is owner-validated and
approved. This owner-reported functional result supplements the agent's evidence;
it does not change the historical inconclusive CLI report or attest to individual
Google/denial/keyboard/session/provider checks that were not specified. No merge,
Production promotion/deployment or Production configuration change is authorized
by this staging acceptance.
