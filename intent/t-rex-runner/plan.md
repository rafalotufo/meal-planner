# T-Rex Runner — implementation plan

- Derived from: sibling approved spec.md; human approval at org/reviews/spec-t-rex-runner-human-approval-001.md.
- Author: senior-developer
- Status: Approved
- Approval: Rafael; org/reviews/plan-t-rex-runner-human-approval-001.md
- Date: 2026-11-24

Replace Word Snack with the pinned, typed T-Rex adaptation. Every valid search
auto-opens/starts eligible play; success/zero immediately discards it, including
mid-jump/paused/crashed/hidden/loading states. No dependency or server-boundary
change. provenance.md contains actual pinned source/asset hashes and historical
Chromium license evidence; independent license clearance precedes reuse.

## Files that change

- app/recipe-search.tsx
- app/t-rex-runner.tsx
- app/word-snack.tsx
- lib/t-rex-runner.ts
- lib/t-rex-session.ts
- lib/t-rex-canvas.ts
- lib/word-snack.ts
- lib/word-snack-puzzles.ts
- tests/recipe-t-rex-runner.test.ts
- tests/recipe-t-rex-session.test.ts
- tests/recipe-t-rex-assets.test.ts
- tests/recipe-word-snack.test.ts
- tests/recipe-word-snack-catalogue.test.ts
- tests/auth/browser.ts
- public/games/t-rex/100-offline-sprite.png
- public/games/t-rex/200-offline-sprite.png
- public/games/t-rex/THIRD-PARTY-NOTICES.txt
- third_party/t-rex/LICENSE.wayou.txt
- third_party/t-rex/LICENSE.chromium.txt
- README.md
- intent/t-rex-runner/plan.md
- intent/t-rex-runner/spec.md
- intent/t-rex-runner/provenance.md
- intent/t-rex-runner/progress.md
- org/messages/*.md
- org/reviews/*t-rex-runner*.md
- org/reviews/t-rex-*.png
- org/status.yaml
- org/loop/state.yaml
- org/loop/history.jsonl
- org/memory/context.md
- org/memory/events.jsonl
- gates/ledger.jsonl
- workflow-graph.yaml

Manifest includes removals. Delete only the five obsolete Word Snack source/test
files listed above after replacement coverage exists; retain all old feature
artifacts, vocabulary notes, screenshots/reviews/archives and unrelated work/.
Keep existing notebook reducer/focus support; no change to filters/sorts/auth.

## Ordered tasks and checkpoints

This feature-local checklist is the task list; intent/ conventions override
the planning skill's default tasks/ path. Write failing TS/native-runner tests
before each behavior change; preserve red/green output, then save small slices.

### 1. Clear provenance and verification setup — no implementation

- [x] Independently review provenance.md: complete pinned upstream BSD notice,
  original Chromium/extraction credit, historical Chromium BSD and exact-match
  original sprites. Block reuse until notice/mapping questions are resolved.
- [x] Confirm Node 24.x/pnpm 10.33.0/frozen dependencies, Chrome and isolated
  fixture server prerequisites; record actual baseline and cache limitations.

Dependencies: human-approved plan and license clearance. No new package,
unchecked vendored JS, remote execution, .env copying or public auth exception.

### 2. Prove jump-only simulation — medium; module and test

- [x] Write recipe-t-rex-runner tests first; implement immutable create/jump,
  tick/collision/restart and pause/resume modes in lib/t-rex-runner.ts, using
  provenance-mapped jump calculations/running boxes. Inject dt and seeded RNG.
- [x] Fix world=600×150, speed <=240px/s, fixed jump, 3s obstacle-free start,
  single small cacti, no acceleration/duck/hold advantage. Prove jump landing,
  ignored repeat/airborne presses, collision/restart-jump and frozen score/state.
- [x] Cap accepted delta at 50ms, physics substeps <=1000/60ms; test huge/invalid
  deltas, immutable state and deterministic seeds. Set minimum spawn separation
  above maximum measured jump duration plus 300ms at chosen speed; test every
  generated gap and a simulated successful jump over the original hitboxes.

Dependencies: 1. Verify focused compiled/native tests red then green; no DOM,
clock, Date, fetch, storage or recipe data in simulation.

### 3. Prove request lifecycle — medium; module and test

- [x] Add recipe-t-rex-session tests then lib/t-rex-session.ts: actual start
  creates fresh visible request-ID snapshot; Hide/Show retains paused/crashed
  state only while pending; stale IDs ignored; success/zero/error/abort discard
  unconditionally. No deferred play/ready banner after results.
- [x] Cover invalid/duplicate pending submits preserving identity, replacement
  and explicit focus intents. Separate simulation state from current notebook
  selection; keep intent to autofocus invalidatable, never asset-triggered.

Dependencies: 2. Verify lifecycle tests red/green, including success in every mode.

### Checkpoint A

- [x] Pure tests, lint and strict types pass using the clean-source strategy
  below; no auth/provider/photo transport or dependency changes.

### 4. Vendor notices/sprites and render owned canvas — medium

- [x] After license clearance copy exact provenance bytes to manifest paths;
  write asset tests for SHA-256, dimensions, local paths and both full notices.
  Update provenance map to actual adapted exports; preserve source headers.
- [x] Implement lib/t-rex-canvas.ts as an instance-owned typed drawing/loading
  controller, not upstream Runner singleton. Use original running/jumping/crash
  frames, 1×/2× source offsets and ground/cactus regions; test crop bounds.
- [x] Mount it in app/t-rex-runner.tsx with named focusable canvas/fallback,
  DOM mode/status, score (not live), Jump, Pause/Resume, Hide and notice link.
  Reserve >=128px canvas area, fill available content width with the uniformly
  scaled 600×150 logical world (Rafael's approved implementation amendment), account
  for DPR without changing physics, >=44px controls and existing visual style.

Dependencies: 2, 3. Verify local asset/context failure shows Game unavailable,
search unaffected. One RAF only while running; reset time on resume; stop RAF
on crash/pause. Resize observer, blur/visibility/media listeners and image
callbacks belong to the instance and idempotently dispose; no late callback
may revive a hidden/completed/unmounted generation. No global input listeners.

### 5. Integrate auto-start/auto-close and remove Word Snack — medium

- [x] In RecipeSearch start visible state synchronously after valid submit and
  before dispatching existing fetch; do not await sprite/image callbacks.
  At initial commit focus surface only if initiating-form focus/user-interaction
  token is still eligible. Later interaction/terminal response invalidates it.
- [x] Scope Space to surface target, prevent scroll for every surface Space
  keydown, ignore repeat/airborne/paused actions; native buttons act once.
  Outside-section focus/blur/hidden/reduced-motion pauses and revokes asset
  autostart; only explicit Resume while visible/focused opts back into motion.
- [x] Hide disposes mounted resources, retains paused snapshot and focuses Show;
  Show restores paused state and surface focus. Success/zero discards everything
  immediately and focuses associated search only if removed game/Show held it;
  otherwise retain outside focus and old-panel selection. Errors restore query
  focus only if necessary. Preserve generation/abort, one-pending and notebook
  guards. Remove the five obsolete Word Snack source/tests/imports and update
  README only after equivalent runner coverage exists; preserve historical audits.

Dependencies: 4. Verify pure/integrated tests; no game actions submit recipe form,
request a provider, persist score or alter textarea Space/ordinary control keys.

### 6. Verify real browser resources and interaction — one TS harness

- [x] Replace word-specific assertions in tests/auth/browser.ts; retain search,
  auth, notebook/focus/photo and request-body regressions. Use held recipe and
  delayed sprite fixtures, harness-only RAF/listener instrumentation, no prod
  test endpoints. Assert zero owned resources after terminal transitions and
  Hide/unmount; repeated Show/Strict Mode ownership allows at most one loop.
- [x] At 320/390/768/1024/1440px verify auto-open/run, sprites, keyboard/touch
  jump/collision/restart, 44px controls, overflow, blocked surface Space scroll,
  unaffected textarea Space and one native button activation. Test reduced
  motion, focus/blur/visibility pauses, explicit resume and resize/DPR continuity.
- [x] Hold success/zero mid-jump and in paused/crashed/hidden/loading states;
  prove immediate discard/focus outcome, no late sprite start/focus, no extra
  POSTs and no continued game. Cover terminal-before-first-frame, focus-intent
  invalidation, old-panel/query focus, invalid/duplicate/new requests and errors.
  Capture/inspect t-rex-{loading,running,paused,crashed,dismissed}-{320,1440}.png.

Dependencies: 5. Label fixtures versus real publisher-image/live evidence; no paid
provider calls. Inspect AX names, live-region semantics and screenshots; disclose
actual screen-reader listening limits. Notices and sprites remain authenticated.

## Verification without disturbing the user's dev cache

Root next-env.d.ts already imports .next/dev/types; coexisting generated dev and
production LayoutProps caused unchanged-root types/build/auth failures. Preserve
that pre-existing file and active .next/dev cache; do not edit tsconfig, exclude
tests/types, suppress diagnostics or present those failed runtime exits as passes.

Use a fresh private/tmp source snapshot of the current approved implementation,
including all tracked changes/new manifest files/removals, excluding .git,
.next, build, node_modules, tsconfig.tsbuildinfo, .env* and unrelated work/.
Link the exact existing node_modules; record lockfile/source hashes. Run the
unchanged package commands from that snapshot; Next may regenerate next-env
only there. Compare implementation-file hashes back to workspace before using
evidence; any code change requires a fresh matching snapshot/relevant rerun.
Existing unchanged baseline /private/tmp/trex-intent-baseline-g4j6t7cg proved
strict types/build/auth can pass this way, not that new code is verified.

The org runtime also executes unchanged acceptance commands in the real
checkout. Plan approval authorizes a temporary generated-type isolation window
for that runtime: first verify .next/dev/types is a normal, non-symlink generated
directory beneath this checkout's owned .next tree, inspecting Next-generated
headers/metadata. Save the exact pre-existing next-env.d.ts bytes/hash and move
only .next/dev/types into a unique private/tmp holding directory. Leave dev
runtime JS and the rest of its cache intact. Run the unchanged strict commands
and org runtime; Next regenerates/checks the production types, rather than
excluding types or suppressing errors. In a finally step restore the held
directory and exact original next-env.d.ts. If dev activity regenerates types
or changes the generated env file during the window, preserve both versions
in separately named locations and report the conflict; do not overwrite either
copy or claim conflicting checks passed. This operation is not performed during
planning. Clean-source browser QA plus matching source hashes remains primary.

### Final checkpoint and independent review

- [x] Run frozen install evidence, pnpm test, lint, typecheck, build then
  test:auth, Python unittest discovery, deployment smoke and real browser in
  the matching clean snapshot. Copy only evidence screenshots back, never
  generated config/cache or secrets. Serialize Next builds/server checks.
- [x] Require zero command failures, zero unexpected browser errors and
  structural/behavior/resource assertions. Run staged secret scan (zero),
  approved-plan sync and diff check in workspace; record all actual exits and
  original-root baseline limitations in progress.md.
- [x] Obtain independent code/security/license review against spec/plan and
  provenance, fix required findings and reverify affected paths. Human merge
  and release stay gated; no push/deploy. Six-turn loop is currently at 2:
  plan=3, implementation=4, security=5, final review=6; do not extend/reset it.

Single developer owns request/UI/controller integration. Independent reviewers
own reviews. If delegating pure simulation, use a named bounded owner with an
agreed typed contract and disjoint files; do not overlap shared source edits.
