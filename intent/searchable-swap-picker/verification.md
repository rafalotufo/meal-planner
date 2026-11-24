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


## Root source-equivalence and final handoff

Fixed reviewed source: `b0627be7e2e65eed7061c4cbb1bb4182ed436a52`.
Root checked each of the23 handoff paths against its original intake baseline
before copy-back, then checked exact private/original bytes. Independent security
verified all23 working/committed/private paths; the final code reviewer separately
verified all10 changed runtime/test paths. Later audit commits contain only
workflow/review/evidence changes and do not alter this fixed application source.

The user's `next-env.d.ts` SHA256 remains
`0f70629890b72a0a82e91972cc032c04b658b26c265373cb711cf576bfbf8fcc`;
it was never staged. The owner's development process and original `.next` were
not stopped/rebuilt. No schema or migration action is required for this feature.
Actual test outputs are summarized above; private QA logs are temporary and the
owned private copy is removed after the final reviewers finish. Screenshots and
review reports remain versioned in the repository.

Independent security: `org/reviews/searchable-swap-picker-security-001.md` (CLEAR).
Independent code review: `org/reviews/searchable-swap-picker-final-001.md`.
The org loop completes local implementation only. Human merge and release remain
pending; hosted ICU availability must be checked read-only for an authorized
release target before release validation. No deployment or hosted access occurred.

## Follow-up — stable frame while typing search

Approved bounded fix plan:
`org/reviews/searchable-swap-picker-stable-frame-plan-001.md` (0125d52).
Implementation/QA occurred only in
`/private/tmp/meal-planner-stable-modal-dyn7d8_a/project`, using the same explicit
pinned Node24 PATH and empty paid key as above. Original live server, app source,
next-env.d.ts and .next were untouched. No Git or copy-back operation ran here.
Private generated types remain excluded from copy-back.

### Reproduction and root cause

Added a real Chrome bounding-rectangle regression before changing production CSS.
The unchanged application built successfully (`build-red.log`), then
`node --import tsx tests/plans/browser.ts` exited1 (`browser-red.log`):

|320×1000 state|x|y|width|height|
|---|---:|---:|---:|---:|
|Populated menu|16|16|288|968|
|Typing first character F / debounce|16|266|288|468|

Height changed500px and native centering moved the top edge250px. `reset()` was
correctly clearing stale choices; maximum-height-only dialog/wrapper sizing made
the frame's intrinsic height collapse around the short loading message. Search
state or response timing did not need changing.

### Minimal correction and results

Production change is exactly two class attributes in
`app/plans/swap-recipe-dialog.tsx`: give the outer frame explicit height
`min(52rem, calc(100dvh - 2rem))`, and replace the inner maximum-height constraint
with `h-full`. Keep existing capped width, flex result region/min-height-zero,
internal overflow, short-viewport outer scroll,44px close target and all event/
network/state/selection/submission behavior unchanged. No JavaScript sizing,
retained stale choices, transition masking or new helper was introduced.

Final private `pnpm run lint`, `pnpm run typecheck`, and `pnpm run build` all
exited0. Logs are `lint-final.log`, `typecheck-final.log`, `build-final.log` in
`/private/tmp/meal-planner-stable-modal-dyn7d8_a/`. Source/build were frozen before
root's broader compiled regression runs.

Final Chrome exited0 (`browser-final.log`). Each viewport checks actual x/y/
width/height through populated results, physical typing F then Fa/debounce,
delayed response-body loading, populated matches, no matches, a valid empty page,
load error, Retry results, selected long title and scrolling to the footer.
All55 samples across11 states×5 viewports remained exactly stable:

|Viewport|Maximum rectangle delta|
|---|---:|
|320×1000|0px|
|768×1000|0px|
|1024×1000|0px|
|1440×1000|0px|
|320×568|0px|

The regression allows at most1 CSS pixel; no allowance was weakened after the
red run. Frame bounds, no document horizontal overflow and footer access pass.
The same run preserves the complete prior native keyboard/focus/dismissal,
explicit one-POST, full-menu paging/search, thumbnail/fallback, response limits,
request/instance race, captured stale revision and planning/history checks.
All owned browser/profile/server/database fixtures were cleaned up.

Refreshed existing browse/selected `swap-picker-{browse,selected}-{320,1440}.png`.
Visually inspected browse320/1440: stable centered frame, compact rows/desktop
columns, clear search and accessible footer. Inspected selected320×568: long title
wraps, the short frame remains bounded and Cancel/Suggest stay reachable.
Geometry changes only when the viewport changes, not while typing or loading.
No security/API/database/provider/scheduler/deployment boundary changed. Root
retains baseline-guarded copy-back, diff/secret checks, exact-source final review
and human merge/release gates.

Root's current frozen-build menu run completed exit0,39/39. All223 Node tests
(82 recipes+34 family+39 menu+16 auth+20 plans+32 deployment) and7 Python tests
passed on this fixed build, with no failures. Root logs are the current QA
parent's `regression-*.log`. This completes the current aggregate rather than
reusing the prior feature run's result. Final source/build remain frozen.


