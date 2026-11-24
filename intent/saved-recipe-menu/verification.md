# Saved recipe menu — Build verification

Implementation is in progress under the approved feature plan. This file records
actual commands/results; unchecked later tasks are not claimed complete.

## Foundation: contract and request parsing

- Node `v24.15.0`; pnpm `10.33.0`.
- Read pinned local Next Route Handler guidance before code. Route handlers are
  uncached by default; no framework/application route changed in this slice.
- Task1 RED: `pnpm run test:menu` discovered the new strict TypeScript test and
  failed with missing `lib/menu/validation.ts` (exit1).
- Task1 GREEN: the same command passed5 validation tests (exit0); strict
  `pnpm run typecheck` passed (exit0).
- Task2 RED: `node --import tsx --test tests/menu/body.test.ts` failed with
  missing `lib/menu/body.ts` (exit1).
- Task2 GREEN: `pnpm run test:menu` passed10 tests (exit0), including streamed
  UTF-8, exact limits, fake lengths, stalled cancellation and total deadlines.
  `pnpm run lint` passed with zero warnings (exit0).
- Subsequent strict checking found an inferred union in the new body-test header
  arrays. Explicit typed records fixed it; `pnpm run typecheck` and lint passed
  again (exit0), without changing compiler settings.
- Initial native db status/start failed because this worktree lacked private
  configuration. The orchestrator then validated/reused the existing private
  cluster configuration and started that cluster; no setup/development migration.
- Task3 RED: `node --import tsx --test tests/menu/migration.test.ts` against owned
  random local databases failed3/3 (exit1): menu table absent, old schema still
  accepted, and separate menu rollback absent. Each fixture cleanup ran.
- Task3 GREEN: prepared two-migration runtime metadata and75-entry full catalog
  using the public loader and candidate SQL on one newly owned random database,
  then cleaned it up. The three migration/upgrade/rollback tests passed (exit0).
- Task4 RED: actual migration/grant tool on a separate owned random DB did not
  allow runtime insertion into menu_recipes; focused privilege test failed with
  PostgreSQL42501 as expected before the new narrow grant.

No hosted operation, development schema change, provider request or UI behavior
has been performed by this foundation increment. Runtime menu persistence and
browser acceptance remain later tasks.

## Completed storage foundation checkpoint

- Existing family storage RED after additive schema:8 tests,6 passed/2 failed
  (expected table list and initial rollback dependency). Updated the expectation
  and ran separate disposable menu rollback before unchanged initial rollback.
- Task4 GREEN: actual explicit grant tool on owned random DB now permits runtime
  SELECT/INSERT/DELETE on menu_recipes and rejects UPDATE, TRUNCATE, DDL and
  migration-history writes with42501. Restricted role flags remain false.
- `pnpm run test:menu`:14 passed,0 failed/skipped/cancelled, exit0.
- `node --import tsx --test tests/family/storage.test.ts`:8 passed,0 failed, exit0.
- `pnpm run lint`: exit0, zero warnings.
- `pnpm run typecheck`: exit0, route types and strict tests included.
- `pnpm run build`: exit0; reviewed SQL/journal metadata matches, optimized
  Next16.4.6 build compiled/typechecked and generated14 pages successfully.
- `git diff --check`: exit0. Original0000_family.sql, rollback-initial.sql and
  preserved SQLite migration evidence have no diff.

Task1–4 and the storage checkpoint are complete; task5 onward remain unchecked.
The explicit migration/grant CLI was exercised only with validated owned random
DB owner/runtime URLs in private child environments, never with the development
DB or hosted URLs. Restricted-role fixture grants target only its random DB;
no global role creation/alteration or development-data access was added.
All owned fixtures ran cleanup. Menu store/API/UI/browser acceptance and final
whole-feature regressions remain outstanding.

## Store increment

- Task5 RED: focused store/isolation tests failed before implementation because
  lib/menu/store.ts did not exist (exit1). Initial synthetic test email values
  were then correctly rejected by the existing strict Gmail allowlist validator;
  only fixture addresses were corrected, with no authentication-code change.
- Task5 GREEN: `node --import tsx --test tests/menu/store.test.ts
  tests/menu/isolation.test.ts` passed5/5 (exit0), covering first-snapshot
  retention/eight concurrent duplicates, fresh restricted-runtime connection,
  two-family and joined-member access, foreign-ID/cursor isolation, lock-time
  admission/member recheck,203 saves across50/50/50/50/3 pages, cursor-row deletion,
  old-ID removal after re-add, rollback and corrupt persisted-row failure.
