# Recipe search notebook — implementation plan

- Status: Approved
- Approval: independent review org/reviews/design-recipe-search-notebook-001.md.
- Scope authority: Rafael's explicit design selection and implementation request
  in this chat; sibling intent.md/spec.md record its concrete interpretation.

## Files that change

- app/page.tsx
- app/recipe-search.tsx
- app/recipe-card.tsx
- app/search-notebook.tsx
- lib/recipes/notebook.ts
- tests/recipe-notebook.test.ts
- tests/auth/browser.ts
- README.md
- intent/recipe-search-notebook/intent.md
- intent/recipe-search-notebook/spec.md
- intent/recipe-search-notebook/plan.md
- intent/recipe-search-notebook/progress.md
- org/loop/archive/vercel-deployment-2026-11-23/state.yaml
- org/loop/archive/vercel-deployment-2026-11-23/history.jsonl
- org/loop/config.yaml
- org/loop/state.yaml
- org/loop/history.jsonl
- org/status.yaml
- org/messages/
- org/reviews/design-recipe-search-notebook-001.md
- org/reviews/code-recipe-search-notebook-001.md
- org/reviews/security-recipe-search-notebook-001.md
- org/reviews/recipe-search-notebook-verification.md
- org/reviews/recipe-search-notebook-*.png
- org/reviews/recipe-integration-results-320.png
- org/reviews/recipe-integration-results-1440.png
- org/reviews/recipe-integration-sign-in-320.png
- org/reviews/recipe-integration-sign-in-1440.png
- gates/ledger.jsonl
- workflow-graph.yaml

Existing untracked work/ contains the earlier design presentation and scratch
QA. Preserve it outside the feature commit. Any scratch TypeScript issues are
fixed locally without exclusions or suppression. Do not alter approved old
feature artifacts. Archive completed deployment loop evidence before initializing
this feature; preserve all prior ledger/history records.

## Ordered slices and evidence

1. Record agreed intent/spec/plan and independent design review. Treat the
   implementation request as scope authorization; do not ask for approval again.
   Record peer approval in the ledger and align active graph paths. Use the
   existing bounded loop and human merge/release gates. Install frozen and record
   Node24/pnpm10.33.0. No production operation is authorized.
2. Write failing TS notebook tests for independent search groups, repeated-query
   identity, selected/collapsed groups, per-group filters/sorts, immutability,
   title-evidence matching, conservative total times and stable unknown-last
   sorting. Run the red tests, then implement the smallest pure notebook module
   and verify green with pnpm test before the UI slice.
3. Implement the responsive shell, reusable source-preserving card, query form
   and notebook groups. Preserve all existing request lifecycle safeguards and
   history on failure. Document tab-only history and evidence limits. Run lint,
   strict typecheck and full behavior tests; fix regressions without suppression.
4. Extend real isolated Chrome QA using TS, the existing test-process-only auth
   fixture, and browser interception for search responses. Preserve the existing
   auth/photo checks while adding history, pill and sort request-count assertions,
   error/loading/empty/long-content/reload checks, touch/keyboard targets and
   desktop/tablet/mobile screenshots. No live LLM calls. Run the production build,
   auth regressions, deployment smoke tests and Python workflow tests.
5. Independently review code/security and browser evidence. Fix required findings
   (at most two review rounds before escalation). Record actual command output,
   staged zero-secret and plan-sync results. Save reviewable local commits if
   permitted; keep merge/release pending for the human. Do not publish or merge.

## Risks and checks

Free-text times can mislead: parse only exact supported English formats and
exclude ambiguous/cook-only times. Titles are evidence of text matches, not
verified ingredients; label that limitation. Collapse/unmount must preserve
per-group choices in notebook state. History is transient and scoped to this
page, with no local/session storage or shared server state. User-controlled
text wraps and uses React text rendering. Provider requests and optional image
fetching keep their existing security and usage limits.

Commands: pnpm install --frozen-lockfile; pnpm test; pnpm run lint;
pnpm run typecheck; pnpm run build; pnpm run test:auth;
node --import tsx --test tests/deployment/smoke.test.ts;
node --import tsx tests/auth/browser.ts;
python3 -m unittest discover -s tests;
python3 scripts/scan_secrets.py --staged;
python3 scripts/check_plan_sync.py --hook --plan intent/recipe-search-notebook/plan.md;
git diff --check. Log actual results in progress.md/verification evidence.
