---
artifact: intent/postgresql-persistence/hosted-setup.md
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: approved
round: 1
---

# Independent final hosted PostgreSQL configuration review

Approved the completed, explicitly authorized hosted database/configuration handoff, stopping before deployment. No Important finding remains. This approval covers the named new Neon resources, restricted SQL roles, reviewed initial migrations and two Vercel database variables; it does not approve a merge, release, app deployment/promotion, future migration, paid feature or local-data transfer.

Read the owner-authorized `hosted-setup.md`, sanitized resource/Vercel metadata, operational plan/helper reviews, hosted verification evidence, provisioning helper and connection/migration/catalog modules, plus README/AGENTS diffs. Applied the installed Neon parent/PostgreSQL skills and the repository security-review standards. The completed implementation loop and historical approvals remain distinct from the new database-configuration authorization.

## Independently verified live database state

Used only read-only SELECT statements through the connected Neon `run_sql` tool, always supplying the explicit project, branch and database. No private connection string, password-bearing role API, private file contents, remote write, fixture mutation, migration or deployment was used by this reviewer.

| Environment | Project / branch | Database | Result |
| --- | --- | --- | --- |
| Preview | withered-night-50194672 / br-dark-term-bbqhnxi5 | meal_planner | All checks below pass |
| Production | plain-pond-82425009 / br-wild-dust-bbr2mvzw | meal_planner | All checks below pass |

Observed identically on both, with no truncated query result:

- Actual server version `17.12 (4d8000a)`.
- `mp_migrator` and `mp_runtime`: superuser, CREATEDB, CREATEROLE, replication and BYPASSRLS all false; total direct role memberships zero, and neither has Neon superuser USAGE.
- Exactly four public tables: `__drizzle_migrations`, `app_users`, `families`, `family_invitations`; all owned by `mp_migrator`. Database owner remains `neondb_owner`; public-schema owner remains `pg_database_owner`. Migrator schema CREATE is true; database CREATE is false.
- Runtime CONNECT/schema USAGE/ledger SELECT are true; database CREATE, schema CREATE and TEMP are false. Every SELECT/INSERT/UPDATE/DELETE grant across all three domain tables is true (all twelve individually checked). TRUNCATE/REFERENCES/TRIGGER are false across those tables. All six non-SELECT ledger privileges are false, and runtime has zero grant-option entries.
- PUBLIC has zero explicit database or public-schema ACL grants. Runtime has no privileged role inheritance or table/schema/database ownership path.
- Ledger contains precisely initial version id0, timestamp1795450000000, SHA-256 `22463e304a25ab4d43ded59a017f476ffc651e37f9c966903cc1bcc934afb597`. Independently computed the committed SQL file hash and read the journal; both match these live rows.
- Independently executed the application's exact catalog-signature SELECT and compared its structured result to the committed catalog JSON: **51 rows, exact JSON equality in each environment**. This checks columns/defaults/nullability, constraints, indexes, relations/RLS, policies, functions and noninternal triggers without regenerating the signature from the hosted database.
- Families, app_users and family_invitations each contain **zero rows** in both environments. The verification left no application or invitation data.

These checks independently establish actual authorization/schema/empty-data state. They do not claim a deployed application can connect to these resources, nor do they inspect passwords.

## Helper, TLS and secret scope

The current helper `scripts/postgres-hosted.ts:29-55` binds its action/environment and private bootstrap metadata to the recorded new project/branch/database/endpoint. The pooled-default bootstrap correction at `:39-42` normalizes only the exact recorded `-pooler` counterpart, then reasserts the direct host, database and bootstrap role; it does not accept arbitrary replacement endpoints. Migration uses the direct restricted owner URL; runtime uses its own paired pooler URL and the unchanged strict verify-full validator.

Provisioning remains explicit operator work (`:56-85`), outside application startup/build. SQL identifiers are fixed, password literals are validated distinct 64-character hex values, role creation and initial ACL changes are transactional, and the reviewed migration/history/catalog code remains authoritative. The verify path uses SELECT/catalog reads and connection opening; it cannot reset/drop data or rotate existing passwords. Current exact live role/ACL checks above agree with the helper's assertions.

The helper checks an encrypted, authorized client TLSSocket, rather than incorrectly treating the provider's backend pg_stat_ssl state as client TLS. The implementation operator records successful direct/pooler TLS1.3 checks and four cross-environment password denials in `postgresql-hosted-verification.md`; those connection/password checks are attributed to the operator, because this reviewer intentionally did not retrieve credentials or open private connection files.

Read-only filesystem metadata inspection found `.data` and `.data/neon` owned by Rafael and mode0700; both environments' bootstrap JSON, restricted credential JSON and env files are regular, owned, non-symlink mode0600 files. Contents were not read. Nonsecret helper/log artifacts reside within the same private directory. Code enforces private physical paths, exclusive creation and atomic environment-file replacement, and prints only sanitized resource/status output or stage/error code. No secret value is present in the committed resource/Vercel metadata or this review.

Independently compiled the hosted helper without running it:

```text
node_modules/.bin/tsc --ignoreConfig --noEmit --strict --skipLibCheck false --esModuleInterop --target ES2017 --module esnext --moduleResolution bundler --types node scripts/postgres-hosted.ts
exit 0
```

## Vercel evidence and boundaries

The sanitized metadata identifies the expected existing project `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V` in `team_2c0O29FMb91g7L6sUChc9v6J`, region iad1, Fluid enabled and no Git integration. It records only these additions:

- Production sensitive DATABASE_URL, id `pN63ajycny5Idgop`, target `[production]`.
- Preview sensitive DATABASE_URL, id `RvnMxcTUzEgVCGZ7`, target `[preview]`.

No Development variable or migration/bootstrap credential was added; the original eight environment-variable IDs are retained. The operator's recorded stdin-input validation binds each sensitive value to its environment's distinct restricted pooled URL. Vercel does not permit reading back sensitive values; this review therefore assesses that binding from the scoped helper/transfer procedure, live restricted database state and recorded successful CLI/target/type evidence, not from a secret-value readback or an independent Vercel API call.

The before/after verification record and sanitized metadata retain active production deployment `dpl_GP3AMEcqCP7A3NGemnEc1hYZQWHB` and the same two deployment-list IDs, including `dpl_EcA6U69yZuKmV1YpzbfFpUHwzGXQ`. No deploy/promote command is in the provisioning helper. The documented evidence supports configuration without deployment; no old release authority is reused. Free-plan/fixed0.25CU/region settings and CLI operation results are attributed to the operator's observed setup evidence, whereas the live SQL facts above were independently queried.

README/AGENTS correctly preserve native local development, separate hosted environments, private migration credentials and fresh future action gates. They explicitly state that Preview still needs its own authentication/OAuth configuration, the Vercel application has not been deployed or verified against these databases, and Fluid pool-lifecycle integration/backup recovery need pre-release review. These are stated future deployment prerequisites, not incomplete work inside this setup-only authorization. The existing user development `next-env.d.ts` diff remains outside this review's changes and should remain unstaged by the operational commit.

The implementation operator reports clean-export frozen installation, lint, strict typecheck and build success; no second build or user's development server interaction was performed by this reviewer. Only this final review record was written. Stop before deployment remains in force.