- Strict typecheck and lint both passed (exit0). Store functions use the unchanged
  common family lock and derive current family from requireMember inside writes.
- No API/UI implementation is included in this checkpoint yet.

## Menu API increment — in progress

- Task6 RED: authenticated realHTTP save request returned404 before the menu
  Route Handlers existed; focused contract test failed as expected (exit1).
- Added Node Route Handlers with current family context before identity/body,
  server-side ownership and promised dynamic params; no production auth fixture.
- Strict typecheck, lint and production build passed (exit0), with menu routes
  included and runtime metadata verified.
- Existing focused regressions `tests/auth/access.test.ts`,
  `tests/family/main-integration.test.ts`, `tests/family/isolation.test.ts` passed
 8/8 (exit0) against owned fixture servers/databases.
- Initial API `pnpm run test:menu` run:25/26 pass (exit1). All seven realHTTP scenarios
  except the stalled-body case pass: restricted-runtime persistence/restart,
  read-only HEAD/unsupported methods, denied/pending/expired identity, accepted
  family invite/cross-family isolation, invalid input/queries/Origin/chunked byte
  bound,50-entry cursor pages/foreign positions and generic DB rollback errors.
- The unchanged stalled rawHTTP test timed out at15seconds instead of returning
 400. Root cause: pinned Next16.4.6 next-server.js clones POST bodies for Node
  proxy then awaits body.finalize() in finally; body-streams.js finalize waits
  for original incoming EOF before forwarding the request. The route's tested
  five-second parser is not reached while that incoming body stalls. The pinned
  proxyClientMaxBodySize documentation confirms buffering and size truncation,
  not an ingress deadline. Size configuration alone cannot fix this behavior.

Task6 is not complete. No test/deadline/auth check was relaxed; no vendor code or
proxy configuration changed. A scoped architecture/security consultation is
resolving an equivalent protected boundary before the stalled-body regression
can pass. All test servers/databases were stopped/cleaned after the failed run.

## Reviewed API boundary corrections

The independent architect/source consultation and security review approved a
necessary exact-path dispatch correction; see request-timeout-note.md and
org/reviews/security-saved-recipe-menu-timeout-001.md. No vendor, auth-policy
public exceptions, existing search deadline or body-limit configuration changed.

- Added menu-specific all-method Host/current-session/family/private-security
  wrapper and static exclusions only for the two menu API shapes. Existing route
  family/identity/body and transactional member checks remain.
- Original raw unfinished save regression now returned400 before client EOF,
  as did added unfinished removal, while preserving the selected recipe. Focused
  deadline+all-method test run passed3/3 (exit0), around6.3s per deadline test
  including fixture startup/authentication. Neither15s assertion ceiling nor
  the request EOF behavior changed.
- Full menu then28/29 (exit1) exposed a second process-boundary regression:
  Better Auth's callback-process memory adapter could return a session when its
  stateless cache was expired/missing. Additional missing-cache test also
  reproduced200 instead of401 (exit1); no authentication test was relaxed.
- Reviewed corrective guard uses public getCookieCache with current configured
  secret/JWE/version/secure prefix before any session helper, finite future
  embedded/JWT expiry and verified cached identity, then binds stable identity
  and token to readCryptographicSession. Shared auth/vendor code stays unchanged.
- Original expiry and positive persistence plus new cache guard passed3/3;
  expanded wrong-key, missing/tampered/embedded expiry, invalid subject/verification,
  same-user mixed tokens, canonical chunks and secure-prefixed cookie/chunk
  tests passed2/2. Successful reads return zero Set-Cookie.
- Full menu after those fixes passed31/31; existing auth passed14/14; full
  deployment suite passed32/32. Strict typecheck/lint/build passed.
- Existing stale-extra migration fixture initially failed1/14 focused existing
  regressions because appending initial timestamp+1 is reordered with two
  migrations. It now appends last timestamp+1; exact stale assertion and all
  malformed/reordered cases remain. Full deployment32/32 includes that fix.

## Dump/restore compatibility correction

Full family suite then passed33/34, with existing post-dump/restart invitation
login returning401. Isolated unchanged test reproduced the failure. Schema-only
comparison on empty owned test DBs found exactly75 entries on each side, but
four new CHECK definitions deparsed with different nestedAND parentheses after
pg_dump/restore. Exact catalog checking correctly rejected the restored schema,
so Google callback could not open storage. This was not an auth/session change.

