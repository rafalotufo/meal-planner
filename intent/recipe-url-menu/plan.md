# Recipe URL menu — implementation plan

- Author: senior-developer; date: 2026-11-24
- Status: Draft for independent review and owner plan approval
- Inputs: accepted amended `intent.md`, owner-approved asynchronous `spec.md`
  (approval `recipe-url-menu-spec-2026-11-24`, source commit `6101c79`).
- Task list: the ordered checklist below is the sole feature task list.

## Delivery and boundaries

Save a validated URL placeholder and curation row atomically; return the saved
entry before any publisher request. One Next `after()` attempt reads supported
static Recipe JSON-LD and conditionally fills that entry. Persist failure or
derive interruption and offer explicit Retry. No unattended recovery service,
paid provider, dependency upgrade or change to search/photo transport is needed.

This plan authorizes no code until approved. Implementation/migration tests own
random local test databases only. Do not migrate development or hosted databases,
invoke hosted tooling, change hosted resources, deploy, push or merge. Existing
hosted grants/catalog remain unchanged until a separately authorized cutover.

## Files that change

- `drizzle/postgresql/0002_recipe_url_curation.sql`
- `drizzle/postgresql/meta/_journal.json`
- `drizzle/postgresql/catalog.json`
- `drizzle/postgresql/runtime-migrations.json`
- `drizzle/postgresql/rollback-curation-test.sql`
- `scripts/migrate-db.ts`
- `lib/db/schema.ts`
- `lib/menu/types.ts`
- `lib/menu/validation.ts`
- `lib/menu/body.ts`
- `lib/menu/http.ts`
- `lib/menu/store.ts`
- `lib/menu/curation.ts`
- `lib/menu/recipe-metadata.ts`
- `app/api/menu/route.ts`
- `app/menu/page.tsx`
- `app/menu/menu-controls.tsx`
- `app/menu/add-recipe-url-form.tsx`
- `app/menu/retry-recipe-details-button.tsx`
- `tests/menu/validation.test.ts`
- `tests/menu/body.test.ts`
- `tests/menu/migration.test.ts`
- `tests/menu/store.test.ts`
- `tests/menu/isolation.test.ts`
- `tests/menu/http.test.ts`
- `tests/menu/recipe-metadata.test.ts`
- `tests/menu/curation.test.ts`
- `tests/menu/curation-store.test.ts`
- `tests/menu/curation-http.test.ts`
- `tests/menu/curation-network.ts`
- `tests/menu/curation-server.ts`
- `tests/menu/curation-browser.ts`
- `tests/auth/server.ts`
- `tests/family/storage.test.ts`
- `tests/deployment/postgres-metadata.test.ts`
- `tests/deployment/postgres-packaging.test.ts`
- `intent/recipe-url-menu/plan.md`
- `intent/recipe-url-menu/verification.md`

Orchestrator-owned feature audit messages, reviews, screenshots, loop/graph,
status/memory and ledger records accompany these slices. Process-only artifacts
are exempt from implementation manifest enforcement. Application/test departures
require explicit plan amendment and peer review before the change.

## Ordered tasks and proof

### 1. Establish the local Build baseline

- [ ] Confirm Node24/pnpm10.33.0, frozen-install dependencies, and read this
  worktree's installed Next route-handler, `after`, server/client and caching
  guides before source edits. Read applicable implementation/security/UI skills.
- [ ] Capture baseline checks and verify dedicated restricted test role/private
  cluster availability without opening development or hosted application data.
  Missing local setup is a reported prerequisite, not permission to weaken tests.

### 2. Prove safe parser behavior first

- [ ] Write parser regressions, show expected baseline failure, then implement
  pure `lib/menu/recipe-metadata.ts` with existing htmlparser2 and safe URL helpers.
  Keep the existing photo parser and native HTML loader byte-for-byte unchanged.
