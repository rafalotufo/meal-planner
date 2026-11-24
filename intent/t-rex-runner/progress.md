# T-Rex Runner — workflow evidence

Date: 2026-11-24

## Intake

Rafael requested replacement of Word Snack and selected wayou/t-rex-runner.
Captured intent.md; independent PM review accepted it for Design with no
blocking findings (org/reviews/intent-t-rex-runner-001.md, product-manager-0007).
Ledger product_owner_accept-013 records the PM decision. This is not human
approval of an unwritten specification or implementation plan.

Preserved the completed Word Snack cycle's state, history, config and graph at
org/loop/archive/word-snack-implementation-2026-11-24/ before initializing the
new feature. Graph paths now refer to intent/t-rex-runner/. Bounded turn 1
records intent review; no application code or assets have changed.

## Verification

- python3 -m unittest discover -s tests: 7 tests, OK.
- Configured acceptance run: Python, application tests, deployment smoke and
  lint passed; types/build/auth failed. Direct typecheck reproduced TS2300:
  duplicate LayoutProps declarations in .next/dev/types/routes.d.ts and
  .next/types/routes.d.ts. Both generated cache trees are included by the
  existing config; this predates new application changes.
- Preserved the pre-existing next-env.d.ts development-type imports and all
  untracked work/ and earlier brainstorm notes. No check/config was weakened.
- Verifying the unchanged committed application in an isolated temporary
  source snapshot with existing pinned node_modules, separate generated types
  and no copied local environment files: typecheck exit 0, production build
  exit 0 and auth exit 0 (12/12 tests). Snapshot:
  /private/tmp/trex-intent-baseline-g4j6t7cg. This verifies unchanged baseline
  source, not the unimplemented T-Rex game or the original dev cache state.
- License/source inspected through the upstream links in intent.md. This is
  source research, not integration, browser or T-Rex gameplay verification.

## Design handoff

Accepted intent committed caab317; architect dispatched to draft spec.md.
The source must be local/pinned with preserved notices, strictly typed at its
integration boundary, focus-scoped and cleaned up on unmount. Existing
Word Snack code remains until specification and implementation-plan approval.

Architect drafted spec.md using verified candidate revision
5455bfa408ec6b707c7300ff194b7390733a766d; asset hashes/dimensions and applicable
original Chromium notice must be resolved in planning before reuse. Bounded
turn 2 records draft_spec. Original-cache acceptance failures remain recorded;
isolated unchanged-source checks above are separate baseline evidence.

Independent review spec-t-rex-runner-001 required one correction: consume Space
on the focused game surface even when a jump is ignored, preventing accidental
page scrolling. Architect corrected it and added a browser assertion in
architect-0006. Focused review spec-t-rex-runner-002 approved with no remaining
required findings; reviewer-0016 records approval. Both review records remain.

The graph marks spec in_review, and org_loop.py next stops at
product_owner_approve. No plan, game assets or implementation were written;
no T-Rex gameplay, browser verification, merge or release is claimed.
