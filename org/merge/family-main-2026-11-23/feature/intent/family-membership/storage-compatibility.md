# Family storage — strict declaration compatibility amendment

- Author: architect
- Date: 2026-11-23
- Status: Approved — independent peer review under `org/protocol.md`; see
  `org/reviews/family-membership-storage-amendment-001.md`

## Evidence and decision

Importing the public `drizzle-orm/better-sqlite3` entry point from the pinned
stable `drizzle-orm@0.45.4` exposes 70 declaration errors under the existing
TypeScript 6.0.3, `strict: true`, `skipLibCheck: false` configuration. An isolated
file containing only that import, a native database import and `drizzle(...)`
reproduces the problem; it is not caused by family schema/application logic.
The installed SQLite relational-query declaration implements `SQLWrapper` but
omits `getSQL`, and select declarations also violate their own class contracts.
Missing optional `gel`/`mysql2` types are only part of the failure, so adding
unrelated database drivers does not resolve it. The upstream
[open declaration-checking issue](https://github.com/drizzle-team/drizzle-orm/issues/5187)
reports the same structural category on TypeScript 5.9.3, supporting that this
is not solely a TS6 compiler regression. No supported stable fixed release or
working ORM driver entry point was established; current newer releases are
prereleases, which do not meet this repository's stable-version policy.

Use the already-approved native `better-sqlite3@13.2.0` directly for this small
family data layer, with the already-pinned `@types/better-sqlite3@9.6.0`.
Keep existing Drizzle dependencies and generated SQL/journal/snapshot artifacts;
retain only the public `drizzle-orm/migrator` loader for reading migration SQL,
ordered metadata and SHA-256 hashes. Its self-contained declarations pass
strict checking without pulling the broken ORM type graph. No package version,
database engine, schema constraint, public service API or authorization rule
changes. No compiler suppression, exclusion, vendor patch, ambient replacement,
unchecked `any`, extra database driver or prerelease is introduced.

## Implementation contract

- Replace runtime ORM/table-builder imports with small domain row interfaces
  and `Database.prepare<BindTuple, Row>()` statements. Bind every external value;
  never interpolate an email, token, subject, ID or other request value into
  SQL. Keep the authorized family predicate in every relevant statement.
- Preserve the exact reviewed SQLite tables/indexes/checks/FKs in the committed
  initial SQL migration. That SQL is now the schema source of truth; do not
  keep a second unchecked executable table-builder schema. Remove the newly
  proposed ORM generation script/config rather than exclude them from checks.
  Future schema changes use explicitly reviewed SQL migrations and journal
  updates, with fresh-database and upgrade tests.
- Use short synchronous `database.transaction(callback).immediate()` operations
  for provisioning, acceptance, creation and metadata changes. Preserve WAL,
  FK enforcement, timeout, one-host deployment and all approved race checks.
- Reuse public `readMigrationFiles`, not an import of the ORM SQLite migrator.
  In one immediate migration transaction, create/check `__drizzle_migrations`,
  require applied rows to be an exact ordered prefix of repository migrations
  by hash and migration timestamp, apply missing trusted SQL statements, then
  append the matching hash/timestamp rows. Unknown, reordered, changed or extra
  applied versions fail closed. A repeated migration is a no-op; any failure
  rolls back DDL and ledger writes together. Do not execute user-supplied SQL.
- Runtime opening verifies the complete expected migration history and required
  schema before serving, without applying/repairing schema on requests. Keep
  the existing schema/constraint tests; add migration tampering, repeat, rollback
  and unavailable-storage tests. Preserve full strict typecheck and production
  build verification for the application after this narrow change.

## Independent prototype

An isolated `/tmp/family-native-proof/` prototype used the installed native
driver, public migration-file loader and this feature's exact initial generated
SQL. TypeScript checked it with target ES2017, module ESNext, bundler resolution,
Node types, `strict: true`, `skipLibCheck: false`, and `noEmit: true`.

Commands and actual results:

```text
node_modules/.bin/tsc -p /tmp/family-native-proof/tsconfig.drizzle.json
70 error TS diagnostics in published Drizzle declarations (isolated ORM import)

node_modules/.bin/tsc -p /tmp/family-native-proof/tsconfig.json
exit 0 (native driver plus public migration loader)

node --import tsx /tmp/family-native-proof/proof.ts
native proof: exact schema migration, parameter binding, immediate transaction rollback, uniqueness and foreign-key checks passed
exit 0
```

The prototype round-tripped an SQL-looking lowercase bound value without
executing it, and proved duplicate-subject insertion rolls back a newly created
family and a missing-family FK denies insertion. Its first deliberately
SQL-looking value contained uppercase text and was correctly rejected by the
existing normalized-email check; the successful injection-binding probe used
lowercase to satisfy that independent constraint. This is a compatibility
prototype, not application validation or evidence of completed family behavior.

Primary API sources: pinned
[native statements/transactions](https://raw.githubusercontent.com/WiseLibs/better-sqlite3/v13.2.0/docs/api.md),
[Drizzle migration-file loader](https://raw.githubusercontent.com/drizzle-team/drizzle-orm/0.45.4/drizzle-orm/src/migrator.ts),
and [SQLite transaction semantics](https://www.sqlite.org/lang_transaction.html).
Inspected installed `drizzle-orm/migrator.d.ts` and
`@types/better-sqlite3/index.d.ts` to verify the exact public contracts.
