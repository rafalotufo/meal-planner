# Word Snack — specification

- Derived from: sibling intent.md; PM reviews 001/002; Rafael's “intent approved” following the continued-play amendment.
- Author: architect
- Status: Approved — Rafael; org/reviews/spec-recipe-waiting-game-human-approval-001.md
- Date: 2026-11-23

## Requirements

### Game and vocabulary

1. Offer Word Snack as optional inline play during a valid pending recipe
   search. A labeled “Play Word Snack” button appears immediately, without a
   loading threshold. Do not automatically open or focus the game. Intro:
   “Make words of 3–6 letters from these six letters.” Include “Uses a small
   word list. Your words do not affect your recipes.”
2. A round has six letter tiles, a labeled draft-word text input, Submit word,
   Delete letter, Clear word, a found-word count/list, and Close game. No timer,
   score multiplier, losing state, audio, animations or mandatory completion.
3. Author 128 fixed puzzle records locally, each with an ID, exactly six lowercase
   ASCII letters and at least 10 distinct supported English words of length
   3–6. Include repeated-letter racks. Every accepted word must fit the rack's
   letter multiplicities. At least one supported word uses all six letters.
   All 128 IDs and letter multisets must be distinct: reordering a rack's
   letters or assigning another ID does not create a different puzzle.
   Choose familiar neutral words; omit proper names, abbreviations, slurs and
   hyphenated/apostrophized words. Inflections are accepted only when explicitly
   listed. Records are a curated game vocabulary, not a complete dictionary.
4. Create this data by hand for this repository; do not copy or scrape a word
   collection, call a dictionary service, or add a package. Record its authored
   origin, selection rules and limited coverage in a feature-local vocabulary
   note and source comment. Keep serialized puzzle data <=64 KiB UTF-8 before
   bundler compression, a design budget averaging 512 bytes per puzzle rather
   than a measurement of data that already exists. Test the bound and every
   record's validity. This avoids
   an external redistribution dependency; any later imported dataset needs a
   separate provenance/license decision.
5. Select racks in deterministic catalogue order per valid search, beginning
   with the first on page load and cycling after 128. Every actual new request
   gets a fresh round, even for identical queries. Validation failures and
   rejected duplicate submissions must not advance the catalogue. No daily
   seed, clock, persistent storage or randomness is necessary.
6. Input supports direct typing/paste and tile-button entry. Normalize trimmed
   ASCII case on submission; permit only a–z after normalization, length 3–6,
   with no letter used more often than supplied. A tile appends its letter only
   while supply remains. Disable exhausted tiles and expose their remaining
   counts through accessible names; distinguish duplicate tile instances.
   Typing is bounded to six characters; invalid characters are rejected on
   submission with neutral feedback rather than silently reinterpreted.
7. Accept only listed words. Accepted input adds the normalized word once,
   clears the draft and reports “Added [word]. [n] words found.” A duplicate
   reports “You already found [word].” An unsupported word reports “Not in this
   game's word list. Try another word.” Supply/length errors explain the rule.
   Rejections retain the draft for editing. Delete removes the last character;
   Clear empties the draft; neither changes accepted words. No total-to-find
   requirement is shown. Finding every listed word simply leaves play usable.

### Lifecycle and results

8. Game lifecycle is independent of the request's loading flag. Store one
   current round associated with the existing request generation ID, with
   visibility, puzzle ID, draft, found words, feedback and optional ready-search
   ID. Opening/closing does not reset a round or affect request cancellation.
   Closing while pending returns to the optional launcher; users may reopen
   that same round until the request finishes. No launcher for starting play
   after completion if the game was never opened or was closed while pending.
9. On successful response, add/open the newest notebook search immediately
   through existing behavior, including a zero-recipe search. If the game is
   open, keep it mounted with identical letters, draft, found words and focus;
   set its ready-search ID and continue accepting words. Never condition
   rendering or component identity on loading alone. Results are available
   below the game; they are neither withheld until dismissal nor gated by game
   progress. If keyboard focus is inside an earlier notebook result panel when
   success arrives, retain that panel's selected/open state while adding the
   newest group, so its controls are not unmounted underneath the user. This
   narrow exception to newest-opens is independent of whether the game is open;
   explicit view-results still opens the new group. Otherwise retain existing
   newest-opens behavior.
