# Word Snack — completion-behavior amendment review

- Date: 2026-11-23
- Reviewer: product-manager (independent of orchestrator amendment)
- Artifact: intent/recipe-waiting-game/intent.md
- Consultation: org/messages/orchestrator-0019.md
- Verdict: Accepted for Design; supersedes automatic successful-completion dismissal in review 001
- Authority: org/roles/product-manager.md; org/org-chart.yaml intent gate

## Evidence and assessment

No required findings. Rafael explicitly clarified that search completion should
not end the game, should announce available results, and should let users close
the game. The source is quoted in intent.md:107–109 and recorded in the
orchestrator consultation. It supersedes the earlier brainstorm assumption
that successful arrival automatically ends play.

The amended outcome preserves the current letters, accepted words, draft and
focus after successful search completion, gives a results-ready notification,
and provides an explicit close/view-results control (intent.md:23–30).
Acceptance outcome 5 requires continued play without interruption, accessible
notification and user-controlled dismissal with meaningful focus recovery
(intent.md:70–76). Outcome 6 adds verification of mid-word arrival, continued
play and explicit dismissal (intent.md:77–81).

This remains consistent with optional play and immediate result availability:
the game cannot delay the underlying search or result rendering
(intent.md:45–46); users choose when to leave the game. Existing search groups
remain usable (intent.md:68–69). Error, cancellation and navigation still end
play without hiding errors, and new requests cannot inherit old game state
(intent.md:75–76). These distinctions are coherent and do not introduce a new
product ambiguity requiring CEO escalation.

## Design handoff and approval limits

Design must define the compact layout, results-ready notification and explicit
dismissal behavior, including focus recovery for zero-result searches and
errors. Success must not steal focus, reset state or unmount play. Vocabulary,
letter selection, reset rules and loading threshold remain the existing Design
questions; none blocks this amendment's intent acceptance.

The original review remains unchanged as historical evidence. This review
accepts the user-directed amendment under PM authority; it does not approve an
unwritten spec, plan, code, merge or release.

Checked the amended intent, consultation, original PM review and role card.
Document review only: no application tests, browser checks or live-provider
calls were performed. No implementation or verification claim is made.
