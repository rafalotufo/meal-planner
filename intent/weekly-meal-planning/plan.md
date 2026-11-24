# Weekly family meal planning — implementation plan

- Author: architect
- Date: 2026-11-24
- Status: Approved
- Independent approval: `org/reviews/weekly-meal-planning-plan-001.md`
- Inputs: accepted intent.md and sibling specification

## Files that change

- `intent/weekly-meal-planning/brainstorm.md`
- `intent/weekly-meal-planning/intent.md`
- `intent/weekly-meal-planning/spec.md`
- `intent/weekly-meal-planning/plan.md`
- `intent/weekly-meal-planning/scheduler-runbook.md`
- `intent/weekly-meal-planning/weekly-meal-plans.plist.example`
- `intent/weekly-meal-planning/verification.md`
- `lib/plans/types.ts`
- `lib/plans/calendar.ts`
- `lib/plans/validation.ts`
- `lib/plans/store.ts`
- `lib/plans/generate.ts`
- `lib/db/schema.ts`
- `drizzle/postgresql/0002_weekly_meal_planning.sql`
- `drizzle/postgresql/0003_unique_weekly_recipes.sql`
- `drizzle/postgresql/meta/_journal.json`
- `drizzle/postgresql/runtime-migrations.json`
- `drizzle/postgresql/catalog.json`
- `drizzle/postgresql/rollback-plans-test.sql`
- `drizzle/postgresql/rollback-unique-plans-test.sql`
- `scripts/migrate-db.ts`
- `scripts/generate-meal-plans.ts`
- `app/plans/page.tsx`
- `app/plans/plan-controls.tsx`
- `app/api/plans/[[]id]/route.ts`
- `app/layout.tsx`
- `.env.example`
- `package.json`
- `tests/plans/package.json`
- `tests/plans/calendar.test.ts`
- `tests/plans/validation.test.ts`
- `tests/plans/generate.test.ts`
- `tests/plans/store.test.ts`
- `tests/plans/http.test.ts`
- `tests/plans/migration.test.ts`
- `tests/plans/browser.ts`
- `tests/menu/migration.test.ts`
- `tests/family/storage.test.ts`
- `tests/auth/shared-layout.test.ts`
- `org/loop/config.yaml`
- `org/loop/state.yaml`
- `org/loop/history.jsonl`
- `org/loop/archive/shared-site-layout-before-weekly-meal-planning-2026-11-24/*`
- `org/loop/archive/weekly-meal-planning-before-header-date-refinement-2026-11-24/*`
- `org/loop/archive/weekly-plan-header-before-swap-retention-2026-11-24/*`
- `org/loop/archive/weekly-swap-retention-before-unique-recipes-2026-11-24/*`
- `org/status.yaml`
- `org/messages/*.md`
- `org/reviews/*weekly-meal-planning*`
- `org/reviews/weekly-plan-*.png`
- `org/memory/context.md`
- `org/memory/events.jsonl`
- `workflow-graph.yaml`
- `gates/ledger.jsonl`

The dynamic-route entry escapes the literal opening bracket for the plan-sync
checker's fnmatch syntax; it still names only `app/api/plans/[id]/route.ts`.

## Ordered slices

1. Independent reviewer assesses specification and exact manifest. Root owns
   gate/loop/status/memory/commits and preserves historical audit records.
   No source implementation before peer approval.
2. Developer reads installed Next guides cited in spec. Write calendar/input
   tests and demonstrate relevant failing baseline before implementing pure
   calendar/validation/types. Add `test:plans` and `plans:generate` scripts only;
   no dependency changes or lockfile rewrite.
3. Write disposable migration/generation/store integration tests first. Add
   explicit SQL migration and rollback, journal/hash/catalog/domain rows and
   restricted grants. Generate catalog only from owned random test database
   with reviewed SQL; never development/hosted migration. Update existing menu
   migration expected count2->3 and execute new rollback before old rollback
   in both menu and family storage tests, retaining every old assertion.
4. Implement locked scheduler core, CLI and reviewed uninstalled launchd
   template/runbook; generation, eligibility, recency, small/empty menu and
   idempotency tests must pass. Add environment documentation. Do not install
   a job or modify Vercel configuration.
5. Implement server reads/actions in small verified slices. Reuse existing
   same-origin bounded JSON reader and Proxy, current family/session guards,
   allowlist/store validation. Test cross-family/foreign IDs, denied admission,
   feedback, current-revision approvals, stale/concurrent changes, immutable
   final plans and read-only history before moving to UI.
