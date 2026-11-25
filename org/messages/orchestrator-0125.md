---
id: orchestrator-0125
from: orchestrator
to: architect
kind: question
subject: Revise design for accepted asynchronous curation amendment
artifact: intent/recipe-url-menu/spec.md
requires_response: false
in_reply_to: null
status: closed
severity: null
blocking: false
created_at: "2026-11-24T22:12:40Z"
closed_by: orchestrator
closed_evidence: org/reviews/spec-recipe-url-menu-002.md
---

Owner chose durable immediate link save plus one bounded best-effort background source-curation attempt and explicit Retry if interrupted. Revise spec, preserve synchronous predecessor verbatim, define durable state/migration/grants, after() semantics, task authority, lease/generation race fencing and owner-visible limits. No implementation or infrastructure execution.

Historical import; original exact bytes: `org/merge/recipe-url-menu-main-local-2026-11-24/feature/org/messages/orchestrator-0093.md`. No approval is replayed for current integration.
