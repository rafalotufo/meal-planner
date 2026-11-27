# Saved recipe classification — implementation plan

- Author: architect
- Date: 2026-11-26
- Status: Approved
- Dropdown-only amendment: Proposed for independent peer review before code
- Auto-save amendment: Approved by independent review `3e69b40` of owner-requested amendment `eb1e15f`
- Independent approval: `d891e35` reviewing source `6c0933e`
- Inputs: accepted sibling `intent.md`; sibling `spec.md`
- Gate: independent spec/plan approval before application implementation

## Files that change

Application and native storage:

- `lib/recipes/types.ts`
- `lib/recipes/category.ts`
- `lib/recipes/curation.ts`
- `lib/menu/recipe-metadata.ts`
- `lib/menu/validation.ts`
- `lib/menu/store.ts`
- `lib/menu/body.ts`
- `lib/plans/generate.ts`
- `lib/plans/store.ts`
- `lib/db/schema.ts`
- `drizzle/postgresql/6e36359b-9b16-4642-a487-e4e5411ce477.sql`
- `drizzle/postgresql/compatibility.json`
- `app/api/menu/route.ts`
- `app/menu/page.tsx`
- `app/menu/menu-controls.tsx`
- `app/menu/recipe-category-control.tsx`

Tests and evidence:

- `tests/recipe-curation.test.ts`
- `tests/recipe-brave-fixtures.ts`
- `tests/recipe-category.test.ts`
- `tests/menu/recipe-metadata.test.ts`
- `tests/menu/validation.test.ts`
- `tests/menu/body.test.ts`
- `tests/menu/store.test.ts`
- `tests/menu/curation-store.test.ts`
- `tests/menu/http.test.ts`
- `tests/menu/migration.test.ts`
- `tests/menu/database.ts`
- `tests/menu/browser.ts`
- `tests/menu/curation-browser.ts`
- `tests/plans/validation.test.ts`
- `tests/plans/store.test.ts`
- `tests/plans/generate.test.ts`
- `tests/plans/curation-integration.test.ts`
- `tests/verification/http.test.ts`
- `tests/migrations/dependency.test.ts`
- `tests/migrations/security.test.ts`
- `tests/deployment/postgres-metadata.test.ts`
- `intent/recipe-classification/verification.md`
- `org/reviews/recipe-classification-*.png`


### Manifest notes

- `lib/recipes/category.ts`: (new shared enum parsing/labels and metadata classifier)
- `drizzle/postgresql/6e36359b-9b16-4642-a487-e4e5411ce477.sql`: (new)
- `app/menu/recipe-category-control.tsx`: (new focused client control)
- `tests/recipe-brave-fixtures.ts`: (current model fixture response contract)
- `tests/recipe-category.test.ts`: (new)
- `tests/menu/database.ts`: (owned restricted fixture explicitly denies PUBLIC TEMP to match runtime contract; migrator owner retains its own privilege)
- `tests/menu/curation-browser.ts`: (pending/failed correction coverage if needed)
- `tests/plans/generate.test.ts`: (legacy expected normalized category=null; preserves raw fixture)
- `tests/plans/curation-integration.test.ts`: (preserved legacy-row expectation includes additive null/false category defaults)
- `tests/verification/http.test.ts`: (only if existing fixture is needed for edit denial)
- `tests/migrations/security.test.ts`: (owned shadowing attack fixture explicitly grants then revokes TEMP, asserting baseline/restored runtime denial)
- `org/reviews/recipe-classification-*.png`: (new evidence only)

The orchestrator separately owns graph/state/config/history/status/messages,
review records, memory and approval ledger. Preserve historical evidence and
other features. If another existing fixture must gain the category key for the
current strict model contract, add its exact path to this manifest and explain
why before changing it; never mass-rewrite historical adapter fixtures. Material
design departures require independent review before implementation.

## Ordered tasks

1. **Contract and migration proof** (dependencies: peer approval; medium slices).
   Install dependencies with `pnpm install --frozen-lockfile`, verify Node24 and
   pnpm10.33.0, read installed Next Server/Client Components and Route Handlers
   guides. First add failing tests for enum parsing, exact legacy/new recipe
   shapes and stored category constraints. Add the shared type/parser and row
   shape, then native SQL and append the compatibility descriptor/profile from
   an owned disposable database. Preserve every prior SQL/hash/profile and the
   five-row legacy journal. Verify fresh migration, seven→eight upgrade retaining
   saved recipes/plans, null/false defaults, invalid enum/override rejection,
   idempotence and restricted runtime grants: exactly the two new column UPDATE
   grants via `applyRuntimeGrants`, category writes succeed while table-level
   UPDATE and ownership/source/saved-at mutations remain denied. Add no generic generator to the
   runtime. Run focused category/menu validation/migration and migration suite.
   Checkpoint: new catalog is reproducible, prior data is unchanged, old profile
   is still evidence and runtime missing identity fails closed.

2. **Search curation** (depends on1; small).
   Extend active fixture/tests first: accepted source categories, vegetarian main,
   vegetable side, null uncertainty, rejected page null, invalid-category-only
   fallback, missing required field, unchanged source excerpts and abort bounds.
   Observe red, then extend only current per-source model schema/prompt/validator.
   Run `pnpm test`; prove call counts and output caps stay unchanged. Saving a
   classified card is covered in task4. Historical adapter is not redesigned.

