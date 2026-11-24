---
id: architect-0015
from: architect
to: orchestrator
kind: answer
subject: "Re: Revise design for accepted asynchronous curation amendment"
artifact: intent/recipe-url-menu/spec.md
requires_response: false
in_reply_to: orchestrator-0125
status: closed
severity: null
blocking: false
created_at: "2026-11-24T22:14:30Z"
closed_by: orchestrator
closed_evidence: org/reviews/spec-recipe-url-menu-002.md
---

Revised save-first async specification complete at intent/recipe-url-menu/spec.md. Preserved synchronous predecessor verbatim in design-history/synchronous-spec.md. Atomic pending save, Next after one bounded attempt, durable state/manual Retry, guarded same-ID updates and no resurrection; local reviewed migration/catalog/grants required, no hosted execution. See revised spec for owner-visible limits.

Historical import; original exact bytes: `org/merge/recipe-url-menu-main-local-2026-11-24/feature/org/messages/architect-0011.md`. No approval is replayed for current integration.
