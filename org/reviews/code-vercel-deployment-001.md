# Independent code review — Vercel deployment

Reviewer: independent `vercel_code_reviewer`, under `org/roles/reviewer.md`.
Date: 2026-11-23. Base: 96f3154. Initial reviewed revision: 7a97280.

## Round 1

Verdict: CHANGES REQUIRED. Findings: 0 Blocker, 0 Major, 1 Minor.

Minor at tests/deployment/smoke.ts:81: native fetch redirect:error throws before
candidate status handling, so a platform login redirect was reported as failed
rather than inconclusive. The synthetic 302 test and real HTTP test disagreed.

Author response: candidate fetch failures now mean no confirmed application
result and return inconclusive; redirects are still refused and output remains
sanitized. Confirmed incorrect app statuses/cache remain failures. Updated
regression expectations to the approved inconclusive contract: two tests failed
false != null before the fix, then all 11 passed. No assertion removed, no
existing application test changed. Runbook documents the distinction.

Initial AC coverage: local D1/configuration, D2/upload isolation, D3/regressions,
D3a/cancellation probe, D4/WAF probe and D5/D6/operator procedure implemented;
hosted checks remain explicitly unverified and gated. Changed files match plan.
Independent review's local HTTP bind was sandbox-restricted; implementation
verification ran the same suite with approved local HTTP permission.

Repeat code/security review is required for the fix before local readiness.

## Round 2 — revision 55e9de7

SDLC REVIEW: vercel-deployment
Findings: 0 Blocker, 0 Major, 0 Minor, 0 Pre-existing — nothing to fix
Verdict: READY FOR HUMAN REVIEW.

Independent reviewer confirmed the fix holds: native candidate redirect refusal
is inconclusive; actual incorrect application responses still fail. Assertions
enforce the approved contract rather than weakening protection. Added workflow
helper/auth commands preserve coverage and run authentication after build.
Independent repeat ran ten non-HTTP tests; the author ran all eleven with
approved server permission. No remote exists in this checkout, so PR creation
cannot proceed; human local merge remains gated.

## Live verification helper delta — 4197f6e

Read-only review of4ed41ea..4197f6e: zero findings, READY FOR HUMAN REVIEW.
Actual Vercel root307 uses relative /sign-in. Helper now resolves that URL
against validated origin and compares exact expected destination; status/cache
and no-follow checks remain. Foreign/path/query cases retained. New regression
failed before fix; all12 helper tests and lint/typecheck pass. Independent
targeted execution passed4 tests. No deployed application code changed.

## Final release evidence review

Independent documentation review: zero Blocker, Major or Minor findings.
The prior Minor is resolved: the release report enumerates remaining browser
and transport evidence gaps and preserves their requirements. The approved
amendment covers only the unobserved hosted timeout evidence. Production is
paused and acceptance remains incomplete. READY FOR HUMAN REVIEW applies to
these records; it is not release-completion approval.
