# T-Rex Runner — independent security and shipped-provenance assessment

- Date: 2026-11-24
- Role: security-researcher
- Candidate: 1017d39, including cbfc8c4 assets and c538ab7 physics; approved-plan baseline 89517cc.
- Verdict: clear for this scoped change; no security findings or required fixes.
- Blocking: false. Human merge/release gates remain intact.

## Scope and method

Read the approved spec/plan, provenance/progress, prior independent plan/reuse
review, every new application module, full RecipeSearch integration, simulation/
session/asset tests, relevant browser harness and existing auth/static policy.
Applied security-and-hardening: threat boundaries, STRIDE abuse cases, output
sinks, privilege/data flow, resource bounds and dependency/provenance review.
The full-width canvas amendment is explicitly authorized in ceo-0026 and does
not change logical physics or introduce a data boundary.

Direct read-only verification recomputed all 68 source/evidence hashes from
/private/tmp/trex-implementation-zl6ygyld/.implementation-evidence.json against
the checkout: zero mismatches; all five recorded Word Snack files are absent.
This comparison occurred before the final code review's announced temporary
mutation experiment; this assessment concerns the committed candidate, not
intentional test mutations. No application, cache, generated type or runtime
acceptance state was changed by this reviewer.

## Assets and trust boundaries

Assets at risk remain authenticated recipe access, Google identities/session
cookies, provider credentials/usage, source evidence and the guarded photo
transport. The new game receives a locally created numerical snapshot, never
recipe queries, recipes, identities or secrets (app/t-rex-runner.tsx:7).
Its input boundary is native Space/button events; browser frame timestamps,
visibility/focus, DPR/resize and local image completion feed its controller.
The simulation has no I/O or authority; predictable RNG affects cactus variety
only and is not used as a security token.

The game loads exactly one selected same-origin sprite path from constants
(lib/t-rex-canvas.ts:24–25,102), with a separate constant local notice link
(app/t-rex-runner.tsx:58–59). It adds no provider request, external service,
storage, score persistence, logs, dynamic URL, HTML sink or backend action.
The existing recipe fetch remains query-only at app/recipe-search.tsx:86–87.
Source diff over package/lockfile, app/api/page, auth/session/access policy,
proxy and lib/recipes exited 0 with no output against 89517cc..1017d39.

## Concrete abuse cases

| Boundary / threat | Attempt | Control and evidence |
| --- | --- | --- |
| Events → game; tampering / request amplification | Hold Space, activate Jump repeatedly, or use game controls to submit recipes or intercept query typing. | app/t-rex-runner.tsx:40–43 consumes Space only on its own canvas target; repeats/airborne/paused actions are rejected by lib/t-rex-runner.ts:82–86. Buttons are type=button (:31,50,52), outside the query form. No global game keyboard listener exists. Browser assertions at tests/auth/browser.ts:253–255 check one recipe POST and exact query-only body. |
| Frame time → simulation; denial of service | Supply NaN/Infinity/negative time or resume after a long background suspension to trigger unbounded catch-up work/spawns. | lib/t-rex-runner.ts:121–129 rejects nonfinite/nonpositive values, caps accepted delta to 50ms and substeps to 1000/60ms. Each substep adds at most one cactus; offscreen obstacles are removed (:105–114). Local xorshift output gives bounded 300–420px gaps, without global randomness or remote input. Tests cover invalid/huge deltas and all 121 allowed integer gaps. |
| Lifecycle → local resources; denial of service | Repeated Hide/Show, blur or terminal results leave competing RAF loops/listeners, or late images revive disposed play. | lib/t-rex-canvas.ts:54–77 permits one pending frame and clears the timestamp on pause/resume; :94–101 checks disposed/image ownership, dimensions and eligibility. :105–111 idempotently cancels the frame, disconnects the observer, removes all four listener kinds, clears image callbacks/reference and canvas pixels. React cleanup calls dispose at app/t-rex-runner.tsx:16–23. Harness asserts resource baseline on Hide/terminal/remount at tests/auth/browser.ts:253–277,309–326,395–441. |
| Focus/assets → automatic start; unwanted motion / focus takeover | Move elsewhere or pause while sprites load, then let onload restart motion or steal focus. | Asset callbacks never focus; they retain paused state and only schedule a running eligible instance (lib/t-rex-canvas.ts:58–60,91–99). Blur/visibility/reduced motion pause and cancel (:79–91); Resume requires loaded/available/visible focused ownership (:73). Initial focus is a one-commit request/version/form intent at app/recipe-search.tsx:33–47 and is invalidated on terminal result (:55–60); assets cannot defer it. Loading-pause and late-image browser cases are :309–334. |
| Response → current request; tampering | A stale success/error mutates a replacement game, or hidden/crashed/loading game prevents result delivery. | app/recipe-search.tsx:65,69,80–89 preserves abort/generation and one-pending guards. Success including zero dispatches notebook addition and unconditional game end without waiting for frames/assets (:95–103). lib/t-rex-session.ts:12–14 rejects mismatched IDs and removes all terminal snapshots. Session tests exercise all modes/visibility combinations. |
| Game text/paths → DOM/network; injection / disclosure | Influence score/status/sprite URL to execute markup, request an attacker URL, or leak query/identity. | Status is fixed application text and numeric score is rendered as React text (app/t-rex-runner.tsx:55–59); canvas paths and notice href are constants. No user string enters drawImage source, HTML, code evaluation, storage or logging. Browser dimensions affect presentation only; world/collision remain 600×150 (lib/t-rex-canvas.ts:39–52). |
| Local assets → auth; spoofing / elevation | Fetch sprites/notices anonymously or use the game to obtain allowed identities. | No new public exception appears in lib/auth-policy.ts:3–8; proxy.ts:20–27 checks readSession for these paths, with catch-all matcher :41. Existing server-only membership enforcement is unchanged. Harness tests authenticated notice 200 and anonymous sprite 307 at tests/auth/browser.ts:465–469; actual sprite drawing at five widths exercises authorized delivery, including fresh 2× loading. No server identity list is imported into the new game modules. |
| Test instrumentation → production; bypass | Activate fake responses, resource hooks or context failure through production input. | CDP script injection and URL interception are confined to tests/auth/browser.ts:444–464; production imports no test helpers and exposes no fixture route. Existing test-process Google preload stays isolated. Controlled failure/visibility fixtures are explicitly distinguished from live evidence in progress.md. |

