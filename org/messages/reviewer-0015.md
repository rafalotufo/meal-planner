---
id: reviewer-0015
from: reviewer
to: orchestrator
kind: review
subject: T-Rex specification needs scoped Space scroll correction
artifact: org/reviews/spec-t-rex-runner-001.md
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-24T14:06:04Z"
---

One required P2 finding: spec lines14-22 ignore airborne/repeated Space but prevent scroll only for accepted jumps, allowing normal game input to scroll the page. Consume scoped surface Space regardless of logical jump acceptance; preserve textarea/native-button behavior and assert no scroll/double jump. Other lifecycle, fixed-world and provenance gates coherent. Primary pinned source/license/HTML checked; no runtime or cache changes. Human spec approval remains pending.
