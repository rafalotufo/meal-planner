# Word Snack — recipe-search waiting game

- Author: Rafael (source); orchestrator (capture)
- Source: brainstorming in this Codex chat; “Lets go with work snack. Use SDLC org skill for this intent”. Interpreted as Word Snack, the six-letter word game selected from round two.
- Status: Accepted — product-manager review, org/reviews/intent-recipe-waiting-game-001.md
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
Show recipes immediately when ready; finishing a word or round must never
hold results back. End play on success, error, cancellation, or navigation,
with no penalty for interruption. Do not steal focus when the game appears
or leave keyboard focus stranded when it disappears.

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
5. Search completion and failure end the game promptly; recipes and errors
   retain their existing behavior. Rapid/repeated searches and navigation
   cannot leak old game state into another request.
6. Verify touch and keyboard flows, announcements, focus recovery and readable
   layouts at mobile and desktop widths, including short/long waits and
   interruption mid-word. Verification must distinguish fixtures from live
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
- What compact layout and feedback keep previous results usable and make the
  transition to recipes accessible, including focus inside an interrupted game?
- Should the game appear immediately or after a short loading threshold?
  Resolve without delaying requests or results.

## Scope authority

Rafael selected Word Snack and requested the SDLC org intent workflow. This
records the selected concept, accepted by the product manager for Design; it
does not claim approval of an unwritten specification or implementation plan.
