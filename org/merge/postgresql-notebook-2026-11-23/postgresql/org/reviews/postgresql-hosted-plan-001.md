---
artifact: intent/postgresql-persistence/hosted-setup.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent hosted PostgreSQL operational-plan review

Approved the concrete no-deployment setup plan under `org/protocol.md`. Reviewed the current AGENTS instructions, completed active work item/state, approved PostgreSQL spec/plan, `hosted-setup.md`, connection/transaction/catalog validation, existing migration command/loader and the Vercel deployment runbook. Also read the installed Neon overview/PostgreSQL skills and code-review guidance. No remote write, database connection, software installation, service/configuration change or application edit was performed by this reviewer.

## Authorization and boundaries

The owner’s current explicit instruction quoted at `hosted-setup.md:4` authorizes Neon provisioning, restricted roles, explicit hosted migrations and Vercel configuration, with separate Preview/Production and a stop before deployment. This is the narrow supersession recorded at `:7`; prior AGENTS/local-only exclusions and old release approvals do not independently authorize these operations. Nothing in this review authorizes a deployment, promotion, source-to-main merge, paid plan/features, model calls or transfer of local family data. Keeping the completed six-turn implementation loop unchanged preserves its audit record.

The plan identifies the actual intended Vercel project/team and new Neon Free organization (`:11`), checks current deployment identity before/after, avoids Git/Marketplace deployment triggers, and confines remote changes to two new dedicated projects and two environment-scoped variables. Existing project-name/resource collisions or a non-Free account stop the affected action rather than silently selecting or modifying another resource.

## Reviewed controls

- **Environment isolation:** Two independent PostgreSQL 17 projects (`:12`) avoid cloning production rows or sharing role credentials/endpoints with Preview. The same-region, fixed-smallest compute choice is proportionate to this authorized setup. Verify actual Free status and applied settings; on Free the five-minute suspend interval is the fixed/default behavior, so omit an attempted setting if the API does not permit changing it rather than upgrade.
- **Least privilege:** SQL-created `mp_migrator` and `mp_runtime` have no superuser, CREATEDB, CREATEROLE or BYPASSRLS privileges and no privileged Neon-role inheritance (`:13`). Bootstrap credentials remain setup-only. Public connection/schema defaults are revoked and only required CONNECT/USAGE/schema-owner rights are granted. Runtime is not schema/table owner and receives DML only on the three domain tables plus SELECT-only migration history (`:14`). Inspect actual role memberships/ownership, not just the four role flags.
- **Secrets:** Separate random credentials per project/role, private 0700 directories/0600 files, no credentials in command arguments/logs, and server-only sensitive Vercel variables (`:13,16`) match the repository’s contract. Transfer connection values through private structured/stdin channels, with terminal echo disabled if a PTY is unavoidable; do not print raw connector results or secret-bearing CLI failures. Validate private file ownership/non-symlink destinations before writing. Preserve local `.env.local` and the existing local development `next-env.d.ts` change.
- **Migration integrity:** Reusing `migrateDatabase` through a direct connection preserves transactional DDL/history and the exact catalog/hash checks. The existing migration CLI (`scripts/migrate-db.ts:4-13`) validates direct/pooled database pairing, applies the reviewed migration and explicit runtime grants without starting/deploying the app. Catalog mismatch, unexpected public objects or provider-specific differences must stop execution; never regenerate the approved signature from the hosted target merely to make it pass. Do not run the disposable rollback SQL on either environment.
- **Verification:** Plan `:15` covers both direct/pooler TLS, exact schema/history, ownership/privileges and cross-environment credential denial. Production checks must remain read-only (`has_*_privilege`, catalog/role/row-count queries) or use an always-rollback transaction, so an unexpectedly privileged DDL attempt cannot leave objects. Preview fake mutations must also roll back. No live user identities, invitation secrets, paid providers or destructive cleanup are needed.
- **Vercel scope:** Only restricted pooled `DATABASE_URL` is stored separately for Production/Preview (`:16`); owner/migration credentials stay outside Vercel. Metadata snapshots plus unchanged deployment IDs demonstrate configuration without deploying. Verify the two environment targets explicitly and preserve existing auth/provider/Development variables. Sensitive values may be non-readable after creation; inability to read them back is a platform limitation to report, not grounds to convert them to readable configuration.

## Execution evidence still required

This is approval of the operational plan, not proof that remote configuration exists. The final report must record sanitized project/branch/endpoint IDs, PostgreSQL version, region/compute settings, role ownership/memberships and privilege checks, migration/schema results, environment-variable scope/type, and unchanged deployment identity. A hosted connection/catalog issue may require a separate reviewed correction and must be surfaced without weakening checks.

The Neon PostgreSQL skill recommends Vercel Fluid `attachDatabasePool` integration for runtime connection lifecycle. That is a pre-deployment consideration to assess before any future release; it does not prevent provisioning/migrating the databases and setting variables while explicitly stopping before deployment. This review introduces no new application or deployment authorization.

No Important finding remains against the plan. Human merge/release gates remain closed. The orchestrator will commit this review and the approved plan with the sanitized operational evidence.