6. Implement protected server page, client interaction forms and shared Plan
   navigation. Keep query/body validation exact, date and history semantics
   explicit. Narrowly update shared-layout header regression if it asserts an
   exact nav list, preserving all prior links and auth assertions. No existing
   browser helper rewrites are pre-authorized; declare/review any needed one.
7. Add/run real Chrome feature flow with existing owned fixtures; use the
   generation core in the test process to create real drafts at known dates.
   Exercise320/1440px and long titles, genuine physical controls and final
   history; record screenshots under feature-specific filenames. Inspect them
   visually. Stop owned dev servers before production type/build regeneration.
8. Run all required commands below, fix failures without weakening checks,
   record actual evidence and limitations in verification.md. Independent
   security and final code reviewers approve or report concrete findings.
   Root records/commits reviewed outcome and stops at human merge/release.

## Required commands

```sh
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm test
pnpm run test:family
pnpm run test:menu
pnpm run test:auth
pnpm run test:plans
node --import tsx --test tests/deployment/*.test.ts
node --import tsx tests/plans/browser.ts
python3 -m unittest discover -s tests
git diff --check
python3 scripts/scan_secrets.py --staged
```

Define `test:plans` as `node --import tsx --test tests/plans/*.test.ts` and
`plans:generate` as `node --env-file=.env.local --import tsx scripts/generate-meal-plans.ts`.
Full suites run after build; serialize database/server suites and Next typegen/
build as necessary. Root runs message/memory/loop/workflow/ledger checks and
plan-sync over the entire feature diff. Secret scan before every local commit.
If generated duplicate LayoutProps occurs, follow AGENTS' inactive dev/types
private-backup procedure; never suppress or exclude types/tests.

## Risks and review boundaries

- Automation activation is separate from implementation. Runbook must plainly
  state no job is installed and Production scheduling is unactivated. Preparing
  a local plist preserves existing `vercel.json`; hosted release needs its own
  scheduler/migration/activation authority and staging evidence.
- Recipe snapshots and source-URL recency survive menu deletion; never cascade
  menu removal into final plans. Validate JSON snapshots before display.
- New schema catalog/hash/grants must agree exactly, including compiled runtime
  packaging. Existing rollback/count assertions change only for the real third
  migration. No deletion of evidence or tests.
- Current-family permission checks occur again under the shared advisory lock;
  stale revisions never overwrite another member. Approval invalidation is
  user-visible and verified through actual HTTP/browser behavior.
- Finalized weeks are immutable planned history; no implication meals were
  consumed, no silent finalization of abandoned drafts and no correction CRUD.
- Selection prefers eight weeks of finalized recency, without promising unique
  weekly sets when the saved menu cannot supply them. No AI/provider costs.

Any new source path, altered invariant or expanded product behavior requires
an explained spec/plan amendment and independent review before implementation.

## Owner presentation amendment — seven unassigned recipe cards

Source: `org/messages/ceo-0059.md`.

Independently approved before source changes: `org/reviews/weekly-meal-planning-presentation-001.md`. Owner requested that the draft
show seven recipes without recipe date labels. Keep the Sunday–Saturday range
above the grid and all existing calendar/storage/action semantics.

Within the existing manifest, update `app/plans/plan-controls.tsx` to remove each
card's weekday/date heading, promote its recipe title to the card heading and
replace weekday-based saved-menu labels with recipe-oriented accessible labels.
Apply this shared rendering to drafts, final plans and retained history. Keep
slot indices only as internal stable identities for suggestions/actions.

Update `tests/plans/browser.ts` within its existing owned-fixture flow to assert
the recipe-oriented label/heading and absence of weekday/date labels or date
elements inside all seven cards, while preserving the page's week range and
all existing approve/suggest/accept/reset/stale/confirm/history checks. Re-run
lint, strict typecheck, build, planning tests and real Chrome320/1440, visually
inspect updated feature screenshots, and append actual results to verification.
No additional source paths, schema migration, scheduling changes or deployment
are part of this amendment.


## Owner follow-up amendment — remove main-header date range

Source: `org/messages/ceo-0060.md`. Independently approved before source
changes: `org/reviews/weekly-meal-planning-header-001.md`. Supersedes the retained-header-range instruction in the first amendment.
The main plan header presents seven recipes without a numeric week/date range;
only history controls retain week dates. Cards remain undated in draft, final and
retained-history views. Schedule explanation weekday words/time may remain.