Root copied back the seven approved handoff paths only, with original-baseline
hash checks and exact private/original bytes. Fixed follow-up application source:
`5e4dd69` (two sizing class attributes); later audit edits do not change it.
The user's original next-env SHA remains unchanged and unstaged. Original dev
process/cache remain untouched. The owned private QA copy is removed after the
independent final review; versioned screenshots and result summaries remain.
Final follow-up review: `org/reviews/searchable-swap-picker-stable-frame-final-001.md`.

## Follow-up — quietly retain displayed recipes until new results are ready

Approved amendment: `org/reviews/searchable-swap-picker-retained-results-plan-001.md`
(0aec91d). The owner's further instruction, “No need to display updating recipes,”
was applied during implementation: no visible Updating message is rendered while
successful recipes remain displayed. aria-busy preserves the loading signal;
initial loading with no previous successful page retains its original message.

All changes and QA occurred only at
`/private/tmp/meal-planner-retained-results-0he__gw5/project`, using pinned Node24
PATH and empty paid keys. Original application source, live process, next-env.d.ts,
.next and development/hosted data were untouched by this developer. No Git or
copy-back operation ran here; private generated next-env remains excluded.

### Actual red/green behavior

Added real DOM choice-ID assertions before changing the dialog. The old source
built successfully (`build-red.log`), then Chrome exited1 (`browser-red.log`):
“Retained-results baseline:43 populated choices;0 choices while typing F.”
The exact saved ID array became empty during debounce, reproducing the reported
blanking. No production source had been changed before that failure.

Only `app/plans/swap-recipe-dialog.tsx` runtime state/rendering changed. A single
successful displayed snapshot now carries its validated page/query/cursor;
requested query/page remains separate. Query/page changes still abort old work
and clear selection immediately, but preserve the display. Native choices,
paging and confirmation are disabled while the latest request is pending,
failed or not represented by the displayed snapshot. Metadata names the actual
visible query/page. Only current-instance/current-request validated success
commits a replacement snapshot; ordinary failures retain it with Retry, whereas
current401/403 clears confidential displayed recipes. Stable-frame CSS, API,
parent action ownership, response/deadline bounds and version guards are unchanged.

Final Chrome exited0 (`browser-final.log`), reporting:
“Retained-results baseline:43 populated choices;43 choices while typing F.”
Exact IDs/order stay identical across successive physical characters, debounce
and delayed response-body loading. Selection is immediately absent, old native
choices/paging are disabled and confirmation cannot submit them. Only completed
validated latest success replaces the IDs and permits fresh selection. No visible
Updating copy is present while aria-busy is true. Ordinary malformed-response
failure preserves old IDs with disabled actions and Retry; Retry replaces them
with the requested results. Current401 and403 each clear the retained cards and
show access links. A changed query after paging sends no old after cursor; a
valid empty success replaces rather than indefinitely retaining old recipes.

The full prior request/close/reopen/post-fetch-body/late-mutation race, native
keyboard/focus/dismissal, one-POST/captured stale revision, full-menu search/paging,
image fallback and unique planning/history assertions remain. All55 physical
rectangle samples at320/768/1024/1440×1000 and320×568 still have maximum delta0px.
No numeric dates outside history controls, horizontal overflow or unexpected
browser console errors. Owned browser/profile/server/database resources cleaned.

### Final checks and visual handoff

Private lint, strict typecheck and production build exited0. Source/build were
frozen before root's full broad batch; all223 Node tests (82 recipes+34 family+
39 menu+16 auth+20 plans+32 deployment) and7 Python tests passed on this build.
No Node test count was added; the regression extends the existing Chrome flow.
Actual logs in `/private/tmp/meal-planner-retained-results-0he__gw5/`:
`lint-final.log`, `typecheck-final.log`, `build-final.log`, `browser-final.log`,
plus root's `regression-*.log`. Red logs above remain preserved.

Refreshed the existing four browse/selected modal screenshots. Visually inspected
browse320/1440 and selected320×568: accurate display metadata, stable rows/grid,
wrapped long title, no visible Updating label and reachable action footer. Prior
stable-frame geometry and scrolling are preserved. Exact handoff paths are in
this QA parent's `handoff.json`; only dialog, browser test, feature verification
and changed existing modal PNGs are eligible for guarded copy-back. No helper,
dependency, schema, API/auth, provider, scheduler, deployment or hosted change.
Root owns final source/security review, baseline-checked copy-back, Git/secret
checks and separate human merge/release gates.


Root retained-results handoff: fixed application source `4f91e9c` supersedes the
prior immediate-clear behavior. All seven approved source/test/evidence paths
passed original-baseline hash checks before copy-back and exact private/original
byte comparisons afterward. The user's next-env SHA remains unchanged/unstaged;
original dev process and .next remain untouched. Private QA logs are temporary;
the owned copy is removed after exact-source independent reviews, while these
summaries/screenshots remain versioned. Final review artifacts:
`org/reviews/searchable-swap-picker-retained-results-security-001.md` and
`org/reviews/searchable-swap-picker-retained-results-final-001.md`.


## Local-main integration — current inputs and initial regression evidence

