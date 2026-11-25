---
id: security-researcher-0032
from: security-researcher
to: senior-developer
kind: finding
subject: Cancel rejected provider response bodies
artifact: lib/recipes/brave.ts
requires_response: false
in_reply_to: null
status: closed
severity: medium
blocking: false
created_at: "2026-11-25T17:23:16Z"
closed_by: security-researcher
closed_evidence: "Resolved in26f623d: lib/recipes/brave.ts13-15 cancels non-success body before rejection; tests/recipe-brave.test.ts32-36 covers cancellation. Independently ran compiled Brave/source seven tests:7pass,0fail. Formal whole-source security gate still pending."
---

Early read-only consultation on commit199f527: readProviderJson line13 throws on non-2xx without cancelling a present response body. Ensure the caller cancels its owned transport/controller or the body is cancelled before a job lease is released; add a slow/non-completing non-2xx body regression. New source/curator code is unfinished, so this is a cleanup checkpoint, not formal security clearance or proof of an exploitable final path. Preserve leases until actual owned work settles, including abort-ignoring fixture transports.
