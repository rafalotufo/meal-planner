# T-Rex Runner — focused security recheck

- Date: 2026-11-24
- Role: security-researcher
- Candidate: 0febee7; delta from previously assessed 1017d39.
- Verdict: clear; no new security findings or required fixes. Blocking: false.
- Scope: initial automatic-motion eligibility correction and accompanying browser regressions. Assessment 001 remains historical evidence for the preceding candidate.

## Correction and abuse-case review

The prior implementation could revoke initial focus after outside interaction
but still begin motion if focus returned before delayed sprites completed.
The correction propagates the same first-commit permission to the controller:

- app/recipe-search.tsx:31–39 checks request ID, current generation, pending
  non-aborted request, interaction version and initiating-form focus in a
  stable callback. Parent focus uses this same predicate before clearing the
  intent at :44–48. Its runner composition supplies only a numeric ID,
  snapshot and local callback (:151), with no query, identity or secret.
- app/t-rex-runner.tsx:14–26 captures that permission once on initial layout
  commit, retains the decision across effect replay, and passes it to the
  existing owned controller. Cleanup still disposes the exact mounted instance.
- lib/t-rex-canvas.ts:16–20 defaults permission to false and pauses initial
  state before image callbacks can run. The unchanged onload/schedule path
  does not turn paused state into running; explicit Resume remains the only
  path from paused to running. Late focus/image completion cannot override
  a denied initial decision. Existing visibility/reduced-motion/eligibility,
  one-RAF, disposed and image guards remain intact.

Abuse case: move focus and interact outside after request submission but before
the first commit, focus the surface again, then release delayed sprites. The
new harness case at tests/auth/browser.ts:208–235 requires paused state, zero
frames and ignored Space until explicit Resume. It then requires normal
running and terminal resource baseline. Test-only interception at :492–504
forces the narrow timing within the browser fetch wrapper; production fetch
and network boundaries are unchanged. The adjacent regression at :237–252
checks successful arrival retains the exact focused old-panel sort control,
open panel and selection while adding new history.

This closes an unwanted-motion lifecycle gap. It introduces no new networking,
storage, dynamic asset path, text sink, server privilege, fixture endpoint or
dependency. The Bugs/Security/Compliance passes found no consequential issue
in the correction or change to the approved scope. The existing input/delta/
RNG and stale-ID/abort boundaries assessed in 001 remain unchanged.

## Direct evidence and unchanged surfaces

Independently recomputed the 68 per-file SHA-256 entries in
/private/tmp/trex-implementation-m16a0ihf/.implementation-evidence.json against
the checkout: all 68 match; all five obsolete Word Snack paths remain absent.
The manifest records aggregate b49253690e2e63b755871599bf2782d14fa00ff25db490fad444a61a196bea59.
The changed source/test delta is limited to RecipeSearch, TRexRunner, canvas
controller and browser harness, plus documented evidence/status/screenshots.

git diff --exit-code 1017d39..0febee7 over public/third-party game files,
simulation/session, package/lockfile, API/page, auth/session/access policy,
proxy and recipe modules exited 0 with no output. Exact asset/license hashes,
full shipped notices, original source headers and protected local paths from
001 therefore remain applicable; this recheck does not reinterpret upstream
rights or claim legal certification.

Progress records the real-browser RED against the prior behavior and GREEN
at all five widths, including normal automatic mouse/touch/keyboard starts,
explicit Resume and successful old-panel focus. The matching snapshot records
79 application, 12 auth, 12 smoke, 7 workflow tests and lint/types/build all
passing; ten deliberate 429 fixtures and zero unexpected browser errors.
These runtime results are recorded implementer evidence, not duplicate runs
performed by this reviewer. Root runtime acceptance for this corrected
candidate remains separate from this focused security verdict.

No build, server, app/cache/generated-type, loop, graph or ledger mutation was
performed. No paid provider call, external audit or release was requested.
Dependencies are unchanged; no new release advisory audit is claimed. Prior
bounded-review, fixture, screen-reader and existing-subsystem limitations in
001 continue to apply. Human merge/release gates remain in force.
