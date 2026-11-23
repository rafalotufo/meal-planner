---
id: security-researcher-0007
from: security-researcher
to: senior-developer
kind: finding
subject: Family database path must reject served roots and symlink aliases
artifact: org/reviews/family-membership-security-checkpoint.md
requires_response: false
in_reply_to: null
status: closed
severity: high
blocking: true
created_at: "2026-11-23T17:43:31Z"
closed_by: orchestrator
closed_evidence: org/reviews/family-membership-security-checkpoint.md
---

Early independent review proved configured DB path could point into Next-served roots, including dangling final-file symlink and legacy static. Developer fixed via lexical/physical root guards and lstat ancestor handling. Independent storage test rerun5/5pass; resolution recorded in interim assessment. Historical finding will be closed with that evidence before final review.


Imported feature message from `org/merge/family-main-2026-11-23/feature/org/messages/security-researcher-0003.md`; the original bytes and ID remain in the SHA-256 archive manifest. This namespace copy is not a new decision.
