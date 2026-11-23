---
artifact: scripts/postgres-hosted.ts
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent hosted provisioning-helper review

Approved the concrete `scripts/postgres-hosted.ts` implementation for the owner-authorized, separately reviewed operations plan. Read the script, the current hosted resource map, existing connection/catalog/migration modules, approved hosted plan and native/hosted boundary records. No remote SQL, connection, provisioning, role/configuration change, credential read, deployment, application edit or test-data mutation was performed by this reviewer.

## Scope and target binding

The current resource map records Preview as `meal-planner-preview`, project `withered-night-50194672`, branch `br-dark-term-bbqhnxi5`, database `meal_planner`, endpoint `ep-wandering-breeze-bbtscekj.c-15.us-east-1.aws.neon.tech`. The script validates the environment enum, action enum, expected project name/database/region-host suffix, bootstrap environment/project/branch/host metadata, exact connection hostname/database and expected bootstrap role before connecting. These checks bind the private connection to the recorded new resource and prevent accidental local/other-environment execution. Production is not yet present in the reviewed map: it must be populated from the newly created project's observed metadata and checked for distinct project/branch/endpoint/credentials before its execution. This approval does not invent or approve unknown resource IDs.

Provisioning checks the public table set and requires it empty on first credential creation. A role-name collision fails on that first attempt. SQL targets and identifiers are fixed; generated password values are validated as distinct 64-character lowercase hex before SQL literal construction. No arbitrary user/database input is interpolated into SQL. Role creation and initial PUBLIC revocations/grants run in a transaction with the migration advisory lock. Errors roll back that transaction. Later migration failure leaves newly scoped roles/resources intact for truthful partial-progress reporting rather than performing destructive cleanup.

## Least privilege and migration behavior

`mp_migrator` and `mp_runtime` are SQL-created LOGIN roles with no superuser, CREATEDB, CREATEROLE, REPLICATION or BYPASSRLS attributes. Both have zero role memberships; explicit checks additionally exclude privileged Neon/bootstrap inheritance. The migrator receives USAGE/CREATE in `public` and owns only the four tables it creates; it need not own the database or schema. The runtime receives CONNECT/USAGE, four DML privileges on each of the three domain tables, and SELECT-only migration history. It has no schema/database CREATE and no migration-history write/TRUNCATE privilege. No bootstrap password, account authentication setting or existing unrelated resource is changed.

This table-owning migrator is a narrower implementation of the plan than database/schema ownership; the plan wording was corrected accordingly. Actual provisioning/migration uses the existing reviewed SQL loader/transaction/history/catalog checks through the direct role URL. Runtime URL construction selects the matching pooled endpoint; `validateMigrationPair` checks the paired database/port and separate roles. No startup/build migration, Vercel invocation, provider call or deployment exists in this helper. Unknown schema differences remain fatal; the helper does not rewrite the committed catalog signature.

The `verify` action contains only remote SELECT/catalog reads and authenticated connection opening. It does not create/drop a table, mutate data or alter grants. Production verification can therefore be performed without application rows. The script asserts all three domain counts remain zero and exact ownership of all four reviewed tables. It validates both direct-owner and pooled-runtime schema/history. It does write a local private environment file after successful checks; that is not a remote mutation.

## Resolved review finding and secret controls

