# Saved menu — hosted schema cutover proposal

- Author: architect, independent operational consultation
- Date: 2026-11-24
- Status: Reviewable proposal; no hosted effects performed or approval invented.
- Owner requested merge to main and Production deployment. Target-specific schema,
  interruption and recovery scope must be recorded explicitly before those effects.
- Use the staging-first runbooks on current main `6efc2cff6bcf2b206c0b958c0ecd742a4d5bf828`,
  not this branch's historical first-release runbook.

## Recorded targets and baseline

| Environment | Neon project / branch | Direct endpoint / database |
| --- | --- | --- |
| Preview | withered-night-50194672 / br-dark-term-bbqhnxi5 | ep-wandering-breeze-bbtscekj.c-15.us-east-1.aws.neon.tech / meal_planner |
| Production | plain-pond-82425009 / br-wild-dust-bbr2mvzw | ep-lively-tooth-bbi1n111.c-15.us-east-1.aws.neon.tech / meal_planner |

These are the exact `hosted-resources.json` targets. Runtime uses its recorded
restricted pooled endpoint; migration uses distinct `mp_migrator` on the same
direct database with verified TLS. Never import local data or use a bootstrap
provision operation merely to add this migration/grant.

Vercel remains project `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, team
`team_2c0O29FMb91g7L6sUChc9v6J`, scope `rafalotufos-projects`, Hobby. Last completed
release evidence in worktree360f,
`intent/staging-first-release/release-2026-11-24-results.md`, records:

- Production `dpl_J2oXFfPQNCx5Afzvyb74DytZYra5`, direct canonical
  `https://lotufo-meals.vercel.app`, no canonical redirect.
- Accepted Preview `dpl_AxsWGqRYtY8BK2RfwAbUejdMa3zh`, stable staging
  `https://meal-planner-staging-rafalotufos.vercel.app`.
- Both source `d1b11652abb5cf59d2b0ddce2b2b01d02480b8fc`; Preview profile keyless.

This is historical attribution, not a fresh live inspection. Reconcile current
complete deployment/alias/domain/environment/schema inventories before effects.
Do not reuse earlier Hf41/ALH deployment IDs or the expired prior recovery grant.

## Why this is a cutover

`openDatabase` checks exact complete migration history and catalog. `0001` adds
`menu_recipes` without editing the old domain tables, but the old runtime still
expects only the initial catalog. Old cold/reopened DB connections will fail
closed after migration; already-open old process pools may continue temporarily.
The new runtime fails against the old schema. There is no guaranteed overlap
where both revisions remain healthy, and build readiness/anonymous sign-in alone
do not prove authenticated schema compatibility.

Consequently database migration and alias promotion cannot be presented as an
atomic or zero-downtime change. Either accept a narrowly timed possible503 gap
between migration commit and promotion, or separately authorize a project-level
maintenance pause/resume. A project pause can also interrupt Preview. Verify
actual pause/promotion/resume behavior before relying on it; do not bypass its
interactive owner confirmation. Prepare candidates before any schema change.

## Ordered operation

1. Complete reviewed local main integration, including shared layout and current
   staging-first policy, checks and independent review. Pin one clean merged
   `releaseSourceSha`. Later audit commits reference that SHA; do not replace it
   with a moving HEAD. Capture exact current remote target/profile/schema baselines
   read-only. Confirm both DBs really have only the reviewed initial migration;
   drift is a stop condition, not an instruction to repair or reprovision.
2. Build/deploy that exact source as an unassigned Preview candidate using the
   existing project/environment. Inspect READY, source/ref/team/project, keyless
   profile and upload/runtime/cancellation settings. A failed build leaves the
   old Preview and schema unchanged. Do not move staging yet.
3. Before Preview migration, create a complete private custom-format pg_dump
   backup of that exact Preview database. Use PostgreSQL17 tools, private child
   connection environment, verified TLS and owner-only backup directory0700/file0600.
   Store outside uploads/Git. Check nonempty archive and pg_restore --list table/
   migration-history entries; record a hash and sanitized validation outcome, not
   data/credentials. This is archive verification, not a proved restore. Existing
   local disposable backup/restore tests remain a distinct proof class.
