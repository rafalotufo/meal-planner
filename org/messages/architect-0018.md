---
id: architect-0018
from: architect
to: orchestrator
kind: handoff
subject: Review owner-directed eight-second per-item curation timeout
artifact: intent/brave-parallel-recipe-search/spec.md
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-25T17:48:40Z"
---

Owner steering ceo-0070 is incorporated into intent/spec/plan as proposed amendment:8second per-item cap from enqueue through response work, skip expired candidates and retain valid siblings, no retry/replacement, no cards plus any expiry ->SEARCH_TIMEOUT, parent abort still wins. Queued expiry never starts late; active body leases remain until work settles. Focused deterministic tests specified. Continue same correction loop and bounds; independent narrow approval before timeout code changes. No app edits or paid calls by architect.
