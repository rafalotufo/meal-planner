# T-Rex Runner — independent specification review

- Date: 2026-11-24
- Reviewer: reviewer (independent of architect)
- Assignment: spec-t-rex-runner-001
- Artifact: intent/t-rex-runner/spec.md
- Verdict: Changes requested — one required keyboard-behavior correction

## Required finding

**[Bugs, P2] Consume scoped Space independently of jump acceptance —
spec.md:14–22.** The spec ignores key repeats and airborne jumps but prevents
page scrolling only for an accepted action. A user pressing Space again during
a jump, or holding it after takeoff, therefore invokes native page scrolling
while the focused game ignores that jump. This makes ordinary keyboard play
move the game viewport instead of remaining stable. Require preventDefault on
Space events whose target is the game surface even when the logical jump is
rejected for repeat/airborne/paused state. Continue rejecting those actions and
leave native buttons, textarea and every outside control untouched. Add a real
browser assertion that surface Space during flight/repeat does not scroll or
double-jump, alongside the existing textarea/native-button checks.

## Remaining assessment

No other required findings. The explicit fixed-world coordinate model, fixed
substeps/delta cap, jump-only obstacles and jumpability proof provide a bounded
testable adaptation (spec.md:25–43, 79–112). Pauses are distinct from request
completion; successful/zero results preserve open play and exact focus, while
explicit dismissal targets the associated search and retains old-panel
semantics (47–75). Removal is confined to obsolete active Word Snack code/tests
and preserves audit records (138–142).

Pinned source links resolve. Primary-source inspection confirms Chromium and
extraction headers in [index.js](https://raw.githubusercontent.com/wayou/t-rex-runner/5455bfa408ec6b707c7300ff194b7390733a766d/index.js),
the upstream [BSD-3-Clause license](https://raw.githubusercontent.com/wayou/t-rex-runner/5455bfa408ec6b707c7300ff194b7390733a766d/LICENSE),
and both sprite paths in [index.html](https://raw.githubusercontent.com/wayou/t-rex-runner/5455bfa408ec6b707c7300ff194b7390733a766d/index.html).
The spec honestly gates reuse on pinned sprite hashes, historical Chromium/
sprite provenance and independent license review during planning; this review
does not certify unresolved attribution or authorize vendoring.

## Checks and limits

Read active intent/spec, current Word Snack search/lifecycle implementation,
org reviewer role and REVIEW.md. Compared request/focus behavior with existing
handlers and checked upstream primary sources above. git diff --check passed.
No source/assets were changed and no build, typegen, cache, auth, browser or
runtime work was performed. Reported isolated unchanged-HEAD baseline passes
are not T-Rex verification. Human specification approval remains pending.
