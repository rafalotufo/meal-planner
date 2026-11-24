# T-Rex Runner — specification

- Derived from: sibling intent.md, accepted for Design in caab317; org/reviews/intent-t-rex-runner-001.md.
- Author: architect
- Status: Draft — ready for independent and human review; implementation is not authorized.
- Date: 2026-11-24

## Product and interaction contract

1. Replace Word Snack with optional inline “T-Rex Runner” between search status
   and notebook. Show “Play T-Rex Runner” immediately on a valid pending search;
   never open, animate or focus it automatically. Opening transfers launcher
   focus to the named game surface and shows a static dinosaur/instructions.
2. A single Space press on that focused surface starts running and jumps;
   subsequent presses jump when grounded; after collision one fresh press
   restarts and jumps. A native button labeled “Jump” provides the same action
   on mobile and desktop; instructions explain start/restart. Use a fixed jump
   arc, ignore key repeat and airborne jump attempts; no held-key advantage,
   duck, double-jump, arrow-key interception, sound or game-engine dependency.
3. Bind Space handling only to the focusable surface itself, checking the event
   target. Consume/preventDefault on every Space keydown targeted at that surface,
   including repeated, airborne and paused presses whose game actions are ignored.
   Buttons keep native Enter/Space activation; do not double-handle their events.
   Textarea, notebook and ordinary page controls retain normal keys and touch
   scrolling. All buttons are type="button" outside the recipe form.
4. Show the original pixel dinosaur, running/jumping/crashed frames, ground and
   cactus sprites. Use only single small cacti: omit birds, large clusters,
   ducking, night mode, full-page intro and audio. Start with three seconds free
   of obstacles, constant speed <=240 logical pixels/second and no acceleration.
   Minimum cactus separation must exceed a complete jump plus 300ms of running;
   prove all generated patterns are jumpable. Score is elapsed running distance,
   stays local, stops on collision/pause and resets on explicit restart.
5. Provide visible Pause/Resume and Close game controls, concise instructions,
   score as ordinary text, and polite game status for started/paused/collided.
   Never announce frames, every score change or game progress as search progress.
   Keep existing stone/white/emerald styling, serif heading, visible focus and
   >=44px control dimensions. Earlier searches remain usable; no modal/focus trap.
6. Pause freezes physics, score and spawning. Leaving focus outside the entire
   game section, window blur, hidden document or enabling reduced motion pauses
   active play and cancels its animation frame. Return/visibility/focus never
   resumes automatically. Explicit Resume continues the same state only while
   visible and focused inside the game; Jump does not bypass a paused state.
   Reduced motion starts static like normal mode; explain that Start/Resume
   opts into motion, and retain Pause and Close. Preference changes pause again.

## Request association and focus

7. RecipeSearch retains request generation, one-pending guard, validation and
   abort ownership. Each actual valid search discards prior play and creates a
   fresh hidden round synchronously without delaying fetch. Invalid queries
   preserve existing play and use existing validation focus; rejected duplicate
   pending submits create neither round nor request. Never derive game identity
   from loading, readiness count or selected notebook entry.
8. Pending Close cancels animation, preserves the round snapshot paused and
   returns focus to the launcher. Reopening restores that snapshot paused
   (initial unstarted rounds stay idle). Closing never cancels a recipe request.
   Never-opened or closed rounds are discarded when their request succeeds;
   success must not offer a new game. Preserve a focused launcher as “View
   results” navigation until explicit activation so focus is not stranded.
9. Successful and zero-result responses add notebook history immediately. Open
   play retains component identity, dinosaur/obstacles/score/mode and exact
   focus; completion never pauses/restarts play, scrolls or steals focus. Add a
   non-live ready banner and update the existing single polite atomic search
   status: “Recipes ready — [n] found. Keep playing or view results.” Zero uses
   “Search finished — no matches. You can keep playing or view your search.”
10. Keep existing add-without-select behavior when focus is inside an earlier
    notebook result panel at completion. Preserve that panel, exact focused
    control, filters and sort; otherwise newest opens. Explicit “Close game and
    view results” (zero: “Close game and view search”) discards play, idempotently
    opens its associated request ID, then focuses search-heading-ID and scrolls
    without animation after commit, even after browsing another group.
11. Errors/malformed responses close and discard play, expose existing errors
    and retain notebook history. Restore query focus only if the removed game
    or launcher held it; otherwise leave focus alone. Stale success/error IDs
    cannot change current play. Abort/navigation discard state and all game
    resources; navigation needs no focus restoration. Reload clears scores.

## Typed adaptation and resource ownership

RecipeSearch owns round association/open/readiness and a retained snapshot. A small
client runner component owns DOM events, canvas and the mounted animation loop;
a client-safe pure TypeScript module owns immutable simulation state, jump,
obstacle generation and collision. Define explicit idle/running/paused/crashed
modes and pause reasons; paused carries its resumable state. Inject delta time
and seeded randomness into pure transitions, never read Date/DOM/fetch/storage
there. On pending close return the snapshot to the parent for reopening; parent
discards it on completion while closed, failure or replacement. Keep recipe
data, identity and queries out of the game interface.

Adapt selected upstream calculations and sprite coordinates into strict TS;
do not execute its window.Runner singleton or vendor unchecked JS with blanket
lint/type exclusions. Reuse the relevant Trex jump/animation, running collision
boxes, collision helpers, small-cactus and horizon/sprite drawing portions of
index.js. A source map in the provenance note must identify retained upstream
symbols/ranges and intentional changes. No upstream HTML/CSS/scripts execute.

