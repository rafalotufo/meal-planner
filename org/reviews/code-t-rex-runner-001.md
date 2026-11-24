# T-Rex Runner — independent code review

- Date: 2026-11-24
- Reviewer: reviewer (independent of senior-developer)
- Assignment: code-t-rex-runner-001
- Candidate: 1017d39, including cbfc8c4/c538ab7; base 89517cc
- Verdict: Changes requested — one required autofocus/autostart correction

## Required finding

**[Bugs, P2] Revoked initial focus must also revoke automatic running —
app/recipe-search.tsx:33–40 and lib/t-rex-canvas.ts:91–99.** The parent correctly
skips initial autofocus when another interaction invalidates its token, but
leaves the new simulation running. The child has not yet held focus, so no
section blur pauses it. If the user then focuses the canvas before delayed
sprites load, onload sees eligible focus and schedules running without Resume.
This violates the approved requirement that an initial outside interaction
leave play paused and that asset completion cannot undo revoked autostart.

Propagate failed initial eligibility into paused simulation/controller state
before asset completion can schedule. Preserve the normal child-before-parent
layout ordering: merely checking focus during child mount would incorrectly
pause every ordinary start before the parent has focused it. Add the promised
browser regression that submits then focuses/clicks elsewhere before initial
commit, confirms focus is not stolen, focuses the canvas before held sprites
are released, and confirms it remains paused until explicit Resume. The harness
currently tests outside-query focus only after ordinary startup, which cannot
catch this branch. Also retain the specification's old-panel successful-arrival
assertion when extending these focus checks; current old-panel coverage ends
with malformed-response error rather than successful history insertion.

Confirmed the controller consequence using a read-only Node/tsx fake-DOM
probe: mount a fresh running state with outside focus (0 frames), focus the
surface before its held image.onload, then invoke onload: state remains running
and schedules 1 frame without Resume. No source modification was needed for
that reproduction. The parent code establishes the reachable revoked-initial-
focus path described above.

## Remaining assessment and evidence

Read approved intent/spec/plan, changed tests first, then simulation, session,
canvas, React integration, browser harness, docs/provenance and full source
diff. No other required finding identified. Fixed 600×150 coordinates, exact
original hitboxes, bounded 50ms deltas/substeps, deterministic gap generation
and all 121 allowed gaps have meaningful tests. Request IDs and original
generation/abort guards prevent stale termination; success/zero discard all
session modes and owned resources immediately. Scoped Space, native controls,
pause/visibility/reduced motion and conditional completion focus are separated
from recipe request semantics.

The small pure physics/session modules, instance-owned renderer and React
component follow the approved boundaries without engine/dependency changes.
Only the five obsolete Word Snack source/test files were removed; historical
audits remain. Game input/score stays local, no vendor singleton or remote game
code executes, and auth/provider/photo transport remain unchanged.

The 15 focused physics/session/asset tests passed after mutation restoration.
They independently verify shipped exact PNG hashes/dimensions/crop bounds, both
unchanged full BSD notice hashes in shipped notices and extraction credit.
The implemented adaptation map matches the selected calculations/hitboxes,
sprite offsets and drawing portions. Prior independent provenance clearance
is retained; actual local authenticated notice access and anonymous asset
protection are asserted by the browser harness.

Inspected actual t-rex-running-320.png and t-rex-running-1440.png with view_image:
recognizable original dinosaur, full available desktop width, wrapped mobile
controls and no visible clipping/overflow. This is screenshot inspection, not
a separate reviewer browser run. Implementation evidence reports 79 application,
12 auth, 12 smoke and 7 workflow tests plus lint/types/build and five-width Chrome
passing; current loop state records every strict runtime acceptance exit 0.

Independently checked all 68 path hashes in the clean-snapshot evidence map
against workspace: no mismatches; all five removals absent. No downloaded code
was executed during review. Actual screen-reader listening/live LLM grounding
remain unperformed and disclosed.

## Meaningful mutation and restoration

After root confirmed acceptance checks stopped, inverted the end condition in
lib/t-rex-session.ts. Session tests exited 1 with two failures, including the
unconditional terminal-discard test. Restored exact original bytes in finally:
SHA-256 ff5a04243bc5cf677f32cef6491b803a719dd3e5bfb18e7d9d9970e55ede0a3c.
All 15 focused physics/session/asset tests then passed. Source/test diff against
1017d39 is clean; git diff --check passed. No reviewer build/auth/cache changes
were made. Fix and affected re-verification are required before approval;
human merge/release authorization is not granted.
