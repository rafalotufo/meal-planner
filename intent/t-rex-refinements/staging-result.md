# Latest main — staging result, 2026-11-24

Status: owner accepted this exact source/Preview/profile and all named gaps in the subsequent affirmative chat response. See production-release.md and committed staging/release gates. Actual observations remain unchanged; no missing check becomes a pass.

## Exact attribution

- releaseSourceSha:d26ea59742f904f399128477bfeb369a0049ba62, merged local main. Audit branch commits afterward do not replace this fixed source.
- Preview deployment:dpl_EHXQDYgYWmyReY6ev9BAZQHm7uQS, READY, actual target null/Preview, Node24.x.
- Generated origin:https://meal-planner-q9v3z07gr-rafalotufos-projects.vercel.app.
- Stable origin:https://meal-planner-staging-rafalotufos.vercel.app.
- Existing project prj_ntxXnJAVA977jHjLNDR7xJuwSx4V / team team_2c0O29FMb91g7L6sUChc9v6J / rafalotufos-projects, Hobby confirmed, unpaused, manual domain assignment and no Git integration.
- Configuration profile:latest-main-keyless-20261124-v1, preserving isolated Preview origin/Google/auth/database settings, no OPENAI_API_KEY or branch-specific environment override. Existing environment/domain metadata unchanged; source-default model remains gpt-6.2-sol. Values/credentials are never included here.
- Fresh alias/source/configuration readback2026-11-25T00:44:13.661Z: staging binds EHXQ; all three Production aliases still bind dpl_3SxzdzyhmxP1sgodCvzTdUnsPAUw, source4e66fb7bf1e9887c6c88e89fae984005ff02f118. Domain pagination and complete alias inventory have no continuation.
- Private environment metadata digest:358e50bb59fe90bdaac56a7255a3f9c727297f3384fd6d7cebb6dd220753cc6c. Actual secret values remain sealed; unchanged entry attribution is distinct from a fresh OAuth/provider exercise.

## Source and local proof

Pinned clean Git export; Vercel66.6.0 dry run119files/550069bytes, every upload SHA1 matched export. Private/env/Git/audit/test/operator paths excluded; all runtime/SQL/config/lock assets present. Exact upload-only inventory passed frozen install and build. Main integration passed84recipe/game,34family,69menu,16auth,32deployment and7Python checks, lint/typecheck/build and isolated real Chrome at five widths. Fixture Google/search results and local game checks remain local proof, not hosted authenticated evidence.

An initial Preview CLI submission incorrectly used --skip-domain, which CLI rejected before submission because that option is Production-only. The corrected Preview command submitted this sole Preview build, with project auto-assignment disabled; only the existing staging alias was manually assigned after target/source readiness inspection. Production mappings were verified unchanged before and after. No protection bypass secret or configuration was created.

## Authorized Preview backup and schema cutover

Owner authority:hosted-migration-approval.md / committed gate latest-main-hosted-cutover-20261124. Exact recorded Neon Preview target withered-night-50194672 / br-dark-term-bbqhnxi5 / meal_planner verified, using verified TLS.

Private backup:18023bytes, SHA25613d9545b63d54b749435c40f67cce88e27e35b57acbbc82d35cc13ee16b3bb11, owner-only0600 under0700. Backup used an exported repeatable-read snapshot with original ledger and all four business-table fingerprints, then fully decoded with pg_restore without restoring anything. Preserve it privately; this is not restore authority.

The first approved migration attempt failed and rolled back: ledger remained exactly0000/0001. Read-only inspection showed mp_migrator lacked database TEMP permission; a rollback-only reproduction identified PostgreSQL42501 at0003 statement4, its CREATE TEMPORARY TABLE. No partial schema/history survived.

Independent reviews approved the narrowly necessary execution correction: temporarily grant TEMPORARY on only meal_planner to only mp_migrator, execute unchanged reviewed SQL through the existing migration command, and revoke TEMPORARY in finally. Runtime TEMP stayed denied. A cleanup-needed marker was persisted before grant; both role permissions and the full original expanded database ACL were verified restored before clearing it. No new role/credential/public privilege or permanent owner privilege was added.

Reviewed helper SHA2568832340b53d969bc8a23e9fff4a511a9b7381123a9d17b86e9474928e35af9f4. Reviews:org/reviews/t-rex-refinements-cutover-helper.md and temp-privilege.md. Private helper/receipts contain no credentials in argv/output; original failed attempt and cleanup outcomes remain recorded.

