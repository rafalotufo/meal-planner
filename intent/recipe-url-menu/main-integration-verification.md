# Recipe URL menu — current-main integration verification

Date: 2026-11-24. Pinned main: `4eea4aa3496662f0e12133fd749fd193e6d4a291`.
Scope: owner-selected main-to-feature refresh to preserve existing local data.
The developer performed isolated test work only. Native observations and local
preview recovery below are reported separately from isolated migration proof.

## Cause and compatibility correction

The native local database already had main's family/menu/weekly-planning/unique-
recipes migrations0000..3. The feature had a divergent third migration for URL
curation. Exact schema/history checks correctly rejected that mismatch rather
than repairing it during authentication or startup. The correction preserves
main's complete prefix and appends only the feature's unapplied curation as0004;
there is no runtime auth bypass, history rewrite, native restore or data import.

Preserved prefix (public-loader SQL hashes and journal timestamps):

| Migration | Hash | Timestamp |
| --- | --- | --- |
| 0000_family | 22463e304a25ab4d43ded59a017f476ffc651e37f9c966903cc1bcc934afb597 | 1795450000000 |
| 0001_saved_recipe_menu | 5b984dc2492fb0bfd85c7ee46620ad61c819c81da6db606620b1fb244be52ddd | 1795530000000 |
| 0002_weekly_meal_planning | f6a77d005618de16b22350df733f35674fc301ef638aa087ae5654efbfea035b | 1795620000000 |
| 0003_unique_weekly_recipes | 1e8f7dc3ba0e3fc4912763e42f1677183b7ece0d88788942f397dda3e9b7d447 | 1795706400000 |

The new journal record is idx4/0004_recipe_url_curation/1795792800000. Its SQL
content is the unchanged unapplied curation migration. All main0000..3 SQL bytes
were compared directly with pinned Git source before catalog generation.

## Conflict resolution and integration decisions

- Retained both row-interface sets and both restricted runtime grant sets.
  Curation permits only its companion operations and metadata-column UPDATE;
  weekly plan/suggestion/approval privileges remain unchanged.
- Retained q/title-search and keyset pagination with curation-aware entry joins.
  Public entries keep exact typed curation metadata; main's stronger page parser
  still rejects duplicate IDs/sources, wrong ordering and non-boundary cursors.
- Pending/failed/interrupted URL placeholders stay visible and retryable in the
  saved menu but cannot generate a dinner, be suggested/accepted server-side,
  or appear as a swap choice. Legacy/search and ready-curated snapshots remain
  eligible. Completing curation never regenerates an existing draft.
- Imported main's plan routes/navigation, scheduler CLI, unique-source behavior,
  swap search and tests; no dependency, Proxy, provider or photo-transport changes.
- Combined disposable rollback ordering removes curation before menu and retains
  main's unique-plan/plans cleanup. No historical rollback SQL was rewritten.

## Test-first and preservation evidence

`tests/plans/curation-integration.test.ts` first proved two genuine failures:
placeholder-only menus generated a draft rather than reporting empty, and direct
pending-recipe suggestion was accepted instead of409. Ready-only predicates were
then added to generation, suggestion, acceptance and the picker.

The same test suite constructs an owned random database with the exact four-row
main prefix and populated families/users/invitations/menu/plans/approvals/
suggestions. Applying/repeating0004 preserves every preexisting row and all four
history records exactly, adds an empty curation companion and one ledger row,
and passes runtime catalog validation. No native local data was used as a fixture.

Catalog generation initially exposed a harness error: executing main0003's
statements individually committed/dropped its temporary compaction table. The
harness was corrected to the real migrator's single transaction; historical SQL
was not edited. The resulting full158-entry catalog, with only curation entries
removed for comparison, matches pinned main's catalog entry-for-entry, including exact definitions.

Actual combined storage/generator/migration regression command passed36 tests,
including main repair semantics, grants, repeated migration, dump/restore and
proper disposable rollback, plus the new integration/data-preservation cases.

The known inactive generated dev/types conflict was observed after the owned
local dev server stopped. No3000listener was present. Moved only `.next/dev/types`
to a private temporary backup and regenerated types; no compiler option, source
exclusion, vendor declaration or test was weakened.

## Completed command results

- `pnpm run lint`: passed.
- `pnpm run typecheck`: passed after the documented generated-cache remedy.
- `pnpm run build`: passed; metadata matches SQL/journal, compile6.8s/types6.3s;
  both `/plans` and curation/menu routes are compiled with existing route modes.
- `pnpm run test:menu`: 69 passed in37.60s, no failures/skips.
- `pnpm run test:plans`: 23 passed in5.88s, no failures/skips.
- `node --import tsx --test tests/deployment/*.test.ts`: 32 passed in3.60s,
  including actual compiled curation without source/migration files.
