---
source: form
record_id: authenticated-access-allowlist-001
received_at: 2026-11-23T15:50:51Z
author: rafael
priority: normal
---

## Summary

Restrict Google sign-in to an administrator-maintained Gmail allowlist in server code.

## Details

Owner request: I want to have an administrator list of google accounts that can sign in. This should be set up as a server side configuration, in code. The accounts should be specified by their Gmail email. Initial supplied list: thomasnlotufo@gmail, erikafn@gmail.com, aclotufo4@gmail.com. Owner subsequently confirmed the correction thomasnlotufo@gmail.com. Confirmed initial members: thomasnlotufo@gmail.com, erikafn@gmail.com, aclotufo4@gmail.com. This supersedes the earlier any-verified-Google-account assumption; no administration UI or role system is requested.

## Status

Owner subsequent addition, reported by the orchestrator: `rafalotufo@gmail.com`.
The confirmed final initial configuration contains all four addresses:
`thomasnlotufo@gmail.com`, `erikafn@gmail.com`, `aclotufo4@gmail.com`, and
`rafalotufo@gmail.com`.

accepted — product-manager; see `org/reviews/intent-authenticated-access-allowlist-001.md`.
