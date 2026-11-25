---
id: architect-0014
from: architect
to: orchestrator
kind: decision
subject: Clarify Unicode case folding for title search
artifact: intent/searchable-swap-picker/spec.md
requires_response: false
in_reply_to: null
status: closed
severity: null
blocking: false
created_at: "2026-11-24T22:04:45Z"
closed_by: orchestrator
closed_evidence: org/reviews/searchable-swap-picker-plan-001.md
---

Observed native PostgreSQL17 C locale lower(CRÈME)=crÈme. Existing pg_catalog.und-x-icu lower folds to crème. Use static schema-qualified collation only inside bound lower operands, preserve cursor ordering, no schema/deps/fallback. Native fixture support verified; hosted availability unverified and recorded as pre-release compatibility check. Root approved clarification; independent peer review requested.
