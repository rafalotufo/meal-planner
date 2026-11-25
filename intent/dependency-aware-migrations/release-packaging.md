# Exact-source release packaging preflight

- Engineer:senior-developer; date:2026-11-24.
- Fixed release source:e4b8c954f6e2cab63c39216cef794187a227d79e.
- Status: local packaging verified; **not deployment readiness or release approval**.
  Root reports strict read-only hosted validation currently fails with sanitized
  permission-failure. This source must not deploy merely because packaging passes.

## Provenance and exact upload inventory

A clean `git archive` of the full fixed SHA was extracted into an owned private
`/private/tmp/meal-planner-release-e4b8c954-*` directory. No working-tree env,
credentials, node_modules, build output or operator state was copied into it.
Source SHA remains fixed even when later audit commits record these results.

The exact scripts-disabled CLI66.6.0 `deploy <export> --dry --json` inspected the
upload without uploading or creating a deployment. Its first attempt correctly
refused an unlinked export. A local-only `.vercel/project.json` containing the
already recorded project/team identifiers enabled dry inspection; it is excluded
from upload. No `vercel link`, deployment, promotion, hosted database action,
push or account configuration change was performed by this engineer.

Actual inventory: **124 files,730334 bytes**, detected Next.js framework. Every
CLI SHA1 matched the export's raw bytes and the exact Git blob at the fixed SHA.
A second SHA256 was recorded for each file. The sanitized reproducible inventory
is `release-upload-manifest-e4b8c954.json`; it contains relative filenames, sizes
and hashes, with no private base path, credentials or configuration values.
The former119-file layout is not reused: the four new runtime database modules
and reviewed compatibility JSON are additional upload assets.

Required source/build files were checked explicitly, including:

- `lib/db/compatibility.ts`, `migration-graph.ts`, `security.ts`, `validation.ts`,
  `connection.ts`, `repository-migrations.ts`, `runtime-metadata.ts` and
  `verify-runtime-metadata.ts`.
- `drizzle/postgresql/compatibility.json`, catalog, runtime migration metadata,
  original journal and unchanged historical SQL through0004.
- Exact package manifest/lock, pnpm build policy, tsconfig, Next/PostCSS config,
  `vercel.json`, application styles/source and public assets.

Env files, `.vercel`, Git/operator/private state, audit/intention records,
test/helper scripts and other excluded directories are absent from the upload.
The server-only admission-list file is uploaded only as required server source;
its values were not printed or reproduced in this evidence.

## Clean upload-only install and build

A second owned directory contained **only those124 inventoried upload files**.
It had no `.env.local`, `.vercel`, tests, operator scripts or audit records.
With Node24.15.0/pnpm10.33.0 explicitly pinned:

| Command/check | Actual result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Exit0; exact locked dependencies installed |
| `pnpm run build` | Exit0; reviewed SQL/metadata source validation and production build passed |
| Post-build source rehash | All124 uploaded source-file SHA256 values unchanged |

The initial unpinned temporary-directory install selected the machine's broken
Node22 binary and aborted before package-manager execution. Only the command
PATH was corrected to the required Node24; no dependency/source change or check
weakening was used. This environment failure is distinct from the successful
packaging verification. No database/provider effects occur in the build.

## Existing local regression attribution

The fixed release source's app/lib/tests/drizzle Git tree IDs equal the already
verified combined source49e2a64625d97adee760e44847ad445ea2b8f3d8 exactly. An empty
Git diff also confirmed operator scripts and package/lock/build/runtime/compiler/
lint/upload configuration equality. Therefore the actual prior295 Node tests,
7 Python tests, lint/typecheck/build and both Chrome suites remain applicable
local proof for this unchanged application/test/configuration source. They were
**not rerun or relabelled as new hosted checks** during packaging.

See `main-integration-verification.md` for their actual commands/counts and
`org/reviews/dependency-aware-migrations-main-browser/` for newly captured,
hash-recorded combined UI evidence. Packaging's fresh build above is separately
executed proof that Vercel's excluded upload set retains necessary runtime assets.

## Fresh production-dependency audit

`pnpm audit --prod --json` against the exact locked upload copy returned **exit1**:
1 moderate,0 high,0 critical (251 production dependency entries). The existing
finding is GHSA-67mh-4wv8-2f99 in old esbuild through Better Auth's optional
Drizzle Kit/@esbuild-kit tooling chain. It is not a clean audit or zero findings.

The lockfile/pins and relevant execution paths are unchanged. The existing
independent reachability/deferral record is
`org/reviews/security-saved-recipe-menu-release-audit-001.md`, reviewed again by
2026-12-01 or before development-server/tooling exposure. This app runs Next,
native pg and Drizzle's public migration loader; this release adds no esbuild
serve process. No forced upgrade, override or suppression was applied. A final
release review must retain the moderate finding and its stated limits.

## Operational boundary

All raw dry/build/audit receipts and the owned export stay private outside Git;
only sanitized inventory/evidence is committed. This packaging pass does not
certify hosted permissions, authentication, provider success, route execution,
function timeout, staging acceptance or Production readiness. Root owns those
checks and the owner gates. If the hosted failure needs a source correction,
select a new reviewed release SHA and regenerate its exact upload manifest/build
rather than silently deploying later audit HEAD or reusing this SHA's acceptance.
