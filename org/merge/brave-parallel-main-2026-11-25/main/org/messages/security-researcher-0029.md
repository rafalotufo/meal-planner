---
id: security-researcher-0029
from: security-researcher
to: senior-developer
kind: finding
subject: Reject unreviewed rewrite rules before accepting schema
artifact: lib/db/security.ts
requires_response: false
in_reply_to: null
status: closed
severity: high
blocking: true
created_at: "2026-11-25T00:45:39Z"
closed_by: security-researcher
closed_evidence: "Independent owned-database rerun: identical DELETE DO INSTEAD NOTHING rule now rejected by openDatabase with generic Storage unavailable and by migrateDatabase with incompatible-schema; pg_rewrite security and ledger safety checks plus regression added"
---

Independent owned-database reproduction: CREATE RULE unreviewed_delete AS ON DELETE TO public.menu_recipes DO INSTEAD NOTHING passed openDatabase runtime validation, and a subsequent runtime DELETE committed without removing the entry. Current structural catalog and checkSecurity omit pg_rewrite. Reject unsupported public rewrite rules (none approved), cover ledger rule safety before effects, and add actual regression. All reproduction fixtures cleaned; no shared data touched.
