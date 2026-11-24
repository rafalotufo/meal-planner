# Refresh recipe URL curation onto current main — integration plan

- Status: Approved
- Author: senior-developer; date: 2026-11-24
- Scope source: owner selected “Combine this branch with latest main so it can
  use existing local data.” Root coordinates the local merge and operational gate.
- Inputs: URL-curation approved intent/spec/plan and pinned main `4eea4aa`.

## Required result and limits

Keep URL save-first/background curation and main's weekly planning, unique weekly
recipes and searchable swap picker together. Preserve native local data and the
already-applied main migration prefix exactly. This is a main-to-feature refresh,
not feature-to-main merge, push, hosted migration or deployment permission.

Root first stops this worktree's owned dev server and starts the explicit local
Git merge. The developer resolves application/storage/test conflicts only after
that notification. Root separately preserves/reconciles org messages, history,
ledgers, memory, loop/graph and approval records; no audit chain is rewritten.

## Files that change

- `.env.example`
- `app/api/menu/route.ts`
- `app/api/plans/[[]id]/route.ts`
- `app/layout.tsx`
- `app/menu/add-recipe-url-form.tsx`
- `app/menu/menu-controls.tsx`
- `app/menu/page.tsx`
- `app/menu/retry-recipe-details-button.tsx`
- `app/plans/page.tsx`
- `app/plans/plan-controls.tsx`
- `app/plans/swap-recipe-dialog.tsx`
- `drizzle/postgresql/0002_recipe_url_curation.sql`
- `drizzle/postgresql/0002_weekly_meal_planning.sql`
- `drizzle/postgresql/0003_unique_weekly_recipes.sql`
- `drizzle/postgresql/0004_recipe_url_curation.sql`
- `drizzle/postgresql/catalog.json`
- `drizzle/postgresql/meta/_journal.json`
- `drizzle/postgresql/rollback-curation-test.sql`
- `drizzle/postgresql/rollback-plans-test.sql`
- `drizzle/postgresql/rollback-unique-plans-test.sql`
- `drizzle/postgresql/runtime-migrations.json`
- `intent/recipe-url-menu/main-integration-plan.md`
- `intent/recipe-url-menu/main-integration-verification.md`
- `intent/recipe-url-menu/plan.md`
- `intent/recipe-url-menu/verification.md`
- `lib/db/schema.ts`
- `lib/menu/body.ts`
- `lib/menu/curation.ts`
- `lib/menu/http.ts`
- `lib/menu/recipe-metadata.ts`
- `lib/menu/store.ts`
- `lib/menu/types.ts`
- `lib/menu/validation.ts`
- `lib/plans/calendar.ts`
- `lib/plans/generate.ts`
- `lib/plans/store.ts`
- `lib/plans/types.ts`
- `lib/plans/validation.ts`
- `package.json`
- `scripts/generate-meal-plans.ts`
- `scripts/migrate-db.ts`
- `tests/auth/browser.ts`
- `tests/auth/oauth.test.ts`
- `tests/auth/server.ts`
- `tests/auth/shared-layout.test.ts`
- `tests/deployment/postgres-metadata.test.ts`
- `tests/deployment/postgres-packaging.test.ts`
- `tests/family/main-integration.test.ts`
- `tests/family/storage.test.ts`
- `tests/menu/body.test.ts`
- `tests/menu/curation-browser.ts`
- `tests/menu/curation-http.test.ts`
- `tests/menu/curation-network.ts`
- `tests/menu/curation-server.ts`
- `tests/menu/curation-store.test.ts`
- `tests/menu/curation.test.ts`
- `tests/menu/http.test.ts`
- `tests/menu/isolation.test.ts`
- `tests/menu/migration.test.ts`
- `tests/menu/recipe-metadata.test.ts`
- `tests/menu/store.test.ts`
- `tests/menu/validation.test.ts`
- `tests/plans/browser.ts`
- `tests/plans/calendar.test.ts`
- `tests/plans/curation-browser.ts`
- `tests/plans/curation-integration.test.ts`
- `tests/plans/generate.test.ts`
- `tests/plans/http.test.ts`
- `tests/plans/migration.test.ts`
- `tests/plans/package.json`
- `tests/plans/store.test.ts`
- `tests/plans/validation.test.ts`

This manifest explicitly unions the approved URL-feature paths, incoming main
source paths and integration edits so full-merge plan-sync can be checked.
Imported main code outside the semantic resolution set remains byte-identical.
Preserve main's package scripts, new plan files, shared header and application/test
changes plus the branch's URL-curation files. No dependency versions or lockfile
changes are proposed. A newly discovered application conflict outside this list
must be identified and peer-reviewed before its resolution.

