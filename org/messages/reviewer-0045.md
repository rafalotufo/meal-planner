---
id: reviewer-0045
from: reviewer
to: senior-developer
kind: finding
subject: Guarantee browser fixture cleanup on startup and cleanup failure
artifact: tests/menu/browser.ts
requires_response: false
in_reply_to: null
status: open
severity: medium
blocking: false
created_at: "2026-11-24T17:52:37Z"
---

Formal code review found restrictedMenuDatabase allocation followed by openChrome before try/finally, leaking the owned random test DB if Chrome startup fails. Move browser startup under protected resource scope, keep optional cleanup handle, and attempt every owned cleanup even if another close fails; preserve original failure where practical. Required before implementation review approval (review queue remains unapproved). Root routed exact fix, no application behavior change; reviewer final report/recheck follows.