After approval, within the existing manifest update `app/plans/page.tsx` to remove
the visible main date-range paragraph and replace it with a seven-recipe heading
or label while retaining plan status. Keep strict selected-week handling and dates
in recent-history links/the retained-week selector. No core behavior changes.
Update `tests/plans/browser.ts` to assert no date range/date elements outside
history controls in draft/final/history; remove the former retained-range
assertion. Preserve all seven-card, accessibility, approve/suggest/accept/reset,
stale-conflict, pagination, confirmation and history interaction checks.

Run lint, strict typecheck, build,13 planning tests and real Chrome320/1440;
recapture six feature screenshots, inspect representative desktop/mobile images,
and append actual results to verification. No DB/auth/scheduler changes, new
source paths, deployment, merge or activation. The prior completed local loop is
preserved under the added process archive path in this plan manifest.

## Owner behavior amendment — retain suggestions for other recipes

Independently approved before source changes: `org/reviews/weekly-meal-planning-swap-plan-001.md`. Source: `org/messages/ceo-0053.md`, the owner's
request that accepting a swap clear only competing suggestions for that recipe.
Supersedes the all-other-pending-stale rule, without broadening the existing
source manifest.

After independent approval, change `lib/plans/store.ts` acceptance only: chosen
pending suggestion becomes accepted; competing pending suggestions for the same
slot become stale; unrelated pending slots update only base_revision to the new
plan revision. Preserve unrelated IDs/users/menu IDs/snapshots/status/timestamps.
Clear approvals and retain overall revision conflicts and existing common-lock
transaction semantics. Other plans/families and nonpending history stay unchanged.
No migration, API or UI change is needed unless existing explanatory copy is
found to contradict the revised behavior.

Write regression tests first in `tests/plans/store.test.ts`: multiple members'
competing same-slot proposals and other-slot proposals; chosen/competing statuses;
retained unrelated IDs/content visible at the new revision and later resolvable;
stale old requests409; simultaneous different-slot accepts serialize with one
stale response while that suggestion survives for refreshed resolution; pending
cap/unique constraints and normal finalization remain intact. Extend the existing
`tests/plans/browser.ts` owned-fixture flow with a meaningful two-card pending
suggestion scenario and verify the second remains after accepting the first.
Use existing `tests/plans/http.test.ts` only if a real HTTP boundary regression
needs coverage. No new helper paths/dependencies.

Run lint, strict typecheck, build, planning regressions and real Chrome320/1440,
retain no-date header/card assertions and all existing flows, inspect refreshed
feature screenshots and record actual red/green evidence in verification. No
DB/auth/scheduler/deployment changes. Root owns workflow/status/messages/ledger
and commits; independent final source review follows passing evidence.

## Owner uniqueness amendment — variable unique recipe count and draft repair

- Status: Approved by independent org review (`org/reviews/weekly-meal-planning-unique-plan-001.md`)
- Source: `org/messages/ceo-0054.md`; owner requires no repeated recipes within a week; with fewer than
  seven saved recipes, draft the available unique recipes.
- Supersedes all exact-seven/cycling implementation directions above. The prior
  no-dates and unrelated-suggestion-retention amendments remain mandatory.

### Additional files that change

- `drizzle/postgresql/0003_unique_weekly_recipes.sql`
- `drizzle/postgresql/rollback-unique-plans-test.sql`
- `org/loop/archive/weekly-swap-retention-before-unique-recipes-2026-11-24/*`

These supplement the existing exact manifest. Historical0002 SQL/hash bytes
must remain unchanged. `next-env.d.ts` is explicitly excluded: preserve the
owner's existing uncommitted change. No new dependency or grant is needed.

### Ordered amendment slices

1. Independent peer review approves this amendment before source changes. Root
   records the owner's clarification, prior completed loop archive, current
   active graph paths, review evidence and bounded dispatch state.
2. Write failing strict TypeScript tests first within existing planning test
   files: generation1/2/6/7/8+, unique source URLs, parse cardinality/duplicates,
   re-saved menu identity, runtime slot bounds, duplicate-proposal409 and duplicate
   acceptance409 after a different slot used its recipe. Preserve the second
   proposal's identity/cohort/rejectability and ordinary successful swap tests
   using a different unused replacement. Capture actual red output.
