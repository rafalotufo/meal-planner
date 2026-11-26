# Plan recipe thumbnails — implementation plan

- Author: architect
- Date: 2026-11-26
- Status: Approved
- Independent approval: `org/reviews/design-plan-recipe-thumbnails-001.md` (`277aa47`), reviewing `f06b361`
- Inputs: accepted sibling `intent.md`; proposed sibling `spec.md`
- Gate: independent spec/plan approval before application code

## Files that change

- `app/plans/plan-controls.tsx`
- `tests/plans/browser.ts`
- `intent/plan-recipe-thumbnails/intent.md`
- `intent/plan-recipe-thumbnails/spec.md`
- `intent/plan-recipe-thumbnails/plan.md`
- `intent/plan-recipe-thumbnails/verification.md`
- `org/reviews/plan-recipe-thumbnails-*.png` (new browser evidence only)

The orchestrator owns org graph/config/state/history/status/messages/reviews,
compact memory and append-only gate evidence separately. No other application,
configuration, dependency, schema or fixture-helper file is expected to change.
Update this manifest and review material departures before expanding scope.

## Ordered tasks and checkpoints

1. **Approve design.** Independent reviewer checks sibling spec and this plan,
   especially fixed frame, error-state reset, decorative semantics, direct-image
   privacy and deterministic browser evidence. Orchestrator records approval.
   No implementation before this checkpoint.
2. **Prove missing behavior.** Extend only `tests/plans/browser.ts` with focused
   assertions for every primary card, stable fallback, valid/null/404 fixture
   images and swap refresh. Use its existing image interception and real plan
   read/HTTP mutation helpers. Ensure initial or explicitly selected primary
   fixtures cover all image outcomes deterministically. Retain all existing
   picker, approval, confirmation, history and variable-card-count checks.
   Record the expected failing command/assertion before modifying application
   code. New tests remain strict TypeScript; no mirrored source-string test.
3. **Render thumbnails.** Add one small thumbnail function in
   `app/plans/plan-controls.tsx`, using existing client boundary and URL-specific
   failure state. Insert it above the title, key it by recipe identity, use the
   fixed128px frame and established lazy/unoptimized/no-referrer policy. Keep
   article/source/control selectors and mutation behavior intact. Run focused
   browser checks to prove red→green, including failure→valid accepted swap at
   the same slot. This is one small slice across two implementation files.
4. **Verify actual UI and regressions.** Run required lint/typecheck/build and
   the existing relevant regression commands below. Run the full real-Chrome
   plan harness at320/1440px, inspect screenshots of draft/final/history and
   null/broken/valid images, and record outcomes and limits in `verification.md`.
   Change screenshot output prefixes in this harness to this feature's name so
   new observations do not overwrite prior scheduler evidence. Keep screenshot
   count bounded to useful representative states. Do not rewrite old evidence.
5. **Independent review and handoff.** Security reviewer checks direct-image
   privacy, family/snapshot isolation and unchanged data/auth surfaces; code
   reviewer compares final diff and actual evidence to spec/plan. Fix concrete
   findings with focused verification. Commit each artifact/increment after
   staged-secret scanning. Present source/review evidence for the human merge
   gate. No push, merge, staging deployment or Production action occurs here.

Tasks2→3→4 are sequential because they share one browser fixture and application
path. No extra implementation stream or reusable-image refactor is needed.

## Verification commands

Use Node24.x and pinned pnpm10.33.0. `pnpm install --frozen-lockfile` completed
successfully during design, with435 exact packages and no lockfile change.
Application verification results remain to be produced by the implementer.

- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run build`
- `node --import tsx tests/plans/browser.ts` (owned Chrome/DB/server/profile;
  expected red first, green after implementation; inspect emitted screenshots)
- `pnpm run test:plans`
- `pnpm test`
- `pnpm run test:family`
- `pnpm run test:menu`
- `pnpm run test:auth`
- `node --import tsx --test tests/deployment/*.test.ts`
- `python3 -m unittest discover -s tests`
- `git diff --check`
- plan-sync against this approved manifest; org loop/message/memory/workflow
  checks and append-only ledger verification through existing tooling
- `python3 scripts/scan_secrets.py --staged` (zero findings before commits)

Build before built-server regressions. The browser fixture uses its owned local
server and never development/hosted data or paid keys. If Next dev leaves the
known duplicate generated LayoutProps after its server stops, move only inactive
`.next/dev/types` to a private temporary backup and regenerate type/build output,
following AGENTS.md. Never exclude tests or relax strict checking.

## Risks and limits

Third-party photos may disappear; a fixed frame and URL-specific fallback keep
cards usable. Lazy images below the viewport require scrolling in browser
assertions. A valid replacement must recover from a prior failed photo without
stale component state. Existing read-only weeks must use persisted snapshots,
including photos after menu deletion, and remain immutable. Small screens must
retain wrapping titles and reachable controls. Local fixture UI evidence does
not certify real external photo hosts, hosted authentication or deployment.

No open question blocks the narrow design. All implementation remains behind
independent approval and the final human merge/release gates.
