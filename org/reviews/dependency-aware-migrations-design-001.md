# Dependency-aware migrations — independent design and plan review

- Reviewer: reviewer (independent of architect and implementation writer)
- Date: 2026-11-24
- Reviewed source: `c00be7b85d39bb79ac8aaec2f16ed3718358c09c`
- Artifacts: `intent/dependency-aware-migrations/{intent,spec,plan,tooling-assessment}.md`
- Verdict: **Approved for local implementation and disposable verification**

## Bugs and architecture

The design separates immutable migration identity and dependency history from
application compatibility. Fixed UUID aliases preserve every original legacy
ledger tuple; a lazily created append-only native ledger supports future UUID
records without rewriting historical entries. The exact applied-set profiles,
explicit digest-bound independence approvals and pre-migration catalog check
prevent timestamps, source hashes or apparently disjoint SQL from becoming
implicit compatibility authority. Missing prerequisites, cycles, collisions,
changed source and unsupported combinations have defined fail-closed outcomes.

Initial review requested preflight validation of the actual partial schema,
explicit owner-only tooling mode, protected search-path order, representative
older application operations, and same-transaction privilege verification.
The architect resolved these in the reviewed specification: finite intermediate
states precede pending SQL; strict runtime is the default; pg_catalog precedes
public and pg_temp is explicit last; older-profile proof performs bound reads
and writes; effective target-role checks occur before commit. An optional later
connection smoke carries no impossible postcommit rollback claim.

## Security

The proposed contract covers constraints and indexes including state, relation
ownership, triggers and enabled state, function definitions/attributes/ACLs,
RLS flags and policies, table/column grants, schema access, effective privileges
and runtime role attributes/membership. Ledger security is validated explicitly.
Unknown effects cannot disappear through blanket catalog exclusions. Trusted
compatibility reaches an older application only by reviewed source backport,
rebuild and restart; a database hash or environment flag cannot authorize it.
Read-only repeatable-read runtime validation cannot migrate or expose diagnostic
reason codes; explicit tooling retains advisory locking, bounded timeouts,
verified remote TLS and distinct credentials.

## Tooling and evidence

Independently inspected pinned Drizzle's public dialect implementation: its
latest-created_at filter omits earlier missing work and does not check a reused
timestamp's different hash. Independently reran
`node --import tsx --test tests/migrations/drizzle-prototype.test.ts` with local
test-database access: **1 passed, 0 failed**, owned database cleaned up. The first
sandboxed attempt was denied loopback access; the successful rerun used the
same test, not relaxed assertions.

Checked official Drizzle `upgrade-v1` and `drizzle-kit-check` documentation.
Architect's recorded exact RC6 experiment tests generated conflicting histories,
independent histories in both orders, repeated execution, and direct rejection
of this repository's custom integer-primary-key legacy ledger. RC6's successful
missing-name execution is acknowledged. Retaining stable supported SQL loading
while implementing the missing explicit policy is justified by SQL-first
architecture, immutable existing records, absent generated snapshot chain and
the RC's inability to establish this application's security contract. No package
upgrade or application behavior has been approved merely from a documentation
claim.

## Compliance and remaining gates

The plan requires failing strict TypeScript tests before implementation, native
and legacy order/rollback/concurrency proof, malicious catalog/permission cases,
packaged read-only runtime and sanitized HTTP evidence, all required checks,
updated adoption/troubleshooting instructions, and independent code/security
review. These are implementation exit criteria, not claimed completed here.
No unresolved design findings remain. Shared development remains read-only;
no hosted action, migration of shared data, push, merge or release is authorized.
