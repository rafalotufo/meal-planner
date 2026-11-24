---
id: orchestrator-0031
from: orchestrator
to: architect
kind: handoff
subject: Amend T-Rex automatic search lifecycle
artifact: intent/t-rex-runner/spec.md
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-24T14:11:01Z"
---

User now requests auto-start on valid search, auto-close immediately on success/zero results. Intent updated. Revise all conflicting launcher/continued-play requirements and tests coherently; no fetch delay, no stale asset callback reopening after fast result, focus game at user search for Space without stealing later focus, reduced-motion static opt-in and pause/visibility controls, automatic cleanup/focus only if removed control held focus. Preserve old history and unrelated design. No code. Record amendment handoff for independent recheck.
