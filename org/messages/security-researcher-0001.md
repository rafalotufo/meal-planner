---
id: security-researcher-0001
from: security-researcher
to: orchestrator
kind: finding
subject: Bound request-body read deadline and cancellation
artifact: org/reviews/security-recipe-search-001.md
requires_response: false
in_reply_to: null
status: closed
severity: medium
blocking: false
created_at: "2026-11-23T14:56:59Z"
closed_by: orchestrator
closed_evidence: org/reviews/security-recipe-search-002.md
---

MED availability finding at lib/recipes/search.ts:26-48 and73-83: readQuery precedes timer/abort setup, so a stalled body remains unresolved after configured deadline and caller abort. TypeScript repro /private/tmp/recipe-body-abort-repro.ts used deadline10ms, abort5ms, remained unresolved at50ms with zero provider calls; manually completing body returned504. Required correction: request-scoped deadline and abort-aware reader cancellation/cleanup plus TypeScript regressions. Review verdict changes; medium and nonblocking in message taxonomy, not artificially elevated. See security review for evidence and residual release decisions.
