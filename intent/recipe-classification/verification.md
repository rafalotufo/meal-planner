# Saved recipe classification — local verification

Status: Non-browser verification passed. Real Chrome verification and final
independent approvals remain in progress. No merge or release is authorized.

## Source and implementation evidence

- Accepted intent: `b73ecf5`; corrected design: `6c0933e`; independent design
  approval: `d891e35`, with graph/ledger approval recorded by the orchestrator.
- Search/URL classification: `a2941f0` (existing search response only, conservative
  selected Recipe-node metadata classification, null uncertainty).
- Shared category contract/body parser: `a9b693f`.
- Menu controls and browser assertions: `29db2b0`.
- Storage/API/migration increment passed disposable-database verification.

## Environment

Node24.15.0 and pnpm10.33.0 match the repository contract. Frozen installation
attempt hit sandbox registry ENOTFOUND; the escalated download did not complete.
Offline frozen installation also failed because os-paths4.4.0 was absent from the
local pnpm store. The orchestrator copied an existing installed dependency tree
whose committed lockfile SHA256 exactly matched this worktree, then restored the
exact declared @types/ws8.18.1 package from five cached files with individual
SHA512 verification. No dependency/lockfile/vendor declaration was changed.
This is cached installation reuse, not a successful frozen install claim.
Installed pinned Next16.4.6 Server/Client Components and Route Handler docs were
read before application code; ordinary local installed docs are now present.

The orchestrator supplied owner-only private local test configuration and started
the dedicated native cluster without migrating development data. Profile/tool
loopback access hit sandbox EPERM; the orchestrator completed the elevated
profile generator using an owned disposable database. Only owned random disposable test databases are in scope.

## Test-first checkpoints

- New category parsing assertion failed with `undefined` versus expected null
  before canonical parser/type changes; exact legacy/new card validation now passes.
- New store test failed because `updateMenuRecipeCategory` export did not exist
  before implementing the transaction-scoped correction.
- New category body mode failed with400 before adding its exact bounded shape;
  all eight body tests now pass including existing deadline/cancel behavior.
- Native category metadata test first failed7 versus expected8, then passed6/6
  after actual PostgreSQL catalog profile generation. The historical five
  metadata tests remain passing.
- UI owner observed real React renderer RED for missing category controls and
  GREEN for ready/pending/failed plus labels-only synthetic rendering. Actual
  Chrome execution remains pending and must be recorded separately below.

## Completed commands

- `pnpm run lint` — exit0, zero warnings.
- `pnpm run typecheck` — exit0 after exact cached declared ws types recovery.
- `pnpm run build` — exit0 in the elevated integration driver.
- `pnpm run test:family` —35/35 passed in the first integration driver.
- `pnpm run test:menu` —78/78 passed after fixture corrections.
- `pnpm run test:plans` —37/37 passed after fixture corrections.
- `pnpm run test:auth` —16/16 passed.
- `node --import tsx --test tests/verification/*.test.ts` —30/30 passed, including
  real synthetic snapshot save/main label and category-only403 with unchanged row.
- `node --import tsx --test tests/migrations/security.test.ts` —30/30 passed after
  the controlled TEMP attack-fixture correction. Other40 migration tests passed
  in the prior full70-case execution; no untested failing case remains.
- `node --import tsx --test tests/deployment/*.test.ts` —42/42 passed, including
  clean source-upload build after the intended native SQL was staged.
- `pnpm test` —118 tests passed, zero failures/skips.
- `node --import tsx --test tests/menu/validation.test.ts tests/menu/body.test.ts tests/plans/validation.test.ts`
  —23 tests passed, zero failures/skips.
- Classification owner's focused category/curation/URL parser tests —23 passed.
- `python3 -m unittest discover -s tests` —7 tests passed.
- `git diff --check` — exit0.
- `python3 scripts/scan_secrets.py --staged` — zero findings before committed increments.

## Pending evidence

The actual eight-identity catalog was generated and inspected: two columns,
two checks and exactly two new column UPDATE grants. Every historical descriptor,
profile, independence declaration and grant remains equal to HEAD evidence.
Fresh/upgrade/repeat migration and exact narrow grants tests passed. All required
non-browser suites have passed, with affected failures rerun as recorded below.
Complete both owned Chrome scripts and inspect feature-prefixed screenshots at
320 and1440px before final code review. Browser harness debugging remains open:
native select arrow events did not change the value in an isolated Chrome page;
trusted printable type-to-select does, and the current check is keyboard Save.

## Operational boundary

No development or hosted migration, grant, merge, push, staging deployment or
Production operation is authorized or performed by this implementation task.
The new runtime requires eight identities; current hosted databases have seven.
A future release must separately authorize/verify migration and staged exact-SHA
compatibility. Older binaries are unsafe rollback targets after that cutover.
Legacy saved recipes remain honestly unclassified and manually correctable;
no bulk provider backfill or historical plan snapshot rewrite occurs.

## First integration run and fixture corrections

Driver logs: private owned temporary directory `recipe-classification-checks-KxCqIF`.
Build and family suite passed. Migrations69/70, plans36/37 and menu76/78
identified four fixture issues, corrected without changing application behavior:

- New upgrade plan fixture used a non-UUID ID, correctly rejected by the existing
  plan check. It now uses a bound random UUID.
- Historical-row migration assertion now includes the additive category=null and
  category_overridden=false defaults while still comparing all original fields
  and unchanged raw plan snapshots.
- CookieJar/fetch did not transmit the hostile Host override. The category probe
  now uses the existing real node:http pattern and retains421, private headers
  and no-mutation assertions.
- Fresh disposable databases inherit PUBLIC TEMP; the restricted test fixture now
  explicitly revokes TEMP from PUBLIC/mp_runtime on only its validated random
  owned database before migration. The owner retains TEMP; migration reruns must
  preserve runtime denial. No development or hosted ACL was touched.

The two extra fixture paths and reasons are recorded in the plan manifest.
Full affected-suite reruns and remaining integration/browser commands are pending.

## Affected-suite rerun

Logs: private `recipe-classification-checks-2dz37o`. Menu78/78 and plans37/37
passed. Migrations69/70 found an existing attack test that intentionally creates
a TEMP shadow table and had relied on implicit PUBLIC TEMP. Preserve that test
with a deliberate owned-fixture capability: verify exact random database name,
owner and actor; assert ordinary runtime TEMP denial; grant TEMP on only that
database; perform the original shadow-table/path checks; revoke in finally and
assert restored denial. The runtime fixture default remains denied and no shared
role, development or hosted ACL changes occur. This exact test path is added to
the plan. Focused security-file rerun is pending with the remaining suites.

## Compiled permission and upload checks

Private logs `recipe-classification-checks-Ep2ANk` record auth16/16,
verification30/30 and targeted migration security30/30 passing. Deployment41/42
failed only because its clean export intentionally selects `git ls-files` and
the new UUID SQL was not staged yet. The export copied the new required manifest
without its untracked SQL, correctly producing missing-dependency. Staged the
intended SQL with zero secret findings; no application/test change was required.
Deployment rerun and both real Chrome scripts remain pending.
