---
id: security-researcher-0032
from: security-researcher
to: orchestrator
kind: finding
subject: Exchange deadline blocked by Next Proxy dispatch
artifact: org/reviews/agent-deployment-verification-spec-security-001.md
requires_response: false
in_reply_to: null
status: open
severity: high
blocking: true
created_at: "2026-11-25T13:32:39Z"
---

Spec5s exchange body deadline is unenforceable while POST passes through pinned Next Proxy unfinished-body wait. Require exact session API exemption plus equivalent handler guard and no-EOF regression. See independent report; no implementation or hosted actions authorized.