A new direct menu dump→restore→runtime-open regression failed with Storage
unavailable before correction. Rewrote only four checks in UNRELEASED0001 from
BETWEEN+trim to equivalent flat >=/<= AND expressions and regenerated its hash/
catalog on an owned random database. Initial0000, original journal facts, SQLite
evidence and strict catalog comparison remain unchanged. The direct restored
menu snapshot now opens under the actual restricted runtime (test passes1/1),
including persisted photo URL/saved timestamp; tests still reject UPDATE/TRUNCATE/DDL/history
writes. All affected full suites are rerun after the new compiled metadata.

## Backend checkpoint complete after corrections

Final rebuilt source and reviewed metadata passed:

- `pnpm run typecheck`: exit0; strict new tests included.
- `pnpm run lint`: exit0, zero warnings.
- `pnpm run build`: exit0, runtime SQL/journal hash verified, menu APIs compiled.
- `pnpm run test:menu`:32 passed,0 failed/skipped/cancelled, exit0.
- `pnpm run test:family`:34 passed,0 failed/skipped/cancelled, exit0; unchanged
  backup/restart invitation-grant test passes again.
- `pnpm run test:auth`:14 passed,0 failed/skipped/cancelled, exit0.
- `node --import tsx --test tests/deployment/*.test.ts`:32 passed,0 failed/
  skipped/cancelled, exit0; existing compiled no-source/no-SQL fixture passes.
- `git diff --check`: exit0. No initial0000/SQLite/initial-rollback diff.

Compiled realHTTP coverage includes both exact menu shapes for GET/HEAD/POST/
OPTIONS/PUT/PATCH/DELETE under Host421/anonymous401/pending403/member behavior,
private/security headers on every response, guarded405/no-effect unsupported
methods, false prefixes/siblings, dot/encoded/trailing-slash normalization,
configuration failure and HTTPS HSTS. Both unfinished save/remove streams return
400 before client EOF without writes; strict stateless/JWE identity+token binding
rejects fallback credentials including two tokens for one subject and preserves
secure/chunked positives without cookie refresh. Actual server photo/provider
fetches would fail the fixture's external-network guard; successful menu flows
use no such effects.

Task5–6 are complete. All test processes/databases were owned and cleaned; no
development/hosted schema/data/configuration effect occurred. New menu page/UI,
confirmation browser acceptance, extended compiled menu packaging checks and
final feature-wide verification remain later tasks. Local request deadlines
begin at the application boundary and do not claim a tested hosted ingress SLA.

## UI task7 — browser-first save/list slice

RED: `node --import tsx tests/menu/browser.ts` against the committed backend
failed with `Browser condition timed out: Add to menu action`, before UI code.
The first attempt also exposed an existing Chrome profile cleanup ENOTEMPTY race;
a bounded test-only cleanup retry now preserves the primary failure. The plan
manifest was amended before changing that shared fixture. Clicks scroll controls
into view, matching actual browser interaction rather than DOM `.click()`.

Read the pinned Next page/searchParams and useRouter/Link guides and the frontend/
React skills. Tailwind's downloaded source snapshot is uninitialized; used its
explicit limited engineering-playbook/gotchas fallback and existing utilities,
without downloading licensed sources or changing dependencies. Product UI uses
real publisher URLs; fixture artwork remains test-only.

`pnpm run typecheck`: exit0 after task7 UI, including the strict browser helper.
Production build, lint and browser GREEN follow below.

Task7 GREEN: `pnpm run lint`, `pnpm run build`, and
`node --import tsx tests/menu/browser.ts` all exit0. Lint first rejected two
root-navigation anchors; replaced those with prefetch-disabled Next Link,
keeping fresh ordinary menu navigation. Browser output:
`Production Chrome: search → real save → fresh menu → reload; retained photo,
390/1440 no overflow or console errors.` Screenshots saved as
`org/reviews/saved-recipe-menu-saved-{390,1440}.png` for independent inspection.
No removal controls are claimed by this checkpoint.

## UI task8 — confirmation, refreshed pages and browser acceptance

RED: extended `node --import tsx tests/menu/browser.ts` against task7 build
failed at `control [data-remove-recipe]`, before dialog/controller code.
GREEN: lint, strict typecheck, production build and initial cancel→confirm→real
remove→same-page refresh→empty-link focus→reload all exit0. The expanded browser
matrix also exits0 and prints both acceptance phase summaries. It proves:

