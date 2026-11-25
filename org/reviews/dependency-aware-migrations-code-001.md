# Dependency-aware migrations — independent implementation review

- Reviewer: reviewer, independent of implementation and security writers
- Date: 2026-11-24
- Reviewed implementation: `ef5d85e3e97510b75748105879572a1530aa61f0`
- Includes implementation `84e5136`, committed-stage diagnostic correction `986531a`, and exact ledger-exclusion correction `ef5d85e`
- Verdict: **Approved for the reviewed local implementation; no unresolved code findings**
- Human merge/release gates remain closed; later review/evidence commits are audit-only.

## Correctness and architecture

`lib/db/migration-graph.ts` validates stable UUID/source/legacy identities,
explicit dependencies and cycles, and descriptor-bound independence declarations.
Planning depends on the applied set rather than sequence position. Compatibility
requires an exact approved applied-set profile independently of history.
`lib/db/migrate.ts:21` locks before decision reads, validates ledger safety and
the existing schema, then executes SQL, records and approved runtime grants in
one bounded transaction. Its final structural/security check precedes commit.
There is no backfill, renumbering or rewriting of existing historical rows.

The separation between bundled runtime metadata, explicit SQL loading/execution
and schema/security validation is appropriate for this SQL-first repository.
Pinned Drizzle public loading is retained; the current RC evaluation acknowledges
its useful branch tooling and measured limitations with our existing ledger.
No dependency upgrade or runtime ORM/schema-builder imports are introduced.
Finite profiles and explicit owner tooling keep the policy inspectable.

## Security and resolved review findings

`lib/db/validation.ts:65` checks actual ledger relations before reading their
rows. `lib/db/validation.ts:53` validates the native ledger and excludes only
its exact known kind/name members when present. Quoted indexes/tables and an
absent-ledger primary-key lookalike remain visible. The initial blanket-prefix
bypass and rewrite-rule bypass were reproduced independently and corrected;
security review records both closed findings and actual native-present/absent
retests. Unknown functions, triggers, rules, constraints, indexes, RLS/policies,
collations and privileges remain fail closed.

Role-qualified effective access, direct table/column/default ACLs, owner/schema
bindings and privileged membership are checked without granting runtime DDL or
ledger writes. Safe transaction-local search paths preserve pooled connection
support. Standalone reads and runtime validation are bounded read-only snapshots;
explicit owner tooling is never inferred from connection privileges. Runtime
errors stay generic. The explicit migration CLI now preserves fixed diagnostic
categories and distinguishes a committed transaction from later credential-smoke
failure, avoiding a misleading rollback claim.

## Verification assessed

Reviewed red-first evidence and the final command table in
`intent/dependency-aware-migrations/verification.md`; independently inspected the
final private logs' test totals and successful build/browser summaries. Required
lint, strict typecheck and build passed. The final suites report **293 Node tests
and 7 Python tests passed**, no failures/skips: migrations36, family34, menu69,
plans23, authentication16, deployment33 and recipe/photo82. Real Chrome menu QA
passed at mobile/desktop widths; eleven new screenshots preserve the new run
without overwriting historical screenshot evidence. Security independently ran
the final 36-test migration suite and additional actual SQL/driver probes.

I independently reran the pinned Drizzle experiment successfully during design
review. For test sensitivity, an owned temporary source mirror ran the native
identity test successfully, then disabled the descriptor-digest guard. The same
test failed with `Missing expected rejection` at the deliberate corrupt-digest
assertion. The mirror was restored and removed; the workspace source was never
modified. The unchanged guard remains at `lib/db/validation.ts:30` in this source.

Reviewed the adoption/troubleshooting documentation and the helper lint
amendment. The helper's exact original bytes and SHA remain available, historical
hash/review records are unchanged, and the new digest records only the removal
of an unused binding. Historical migration SQL, journal/checksum metadata,
lockfile, SQLite evidence and T-Rex/UI source are unchanged.

## Practical limits

A compatibility backport requires review for the exact older application,
including curation-aware meal-generation and suggestion/acceptance behavior;
changing its required-ID list alone does not make every historical binary safe.
Legacy dependency descriptors rely on reviewed source immutability; native
records additionally persist their descriptor digest. Migration SQL is trusted,
reviewed transaction-safe code, not arbitrary untrusted SQL in a sandbox.
Additional schema combinations or security object classes require new reviewed
contracts and regression evidence. Hosted behavior was not exercised and no
shared migration, hosted operation, application restart, push, merge or release
is authorized by this review. Recorded earlier fixture/denied-probe limitations
remain visible in the verification artifact rather than being erased.
