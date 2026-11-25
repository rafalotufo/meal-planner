---
artifact: intent/recipe-url-menu/main-integration-plan.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
main_source: 4eea4aa3496662f0e12133fd749fd193e6d4a291
feature_source: c9316dc
---

# Recipe URL menu — main-integration plan review

Verdict: **Approved for the bounded main-to-feature integration.** No blocking
Bugs, Security or Compliance gap in the implementation plan. This is plan review,
not approval of unresolved code, native cutover proof, feature-to-main merge,
hosted operations or release. Application conflicts remain unresolved at review;
passing implementation/integration tests are not claimed.

## Evidence and assessment

- `main-integration-plan.md:58`–`69` preserves the actual pinned-main migration
  prefix: 0000_family/1795450000000, 0001_saved_recipe_menu/1795530000000,
  0002_weekly_meal_planning/1795620000000 and
  0003_unique_weekly_recipes/1795706400000. Independently read pinned main's SQL,
  journal and runtime metadata. Moving only the branch's unapplied curation SQL
  to0004, with a later journal timestamp and public-loader-derived hashes, avoids
  rewriting native history or replaying main's draft-repair migration.
- The plan requires fresh and main-four-to-five isolated migration proof, byte-
  equal retained prefix/data, repeat migration, complete regenerated catalog,
  narrow grants and proper disposable rollback order. Actual `lib/db/migrate.ts`
  checks ordered history before executing unapplied statements and validates the
  final exact catalog inside its transaction. `tests/plans/migration.test.ts`
  contains four-row history assertions and rollback ordering that must change;
  the manifest explicitly includes it plus menu/family migration/storage tests.
  Historical0000..3 and rollback scripts are not approved for editing.
- The real unresolved runtime-grant conflict combines curation companion SELECT/
  INSERT/UPDATE and menu metadata-column UPDATE with main's weekly-plan/suggestion/
  approval privileges. `scripts/migrate-db.ts` is manifested and the plan requires
  retaining both sets without broader curation ownership/source/ID UPDATE.
- Actual main `listMenuRecipes` supports bounded parameterized title q search;
  its `parseMenuPage` rejects duplicate IDs/sources, wrong ordering and non-boundary
  cursors. `plan.md:70`–`73` explicitly combines these safeguards with strict
  curation metadata and typed enum validation rather than choosing either side
  of the conflict. The manifest contains the API/store/validation conflict paths.
- Actual main generation reads all menu rows; suggest and accept independently
  load a menu row; the swap picker accepts parsed menu pages. Each could otherwise
  treat a URL placeholder as a real dinner. `plan.md:74`–`84` correctly names all
  four boundaries: ready-only generation, server-side suggest/accept checks and
  picker exclusion, while preserving pending links/Retry in the saved menu.
  Ready completion must not regenerate existing drafts. Main's source-uniqueness,
  revision/approval and retained-suggestion semantics stay in scope for regression.
- Manifested integration tests and real Chrome helper require genuine protected
  URL save/curation, pending exclusion, ready q search and real suggest/accept.
  Existing plans/menu/curation browser flows and all menu/plans/auth/family/
  deployment/recipe/workflow checks remain required. No test suppression, fake
  native-data fixture, auth bypass or invented successful helper pass is allowed.

## Native cutover conditions

Lines119–135 make native operation root-only after isolated prefix/data-preservation
proof, frozen-source independent code/security clearance, private verified backup
and exact loopback owner/runtime target/history checks. No DROP, native restore,
import, truncation or history rewrite is authorized. The existing-data integration
request does not authorize hosted or production effects.

Retain the scheduler prerequisite at lines124–128 as a real cutover condition:
if an active local scheduler targets four-only source, detect and resolve that
incompatibility through reviewed, appropriately authorized handling **before**
applying0004. Merely detecting it does not make its old catalog compatible. This
review grants no scheduler activation/repointing authority. Genuine owner Google
interaction may still need handoff; fixture authentication must never reach the
native server or be reported as owner callback success.

Read the plan, pinned-main sources, actual conflict paths, migration runtime and
relevant tests. Only this review document was written; no application, plan,
audit state, ledger or database was changed. Full-worktree diff checks/builds are
not meaningful while expected merge conflicts remain and were not claimed.
