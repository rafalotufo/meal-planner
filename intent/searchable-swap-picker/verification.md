# Searchable swap picker — private verification

Implementation/evidence date:2026-11-24. Design approval:
`org/reviews/searchable-swap-picker-plan-001.md`; approved source artifacts were
read from the original checkout at3d2fdeb, with independently approved Unicode
clarification323a153. Root owns final source/security approvals and copy-back.

## Isolation and source correspondence

All source changes and verification were performed ONLY at
`/private/tmp/meal-planner-swap-modal-qa-3jajuef1/project`, the root-prepared copy
with baseline hashes at its parent `baseline.json`. Every command explicitly used
that cwd and `PATH=/Users/rafael/.nvm/versions/node/v24.15.0/bin:$PATH`, with empty
OPENAI_API_KEY for tests/build. Pinned Node24.15.0/pnpm10.33.0 and the original
installed dependency link were reused. No dependencies/configuration were added.

Original application source, `.next`, `next-env.d.ts`, live development server,
development/hosted databases and private environment were untouched by this
developer. The private copy's generated `next-env.d.ts` is excluded from copy-back;
root must preserve the owner's original bytes. No Git command ran inside this
private project. Root checks original baselines and copies only reviewed manifest
sources, tests and evidence, never `.data`, `.next` or generated private types.
Private spec/plan copies predate original approval-status/ICU updates and must not
overwrite the current approved original documents.

## Test-first and incremental evidence

First focused command:
`node --import tsx --test tests/menu/validation.test.ts tests/menu/store.test.ts`
exited1:5 tests,3 pass/2 fail. New search was ignored by the old store (unmatched
titles present) and the strict MenuPage parser did not exist. Tests preceded
search/validation implementation. After implementation11/12 passed; native
PostgreSQL's default locale folded `CRÈME` to `crÈme`, unlike `crème`. The architect
and independent reviewer approved static schema-qualified built-in ICU collation
in both bound lower operands, preserving cursor sort; focused suite then passed
12/12. No runtime collation creation, schema change or JavaScript post-filter.

A final direct-caller sparse-array regression exposed Array.map skipping holes:
validation suite exited1,7 pass/1 fail. Replacing that new parser's map with
Array.from ensures every slot is validated; suite then exited0,8/8. JSON network
payloads cannot contain sparse holes, but the pure unknown-input contract is now
strict for direct callers too. No unrelated old assertion was removed.

Initial lint found two effect-counter cleanup warnings. Capturing the stable
counter object in each effect resolved them without suppression. Strict typecheck
and both production builds passed. The final build was frozen before final
compiled deployment/planning and menu/browser runs; no concurrent rebuild raced
packaging. The source changes remain within the approved manifest.

## Final command results

- `pnpm run lint`: exit0, no warnings, including root final lint.
- `pnpm run typecheck`: exit0; final production build also passed strict TS.
- `pnpm run build`: exit0, reviewed migration metadata unchanged/matches SQL and
  journal; protected menu/plans routes compiled with existing Proxy.
- `pnpm run test:menu`: exit0,39/39. Actual full output:
  `/private/tmp/meal-planner-swap-modal-qa-3jajuef1/menu-final.log`.
- Root ran `pnpm test`:82/82; `pnpm run test:family`:34/34;
  `pnpm run test:auth`:16/16; `pnpm run test:plans`:20/20; and compiled
  deployment suite32/32. Root repeated planning20/20 and deployment32/32 on the
  final build after the last parser/CSS correction. All exits0. Logs are at
  the QA parent `regression-{recipes,family,auth,plans,deployment}.log` and
  `regression-{plans,deployment}-final.log` (root-owned commands).
- Current distinct Node total:223 tests (82+34+39+16+20+32). Focused repeats are
  not additional tests. Root reports Python workflow7/7 exit0 and org checks.
- `node --import tsx tests/plans/browser.ts`: final exit0. Actual full output:
  `/private/tmp/meal-planner-swap-modal-qa-3jajuef1/browser-final.log`.

Root performs `git diff --check`, staged secrets and workflow/ledger checks on
the reviewed source copy-back. Private changed-text whitespace checks supplement
those root checks; they are not represented as a Git command in this private copy.

## Search, network and preserved security evidence

Pure/store/real HTTP tests cover omitted/blank q compatibility; trim/100 UTF-16
bounds; malformed Unicode/controls; literal percent, underscore, quotes and
Unicode case matching;55 matches behind50 newer unrelated entries; filtered
50+5 keyset pages; canonical descending unique response entries/cursors and exact
keys; malformed/oversized response shapes. Store validation applies to direct
callers. HTTP rejects duplicate/unknown q/after, unsafe bounds and q on POST.

