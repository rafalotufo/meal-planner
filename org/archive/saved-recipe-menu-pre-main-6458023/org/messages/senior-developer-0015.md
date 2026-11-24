---
id: senior-developer-0015
from: senior-developer
to: architect
kind: question
subject: Pinned Next proxy stalls before menu body deadline
artifact: intent/saved-recipe-menu/plan.md
requires_response: true
in_reply_to: null
status: closed
severity: null
blocking: false
created_at: "2026-11-24T17:05:26Z"
closed_by: orchestrator
closed_evidence: intent/saved-recipe-menu/verification.md
---

Real HTTP menu tests25/26pass; stalled chunked POST /api/menu receives no400 by15seconds despite pure reader5second deadline pass. Investigate pinned Next16.4.6 pre-handler proxy body buffering and scoped supported mitigation preserving auth, Origin, all request limits, search runtime and test. Root named architect consultation read-only. Return concrete local doc/source evidence; no code or hosted effects.
