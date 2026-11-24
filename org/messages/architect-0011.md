---
id: architect-0011
from: architect
to: orchestrator
kind: answer
subject: "Re: Revise design for accepted asynchronous curation amendment"
artifact: intent/recipe-url-menu/spec.md
requires_response: false
in_reply_to: orchestrator-0093
status: closed
severity: null
blocking: false
created_at: "2026-11-24T22:14:30Z"
closed_by: orchestrator
closed_evidence: org/reviews/spec-recipe-url-menu-002.md
---

Revised save-first async specification complete at intent/recipe-url-menu/spec.md. Preserved synchronous predecessor verbatim in design-history/synchronous-spec.md. Atomic pending save, Next after one bounded attempt, durable state/manual Retry, guarded same-ID updates and no resurrection; local reviewed migration/catalog/grants required, no hosted execution. See revised spec for owner-visible limits.
