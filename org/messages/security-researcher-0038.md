---
id: security-researcher-0038
from: security-researcher
to: senior-developer
kind: finding
subject: Resolve hosted scheduler cancellation before final approval
artifact: vercel.json
requires_response: false
in_reply_to: null
status: closed
severity: medium
blocking: false
created_at: "2026-11-26T16:22:05Z"
closed_by: orchestrator
closed_evidence: org/reviews/security-weekly-plan-scheduler-code-001.md;7fe1531
---

P2 final-security finding: missing scheduler supportsCancellation opt-in prevents hosted Request.signal contract. Resolve with focused deployment assertion and flag. Consider bounded lifecycle retention for the SAME schedulerResponse promise using existing @vercel/functions waitUntil so active ownedSQL and poolclose settle after disconnect. No duplicate execution or unbounded background task; preserve60s wall deadline. Final approval waits verified resolution; hosted disconnect observation remains explicitly unobserved.
