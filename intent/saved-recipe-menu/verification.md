# Saved recipe menu — Build verification

Implementation is in progress under the approved feature plan. This file records
actual commands/results; unchecked later tasks are not claimed complete.

## Foundation: contract and request parsing

- Node `v24.15.0`; pnpm `10.33.0`.
- Read pinned local Next Route Handler guidance before code. Route handlers are
  uncached by default; no framework/application route changed in this slice.
- Task1 RED: `pnpm run test:menu` discovered the new strict TypeScript test and
  failed with missing `lib/menu/validation.ts` (exit1).
- Task1 GREEN: the same command passed5 validation tests (exit0); strict
  `pnpm run typecheck` passed (exit0).
- Task2 RED: `node --import tsx --test tests/menu/body.test.ts` failed with
  missing `lib/menu/body.ts` (exit1).
- Task2 GREEN: `pnpm run test:menu` passed10 tests (exit0), including streamed
  UTF-8, exact limits, fake lengths, stalled cancellation and total deadlines.
  `pnpm run lint` passed with zero warnings (exit0).
- Subsequent strict checking found an inferred union in the new body-test header
  arrays. Explicit typed records fixed it; `pnpm run typecheck` and lint passed
  again (exit0), without changing compiler settings.
- Initial native db status/start failed because this worktree lacked private
  configuration. The orchestrator then validated/reused the existing private
  cluster configuration and started that cluster; no setup/development migration.
- Task3 RED: `node --import tsx --test tests/menu/migration.test.ts` against owned
  random local databases failed3/3 (exit1): menu table absent, old schema still
  accepted, and separate menu rollback absent. Each fixture cleanup ran.
- Task3 GREEN: prepared two-migration runtime metadata and75-entry full catalog
  using the public loader and candidate SQL on one newly owned random database,
  then cleaned it up. The three migration/upgrade/rollback tests passed (exit0).
- Task4 RED: actual migration/grant tool on a separate owned random DB did not
  allow runtime insertion into menu_recipes; focused privilege test failed with
  PostgreSQL42501 as expected before the new narrow grant.

No hosted operation, development schema change, provider request or UI behavior
has been performed by this foundation increment. Runtime menu persistence and
browser acceptance remain later tasks.

## Completed storage foundation checkpoint

- Existing family storage RED after additive schema:8 tests,6 passed/2 failed
  (expected table list and initial rollback dependency). Updated the expectation
  and ran separate disposable menu rollback before unchanged initial rollback.
- Task4 GREEN: actual explicit grant tool on owned random DB now permits runtime
  SELECT/INSERT/DELETE on menu_recipes and rejects UPDATE, TRUNCATE, DDL and
  migration-history writes with42501. Restricted role flags remain false.
- `pnpm run test:menu`:14 passed,0 failed/skipped/cancelled, exit0.
- `node --import tsx --test tests/family/storage.test.ts`:8 passed,0 failed, exit0.
- `pnpm run lint`: exit0, zero warnings.
- `pnpm run typecheck`: exit0, route types and strict tests included.
- `pnpm run build`: exit0; reviewed SQL/journal metadata matches, optimized
  Next16.4.6 build compiled/typechecked and generated14 pages successfully.
- `git diff --check`: exit0. Original0000_family.sql, rollback-initial.sql and
  preserved SQLite migration evidence have no diff.

Task1–4 and the storage checkpoint are complete; task5 onward remain unchecked.
The explicit migration/grant CLI was exercised only with validated owned random
DB owner/runtime URLs in private child environments, never with the development
DB or hosted URLs. Restricted-role fixture grants target only its random DB;
no global role creation/alteration or development-data access was added.
All owned fixtures ran cleanup. Menu store/API/UI/browser acceptance and final
whole-feature regressions remain outstanding.
