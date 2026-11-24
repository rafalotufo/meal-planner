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
- Initial native db status/start failed because this worktree lacked private
  configuration. The orchestrator then validated/reused the existing private
  cluster configuration and started that cluster; no setup/development migration.
- Task3 RED: `node --import tsx --test tests/menu/migration.test.ts` against owned
  random local databases failed3/3 (exit1): menu table absent, old schema still
  accepted, and separate menu rollback absent. Each fixture cleanup ran.

No hosted operation, development schema change, provider request or UI behavior
has been performed by this foundation increment. Runtime menu persistence and
browser acceptance remain later tasks.
