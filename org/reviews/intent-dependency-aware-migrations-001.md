# Dependency-aware migrations — PM intent review

- Reviewer: product-manager
- Date: 2026-11-24
- Artifact: `intent/dependency-aware-migrations/intent.md`
- Source: owner's detailed dependency-aware migrations request in this chat
- Verdict: Accepted for Design; independent specification/plan review required before behavior changes

The requested outcome is clear: compatible development branches should share a
local PostgreSQL database despite explicitly reviewed independent migrations
having been applied in different orders. Today an exact linear history and
catalog match prevents that use. Acceptance must retain fail-closed behavior for
unknown identities, checksums, effects and security changes. Creating an extra
table alone is insufficient evidence of compatibility.

The owner supplied the required product decisions and constraints. Use stable,
unique migration identities and immutable checksums, explicit dependencies and
reviewed independence, and preserve existing applied records and data. Separate
history validation from schema compatibility. An older branch needs a trusted,
reviewed compatibility backport containing identity, checksum and effect/security
evidence; a checksum observed in the database cannot authorize itself. Keep
execution explicit and transactional with advisory locking, bounded timeouts,
verified remote TLS and separate migration/runtime credentials.

The architect must evaluate current supported Drizzle tooling before selecting
custom dependency tracking. Disposable-database prototypes must test branch
conflicts and out-of-order execution, with release stability, legacy-ledger
transition and SQL-first fit included in the decision. The product requirement
does not mandate a dependency upgrade or a custom migration engine.

Tests must first demonstrate the missing behavior in strict TypeScript, then
prove equivalent validated schemas for both approved independent orders,
dependency ordering, repeated/concurrent safety, atomic rollback and rejection
of checksum changes, identity collisions, unknown additions and incompatible
changes. Include actual triggers, functions, constraints, grants and RLS. Prove
an older compatible application's read-only runtime can use an approved newer
database without exposing internal diagnostics. Complete required repository
checks and independent implementation/security review, and document exact
local adoption and troubleshooting steps with actual evidence and limitations.

Current checkout inspection finds `0004_recipe_url_curation.sql` already present,
unlike the reported older-checkout starting point. Preserve that fact in the
diagnosis and exercise an explicit older application profile in regression
coverage. This changes the reproduction setup, not the requested outcome.

There is no product ambiguity requiring CEO escalation. The repository org
protocol assigns specification and plan approval to independent peer review;
this acceptance permits Design and does not approve an unreviewed design.
Preserve unrelated work, including T-Rex refinements. Shared development database
diagnosis is read-only. No shared database migration, hosted database access,
data reset/import/removal, deployment, push or merge is authorized. Finish at
the reviewed implementation and human merge/release boundary.
