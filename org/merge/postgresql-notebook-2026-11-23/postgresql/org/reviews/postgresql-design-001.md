---
artifact: intent/postgresql-persistence/spec.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent PostgreSQL intent, specification and plan review

## Product gate

Intent accepted as product-manager under org/protocol.md. The delegated request expressly selects PostgreSQL for local development and the Vercel-compatible implementation, authorizes local setup/migration/testing, and excludes hosted provisioning, production configuration/migration, deployment, paid calls, merge and release. Intent captures these boundaries and preserves family/recipe guarantees. No product clarification is required. This is agent product acceptance, not human technical or release approval.

## Resolved design finding

- **Resolved [P1][Compliance/Bugs] Include runtime schema assets in the deployed function bundle.** `intent/postgresql-persistence/spec.md:19` requires runtime history/catalog checks. The existing implementation in `lib/db/connection.ts` reads migration files beneath `process.cwd()`; the new design retains this public loader. `next.config.ts:3` currently provides no output tracing includes, and plan manifest `:13-44` omits it. Vercel packages traced server files rather than the complete checkout, so a locally passing start can fail closed after deployment because SQL/journal/catalog assets are missing. Add explicit tracing for `drizzle/postgresql/**` and any separately stored expected signature, include `next.config.ts` in the manifest, and verify the built protected-route trace manifests contain those files. This is local build verification only, not permission to deploy. The author added the explicit `drizzle/postgresql/**` tracing and emitted `.nft` verification contract to spec `:9` and `next.config.ts` to the plan manifest before approval.

## Assessment of the remaining design

- **Transaction ordering:** spec `:17` obtains the same database-scoped transaction advisory lock before decision reads on the same checked-out connection. At READ COMMITTED, each decision query runs after lock acquisition with a fresh snapshot, preserving SQLite's existing serialized provisioning, pending-recipient checks, invitation consumption and rate-limit ordering across processes. This is a deliberate small-application throughput tradeoff; lock/query/idle timeouts, rollback and release still need real tests. No session advisory lock or snapshot captured before waiting is acceptable.
- **Roles and isolation:** spec `:7` separates setup administrator, migration owner, DML runtime and CREATEDB-only test role. Tests must prove runtime cannot perform DDL or create databases and test credentials cannot mutate development tables; ensure PUBLIC database/schema/table privileges do not undermine that isolation. Cleanup must be restricted to random database names generated and tracked by the current fixture, with verified role ownership and loopback host.
- **Migration integrity:** spec `:19` retains transactional DDL/history, exact ordered hash/timestamp prefix checks, complete schema verification, and failure rollback. Comparing a committed catalog signature avoids request-time schema creation. The signature should normalize database-dependent OIDs/names and include column nullability/types/defaults, FK/check/unique constraints, indexes and unexpected objects. Unknown or changed schema must fail closed without repair. Signature generation is an explicit development/test action.
- **Preservation:** spec `:23` narrowly records inspected checkout locations rather than claiming no SQLite data exists anywhere. No delete/import is automatic. Original SQL/journal remain evidence and existing files remain untouched. PostgreSQL is the sole new runtime path; restoration or transfer of subsequently identified SQLite data requires reviewed validation.
- **Compatibility:** spec `:11` does not assume SQLite ORM failures apply identically to PostgreSQL. It requires a fresh strict TS6 probe and explicitly rejects compiler weakening, vendor patches, unrelated optional drivers and prereleases. Independently reran the three-line `drizzle-orm/node-postgres` + `pg` Pool prototype with TypeScript 6.0.3, strict true and skipLibCheck false: 70 declaration errors, including `pg-core/query-builders/query.d.ts:23` where `PgRelationalQuery` implements `SQLWrapper` without `getSQL`, plus unrelated optional-driver and structural type errors. This independently establishes PostgreSQL ORM incompatibility for the pinned release, rather than inheriting the SQLite result. A separate typed `pg@8.23.1`/`@types/pg@8.23.1` PoolClient query with a bound `[string]` tuple, domain-row result and the public `drizzle-orm/migrator` loader compiled with the same flags: exit 0. Approve the native-pg/public-loader fallback under this new peer decision. Keep reviewed SQL as schema authority, strict checking unchanged and no extra drivers or vendor patches. Full database/application tests remain required.
- **Verification:** plan `:6-9,48-50` covers dialect/aliases/bigint handling, real HTTP/process races, constraint/rollback/tamper tests, persistent restart/backup restore, no paid credentials, 320/1440 fixture browser flows and existing build/regression checks. Preserve assertion strength while replacing SQLite-specific trigger/backup/timeout mechanics. Review actual outputs rather than reusing prior branch totals.

