---
id: orchestrator-0094
from: orchestrator
to: reviewer
kind: question
subject: Review save-first curation specification amendment
artifact: intent/recipe-url-menu/spec.md
requires_response: true
in_reply_to: null
status: closed
severity: null
blocking: false
created_at: "2026-11-24T22:14:30Z"
closed_by: orchestrator
closed_evidence: org/reviews/spec-recipe-url-menu-002.md
---

Owner changed from fetch-before-save to immediate durable URL save followed by bounded best-effort curation and explicit Retry if interrupted. Independently review revised spec, including new migration/grants, job authority/lease/generation, removal-resave fencing, after semantics, safe transport, pending display and polling. Prior synchronous review is historical only. Produce org/reviews/spec-recipe-url-menu-002.md with evidence and verdict; do not approve owner gate.