GET/HEAD remain read-only and retain the exact menu handler guard, family/session
checks, server-derived family scope, private/security headers and protected
methods. Existing admission, signed-token/JWE, canonical Host, stalled body,
family isolation, rollback, saved snapshot and other menu regressions all pass.
No planning store/action/schema, provider/photo server, auth policy, Proxy,
package/lockfile or deployment changes were made.

Native local PostgreSQL supports `pg_catalog."und-x-icu"`; both lower operands use
that static collation and a bound query, with saved_at/id ordering unchanged.
Hosted availability was not checked or assumed; a read-only hosted compatibility
check remains a pre-release requirement. No hosted access/migration was performed.

## Actual Chrome coverage and fixture boundary

The normal flow uses real protected HTTP, current test-Google admission/family,
owned random migrated database/server/profile and physical CDP mouse/keyboard
controls. No application-state/handler bypass or production test hook exists.
Existing Chrome helper was unchanged. The existing image fixture supplies one
saved photo and a broken-photo404; null photos use the same visible fallback.

A root-approved browser.ts-only one-shot transport wrapper supplies malformed
JSON shape, >512KiB stream, invalid UTF8,401/403 and delayed header/body responses
for the new GET. Retry then uses actual protected HTTP. The production512KiB
reader, fatal UTF8/JSON/page validator,12-second request controller and instance/
request guards process those fixtures. Superseded old requests, including a fetch
whose body remains pending, cannot replace new query results/loading/error.
Dismiss/reopen starts fresh and aborts old GET work. These wrappers are restored
on every tested path and in final cleanup.

A separate wrapper delays delivery only after an actual suggestion POST resolves.
Physical repeated confirmation sends exactly one real POST. Cancel/reopen during
that response does not close/reset/error the new dialog when the old operation
finishes; the parent retains its global mutation guard and reports actual outcome.
An open picker captures its original revision: another device accepts a real
swap, modal confirmation receives409, remains open with safe error text, and its
Refresh action returns the current plan. No rollback of an already-sent mutation
is claimed on dismissal or timeout.

Chrome verifies initial search focus, native Enter selection, Tab/ShiftTab
containment, clear selected state, explicit confirmation only, no POST from
search Enter/selection/Cancel/Escape/backdrop, connected-trigger focus return,
search beyond first50, newest/older modal pages independent of legacy menuAfter,
all-planned/no-match recovery, Retry/access links, saved/null/broken image
behavior and accurate per-page available counts. Empty pages also have pure-parser
coverage; no optimizer/provider call was added to the implementation.

All prior planning assertions remain: unique1/2/6/7 counts/URLs, duplicate409,
retained pending/rejection/distinct replacement, approval reset, stale revision,
variable confirmation counts, no numeric header/card dates, immutable final/legacy
history and truthful raw-history preservation. Old select/page mechanics were
replaced by stronger full-menu modal checks, not removal of behavior coverage.

## Visual inspection and artifacts

At320/1440 Chrome checks dialog bounds/no horizontal overflow and44px close target.
Also tested the selected long-title footer at320×568: actions remain reachable
through internal scrolling. Screenshots:

- `org/reviews/swap-picker-browse-{320,1440}.png`
- `org/reviews/swap-picker-selected-{320,1440}.png`
- Refreshed existing `org/reviews/weekly-plan-*` images emitted by the planning flow.

Visually inspected all four new modal images: compact96px mobile rows, desktop
three-column choices, reserved saved photo and stable unavailable-photo fallback,
wrapped long titles, obvious selected badge/color and reachable Cancel/Suggest
footer. Selected mobile image uses the short568px height. No numeric dates in
main content, document overflow or unexpected browser console error. All owned
Chrome/server/database resources were cleaned up.

## Handoff and authority

Runtime changes: `app/api/menu/route.ts`, `app/plans/{page,plan-controls}.tsx`,
new `app/plans/swap-recipe-dialog.tsx`, and `lib/menu/{store,validation}.ts`.
Tests: `tests/menu/{http,store,validation}.test.ts` and `tests/plans/browser.ts`.
Feature verification/new modal screenshots and changed existing feature images
are evidence. No additional helper or dependency path changed.

No original source copy-back, hosted operation, migration, job activation, paid
call, push, merge or deployment occurred here. Root owns guarded copy-back,
exact-SHA independent security/final review and human merge/release gates.