## Independently executed compatibility commands

```text
node_modules/.bin/tsc --ignoreConfig --noEmit --strict --skipLibCheck false --target ES2017 --module esnext --moduleResolution bundler --esModuleInterop --types node .data/drizzle-probe.ts
exit 2; 70 TS diagnostics (output independently captured in /private/tmp/postgresql-independent-drizzle.log)

node_modules/.bin/tsc --ignoreConfig --noEmit --strict --skipLibCheck false --target ES2017 --module esnext --moduleResolution bundler --esModuleInterop --types node /private/tmp/postgresql-independent-proof/native.ts
exit 0; typed native pg query plus public migration loader
```

TS6 first rejected explicit source arguments without `--ignoreConfig` (TS5112); reran with that required CLI flag. This affects only the isolated prototype command; repository tsconfig is unchanged. The native prototype imports Pool/PoolClient, reads the public migration-loader type, and returns `client.query<UserRow>(SQL, values)` with a bound `[string]` parameter tuple. No DB request is made by the compile-only proof.

## Scope and next gate

Read AGENTS.md, org protocol/chart/reviewer role and idle reviewer status, REVIEW.md, the new intent/spec/plan, historical storage compatibility and independent review, current connection/migration/identity/family/invitation code, Google admission policy, next.config.ts and Vercel ignore/deployment constraints. No application implementation, dependencies, software/service configuration, database or production setting was changed by this reviewer. Only this review record, artifact status lines and isolated temporary compatibility probes were written. Intent accepted; specification and plan approved under the org peer gates after the tracing correction. Runtime asset inclusion and privilege boundaries remain required executable acceptance checks, not deferred work. Human merge/release gates remain closed.

## Native Homebrew amendment — independently approved

Rafael subsequently selected native Homebrew PostgreSQL to avoid Docker VM memory use. Reviewed the revised spec `:7` and plan `:6`: use the keg-only `postgresql@17` formula, dedicated private cluster beneath `~/Library/Application Support/MealPlanner/postgresql-17`, explicit `pg_ctl` start/stop, no `brew services` registration, loopback-only TCP, protected Unix socket directory, SCRAM host authentication and separate setup/migration/runtime/test roles. This supersedes only the original Docker mechanism; transaction, schema, compatibility, authorization, preservation and verification decisions stand. No container/volume/database was created during the initial Docker evaluation, as reported by the implementation owner.

Approve this amendment under the same independent peer design/plan gate. The dedicated cluster must initialize with SCRAM for TCP and local sockets, password read from a mode-0600 file, mode-0700 owned data/socket directories, and a private ownership marker checked before later `pg_ctl` actions. Installation may create Homebrew's default cluster; record that installer side effect and leave that cluster unused and unmodified by application scripts. Never start a default/global service or remove unrelated Docker resources. Test backup/restore uses versioned native tools with passwords in private environment/files, never command arguments.

Primary sources checked during this review: [PostgreSQL 17 initdb](https://www.postgresql.org/docs/17/app-initdb.html) documents `--pwfile` and explicit SCRAM authentication; [creating a cluster](https://www.postgresql.org/docs/17/creating-cluster.html) recommends secured data permissions and SCRAM rather than default trust; [local server spoofing protection](https://www.postgresql.org/docs/17/preventing-server-spoofing.html) explains a protected Unix socket directory; [Homebrew formula](https://formulae.brew.sh/formula/postgresql%4017) states keg-only installation and default-cluster creation. Proposed dedicated socket pathname is 88 bytes and fits the macOS Unix-domain socket path limit. Actual native setup/start/stop/persistence/privilege checks remain implementation evidence, not claims of this design review.

Implementation note relayed to the author: grant runtime DML only on domain tables and SELECT on the migration ledger; do not inadvertently grant ledger writes through broad default/ALL TABLES permissions. Preserve private-file permissions on reruns and validate cluster ownership before control actions. These are concrete checks of the approved restricted-role/owned-resource contract, not expanded product scope.
