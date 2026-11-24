---
id: orchestrator-0100
from: orchestrator
to: security-researcher
kind: handoff
subject: Assess transactional swap retention change
artifact: weekly-plan-swap-retention-implementation
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-24T20:13:24Z"
---

Review single scoped acceptance UPDATE and new metadata/concurrency/isolation regressions after allchecks green. Only same-slot competitors stale; unrelated pending currentcohort carried to new revision. Verify atomicity, pending unique/cap, historical/foreign isolation, staleclientguard, approvalreset and no new auth/schema effects. Independent source report required.
