---
id: reviewer-0045
from: reviewer
to: senior-developer
kind: finding
subject: Reject non-string curation enum states
artifact: lib/menu/validation.ts
requires_response: false
in_reply_to: null
status: closed
severity: medium
blocking: false
created_at: "2026-11-24T22:56:37Z"
closed_by: orchestrator
closed_evidence: intent/recipe-url-menu/verification.md
---

P2 exactsource742ce99 validation.ts61 coerces state using String before enum membership; state:[ready] is accepted. Persisted parser69 repeats. Require typeof string and exact enum membership; add wrong JSON type/public+row regressions. See changes_requested code-recipe-url-menu-001 review gate. Final code and security confirmation required for corrected source.
