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