- An already visited menu is revisited after search/save with current data;
  save remains available and duplicate-safe. Pending/error/retry messages are
  local and never render fixture/server diagnostic text.
- Native dialog names recipe/shared effect, focuses Cancel initially, traps Tab,
  fits320/390/1440. Cancel/Escape/backdrop send zero removal requests. Failed
  confirmation keeps the card; each retry opens a fresh confirmation.
- Confirmed removal survives reload. A 54-entry menu renders50; deletion refills
  the same page to50 and recomputes its older link. An older page renders3 after
  refill, retains its cursor during removals and ends with an older-page-specific
  empty state. Next/previous remove controls and empty-state link receive focus;
  fresh page navigation focuses the heading.
- Actual owned-DB SELECT revocation produces a recoverable list failure, never
  an empty menu; restoring the grant and Reload menu recovers. Invalid/duplicate
  cursors show the invalid-page state. Literal HTML stays text, missing and failed
  photos use fallback, retained photo stays a direct URL, long text wraps.
- Deliberate one-shot503/403 failures exercise UI recovery; real missing-cookie
 401 exercises session loss. Menu success, duplicate, list and remove use actual
  protected HTTP/storage. Test-only Google/search/photo transport prevents paid
  usage. Expected HTTP401/403/404/503 browser resource logs are identified;
  no unexpected console/runtime/network errors remain.

Expanded-test development caught a scoped test-variable typo (strict typecheck
and browser both rejected it), a valid image served404 still decoding (fixture
now returns undecodable empty image bytes), and activation before fresh-page
hydration (fixture waits for the required focused heading). Assertions retained.
Task7 screenshots remain unchanged; new controls/confirmation/photo screenshots
use distinct `saved-recipe-menu-controls-*`, `-confirm-*`, `-photos-*` names.
Orchestrator independently inspected controls390 and confirmation320/1440.

`pnpm install --frozen-lockfile` initially aborted in sandbox with
ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY (no mutation). The same exact command
with authorized access to the existing native store succeeds: lockfile current,
already up to date, pnpm10.33.0, exit0. No lock/dependency changes.
`pnpm test`:82 passed,0 failed; Python unittest:7 passed, exit0 each.

Task8 and complete-flow checkpoint are complete; final full suites and
independent whole-feature reviews remain below/next, not inferred from browser QA.

## Tasks9–10 — packaging, operator compatibility and final Build/Test evidence

Extended compiled packaging regression now actually saves a snapshot, lists it,
reads the server-rendered `/menu`, removes it and lists empty, using only copied
`.next`, package.json and node_modules. Assertions still prove no repository
`lib` or `drizzle` directory exists in the packaged working directory. Migration
setup belongs to the external owned fixture. Focused packaging test:1 passed;
full deployment regression including this test:32 passed. No source-SQL/runtime
migration fallback, upload-boundary or mandatory metadata-verifier change.

`scripts/postgres-hosted.ts` is source-only compatibility: includes menu table
ownership, SELECT/INSERT/DELETE grants, UPDATE/TRUNCATE denial and initial empty
menu expectations. It was typechecked/linted, never invoked. Its unchanged
initial-empty-target requirement is explicitly documented as unsuitable for a
future populated-data upgrade runbook. AGENTS documents the narrow saved-menu
scope, menu test command and equivalent protected-handler rationale. README
explains shared snapshots, confirmation, pages, photos and explicit migrations.

Final implementation verification, Node24.15.0/pnpm10.33.0:

| Command | Actual result |
| --- | --- |
| `pnpm install --frozen-lockfile` | exit0; already up to date; no lock diff |
| `pnpm run lint` | exit0; zero warnings |
| `pnpm run typecheck` | exit0; all app/tests strict; no exclusions/suppressions |
| `pnpm test` |82 passed,0 failed/skipped/cancelled |
| `pnpm run build` | exit0; reviewed SQL/journal metadata verified; `/menu` and menu APIs compiled |
| `pnpm run test:menu` |32 passed,0 failed/skipped/cancelled |
| `pnpm run test:family` |34 passed,0 failed/skipped/cancelled |
| `pnpm run test:auth` |14 passed,0 failed/skipped/cancelled |
| `node --import tsx --test tests/deployment/*.test.ts` |32 passed,0 failed/skipped/cancelled |
| `node --import tsx tests/menu/browser.ts` | exit0; production Chrome full matrix described above |
| `python3 -m unittest discover -s tests` |7 passed, exit0 |
| `python3 scripts/scan_secrets.py --staged` |0 findings, exit0 at current index |
| Explicit candidate-path secrets scan |0 findings, exit0; includes pending task9/docs source |
| `python3 scripts/check_plan_sync.py --hook --plan intent/saved-recipe-menu/plan.md` | exit0 at current index |
| `python3 scripts/check_plan_sync.py --base 4bbe71f --head HEAD --plan intent/saved-recipe-menu/plan.md` | exit0 through committed UI checkpoint |
| `git diff --check` | exit0 |

