---
id: security-researcher-0031
from: security-researcher
to: orchestrator
kind: review
subject: Login session expiration local security approval
artifact: org/reviews/login-session-expiration-security-001.md
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-25T17:54:22Z"
---

Approved local source and verification scope with no blocking findings. Fixed30day Google session and JWE lifetimes preserve no-refresh, HTTPS cookie defaults, current admission/family and token binding. Account-data remains3600seconds; synthetic credentials unchanged. Longer copied-cookie replay window and browser-local logout are documented. Reviewed recorded passing auth16/family35/menu69/verification29/deployment40/Python7 and Chrome390/1440 evidence. No hosted, merge or release approval.
