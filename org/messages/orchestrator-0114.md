---
id: orchestrator-0114
from: orchestrator
to: senior-developer
kind: decision
subject: Keep async browser fixtures within approved test file
artifact: tests/plans/browser.ts
requires_response: false
in_reply_to: null
status: closed
severity: null
blocking: false
created_at: "2026-11-24T22:02:26Z"
closed_by: orchestrator
closed_evidence: intent/searchable-swap-picker/verification.md
---

Developer reports existing CDP helper lacks arbitrary response-body races. Browser-file-only one-shot window.fetch Response/ReadableStream fixtures are within approved manifest for malformed/oversized/late-body cases. Restore transport reliably; all normal security, isolation, stale and mutation flows retain real protected HTTP. No production bypass/helper/dependency changes. Record boundary in verification.