The orchestrator owns final staging/commit and must repeat staged-secret/plan-sync
against that exact staged/final revision. Exact Approved plan status and committed
engineer authority remain preserved. Independent whole-feature security/code
reviews are pending; their task10 checkbox remains unchecked rather than claiming
self-review acceptance. The prior source-only backend security consultation is
provisionally clear and does not substitute for whole-feature review.

All owned test HTTP servers, browser profiles and disposable databases were
cleaned in fixture finally blocks. No development QA server was started for this
increment, so no generated dev/types workaround was needed. The parent-started
private native PostgreSQL cluster remains running under its existing lifecycle;
no development schema/data/config changes, hosted migrations, deployments,
provider calls or dependency changes occurred.

Future operator handoff: strict exact catalog/hash/history coupling means both
old-runtime/new-schema and new-runtime/old-schema combinations fail closed.
A hosted rollout requires separate target-specific owner authority, backup,
maintenance/cutover and recovery planning before migration/runtime activation.
Disposable rollback SQL is not production recovery authorization. Publisher URLs
remain mutable links rather than archived photos; application body deadlines
are verified locally before EOF and do not certify upstream hosted buffering.

## Independent review correction — browser-fixture cleanup

Code review found Chrome startup outside the browser helper's protected try:
if startup rejected after allocating the owned random database, its finally never
ran. RED control-flow proof executed the actual TypeScript helper via in-memory
`typescript.transpileModule` and a data-module import, replacing only its three
fixture imports with local throwing/recording objects. It retained the exact
primary startup error but failed `owned database cleanup attempted` (false).
No native database/server/browser was allocated by this fault-injection proof.

Moved Chrome initialization into the protected try, retained a narrowed const
browser for all tests and an optional owned cleanup handle. Service cleanup uses
allSettled, followed by an independent database cleanup attempt. A cleanup failure
cannot replace the primary test failure; cleanup-only failure is reported as a
fixed error, without private configuration or raw service diagnostics.

The same actual-helper fault injection now passes both scenarios: Chrome startup
throws; and normal startup followed by a primary failure plus both server.stop
and browser.close rejections. In both cases database cleanup is attempted and
the original primary error survives; the latter prints only the fixed cleanup
warning. `pnpm run lint`, `pnpm run typecheck` and
`node --import tsx tests/menu/browser.ts` all exit0 after this test-only fix.
The full production browser matrix again passed every phase, with no screenshot
diff and all owned services/profile/database cleaned. `git diff --check`: exit0.
Application/runtime behavior is unchanged. Focused independent reviewer recheck
and final exact-revision audit remain orchestrator-owned; no review acceptance
checkbox is marked by this correction.

## Final independent review and handoff

- Formal security review `org/reviews/security-saved-recipe-menu-implementation-001.md`
  approved application source dee3801, then independently rechecked the helper-only
  cleanup correction at a0420ed; no security issue remains.
- Code review001 found one required fixture cleanup defect. Author corrected it
  without changing runtime code. Code review002 independently fault-injected the
  corrected actual transpiled helper and approved a0420ed; no required finding
  remains. The full production Chrome matrix, lint and strict typecheck passed
  again after that helper-only correction; screenshot bytes are unchanged.
- Root inspected actual1440/390 layouts,1440/320 confirmation and literal-text/
  missing-photo rendering. Original search/provider/photo/shared-auth/Vercel
  behavior is preserved. All plan tasks are complete.
- Final exact-stage secret and plan-sync checks and final-head full manifest
  check are run by the orchestrator at the audit commit. No application source
  changed after the reviewed runtime source.

Ready for the human merge gate on `codex/saved-recipe-menu`. No remote is
configured, so no remote PR was created. Merge, development/hosted migration,
deployment/promotion and release remain unperformed. Existing databases require
a separately authorized reviewed schema/runtime cutover before this build is
used against them; all application verification used owned disposable databases.

