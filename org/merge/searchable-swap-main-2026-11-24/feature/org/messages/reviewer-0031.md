---
id: reviewer-0031
from: reviewer
to: orchestrator
kind: review
subject: T-Rex code review needs revoked-autostart correction
artifact: org/reviews/code-t-rex-runner-001.md
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-24T14:55:39Z"
---

One required P2: failed initial autofocus eligibility leaves fresh simulation running; if canvas receives focus before held image completes, image.onload autostarts without Resume. Propagate revoked eligibility into paused state and add submit/refocus-before-initial-commit regression. Read-only controller probe reproduced 0-to-1 frame consequence. Other source/physics/provenance/cleanup checks clear. Mutation killed by two tests, exact source restored; all 15 focused tests pass. No build/auth/cache edits. Recheck after fix required.

Audit provenance: original feature message preserved at `org/merge/t-rex-main-2026-11-24/feature/org/messages/reviewer-0019.md` (source d9245f98693020bf3f94bc646345705a211a94b3).
