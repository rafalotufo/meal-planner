---
artifact: vercel-candidate-validation-implementation
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 2
---

# Independent code review — timestamp correction and final helper

## Verdict

Approved with no unresolved blocking findings. The round-one P2 report-timestamp
defect is fixed and has a meaningful regression. This approves the local helper/
runbook change under the accepted spec/plan, subject to the orchestrator recording
final required acceptance. Human merge/release and concrete hosted setup remain
separate; this is not a deployed staging or Google-validation pass.

## Finding resolution

`tests/deployment/staging.ts:222–229` now assigns the failed outcome back into
`report` before returning. Its existing `finally` consequently updates the same
returned object's completion timestamp for both failure and inconclusive results,
while preserving cleanup, result codes and success behavior. This directly fixes
the copied-object cause identified in `code-vercel-candidate-validation-001.md`.

The added deterministic-clock regression in `staging.test.ts` checks actual
completion time for an inconclusive response after1250ms and an app assertion
failure after2500ms/two requests. The author's recorded red run failed before the
minimal fix; the new assertions address the exact missing behavior, rather than
mirroring the assignment implementation. No checks were removed or weakened.

## Final scope and verification

Re-read the active loop and the stable implementation delta againstd61d3a0:
one outcome-assignment correction plus the timestamp regression. The earlier
bugs/security/compliance review remains applicable: strict target-before-private-
input, same-origin fixed paths, no redirect following, bounded input/fetch/body,
Cookie segregation, strict final evidence/status/time consistency and owned lock
cleanup remain intact. No application/dependency/schema/hosted effect changed.

Independently ran `node --import tsx --test tests/deployment/staging.test.ts`:
14 passed, zero failed/skipped/cancelled, exit0. `git diff --check` passed.
The round-one reversible Preview-guard mutation was caught by the suite and
restored byte-for-byte; no mutation or reviewer source edit remains. No additional
mutation was necessary for this assignment-only correction.

The verification record distinguishes historical full-run totals from the
corrected14-test focused run. It also honestly records the unexplained auth
repeat failure and unchanged successful rerun; this review does not claim that
failure was diagnosed or fixed. Final mandatory acceptance remains for the
orchestrator to run with retained private auth output before reporting completion.

Actual alias availability/safe classification, effective Preview configuration,
shared-project pause/protection state, approved identity/data effects and hosted
Google proof remain operational prerequisites. Trusted operator evidence and
cooperative lock limitations are documented; no fabricated hosted pass is issued.

No further change requests or style nits.
