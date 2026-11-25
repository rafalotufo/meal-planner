# Local implementation evidence

## Target binding (2026-11-25)

Strict TypeScript target regressions were written before the target module.
The initial test command failed because `lib/verification/target.ts` did not exist.
After implementation, the two tests passed using the matching pinned reference
checkout's tsx loader and NODE_PATH while this checkout's frozen install completed.
The tests cover copied Preview settings on Production, absent trusted metadata,
wrong source/profile/origin/database and valid Preview deployment binding.
The disabled manifest generator also exited zero. No database or remote target
was contacted by these tests. Full repository checks remain outstanding.

## Deadline primitive (2026-11-25)

The generic deadline transaction primitive is independent of the verification
schema, so its disposable-database proof ran alongside migration work; exchange
integration still waits for the new schema and typed admission. The meaningful
red failed with `db.verificationTransaction is not a function`. After adding
owned-connection cancellation, transaction-local server timeouts and post-expiry
query guards, the real PostgreSQL test passed: a transaction inserting then
sleeping timed out, no rows appeared after waiting beyond the sleep, and a new
transaction acquired the common advisory lock successfully. No shared database
was changed. A lost COMMIT response remains an ambiguous response, never an
idempotent retry guarantee; exchange still requires a new capability.