## Historical failed-fixture cleanup audit

Root's final read-only audit found one menu-schema disposable database left by
the FIRST task7 RED run. The author confirmed Chrome profile ENOTEMPTY had
skipped the original sequential DB cleanup after that run; the earlier blanket
all-cleaned statement missed this historical failure. This is now corrected.

Exact provenance/cleanup evidence is in `fixture-cleanup-audit.json`: restricted
mp_test owner, current two migration hashes, birthtime17:33:01.549Z before task7
commit, one fixture family/user, zero recipes and zero active connections. Root
removed only that exact database using revalidated guards and a non-FORCE drop.
The re-audit found zero remaining menu-schema test databases; five unrelated
older no-menu test databases were left untouched. No development/hosted target
or application source was changed. Fixed fixture cleanup and independent failure-
path proofs cover future startup/cleanup failures.

## Owner-reported menu-title focus correction

Report ceo-0055: opening the menu makes its title appear selected. Real-browser
RED (`node --import tsx tests/menu/browser.ts`) against the prior compiled app
failed `opening a menu page must not automatically focus its title`, with actual
activeElement.id `menu-heading`. The mount effect imperatively focused that
heading. Desktop/mobile comparison screenshots use distinct `title-focus-before`
and `title-focus-after` names; original approved screenshots remain unchanged.
Chrome verifies the unwanted focus even where native OS/browser highlight styling
differs from the owner's blue appearance; actual DOM text selection was empty.

Removed only unconditional mount focus. Deliberate Older/Newest links now use
native `#menu-heading` targets (including the empty older page), preserving the
approved pagination accessibility behavior. Direct /menu load/reload and header
entry no longer force title focus. No CSS focus suppression, button-label,
authentication, storage/schema or removal-effect change. The spec now states
this distinction explicitly; all confirmation/post-removal focus tests remain.
Test readiness observes hydration of a real React control, independently of
heading focus, with the repository's pinned React version. A test-only
MENU_TEST_BUILD_DIRECTORY chooses the existing owned server fixture's working
copy; application code never reads this variable.

The user's active dev server and `.next/dev/types` were preserved. Because root
next-env.d.ts points at those active dev types, used a private source/build copy
with unchanged pinned dependencies and a private read-only link to the existing
local fixture config. Original next-env.d.ts was checked byte-for-byte unchanged.
No private credentials were copied into evidence or printed. Initial isolated
commands selected the machine's broken global Node22 (missing ICU74), exit134
before Next ran; explicitly selecting the already-approved Node24.15.0 PATH
resolved this without changing system/repository configuration.

GREEN actual results:

- Root `pnpm run lint`: exit0, zero warnings.
- Isolated `pnpm run typecheck`: exit0, strict checks including updated tests.
- Isolated `pnpm run build`: exit0, reviewed runtime metadata verified.
- Root `pnpm test`:82 passed,0 failed/skipped/cancelled.
- Isolated `pnpm run test:menu`:32 passed,0 failed/skipped/cancelled.
- Isolated `pnpm run test:family`:34 passed,0 failed/skipped/cancelled.
- `MENU_TEST_BUILD_DIRECTORY=<private-copy> node --import tsx tests/menu/browser.ts`:
  exit0. Direct/header/reload title stays unfocused/unselected; normal Tab reaches
  navigation with visible focus and no trap; Older/Newest intentionally focus
  heading. Full existing real-storage/photo/paging/cancel/retry/confirmation/
  next/previous/empty-state focus matrix passes at390/1440, dialog320.
- Orchestrator independently reran Python workflow regression:7 passed in2.077s,
  exit0 (reported by root; not a new local invocation by this agent).

Only owned temporary fixture services/databases were used. No active user server,
private config, development/hosted schema/data, migration or deployment action was
changed. Independent focused review approved this correction with no required
findings in `org/reviews/code-saved-recipe-menu-title-focus-001.md`. The prior
full-feature reviews are not represented as reviewing this fix. The human merge
gate remains pending; subsequent saved-button changes require their own review.

## Owner0056 — disable saved recipes and remove Add again

RED before implementation: new real HTTP lookup test returned400 instead of200;
real Chrome failed `saved recipe is disabled after success` (actual false).
New bounded-source/body tests also failed (missing parser export and rejected
lookup shape). These are superseding owner requirements, not relaxed tests.