## Actual shipped provenance and notices

Reused the already independent pinned-origin research in
org/reviews/plan-t-rex-runner-001.md; independently checked the actual shipped
bytes, PNG IHDR dimensions, source headers and notice contents now present:

| Shipped file | Bytes / dimensions | Recomputed SHA-256 |
| --- | --- | --- |
| public/games/t-rex/100-offline-sprite.png | 2645 / 1233×68 | e306705c996676db01f4072ed3d6f33d89089a848ab0b2a0ba07a2d866ec309f |
| public/games/t-rex/200-offline-sprite.png | 3244 / 2441×130 | b3011fd16e43cd860b9782c4eafe77c1cc40da2e0f6e2e5ea547d98d6efac879 |
| third_party/t-rex/LICENSE.wayou.txt | 1517 | c6ba363b8d8d89eab0a8f4775e4fc5dc2dc1c3b649cbf2a0af4049699ee29533 |
| third_party/t-rex/LICENSE.chromium.txt | 1559 | 845022e0c1db1abb41a6ba4cd3c4b674ec290f3359d9d3c78ae558d4c0ed9308 |
| public/games/t-rex/THIRD-PARTY-NOTICES.txt | 3411 | 47d419b94ce24ecd6fe063a168b88900035a87ba3b698b6a7cb07fac5c3e7ffd |

Both license byte sequences appear completely and unchanged in the shipped
notice, including all conditions, distinct copyrights, non-endorsement clauses
and disclaimers. Both derived modules begin with the exact four-line Chromium
copyright/BSD/extraction header also retained in the notice, identify the full
wayou SHA and point to local full notices/provenance. The visible link is local
and uses noopener/noreferrer. The implementation map accurately identifies
retained hitboxes, jump integration, offsets/frames and horizon drawing, and
explicitly records new deterministic physics/lifecycle. No upstream singleton,
HTML, script bootstrap, audio or storage code is shipped. This confirms the
documented reuse controls, not legal certification of all upstream rights.

## Three review passes and limits

- Bugs: reviewed event boundaries, delta/spawn bounds, resource ownership,
  stale IDs and terminal/error handling. No security-relevant defect found.
- Security: no new credential exposure, privilege boundary bypass, injection,
  SSRF, cross-origin game request or persistent data collection found.
- Compliance: actual shipped source/assets/notices match the approved pinned
  adaptation and automatic-close contract, including authorized width change.
  Word Snack history/audit artifacts remain; five obsolete source/tests are gone.

Progress records 79 application, 12 auth, 12 smoke and 7 workflow tests plus
lint/types/build and expanded Chrome at five widths passing on matching source.
Root separately reported unchanged real-checkout turn-4 acceptance all exit 0
and conflict-free restoration of the approved generated-type hold. This reviewer
performed independent static/hash checks, not a duplicate server/build/browser
run. No live provider/paid calls or external audit service was used. Native
dependency advisory audit was not run: no dependency change or release request;
unchanged dependencies are not declared vulnerability-free.

The installed skill's linked shared security-checklist.md remains absent;
its available explicit checklist/threat model and hardening patterns were used.
Screen-reader listening, deployed header verification and a full existing
auth/provider/photo subsystem penetration test are outside this bounded pass.
Recorded browser evidence uses recipe/Google fixtures; visibility coverage
includes controlled events and one actual background-tab transition. These
limits are not waived tests or newly introduced findings. Human review and
release authorization remain separate.
