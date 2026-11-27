# Classified weekly planning — implementation plan

- Author: architect
- Date: 2026-11-27
- Status: Approved by independent reviewer
- Independent review: `org/reviews/design-classified-weekly-planning-001.md`, source `737458b`
- Inputs: accepted sibling intent and sibling specification V1
- Gate: independent approval before any application/migration implementation

## Files that change

- `scripts/check-meal-plan-scheduler.ts`
- `lib/plans/composition.ts`
- `lib/plans/generate.ts`
- `lib/plans/validation.ts`
- `lib/plans/store.ts`
- `lib/menu/store.ts`
- `app/api/menu/route.ts`
- `app/plans/page.tsx`
- `app/plans/plan-controls.tsx`
- `app/plans/swap-recipe-dialog.tsx`
- `drizzle/postgresql/80fd3d65-d202-462b-883d-6adc2eb565be.sql`
- `drizzle/postgresql/compatibility.json`
- `tests/plans/composition.test.ts`
- `tests/plans/validation.test.ts`
- `tests/plans/generate.test.ts`
- `tests/plans/store.test.ts`
- `tests/plans/http.test.ts`
- `tests/plans/migration.test.ts`
- `tests/plans/curation-integration.test.ts`
- `tests/plans/scheduler.test.ts`
- `tests/plans/scheduler-http.test.ts`
- `tests/plans/browser.ts`
- `tests/plans/curation-browser.ts`
- `tests/menu/store.test.ts`
- `tests/menu/http.test.ts`
- `tests/migrations/dependency.test.ts`
- `tests/migrations/security.test.ts`
- `tests/deployment/postgres-metadata.test.ts`
- `tests/verification/http.test.ts`
- `tests/verification/integration.test.ts`
- `intent/classified-weekly-planning/verification.md`
- `org/reviews/classified-weekly-planning-*.png`

## Manifest notes

composition.ts is a small shared fixed policy, not a new service. Existing
rollback-only scheduler operator probe must seed an explicit main category and
assert the new up-to8 bound; update its source without executing it against hosted
targets. Verification integration retains legacy snapshots and synthetic exclusion
while gaining category-filtered read coverage if needed. The migration
identity is fixed by this approved plan. Compatibility appends required descriptor
and actual catalog profile only; no old profile/grants/SQL/journal rewrite.
Deployment/security fixtures may need additive identity-count expectations;
retain prior upgrade scenarios rather than removing them. Existing plan/scheduler
fixtures need explicit categories where testing new generation. Raw legacy plan
fixtures remain legacy and gain separate read/Unclassified proof. No compiler or
runtime-metadata weakening is allowed. Orchestrator owns graph, loop, status,
messages, memory, ledger and review artifacts. Any other application/helper path
requires a reasoned plan amendment before edit; material design departures need
fresh independent approval.

## Ordered slices

1. **Eight-slot persistence foundation.** Dependencies: independent spec/plan
   approval. Confirm Node24.15.0/pnpm10.33.0 and frozen install already performed;
   re-read relevant installed Next guides before code. Write failing strict TS
   validation/schema tests for8 snapshots and index7, reject9/index8/empty,
   preserve legacy final duplicates. Add pure composition policy and validation
   bounds. Derive prior eight-identity manifest by removing only this new identity;
   migrate an owned empty disposable database under that manifest, seed preserved
   plan/suggestion/approval/menu rows, then apply the reviewed new SQL and capture
   `catalogSignature`. Append profile/descriptor/hash; no guessing or runtime
   migration. Prove fresh install and eight→nine upgrade, byte-identical old
   snapshots/ledgers/approvals, repeat idempotence, exact old/new runtime rejection,
   index7/8 and array8/9 checks, unchanged restricted grants and TEMP denial. Keep
   historical category seven→eight upgrade test by removing descendants as well
   when constructing its old manifest. Run focused validation/migration/dependency
   and packaged metadata tests.

2. **Quota selection.** Depends on1. Add failing real-DB generation tests with
   more than quota in each group, null rows, foreign rows and pending/failed
   curated rows. Assert exactly4/2/2, eight distinct sources, same-week idempotence,
   per-category recent-use preference, deterministic week hashing, honest partial
   groups, only-null empty outcome, other family isolation and preserved existing
   weeks. Implement bounded partition-ranked SQL selection per spec; remove
   global rotation/limit. Adapt scheduler/curation fixtures explicitly so their
   original abort, deadlines, family exclusion and curation assertions still run.
   No new provider requests or schedule config changes. Run plan generation,
   scheduler and curation integration suites.

