# T-Rex and current main — independent integration security review

- Date: 2026-11-24
- Role: security-researcher
- Candidate: f929e5792cf9304dded0b7631c4b0d1976c7e2a3.
- Parents: approved T-Rex d9245f98693020bf3f94bc646345705a211a94b3 and current main 37b608372505ee852b116cb8870581fabf4243aa.
- Verdict: clear for the local integration; no security findings or required fixes. Blocking: false.
- This review supplies evidence for the human local-merge decision, not deployment, hosted migration, paid-call or release authorization.

## Source boundaries and abuse cases

Applied security-and-hardening and REVIEW.md Bugs/Security/Compliance passes to
the net-main delta, the retained family/DB/provider/configuration boundary,
browser fixture merge and preserved audit streams. The net-main application
delta is the previously assessed local T-Rex/game/notebook support and its
tests/assets. All game application modules are byte-identical to d9245f9;
security-t-rex-runner-001.md and -002.md remain applicable to their exact
bounded input/time/RNG, fixed asset paths, React text and lifecycle source.

| Attempt / boundary | Integration check and evidence |
| --- | --- |
| An invitee or non-member uses the newly integrated search UI to invoke a provider. | app/page.tsx:5 requires family context before rendering. app/api/recipes/search/route.ts:11 requires it before searchRecipes (:15). lib/session.ts:14–18 reclassifies current DB eligibility; :25–29 rejects missing sessions/non-members and derives IDs server-side. These files, admission/family/identity/DB modules and proxy are byte-identical to current main, rather than replaced by the feature's older allowlist-only boundary. Game state grants no family privilege and carries no identity or recipe data. |
| Game code reintroduces stale provider behavior or exposes credentials/allowed-email configuration. | Explicit net-main diff over auth/session/access, DB/family/invitations, API/page, provider/server/search/photo modules, deployment config, packages/lockfile and icon yielded no changes. Main's single-call provider grounding/usage and pinned photo transport remain authoritative. Game client imports no server identity configuration or test helper. Its only recipe POST stays query-only; no score, keypress or snapshot enters the payload (app/recipe-search.tsx:94–95). |
| Anonymous requests retrieve new sprites/notices through a new public exception. | Main lib/auth-policy.ts:3–9 remains exact and has no game exception. proxy.ts retains session admission before serving non-public paths. The constant game image and notice paths remain protected by that policy. This is eligible-session protection for static game files; family membership is separately required for the home/search effects. Browser tests exercise authenticated notice 200, anonymous sprite 307 and actual authorized 1×/2× drawing (tests/auth/browser.ts:509–514 and runnerFlow). |
| Delayed images, repeated Hide/Show or revoked focus revive play after completion. | Integrated game source is unchanged from the corrected reviewed candidate: first-commit eligibility is captured once, controller defaults to paused, callbacks check disposed ownership, and terminal state disposes its RAF/listeners/observer/images. Existing generation/abort and stale-ID checks remain. Browser harness retains the revoked-initial-focus/Resume, delayed-sprite and terminal/resource cases; no new lifecycle implementation was introduced in conflict resolution. |
| Browser tests call a paid provider or mutate development/hosted family data. | tests/auth/browser.ts:503 uses startServer({}, true), then actual test provision() after verified fixture sign-in (:508). Main tests/auth/server.ts:25–29 owns a fresh test database, forces OPENAI_API_KEY empty after overrides, removes migration/test-admin URLs from the child, and scopes Google transport to test-process NODE_OPTIONS. tests/family/database.ts permits only loopback mp_test administration, random owned mp_test_* databases and ownership-checked cleanup. These helpers are unchanged from main. No fixture route, fake-user bypass or probe import enters production. |
| Merging divergent audit streams rewrites approval authority or resets the exhausted/solved loop. | Independently verified the archived originals, canonical ledger prefix/imports, message aliases and unchanged solved loop as detailed below. No newly manufactured approval or extra loop turn is needed or claimed by integration. Historical release approvals remain historical and do not authorize this branch's release. |

The sole executable conflict resolution in tests/auth/browser.ts adds main's
provision import/call to the full reviewed runner harness and uses fresh
t-rex-main-* capture paths. Existing auth/logout/notebook/photo scenarios remain.
Harness-only instrumentation and malformed/delayed responses stay in tests;
the production game uses local assets, without new external networking,
storage, logging, dynamic paths or backend effects.

## Source and provenance verification

Read org/reviews/t-rex-main-integration.md and independently recomputed each of
the 142 per-file SHA-256 entries in t-rex-main-source-evidence.json against
both the checkout and /private/tmp/trex-implementation-fftcqt79: zero mismatches.
The map records aggregate c735a65a02af8da256f116b6b3d67c8092a1e407be10d4d91f9653faff0e9fbe.
All five removed Word Snack paths are absent. The generated Next environment
declaration and private runtime test configuration are outside this source map
and are not represented as security changes.

Main's AGENTS/CLAUDE, package/lockfile/workspace, next.config.ts/vercel.json,
proxy, auth/family/DB/provider/photo source and isolated server/flow/Google/family
helpers have no integration delta. The exact pinned sprites, full BSD notice
files and visible local combined notice remain identical to d9245f9, retaining
the source/extraction headers and shipped-license verification in assessment
001. This checks preservation of the documented reuse controls; it is not
legal certification or a complete advisory audit of main's dependencies.

## Independent audit-integrity checks

Read org/merge/t-rex-main-2026-11-24/{README.md,manifest.json,message-map.json,
ledger-imports.json} and performed read-only Python/Git comparisons:

- All 254 archived file entries match recorded byte counts/SHA-256 and exact
  git-show bytes at their respective immutable source commits.
- Main's original 86-record and feature's original 58-record approval chains
  independently pass prev_hash and canonical-record SHA-256 checks.
- The canonical 99-record chain independently passes the same check, preserving
  main's complete original ledger bytes as its prefix.
- All 13 imported decisions retain original gate, decision, artifact, approver,
  commit, decision time and expiry; original IDs/hashes agree with the archived
  feature ledger and remain identified as prior decisions.
- All 55 feature message aliases equal the originals after only documented
  ID/reference remapping plus an audit-provenance footer; no substantive body
  differences were found. Original messages remain archived exactly.
- Active loop config/state/history and workflow graph equal the solved T-Rex
  source/archive bytes. No reset, budget extension or fabricated review turn
  was introduced. Main's completed cycle remains separately archived.

## Runtime evidence and limits

The integration verification records final exits 0 for 82 application tests,
14 auth tests, 34 family tests, 18 deployment tests, 7 workflow tests, lint,
strict types and production build. It records five-width T-Rex Chrome QA and
family production 320/1440 plus development Strict Mode QA: unexpected errors
empty, ten deliberately induced 429s. The initial family run's 33/34 result
and snapshot-only private loopback runtime configuration correction are openly
recorded; no assertion or production configuration was weakened. Staged secret
scan reports zero findings. This reviewer verified matching source and test
isolation rather than rerunning servers, database writes, builds or browsers.

These browser recipe/Google responses are fixtures, not new live-provider
grounding. The retained publisher image is real HTTPS. No paid LLM request,
hosted DB action, migration, push, deployment or release was performed by this
reviewer. Screen-reader audio, full family/DB/provider penetration testing and
release-time dependency advisory audit are outside this bounded integration
pass. Prior assessment limits remain applicable. No security-relevant bug,
data leak, privilege regression or policy breach was found in the integration.