Successful command interval2026-11-25T00:40:34.180Z–00:40:36.192Z, TEMP/ACL restoration verified00:40:36.162Z, final schema/data/grant verification00:40:40.271Z. Existing original ledger rows and every existing business-row fingerprint/count unchanged:1family,1user,0invitations,0menu. Runtime openDatabase verified exact five-migration history/catalog. Exact effective table and column privileges, role flags/memberships, schema CREATE denial, ledger-write denial, menu column-only UPDATE, and PG17 MAINTAIN denial passed. Schema commits before the script's separate grants; failure handling does not assume otherwise.

## Actual hosted checks and limits

The real in-app browser reached the stable staging application's sign-in page, shared Recipes/Menu/Plan/Family header, and Google button. Requested viewport overrides390×844 and1440×1000 resulted in observed CSS widths354 and1309 respectively under the existing browser sizing/zoom; at each measured width scrollWidth equaled innerWidth. These are mobile/desktop checks, not fabricated exact390/1440 CSS-width measurements. One h1, expected title and visible solid keyboard outline on the brand link were observed. Menu navigation returned to same-origin sign-in without Google submission or identity/business writes. Temporary viewport overrides were reset.

Screenshots:org/reviews/t-rex-refinements-staging-390.jpg (354×767) and staging-1440.jpg (1190×826 browser-cropped desktop capture including the full sign-in card and part of the header). Filenames label requested viewport sizes, not captured pixels or measured CSS widths. The initial saved desktop image was an incorrect420px crop without the card; it was replaced after review. The replacement is still browser-cropped at the right edge and does not prove full desktop header framing; no-overflow evidence comes from the separate1309px DOM measurement. Images show public sign-in only, without identity/cookie/OAuth data.

One anonymous generated-Preview candidate smoke returned exit2/statusnull/passnull,149ms, under existing platform protection. It is inconclusive, not numeric421/no-store or stable-origin application HTTP proof. No protection bypass, Host spoof, fake hosted identity/transport or Production-cookie copying was used. The staging check/finalize helper was not run or reported passed; no member cookie or same-run Google attestation was available.

Named remaining hosted gaps: fresh allowed/denied Google round trips; authenticated family/session/logout, menu save/retry/curation, planning and T-Rex UI/lifecycle; provider/recipe/photo success; hosted cancellation and WAF enforcement; direct HTTP application certification limited by platform protection. Preview remains keyless. No paid request, persistent fake data, provisioning/invitation write, planning job, Production migration or deployment happened.

The unchanged Production baseline canonical anonymous smoke passed exit0/status401/pass true,2203ms before staging cutover. It proves only the runbook's anonymous root/sign-in/session/search statuses and private/no-store headers, not authenticated Production database/provider behavior. Production still has two migrations; its seven saved menu entries were not touched.

## Release acceptance needed

Owner must accept this exact source/Preview/profile, actual proof classes and all named missing coverage before Production creation/cutover. With acceptance, proceed under the already requested Production release scope with a separate same-source --prod --skip-domain build, fresh backup, approved0002–0004 cutover/grants and temporary migration-owner TEMP correction, manual promotion, canonical anonymous health and15minutes of bounded observation. Existing old-schema rollback is unsafe after cutover; recovery authority is pause only this project while preserving all data. No source drift, paid/provider exercise, credential/domain/protection change, DROP/history rewrite or backup restore is included.


Release plan-sync initially rejected the prose plan's missing machine-readable Approved header. A later documentation-only normalization records the existing independent approval and explicit file manifest; application source and pinned release SHA remain unchanged. Final checker results will be recorded after review/commit.


Final audit checks: plan-sync passed against0c6a38b..d076532 with the normalized explicit feature plan and verified ledger chain; the specific t-rex-refinements-plan-format-20261124 engineer approval was separately verified committed. The generic plan checker selects a historical engineer record, so that generic output is not represented as automatic source-specific approval. Manual source/artifact review and the specific record supply that binding. Staged secret scan reported zero findings, whitespace check passed, and app/lib/drizzle/scripts/tests remain byte-identical to fixed d26ea59. The owned staging-validation lane is retained while waiting for owner acceptance; do not break another operator's lock.