- [ ] Cover exact static Recipe types, root/array/@graph traversal, unique source
  association and ambiguous/mismatched nodes; all HTML/script/JSON/depth/value
  limits; invalid names; hostile text; description fallback/truncation; exact
  supported duration components; safe image ordering and page-bound OG fallback.
  No OG/title-only recipe, remote context/reference or metadata/image fetch.
- [ ] Keep import-specific image selection small and faithful to the existing
  dimension/ordering policy; duplicate no network logic. Run focused parser tests
  and existing recipe/photo regressions before persistence work.

### 3. Add compatible durable state with restricted privileges

- [ ] First add failing migration/catalog/grant and legacy-entry assertions.
  Add `0002` and one journal entry; preserve historical SQL/journal entries.
  Companion table references entry ID ON DELETE CASCADE and constrains state,
  UUID generation/lease combinations, normalized identity and safe timestamps.
- [ ] In owned temporary databases, apply migrations through the public loader,
  inspect the full catalog, review it and commit its exact signature plus loader-
  derived hashes/timestamps. Never substitute an incomplete catalog or runtime DDL.
- [ ] Extend `scripts/migrate-db.ts` grants: companion SELECT/INSERT/UPDATE only;
  menu column UPDATE only for title, summary, image_url, time_kind, time_text.
  Prove other menu columns, companion DELETE/TRUNCATE, DDL and ledger writes fail.
  Preserve existing menu SELECT/INSERT/DELETE and restricted-role assertions.
- [ ] Update two-migration/table-list assertions deliberately, using current
  reviewed metadata where appropriate. Test 0001-to-0002 data preservation,
  repeated migration, missing/stale catalog/history rejection and dump/restore.
  New disposable-only rollback drops companion first, then existing rollback
  scripts; do not rewrite those historical scripts or offer production rollback.

### 4. Make save/retry/read and fenced completion correct

- [ ] Extend public entry types/strict parsing with exactly curation state and
  retryable. Left-join companion state for list/save/duplicate reads; legacy and
  search entries remain ready. Missing/malformed persisted task fields fail closed.
- [ ] Add test-first store operations in `lib/menu/store.ts`: atomic URL save,
  retry, claim, conditional completion/failure. Reuse common-lock transactions,
  bound SQL and requireMember; compare the stored original email to the current
  subject's verified email and require the same owning family at both effect gates.
- [ ] Preserve first-save ID/order/snapshot, including search-versus-pending URL
  collisions. Insert placeholder+task only for a new URL entry. Retry rotates
  generation only for failed/expired work, captures fresh authority, and returns
  started:false for active/ready entries without rescheduling/resetting expiry.
- [ ] Prove failed insert rolls back both rows, restart retains status, read-time
  interruption writes nothing, and simultaneous retries/saves are deterministic.
  Claim/completion check deadline after acquiring the common lock. Completion
  updates only matching existing entry+generation+lease and task atomically;
  callbacks never upsert. Cover admission/email/family loss, removal/resave,
  stale worker no-ops, expiry and forbidden cross-family access.

### 5. Wire one bounded post-response attempt behind existing guards

- [ ] Refactor only the internal verified-authority extraction in `lib/menu/http.ts`
  so the guard and post-body recheck share current JWE/session-token identity
  binding and yield server-only identity plus min(session expiry,JWE exp*1000).
  Preserve protected405/Host/security headers and never expose tokens to clients
  or task records. Keep all other auth/session/public policy unchanged.
- [ ] Extend exact bounded body/query parsing for import and retry. Recheck current
  authority after body completion before save/retry; store rechecks membership in
  its transaction. Retain the exact endpoint/Proxy behavior and all other modes.
- [ ] `lib/menu/curation.ts` owns two non-waiting process slots and a finally-cleaned
  independent deadline signal. Route registers `after()` with entry ID/generation
  only, after successful commit, once for new saves/started retries. Registration
  failure keeps the saved link and fails matching work when possible. Background
  failure never changes the already-successful save response into a failed save.
