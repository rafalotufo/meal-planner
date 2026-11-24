# Shared site layout — implementation plan

- Author: architect
- Date: 2026-11-24
- Status: Approved
- Inputs: accepted sibling intent and draft specification

## Files that change

- `app/layout.tsx`
- `app/page.tsx`
- `app/family/page.tsx`
- `app/family/family-controls.tsx`
- `app/sign-in/page.tsx`
- `app/sign-in/sign-in-button.tsx`
- `app/sign-out/page.tsx`
- `app/sign-out/sign-out-button.tsx`
- `app/onboarding/page.tsx`
- `app/onboarding/onboarding-controls.tsx`
- `app/invite/page.tsx`
- `tests/auth/browser.ts`
- `tests/family/browser.ts`
- `tests/auth/shared-layout.test.ts`
- `tests/auth/shared-layout-browser.ts`
- `intent/shared-site-layout/intent.md`
- `intent/shared-site-layout/spec.md`
- `intent/shared-site-layout/plan.md`
- `intent/shared-site-layout/verification.md`
- `org/loop/config.yaml`
- `org/loop/state.yaml`
- `org/loop/history.jsonl`
- `org/loop/archive/staging-first-release-before-shared-site-layout-2026-11-24/*`
- `org/status.yaml`
- `org/messages/*.md`
- `org/reviews/*shared-site-layout*`
- `org/reviews/*shared-layout*`
- `org/memory/context.md`
- `org/memory/events.jsonl`
- `workflow-graph.yaml`
- `gates/ledger.jsonl`

## Ordered slices

1. Independent peer review approves spec/plan before code. Orchestrator owns
   audit/state/ledger and commits, preserving the completed previous loop.
2. Reproducible frozen install is complete; read installed Next guides from spec.
   Add focused HTTP header regression and show baseline failure before edits.
3. Move shell/header to root, disable nav prefetch and remove home duplication.
   Preserve page main/h1, guards and RecipeSearch composition. Restyle existing
   family/account/invite wrappers and controls per spec without changing effects.
4. Run required checks below. Add/run focused Chrome helper using existing
   fixtures; inspect all listed routes/widths and representative screenshots.
5. Record exact results in verification.md. Independent security/final reviewers
   assess diff/evidence; fix findings and rerun affected checks. Orchestrator
   records decisions, stages/secret-scans and commits locally. Stop at human merge.

Only listed application/test files change. No auth-policy/session/store/provider,
photo/recipe components, existing tests, config, manifests/lockfile, migrations or
assets change. Declare/review justified departures before applying them.

## Required commands

```sh
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm test
pnpm run test:family
pnpm run test:auth
node --import tsx --test tests/deployment/*.test.ts
node --import tsx tests/auth/browser.ts
node --import tsx tests/family/browser.ts
node --import tsx tests/auth/shared-layout-browser.ts
python3 -m unittest discover -s tests
git diff --check
python3 scripts/scan_secrets.py --staged
```

Run type generation/build serially and serialize server/database suites as
needed. Orchestrator runs feature-plan sync over the full staged baseline diff,
org loop/message/memory/workflow checks and ledger validation. No paid provider,
hosted database, deployment, push or merge commands.

## Risks and completion

Static root presentation plus unreachable-database public tests protect account
access/logout recovery; existing auth/family suites protect eligibility/effects.
Root owns global sizing to avoid doubled padding/min-height; inspect 320px and
1440px with long data. Brand stays a link and home h1 stays “Meal Planner” to
preserve semantics and existing tests. Extra nav tab stops require semantic
browser targeting, without weakening existing tests. If dev-generated duplicate
LayoutProps occurs after an owned dev server stops, use only AGENTS' inactive
`.next/dev/types` private-backup procedure, never compiler/test suppression.
Completion requires passing checks, genuine browser evidence, security clear and
independent final approval. No release/staging action or human gate is implied.