3. **URL metadata classification** (depends on1; small).
   Add failing metadata tests for exact aliases, arrays, agreement/conflicts,
   unknown/dietary metadata, bounds and association. Implement conservative
   metadata mapping in shared category module and selected Recipe-node extraction.
   No title heuristics, model or extra fetch. Verify usable title/photo/time remain
   accepted with unknown classification and existing parser limits remain. Run
   focused recipe-category and `tests/menu/recipe-metadata.test.ts` checks.

4. **Persistence and correction serialization** (depends on1–3; medium slices).
   Add failing real disposable DB tests for search save/list/duplicate/pagination,
   URL completion, placeholder/failed correction, both curation/correction orders,
   retry marker preservation, family isolation, revoked admission, verification
   edit denial and remove/no-resurrection. Implement row category propagation,
   insert, completion CASE and transaction-protected category-only mutation.
   Add category to every current stored-menu projection in plan generation and
   suggest/accept in `lib/plans/store.ts`, keeping eligibility/selection intact.
   Test classified rows through real generation, suggestion and acceptance,
   preserve their category in new snapshots, and test old/new plan/suggestion
   JSON reads. Prove correction leaves historical snapshot bytes unchanged.
   Run menu/plan/store regressions.

5. **Bounded HTTP contract** (depends on4; medium).
   Add failing body and real HTTP tests for exact category query/body, malformed
   enums, duplicate/unknown query parameters, unsupported methods, missing/current
   credentials, canonical Host/Origin, foreign IDs, verification denial, slow and
   oversized unfinished bodies and private/security headers. Implement the new
   branch on existing exact `/api/menu`, body mode and sanitized `{ entry }`
   response. Preserve existing import/retry/lookup/save branches. Run menu HTTP,
   body/auth and verification regression tests. Checkpoint: no Proxy/public-policy
   change or synthetic scope expansion occurred.

6. **Menu UI and real browser** (depends on5; medium).
   First extend existing owned Chrome fixtures with legacy, auto-main, auto-side,
   auto-veggie and pending/failed entries plus correction/reload/error assertions;
   observe a failing missing-control assertion. Add the small category control,
   category display for every state and server-derived Google edit capability.
   Apply the owner amendment: native select onChange immediately saves; no Save
   category or retry button/form. Validate returned entry before refresh. Test
   real native keyboard type-to-select auto-save, disabled pending selection and
   sanitized failure reset to the stored category. Register a failed response
   before changing selection, then choose the desired category again to retry.
   Assert no Save category button exists. Verify no horizontal overflow
   at320/1440, persistence after reload,
   duplicate preservation, removal and polling coexistence. Use fixture-owned
   DB/server/profile, no production bypass or paid keys. Save feature-prefixed
   screenshots and inspect them; preserve earlier screenshots.

7. **Final verification and independent reviews** (depends on1–6).
   Run the commands below, record actual output and any limits in verification.md,
   then request independent security and code review. Address concrete findings
   with focused reruns. Security checks identity/family/override races, body limits,
   metadata trust and migration/grant preservation. Code review checks intent,
   manifest, backward compatibility, browser evidence and unchanged scheduler.
   Commit verified increments with zero staged secret findings. Handoff at human
   merge gate; do not push, merge, migrate development/hosted data or deploy.

## Verification commands

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm test`
- `pnpm run test:migrations`
- `pnpm run test:menu`
- `pnpm run test:plans`
- `pnpm run test:family`
- `pnpm run test:auth`
- `node --import tsx --test tests/verification/*.test.ts`
- `node --import tsx --test tests/deployment/*.test.ts`
- `node --import tsx tests/menu/browser.ts`
- `node --import tsx tests/menu/curation-browser.ts` if used for pending/failed coverage
- `python3 -m unittest discover -s tests`
- `git diff --check`
- Plan-sync against this approved manifest, org loop/message/memory checks,
  workflow graph/approval ledger checks and `python3 scripts/scan_secrets.py --staged`

Build before compiled-server regression commands. New tests/helpers stay strict
TypeScript. Required commands must pass; no suppressed checks or deleted tests.
If stopped browser development QA leaves duplicate Next generated LayoutProps,
move only inactive `.next/dev/types` to a private temporary backup and regenerate
production types/build per AGENTS.md. Do not change compiler exclusions.

## Risks and release boundary

Source metadata coverage is intentionally conservative; unknown is visible and
manually correctable. Search model classification can be wrong; manual override
is durable. The nullable optional card field keeps legacy snapshots readable
without changing their persisted bytes. SQL checks and the common advisory lock
protect correction invariants. Profile snapshots must come from actual PostgreSQL
because guessed constraint formatting can reject every runtime connection.

The new eight-identity runtime cannot run against current seven-identity hosted
databases until a separately authorized migration. After migration the prior
runtime is an unsafe rollback target. No old release/issuance authority applies.
Any future release follows exact-SHA isolated staging acceptance, separate
Production build, manual promotion authorization and minimal canonical health
verification under the existing runbooks. This plan stops at local review.

## Dropdown-only owner refinement — proposed bounded followup

- Before code, independently approve this amendment and sibling spec.
- Change only `app/menu/recipe-category-control.tsx`: editable cards show the
  dropdown alone with the full existing sr-only label; noneditable verification
  cards retain static category text. Preserve autosave, feedback and permissions.
- Update existing `tests/menu/browser.ts` and `tests/menu/curation-browser.ts`
  assertions to selectedOptions/value plus actual API/DB/reload persistence,
  failure reset and trusted keyboard behavior; assert no duplicate paragraph.
- Run lint/typecheck/build and both owned real Chrome scripts at320/1440; inspect
  screenshots. Root owns org/verification evidence. No unrelated full suite
  repeat, API/storage/migration/provider/scheduler or deployment change.