- [ ] Worker claims current authority, releases DB before one safe HTML load,
  propagates its own abort, parses/validates, then uses fenced completion. Delegate
  no longer than30s and effective credential expiry. Busy capacity fails safely;
  no in-memory queue, credential retention or hidden automatic retry.
- [ ] Prove early response while publisher response is stalled, registration and
  process interruption, slots released on every outcome, both credential-expiry
  orders on save/retry, auth loss during fetch, and no fetch under a write lock.

### 6. Deliver visible save-first and Retry interaction

- [ ] Add small scoped URL form and Retry button components; place form only on
  valid loaded menu. Strictly validate responses, use15s client deadlines and
  request cleanup, retain input/errors and announce durable-save versus curation
  outcomes. Pending/failed/interrupted cards keep the source and confirmed removal;
  ready cards retain current RecipeCard presentation. Preserve removal focus.
- [ ] Add read-only current-page polling in menu controls:5s, max8 requests/40s,
  one in flight, fixed wall-clock budget per mount or explicit save/retry. Stop
  hidden/unmounted/settled/capped; refresh only validated changed state/content.
  Preserve focus and cursor; offer Newest recipes/Refresh rather than accumulating
  optimistic cards or resetting polling on server refresh. Update empty copy.

### 7. Prove actual protected HTTP, browser and compiled operation

- [ ] Extend `tests/auth/server.ts` only with optional explicit test preload paths,
  preserving existing call behavior. `curation-server.ts` composes existing Google
  fixture with `curation-network.ts` native DNS/HTTPS interception before app import.
  Use strict TS real request/response streams, fixed fixture hosts, owned local
  control server and event barriers; reject unexpected external traffic. Production
  imports no fixture or fake-user/recipe switch. API success is never intercepted.
- [ ] Exercise real parser/store/after transitions over HTTP and compiled isolated
  packaging without source/migration files. Test methods/query combinations,
  protected headers, slow/lying/unfinished bodies, all credential/admission cases,
  actual early durable response, manual recovery and races. Keep existing tests.
- [ ] New Chrome helper covers320/390/1440 widths, immediate link during stalled
  publisher, ready/fallback/failed/interrupted/Retry, duplicate/pagination/removal,
  keyboard/live status, bounded polling and console/network/overflow. Save new
  feature screenshots; privately back up/restore historical screenshots byte-for-
  byte if existing helpers regenerate them. Visually inspect actual screenshots.

## Required verification and completion

Run focused tests after each slice, then all required checks serializing builds
and owned server/database suites as needed:

```sh
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm test
pnpm run test:menu
pnpm run test:family
pnpm run test:auth
node --import tsx --test tests/deployment/*.test.ts
node --import tsx tests/menu/browser.ts
node --import tsx tests/menu/curation-browser.ts
python3 -m unittest discover -s tests
git diff --check
python3 scripts/scan_secrets.py --staged
```

Orchestrator runs plan-sync against this approved manifest, loop/message/memory/
workflow/ledger checks, independent code/security reviews and local commits.
Record actual commands/results and limitations in verification.md. Never suppress
strict checks or skip/delete tests. Only AGENTS' inactive dev-types backup remedy
may resolve the known generated LayoutProps conflict after its owned server stops.

The initial loop has turns7(plan) and8(peer review) remaining; do not extend its
budget. After explicit owner plan approval, archive it and initialize a separately
owner-authorized bounded Build cycle rooted in these approved artifacts. No code
starts merely because peer review passed. Hosted migration/grants, source-specific
staging acceptance, merge and release remain separate future human gates.

## Risks and review focus

The highest risks are task authority lifetime, delete/retry races, exact catalog/
privilege compatibility and polling refresh loops. The early persistence/race
proof and genuine stalled-publisher fixtures target those risks directly. The
historical `scripts/postgres-hosted.ts` bootstrap verifier intentionally stays
unchanged and must not be used as a populated-data migration runbook; future
hosted cutover needs separate reviewed instructions and authority. New schema
makes old runtime catalogs incompatible; preserve all data and use a reviewed
compatible correction, never an implied ledger rewrite or restore.
