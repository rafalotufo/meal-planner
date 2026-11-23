# Hosted PostgreSQL setup — no deployment

Date: 2026-11-23 (America/Toronto). Source application revision: 009c6c254b08870a1a49dec698641379d13d4350. Rafael explicitly authorized Neon provisioning, restricted roles, initial hosted migrations and Vercel DB configuration, with separate Preview/Production and a stop before deploying. Authorization is recorded in hosted-setup.md and gate postgresql-hosted-setup-authorization-001. This is not merge/release/deployment authority.

## Provisioned resources

Neon organization Rafael (org-spring-mountain-62035039) was confirmed Free before and after setup. It initially had no projects. Created exactly two dedicated projects, PostgreSQL17 (actual server17.12), AWS us-east-1, fixed0.25CU, plan-default five-minute suspend, default six-hour platform history:

| Environment | Project name/id | Default branch | Endpoint |
| --- | --- | --- | --- |
| Preview | meal-planner-preview / withered-night-50194672 | preview / br-dark-term-bbqhnxi5 | ep-wandering-breeze-bbtscekj |
| Production | meal-planner-production / plain-pond-82425009 | production / br-wild-dust-bbr2mvzw | ep-lively-tooth-bbi1n111 |

Both databases are meal_planner, in separate projects with independent credentials/endpoints and no shared data parent. hosted-resources.json contains only non-secret resource mapping. No local data was imported. No paid plan/feature, Neon Auth/Functions/Gateway, extension or public data API was enabled. No project/branch/database/role was deleted/reset; no existing password was rotated.

## Roles and migrations

Each project has new SQL-created mp_migrator and mp_runtime roles. All superuser/CREATEDB/CREATEROLE/replication/BYPASSRLS flags are false; both have zero pg_auth_members memberships and no inherited Neon/bootstrap administration. mp_migrator has schema USAGE/CREATE and owns precisely families, app_users, family_invitations and __drizzle_migrations. Database/schema ownership remains with bootstrap/provider ownership; the role is not an administrator.

PUBLIC database/schema permissions were revoked on each new database/schema. mp_runtime has CONNECT, public USAGE, ledger SELECT and separately verified SELECT/INSERT/UPDATE/DELETE on each domain table (all12 permissions checked). It has no schema/database CREATE and no ledger INSERT/UPDATE/DELETE/TRUNCATE. Bootstrap and migration credentials stay out of Vercel.

The independently reviewed scripts/postgres-hosted.ts executed existing migrateDatabase against direct migration-owner endpoints. Exact committed migration hash/history and catalog checks passed unchanged on both direct and pooled runtime connections. No runtime ORM, compiler, catalog or authentication checks were weakened. No migration/start/build hooks were added. Both hosted databases have zero families/users/invitations after verification.

Actual commands, all exit0 unless described in recovery notes:

- Isolated strict TypeScript compile of postgres-hosted.ts (noEmit, strict, skipLibCheck:false, Node types), plus ESLint zero warnings.
- node --import tsx scripts/postgres-hosted.ts preview provision
- node --import tsx scripts/postgres-hosted.ts production provision
- node --import tsx scripts/postgres-hosted.ts preview verify
- node --import tsx scripts/postgres-hosted.ts production verify
- Preview rollback-only pooled smoke: real bound inserts, pending admission beyond allowlist, intended-recipient check, accepted durable grant, familySummary isolation, and all fixture writes rolled back. Actual shared advisory-lock serialization over two checked-out transactions passed; post-check counts0 for all domain tables. No Production fixture writes.
- Cross-environment checks: distinct endpoints and random passwords; Preview credentials rejected by Production and vice versa, for BOTH runtime/migrator (four SQLSTATE28P01 denials).
- Client TLS verified with actual TLSSocket.encrypted/authorized true and TLSv1.3. The backend pg_stat_ssl reports false behind Neon's TLS-terminating proxy; this was not mistaken for missing client encryption. Deliberately wrong bootstrap password was rejected28P01 despite provider passwordless_access metadata; authentication was not bypassed.

Credentials were transferred from the connected Neon tool through a no-echo stdin receiver, never printed or supplied in command arguments. Bootstrap/private role files and separate environment files are0600 inside0700 ignored .data/neon; exact file/owner/symlink guards apply. Database passwords are distinct random256-bit values. Existing .env.local and native database were not modified. No live OpenAI/Google key was copied or used; no model/provider calls were made.

## Vercel configuration and deployment boundary

