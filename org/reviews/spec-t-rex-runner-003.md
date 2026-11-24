# T-Rex Runner — automatic-lifecycle amendment review

- Date: 2026-11-24
- Reviewer: reviewer (independent of architect)
- Assignment: spec-t-rex-runner-002
- Verdict: Approved amendment for human specification review; no required findings

Focused review of the PM-accepted automatic-lifecycle amendment only. Reviews
001/002 remain historical; unchanged source reuse and rendering design were
not reopened.

spec.md:10–14 and 50–55 replace the optional launcher with a fresh visible
round on each actual valid search, starting when local assets are ready without
delaying fetch. Invalid queries and duplicate pending submissions do not reset
play. Reduced-motion/hidden/blurred states remain paused until explicit Resume
(39–46), consistent with the amended intent's accessibility exception.

The one-time initial-commit focus rule (56–61) is confined to the initiating
form and invalidated by subsequent interaction, completion or replacement.
It cannot be deferred to asset load. If users move elsewhere, focus remains
outside and play stays paused. Hide/Show exists only during the pending request
and restores a paused snapshot rather than silently resuming (62–66).

Success and zero results unconditionally discard visible/hidden/loading game
state in the response transition without waiting for physics or assets
(67–78). Focus moves to the associated heading only when the removed game/Show
control held it; otherwise outside focus and focused old-panel selection stay.
The former post-result ready banner, launcher and continued play are explicitly
removed. Errors and stale-ID guards remain coherent (79–83).

Resource rules (114–128) prevent delayed asset callbacks from restoring focus,
mounting or frames after termination and revoke initial autostart after
pause/outside interaction. Verification rows (168–171) replace continued-play
tests with automatic start, mid-jump/paused/crashed/hidden/loading completion,
fast completion before initial focus, late-assets cleanup, exact conditional
focus recovery and request isolation. No contradictory active continued-play
requirement remains; superseded behavior appears only in the dated change note.

Read amended intent, lifecycle requirements and verification rows; searched
remaining launcher/ready/continued-play references. git diff --check passed.
No app/source/assets, runtime, cache, loop or ledger changes were made. Human
full-specification approval, an approved plan, merge and release are not granted
by this peer review.