Candidate parents: main `b9812311562a960d9475f219a85d38421e7ab6e0` and feature
`9fe0f42e467c6d13d5223f9f88877723981d7914`; merge base
`17881438e3c68f0099e063e714560682c93bd0fb`. The private integration clone is
`/private/tmp/meal-planner-merge-modal-siy3ou59/repo`. Application runtime merges
cleanly; resolving audit conflicts must not replace main's newer recipe-count,
copy or completed-release evidence. Main AGENTS is retained byte-for-byte.

Root's combined frozen-runtime checks initially reported deployment31/32,
auth15/16 and family33/34: the failures all assert the old home prompt “What would
you like to cook” while main's reviewed exact prompt is “What would you like to eat
this week?”. The same stale text occurs in auth browser QA. The bounded plan
amendment explicitly names those four test files and proposes only exact new-copy
assertions, with all other assertions preserved. Independent approval precedes
test synchronization; actual rerun results will be recorded separately.

### Audit conflict resolution manifest

Source records and per-file SHA-256/byte counts are preserved under
`org/merge/searchable-swap-main-2026-11-24/manifest.json`:582 exact archived files
from both immutable parent commits, including all source messages, original
ledger/memory/context/loop/status/graph, main AGENTS/CLAUDE and every feature-owned
reference-adjusted document. `README.md` explains source boundaries and mappings.
Original snapshots were read with git-show, never copied from a mutable build tree.

|Conflict|Canonical resolution|
|---|---|
|gates/ledger.jsonl|Main's124 records remain an exact byte prefix. Append11 historical feature-only records after the common117, preserving gate/decision/artifact/approver/commit/time/expiry; fresh import-searchable-swap IDs, explicit historical evidence/source SHA/original hash, rehash only appended links. Both original chains remain independently archived.|
|org/memory/events.jsonl|Main's129 events remain exact byte prefix; append15 feature-only events after common126 as mem0130–0144, with original event/commit/hash provenance.|
|org/memory/context.md|Regenerate machine digest from preserved streams and solved feature workflow; both original contexts archived. Main's empty curated notes preserved. Context fits the unchanged16KiB/200-line budgets; no check suppression or historical event shortening.|
|org/messages/ceo-0051.md and ceo-0052.md|Keep main originals exact; feature messages become ceo0059/0060 aliases with original snapshot/provenance footers.|
|org/messages/orchestrator-0087.md and orchestrator-0088.md|Keep main originals exact; feature messages become orchestrator0119/0120 aliases with original snapshot/provenance footers.|
|org/status.yaml|Keep latest feature agents/solved-work reports and all84 review entries, already containing all70 main review entries byte-for-byte. Main's completed status/release evidence is separately archived and retained in canonical main ledger/events/messages.|

`message-map.json`, `ledger-imports.json`, `memory-imports.json` and
`reference-remaps.json` give explicit original→canonical IDs and affected paths.
Only11 feature-owned current documents/messages/reviews needed four message-name
reference corrections; each exact original is archived first. Main release
references, original message bodies and historical loop archives are not rewritten.
Active feature config/state/history/graph remain exact feature bytes, with solved
turn/budget unchanged. No fabricated new review turn, owner approval or release
permission is created by imports. Main's AGENTS is byte-identical, including the
completed saved-menu hosted cutover and incompatible-old-catalog rollback caveat.

Writer checks before handoff: both archived source ledger chains and canonical
135-record chain pass canonical hash/prev-hash verification; main ledger/event
prefix assertions pass; message validation311 messages/0 violations; org loop0;
fresh memory0. Runtime source/config/dependencies/migrations were not changed by
the audit resolution. Root's captured tested runtime hashes tie its clean merged
runtime to the candidate after the audit-only resolution.

The independent integration-plan reviewer approved the exact four test-copy
synchronizations. Three unit/integration regex assertions now match the exact
new label with a literal escaped question mark; the auth browser assertion uses
the exact new string. No assertion was removed, widened to alternatives, or made
optional. The legacy auth browser literal was inspected/synchronized; root has
not claimed running that optional legacy harness in this integration. Dedicated
planning Chrome, including all55 stable-geometry and retained-results/race checks,
passed on the combined runtime. Root reruns auth/family/deployment and strict
checks after the test-only changes; actual final outputs belong to its later
candidate verification, rather than being inferred from the initial red run.

All conflict resolution occurred solely in the private integration clone; no
original app/.next/next-env/main worktree edit, local/hosted migration, provider
call, deployment, push or job activation occurred. Root owns candidate commit,
independent exact-source integration/security review, fresh human local-merge
record and expected-tip main fast-forward. Historical Production approvals apply
to their recorded source/catalog only and grant no new release authority.

Root's affected reruns completed: family34/34, auth16/16, deployment32/32,
lint and strict typecheck all exit0. Combined candidate evidence is223 Node tests,
7 Python tests, production build and complete planning Chrome/55 geometry samples,
all green. Root's165-path frozen-source check is unchanged except the four
peer-approved literal test assertions; final-source-hashes.json is root-owned
matching-source evidence in the integration QA parent. All eight audit conflicts
are staged resolved, git diff --check passes, and no developer commit was made.
