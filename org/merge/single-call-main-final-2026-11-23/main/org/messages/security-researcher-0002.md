---
id: security-researcher-0002
from: security-researcher
to: orchestrator
kind: finding
subject: Reject raw controls before metadata URL normalization
artifact: org/reviews/security-recipe-photos-001.md
requires_response: false
in_reply_to: null
status: closed
severity: medium
blocking: false
created_at: "2026-11-23T16:25:38Z"
closed_by: orchestrator
closed_evidence: org/reviews/security-recipe-photos-002.md
---

MED input validation/source-binding finding in snapshot5cb9410 photo-metadata.ts:9-11: new URL(value.trim(),source) removes raw tabs/newlines before safeRecipeUrl can reject them. Independent TypeScript fixture /private/tmp/recipe-photo-control-character-repro.ts shows control-bearing image and Recipe identity accepted after normalization; zero network requests. Add pre-normalization raw-control rejection and failing TypeScript image/identity regressions. Existing final host/scheme checks remain: no private-fetch/credential/SSRF bypass is claimed. Review verdict changes; message severity medium, default nonblocking.