10. Display “Recipes ready — [n] found. Keep playing or view results.” in the
    game; for zero recipes use “Search finished — no matches. You can keep
    playing or view your search.” Expose a single polite, atomic completion
    announcement through the existing search-status live region, with the
    keep-playing option when appropriate. The game's visible ready banner is
    not a second live region announcing the same completion. Never announce
    search progress as a function of game progress or guess a remaining time.
11. After success, change the dismissal action to “Close game and view results”
    (zero recipes: “Close game and view search”). Activating it closes and
    discards the round, ensures its associated notebook group is open, then
    focuses that group's existing heading button and scrolls it into view
    without animation. Do not toggle an already-open group closed. If a user
    browsed another group while playing, this action still targets the completed
    search, not whichever group happens to be selected. Do not reopen the game
    after this dismissal; the next valid search offers a new round.
12. Successful completion never moves focus or auto-scrolls. Error/malformed
    response closes/discards the game and retains the existing error and
    notebook behavior. If focus was inside the removed game, restore it to the
    recipe query input; otherwise leave the user's focus alone. Cancellation,
    abort or navigation discards associated state; navigation needs no focus
    restoration. Preserve original one-pending-request and stale-generation
    guards; stale responses cannot set readiness or mutate another round.
13. A valid subsequent request discards any previous completed round and starts
    a new hidden round. Its search ID is the only ID allowed to update game
    readiness. An invalid query leaves an already-open completed round intact,
    while existing validation focus/error behavior remains. Game submission is
    a sibling form, never nested in the recipe form; Enter in its input submits
    only a word. Every non-submit game control has type="button". No global
    keyboard listener intercepts typing in the query or notebook controls.

## UI and accessibility contract

Use the existing stone background, white surface, emerald controls, border
radius/spacing scale and serif heading treatment from the notebook/search UI.
The game is a compact named section below search status/errors and before the
notebook, not a modal, overlay or replacement page. Previous searches remain
fully interactive. The Play button may sit in the pending-status area; do not
nest interactive content inside the live region. No focus trap or autofocus.

Use six tiles in three columns at narrow widths and six columns where space
permits. Actions and the ready banner wrap; draft input and found-word list
cannot cause horizontal overflow. Every control has >=44px touch dimensions,
editable text >=16px, visible focus and text feedback independent of color.
Use ordinary buttons/input with visible labels, a section heading and a
separate polite game-feedback status. Do not announce each typed character or
the full found-word list repeatedly. Tile clicks leave focus on the tile;
successful submission preserves the initiating control's focus. Keyboard users
can type normally or Tab/Enter/Space through tile controls. Exhausting a tile
must not strand focus when a control becomes disabled: transfer to the word
input only when that focused tile is disabled by the user's own action.

On pending Close game, return focus to the remaining Play launcher. On explicit
post-success dismissal, move it to the associated search heading as above.
Support 320/390/768/1024/1440px without overflow, clipped controls or hidden
notebook content. No new motion or sound means reduced-motion use is static.

## Architecture and boundaries

Keep app/recipe-search.tsx as owner of request association and game lifecycle;
it composes a small WordSnack client component. A client-safe pure module owns
immutable round transitions, validation and the curated catalogue. Choose
component/module filenames and test manifest in plan.md before code. The
notebook's existing entry IDs/heading IDs support explicit results navigation;
add only narrow focus/open support and an add-without-select option for the
focused-old-panel case, without coupling game logic to recipe data or changing
filter/sort semantics.

Initialize small round state synchronously in the existing validated submit
path without waiting before fetch. Success updates notebook and readiness in
the same response branch; finally only ends loading. Do not add effect-driven
requests, providers, routes, server state or new cancellation controls. Keep
all game words local; no URL, logging, analytics or storage persistence. Render
input as React text and preserve server auth/identity, source evidence and
photo transport checks. Catalogue/data ships with existing client code; no
game-specific fetch, import-on-play download, external assets or dependency.

## Tradeoffs and resolved questions

- A small authored vocabulary avoids a downloaded dictionary, license sourcing
  and network latency, but rejects some valid English words. The visible small
  list disclosure and neutral rejection copy are required. Verify representative
  familiar answers in catalogue review; do not claim comprehensive validation.
