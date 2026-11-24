---
id: architect-0007
from: architect
to: orchestrator
kind: handoff
subject: Automatic search/game lifecycle specification amended; architect idle
artifact: intent/t-rex-runner/spec.md
requires_response: false
in_reply_to: null
status: open
severity: null
blocking: false
created_at: "2026-11-24T14:12:17Z"
---

Revised Draft specification for Rafael automatic-start/automatic-close direction: every valid actual search opens and starts when local sprites are ready without delaying fetch; reduced-motion/hidden/blurred constraints pause. One initial guarded focus handoff from initiating search form, revoked by later user interaction or completion; asset callbacks never autofocus. Success/zero unconditionally discard even mid-jump/paused/crashed/hidden/loading, with removed-game/Show focus to associated heading and outside/old-panel focus preserved. Pending Hide/Show retains paused snapshot only until completion. Removed prior readiness/continued-play/Play launcher contracts and tests; added cleanup/focus/late-asset test matrix and dated change note. Pin/license/physics scope retained. Ready for independent recheck; architect idle. No code, assets, loop, graph, ledger or commits changed.
