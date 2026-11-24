# T-Rex Runner — independent product-manager intent review

- Date: 2026-11-24
- Reviewer: product-manager (independent of orchestrator capture)
- Artifact: intent/t-rex-runner/intent.md
- Verdict: Accepted for Design
- Authority: org/roles/product-manager.md; org/org-chart.yaml intent gate

## Assessment

No required findings. The recorded source request replaces Word Snack and
selects wayou/t-rex-runner. The proposed outcome preserves that recognizable
dinosaur runner, optional play, focused Space input and mobile touch jumping.
Jump-only obstacles and one-action start/restart are coherent constraints for
a short recipe-search activity. A picker, human reskin and additional games
are explicitly excluded.

The intent retains the existing product contract from
intent/recipe-waiting-game/intent.md and spec.md: successful and zero-result
searches make results available immediately while preserving open play and
focus, and explicit dismissal navigates to the associated results. Previous
searches remain usable; errors stay visible. New collision mechanics do not
make recipe access contingent on skill or progress.

Local pinned source/assets, transient game state, scoped input and cleanup
boundaries contain the replacement. No provider, authentication, photo
transport, database, analytics or deployment work is introduced. Attribution,
strict typing and independent license review are appropriate requirements;
the recorded source research is not treated as a completed integration audit.

## Design handoff

Resolve the exact revision, reused files and sprite/license provenance before
implementation. Define the adaptation of upstream singleton/document input
handling, jump-only obstacle selection, forgiving difficulty, mount/cleanup,
pause/resume, reduced motion and tab visibility. Map the existing request and
focus guards explicitly, including error/cancellation, subsequent searches,
closed games and explicit results navigation. Identify obsolete active Word
Snack code/tests while preserving historical artifacts. These are bounded
design questions and do not block acceptance of the product direction.

## Authority and evidence

PM acceptance opens Design only. Rafael's selection does not approve an
unwritten spec/plan, code, merge or release. Those gates remain intact.

Read the PM role, org protocol/chart/status, active loop state and intent,
prior Word Snack intent/spec and original PM review. This is a document review;
no runtime tests, external-source reinspection or live-provider calls were
performed. No implementation readiness or upstream license verification is
claimed.
