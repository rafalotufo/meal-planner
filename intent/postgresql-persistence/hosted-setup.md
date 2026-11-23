# Neon and Vercel database setup

- Status: Approved
- Approval: Independent operational peer review; org/reviews/postgresql-hosted-plan-001.md.
- Owner authorization: Rafael, 2026-11-23: "Go ahead and set up Neon, create the restricted roles, run the migrations, and configure Vercel. Keep Preview and Production separate, and stop before deploying."
- Source revision: 009c6c254b08870a1a49dec698641379d13d4350

This follow-up authorizes provisioning, restricted roles, explicit hosted initial migrations and Vercel database variables. It supersedes earlier exclusions only for these named actions. It does not authorize deployment, promotion, source-to-main merge, paid upgrades/features, model calls, import of local family data or modifying existing unrelated resources. The completed six-turn implementation loop remains preserved; this is a separately reviewed operations handoff, not a reset or extension of that loop.

## Concrete plan

1. Verify Neon organization Rafael/org-spring-mountain-62035039 is Free, list existing projects to avoid collisions, and verify Vercel rafalotufos-projects/meal-planner (prj_ntxXnJAVA977jHjLNDR7xJuwSx4V, team_2c0O29FMb91g7L6sUChc9v6J) is the existing Hobby project with no Git integration. Record current deployment identity before/after; never deploy. Leave current local next-env.d.ts development changes untouched.
2. Create two NEW dedicated Neon projects meal-planner-production and meal-planner-preview, PostgreSQL17, aws-us-east-1 (matching Vercel iad1), fixed smallest 0.25CU with five-minute auto-suspend and no paid feature/plan change. Each has its own branch, database, endpoint and generated credentials. Do not clone production data into Preview.
3. Retrieve bootstrap connection privately, inspect empty public schema, create SQL roles mp_migrator (NO superuser/CREATEDB/CREATEROLE/BYPASSRLS) and mp_runtime (same restrictions). Random distinct SCRAM credentials are held only in 0600 ignored files under 0700 .data/neon; never printed or supplied in command arguments. Revoke PUBLIC connection/schema privileges and grant mp_migrator only public-schema USAGE/CREATE and ownership of the four tables it creates (not database/schema ownership), plus runtime CONNECT/USAGE. Runtime does not inherit privileged Neon roles. Do not change bootstrap passwords or user authentication.
4. Execute existing migrateDatabase on the NEW dedicated empty database using direct migration-owner connection. Catalog/hash checks must pass unchanged. Explicitly grant runtime SELECT on migration history and SELECT/INSERT/UPDATE/DELETE only on three domain tables. Pooled runtime URLs must have exactly sslmode=verify-full; direct migration URLs use the same database and distinct role. No migration/build/start hooks added.
5. Verify direct and pooled TLS connections, exact schema/history, runtime DDL/history-write denial and role flags; no real user data. Preview only may exercise rollback-only fake family/invitation transactions and lock serialization. Production verification is read-only or permission checks that do not create data. Check credentials/projects/endpoints differ; cross-environment login must fail. No destructive SQL or teardown of projects/branches.
6. Snapshot existing Vercel environment-variable metadata (no values). Add only DATABASE_URL as sensitive separately for Preview and Production, pointing to corresponding restricted pooled roles. Keep migration credentials OUT of Vercel. Do not alter Development/local URLs, existing auth/provider variables, Git integration, domains, WAF, protection, billing or deployment settings. No automatic deployment trigger/integration. Read back metadata and privately verify values if supported without revealing credentials.
7. Independently review hosted configuration evidence, record owner authorization and sanitized resource IDs/settings/verification. Confirm no deployment or promotion occurred; stop before deploying. Commit only documentation/audit and necessary scoped setup helpers after strict checks applicable to any code change.

## Files that change

- intent/postgresql-persistence/**
- org/reviews/postgresql-*
- org/messages/**
- org/memory/**
- org/status.yaml
- gates/ledger.jsonl
- README.md
- AGENTS.md
- scripts/postgres-*.ts

## Failure and recovery

Fail closed on unknown schemas, existing-name/resource collisions, non-Free account, catalog differences, insufficient grants, unsupported TLS, or unexpected deployment effects. Do not weaken compiler/catalog/security checks. Preserve created resources and report exact partial progress rather than delete/recreate or run destructive SQL. Never delete/reset existing environment variables. New restricted roles/databases are scoped to these newly created dedicated projects only. Any cost, broader permission or deployment decision remains with Rafael.
