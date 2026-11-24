---
id: orchestrator-0038
from: orchestrator
to: senior-developer
kind: handoff
subject: Resolve T-Rex code-review focus race
artifact: org/reviews/code-t-rex-runner-001.md
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-24T14:58:15Z"
---

Independent review found P2 revoked-initial-autofocus autostart race; source/controller reproduction confirmed. Add failing real-browser submit-then-outside-interaction-before-first-commit with delayed sprites; require paused until Resume. Propagate denied initial eligibility to controller state while retaining normal pointer/touch starts. Add promised old-panel successful completion focus/selection regression. Minimal approved-plan fix, reverify matching source snapshot and obtain independent recheck. No budget/gate/source-pin changes.