3. Add explicit0003 SQL and metadata/catalog derived from an owned disposable
   migrated database. Alter cardinality to1..7 and acquire the common family
   advisory lock inside the existing migration transaction before repairing
   duplicate drafts. First-occurrence compact snapshots, bump revision once,
   clear only affected approvals, remap current pending slot/cohort, stale
   deterministic merged-key losers before remapping winners. Preserve raw final
   history and unrelated/unique plans. Add upgrade fixtures using authentic
   first-three-migration history; do not rewrite old migration evidence.
4. Implement unique variable-count generation, strict unique draft parsing and
   status-specific legacy-final read projection with explicit legacy note.
   Apply proposal and locked acceptance uniqueness checks by canonical source,
   dynamic slot bounds and safe conflict copy. Keep existing unrelated pending
   carry-forward, common lock, revision409, approval reset and finalize semantics.
5. Update page heading, explanatory/confirmation copy and replacement options
   for actual1..7 count; exclude every already-planned source from choices.
   Keep recipe/main-header dates absent, history controls dated, and legacy final
   disclosure accurate. Do not introduce meal-date assignment or expand CRUD.
6. Update the existing real HTTP/browser flow so two pending cards can initially
   propose the same unused replacement, first acceptance preserves the second,
   duplicate second acceptance gets409 and remains rejectable, then a distinct
   replacement succeeds. Add variable-count fixture/display and unique card URL
   checks; retain previous stale/approval/history/no-dates/menu-pagination checks.
   Exercise320/1440, capture feature screenshots and inspect representative images.
7. Extend existing migration tests/counts and rollback sequencing for the actual
   fourth migration; verify runtime grants unchanged and owner/runtime schema
   compatibility. Run every original required command, record red/green outcomes,
   limitations and exact migration review evidence in verification.md. Independent
   security and final source review follow. Root handles process commits/gates.
8. Only after passing disposable upgrade tests and review, root may verify the
   exact dedicated local owner/runtime pair and apply the reviewed explicit local
   migration needed to repair the owner-reported duplicate draft. This is
   not a hosted migration or scheduler activation; preserve the separate gates.

### Mandatory amendment regressions

- Generator emits `min(7, unique saved recipes)` once each; zero-menu still skips.
- Draft parse rejects duplicate canonical sources, empty/>7 arrays and malformed
  snapshots; valid1..7 succeeds. Final legacy duplicates display once with honest
  original-count note while raw finalized data remains byte-for-byte unchanged.
- Suggesting any current source yields409 with no row write. Acceptance rechecks
  current content under lock, no duplicate accepted even after concurrent edits;
  blocked pending proposal survives and Reject still succeeds.
-0003 upgrade mixed fixtures preserve first snapshots and ordering, unique drafts,
  finalized raw history and foreign plans; compacted drafts get one revision bump
  and cleared approvals; pending remap handles same-user merged-index collisions
  deterministically. Repeat migration creates no further change.
- Additive hash/journal/catalog and restricted runtime grants remain exact;
 0002 unchanged; rollback either works on compatible data/full disposable cleanup
  or fails explicitly rather than padding/deleting data.
- Real HTTP bounds follow actual length. Browser1/2/6/7-card content and headings
  are accurate, all displayed URLs unique, conflicts/retained swaps recoverable,
  and no numeric dates appear outside history controls.

Use the unchanged full required command list above, including all family/menu/
auth/deployment/workflow suites, planning tests, lint/typecheck/build, real Chrome
and staged secret scan. Update existing assertions only for the changed contract;
never remove unrelated tests or relax strict checking. Preserve the user-modified
`next-env.d.ts` and all deployment/hosted/job-activation boundaries.


### Private verification checkout

The owner's dev server is live on port3000 and `next-env.d.ts` has a preexisting
uncommitted dev-path change. Preserve both; do not stop that process, overwrite
its `.next`, rewrite that file or include it in a feature commit. Root prepares
an owner-only temporary source copy containing tracked plus approved pending
manifest files, links the pinned installed dependencies and supplies private
isolated-test configuration. Run lint/typecheck/build, all required regressions
and the owned Chrome fixture there; copy only feature screenshots/evidence back.
The validation copy may regenerate its own types/build. Record actual working
directory and source equivalence in verification evidence, without leaking
credentials. This requires no new runtime helper, dependency or framework config.

Migration lock order is mandatory: existing runner lock73462902, then the first
0003 statement acquires FAMILY_WRITE_LOCK73462901, before **any** application-table
ALTER, validation or repair statement. Never take an ALTER exclusive table lock
first and then wait for the family lock: runtime writers take family lock before
table access, which would create a lock-order deadlock.
