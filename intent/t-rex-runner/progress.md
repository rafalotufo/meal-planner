# T-Rex Runner — workflow evidence

Date: 2026-11-24

## Intake

Rafael requested replacement of Word Snack and selected wayou/t-rex-runner.
Captured intent.md; independent PM review accepted it for Design with no
blocking findings (org/reviews/intent-t-rex-runner-001.md, product-manager-0007).
Ledger product_owner_accept-013 records the PM decision. This is not human
approval of an unwritten specification or implementation plan.

Preserved the completed Word Snack cycle's state, history, config and graph at
org/loop/archive/word-snack-implementation-2026-11-24/ before initializing the
new feature. Graph paths now refer to intent/t-rex-runner/. Bounded turn 1
records intent review; no application code or assets have changed.

## Verification

- python3 -m unittest discover -s tests: 7 tests, OK.
- Configured acceptance run: Python, application tests, deployment smoke and
  lint passed; types/build/auth failed. Direct typecheck reproduced TS2300:
  duplicate LayoutProps declarations in .next/dev/types/routes.d.ts and
  .next/types/routes.d.ts. Both generated cache trees are included by the
  existing config; this predates new application changes.
- Preserved the pre-existing next-env.d.ts development-type imports and all
  untracked work/ and earlier brainstorm notes. No check/config was weakened.
- Verifying the unchanged committed application in an isolated temporary
  source snapshot with existing pinned node_modules, separate generated types
  and no copied local environment files: typecheck exit 0, production build
  exit 0 and auth exit 0 (12/12 tests). Snapshot:
  /private/tmp/trex-intent-baseline-g4j6t7cg. This verifies unchanged baseline
  source, not the unimplemented T-Rex game or the original dev cache state.
- License/source inspected through the upstream links in intent.md. This is
  source research, not integration, browser or T-Rex gameplay verification.

## Design handoff

Accepted intent committed caab317; architect dispatched to draft spec.md.
The source must be local/pinned with preserved notices, strictly typed at its
integration boundary, focus-scoped and cleaned up on unmount. Existing
Word Snack code remains until specification and implementation-plan approval.

Architect drafted spec.md using verified candidate revision
5455bfa408ec6b707c7300ff194b7390733a766d; asset hashes/dimensions and applicable
original Chromium notice must be resolved in planning before reuse. Bounded
turn 2 records draft_spec. Original-cache acceptance failures remain recorded;
isolated unchanged-source checks above are separate baseline evidence.

Independent review spec-t-rex-runner-001 required one correction: consume Space
on the focused game surface even when a jump is ignored, preventing accidental
page scrolling. Architect corrected it and added a browser assertion in
architect-0006. Focused review spec-t-rex-runner-002 approved with no remaining
required findings; reviewer-0016 records approval. Both review records remain.

The graph marks spec in_review, and org_loop.py next stops at
product_owner_approve. No plan, game assets or implementation were written;
no T-Rex gameplay, browser verification, merge or release is claimed.

## Automatic search lifecycle amendment

Rafael requested auto-start when search starts and auto-close as soon as results
arrive, superseding optional initial launch and post-result continued play.
PM accepted amended intent in intent-t-rex-runner-002.md (product-manager-0008;
ledger product_owner_accept-014). Architect amended spec in architect-0007.

Valid searches mount/start the runner without a Play click or delaying fetch;
successful/zero-result completion discards it immediately, including during a
jump, pause, hidden state or asset loading. Initial focus is guarded so Space
works without stealing later user focus. Automatic removal focuses results
only when the removed game/control held focus. Late asset/focus callbacks may
not resurrect play. Reduced-motion opt-in and pending Pause/Hide remain.

Seven Python workflow tests passed again; git diff --check passed. These are
document changes only; no new game/runtime verification is claimed. Prior
source baseline/cache limitations remain as recorded above. Focused independent
spec amendment review is assigned as spec-t-rex-runner-002; earlier review
records remain historical evidence.

Focused review spec-t-rex-runner-003.md approved the amendment with no required
findings (reviewer-0017). Human specification approval remains pending; no
implementation plan or application code was written.

## Human specification approval and implementation plan

Rafael approved the automatic-lifecycle specification at 483d401. Human evidence
is org/reviews/spec-t-rex-runner-human-approval-001.md and ceo-0024; ledger
product_owner_approve-016 records the approval. Spec status/graph are approved.

Senior developer produced plan.md and provenance.md. Actual research downloads
verified both pinned sprite hashes/dimensions and byte-identical sprites at a
historical immutable Chromium v55 revision, plus both complete BSD notices.
No application assets were vendored. Handoffs senior-developer-0006/0007 record
the plan and its reversible generated-type isolation procedure.