## Ordered implementation and proof

1. Read merged AGENTS and installed Next guides; inspect all conflict hunks and
   establish failing integration regressions before fixes. Preserve both typed
   domain interfaces and both explicit runtime grant sets. Keep curation body/
   authority/after guards, mandatory token binding, private headers and Proxy
   matching intact; retain main's bounded q validation and parameterized filtering.
2. Preserve main `0000` through `0003` SQL bytes, journal indices/timestamps and
   runtime hashes exactly. Rename only this branch's **unapplied** curation SQL
   to `0004_recipe_url_curation.sql`; append idx4 with timestamp later than
   `1795706400000`. Derive all five hashes through the public migration loader.
   Never change a recorded native migration row or replay main's repair SQL.
3. Generate/review the complete catalog from all five migrations in an owned
   random isolated test DB. Test a main-four-migration fixture containing family,
   menu and weekly-plan data: the fifth migration adds only the companion table
   and ledger row; existing data and first four history rows remain byte-equal.
   Also test fresh migration, repeat migration, exact catalog, narrow privileges
   and full disposable rollback ordering (curation before menu; main plan rollback
   ordering retained). No rollback SQL is run against native development data.
4. Merge curation entry validation with main's stricter page validation: exact
   shape, typed enum, status pairing, ordered/unique IDs and sources, bounded
   page and canonical boundary cursor. Listing preserves both curation metadata
   and title-search q/cursor semantics, with server-derived family scoping.
5. Add regressions showing placeholders cannot become dinners or proposals.
   Generation and suggest/accept may use only legacy/search rows without a task
   or URL rows whose task is ready. Failed/pending/interrupted links remain in
   the saved menu and keep Retry; they are filtered out of swap choices and
   rejected server-side even if submitted directly. Ready curation becomes
   eligible without changing an existing draft automatically. Preserve main's
   no-duplicate source policy, revisions, approvals and suggestion races.
6. Build and run all commands below. New real Chrome integration uses the existing
   owned native-source fixture and actual protected save/curation APIs: pending
   link excluded from generated plan/picker, successful same-entry curation,
   q search finds ready recipe, then real suggest/accept preserves a unique plan.
   Existing menu, curation and plans browser helpers must still pass at mobile
   and desktop widths; visually inspect new evidence and preserve historical
   screenshot bytes when existing helpers regenerate them.
7. Freeze exact source and record actual proof, limits and migration prefix in
   main-integration-verification.md. Independent code/security review must clear
   the integrated source before root changes the native local database.

## Required checks

```sh
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm test
pnpm run test:menu
pnpm run test:plans
pnpm run test:family
pnpm run test:auth
node --import tsx --test tests/deployment/*.test.ts
node --import tsx tests/menu/browser.ts
node --import tsx tests/menu/curation-browser.ts
node --import tsx tests/plans/browser.ts
node --import tsx tests/plans/curation-browser.ts
python3 -m unittest discover -s tests
git diff --check
```

Serialize type generation/build and owned dev server use; apply only AGENTS'
inactive generated dev-types backup remedy if needed. Root runs staged secret,
plan-sync, workflow/ledger checks and commits. Do not suppress checks, remove
assertions or accept unproven helper passes to resolve integration failures.

## Native local operation — root only

After isolated prefix/data-preservation proof and independent clearance, root
creates and verifies a private native backup, rechecks the exact loopback owner/
runtime database target and the unchanged four-row main history, then applies
only additive0004 plus its narrow curation grants. Do not DROP, restore over,
truncate, import, rewrite history or change main0000..3. Preserve existing plans,
recipes, family/invitation data and all existing privileges. Old main-four-only
artifacts become catalog-incompatible after this authorized local cutover;
root must check any active local scheduler before applying and avoid claiming
that its old source remains compatible. No scheduler activation/repointing is
implied without reviewing the actual recorded local setup.

Root restarts this worktree's owned local3000 server and verifies canonical
sign-in/admission and menu/plans reads using the integrated source. Actual owner
Google interaction may require a user handoff; do not add fixture authentication
to the native server or claim a completed Google callback from a fixture pass.
No hosted database, Vercel, paid feature, global PostgreSQL service or main branch
mutation is authorized by this integration.

Manifest clarification: `.env.example` and the plan route are byte-identical
imports from pinned main. The bracketed route uses a literal-bracket fnmatch
escape so the existing manifest checker matches the actual `[id]` directory;
this adds no route or configuration behavior beyond the approved main import.