Authenticated account rafalotufo; project meal-planner/prj_ntxXnJAVA977jHjLNDR7xJuwSx4V in team_2c0O29FMb91g7L6sUChc9v6J (rafalotufos-projects), Hobby, Fluid/iad1, no Git integration. Existing state was read first and compared after. Added exactly two variables, using the pinned Vercel66.6.0 CLI with dependency scripts disabled and credential values supplied on stdin (no --value arguments):

| Key | Environment | Type | Variable id |
| --- | --- | --- | --- |
| DATABASE_URL | Preview | sensitive | RvnMxcTUzEgVCGZ7 |
| DATABASE_URL | Production | sensitive | pN63ajycny5Idgop |

Each value is its own project's mp_runtime pooled endpoint with exactly sslmode=verify-full. No MIGRATION_DATABASE_URL/owner/bootstrap credential was stored in Vercel. No Development variable was added. Existing eight auth/provider/config variables retained exact IDs/type/targets. No env pull, Git/Marketplace link, project/domain/Google/WAF/protection/billing setting or auto-deploy trigger was changed.

Before and after: active Production target **dpl_GP3AMEcqCP7A3NGemnEc1hYZQWHB**, meal-planner-1igkzsbnl-rafalotufos-projects.vercel.app. Complete latest deployment list remains the same two IDs (dpl_EcA6U69yZuKmV1YpzbfFpUHwzGXQ and dpl_GP3AMEcqCP7A3NGemnEc1hYZQWHB). There was no deployment, promotion, build on Vercel or release. hosted-vercel-metadata.json stores a sanitized value-free comparison; sensitive values cannot be read back, so their binding is verified from the checked stdin inputs, successful CLI operations, metadata targets/types and live database connections, not from printing secret values.

New variables apply only to a future deployment. Preview still needs its own auth origin/secret, Google credentials/callback and other app configuration before deploying the app; Production-only secrets were not copied. Real Vercel function/database integration and updated family app UI are not verified by this setup-only task. A future release must review pool lifecycle integration (Neon recommends attachDatabasePool for Vercel Fluid), backup/recovery beyond the Free six-hour history, human merge/release gates and hosted app smoke checks.

## Recovery notes and boundaries

An initial create request explicitly specifying suspend300 was rejected412 by Free, with no project created (list verified empty). Retried once omitting the setting; provider value0 means use the plan default, as documented by Neon. No upgrade or suspend-policy bypass.

Neon returned a pooled bootstrap URL by default. First Preview helper call failed at input validation BEFORE role/schema mutation. The helper now normalizes only the exact recorded pooled/direct endpoint pair before admin/migration operations; strict host/project/branch validation remains. Preview and Production provisioning and read-only repeat checks then passed.

The existing user-development next-env.d.ts change was observed at task start and preserved. App/auth/provider/UI sources are unchanged by hosted setup. Validation runs in a clean temporary source export so the user's development server and generated types are not disturbed. The original completed six-turn implementation loop remains byte-for-byte unchanged; this authorized operational follow-up does not reset or extend it. Old release approvals are not reused.

Independent plan/helper review: postgresql-hosted-plan-001.md and postgresql-hosted-helper-001.md. Final operational review, clean-export checks, staged secret/plan/audit results are appended below when complete. Stop before deployment remains in force.

Clean temporary export validation completed: pnpm install --frozen-lockfile, pnpm run lint, pnpm run typecheck and pnpm run build each exit0, with OPENAI_API_KEY forced empty and no local/hosted credential files copied. New helper also independently passes isolated strict compilation and ESLint0warnings. These are local packaging checks, not deployment or a claim of new full-browser/app-regression results; the unchanged application source’s114Node/7Python/Chrome evidence remains at009c6c2.

Final independent security review approved in postgresql-hosted-final-001.md after direct read-only queries of BOTH recorded Neon targets. Exact51-row catalog, history hash/timestamp, restricted role flags and zero memberships, all12 domain DML grants, ledger-onlySELECT, no extra runtime privileges/grant options, PUBLIC revocation, table ownership and counts0 were confirmed independently. Vercel state comparisons remain attributed accurately to operator-captured evidence. The seven Python workflow regressions passed again; message/memory/loop checks and ledger chain verify.

Reviewer-role final handoff approved in the hosted-helper review after inspecting Production mapping, exact endpoint normalization, security verification and scoped Vercel evidence. No findings remain. Approval metadata/manifest formatting was normalized to the repository tooling without changing scope. Final staged secret scanner reports0findings; scope/whitespace checks pass. Existing user next-env.d.ts development change is excluded from the commit.
