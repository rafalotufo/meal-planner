---
id: architect-0016
from: architect
to: orchestrator
kind: handoff
subject: Brave parallel search spec and plan ready for independent review
artifact: intent/brave-parallel-recipe-search/spec.md
requires_response: false
in_reply_to: null
status: closed
severity: null
blocking: false
created_at: "2026-11-25T17:14:55Z"
closed_by: orchestrator
closed_evidence: org/reviews/design-brave-parallel-001.md
---

Draft spec and plan define one Brave search, bounded deterministic collection expansion, 24 safe source attempts, 12 concurrent tool-free curations with global pools/byte bounds and cancellation, deterministic optional metadata from already-fetched HTML, and twelve-card chunked menu checks. No duplicate photo-fetch pass. Full1000-char user query retained for curation; bounded Brave query prefix has explicit recall limitation. No code/paid calls/hosted changes. Please assign independent reviewer before implementation.
