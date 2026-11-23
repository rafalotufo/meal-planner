# PostgreSQL strict driver compatibility

Date: 2026-11-23. Existing strict TS6.0.3 configuration retained.

Tested public `drizzle-orm/node-postgres` with the pinned stable 0.45.4 and exact pg/@types/pg 8.23.1. An isolated file importing drizzle and constructing drizzle(new Pool()) produces **70** declaration errors, including structural SQLWrapper/getSQL failures, beyond missing optional gel/mysql2 declarations. No supported stable fixed version was established; no prerelease or compiler workaround is introduced.

Reproduction: create a temporary TypeScript file in this checkout importing `{ drizzle }` from `drizzle-orm/node-postgres` and `{ Pool }` from `pg`, then `export const db = drizzle(new Pool())`. Run:

```sh
node_modules/.bin/tsc --ignoreConfig --noEmit --strict --skipLibCheck false --esModuleInterop --target ES2017 --module esnext --moduleResolution bundler --types node .data/drizzle-probe.ts
```

This explicit isolated command uses --ignoreConfig only because TS6 requires it when supplying a filename; it does not alter application tsconfig or omit library checking. Actual exit 2. Examples:

```text
gel-core/query-builders/query.d.ts(23,22): error TS2420: Class 'GelRelationalQuery<TResult>' incorrectly implements interface 'SQLWrapper'.
mysql-core/query-builders/delete.d.ts(36,22): error TS2420: Class 'MySqlDeleteBase<TTable, TQueryResult, TPreparedQueryHKT, TDynamic, TExcludedMethods>' incorrectly implements interface 'SQLWrapper'.
mysql-core/query-builders/select.d.ts(294,244): error TS2344: Type 'string' does not satisfy the constraint 'keyof this & string'.
mysql-core/query-builders/select.d.ts(320,247): error TS2344: Type 'string' does not satisfy the constraint 'keyof this & string'.
mysql-core/query-builders/select.d.ts(346,248): error TS2344: Type 'string' does not satisfy the constraint 'keyof this & string'.
```

An independent isolated file importing Pool from pg and readMigrationFiles from drizzle-orm/migrator passed the identical strict command, exit 0. Use this supported native pg interface with typed bound SQL and the existing public migration loader. Preserve SQL schema as source of truth; no runtime ORM/table-builder imports, unrelated optional drivers, vendor patches, ambient substitutions, any casts or check suppression.

Primary references: [Drizzle PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql), [migration approaches](https://orm.drizzle.team/docs/migrations), [node-postgres transactions](https://node-postgres.com/features/transactions), [PostgreSQL 17 transaction locks](https://www.postgresql.org/docs/17/explicit-locking.html). Independent gate: org/reviews/postgresql-design-001.md.
