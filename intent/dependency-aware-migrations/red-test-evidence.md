# Red-first migration regression evidence

2026-11-24, Node24.15.0, existing behavior at a52e63b; no behavior edits.

`node --import tsx --test tests/migrations/dependency.test.ts` ran with local
network access against owned random databases using restricted `mp_test`.
Two tests:1 passed,1 failed, exit1. The failing convergence regression seeded
legacy migration order0,1,4 versus0,1,2,3 and then requested the remaining work.
Existing `checkHistory` rejected the first database with `Storage unavailable`
at `lib/db/connection.ts:69` from `migrateDatabase`; no pending migration ran.
Unknown history/checksum fail-closed coverage passed. Both owned databases were
cleaned up. An initial sandbox-only attempt failed with EPERM before reaching
PostgreSQL; that environmental failure is not the behavioral red proof.
