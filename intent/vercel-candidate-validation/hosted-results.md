# Preview-only hosted setup — execution evidence

Date: 2026-11-24. Scope: owner-authorized worktree Preview setup under
`org/messages/ceo-0030.md`, reviewed in
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
  User Data Policy and this scoped client in `org/messages/ceo-0031.md`.
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
`org/messages/ceo-0032.md`. Google Console now shows one saved test-user row
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
