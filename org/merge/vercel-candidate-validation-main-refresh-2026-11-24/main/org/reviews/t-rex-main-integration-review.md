# T-Rex Runner — independent main integration review

- Date: 2026-11-24
- Reviewer: reviewer (independent of integration author)
- Candidate: f929e5792cf9304dded0b7631c4b0d1976c7e2a3
- Parents: reviewed T-Rex d9245f9 and local main 37b6083
- Verdict: Approved integration; no required findings

## Application and test integration

Read current main's AGENTS.md, approved T-Rex intent/spec/plan, current family/
PostgreSQL, single-call search and icon requirements, then compared the
candidate to both parents. The seven T-Rex application/library files are
byte-identical to d9245f9. Existing review code-t-rex-runner-002.md therefore
continues to cover actual game code, including the resolved initial-autostart
race, terminal cleanup, full-width rendering and pinned notices.

Main's AGENTS.md, package/lockfile, home page, search API, session/auth policy,
single-call provider, icon files, Next/Vercel configuration and auth server/flow
helpers are byte-identical to 37b6083. Family context remains required before
home/search effects; PostgreSQL runtime/migration separation, single-call
provider bounds/cancellation and exact public icon exceptions are preserved.
No T-Rex integration code weakens those newer boundaries.

The only behavioral conflict resolution in tests/auth/browser.ts imports and
asserts main's provision() after verified Google sign-in. This creates the
test user's family through the real isolated onboarding endpoint before the
runner/recipe tests. Every T-Rex assertion remains; other harness edits use
fresh t-rex-main-* capture paths. Main's test server retains disposable migrated
PostgreSQL databases, forced empty paid keys and test-process-only Google
transport. No source behavior was invented to make fixtures pass.

## Audit-stream reconciliation

Independently compared all 254 manifest entries to their immutable source
commits, archived bytes, SHA-256 and lengths: zero mismatches. Both original
ledger streams and messages remain exact in org/merge/t-rex-main-2026-11-24/.

Canonical ledger retains main's exact 86-record byte prefix, then 13 sourced
feature imports. IDs are unique; imported gate/decision/approver and original
hash match archived decisions. All three full chains verify successfully.
No import creates a new merge/release approval. All 122 main messages remain
byte-identical; all 55 feature aliases have their new IDs and original-message
provenance. Current feature references resolve through those aliases.

Canonical memory retains all 81 main events in order with unchanged semantic
content (blank lines normalized), followed by sourced feature imports with
unique IDs; original memory bytes are archived. Solved T-Rex config/state/
history remain byte-identical to the feature parent. Message, loop and graph
checks pass; no cycle reset, extension or fabricated integration acceptance
was recorded into the completed six-turn loop.

## Verification evidence checked

Read t-rex-main-integration.md and independently matched all 142 source/config/
test/asset hashes against both workspace and clean verification snapshot
/private/tmp/trex-implementation-fftcqt79: zero mismatches. The five Word Snack
removals remain absent. Recorded map aggregate:
c735a65a02af8da256f116b6b3d67c8092a1e407be10d4d91f9653faff0e9fbe.

Integrated evidence records frozen installation, 82 application tests, 14 auth,
34 family, 18 deployment and 7 workflow tests plus lint, strict types and build
all passing. The initial roles-test setup failure is disclosed and rerun rather
than waived: its snapshot-only private loopback configuration is mode 0600 and
the unchanged test verifies runtime DML restrictions/denied writes. No hosted
database or persistent fake production data is used.

The merged Chrome harness reports all five runner widths, native touch and
mouse/keyboard input, revoked-focus regression, terminal/resource cleanup,
old-panel success focus, DPR, reduced motion and protected game assets passing.
Family browser evidence additionally covers production 320/1440 and development
StrictMode invitation flow. Unexpected browser errors are empty; ten deliberate
429 fixtures are counted explicitly. Existing provider response/Google fixtures
remain distinct from the real publisher-image HTTPS check; no live LLM evidence
or screen-reader listening is claimed.

Visually inspected fresh running-game captures at 320/1440, family-management
320 and joined-family 1440 using view_image: recognizable full-width runner,
responsive controls/history, readable family fields and visible keyboard focus,
with no visible clipping/overflow. These are independent screenshot inspections,
not a second reviewer-owned browser run.

## Scope and limits

No source/cache/database/build changes or additional mutation were made during
this integration review. Prior meaningful mutation evidence is retained for the
unchanged game implementation. No new failing behavior test is necessary for
the fixture onboarding merge; integrated real-browser checks exercise it.
Candidate application/test paths have no post-commit diff. Historical inherited
audit formatting is preserved exactly rather than rewritten as cleanup.

This independent approval is bound to f929e57 and its matching evidence. It is
separate from the owner's local-main merge decision; it authorizes no push,
hosted migration, deployment or production release.
