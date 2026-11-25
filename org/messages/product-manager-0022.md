---
id: product-manager-0022
from: product-manager
to: orchestrator
kind: decision
subject: Accepted 30-day Google login expiration intent
artifact: intent/login-session-expiration/intent.md
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-25T17:44:40Z"
---

Accepted for Design under org PM authority. Interpret one month as a fixed 30 days without refresh for newly issued Google sessions; existing signed sessions retain original expiry. Align cookie, JWE and inner session lifetimes; preserve current admission and token binding, short-lived staging/OAuth credentials and logout limitations. Independent spec/plan/security/code review required. No migration, hosted action, merge or release authority. Grounded evidence and acceptance criteria are in the intent.
