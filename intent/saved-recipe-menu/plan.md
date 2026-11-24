# Shared saved recipe menu — implementation plan

- Author: senior-developer
- Date: 2026-11-24
- Status: Approved
- Approval: `org/archive/saved-recipe-menu-pre-main-6458023/org/messages/ceo-0053.md`; independent reviews
  `org/reviews/security-saved-recipe-menu-plan-001.md` and
  `org/reviews/plan-saved-recipe-menu-002.md`.
- Inputs: approved sibling `spec.md` and `visual-design.md`; owner approval
  `org/archive/saved-recipe-menu-pre-main-6458023/org/messages/ceo-0052.md`; removal-confirmation requirement `ceo-0051.md`.
- Task list: the ordered checklist in this document is the authoritative task
  list, following the repository's feature-folder convention.

## Outcome and boundaries

Implement the approved family-shared menu: save a search result snapshot,
visit `/menu`, browse all saved recipes in bounded pages, and confirm before
removal. Retain publisher photo URLs with the existing missing/failed fallback.
Keep the approved search/notebook/game layout and use the reviewed visual
preview for appearance, not its sample data or simulated behavior. Product pages
contain up to 50 real entries; the preview's three-card pages and illustrations
must not enter application behavior.

This plan authorizes no code until its human engineer gate is approved. Later
Build may migrate owned disposable test databases on the dedicated native
cluster. It must not migrate development, Preview or Production data, invoke
hosted setup tooling, deploy, merge, import SQLite data or spend provider money.
Hosted schema/cutover/recovery authorization remains a separate operation.

## Grounding and implementation decisions

- `requireFamilyContext` returns only user/family IDs. Follow existing family
  routes: require family context first, then `requireIdentity(request.headers)`
  to obtain the verified identity. The page follows `requireFamilyContext()`
  with `requirePageSession()`. Store functions receive the verified identity and
  server-only allowlist; `requireMember` inside each write transaction derives
  its current family before any entry decision. Do not authorize with a supplied
  or previously captured family ID.
- Keep `FamilyDatabase.transaction`, its common advisory lock and timeouts
  unchanged. Add/save and remove use it; reads use the existing current-member
  pattern. Use typed bound native pg queries and the existing bigint parser.
- Create `lib/menu/` for a small shared contract/validator, a pure bounded-body
  reader and server store. Do not introduce a generic repository or endpoint
  framework. The body reader accepts the configured origin as a server-supplied
  argument, imports no auth/bootstrap code, and can be tested with Web Requests.
  Existing family `readJson` limits and behavior stay unchanged.
- The new SQL, journal, full catalog and runtime metadata are one reviewed
  compatibility change. Keep original PostgreSQL migration SQL and SQLite
  evidence unchanged. Add a separate test-only menu rollback rather than edit
  the existing initial rollback evidence.
- There is no collection count, maximum or count-all query. Use the approved
  canonical unsigned cursor, scoped tuple predicate and `LIMIT 51`, returning
  at most 50 entries and a next cursor from the final returned entry. Bind the
  cursor values and use the same database collation for comparison/order.
- Reuse `RecipeCard` via one optional action slot. Search supplies a save control;
  menu supplies a remove control. Keep literal text, source attribution, time
  labels and existing unoptimized/no-referrer browser image behavior. No new
  server image fetch, source refresh, provider call or saved-recipe editing.
- The menu page owns authenticated server reads. A focused client grid/controller
  owns per-entry removal feedback, the native confirmation dialog and refresh
  focus restoration. The selected entry stays visible until confirmed server
  success. Cancel/Escape/backdrop sends no request; every retry reconfirms.
- Use ordinary fresh menu navigation, with prefetch disabled where needed to
  avoid reusing stale menu payloads after saving. After removal refresh the same
  cursor from the server and replace its page, preserving the required next/
  previous/empty-link focus. Do not accumulate pages, poll or claim cross-device
  realtime updates.

## Files that change