4. Under recorded Preview migration/interruption authority apply only reviewed
   `0001` via explicit migration tooling and narrowly grant menu SELECT/INSERT/
   DELETE to mp_runtime. Keep original SQL/hash/history, no runtime migration or
   UPDATE/TRUNCATE/DDL/history-write grants. Verify exact new catalog/history with
   runtime credentials, TLS, role restrictions and unchanged existing-table
   definitions. Migration is transactional, but current migrate-db.ts grants
   follow schema commit separately: if grants fail, schema may already be new.
   Repair only the authorized idempotent grants, verify, and do not move the alias
   until ready. Do not assume that exception means DDL rolled back.
5. Move only stable staging to the READY same-SHA Preview; perform attributed
   validation of real menu/status/save/removal behavior, accessible confirmation,
   retained photos/fallback and mobile/desktop scope. Existing real-family data
   only under concrete agreed validation authority; no persistent fake users,
   synthetic menu rows, new OAuth bypass, or unapproved provider call. A keyless
   profile cannot prove a successful live search/photo discovery. Finish actual
   checks or obtain owner acceptance of exact named gaps; retain proof classes.
   Record exact SHA/Preview ID/profile/schema/interval and fresh pre/post mappings.
6. Only after same-SHA staging acceptance and committed unexpired Production
   release/migration/interruption/recovery scope: build a separate Production
   candidate with --prod --skip-domain from that pinned source. Inspect READY,
   attribution, unchanged canonical/auth/database configuration and packaging.
   Perform required bounded candidate hostname checks; platform-protected
   inconclusive results remain inconclusive. Do not promote Preview.
7. Before Production schema effects repeat full private backup/archive checks for
   the exact Production target. Finish any accepted maintenance step, then apply
   reviewed0001 and the same least-privilege grants. Verify runtime history/catalog/
   privileges read-only and immediately promote the prebuilt exact Production
   candidate. Capture migration-commit/promotion times and acknowledge they are
   not measured end-user outage duration. Preserve direct canonical lotufo routing,
   staging and unrelated aliases/configuration; no redirect restoration is needed.
8. Inspect exact Production alias/source; run the current runbook's minimal
   canonical anonymous/no-store/configuration health and bounded15-minute
   observation. Read-only runtime connection/history/catalog checks supplement
   anonymous evidence, which alone does not exercise authenticated menu SQL.
   Do not invent Production OAuth/search/WAF certification or reuse old budgets.
   Record final alias/source/schema/grants, health and sanitized error counts.

## Non-destructive failure and recovery

- Before either schema commit: stop on candidate/backup/preflight failure and
  preserve existing serving revision/data. A migration transaction failure rolls
  its schema/history changes back; verify that outcome rather than infer it.
- After schema commit: the old deployment is **not a safe rollback target** for
  this database. Do not roll back to J2oX/Hf41 merely because it was once healthy;
  its initial-only history/catalog is incompatible. Never run disposable
  rollback SQL, DROP menu_recipes, delete ledger history, reset a Neon branch or
  restore the backup over writes accepted since it was taken.
- Preferred recovery preserves all new schema/data and uses a reviewed schema-
  compatible forward correction. If a safe fallback artifact is desired, it must
  be prepared, reviewed, staged/accepted and explicitly authorized in advance;
  none is established by this proposal. No automatic arbitrary redeployment.
- If required checks fail after schema change and no compatible healthy artifact
  exists, use only an explicitly authorized scoped pause/closed maintenance
  state for this Vercel project, verify traffic closure and preserve evidence.
  That authorization must acknowledge Preview interruption and any owner-operated
  confirmation. Resume requires a reviewed compatible correction and applicable
  release authority. A generic deploy request does not invent pause/reset scope.

The backup is preservation evidence and a recovery input, not permission to
restore it. A later restoration requires a separate reviewed plan for writes
since snapshot, exact destination, downtime and preservation of newer data.
Before entering the irreversible compatibility boundary, record the concrete
owner decision covering both target migrations, accepted interruption, exact
source/staging acceptance, narrow promotion and safe failure disposition. Merge
and authorized preparation can proceed while that final scope is made reviewable.

## Owner decision after preparation

Rafael approved this exact cutover plan in canonical `org/messages/ceo-0051.md`
after merged main1788143, READY PreviewCMzD, private backups, read-only target
verification and concrete interruption/recovery scope were presented. Gate
`saved-menu-hosted-cutover-20261124` records that authority with the full pinned
source SHA. This amendment authorizes the proposal's named migrations/grants and
scoped pause contingency only; Production promotion still waits for exact-source
staging acceptance and committed release authority. No destructive restoration
or incompatible old-artifact rollback is included. Subsequent execution is
recorded in `release-2026-11-24.md`, distinct from the fixed upload source.
