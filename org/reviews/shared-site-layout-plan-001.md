# Shared site layout — independent specification/plan review

- Reviewer: reviewer (independent of architect)
- Date: 2026-11-24
- Artifacts: `intent/shared-site-layout/spec.md`, `intent/shared-site-layout/plan.md`
- Verdict: Approved after bounded plan correction

## Required finding resolved before approval

[P2, Bugs/Compliance] The original plan prohibited existing test edits while
requiring existing regressions to remain passing (`plan.md` original lines
40–45,116–117). `tests/auth/browser.ts:525` tabs once from initial sign-in
focus and line527 expects BUTTON; `tests/family/browser.ts:57` tabs once on
onboarding and line59 expects Join family. The proposed focusable brand and
Recipes/Family links precede those controls, so these assumptions cannot
remain valid. With explicit orchestrator authority, the reviewer amended the
plan manifest to include only these two browser helpers, requiring bounded
real keyboard traversal through the new header before retaining the original
control, visible-focus and activation assertions. Both optional browser helpers
must run. This adapts changed navigation semantics without suppressing tests
or weakening keyboard coverage. Their tracked historical screenshot outputs
must be privately backed up and restored exactly; new evidence uses the new
feature helper and filenames.

## Review evidence

- Root layout remains static and server-rendered, with no session/database
  reads (`spec.md` shared layout section). Existing page guards and auth policy
  remain untouched. Public sign-in/invite rendering with an unreachable database
  and anonymous protected-route redirects are explicitly tested.
- All shared links disable prefetch and contain no user/token/config data.
  Existing eligibility checks continue to gate home/family access; no new API,
  mutation, provider or paid effect is introduced by the shell.
- Header branding is a link, pages retain one h1/main and home h1 text remains
  Meal Planner. Existing account/invitation effects are preserved, including
  dynamic invite rendering and fragment handling.
- Static Tailwind classes reuse the current stone/emerald visual vocabulary.
  Required mobile/desktop, long text, labels/status/disabled/focus checks and
  genuine Chrome screenshots make presentation acceptance reviewable.
- Exact source/test/evidence/audit manifest, pinned local documentation,
  regression commands and independent final/security review are specified.
  No dependency, database, authentication, recipe or deployment scope expansion.

No unresolved blocking findings. Approval opens local implementation under
org protocol; human merge and release gates remain separate and unapproved.

## QA amendment review — approved 2026-11-24

[P2, Bugs; test-helper limitation] Independently inspected the developer's
`org/reviews/shared-site-layout-family-debug.png`: the family form email is
populated, while its submit control sits beneath the captured viewport.
`tests/auth/chrome.ts:61` computes the target's viewport rectangle immediately
and dispatches physical mouse coordinates without ensuring it is visible.
The family flow clicks that control before setting a larger viewport
(`tests/family/browser.ts:21`). Developer measured viewport469px and submit
top478/bottom528, no application errors and no invitation API request. This
supports the reported missed click, rather than an invitation behavior defect.

Approved manifest addition of only `tests/auth/chrome.ts`, permitting scroll
target into view before the same rectangle calculation and physical input
events. Preserve all assertions and rerun existing family and focused Chrome
QA. No production, auth, data or other helper semantics change is authorized.
The plan's scope paragraph now explicitly describes all three bounded existing
helper edits, resolving its stale blanket statement about existing tests.