Implemented exact read-only POST `/api/menu?lookup=saved` with exact sourceUrls
array of1–6 normalized URLs, shared Origin/16KiB/five-second parser, current
family checks and bound family+ANY query LIMIT6. GET pagination, schema/grants,
common write-lock behavior, Proxy matcher and provider/photo behavior unchanged.
Lookup returns matching requested URLs only and performs no durable effect.

Notebook now owns normalized-URL status across active results, filters and group
remounts. Unknown/checking and known saved actions are disabled; saved label and
accessible name say Added to menu, with no Add again. Lookup failure offers
Retry checking menu (no save); actual save failure retains Retry adding to menu.
Successful saves update shared state. Generation/abort checks discard abandoned
lookups; per-URL save revisions prevent earlier lookup callbacks from reverting
a later save success. A save cannot start while unknown/checking, so browser
coverage does not fabricate concurrent saving from a disabled control.

The Chrome fixture matches failure injection by exact pathname+query so an
intended save503 cannot accidentally fail lookup. It records and cancels its
owned delayed fixture response when the browser aborts an abandoned request.
No production test hook was added. The final browser run proves delayed old
lookup cancellation while switching to a newer search, plus current ready status
without old failure feedback. Reviewer caught an initial evidence gap: clicking
the already-selected notebook heading twice does not reopen it. Corrected this
to select a different existing group, assert the active group changed, then
return and assert the original group reopened; final GREEN includes that real
remount. Source-level zero-warning lint caught an unnecessary ref mutation in
effect cleanup; removed it, retaining abort and request generation protections.

Actual final GREEN (same private isolated Node24 build approach as focus fix):

- `pnpm run lint`: exit0, zero warnings after final TS fixture edits.
- Isolated `pnpm run typecheck`: exit0, strict final tests/helper included.
- Isolated `pnpm run build`: exit0, reviewed runtime metadata verified.
- `pnpm test`:82 passed,0 failed/skipped/cancelled.
- New focused realHTTP lookup regression:1 passed; full `test:menu`:35 passed,
  0 failed/skipped/cancelled. It proves older-than-first50 membership, separate
  family invisibility, bad query/shape/source/Origin/anonymous rejection, bounded
  input and unchanged recipe count.
- Isolated `pnpm run test:family`:34 passed,0 failed/skipped/cancelled.
- Isolated full deployment regressions:32 passed,0 failed/skipped/cancelled;
  compiled no-source/no-SQL package now exercises lookup then save/list/page/remove.
- `MENU_TEST_BUILD_DIRECTORY=<private-copy> node --import tsx tests/menu/browser.ts`:
  exit0. Native saved disabled click sends no save POST; checking/retry lookup
  sends no save; errors still allow save retry. Actual different-group reopen,
  new same-URL search, reload/new search and filter remount retain disabled state.
  Browser also searches the oldest saved URL in a54-row menu (beyond first50)
  and confirms it is disabled without a save POST. All existing title/pagination/
  photos/confirmation/removal focus checks continue passing at390/1440 and320.

Dedicated `saved-recipe-menu-disabled-{390,1440}.png` capture the new control;
previous approved photo screenshots restored after test regeneration. The exact
user next-env.d.ts bytes, active dev server and active dev/types remain untouched.
Fixtures cleaned their owned servers/profiles/random databases. No development/
hosted migration, production data/config change, deployment, provider spend or
new dependency. Independent focused code and security reviews approved this
correction without remaining required findings:
`org/reviews/code-saved-recipe-menu-saved-status-001.md` and
`org/reviews/security-saved-recipe-menu-saved-status-001.md`. The orchestrator
inspected both disabled-state screenshots and verified workflow/message checks.
Staged/final-revision audits are orchestrator-owned. Human merge and release
remain pending; this correction grants neither authority.

