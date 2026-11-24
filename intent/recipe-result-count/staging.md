# Recipe result count — exact-source staging result

Status: owner accepted this exact source/profile and all named coverage gaps in
the subsequent explicit Production approval in this chat. Acceptance and scoped
release authority are recorded in production.md and the committed gate ledger.
Actual observations below remain unchanged; missing checks are not passes.

## Attribution

- releaseSourceSha: `4e66fb7bf1e9887c6c88e89fae984005ff02f118`.
- Preview deployment: `dpl_GWbcJSGDUGTAU9waFiRfvqaDU2xg`, READY, actual target
  null/Preview, Node24.x, Hobby, inspected owner/team and project matched.
- Stable origin: https://meal-planner-staging-rafalotufos.vercel.app
- Generated origin: https://meal-planner-3jk5lzh1w-rafalotufos-projects.vercel.app
- Project: `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`; team
  `team_2c0O29FMb91g7L6sUChc9v6J`, scope `rafalotufos-projects`.
- Configuration profile: `recipe-result-count-keyless-20261124-v1`, retaining
  the existing isolated Preview Google/auth/database configuration, no provider
  key, no branch override, source-default gpt-6.2-sol, corepack1.
- Submission21:12:26UTC; READY readback21:13:15UTC; browser checks after isolated
  alias assignment; fresh alias/source readback21:14:27UTC. No Production alias
  moved: all three retain `dpl_9a7VxcYjcVhRM1hGLgh2MskEt3HH`.

## Source, packaging and local proof

User authorized merge/deploy in this chat; committed human merge gate is
`recipe-result-count-human-merge-20261124`. Clean local main fast-forwarded
from64f3a76 to4e66fb7. Later audit commits do not replace this pinned source.
The clean Git export was outside a Git checkout. Custom source metadata is
supported by the separately verified source/export/upload hashes, not treated
as standalone proof. Vercel dry-run:100files/445277bytes; every uploaded file's
SHA1 matched the export, required runtime/migration metadata assets present,
private/env/audit/operator files excluded. The exact upload-file set passed a
separate clean frozen installation and production build.

Local199Node+7Python, lint/typecheck/build, source and release reviews, secret
scan and full-base plan-sync passed; see release.md and verification.md.
The plan checker initially rejected missing machine-readable status/manifest
formatting;4e66fb7 records the existing independent approval in the required
format and the complete release diff now passes. The earlier source commit was
not deployed. Existing moderate esbuild tooling advisory remains recorded.
The two authorized **local service** live searches returned six validated
recipes each in approximately31seconds; neither is hosted staging proof.

## Hosted observations and gaps

The real in-app browser reached the staged application sign-in page and shared
Recipes/Menu/Family header. At390x844 and1440x1000, document scrollWidth equalled
viewport width. Anonymous Menu navigation returned sign-in. Keyboard Tab focused
the brand link with solid outline. Screenshots:
`org/reviews/recipe-result-count-staging-390.jpg` and
`org/reviews/recipe-result-count-staging-1440.jpg`. Temporary viewport override
was reset. No Google button was submitted, identity written or data provisioned.

Bounded anonymous HTTP candidate smoke against stable staging returned exit2,
statusnull/passnull (144ms): inconclusive under existing platform protection.
The keyless staging check/finalize helper was not run or claimed passed; there
was no member cookie or same-run Google attestation. No protection bypass used.

Named gaps for owner acceptance: fresh allowed/denied Google round trip,
authenticated hosted family/menu/session flows, hosted provider/photo success,
authenticated recipe UI, hosted cancellation and WAF enforcement, and
protection-limited direct HTTP certification. Public sign-in responsive/keyboard
checks do not certify authenticated mobile/desktop flows. No new paid provider
request, schema/migration, business-row or credential/domain/protection change.

## Concrete Production proposal

Accept this exact source/Preview/profile, observed staging scope and all named
gaps, then authorize a separate same-source Production build with `--prod
--skip-domain`, inspected readiness and manual promotion in the existing project.
Preserve all environment/database/domain/protection settings. Perform canonical
anonymous health and15minutes of bounded post-promotion health observation.
No Production paid/authenticated functional test is proposed.

For a required health failure, authorize recovery only to the currently live
compatible Production `dpl_9a7VxcYjcVhRM1hGLgh2MskEt3HH` (saved-menu source
17881438e3c68f0099e063e714560682c93bd0fb). The application/config/schema diff
against that source is solely the research prompt line: current migration
catalog/runtime metadata and loader are identical, unlike earlier unsafe
initial-schema artifacts. No database rollback, restore, data loss or project
pause is proposed. Release authority should expire two hours after owner
approval and name this exact source/project/staging/recovery scope.
