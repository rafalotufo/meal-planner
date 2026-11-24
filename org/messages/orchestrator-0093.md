---
id: orchestrator-0093
from: orchestrator
to: architect
kind: question
subject: Revise design for accepted asynchronous curation amendment
artifact: intent/recipe-url-menu/spec.md
requires_response: true
in_reply_to: null
status: answered
severity: null
blocking: false
created_at: "2026-11-24T22:12:40Z"
---

Owner chose durable immediate link save plus one bounded best-effort background source-curation attempt and explicit Retry if interrupted. Revise spec, preserve synchronous predecessor verbatim, define durable state/migration/grants, after() semantics, task authority, lease/generation race fencing and owner-visible limits. No implementation or infrastructure execution.
