# Latest main release preflight — 2026-11-24

Fixed proposed releaseSourceSha:d26ea59742f904f399128477bfeb369a0049ba62. Owner requested “deploy latest main to production”; this supplies deployment intent, but does not silently authorize the separately gated hosted schema changes or accept staging evidence that does not yet exist. Later audit commits must not replace this source.

## Read-only findings

- Existing Vercel project prj_ntxXnJAVA977jHjLNDR7xJuwSx4V / team team_2c0O29FMb91g7L6sUChc9v6J / scope rafalotufos-projects verified. Node24.x, manual domain assignment, no Git connection, unpaused.
- Current Production:dpl_3SxzdzyhmxP1sgodCvzTdUnsPAUw, source4e66fb7bf1e9887c6c88e89fae984005ff02f118, READY/production. Canonical lotufo-meals.vercel.app has no redirect. Isolated staging domain remains branch-qualified main; no domain/environment change made.
- Both recorded Neon targets have exactly migrations0000/0001, unchanged checksums, and catalogs identical to last released source4e66fb7. Current main requires0000–0004. Existing aggregate counts: Preview1family/1user/0invitations/0menu; Production1family/1user/0invitations/7menu. No business rows or schemas changed.
- Preview: withered-night-50194672 / br-dark-term-bbqhnxi5 / meal_planner. Production: plain-pond-82425009 / br-wild-dust-bbr2mvzw / meal_planner. Inspections used recorded restricted runtime endpoints with verified TLS. Owner/bootstrap credentials remain private and were not uploaded.

## Concrete migration proposal — requires fresh owner authority

1. Preserve private owner-only backups of both databases. Inspect exact target, current ledger/catalog and aggregate business counts immediately before cutover; stop on drift.
2. Apply only committed0002_weekly_meal_planning,0003_unique_weekly_recipes and0004_recipe_url_curation with the existing explicit migrator and narrow runtime grants, first on Preview. Preserve the original two ledger rows and all existing families/users/invitations/menu records.
3. 0002 creates planning tables/indexes. 0003 alters the newly created planning-meals constraint and includes draft compaction/suggestion/approval adjustments; with the verified two-migration starting catalog those planning tables do not yet exist and start empty, so no existing hosted plans can be compacted. 0004 creates the curation table. Runtime grants add planning access, curation SELECT/INSERT/UPDATE and only title/summary/image/time column UPDATE on menu_recipes; no blanket menu UPDATE/TRUNCATE or ledger/DDL grant.
4. Verify complete five-migration history/catalog, exact least-privilege grants, original ledger records and unchanged existing-row fingerprints/counts. Do not create persistent fake data, run a planning job, make provider requests, reset schemas or restore backups.
5. Deploy the exact fixed source to isolated Preview and validate the actual accepted profile. Keep Preview keyless unless separate concrete paid scope is supplied. Obtain owner acceptance of actual staging scope and named gaps for this exact source/deployment/profile before Production creation/cutover.
6. Under subsequent exact-source release authority, build a separate Production candidate with --prod --skip-domain, inspect readiness/packaging/configuration, recheck source/staging attribution, then perform the authorized Production backup/migration/grants immediately before manual promotion. No old-schema artifact rollback is safe after cutover. Existing Production authenticated DB operations will be incompatible during the migration-to-promotion interval; do not promise zero downtime.
7. Require explicit recovery authority to pause only this meal-planner project if no compatible correction can complete required health. A pause may also affect Preview. No DROP, ledger rewrite, data restore, project deletion, credential/domain/protection/billing change or paid exercise is included. Observe canonical anonymous health for the runbook's bounded15minutes after promotion.

## Completed local evidence

Combined main candidate passed84recipe/game,34family,69menu,16auth,32deployment and7Python tests, strict lint/typecheck/build and real Chrome at320/390/768/1024/1440; see main-integration.md and independent integration review. No unexpected browser errors or overflow. Drizzle/dependency changes and out-of-order migrations were discussed only and are not part of this release.

Clean Git export of the fixed source passed pinned Vercel66.6.0 --dry:119files/550069bytes. All file SHA1s matched the export; private/env/audit/test/operator paths are excluded and required source/SQL/runtime metadata/config/lock files are present. Upload-only frozen installation/build is running; actual results will be appended. First inventory assertion used an incorrect local runtime-metadata path; corrected to the actual existing paths, with all119hashes rechecked. No deployment has been submitted.

## Current release gate

Blocked on separate hosted migration scope, then real exact-source staging evidence and owner acceptance/release/recovery scope. Current Production remains unchanged and live. This record is a proposal and inspection evidence, not a migration or release authorization.

## Packaging and dependency results

The exact upload-only119-file set passed pnpm install --frozen-lockfile and pnpm run build, both exit0, using Node24.15.0/pnpm10.33.0. No ignored source/script dependency was needed by the production build.

Fresh pnpm audit --prod returned exit1 for the previously recorded single moderate esbuild tooling advisory GHSA-67mh-4wv8-2f99; zero high or critical findings. This is an audit finding, not a passing audit or an authorized dependency upgrade. Existing reachability/deferral evidence remains in org/reviews/security-saved-recipe-menu-release-audit-001.md and the prior release records; no new dependency change is included.

## Independent preflight review

Approved for owner review in org/reviews/t-rex-refinements-release-preflight.md. Execution must verify private backup digests and full archive decode, unchanged business-row fingerprints (counts alone are insufficient), and actual effective grants (GRANT does not revoke unexpected access). The explicit script commits schema/history before applying runtime grants on a separate connection; a grant failure is a partial cutover requiring truthful recording and only authorized grant correction, never an assumed automatic schema rollback. Stop on target/history/catalog/data/permission drift. Preview-now authority, Production schema authority, exact-source staging acceptance, release promotion and scoped recovery must each be explicit; no scope is manufactured from this proposal.