- lib/menu/types.ts
- lib/menu/validation.ts
- lib/menu/body.ts
- lib/menu/http.ts
- lib/menu/store.ts
- lib/db/schema.ts
- drizzle/postgresql/0001_saved_recipe_menu.sql
- drizzle/postgresql/meta/_journal.json
- drizzle/postgresql/runtime-migrations.json
- drizzle/postgresql/catalog.json
- drizzle/postgresql/rollback-menu-test.sql
- scripts/migrate-db.ts
- scripts/postgres-hosted.ts
- proxy.ts
- app/api/menu/route.ts
- app/api/menu/[[]id]/remove/route.ts
- app/menu/page.tsx
- app/menu/menu-controls.tsx
- app/menu/remove-recipe-dialog.tsx
- app/menu/save-recipe-button.tsx
- app/page.tsx
- app/layout.tsx
- app/recipe-card.tsx
- app/search-notebook.tsx
- package.json
- tests/menu/package.json
- tests/menu/database.ts
- tests/menu/validation.test.ts
- tests/menu/body.test.ts
- tests/menu/migration.test.ts
- tests/menu/store.test.ts
- tests/menu/isolation.test.ts
- tests/menu/http.test.ts
- tests/menu/browser.ts
- tests/auth/chrome.ts
- tests/auth/shared-layout.test.ts
- tests/auth/shared-layout-browser.ts
- tests/family/storage.test.ts
- tests/deployment/postgres-packaging.test.ts
- tests/deployment/postgres-metadata.test.ts
- AGENTS.md
- README.md
- intent/saved-recipe-menu/**
- org/loop/**
- org/archive/saved-recipe-menu-pre-main-6458023/org/messages/**
- org/memory/**
- org/reviews/**
- org/status.yaml
- gates/ledger.jsonl
- workflow-graph.yaml

Global audit changes and commits are serialized by the orchestrator. Generated
screenshots use feature-specific names under `org/reviews/`. No dependency
addition is planned; retain exact pins and the lockfile unchanged. The current
root tsconfig already includes all TypeScript tests; keep its strict inclusion
and vendor checks unchanged. A material departure or extra application/test
file requires an explicit plan amendment before implementation.

Browser-fixture amendment: reuse the existing test-only Chrome fixture with
bounded profile-cleanup retries (Chrome helpers can finish writing after the
main process exits), configurable search/photo responses and deliberate one-shot
HTTP failures. Actual menu success paths continue to use real storage/HTTP.

`next.config.ts` already traces `drizzle/postgresql/**`; `.vercelignore` excludes
tests, scripts, intent/org/private files. Preserve both unless an actual failing
packaging test demonstrates a required scoped amendment. Do not upload fixtures
or make runtime depend on repository SQL/migration-source files.

## Ordered tasks and checkpoints

Every task begins with a meaningful failing behavior test or failing relevant
regression before GREEN, then a focused rerun. Record commands and their real
exit/results in sibling `verification.md`. Do not add mirror-of-implementation
tests or suppress failing checks. Small dependent integration edits are grouped
below; never leave a schema/metadata mismatch as a claimed completed increment.

### 1. Discover strict menu tests and define snapshots/cursors — medium

- [x] Add `test:menu` as `node --import tsx --test tests/menu/*.test.ts` and
  `tests/menu/package.json` with `type: module`, matching auth/family test layout.
  Existing `pnpm test` does not discover these tests; retain that command.
- [x] RED in `validation.test.ts`, then implement `types.ts`/`validation.ts`:
  exact snapshot/time keys, trimmed text bounds, invalid controls/surrogates,
  safe normalized ASCII source/photo URLs, persisted-entry validation, canonical
  UUIDs and exact bounded base64url `[savedAt,id]` cursors. Invalid stored rows
  fail closed rather than being omitted or rendered.
- [x] Verify `pnpm run test:menu` discovers/runs the new file and
  `pnpm run typecheck` includes it. No TS exclusions, assertions replacing
  validation or relaxed compiler options.

Files: package.json, tests/menu/package.json, tests/menu/validation.test.ts,
lib/menu/types.ts, lib/menu/validation.ts. Depends on approved plan.

### 2. Prove bounded mutation parsing — small

- [x] RED in `body.test.ts`, then add `body.ts`: exact Origin and JSON type,
  cross-site denial, actual byte counting, 16KiB save/4KiB remove bounds,
  malformed/unknown/missing fields and a five-second total body deadline.
- [x] Test stalled/chunked/false-length bodies, cancellation and released reader
  locks; validation failures never produce a successful parse. Deadlines also
  finish when an injected stream ignores abort. No raw input/error logging.
- [x] Run `node --import tsx --test tests/menu/body.test.ts` and strict typecheck.

Files: lib/menu/body.ts, tests/menu/body.test.ts. Depends on task1 contracts.

### 3. Prepare the additive migration and its catalog proof — medium, atomic

- [x] RED in `migration.test.ts` for missing table/constraints/indexes and
  initial-schema upgrade. Add `0001_saved_recipe_menu.sql` and append journal
  index1 with a fixed increasing timestamp; preserve index0 SQL/journal facts.
- [x] Build candidate metadata using the public Drizzle loader, and capture
  `catalogSignature` after applying the reviewed candidate SQL only to a new
  `testDatabase(false)` database. Explicitly prepare/review the committed catalog
  and runtime hash/timestamp JSON together; tests/build never regenerate them.
- [x] Test fresh migration, upgrade from an initial-schema fixture assembled
  from original SQL+history, repeat migration, constraints, nullable image URL,
  uniqueness, safe timestamps and catalog/history drift. Run the mandatory
  runtime-metadata verifier plus the focused migration test.

Files: new migration, journal, runtime-migrations.json, catalog.json,
tests/menu/migration.test.ts. Task1 precedes this atomic five-file integration.
Artifact preparation may use a temporary TypeScript command; no persistent new
generation framework, owner credential output or development DB mutation.
The unreleased0001 menu checks use explicit flatAND bounds: PostgreSQL dump/
restore otherwise flattens BETWEEN-derived nestedAND expression trees and changes
their exact deparse. Keep equivalent checks and capture their restore-stable
catalog/hash together, with dump→restore→restricted-runtime-open regression.
Do not normalize/relax catalog comparison or change initial0000 evidence.

### 4. Complete restricted grants and old regressions — medium

- [x] Add a typed `MenuRecipeRow`; extend the explicit local migration grants
  with SELECT/INSERT/DELETE only on menu_recipes. Do not grant UPDATE, TRUNCATE,
  DDL, schema creation, migration-history writes or blanket all-table access.
- [x] Add `tests/menu/database.ts` around the existing random owned DB fixture.
  For privilege tests, grant existing `mp_runtime` CONNECT/USAGE and the explicit
  table grants on that owned disposable database only. Read its private local
  runtime credential without printing it; substitute only the validated random
  database name. Do not create/alter cluster roles or grant development access.
- [x] Extend task3 migration tests for actual restricted-role allowed/denied
  SQL. Add disposable-only rollback-menu-test.sql; update storage.test.ts's
  expected table list and execute that rollback before its unchanged initial
  rollback. Prove rollback/re-migration without touching historic SQL bytes.

Files: lib/db/schema.ts, scripts/migrate-db.ts, tests/menu/database.ts,
drizzle/postgresql/rollback-menu-test.sql, tests/family/storage.test.ts;
extend existing new migration test. Depends on task3.

### Checkpoint: storage foundation

- [x] Focused menu validation/body/migration tests pass; runtime metadata verifier,
  strict typecheck, family storage regression and build pass with new catalog.
- [x] Confirm every migration/catalog operation targeted an owned random test DB;
  development and hosted schemas remain untouched. No application request can
  run a migration or load owner credentials.

### 5. Implement scoped store behavior — medium

- [x] RED in store.test.ts, then implement store.ts: current-member list,
  first-save-wins under the existing transaction lock, family-scoped delete,
  missing/foreign-ID successful no-op, unchanged source/photo snapshot and time.
- [x] Prove reopen/restart durability, duplicate races, save beyond200 without
  eviction, rollback and delayed old-ID deletion after re-add. More than100
  rows traverse50/50/remainder without omissions/duplicates in an unchanged
  dataset; deleting a cursor boundary does not invalidate later pages.
- [x] isolation.test.ts proves two families cannot cross read/write boundaries,
  forged cursors still bind the caller family, and admission/membership changes
  between outer checks and transaction decision reject the write. A test-owned
  wrapper may coordinate before the transaction callback; add no production
  fake identity, auth bypass or test-only branch.

Files: lib/menu/store.ts, tests/menu/store.test.ts, tests/menu/isolation.test.ts.
Depends on task4. Verify focused tests and `pnpm run test:menu`.

### 6. Expose the protected HTTP flow — medium

- [x] RED real-HTTP tests, then add GET/POST `/api/menu` and POST
  `/api/menu/[id]/remove` using the existing family/session/API response patterns.
  Authenticate before parsing, parse before locking, and let store recheck the
  member inside the transaction. Await promise route params per pinned Next.
- [x] Apply the independently reviewed body-deadline correction in
  `request-timeout-note.md`: static exact menu API Proxy exclusions plus the
  cohesive `lib/menu/http.ts` equivalent Host/auth/family/header guard. Preserve
  every existing handler check, all-method admission and explicit protected405;
  keep auth-policy/search/other Proxy paths unchanged. No config truncation,
  framework patch or weakened stalled-body test is permitted.
- [x] Before any session helper, require the public Better Auth JWE cookie-cache
  verifier, finite current expiry, verified stable identity and cached token;
  bind to the shared cryptographic session's token/identity before normal family
  checks. Cover missing/tampered/wrong-key/expired caches, same-user mixed tokens,
  secure-prefix/chunked positives and no refresh. This preserves prior stateless
  rejection independently of callback-process adapter memory; no custom crypto
  or shared-auth/vendor change.
- [x] Prove contracts/status/private-no-store, exactly one optional list cursor,
  invalid/duplicate query denial, no mutation from GET/HEAD/unsupported methods,
  unauthorized/pending/expired/denied identities, hostile body/Origin and generic
  DB/schema failures. Confirm accepted writes/listing survive a fresh server
  against the same owned DB. No provider/photo fetch occurs on the server.
- [x] Reuse test-process Google/OAuth and owned server fixtures only; the helper
  already forces paid keys empty. Use real requests for body/authorization
  behavior, with no test session endpoint in production.

Files: app/api/menu/route.ts, app/api/menu/[id]/remove/route.ts,
lib/menu/http.ts, proxy.ts, tests/menu/http.test.ts. Depends on task5; verify
compiled exact/false-prefix/sibling matcher behavior, all-method Host/auth/header
parity, raw unfinished save/remove deadlines and focused HTTP suite after build.

### 7. Save from search and open the real menu — medium

- [x] Add the optional RecipeCard action slot and focused save button; wire it
  in the notebook and add home Menu navigation without changing search/game
  state or provider code. Success/pending/error/session guidance stays local to
  the selected action; duplicates stay safe and owner0056 disables known saves,
  with separate lookup/save retry controls.
- [x] Add the authenticated server `/menu` page with the shared store, approved
  header, source/time/photo cards, empty/error/invalid-page states and accessible
  Older/Newest links. Handle promised searchParams; accept no client family.
  Server render replaces50-entry pages and keeps existing photo fallback.
- [x] Add the initial strict TypeScript browser helper and verify one complete
  local fixture save→menu→reload path before adding removal controls. Check
  photo retention and no stale prefetched menu after saving/navigating back.

Files: app/recipe-card.tsx, app/menu/save-recipe-button.tsx,
app/search-notebook.tsx, app/page.tsx, app/menu/page.tsx;
begin tests/menu/browser.ts. Depends on task6. Run lint/typecheck/build and
the browser helper's first complete flow; keep the page functional at checkpoint.

### 8. Confirm removal and refresh its page — small

- [x] Add menu-controls.tsx and remove-recipe-dialog.tsx using native accessible
  dialog behavior. Name the selected recipe; initially focus Cancel. Cancel,
  Escape and backdrop keep it saved, send zero mutation requests and restore
  trigger focus. Confirm alone starts removal; each retry reconfirms.
- [x] Keep the card until successful response, refresh the same cursor to refill
  and recompute its next link, and focus next/previous remove action or the
  correct empty-state link after refreshed content commits. Prevent stale or
  abandoned responses from changing newer page state or removing a replacement.
- [x] Expand the browser helper for cancel/confirm, failure/retry, empty/older
  pages, keyboard trapping/focus/announcements, safe literal text and missing/
  failed photo fallback. No optimistic durable-success claim.

Files: app/menu/menu-controls.tsx, app/menu/remove-recipe-dialog.tsx,
app/menu/page.tsx integration, tests/menu/browser.ts. Depends on task7.
Verify browser flows at390/1440 and dialog bounds at320, plus focused HTTP tests.

### Checkpoint: complete user flow

- [x] Actual local app, not the HTML mockup, passes save→reload→cancel→confirm
  removal→reload and pagination/empty/error/keyboard/photo flows. Capture
  screenshots under `org/reviews/saved-recipe-menu-*.png` and inspect them.
- [x] Browser fixture intercepts only search/image/Google transport inside its
  test process, leaving the actual menu API/storage active. Add only needed
  fixture failure/page data via the test-owned browser/HTTP helper; never fake
  production menus or overwrite historical screenshot files.

### 9. Verify compiled packaging and operator-tool compatibility — small

- [x] Extend postgres-packaging.test.ts to save/list/read `/menu`/remove using
  only compiled `.next`, package manifest and node_modules, with no repository
  SQL/source directory. Its fixture owns migrations outside the packaged app.
- [x] Update postgres-hosted.ts's explicit table/ownership/privilege expectations
  and grants for the new table, including denial of menu UPDATE/TRUNCATE. This
  is source compatibility work only: never run its provision/verify commands
  against hosted targets in this task. Old empty-data assertions are not a
  general future populated-data migration runbook.
- [x] Run compiled deployment and metadata regressions and inspect upload/tracing
  boundaries. Keep the mandatory metadata verifier and strict exact catalog;
  no packaging fallback may import migrator/source SQL at runtime.

Files: tests/deployment/postgres-packaging.test.ts, scripts/postgres-hosted.ts.
Depends on tasks6–8; existing metadata tests must continue passing.
The stale-extra-entry metadata fixture now appends a timestamp after the last
reviewed migration, preserving its stale-manifest assertion with multiple
migrations; explicit malformed/reordered fixtures remain unchanged.

### 10. Documentation, full verification and independent handoff — medium

- [x] Update AGENTS.md only to document the approved narrow saved-menu exception
  and `test:menu`; update README with menu/confirmation/pagination/photo behavior
  and explicit migration effects. Write verification.md with actual evidence and
  a future migration handoff naming strict catalog incompatibility, not an
  executable hosted authorization. Preserve approved visual artifacts.
- [x] Run the commands below on final code, inspect browser screenshots and
  satisfy all acceptance rows in spec.md. Fix failures without lowering checks.
- [x] Hand stable changes/evidence to independent security and code reviewers;
  resolve required findings and repeat only affected plus required final checks.
  Orchestrator commits audit state; human merge/release remain separate.

Files: AGENTS.md, README.md, intent/saved-recipe-menu/verification.md and the
existing feature plan; orchestrator-managed review/audit paths in manifest.
Depends on task9. This is the final Build/Test checkpoint, not deployment.

## Supplemental owner correction — menu title focus

Owner report `org/archive/saved-recipe-menu-pre-main-6458023/org/messages/ceo-0055.md`: the menu title appears selected when
opening the page. Remove unconditional mount focus while retaining native
`#menu-heading` targets for deliberate Older/Newest navigation, including the
empty older page. Keep confirmation and post-removal focus behavior unchanged.
This is a narrow correction within the existing approved files/scope.

- [x] Real-browser RED proves initial title focus; GREEN verifies direct load,
  reload and header entry stay unfocused/unselected, normal keyboard navigation,
  explicit pagination heading focus and all existing removal focus assertions.
- [x] Run lint, strict typecheck, production build, recipes, menu and required
  family regressions without touching the active user dev server or next-env.
- [x] Independent focused code review of the correction; orchestrator owns
  final audit/commit and the still-pending human merge gate.

## Current-main integration — shared shell and staging-first process

Integrate main6efc2cff while preserving its shared-site-layout and staging-first
release work. Use main's home/root shell; add fresh Menu navigation to the shared
Primary header and remove `/menu`'s duplicate shell/header. Its Your menu heading
becomes the page's single h1 while retaining title/pagination/removal focus rules.
Reconcile the shared Chrome scroll helper without losing bounded fixtures or
cleanup. Extend inherited shared-layout tests to Menu and update menu keyboard
expectations for the shared brand/navigation. The added layout/shared-test paths
are in the manifest. Orchestrator preserves/reconciles divergent audit records;
do not concatenate ledger chains or overwrite current-main runbooks.

Run combined frozen install/lint/typecheck/build/recipe/menu/family/auth/deployment,
shared-layout/menu and inherited auth/family browser verification in an isolated
copy, preserving the active user dev server and exact next-env bytes. Capture
new integration screenshots separately. Fresh independent code/security reviews
assess combined code before the orchestrator's merge/release actions.

## Verification commands and ownership

Supplemental owner0056 changes saved controls: remove Add again, disable known
saved recipes and resolve existing membership for each active search batch.
Reuse exact guarded POST `/api/menu?lookup=saved` with exact `{sourceUrls}` of
1–6 normalized URLs, existing16KiB/5s/Origin guard and a family-bound indexed
lookup; GET pagination, schema/grants, Proxy and providers stay unchanged.
Notebook owns checking/available/saved/error state, batches/rechecks on opening
searches and protects successful saves against stale lookup results. Lookup
errors offer Retry check; actual save failures retain their separate retry.
Test beyond-first50 membership, family isolation, malformed/no-effect lookup,
fresh/reopened/same-URL views, disabled no-save requests and stale responses.
Existing manifest paths cover this correction; compiled packaging proof includes
the new lookup mode. Keep the title-focus correction and user dev server intact.

Use Node24.x (baseline24.15.0) and pnpm10.33.0. Recheck installed pinned Next
Route Handler, promised params/searchParams, server/client component, router
refresh and cache guides before code; Tailwind changes use installed v4 rules.
No additional toolchain or dependency is needed.

```text
pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
pnpm run test:menu
pnpm run test:family
pnpm run test:auth
node --import tsx --test tests/deployment/*.test.ts
node --import tsx tests/menu/browser.ts
python3 -m unittest discover -s tests
python3 scripts/scan_secrets.py --staged
python3 scripts/check_plan_sync.py --hook --plan intent/saved-recipe-menu/plan.md
git diff --check
```

For the final committed implementation also run plan-sync with the recorded
approved Build base/head and explicit feature plan. Plan-sync must find an exact
`- Status: Approved` and matching committed engineer approval before code. Do
not claim it approves implementation while this plan is Draft.

Menu/family/auth/deployment suites own random `mp_test_<24 hex>` databases via
the existing restricted CREATEDB test role and guaranteed cleanup. Stop owned
servers/browser profiles in finally blocks. If the private cluster is stopped,
start only that on-demand cluster; do not run `db:setup`/`db:migrate` as an
automatic test prerequisite or change the development schema. Existing family
role regression may read local development privilege metadata but writes no
development rows; new menu privilege assertions use disposable DBs only.

Browser helper may extend the test-owned Chrome fixture for multiple recipe
results/failure controls if actually needed; amend the manifest first to name
`tests/auth/chrome.ts` if it changes. Prefer its current recipe interception
and separate test-owned CDP handlers over modifying auth semantics. Real browser
QA uses synthetic test-process Google transport, not live Google or paid search.
Record no cookies/allowlist values/connection URLs in evidence. Stop any owned
dev QA server before moving only inactive `.next/dev/types` to a private temp
backup if Next16.4.6 leaves duplicate globals; regenerate typecheck/build, never
exclude app/tests or patch vendor declarations.

## Risks, gates and evidence limits

- Strict catalogs reject both old-runtime/new-schema and new-runtime/old-schema.
  Hosted release needs a separately authorized target-specific maintenance,
  backup, cutover and recovery plan. Local test success grants no hosted action;
  rolling back production by running disposable rollback SQL is prohibited.
- Original migrations, metadata and catalog preparation are coupled. Capture
  candidate artifacts on owned empty test databases and review changes rather
  than relax catalog matching or auto-rewrite metadata during build/tests.
- The common write lock deliberately serializes existing family and new menu
  writes. Never replace it with a menu-only lock or perform network I/O within it.
- Publisher photos may expire and untrusted admitted clients can submit valid
  URL/text snapshots. Retain existing validation/browser boundaries and fallback;
  do not turn this into source verification, image archiving or a server proxy.
- UI confirmation is a user-interaction safeguard, not a new authorization
  credential. Every removal POST still independently enforces current membership
  and ownership; an authenticated manual API call does not prove a dialog click.
- Existing baseline lint/typecheck/build and82 recipe tests passed in Design;
  seven Python workflow checks passed again during planning. These are prior
  baseline evidence, not proof of the planned menu implementation. This document
  runs no code, migration or browser test and claims no runtime acceptance.

No unresolved product decision is needed to execute the approved scope. Security
and peer reviews of this plan precede its human engineer gate. Implementation
begins only after that gate; merge, hosted migration and release remain later
explicit owner decisions.