Independent review org/reviews/plan-t-rex-runner-001.md approved the plan and
documented reuse proposal with no required findings (reviewer-0018). Reviewer
independently fetched and hashed source/licenses/sprites, inspected sprite
images, checked lineage and notice requirements, and reviewed the strict-check
safeguards. Actual shipped assets/notices and source mapping still require
implementation verification; this is not gameplay or legal certification.

Bounded turn 3 records draft_plan. Original checkout acceptance again records
the known generated-type/build/auth failures, not passes; Python/application/
smoke/lint passed. The pre-existing next-env.d.ts bytes were restored after the
check run; dev cache was not moved. Seven Python workflow tests also passed
separately. Temporary generated-type isolation is proposed in the plan and
has not been executed; it requires plan approval. No check/config was weakened.

Graph plan is in_review; org_loop.py next stops at engineer_approve. Human plan
approval is pending. Turns 4/5/6 remain available for implementation/security/
final review without resetting or extending the cycle. No application code,
game assets, deployment, merge or release was performed.

## Implementation and clean-source verification — 2026-11-24

Rafael approved the plan/reuse and explicitly authorized removal of Word Snack.
The subsequent full-available-width instruction was applied to the canvas CSS
and current spec/plan: rendering fills game content width while physics stays
600×150. The five obsolete Word Snack application/catalogue/test files were
removed after replacement tests were working; historical intent/vocabulary,
reviews, archives and screenshot evidence were retained.

### Test-first slices and ownership

- Asset tests first failed with ENOENT for missing sprites/notices; they then
  passed against exact pinned bytes and both complete license texts. A third
  test checks original running/jump/crash/ground/cactus crop bounds at 1×/2×.
- Named bounded physics author t_rex_physics_author owned only
  lib/t-rex-runner.ts and tests/recipe-t-rex-runner.test.ts. Nine tests passed
  after initial missing-module RED; strict focused tsc and lint also passed.
  All 121 integer empty gaps from 300–420px were simulated as jumpable, plus
  24 seeded 60-second paths. Fixed arc is ~555.56ms; gap 300px exceeds the
  full-arc-plus-300ms travel requirement of ~205.33px at 240px/s.
- Request session tests first failed with missing session module, then three
  passed: visible request start, paused Hide/Show snapshot, fresh replacement,
  stale IDs and unconditional end across running/jumping/paused/crashed/idle.
- Single integration owner implemented the instance-owned canvas/controller,
  React controls, generation/focus association and browser harness. No vendor
  singleton, document-level game key/touch handler, new dependency, external
  game fetch, persistence, provider call or production test endpoint was added.

### Source isolation and exact match

All strict final candidate commands ran in
`/private/tmp/trex-implementation-zl6ygyld`, created from current source including
new files and removals, excluding generated .next/build/node_modules, .env*
and unrelated work/. It links the existing pinned node_modules. Node 24.15.0
was selected with explicit PATH because an unconfigured private/tmp login shell
initially selected a broken unrelated Homebrew Node 22 binary. No repository
or system dependency/configuration change was made to address that shell issue.

A post-verification hash comparison confirmed 68 application/library/test/
asset/notice and package/config source files match the workspace byte for byte,
plus confirmed absence of all five removed files in both locations. Sorted
path/hash JSON aggregate SHA-256:
`eabe3669700717adcff2153bdcd4bec350076ff201bb84ae742318033747ad3a`.
The complete temporary hash map/removal record is
`/private/tmp/trex-implementation-zl6ygyld/.implementation-evidence.json`.
Root's pre-existing next-env.d.ts and dev cache were not edited by this work.
Normal-root runtime acceptance remains the orchestrator's separate approved
reversible generated-type-isolation step; clean-source results are not forged
into loop state and do not erase earlier root-cache failures.

### Command results

Each command below exited 0 for the matching candidate:

- pnpm test: 79 compiled application/native Node tests, all pass; no skips.
- pnpm run lint: eslint --max-warnings 0, clean.
- pnpm run typecheck: Next type generation and strict tsc pass.
- pnpm run build: production compilation, TypeScript and page generation pass.
- pnpm run test:auth after build: 12 tests, all pass, isolated fixture servers.
- python3 -m unittest discover -s tests: 7 tests, OK.
- node --import tsx --test tests/deployment/smoke.test.ts: 12 tests, all pass.
- node --import tsx tests/auth/browser.ts: all five widths pass; ten deliberate
  HTTP 429 fixture responses, zero unexpected console/network errors.
- git diff --check: clean. Root owns staged secret/plan-sync checks and commits.

