# Independent release preflight review

Reviewer: independent review agent, 2026-11-24.

Verdict: approve the concrete proposal in intent/t-rex-refinements/release-preflight.md for owner review. This is not migration, staging, Production creation/promotion or recovery authorization. No hosted operation was performed by this review. Outstanding owner gates remain mandatory.

Reviewed pinned release source d26ea59742f904f399128477bfeb369a0049ba62, the preflight record, exact committed SQL 0002/0003/0004, lib/db/migrate.ts, scripts/migrate-db.ts, recorded hosted targets and intent/staging-first-release/spec.md.

## Schema and preservation assessment

The recorded two-migration starting catalog lacks all planning/curation tables. 0002 creates only the three planning tables/indexes. 0003 changes the meals CHECK and includes actual draft compaction, suggestion remapping/staling and approval deletion, but those operations affect only the newly created empty planning tables when starting from this verified catalog. 0004 creates menu_recipe_curations with a foreign key to existing menu_recipes; it does not update existing menu rows. Stop on any changed starting history/catalog or unexpected planning tables/data rather than treating this analysis as authorization to compact hosted plans.

migrateDatabase applies pending SQL and ledger insertions in one transaction with migration lock and final schema verification. The explicit runtime grants follow in separate statements after that transaction, so migration success followed by grant failure is a possible partial cutover state. Record and inspect that state; do not restore an old artifact or assume the schema transaction rolled back. Correct only the authorized missing grants or use separately authorized scoped recovery. Treat initial backup and post-cutover checks as real requirements: owner-only files, verified archive digest and successful full archive decoding, no restore into either hosted target, exact original ledger-row and existing-business-row fingerprint comparisons (counts alone cannot prove preservation).

The grant proposal matches scripts/migrate-db.ts: planning weeks/suggestions SELECT/INSERT/UPDATE, approvals SELECT/INSERT/UPDATE/DELETE, curation SELECT/INSERT/UPDATE, and menu UPDATE restricted to title/summary/image_url/time_kind/time_text. Existing family/menu/ledger-read grants are reissued, with no ledger write, DDL, blanket menu UPDATE or TRUNCATE grant. GRANT does not revoke unexpected existing excess privileges: preflight must refuse unexpected effective runtime privileges and verify the final effective grants rather than relying only on statements issued.

## Authority and sequencing

The user's request to deploy latest main does not override the repository's separate future-migration gate. Current proposal correctly fixes the release SHA and distinguishes it from later audit HEAD, asks fresh hosted schema authority, migrates Preview first, obtains real exact-source staging evidence and owner acceptance of explicit gaps, then requires committed exact-source Production release/recovery authority before the separate Production candidate and manual promotion. Do not apply Production migrations based solely on Preview migration approval or a generic staging acceptance. Keep target database/project/branch attribution, verified TLS and private owner credentials explicit; no migration-owner credentials belong in Vercel/upload artifacts.

Preview remains keyless absent separate bounded paid authority. Missing-provider503, protected/inconclusive checks, local fixtures, session reuse and a real OAuth round trip are different proof classes. Do not manufacture helper passes or use Production as fallback functional testing. Current preflight acknowledges staging acceptance does not yet exist; local successful checks and upload-only builds do not fill that gap.

## Cutover and recovery

Old deployed artifacts validate the old two-migration history/catalog and are unsafe rollback targets after 0002–0004. Preserve new schema/data, stop on drift, and use a reviewed compatible forward correction or explicitly scoped project pause only. No DROP, ledger rewrite, backup restore, data import, reset or destructive rollback is authorized. The migration-to-promotion interval can break old authenticated database operations; the proposal correctly discloses it rather than promising zero downtime. Production backup/migration/grants immediately before manual promotion require explicit acceptance of that cutover interruption. A shared-project pause may affect Preview, so that contingency must be named in owner recovery authority.

No required proposal rewrite. The concrete owner question should first identify both exact hosted targets, pending migrations/grants, preservation/backup checks and cutover interruption, distinguishing Preview-now authority from Production-after-staging/release authority. Obtain actual staging/gap acceptance and exact-source release/recovery approval only once evidence exists. Packaging completion should be recorded before that question; later source/config/schema drift requires new attributed validation.