Final supplemental source freeze: base
`0225e338382ae99670c5c14b80d194eb9c6f12b9`; SHA256 of `git diff --binary HEAD`
restricted to the16 changed README/application/library/test/spec/plan paths
(excluding this evidence file, org audit, screenshots and the user's next-env):
`5f5b02159684f78c62707314d65fc08a470cf15a3029ae1c4fe4aaa8175d5481`.
After checks and reviewer source stability, removed only the owned private
`meal-menu-focus-*` source/build snapshot after verifying its owner/name and
that original next-env still matched exactly. No isolated server was running;
node_modules/private fixture-config links were unlinked with the snapshot,
leaving their original targets, active dev outputs and private backups intact.
No temporary helper file was added outside that owned snapshot.

## Current-main integration candidate — shared shell and staging-first main

Integrated main6efc2cff into feature6458023 without committing or switching to
main. Application conflicts were home composition and the shared Chrome scroll
helper. Adopted main's root/home shell, preserved all its family/account styling,
added fresh Menu navigation to Primary beside Recipes/Family, removed duplicate
menu header/outer padding and retained one Your menu h1. The scroll helper keeps
main's real-input scroll behavior and feature fixtures/cleanup. Save/status,
confirmation, title and post-removal focus behavior stay intact. Added inherited
shared-layout HTTP/browser coverage for Menu and adjusted Tab traversal to the
shared brand/navigation. No runbook, runtime/auth/provider/schema relaxation.

The orchestrator separately preserved the exact full feature audit under
org/archive/saved-recipe-menu-pre-main-6458023, retained canonical main workflow/
message IDs/ledger and staging-first runbooks, and rewrote feature references.
This implementation did not concatenate ledgers or choose conflicting audit data.

Integration RED: updated shared-layout HTTP regression against prior compiled
feature failed2/2 (public header missing, no shared Primary navigation). Combined
isolated GREEN: lint/typecheck/build exit0; recipes82, menu35, family34, auth16
(including the2 inherited shared-layout tests extended to Menu), deployment32,
all0 failed/skipped/cancelled. Full menu Chrome passes390/1440 and dialog320,
including current-family status, disabled saves, stale request handling, paged
reads, title/keyboard and confirmation/removal focus. Inherited auth/recipe/game
Chrome passes320/390/768/1024/1440 with real HTTPS publisher photo, ten deliberate
fixture429s and0 unexpected errors. Inherited family Chrome production and
owned-development/StrictMode flows both pass320/1440 without overflow/errors.
Python workflow regression:7 passed in2.249s, exit0.

The initial unbounded inherited shared-layout browser stalled after its signin320
frame; its owned Chrome still responded to public-page diagnostics (ready complete,
fonts loaded). It is recorded inconclusive/terminated143, not a pass or an app
failure. Stopped only verified test74145 and its Next74158/Chrome74162 children.
Identified its unique owned random DB by menu schema + fixture state, then dropped
only mp_test_85c2e7420bb01519cf5ba64d with exact name/owner/reviewed hashes/
1family1user1invitation0recipes and zero-connection checks, without FORCE. Removed
only its stopped profile and the completed auth QA profile after process checks.

One bounded PRIVATE rerun of that same shared-layout browser added CDP command
10-second deadlines/phase labels and bounded fixture cleanup, retaining every
original assertion. It passed all six public/member/account/invitation routes at
320/1440, common landmarks/background, keyboard navigation, guarded/no-prefetch
links and create/revoke behavior, exit0. Those private diagnostic edits were then
restored from exact repo source; no diagnostic/test weakening entered this diff.
The transient original stall's cause remains unproven.

Automatic approval review rejected frozen install in the active checkout because
it could relink active dependencies. The shared-node_modules isolated attempt had
already aborted without mutation. Followed the safe alternative: unlink only the
candidate's symlink and run CI=true pnpm install --frozen-lockfile --offline in
that private copy, creating its OWN node_modules:434 cached packages,0 downloads,
exit0. No active-checkout dependency mutation or rejected-action workaround.

All QA ran in a private candidate with owner-only fixture configuration access;
source next-env was backed up privately and repeatedly compared byte-for-byte.
The user dev server, active dev/types, config and all historical screenshots stay
untouched. Only new dedicated main-menu390/1440, main-confirm320 and main-signin320
screenshots were copied back. Following owned-development QA, final strict check
correctly caught duplicate generated LayoutProps/RouteContext in the PRIVATE
candidate. Applied the documented workaround only to its stopped/unlocked
candidate dev/types, moving it to an owned private backup; production type/build
regeneration results follow. Original user dev output remains active/intact.

Final isolated production regeneration: strict typecheck exit0, build exit0 after
the inactive candidate-only cache workaround. No compiler exclusion or source
change. Final user next-env byte comparison passes; removed only the owned
isolated integration directory/dependency copy/private temporary backups after
all fixture jobs stopped. User dev server/config/dependencies and prior private
backups remain untouched. Source frozen for reviewed integration; no unmerged
paths, candidate secrets0 and git diffcheck0. Commit/merge/release remain with
orchestrator; this agent performed no external or hosted effect.