- Fixed rack cycling bounds complexity and guarantees supported words. Players
  can eventually recognize repeats; unlimited variety is deferred.
- Inline optional play keeps earlier recipes reachable and avoids modal focus
  trapping. New results render below it while the player decides when to stop.
- Immediate optional launcher avoids timing machinery and opens only by user
  action. Very fast searches may finish before anyone opens the game.
- Persistent-on-success behavior explicitly supersedes the original automatic
  dismissal assumption. Error termination remains as accepted in the intent.
- No unresolved product questions remain for this specification. Rafael
  approved it after the 128-puzzle amendment. An approved implementation plan
  is still required before code; merge and release remain human gates.

## Verification plan

Use TypeScript tests with the existing compiler/native Node runner, naming new
behavior tests tests/recipe-*.test.ts so pnpm test includes them. No replacement
test framework, production fixture endpoint or fake-user bypass is permitted.

| Area | Required evidence |
| --- | --- |
| Catalogue | Exactly 128 records with unique IDs and unique letter multisets (compare sorted letters, not tile order); exactly six letters per rack; >=10 unique 3–6-letter answers each; ASCII/neutral manual review; full-rack answer; multiplicities; <=64 KiB serialized UTF-8 data design budget; authored provenance note; cycle only after 128 valid searches. |
| Word rules | Case/trim normalization; min/max length; unsupported characters; repeated-letter exhaustion; typing vs tiles; delete/clear; duplicate rejection; accepted/rejected draft behavior; immutable state; all-answers-found state. |
| Lifecycle | Pending open/close/reopen retains round; success preserves open state and draft/found words; closed/never-opened success stays closed; zero results stays playable; new valid search resets/cycles; invalid query preserves round; stale ID success/error ignored; abort/error cleanup. |
| Browser success | Open by touch/keyboard, enter partial word, complete intercepted request, assert same focus/draft/letters/found words; notification and results are available; submit another word; explicit dismissal opens/focuses the associated group even after browsing another group. |
| Browser history focus | Finish a request while focus is on an old result's filter/sort/link; preserve that open group and exact focused element, add new history, and verify view-results explicitly opens the completed group. |
| Browser failure | Error and malformed response while focused in game restore query focus and retain older searches; no focus movement when user is already elsewhere; closing while pending leaves the request running. |
| Browser isolation | Enter in word form never submits recipes; tile/clear/submit/close/reopen cause zero recipe requests; one pending recipe search remains enforced; game words absent from request body; reload discards state. |
| Layout/accessibility | Real browser at 320/390/768/1024/1440px; touch targets, contrast, focus, tile disable handoff, wrapping/overflow; native accessible names and polite status regions inspected; keyboard and screen-reader announcement behavior documented honestly. |

Extend tests/auth/browser.ts and its isolated authenticated test transport for
held/intercepted search responses. Label fixtures separately from live-provider
grounding; no paid/live search is required. Capture mobile/desktop pending,
playing, ready-still-playing and dismissed screenshots. Run frozen install,
pnpm test, lint, typecheck, build, test:auth after build, Python workflow tests,
deployment smoke tests, staged secret scan and plan-sync check. Record actual
outputs and limitations; missing dependencies are not passing evidence.

## Grounding and standards applied

Repo sources read: app/recipe-search.tsx (validation, generation, fetch, success,
finally and live status); app/search-notebook.tsx (entry heading IDs, toggle,
filters and responsive cards); lib/recipes/notebook.ts (add selects newest);
package.json (pinned tools and tests); prior notebook spec/plan; active intent;
org architect role and REVIEW.md. Apply frontend-ui-engineering skill's native
controls, local state, existing style and responsive/focus guidance. This is a
repo-grounded design proposal, not a claim of rendered UI verification.

## Change notes

- 2026-11-23: Rafael requested “Why only 12 puzzels? Lets use 128”. Increased
  the proposed catalogue and cycle to 128 genuinely distinct letter multisets;
  expanded the serialized-data design budget from 12 KiB to 64 KiB UTF-8.
  The minimum 10 supported words and six-letter answer per puzzle, authored
  provenance, local-only delivery and all other behavior remain unchanged.
  This amendment does not constitute approval of the full specification.
