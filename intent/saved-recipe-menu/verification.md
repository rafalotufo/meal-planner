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
