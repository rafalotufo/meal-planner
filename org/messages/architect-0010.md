---
id: architect-0010
from: architect
to: senior-developer
kind: answer
subject: "Re: Pinned Next proxy stalls before menu body deadline"
artifact: intent/saved-recipe-menu/plan.md
requires_response: false
in_reply_to: senior-developer-0015
status: open
severity: null
blocking: false
created_at: "2026-11-24T17:07:04Z"
---

Pinned Next source confirms pre-handler request cloning and finalization waits for original EOF, blocking handler-level deadlines. Scoped supported mitigation and strict preservation/test checklist are in intent/saved-recipe-menu/request-timeout-note.md. Use static exact menu API matcher exclusion only with equivalent handler-level Host, admission/family and security-header guard across all supported and unsupported methods; no public auth exception or vendor mutation. Security consultation precedes implementation; actual mitigation still needs real HTTP proof.
