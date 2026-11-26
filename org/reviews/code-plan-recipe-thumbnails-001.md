# Code review — plan recipe thumbnails

- Reviewer: reviewer (independent of implementation)
- Date: 2026-11-26
- Reviewed source: `e16c6e9`, against `dcd34ca`
- Design approval: `277aa47`; security review: `794bd03`
- Verdict: **Approved for human merge review. No blocking findings or nits.**

## Evidence and assessment

- Correctness: `app/plans/plan-controls.tsx:8–12,60` adds only a small fixed-frame
  renderer, nullable/load-error fallback and source-keyed failure reset. It uses
  existing snapshot data; plan mutations and draft/final/history selection are
  unchanged. URL comparison also prevents an old failure hiding a changed URL.
- Tests: `tests/plans/browser.ts:39–70` compares actual browser cards with owned
  deterministic valid/null/404 snapshots, checks direct src/lazy/no-referrer/
  empty-alt/object-cover and128px bounded frames. Lines134–145 exercise accepted
  failed→valid and404 replacement refresh through real HTTP. Lines164–179
  exercise finalized and deduplicated historical snapshots after menu deletion,
  preserving raw history. Existing picker, approval and unique-count checks stay.
- Security/architecture/performance: unoptimized lazy images retain established
  direct browser loading and no-referrer privacy, with no endpoint, server fetch,
  DB, dependency, authentication or logging change. Decorative frames add no
  focus stop; existing titles/links/actions stay intact. Scope fits the approved
  two-file implementation manifest; no needless shared abstraction is added.
- Visually inspected all six draft/final/history320/1440 screenshots. Frames,
  fallback and photos fit the existing grid; long titles wrap and source/action
  controls remain visible. Evidence is local intercepted-fixture UI, not proof
  of third-party photo-host availability or a hosted deployment.

## Independent verification

- `git diff --check dcd34ca e16c6e9`: exit0.
- Mutation experiment: temporarily inverted `failedUrl !== imageUrl` to `===`
  and ran the existing browser assertions via a temporary dev-mode harness.
  It exited1 at `primaryThumbnails` line45: `Browser condition timed out:
  primary snapshot photo loaded`. The test detects the incorrect condition.
- Restored the exact source in `finally`, then ran the same harness's focused
  initial-thumbnail checks at320/1440: exit0, `Independent restored-source
  primary thumbnail check passed at320/1440`. No screenshots were overwritten.
  Original finally handlers closed the owned server/database/browser/profile;
  temporary harnesses and generated next-env changes were removed/restored.
- After owned dev shutdown, moved only inactive `.next/dev/types` to a private
  temporary backup as AGENTS directs; `pnpm run typecheck` regenerated route
  types and strict TypeScript passed, exit0. Tracked tree was clean before this
  review artifact; no mutation or generated file remains.

The implementer's `verification.md` records the full green Chrome harness,
308 Node tests,7 Python tests and lint/typecheck/build. Broad suites were not
repeated during review. This approval grants no push, merge, staging, hosted
configuration or release authority; human gates remain separate.
