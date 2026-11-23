# Family membership foundation evidence

Date: 2026-11-23. Implementation in progress, not complete.

## Native/session compatibility

- Official registry metadata and actual installed `better-sqlite3@13.2.0`
  manifest show Node >=22, packaged platform prebuilds, only `node-addon-api`
  as a runtime dependency, and no install lifecycle script (`gypfile: false`).
- Added exact approved driver and `@types/better-sqlite3@9.6.0` using pnpm
  `--ignore-scripts`, then `pnpm install --frozen-lockfile`: exit 0. Existing
  `pnpm-workspace.yaml` lifecycle decisions are unchanged.
- `node --import tsx /tmp/family-foundation-probe.mts`: exit 0. The disposable
  script uses a test-owned temporary directory (removed in finally), performs
  a real native immediate transaction and query, backs up through SQLite's
  supported backup API, reopens the backup and checks its row count.
- The same probe imports the existing test-process-only Google transport,
  configures the actual pinned Better Auth handler with the reviewed additional
  field, initiates OAuth via a Request, passes its real state cookies through
  the signed Google token callback, collects the library's issued cookies and
  verifies them with `auth.api.getSession`. It asserts that
  `user.googleSubject === 'fixture-user'` and `user.id !== 'fixture-user'`.
  `input: true` and `returned: true` preserve the verified subject in JWE cache.
- Observed output: `PASS: native transaction, backup/restore; real Better Auth
  OAuth handler with signed provider fixture; verified subject survives
  encrypted session cache.` No production module imports this probe or fixture.
- `pnpm audit --json`: 0 high/critical, one existing moderate esbuild advisory
  under Drizzle Kit's old development loader. The advisory concerns esbuild's
  `serve` feature, which this application does not invoke. Retain the existing
  2026-12-07 review date; no forced upgrade or new advisory introduced.

## Persistence red/green

`node --import tsx --test tests/family/storage.test.ts` initially: 2 failed.
The schema assertion observed zero tables instead of the required three; the
explicit migrator did not exist. Red output: `/tmp/family-storage-red.txt`.

After implementing the schema and explicit migration/connection boundary,
`pnpm run db:generate` generated the initial reviewed SQL/journal/snapshot and
both storage tests passed. They exercise actual SQLite FK, unique, NOT NULL,
invitation-state and delete constraints, repeated migrations, WAL/foreign-key
settings and refusal to create missing/unmigrated runtime databases.

## Strict compatibility finding

`pnpm run typecheck` failed in Drizzle ORM 0.45.4 shipped declarations after
SQLite API imports activated their declaration graph. This is not an application
TypeScript error: examples include SQLite classes lacking declared `getSQL`
while implementing `SQLWrapper`, private-key generic constraints, and unrelated
unconditional `gel`/`mysql2` references. Full reproduction output is retained at
`/tmp/family-drizzle-typecheck.txt`. Latest stable official registry version is
0.45.4; `1.0.0-rc.6` is prerelease. Orchestrator and architect are diagnosing a
reviewed supported remedy. No strict checks, tests or declarations were weakened.
Do not treat foundation checkpoint A as complete until this is resolved.

Official sources: [Drizzle SQLite](https://orm.drizzle.team/docs/sqlite/get-started-sqlite),
[transactions](https://orm.drizzle.team/docs/transactions),
[Better Auth sessions](https://better-auth.com/docs/concepts/session-management),
[Next cookies](https://nextjs.org/docs/app/api-reference/functions/cookies),
and the pinned installed package declarations/metadata.

## Reviewed compatibility resolution

The approved `storage-compatibility.md` amendment retains exact generated SQL
and the public migration-file loader, using typed native queries instead of
the broken ORM declarations. Storage tests now pass 4/4, including changed
history, partial schema refusal, and transactional DDL/ledger rollback. Full
strict typecheck, lint and production build pass with no database/secrets.
Runtime verifies ordered hash/timestamp history and the full actual schema
against an isolated in-memory expectation; it never repairs persistent schema.
