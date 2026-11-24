---
artifact: vercel-candidate-validation-implementation
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: changes
round: 1
source_commit: d61d3a0
---

# Independent code review — isolated staging helper

## Verdict and required correction

Changes requested for one bounded reporting defect. No auth, credential-forwarding,
Production-effect or false-pass vulnerability found. The implementation is otherwise
consistent with the approved local operator-tooling scope. Human merge/release and
hosted setup remain separate.

### [P2] Bugs — failed checks retain a false completion timestamp

`tests/deployment/staging.ts:222–228` returns `outcome(report, ...)`, which spreads
a copy, before `finally` updates the original report's `endedAt`. Failure and
inconclusive results therefore retain their initial completion timestamp, even
when requests consumed time. Success returns the same report object and works.
This violates the helper's recorded start/end evidence contract and gives failure
investigations an incorrect run duration; it cannot upgrade a failed run to pass.

A deterministic exported-API probe with an incrementing clock and rejected fetch
returned `reason: REQUEST_UNAVAILABLE`, identical startedAt/endedAt, a100ms failed
check elapsed time and four clock calls. The completion timestamp should reflect
the final clock observation. Assign the outcome back to `report` before returning
(or construct the final copy after setting end time), and add a regression for a
delayed failed/inconclusive check. Preserve the existing success/cleanup semantics.

## Review performed

Applied code-review-and-quality five axes and REVIEW.md bugs/security/compliance
passes. Read active loop, accepted intent, approved spec/plan, helper/tests,
staging runbook, verification and independent implementation security review.

- Correctness: exact public schemas and target-before-input ordering; strict check
  sequence/status/pass/reason consistency; pre/post/source/Production drift,
  timestamp order and owner booleans; no anonymous-only overall pass.
- Security: private input bounds, fixed same-origin paths, manual redirects,
  anonymous/member Cookie segregation, platform bypass scope and sanitized
  reports. The helper has no hosted deployment/configuration/database effects.
- Architecture/readability: cohesive operator-only native API implementation with
  no app/dependency/schema changes; trusted operator evidence limits are explicit.
- Performance: finite request counts, byte bounds, abort races for fetch/body/
  private input, timer/reader cleanup and local exclusive lock ownership.
- Compliance: source/deployment attribution and real Google versus fixture/session
  reuse proof remain separate. Runbook CLI examples match the parser and reserve
  successful overall validation for finalization with complete owner evidence.

The recorded unexplained auth-repeat exit1 followed by unchanged12/12 success is
transparent in verification.md; it is not claimed fixed. The coordinator will
retain output and rerun required acceptance. Actual free alias/classification,
Preview config, project paused/protection state and hosted Google validation remain
unverified operational prerequisites rather than implementation success claims.

## Independent verification

- Focused helper suite:13 passed, zero failed/skipped/cancelled, exit0.
- Required reversible mutation experiment: inverted Preview guard in a temporary
  byte copy; focused suite failed exit1. Restored exact original helper bytes in
  finally, then reran focused suite13/13 successfully. No mutation remains.
- Deterministic failed-report timestamp probe reproduced the finding above.
- `git diff --check`: exit0.

No external actions, application code changes or new tests were made by this
reviewer. The author owns correction and regression tests; the orchestrator owns
shared audit state and commits. No style nits are requested.