- `python3 -m unittest discover -s tests`: 7 passed in2.47s.
- Exact combined Chrome helper: `node --import tsx tests/plans/curation-browser.ts`
  passed. Actual protected URL save remained pending, generation/picker excluded
  it, first native acquisition updated the same entry, and the existing draft
  remained unchanged until actual q search, suggestion and acceptance. No
  successful menu/plans API response was intercepted. Unique-plan, no-overflow
  and console assertions passed at320/390/1440. All owned fixtures cleaned.

The combined helper has nine new screenshot paths prefixed
`recipe-url-menu-main-integration-`. Its author visually inspected mobile menu,
mobile picker and desktop plan screenshots. Existing tracked screenshot paths
are privately backed up/restored byte-for-byte when older helpers regenerate
historical evidence; new combined screenshots provide current visual evidence.

## Final source checkpoint and browser readiness correction

- `pnpm run test:family`: 34 passed in17.93s, no failures/skips.
- `pnpm run test:auth`: 16 passed in16.63s, no failures/skips.
- `pnpm test`: 82 passed in1.06s, no failures/skips.
- Existing menu Chrome helper passed all save/removal/focus/persistence/search/
  pagination/access cases at mobile/desktop widths. Restored383 tracked historical
  screenshot files byte-for-byte afterward.
- Existing plans Chrome helper passed full-menu q search/paging, native keyboard/
  modal focus/dismissal, retry/access and request supersession/races; unique recipe
  counts, actual approval/suggestion/acceptance/rejection/finalization and retained
  history also passed. Modal frame delta was0 at320/768/1440 widths and320x568.
  Restored383 tracked historical screenshot files byte-for-byte afterward.
- Existing curation Chrome helper initially failed its older-page fill sequence.
  Diagnostics showed its readiness predicate passing25–61ms after navigation while
  document.readyState was loading, stylesheets were unavailable and the input
  still had unstyled geometry. Its substring Seed recipe1 condition could also
  match first-page Seed recipe10. A condition-based diagnostic waiting for actual
  document/style readiness produced trusted focused input, the typed URL in the
  actual POST body and HTTP200; no app controlled-state loss was reproduced after
  readiness. No application rewrite or blind timing delay was introduced.
- The helper now requires complete document/loaded stylesheet state and the exact
  visible Seed recipe1 heading before physical input. All original assertions
  remain. Its complete command then passed: immediate durable link, actual
  curation, duplicate, failure/Retry, unavailable fields, interruption, confirmed
  removal/focus, older-page save and actual bounded read-only polling. Restored383
  tracked historical screenshot files byte-for-byte afterward.
- Scoped ESLint passed for both curation browser helpers; diff check passed.
  Helper-only readiness correction required no application rebuild, preserving
  the already-running local preview. All owned test fixtures were cleaned.

The implementation lead viewed the new combined menu-ready390, picker-ready320
and plan-ready1440 screenshots: imported metadata, bounded mobile swap selection/
footer, unique draft plan and actions are readable with no visible overflow.
These are the new current combined-source visual artifacts; regenerated older
helper screenshots were restored as historical evidence.

## Native state observation and actual owner sign-in

Native development data was not written by the implementation lead. During QA,
root's guarded native backup prepare refused native-prefix-drift before creating
any backup directory or performing a database write. Read-only follow-up found
that the shared native database had already become the exact combined five-
migration schema/history with the curation companion. The actor is unknown; do
not attribute that change to the owner, another agent or this root task.

Root did not run the operational helper's apply mode or apply DDL/ledger/data
writes. No pre-cutover backup or actual before/after native row-fingerprint
comparison is available or claimed. Isolated four-to-five data-preservation proof
above remains valid and distinct from the provenance of this external change.

Root reported read-only validation of exact runtime schema/history and native
mp_runtime privileges: companion SELECT/INSERT/UPDATE; menu SELECT/INSERT/DELETE
and metadata-column-only UPDATE; main weekly plan/suggestion/approval grants.
Ownership/source/ID/savedAt updates, forbidden deletes/truncation, schema CREATE
and migration-ledger writes remain denied. Read-only inspection found no matching
installed/loaded local scheduler or cron. No scheduler was activated or repointed.

Root started the compiled local preview on canonical localhost3000 from the
verified combined build; anonymous home307, sign-in200 and OAuth initiation200
with a valid Google URL were observed. The owner then explicitly confirmed in
active chat: “Sign-in works now.” This owner report is actual sign-in confirmation;
no additional user interaction or native menu-data observation is invented.
Google transport fixtures above remain isolated test evidence, not the source of
this owner confirmation. Local3000 remains running at the owner's request.

Application source and QA evidence are frozen for independent final source/
security review and main-to-feature merge audit. No hosted operation, feature-
to-main merge, push or release was authorized or performed by this work.
