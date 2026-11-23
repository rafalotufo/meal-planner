# Word Snack — implementation plan

- Derived from: sibling spec.md, approved by Rafael after the 128-puzzle amendment; org/reviews/spec-recipe-waiting-game-human-approval-001.md.
- Author: senior-developer
- Status: Approved
- Approval: Rafael; org/reviews/plan-recipe-waiting-game-human-approval-001.md
- Date: 2026-11-23

## Scope and architecture

Add optional inline six-letter play to the existing authenticated search page.
RecipeSearch owns request association; WordSnack renders native controls; pure
client-safe modules own round transitions and the authored catalogue. Keep the
game mounted after success, independent of loading. Results render immediately
and explicit dismissal opens/focuses the completed search. No backend, provider,
auth, transport, dependency, lockfile or persistence change is planned.

## Files that change

- app/recipe-search.tsx
- app/word-snack.tsx
- app/search-notebook.tsx
- lib/word-snack.ts
- lib/word-snack-puzzles.ts
- lib/recipes/notebook.ts
- tests/recipe-word-snack.test.ts
- tests/recipe-word-snack-catalogue.test.ts
- tests/recipe-notebook.test.ts
- tests/auth/browser.ts
- README.md
- intent/recipe-waiting-game/plan.md
- intent/recipe-waiting-game/progress.md
- intent/recipe-waiting-game/vocabulary.md
- org/messages/*.md
- org/reviews/*recipe-waiting-game*.md
- org/reviews/word-snack-*.png
- org/status.yaml
- org/loop/state.yaml
- org/loop/history.jsonl
- org/loop/archive/recipe-waiting-game-design-2026-11-23/*
- org/memory/context.md
- org/memory/events.jsonl
- gates/ledger.jsonl
- workflow-graph.yaml

## Ordered tasks and checkpoints

The checklist below is this feature's task list; repository intent/ conventions
override the planning skill's tasks/ defaults. No implementation occurs before
plan approval. Each slice records red/green evidence and an atomic save point.

### 1. Establish an executable baseline — small; no feature code

- [x] Confirm Node 24.x and pnpm 10.33.0; run frozen installation, then baseline
  pnpm test, lint, typecheck and build. Existing node_modules is absent and the
  prior install hit ENOTFOUND; obtain permitted registry access or report setup
  blocked rather than weakening checks or treating missing tools as passes.
- [x] Preserve untracked work/ and brainstorm-notes.md outside feature commits.
  Confirm real Chrome and isolated test-server prerequisites before UI work.

Dependencies: approved plan. Verify actual command output in progress.md.

### 2. Prove word rules and publish the catalogue — medium; four files

- [x] Write failing tests in both new recipe-word-snack test files, then add
  lib/word-snack.ts and lib/word-snack-puzzles.ts. Tests import these modules;
  the existing compiler follows imports, so no test-config change is needed.
- [x] Author exactly 128 unique six-letter multisets with unique IDs, >=10
  distinct supported 3–6-letter answers and a six-letter answer each; include
  repeated letters. Test ASCII, multiplicities, answer uniqueness and UTF-8
  JSON serialization <=65,536 bytes. Test catalogue order and wrap at 128.
- [x] Test case/trim, invalid characters/length, tile supply, typed input,
  duplicate acceptance prevention, delete/clear, rejected draft retention,
  accepted draft clearing, immutable transitions and all-answers-found play.

Dependencies: 1. Verify pnpm test red for missing behavior then green; report
measured catalogue bytes. No scraped/imported dictionary or generated endpoint.

### 3. Audit vocabulary and document coverage — small; two files

- [x] Review every authored rack/answer for familiar English, typos, proper
  names, abbreviations and excluded content; structural tests alone cannot
  establish lexical quality. Correct dubious entries, retaining all invariants.
- [x] Create vocabulary.md with authorship, selection rules, coverage limits
  and review evidence; add a source comment linking it from catalogue data.
  Have an independent reviewer audit the full catalogue before final acceptance.

Dependencies: 2. Verify catalogue tests again after content edits; record audit
coverage and limitations without claiming a comprehensive dictionary.

### Checkpoint A

- [x] Rules/catalogue tests, lint and strict typecheck pass; 128 distinct racks
  meet size/content requirements. No network or storage used by game modules.

### 4. Protect notebook focus — medium; three files

- [x] Extend tests/recipe-notebook.test.ts first for optional add-without-select
  and idempotent open-by-ID; preserve normal newest-opens, toggles, filters,
  sorts, repeated query IDs and unknown-ID handling.
- [x] Implement only those actions in lib/recipes/notebook.ts; add stable
  numeric search-panel metadata in app/search-notebook.tsx for parent focus
  detection. Existing heading IDs remain dismissal targets.

Dependencies: 1. Verify pnpm test red/green; no game coupling in notebook state.

### 5. Integrate accessible play and request lifecycle — medium; four files

- [x] Add request-ID round actions/tests to lib/word-snack.ts and its test:
  start hidden, pending open/close/reopen, ready without reset, closed/never-open
  completion, zero results, stale IDs, failure/abort discard and fresh searches.
  Invalid query/duplicate pending attempts do not consume another rack.
- [x] Compose app/word-snack.tsx from RecipeSearch with sibling word form,
  bounded input, six labeled tiles, feedback, found list and close control.
  Show Play only during pending search; no autofocus, global key handlers,
  extra requests, sound, animation, timer or persistent state.
- [x] Keep fetch dispatch immediate and existing generation/abort guards.
  Capture focused old notebook panel at response time, not submission time;
  add without selecting only when its controls would otherwise unmount.
  Success preserves game component identity, draft, found words and focus,
  updates one polite search announcement and a non-live game ready banner.

Dependencies: 2, 4. Verify unit tests, lint/typecheck/build; then focused real
Chrome smoke before polishing. Explicit ready-close dispatches idempotent open,
focuses search-heading-ID and scrolls without animation after commit. Pending
close returns focus to Play; error removal restores query focus only if needed.
Opening Play must leave focus on a retained control or transfer explicitly to
the game heading; never remove the focused launcher without a valid target.
Exhausting the focused tile transfers to the word input as specified.

### 6. Prove real browser behavior — small; one TypeScript harness

- [x] Extend tests/auth/browser.ts using its held CDP search interceptions and
  isolated authenticated server; permit explicit malformed-response fixtures.
  Preserve auth, provider-fixture and previous notebook regressions.
- [x] At 320/390/768/1024/1440px verify keyboard and touch interactions, 44px
  controls, 16px input, wrapping/contrast/focus and no overflow. Hold success
  mid-word; assert same focus/draft/letters/found words, then accept another
  word and close to the associated search after browsing another group.
- [x] Cover pending close/reopen, fast/long/zero success, no launch after closed
  success, new/invalid queries, old-panel focused success, focused/unfocused
  errors, malformed data and reload. Count recipe requests and inspect bodies;
  word Enter/tiles/clear/close cannot submit recipes or leak game words.

Dependencies: 5. Run node --import tsx tests/auth/browser.ts after build. Capture
word-snack-{pending,playing,ready,dismissed}-{320,1440}.png under org/reviews/.
Inspect screenshots, native names and live-region behavior; distinguish DOM/AX
inspection from actual screen-reader listening and disclose any untested case.
Browser responses are fixtures, not live provider evidence; no paid LLM calls.

### Checkpoint B and final verification

- [x] Document optional play, limited vocabulary, page-local state and continued
  play in README; record outputs/screenshots in progress.md. Run pnpm test,
  pnpm run lint, pnpm run typecheck, pnpm run build, then pnpm run test:auth.
- [x] Run python3 -m unittest discover -s tests; node --import tsx --test
  tests/deployment/smoke.test.ts; staged secret scan (zero findings); plan-sync
  hook with this plan; git diff --check. Recheck after material fixes.
- [x] Obtain independent code/content and security review against spec/plan and
  REVIEW.md; fix required findings, preserve tests and attach actual evidence.
  Stop before human merge/release gates; no deployment or push is authorized.

Dependencies: 3, 6. Healthy output means every required command exits 0 and
browser assertions/screenshots support the contract; never report missing tools
or unrun screen-reader/provider checks as successful verification.

## Risks, execution ownership and bounds

The largest risks are lexical errors across 128 authored puzzles and focus
loss during async success/error. Address these through full content review,
structural tests, held-response browser assertions and screenshot inspection.
Use one implementing developer for shared state/UI; independent reviewers
operate after stable checkpoints. Any delegated content work must be named,
bounded and isolated from shared application files; do not silently parallelize.

The org loop has max_turns=6; this draft uses turn 4, leaving two configured
turns for later dispatches. Implementation, security and final review cannot
all fit as separate turns. Do not raise/reset the budget, merge phases or
claim solved. The orchestrator must report exhaustion and obtain an explicit
continuation decision before any further dispatch beyond the configured bound.
Plan approval authorizes the scoped work, not a budget extension.
Proposed approval request: approve this plan and explicitly authorize a fresh
bounded implementation cycle, preserving the current cycle's history first.
Only the owner can authorize that next-cycle setup; this draft does not do so.

Rafael subsequently authorized continuing the SDLC org process in response to
the plan and fresh-cycle approval request. Preserve the design-cycle snapshot
at the manifest path above, carry forward its approved artifact decisions into
a new max-six-turn cycle, then implement and independently review. Do not
raise the six-turn bound or claim that replayed approvals are new reviews.
