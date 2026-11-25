# Dependency-aware migrations — intent

- Owner: Rafael; date: 2026-11-24
- Status: Accepted for Design by product-manager; independent spec/plan approval precedes behavior changes
- Source: owner's detailed request in the active chat
- PM acceptance: `org/reviews/intent-dependency-aware-migrations-001.md`

Compatible branches should share native local PostgreSQL when independent,
explicitly reviewed migrations have been applied in different orders. Replace
position-based migration identity with stable unique IDs and immutable checksums,
explicit dependencies and reviewed independence. Keep required application schema
and security validation separate from migration history, and fail closed for
unknown or unexplained changes. Additional applied migrations require trusted
versioned compatibility metadata backported through review, never trust derived
only from a database checksum.

Preserve every existing historical ledger row and application datum. Keep
execution explicit, atomic, bounded and advisory-locked, with verified remote TLS
and separate owner/runtime credentials. Startup, builds, requests and session
reads never migrate. Provide sanitized operator diagnostics while runtime users
continue receiving only generic storage failures.

Evaluate current Drizzle tooling, SQL-first fit, release stability and ledger
transition before deciding on custom dependency tracking. Prototype branching
and out-of-order behavior on owned disposable databases. Write failing strict
TypeScript regression tests before behavior changes, cover migration ordering,
concurrency, rollback, checksum/identity/dependency faults, older applications and
actual catalog/privilege/security drift, then complete required checks and
independent code/security review. Update setup/troubleshooting and give exact
local adoption steps.

The reported starting state was checkout migrations0000–0003 against a database
also containing0004/menu_recipe_curations. This checkout actually contains all
five SQL migrations. Read-only local diagnosis on2026-11-24 observes historical
IDs0–4 and that curation table. Exercise the older checkout as a deliberate test
profile rather than pretending this checkout reproduces that exact file state.

Shared development diagnosis is read-only; migration experiments and verification
use owned disposable databases and the restricted test role. Preserve unrelated
changes including T-Rex refinements. No shared development migration, hosted
database access, data reset/import/removal, deployment, push or merge is authorized.
Finish at reviewed implementation with evidence and human merge/release gates.
