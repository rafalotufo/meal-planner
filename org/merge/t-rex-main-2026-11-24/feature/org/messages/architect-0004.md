---
id: architect-0004
from: architect
to: orchestrator
kind: handoff
subject: Word Snack catalogue revised to 128 distinct puzzles
artifact: intent/recipe-waiting-game/spec.md
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-23T21:10:36Z"
---

Applied Rafael request to use 128 puzzles: exactly 128 unique IDs and genuinely distinct letter multisets, deterministic cycle after 128, >=10 supported 3–6-letter words and a six-letter answer per puzzle preserved. Increased serialized UTF-8 data design budget from 12 KiB to 64 KiB (512 bytes/puzzle average), explicitly not a measured implementation size. Added dated change note and catalogue validation requirements. Only spec revised; no code/data created and no blanket spec approval claimed. git diff --check passed.