3. **Composition-safe swaps and lookup.** Depends on1–2. Add red store/HTTP tests
   for same-category suggest, wrong-category409, eighth slot, foreign/unready/
   duplicate rejection, change category after suggestion causing acceptance409
   without revision/approval changes, existing incompatible suggestion rejection,
   legacy null slot compatibility and current admission/verification boundaries.
   Add validated optional category argument to saved-menu list and exact GET
   parser, bound SQL before LIMIT51. Test enum/duplicate/unknown query rejection,
   combined title/cursor/category pagination beyond50 unrelated entries, family
   scope and unchanged unfiltered calls/security headers. Implement current
   transactional category comparisons before mutation, retaining duplicate and
   revision logic. Run focused menu/plan HTTP/store and verification tests.

4. **Grouped UI and real Chrome.** Depends on1–3. Extend owned browser test first
   to fail on missing groups/eighth-slot controls. Render h2 sections in category
   order with h3 recipe titles and original global action indices, snapshot counts
   against current targets and honest legacy/shortage copy. Pass category through
   modal keyed open context and all page lookups; keep existing debounce/body/
   cancellation/retained-results/focus behavior. Update old browser assertions and
   fixtures deliberately for nested sections, categories and new max count while
   keeping legacy snapshots and prior retained-results regressions. Browser test
   full4/2/2, partial and null legacy groups; slot7 actual suggest/accept and
   reapproval; category filtering/search/pagination; keyboard selection/cancel;
   mobile320/desktop1440 no overflow and thumbnail behavior. Save only new
   classified-weekly-planning-prefixed screenshots; inspect actual images. Run
   both plan browser scripts and relevant menu browser regression if lookup
   contract affected ordinary menu behavior.

5. **Complete verification and independent handoff.** Depends on1–4. Run required
   commands below once against final coherent source; record counts/output and
   limits in verification.md. Fix failures without suppressing tests/types, then
   request separate security and code review. Security verifies family/admission,
   transaction races, exact menu guards, bound filters, synthetic permissions and
   migration/grant preservation. Code reviewer checks actual mix, legacy history,
   array indices, browser screenshots, fixture honesty, manifest and evidence.
   Commit narrow verified slices with zero secret findings. Stop at human merge
   gate; no push, merge, development/hosted migration, deployment or release.

## Verification commands

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm test`
- `pnpm run test:migrations`
- `pnpm run test:plans`
- `pnpm run test:menu`
- `pnpm run test:family`
- `pnpm run test:auth`
- `node --import tsx --test tests/verification/*.test.ts`
- `node --import tsx --test tests/deployment/*.test.ts`
- `node --import tsx tests/plans/browser.ts`
- `node --import tsx tests/plans/curation-browser.ts`
- `node --import tsx tests/menu/browser.ts` if ordinary menu regression needs it
- `python3 -m unittest discover -s tests`
- `git diff --check`
- `python3 scripts/scan_secrets.py --staged`

Build before compiled-server suites. Run plan-sync against this approved manifest,
org loop/message/memory checks and workflow/ledger checks using existing tooling.
Record actual exits and no fabricated skips/passes. Dependencies/DB/network/browser
capabilities may require sandbox escalation for the authorized local fixtures;
report a concrete blocker rather than silently lowering coverage. If inactive
Next dev types conflict after QA, move only inactive `.next/dev/types` to a private
temporary backup and regenerate as instructed by AGENTS.md.

## Risks and operational boundary

Unclassified saves no longer fill new drafts; Menu classification and explicit
shortage guidance are the recovery path. Older plans may have any category mix;
read-only grouping does not assert new quota compliance. Saved-menu category can
change after lookup/suggestion; locked acceptance rechecks current values.
Source-unique snapshots and original array indices are independent of display
ordering. The new nine-identity catalog requires a separately authorized future
migration; deployed older eight-identity artifacts reject it and are unsafe
rollback targets. Preserve current hosted/development schema/data and existing
staging-first and human release gates. No hosted operations in this plan.