Use a fixed 600×150 logical world, uniformly scaled and centered within a
responsive canvas container up to 600px wide with >=128px reserved height.
Rendering and collision share logical coordinates; CSS sizing and DPR affect
only presentation/backing resolution. Resize/DPR changes redraw without reset
or collision-coordinate changes. Keep pixel rendering crisp and controls/text
outside canvas. Canvas has an accessible name/instructions and fallback text;
DOM status exposes mode and actions without requiring pixel interpretation.
Asset/context failure shows “Game unavailable” with Close/results usable;
search continues and the failure schedules no animation.

Use one requestAnimationFrame at most while running, fixed physics substeps
<=1000/60ms and a maximum accepted frame delta of 50ms; drop excess elapsed
time, never catch up after suspension. Starting/resuming resets the previous
frame timestamp. Collision immediately stops the loop. Cleanup is idempotent:
cancel frame, disconnect resize observer, remove visibility/blur/media listeners,
invalidate pending image callbacks and release canvas references on close,
replacement or unmount. Strict Mode remounts cannot duplicate loops/listeners.

## Upstream provenance and review gate

Selected revision: `5455bfa408ec6b707c7300ff194b7390733a766d` (resolved from
[upstream commit history](https://github.com/wayou/t-rex-runner/commits/gh-pages/)).
Inspected pinned [index.js](https://raw.githubusercontent.com/wayou/t-rex-runner/5455bfa408ec6b707c7300ff194b7390733a766d/index.js),
[LICENSE](https://raw.githubusercontent.com/wayou/t-rex-runner/5455bfa408ec6b707c7300ff194b7390733a766d/LICENSE) and
[index.html](https://raw.githubusercontent.com/wayou/t-rex-runner/5455bfa408ec6b707c7300ff194b7390733a766d/index.html) on 2026-11-24.
The HTML identifies assets/default_100_percent/100-offline-sprite.png and
assets/default_200_percent/200-offline-sprite.png; copy those original local
sprites without reskinning. Planning must verify their pinned bytes/dimensions
and record SHA-256 hashes, exact destinations and source URLs before reuse.

Retain the complete upstream BSD-3-Clause license, its copyright, source's
Chromium copyright and @liuwayong extraction credit in redistributed source
and shipped third-party notices. Also preserve the applicable Chromium BSD
conditions/disclaimer; [current Chromium LICENSE](https://raw.githubusercontent.com/chromium/chromium/main/LICENSE)
is research context, not a verified historical license pin. Planning must
resolve/document the applicable original Chromium notice and sprite provenance,
with independent license review before reuse; unresolved attribution blocks
vendoring. Serve notices locally with a visible game attribution/notices link.
No mutable runtime URL, CDN, iframe, remote font, audio or game analytics.

## Removal, tradeoffs and acceptance evidence

Remove app/word-snack.tsx, lib/word-snack.ts, lib/word-snack-puzzles.ts and
obsolete word/catalogue tests/imports. Replace browser word-game assertions with
runner tests while preserving meaningful search/notebook/auth regressions.
Update current README; retain prior intent/spec/plan, vocabulary, screenshots,
reviews, archives and audit evidence as historical records.

Typed adaptation costs more than dropping in upstream JS, but bounds ownership
and makes physics testable. Fixed-world scaling keeps collision invariant;
mobile sprites shrink, so actual narrow-width recognition is a review criterion.
Constant speed, small cacti and generous gaps deliberately reduce difficulty.
No backend, auth, provider, photo transport, persistence or deployment changes.

| Area | Required evidence before completion |
| --- | --- |
| Pure TS/native Node tests | Start/jump/landing, airborne/repeat rejection, seeded obstacle gaps/jumpability, collision/restart, score, pause/resume, delta cap/substeps; immutable state; request-ID stale guards; pending close/reopen; success/zero continuation; invalid/new search; failure/discard. |
| Real browser at 320/390/768/1024/1440px | Keyboard/touch start-jump-collision-restart, targets/focus/overflow and visible sprites; focused-surface rejected/held Space leaves page scroll unchanged; textarea Space unaffected; native button Space fires once; blur, visibility, manual and reduced-motion pause with explicit resume; resize/DPR continuity. |
| Held-response browser fixtures | Same game/focus/score trajectory after success/zero; continued play then associated-results focus; focused old-panel retention; focused/unfocused failure; launcher completion handoff; closed/never-opened completion; new search/reset. |
| Browser lifecycle/isolation | Instrument frames/listeners from test harness only: repeated open/close and navigation leave zero owned frames/listeners, remount leaves one loop, hidden/crashed/paused leave none. Count recipe POSTs: game actions make zero; pending duplicate remains one. No provider calls or production fixture endpoint. |
| Source/license/security | Verify exact pinned assets/hashes, adapted-source mapping, all notices shipped and locally readable; no singleton/global input interception, external calls, storage or auth/provider/transport weakening; independent code/security/license review. |

Use existing strict TypeScript application/browser helpers and native Node
runner; label fixtures separately from live provider evidence. Capture and
inspect mobile/desktop idle, running, paused, crashed, ready and dismissed UI.
Run frozen install, pnpm test, lint, typecheck, build, test:auth after build,
Python workflow tests, deployment smoke, staged secret scan, plan-sync and diff
checks. Record actual exits and screen-reader verification limits. Existing
duplicate generated LayoutProps in coexisting .next/dev and .next/types is a
baseline cache issue; isolated unchanged-source types/build/auth already pass
per progress.md. Do not change config or weaken checks to conceal it here.
Independent spec review, human spec approval and an approved sibling plan are
required before implementation; human merge/release gates remain in force.
