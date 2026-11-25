---
id: orchestrator-0164
from: orchestrator
to: architect
kind: handoff
subject: Document owner-directed eight-second item timeout
artifact: intent/brave-parallel-recipe-search/spec.md
requires_response: false
in_reply_to: null
status: closed
severity: null
blocking: false
created_at: "2026-11-25T17:47:18Z"
closed_by: orchestrator
closed_evidence: org/reviews/design-brave-parallel-timeout-001.md
---

Amend acceptedintent/spec/plan for new owner request:8-second perrecipe curation budget including sharedmodelqueue, independentitemcancellation skips slowcandidate preservingvalidsiblings, parentabortstillpropagates. No newcalls/dependencies/UI/hostedchanges; expiredallitems mustnotclaim genuinenoresults. Add slow/hung/mixed/queueddeadline regressions underexistingceilings. Independent reviewer approvalbefore timeoutcodechange; keep featureloop correctionphase, do not restartworkflow.
