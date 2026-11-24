# T-Rex Runner — PM automatic-lifecycle amendment review

- Date: 2026-11-24
- Reviewer: product-manager
- Artifact: intent/t-rex-runner/intent.md
- Verdict: Accepted for Design (amendment)
- Authority: org/roles/product-manager.md; org/org-chart.yaml intent gate

No blocking findings. Rafael's latest direction is automatic start when search
starts and automatic close when results arrive. The amended Proposed outcome
and acceptance outcomes 2–3 capture both changes, including zero-result success,
immediate cleanup mid-jump and no continued-play control after completion.
Invalid queries and rejected pending duplicates do not represent actual search
starts, so their exclusion is coherent. Manual pause/close preserves user
control during the wait without introducing a required Play step.

The reduced-motion static/paused opt-in exception and Design's background-tab
pause behavior are compatible accessibility/lifecycle qualifications. Scoped
input still allows ordinary query typing; automatic opening must not imply
stealing focus. Completion moves focus only when the removed game held it and
otherwise preserves earlier notebook interaction. Stale responses cannot
close a newer game. These requirements preserve search isolation and access.

This amendment supersedes the continued-play and explicit post-success
dismissal requirements in review intent-t-rex-runner-001.md. That review remains
historical evidence for the accepted base scope; all unrelated source/license,
jump-only, local-state and protected-system boundaries remain applicable.

Acceptance opens Design only. The request does not approve an unwritten
specification/plan, code, merge or release. Review was limited to the amended
intent against the supplied request and base review; no runtime tests or
external-source verification were performed.
