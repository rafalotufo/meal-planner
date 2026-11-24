# Searchable recipe swap picker — implementation plan

- Author: architect
- Date: 2026-11-24
- Status: Approved
- Approval: independent reviewer, `org/reviews/searchable-swap-picker-plan-001.md`
- Inputs: accepted intent.md, sibling spec.md and approved visual prototype

## Files that change

- `intent/searchable-swap-picker/intent.md`
- `intent/searchable-swap-picker/spec.md`
- `intent/searchable-swap-picker/plan.md`
- `intent/searchable-swap-picker/verification.md`
- `intent/weekly-meal-planning/preview/swap-picker-preview.html`
- `app/plans/swap-recipe-dialog.tsx`
- `app/plans/plan-controls.tsx`
- `app/plans/page.tsx`
- `app/api/menu/route.ts`
- `lib/menu/store.ts`
- `lib/menu/validation.ts`
- `lib/menu/types.ts`
- `tests/menu/validation.test.ts`
- `tests/menu/store.test.ts`
- `tests/menu/http.test.ts`
- `tests/plans/browser.ts`
- `org/loop/config.yaml`
- `org/loop/state.yaml`
- `org/loop/history.jsonl`
- `org/loop/archive/unique-weekly-recipes-before-searchable-swap-picker-2026-11-24/*`
- `org/status.yaml`
- `org/messages/*.md`
- `org/reviews/*searchable-swap-picker*`
- `org/reviews/swap-picker-*.png`
- `org/reviews/weekly-plan-*.png`
- `org/memory/context.md`
- `org/memory/events.jsonl`
- `workflow-graph.yaml`
- `gates/ledger.jsonl`

The existing prototype path remains the approved reference, not application
source; do not move it or copy its sample images into runtime. No thumbnail
helper file is necessary: keep the small saved-image/fallback rendering inside
the dialog. No changes to migration SQL/catalog, planning store/action contracts,
photo/provider code, auth policy/Proxy, dependencies or deployment configuration.
`next-env.d.ts` is excluded; preserve the user's existing bytes and live server.

## Ordered slices

1. Independent reviewer approves this spec and exact manifest. Root owns all
   workflow/ledger/status/commits and archived prior-loop evidence. Developer
   reads installed Next Image/client-component guides before implementation.
2. Write failing menu validation/store/HTTP tests before source edits. Cover
   omitted/blank q compatibility, trimmed bounded well-formed strings, literal
   wildcards/quotes/Unicode, duplicate/unknown URL params, full-menu matches past
   entry50, stable filtered cursor pages, current-family/admission guards,
   private/security headers and unchanged read-only effects. Add pure response
   validator failures for >50, malformed entries/cursors/order/duplicates/keys.
   Record actual red output without changing old unrelated assertions.
3. Extend existing guarded GET and store with optional bounded literal title
   search using bound SQL. Keep old signatures/default behavior and POST query
   contracts. Implement strict MenuPage parser for new network data. Run focused
   menu tests through real owned restricted databases; no schema change.
4. Add native dialog with approved visual treatment, saved validated thumbnails,
   native focus/dismissal/return, selected-card state and explicit confirmation.
   Implement debounced paged GET, bounded response reader, deadline/abort and
   request-instance supersession guards. Modal always opens from any editable
   card, regardless of initial server page's available choices. No new asset or
   retrieval mechanism. Verify this read/selection slice before enabling POST.
5. Integrate with existing PlanControls single mutation guard. Capture opened
   plan/revision/slot; preserve failure details and correct modal instance across
   close/reopen/prop changes. On success announce and refresh. Remove obsolete
   per-card selects/main-page menu pagination instructions while preserving
   `/menu`, accepted legacy plan query parameters and planning behavior.
6. Adapt existing real Chrome planning flow to physical modal/card/search/confirm
   actions in place of select interactions. Preserve its prior state/storage
   assertions. Add >50 title-search and modal paging, all-planned first page,
   counts/null/broken image fallback, search focus/Tab containment/Escape/backdrop/
   cancel/no-selection POST, double-click one-POST guard, delayed request abort/
   supersession/reopen, invalid payload/retry and stale409/access recovery. Test
   mobile320 and desktop1440, long titles and scrollable footer. Use existing
   test-only CDP image/network fixtures; no production bypass/helper changes.
7. Run required checks below in a private source-equivalent QA copy, inspect
   screenshots, record exact outputs/limitations in feature verification.md.
   Independent security and final source reviews follow; resolve findings and
   rerun affected checks. Root commits reviewed result and stops at human merge.

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

Run every command with the explicit pinned Node24/pnpm10.33.0 PATH in the private
QA cwd (its default shell may otherwise select Node22). Run build/typegen
serially and required DB/server suites after build. Keep
Google/provider/photo calls fixture-only and paid keys empty in owned test
servers. Root runs plan-sync over the whole feature baseline plus message,
memory, workflow, loop and hash-chained ledger checks; secret-scan each commit.

## Evidence and limits

- Preserve all prior unique1–7, retained pending swaps, duplicate409/reject,
  approval reset/stale revision, singular/plural/no-dates, final/history and
  cross-family assertions. Replace obsolete dropdown/pager mechanics with their
  stronger equivalent modal/full-menu-search assertions, not deletion of coverage.
- Search results contain at most50 per page. Counts describe only visible
  unplanned choices on that page; no inferred global totals. A filtered page with
  no choices must still allow older results where nextCursor is available.
- Response validation and instance guards are correctness boundaries, not merely
  UI polish: meaningful tests must expose malformed or stale data failing to win.
- The owner dev server and `.next` are untouched. Root prepares an owner-only
  private tracked+pending-source copy, links pinned installed node_modules and
  private isolated fixture configuration, checks source equivalence, and copies
  only reviewed source changes/evidence back. Record QA path/source equivalence;
  never publish credentials or commit the owner's next-env diff.
- No new app configuration, infrastructure, migration, hosted access, deployment,
  scheduling activation, push or merge is authorized. A needed extra source/helper
  path requires a reviewed manifest amendment before implementation.
