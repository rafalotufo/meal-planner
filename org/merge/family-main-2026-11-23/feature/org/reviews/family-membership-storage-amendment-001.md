---
artifact: intent/family-membership/storage-compatibility.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent storage compatibility amendment review

## Verdict

Approved as a narrow technical compatibility amendment under the org spec/plan
peer-review authority. The reconciled specification and plan preserve the
approved product, schema, authentication and deployment behavior while replacing
the incompatible ORM declaration entry points with the already-approved typed
native SQLite driver and public migration-file loader. No blocking finding.

This is independent peer approval of revised tooling, not a claim that Rafael
approved that tooling. Original human approvals remain historical evidence.
Record this current amendment decision and update its pending status before
resuming the affected implementation slice; do not reuse an older artifact's
approval as approval of these revised files. Human merge/release and production
migration authorization remain unchanged.

## Evidence and assessment

- **The compatibility failure is reproducible and structural.** Independently
  reran `node_modules/.bin/tsc -p
  /tmp/family-native-proof/tsconfig.drizzle.json`: exit 2, with errors in the
  pinned ORM's published declarations, including missing `getSQL` contracts,
  generic constraint violations and unrelated optional-driver references. This
  supports `storage-compatibility.md:9`; installing unrelated drivers would not
  repair the structural errors.
- **The proposed public surface compiles under strict checks.** Independently
  reran `node_modules/.bin/tsc -p
  /tmp/family-native-proof/tsconfig.json`: exit 0 with `strict: true`,
  `skipLibCheck: false` and `noEmit: true`. Inspected public
  `drizzle-orm/migrator.d.ts` and its implementation: it returns ordered SQL,
  timestamp and SHA-256 hash metadata without importing the broken SQLite ORM
  declaration graph. The approved existing versions remain unchanged.
- **The native prototype demonstrates the relevant primitives.** Independently
  ran `node --import tsx /tmp/family-native-proof/proof.ts`: exit 0, output
  `native proof: exact schema migration, parameter binding, immediate transaction rollback, uniqueness and foreign-key checks passed`.
  Inspected that prototype: it loads this feature's generated migration,
  round-trips a SQL-looking bound value, checks uniqueness rollback removes a
  newly inserted family, and rejects a missing-family foreign key. This is
  bounded compatibility proof, not completed application validation.
- **DAL safety and transactional behavior are retained.**
  `storage-compatibility.md:36` requires typed bind tuples/domain rows and bound
  external values, with authorized family predicates. Spec `:77` and `:125`
  reconcile native statements/immediate transactions; plan `:68` and `:108`
  reconcile the implementation approach and interfaces-only schema types.
  There is no raw request SQL, ambient shim, suppression, excluded source,
  unchecked `any`, extra database engine or prerelease escape hatch.
- **Migration integrity remains explicit.** Amendment `:49`, spec `:402` and
  plan `:117` require exact ordered applied-prefix validation by hash/timestamp,
  immediate transactional DDL/history writes, no-op repetition, complete failure
  rollback and fail-closed runtime verification of complete history/schema.
  Unknown, changed, extra or reordered history cannot silently qualify as
  migrated. Those requirements still need executable regression proof during
  Build; a migration loader alone is not treated as sufficient validation.
- **Schema tooling is reconciled without duplicate authority.** Amendment
  `:40`, spec `:375` and plan `:92` make reviewed SQL the schema source of truth,
  retain initial journal/snapshot audit artifacts, and require reviewed SQL/journal
  changes thereafter. The new generator/config is removed from the amended
  plan manifest; no untypechecked executable table-builder schema is retained.
  Tests remain strict TypeScript against real SQLite and temporary files.

## Scope and limits

Read the amendment, foundation evidence and final reconciled spec/plan delta;
inspected and reran the isolated strict/native prototypes above. Only this
review record was written. No application source, dependencies, plan/spec,
schema, messages, workflow state or approval ledger was modified by this
reviewer. Full application typecheck/build, migration tampering/rollback/history
tests, auth/family HTTP tests, browser verification and final independent
code/security review remain required. No production database, live Google flow,
merge or release was executed or claimed.
