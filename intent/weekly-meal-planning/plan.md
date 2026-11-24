# Weekly family meal planning — implementation plan

- Author: architect
- Date: 2026-11-24
- Status: Approved by independent org peer review (`org/reviews/weekly-meal-planning-plan-001.md`)
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
- `drizzle/postgresql/meta/_journal.json`
- `drizzle/postgresql/runtime-migrations.json`
- `drizzle/postgresql/catalog.json`
- `drizzle/postgresql/rollback-plans-test.sql`
- `scripts/migrate-db.ts`
- `scripts/generate-meal-plans.ts`
- `app/plans/page.tsx`
- `app/plans/plan-controls.tsx`
- `app/api/plans/[id]/route.ts`
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
- `org/status.yaml`
- `org/messages/*.md`
- `org/reviews/*weekly-meal-planning*`
- `org/reviews/weekly-plan-*.png`
- `org/memory/context.md`
- `org/memory/events.jsonl`
- `workflow-graph.yaml`
- `gates/ledger.jsonl`

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
