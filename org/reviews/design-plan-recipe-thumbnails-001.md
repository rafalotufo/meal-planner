# Design/plan review — plan recipe thumbnails

- Reviewer: reviewer (independent of architect)
- Date: 2026-11-26
- Source: `f06b361`
- Artifacts: `intent/plan-recipe-thumbnails/spec.md`, sibling `plan.md`
- Verdict: **Approved for local implementation** under the org peer gate

No blocking findings across bugs, security or compliance. No nits.

## Evidence

- Correctness/lifecycle: spec lines25–46 defines one fixed128px frame per primary
  recipe, null/load-error fallback, URL-specific failure state and source-keyed
  reset. This fits the shared draft/final/history grid in
  `app/plans/plan-controls.tsx:51–60` and preserves controls. Required real-HTTP
  swap and deterministic valid/null/404 checks at spec lines79–95 guard the
  meaningful failure→valid refresh case rather than testing source strings.
- Privacy/architecture: spec lines29–32 and50–57 preserves existing
  `unoptimized`, lazy, no-referrer loading from validated snapshots. This matches
  the existing picker at `app/plans/swap-recipe-dialog.tsx:41–49`; no storage,
  authentication, provider or server-fetch change is introduced. Pinned Next
  Image docs confirm empty alt, client onError and unoptimized original URLs.
- Accessibility/performance: fixed frame, object-cover and decorative semantics
  at spec lines25–43 avoid layout movement and redundant focus/announcements;
  mobile/desktop, overflow and keyboard verification is explicit at lines89–95.
  Existing seven-card bound and lazy loading remain intact.
- Scope/verification: plan lines11–22 limits application/test edits to two
  existing files; lines30–51 require a real failing browser assertion before
  implementation, preserve existing tests and avoid overwriting old screenshots.
  Existing Chrome transport intercepts deterministic images at
  `tests/auth/chrome.ts:57–59`; current harness already exercises real acceptance,
  finalization and retained deduplicated history. Plan lines68–89 retains required
  checks and documents the narrow generated-cache recovery rule.

Implementation and actual verification remain pending. This approval grants no
human merge, staging, hosted configuration or release authority. Review final
code and actual screenshot/test evidence separately.