HTTP/browser tools required localhost/network execution permission; no live LLM
request was made. Browser recipe responses and Google transport are fixtures.
The retained pre-existing photo check loads a real HTTPS publisher image.

### Browser evidence and limitations

Real isolated Chrome covered 320/390/768/1024/1440px, including actual touch at
320/390, real pointer Find activation on desktop and keyboard submissions.
Auto-open/focus/run, fixed jump/held Space scroll prevention, native Jump Space,
collision/restart, manual pause/resume, outside textarea Space, Hide/Show,
reduced-motion opt-in/change, window blur and visibility pauses were exercised.
An actual background-tab/return transition was additionally checked at 1440;
other visibility scenarios use browser-dispatched controlled events.

Held search/sprite fixtures prove fetch starts before assets resolve, no game
POSTs, no duplicate pending search, terminal-before-assets cleanup, pause while
loading, and no late image callback/frame/focus resurrection. Success mid-jump,
zero hidden/paused/jumping/loading, success crashed, context failure and focused/
unfocused errors discard play. Page navigation aborts a pending round; the next
page starts clean. Scoped harness-only RAF/listener/ResizeObserver instrumentation
returns to baseline after terminal/Hide states and permits at most one running
frame. Resize and fresh 2× sprite loading preserve logical coordinates and
correct backing resolution. Native AX names and controls were inspected;
actual screen-reader listening was not performed.

All new captures use org/reviews/t-rex-*; no old Word Snack/notebook audit images
were overwritten. Mobile/desktop running screenshots were visually inspected:
original dinosaur is recognizable, desktop canvas fills the available width,
controls wrap and no horizontal overflow/clipping occurs. Loading, running,
paused, crashed and auto-dismissed captures are retained at 320 and 1440.

Two observed harness issues were corrected without removing checks: media
preference changes needed a render/event settling interval to avoid CDP change
coalescing, and retina/terminal-jump assertions needed to wait for actual sprite
readiness rather than the initial simulation mode attribute. The application
has no test-mode bypass or deferred-focus callback.

Official API grounding checked during implementation:
https://react.dev/reference/react/useLayoutEffect,
https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame,
https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia.
Pinned adapted source mapping and notices are documented in provenance.md.
Independent final code/security/license review is still required; this report
is implementation evidence, not self-approval or merge/release authorization.

## Independent review correction — revoked initial autostart

Review code-t-rex-runner-001 identified a required first-commit race in candidate
1017d39: skipping autofocus alone did not pause a fresh controller. Before the
canvas ever held focus, moving elsewhere caused no section-blur event; focusing
it again before delayed sprites loaded could start motion without Resume.

A real Chrome regression first failed against the unchanged reviewed build:
within the recipe fetch fixture, focus and a pointer interaction move outside
synchronously after submission queued the round but before its initial commit.
The test then focuses the canvas before releasing held sprites. Expected paused;
actual running. This is a harness-only timing fixture; production fetch remains
unchanged and no test endpoint or input bypass was added.

The correction shares the initial request/interaction eligibility predicate
between focus and motion. The child captures that first-commit decision once
(retained across Strict Mode effect replay); the controller defaults to paused
unless explicitly permitted before loading. Failed initial eligibility cannot
be revived by later focus or image completion. Normal form-owned mouse, touch
and keyboard submissions still receive automatic start, while explicit Resume
is required after revocation. No simulation, source pin, notices or game rules
changed.

Added successful-old-panel coverage too: a pending result arrives while an
older sort control is focused; the exact DOM control, open panel and quickest
sort remain, and new history is inserted. This complements prior malformed-error
and outside-query focus coverage.

All required commands passed again in matching clean snapshot
`/private/tmp/trex-implementation-m16a0ihf`: 79 application tests, 12 auth,
12 smoke, 7 Python workflow tests, lint, strict types and production build.
Expanded Chrome passed at all five widths including the new revoked-focus
regression and successful-old-panel case, with normal real mouse/touch/keyboard
starts still passing; ten deliberate fixture 429s and zero unexpected console/
network errors. Current-feature t-rex-* captures were refreshed; historical
Word Snack/notebook records remain untouched. Actual screen-reader listening
and live LLM grounding remain unperformed as previously disclosed.

Post-check 68-file source/config/test/asset comparison matches workspace and
snapshot, with all five Word Snack removals absent in both. Aggregate SHA-256:
`b49253690e2e63b755871599bf2782d14fa00ff25db490fad444a61a196bea59`.
Detailed map: snapshot `.implementation-evidence.json`. The earlier candidate
map is retained as historical evidence, not asserted current. No root dev cache
or next-env changes were made; root owns runtime acceptance and the independent
code/security recheck. React callback identity guidance was verified at
https://react.dev/reference/react/useCallback.
