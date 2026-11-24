# Word Snack — recipe-search waiting game

- Author: Rafael (source); orchestrator (capture)
- Source: brainstorming in this Codex chat; “Lets go with work snack. Use SDLC org skill for this intent”. Interpreted as Word Snack, the six-letter word game selected from round two.
- Status: Accepted — product-manager reviews org/reviews/intent-recipe-waiting-game-001.md and org/reviews/intent-recipe-waiting-game-002.md
- Date: 2026-11-23

## Problem

Recipe search takes about 20–30 seconds according to Rafael. Users currently
wait without an optional activity. Offer a small game that makes this interval
pleasant while keeping recipe discovery the main task.

## Proposed outcome

Word Snack offers six letters from which users form words while search is
pending. Users can type or select letter buttons; each accepted word is a small
achievement. Explain the activity in one sentence and allow play to start
within seconds, without a separate game page or onboarding.

Play is optional and works on mobile and desktop with touch, mouse, and
keyboard. Preserve access to existing search groups and visible search status.
Make recipes available immediately when ready, announce that results are
available, and keep the game open with its current letters, words and draft
intact. Users may continue playing and choose when to close the game to view
their recipes. Provide a clear close/view-results control; do not require
finishing a word or round. Completion must not steal focus or automatically
dismiss play. End play on error, cancellation, or navigation, with no penalty
for interruption. Do not steal focus when the game appears or leave keyboard
focus stranded when users close it.

## Affected users and systems

Authenticated recipe-search users; the existing client search form, loading
state, and notebook layout. The game should run locally, separately from
provider requests, recipe evidence, authentication, and photo enrichment.
Rafael owns product decisions; the product manager reviews this intent, the
architect designs it, and independent reviewers assess design and code.

## Constraints

- Keep the warm stone/green visual direction, legible letters and controls,
  visible focus, large touch targets, screen-reader feedback, and narrow-screen
  layouts. No required sound, animation, dragging, or reflexes.
- No new game network requests or provider calls; do not delay search dispatch
  or result rendering. Keep search abort/stale-response guards intact.
- Prefer a small local English vocabulary with documented provenance and
  redistribution rights. Resolve size and accepted-word coverage in Design.
  Do not present unsupported words as universally invalid English.
- Keep game state transient within the page; no persistent scores, user
  profiling, or sending typed game words to the recipe provider.
- Preserve server session protection, server-only identities and all existing
  provider/photo transport safeguards. No new backend or dependencies without
  explicit scope review.
- Follow org/protocol.md, independent review, approved spec/plan before code,
  TypeScript application tests, required checks, and real mobile/desktop
  browser verification during implementation. Human merge/release gates stay.

## Acceptance outcomes

1. During a pending recipe search, users may form words from six available
   letters by typing or selecting accessible letter controls.
2. Accepted words receive clear feedback; repeated letters respect the supply,
   and repeated submissions cannot inflate progress. Invalid or repeated words
   receive neutral feedback without affecting the search.
3. Each playable letter set has supported answers. No completion requirement,
   timer, or losing condition competes with recipe arrival.
4. Previous search groups remain usable. Game interactions cause no recipe
   request, change to query semantics, or persistence.
5. Successful search completion makes results available and gives a visible,
   accessible results-ready notification without closing or resetting the game
   or interrupting an in-progress word. Users can keep playing and explicitly
   close the game to view results. The close/view-results control works with
   touch, mouse and keyboard and moves focus to a meaningful results target.
   Failure, cancellation and navigation end play without hiding errors.
   Rapid/repeated searches cannot leak old game state into another request.
6. Verify touch and keyboard flows, announcements, focus recovery and readable
   layouts at mobile and desktop widths, including short/long waits and
   results arriving mid-word, continued play after completion, and explicit
   dismissal. Verification must distinguish fixtures from live
   provider evidence; no paid calls are required for this feature.

## Out of scope

Search-speed improvements, additional games, leaderboards, accounts for games,
saved scores, multiplayer, external dictionary services, generated game content,
new database infrastructure, production deployment, or merge authorization.

## Open questions for Design

- Which redistributable vocabulary offers enough familiar words within a small
  local bundle? Define minimum word length, inflections, and excluded entries.
- How are solvable six-letter sets chosen, and when does a new search reset
  them? Define whether repeated letters and multiple words are supported.
- What compact layout, results-ready notification and close/view-results
  control keep previous results usable and make user-chosen dismissal
  accessible? Successful completion must preserve play and focus; define
  focus recovery for explicit dismissal and error interruption.
- Should the game appear immediately or after a short loading threshold?
  Resolve without delaying requests or results.

## Scope authority

Rafael selected Word Snack and requested the SDLC org intent workflow. This
records the selected concept, accepted by the product manager for Design; it
does not claim approval of an unwritten specification or implementation plan.
Rafael subsequently clarified: “Search completion should not end the game,
but should let the user know that results are available and allow them to close
the game.” This supersedes automatic dismissal on successful completion.
