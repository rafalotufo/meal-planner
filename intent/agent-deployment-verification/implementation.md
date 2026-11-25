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

## Scoped integration and deadline follow-up

Real store integration first exposed an overly broad synthetic plan finalization
path (missing expected403); it now permits only read/approve/suggest. Snapshot
menu, family labels, Google-only invite/provision/curation denial, no global plan
creation, two-member approvals and foreign-run denial pass in two owned-fixture
tests. Additional pool-starvation/advisory-wait/delayed-JavaScript deadline tests
exposed a borrowed pg client idle-timeout error outside a running query. Owning
that client error event now cancels/destroys the connection; all three deadline
cases pass with no delayed rows or retained lock. Initial catalog validation for
the exchange uses a dedicated request-owned read-only deadline-bound pool, so
startup validation cannot bypass the handler deadline.

The pinned Next cookie guide prohibits setting cookies from a Server Component.
The exact staging GET/HEAD Proxy therefore generates the signed preflight nonce,
overwrites its request nonce header, and sets the matching HttpOnly cookie. The
page only reads and validates it. No forwarded identity header is trusted.

## Actual browser compatibility and operator fixture

The first native Chrome form submission returned403 despite a valid paired nonce:
actual ingress reported Origin:null with Sec-Fetch-Site:same-origin. The page's
global no-referrer policy caused that standard navigation behavior. The exact
enabled entry GET/HEAD now uses Referrer-Policy:same-origin; all other paths keep
no-referrer and POST still requires the exact configured Origin. A fresh Chrome
158.0.8127.88 run then passed ordinary form/server-set Secure cookie entry,
home/menu/family/plans at390 and1440, logout revocation and protected redirects,
with zero Google/provider calls and no browser errors. Firefox is unavailable;
Safari automation was not executed. The initial transport fixture accidentally
omitted proxy.ts; that result was discarded as matcher proof. Fresh corrected
fixtures copy the real Proxy and check metadata coherence before building.

The operator's empty household remains the default. Explicit --seed-fixture and
an operator inspection record allowing fixture seed create only reviewed v1:
two labeled example.com snapshots (no images) and one current-week draft, in the
new run's family. The TDD red found zero recipes where two were expected; the
fixed fixture case now passes and cleanup preserves another run. A second red
proved cleanup must refuse foreign-member approvals on a synthetic plan; both
directions of cross-family approvals/suggestions are now refused before deletion.
No provider, arbitrary recipe input or hosted issuance was used for this proof.

## Security follow-up

Chunked Google cookies were added to conflicting-credential tests; the new case
first failed to reject and now passes. Verification admission still rejects any
Google credential coexistence. Logout has a distinct non-admitting extraction of
exactly one valid opaque cookie, allowing targeted revocation even when a stale
Google cookie conflicts; malformed/duplicate verification cookies are clear-only.
Its helper regression first failed for the absent function and then passed.
Compiled-route copied-token revocation and stripped-runtime proofs are recorded
by their dedicated tests and final review evidence, not inferred from this unit
case. Malformed raw UTF-8 form bytes first produced503; parser normalization now
returns the required400 without creating a session.

## Compiled logout proof

`node --import tsx --test tests/verification/logout.test.ts` passed against a fresh
isolated real Preview build and TLS ingress. The copied opaque cookie initially
accessed `/api/session` (200); adding a stale chunked Google cookie denied access
(401). Posting same-origin logout with that conflict returned200, revoked exactly
one stored session, and the previously copied opaque cookie alone then received
401. No provider/Google request or hosted target was used. This complements the
private browser's successful ordinary logout and the separate stripped-runtime
packaging regression; it does not claim Google-cookie revocation beyond the
existing library contract.
