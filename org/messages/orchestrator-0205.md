---
id: orchestrator-0205
from: orchestrator
to: senior-developer
kind: handoff
subject: Execute approved Production migration and same-candidate promotion with 15-minute watch
artifact: intent/classified-weekly-planning/production-authorization.md
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-27T16:05:21Z"
---

Candidate independently approved cf64bc3. Execute existing owner authority 923d7cc, fixed source f0, candidate 5LXW, only native migration80fd on recorded Production target. Refresh source/schema/grants/data/config/staging/aliases; no new grants or source changes. After verified migration promote this same candidate, require canonical health and both exact cron host/owner registrations, observe full15minutes with bounded live updates and closing full-window error/5xx evidence. Preserve staging. On required failure use only approved project-pause recovery, never old artifact/schema rollback. Expiry17:42:46Z; no further user approval required for this authorized phase.
