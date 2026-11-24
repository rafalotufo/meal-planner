# T-Rex Runner — replace Word Snack

- Author: Rafael (source); orchestrator (capture)
- Source: this Codex chat, “replace word snack. search for existing implementations of something like this that we could reuse”, followed by “I like t-rex runner”.
- Status: Accepted for Design — product-manager review org/reviews/intent-t-rex-runner-001.md
- Date: 2026-11-24

## Problem

Rafael prefers an immediately understandable jumping runner to the implemented
Word Snack word game during the reported 20–30-second recipe-search wait.
Replace Word Snack with the selected T-Rex Runner rather than offering a game
picker or retaining both games in the user experience.

## Proposed outcome

Reuse and adapt wayou/t-rex-runner, the Chromium-derived browser runner Rafael
selected. The dinosaur runs automatically; the player jumps over obstacles
using Spacebar while the game has focus, or a clear touch control on mobile.
Keep the recognizable T-Rex appearance and simple jump-only interaction.
One action starts play and restarts after a collision. Play remains optional.

Successful search completion makes recipes available immediately and announces
that they are ready without ending, resetting or stealing focus from play.
Users may continue playing and explicitly close the game to view the associated
results. Keep previous searches usable and preserve the existing notebook
behavior, including focus continuity. Errors must remain visible and must not
be hidden behind the game.

## Affected users and systems

Authenticated recipe-search users on desktop and mobile; the client game's
loading/ready lifecycle, rendering, inputs, tests and documentation. The server
session, recipe provider and guarded photo transport remain authoritative and
unchanged. Word Snack's reviewed history and audit records remain preserved.

## Constraints

- Vendor a reviewed, pinned upstream revision locally; do not embed the remote
  demo, fetch game code/assets from a CDN, or depend on its site at runtime.
- Preserve upstream copyright, BSD-3-Clause conditions and disclaimers,
  including Chromium attribution. Design must document the selected source
  revision, exact reused files, sprite provenance and license notices.
- Scope keyboard/pointer handling to the game. Space must still work in the
  recipe textarea and ordinary page controls. Release listeners, timers and
  animation frames on close/unmount; prevent orphaned singleton instances.
- Responsive local game viewport and large touch controls; visible focus,
  accessible labels/status, pause/resume controls and no required sound.
  Define reduced-motion and background-tab behavior in Design. The activity
  is optional; access to recipes never depends on reflexes or game progress.
- Keep game activity local and transient, with no game-related provider calls,
  analytics, persistent scores, identity data or database changes.
- No search dispatch/result delay or simulated search-progress claims. Preserve
  query validation, one-pending-request, generation/abort guards and source
  evidence. No auth, provider, photo transport, billing or deployment changes.
- Prefer existing browser/React/TypeScript tools; no game-engine dependency.
  Retain strict checking. Any vendored JavaScript exception needs an explicit
  reviewed integration/type boundary, not a blanket lint/type exclusion.
- Follow org/protocol.md, independent reviews and approved spec/plan before
  code. Application/browser helpers stay TypeScript; preserve Python workflow
  regressions and historical verification records.

## Acceptance outcomes

1. Word Snack's user-facing game is replaced by the selected local T-Rex runner.
   No word catalogue or word controls remain in the active game experience.
2. Desktop users can start, jump and restart through a clear keyboard flow;
   mobile users can do the same through a large labeled touch control.
   Obstacles must not require a second action such as ducking.
3. Successful and zero-result searches preserve open play and focus, announce
   completion, and offer explicit close/view-results navigation to the correct
   search. Existing history stays interactive.
4. Closing, navigation, errors and subsequent searches have defined cleanup,
   reset and focus behavior; no stale game/request can alter the next one.
5. Space in the recipe query never triggers jumping or suppresses typing.
   Game actions do not create recipe requests, expose input or persist scores.
6. Verify actual mobile/desktop rendering, keyboard/touch, collision/restart,
   pause/resume, resize, repeated mounts, tab visibility and continued play
   after recipes arrive. Run required tests, lint, types, build, auth and
   independent security/code/license review; distinguish fixtures from live
   provider evidence.

## Out of scope

Keeping Word Snack as a selectable alternative, new games, a human-character
reskin, multiplayer, leaderboards, saved scores, gamepad support, sound assets,
new backend infrastructure, paid calls, push, merge or production release.

## Open questions for Design

- Which exact upstream revision/files and local sprites will be reused, and
  how will original Chromium and extraction attribution be preserved?
- What minimal adaptation removes full-page/singleton coupling and duck-only
  obstacles while retaining the selected runner's recognizable behavior?
- Define the local mount/cleanup, pause/visibility/reduced-motion behavior and
  testable clock/randomness boundary. Specify forgiving jump-only difficulty.
- Map Word Snack's existing request/focus protections to the runner and identify
  obsolete application code/tests to remove without deleting historical audits.

## Research grounding

- Selected implementation/demo: https://github.com/wayou/t-rex-runner and
  https://wayou.github.io/t-rex-runner/.
- License inspected 2026-11-24:
  https://github.com/wayou/t-rex-runner/blob/gh-pages/LICENSE.
- Source inspected 2026-11-24:
  https://raw.githubusercontent.com/wayou/t-rex-runner/gh-pages/index.js.
  It identifies Chromium origin, exposes a window Runner singleton and uses
  document-level input listeners, so source reuse requires lifecycle and
  event-scope adaptation. Inspection is not integration/runtime verification.

## Approval limits

Rafael selected this direction and previously requested replacement of Word
Snack. This captures the selected intent for PM review; it does not approve an
unwritten specification, implementation plan, code, merge or release.
