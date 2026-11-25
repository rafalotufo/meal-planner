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

## Credential, identity and operator core (2026-11-25)

Cookie/nonce tests failed for the absent module, then two passed. Native session
exchange tests cover simultaneous one-use redemption, replay, current target
binding, session revocation and shared DB throttles (two passed). A store draft
was prepared before these regressions; it was quarantined while the tests were
written and its absent-module failure recorded. This was a sequencing correction,
not a claim that the first draft followed TDD. Typed-member regression first
failed with Family membership required; after integration it passes forged-member,
malformed-allowlist and run-revocation checks. Operator regression first failed
for the absent module; issuance/two-member scope, canonical owner-only 0600 file,
overwrite refusal and strictly scoped revoke/cleanup then passed. All database
work used owned random fixtures. Lint and strict typecheck passed after these
changes. The direct form helper regression passed nonce/method/Host/header guards,
303 server cookie, no reflected capability and replay denial; real-server raw
body and browser checks remain outstanding.
