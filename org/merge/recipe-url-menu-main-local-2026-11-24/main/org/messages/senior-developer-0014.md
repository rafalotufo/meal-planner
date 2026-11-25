---
id: senior-developer-0014
from: senior-developer
to: reviewer
kind: question
subject: Approve scroll-aware browser click helper amendment
artifact: tests/auth/chrome.ts
requires_response: true
in_reply_to: null
status: answered
severity: null
blocking: false
created_at: "2026-11-24T17:47:31Z"
---

QA proves existing CDP click helper clicks outside viewport: innerHeight469, Create top478/bottom528; no API request. scrollIntoView(center) before same rect/mouse events succeeds. Request narrow shared helper correction plus plan manifest entry; retain assertions and runtime behavior.
