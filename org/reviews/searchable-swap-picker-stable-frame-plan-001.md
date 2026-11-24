# Searchable picker stable frame — independent amendment review 001

Independent reviewer; writer: senior-developer. Date:2026-11-24.
Reviewed active follow-up loop and appended stable-frame spec/plan against the
current max-height-only dialog, org protocol/reviewer role, REVIEW.md and
code-review-and-quality skill.

Verdict: **Approve bounded fix plan. No required findings.** No application or
process edits were performed by this reviewer.

- Bugs: the diagnosed intrinsic-height collapse is consistent with reset clearing
  result cards while only max-height constrains the centered dialog. An explicit
  viewport-bounded frame and full-height inner flex wrapper address that geometry
  directly, preserving correct immediate stale-result/selection clearing. Actual
  Chrome red rectangle measurements are still required before CSS edits.
- Security: CSS-only frame sizing introduces no query, cancellation, validation,
  captured-target, mutation, identity, image or data boundary change. Keeping the
  existing network lifecycle untouched preserves its established safeguards.
- Compliance: the change addresses the owner's flicker report inside the same
  manifest. Stable x/y/width/height within1px at fixed viewports, normal viewport
  adaptation, min-height-zero result scrolling and outer overflow escape are
  coherent. No JS measurement, stale-data retention, masking animation, new
  dependency/helper or product behavior is needed.

The proposed browser regression is appropriately observable: populated results,
successive typed/debounced/delayed states, no matches, returning results, error
and selection at320/768/1024/1440×1000 plus320×568. It must fail on the old CSS,
then pass without loosening tolerance or removing existing search/planning/race
assertions. Verify reachable search/close/Cancel/confirmation, long header/footer
content, focus/dismissal,44px close and no horizontal overflow; inspect refreshed
mobile/desktop and short-viewport screenshots.

Design approval does not claim the diagnosis is yet reproduced or source fixed.
Private lint/typecheck/build/browser evidence, affected checks, source equivalence
and independent final approval remain outstanding. Root preserves the owner's
server/cache/next-env bytes and owns commits/audit/gates. No data, hosted,
deployment, merge or release operation is authorized.
