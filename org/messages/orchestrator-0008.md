---
id: orchestrator-0008
from: orchestrator
to: architect
kind: handoff
subject: Design reliable source recipe photos
artifact: intent/recipe-photos/research.md
requires_response: false
in_reply_to: null
status: closed
severity: null
blocking: false
created_at: "2026-11-23T15:43:50Z"
closed_by: orchestrator
closed_evidence: org/reviews/security-design-recipe-photos-001.md
---

PM accepted focused recipe-photos intent. Current UI has150pxthumbnail+2missingphotos; read-only original HTML exposes larger Recipe.image/ImageObject and og:image candidates for all3. Design provider-independent deterministic selection and tightly bounded SSRF-safe metadata retrieval, preserving fail-soft behavior and existing search deadline. No paid calls or app implementation before peer/security design review.
