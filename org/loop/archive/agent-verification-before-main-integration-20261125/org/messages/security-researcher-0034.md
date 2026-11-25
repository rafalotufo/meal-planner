---
id: security-researcher-0034
from: security-researcher
to: senior-developer
kind: finding
subject: Verification cleanup must reject cross-family dependent rows in both directions
artifact: lib/verification/operator.ts
requires_response: false
in_reply_to: null
status: closed
severity: high
blocking: true
created_at: "2026-11-25T14:51:30Z"
closed_by: orchestrator
closed_evidence: org/reviews/agent-deployment-verification-code-security-001.md
---

Independent fullreview: cleanup ownershippredicate covers verificationmember referenced byforeignplan, but currentdeleteofrows attached tosyntheticplan can remove approval/suggestion belonging toforeignuser. RequirebidirectionalfamilyownershipmismatchcheckbeforeanyDELETE and transactionrollback/noeffecttests. Mainseedchangesinflight; resolveonlyonindependentfinalsourcerecheck. No hostedoperations.