The original `domain_access` check used a comma-separated `has_table_privilege` list for one table. PostgreSQL treats that list as OR, which proved any one privilege rather than all four. The corrected code uses `bool_and` over the three tables crossed with the four single privileges; it now establishes all twelve required grants. The negative migration-history comma list is intentionally correct: false denies every listed write privilege. Primary reference: [PostgreSQL 17 privilege inquiry functions](https://www.postgresql.org/docs/17/functions-info.html).

Both role-attribute sets, zero memberships and exact four-table ownership are now checked. Private input/output paths require an owned non-symlink physical `.data/neon` directory with 0700 permissions, owned regular non-symlink files with 0600 permissions, and validated destination paths. New credential files use exclusive 0600 creation; environment output uses a random exclusive 0600 sibling followed by rename. Output prints sanitized environment/resource/verification metadata only. Errors print stage plus code and omit connection details, SQL/passwords and diagnostic bodies. The operator's bootstrap transfer remains outside this helper and must retain the approved no-echo stdin mechanism, never argv.

Client-side TLS verification is checked using the actual authorized encrypted TLSSocket for bootstrap and pooled runtime connections. A proxy's backend `pg_stat_ssl=false` is not evidence against the client-to-Neon TLS connection and must not motivate disabling verification. The configured URLs still pass the unchanged strict `sslmode=verify-full` validator.

## Independent local checks and remaining execution evidence

Ran the following on the reviewed script, without executing it:

```text
node_modules/.bin/tsc --ignoreConfig --noEmit --strict --skipLibCheck false --esModuleInterop --target ES2017 --module esnext --moduleResolution bundler --types node scripts/postgres-hosted.ts
exit 0
```

Diff whitespace check passed. Read the installed skill files `/Users/rafael/.codex/plugins/cache/openai-curated-remote/neon-postgres/3.0.10/skills/neon-postgres/SKILL.md` and its required parent `.../skills/neon/SKILL.md`. This review does not claim the remote helper has run or succeeded. The orchestrator must record actual Preview and Production migration/role/schema/TLS/isolation results and independent final configuration evidence. New Production mapping must be checked when available. Vercel sensitive-variable setup remains a separate scoped action; current deployment identity must remain unchanged. Human merge/deployment/release gates remain closed.

## Final reviewer-role handoff assessment

The review-queue artifact **`postgresql-hosted-setup` is approved** for this completed setup-only handoff. Re-read `org/reviews/postgresql-hosted-verification.md`, both entries in `hosted-resources.json`, sanitized `hosted-vercel-metadata.json`, independent security assessment `postgresql-hosted-final-001.md`, the final provisioning helper, and scoped README/AGENTS changes. The previously pending Production target is now recorded as project `plain-pond-82425009`, branch `br-wild-dust-bbr2mvzw`, database `meal_planner`, endpoint `ep-lively-tooth-bbi1n111.c-15.us-east-1.aws.neon.tech`; it is distinct from the checked Preview project/branch/endpoint and agrees with the operator's observed resource mapping and security review's explicit live database targets.

The final helper's bootstrap normalization accepts only the exact recorded pooled counterpart and restores its paired direct host before reasserting project/branch/host/database/bootstrap-role binding. It does not allow arbitrary hostname substitution or relax TLS validation. Runtime and migrator URLs still use distinct roles and unchanged verify-full validation; remote verification remains read-only. No new provisioning or verification blocker is introduced by the correction.

The independent security reviewer reports actual read-only SQL checks of both named databases: restricted role flags and zero memberships, exact table ownership/ACLs, all twelve domain DML privileges, no runtime grant options/DDL/extra ledger rights, unchanged committed migration hash/catalog signature, and zero application rows. I assessed that evidence and its explicit tool/source attribution; I did not repeat remote queries, retrieve private credentials or claim to have independently read a Vercel sensitive value. The operator's TLS, cross-environment password-denial, rollback-only Preview transaction/lock checks and clean-export install/lint/strict/build outcomes remain attributed to the operator. The security reviewer also independently compiled the final helper and checked private file metadata.

The Vercel metadata identifies only two new sensitive `DATABASE_URL` variables: `pN63ajycny5Idgop` for Production and `RvnMxcTUzEgVCGZ7` for Preview, each with its single intended environment target. It preserves the eight existing variable IDs and records no Development variable or migration/bootstrap credential. The operator's checked stdin binding, successful CLI operations and metadata support configuration without exposing secret values; sensitive-value readback was unavailable and is not claimed. Active Production remains `dpl_GP3AMEcqCP7A3NGemnEc1hYZQWHB`, and the latest list remains the same two deployment IDs including `dpl_EcA6U69yZuKmV1YpzbfFpUHwzGXQ`. The record explicitly distinguishes configuration from a deployed application/database integration check.

README/AGENTS now accurately describe native local development plus separately authorized hosted environments, restricted runtime connections, private migration credentials, no local-data import, and fresh future operation gates. They identify remaining Preview auth/OAuth setup, Fluid pool lifecycle review, backup/recovery and real hosted app verification as prerequisites to a later release. Inspection of the working diff confirms application/auth/provider/recipe/Vercel source and completed loop state/history are unchanged; the user's preexisting development `next-env.d.ts` diff remains outside the operational work and must stay unstaged. No concurrent build or development-server action was performed by this reviewer.

No Important finding remains. This approval may be recorded under reviewer role for `postgresql-hosted-setup`; the separate security clearance remains the security reviewer's decision. It does **not** approve source merge, app deployment, promotion, release, paid features, future migrations or additional credential/resource changes. Stop before deploying remains in force. Only this review record was appended during the final assessment.
