# Recipe result count — correction specification

This clarifies the existing six-card single-call search contract in
`intent/single-call-recipe-search/spec.md` for the reported broad-query case.

Change only research instructions: target six distinct recipes, explicitly name
common broad queries, and seek alternatives to unsuitable or duplicate sources
within the existing request budget. Fewer results remain valid when necessary.
Keep explicit query constraints and all grounding, validation, deduplication,
photo, cancellation, model, token/tool/body and request limits unchanged.

Fixtures can verify parser and request boundaries, but cannot prove the model
will retrieve six live recipes. Record this limitation; do not claim the reported
live searches are fixed without actual provider evaluation. Historical paid QA
authorization does not authorize new paid calls for this correction.
