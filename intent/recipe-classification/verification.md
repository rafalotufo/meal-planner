# Saved recipe classification — local verification

- Status: Local implementation verified, independently approved and merged into local main under the owner approval in `merge-approval.md`; staging/release gates remain pending.
- Final application source: `4a05fbf` (dropdown-only), autosave `76eaafb`, cumulative storage `69b2719`.
- Security: `org/reviews/security-recipe-classification-001.md`, approvals `d84ac54` and `cd8609c`.
- Code review: `org/reviews/code-recipe-classification-001.md`, approval `ac42663` of `76eaafb`.
- No merge, hosted migration, staging deployment or Production release is authorized.

## Result and review scope

Recipes receive Main dish, Side or Veggie during existing search curation or
supported associated URL metadata curation. Uncertain and legacy recipes remain
Unclassified. The owner confirmed manual corrections and subsequently directed
immediate dropdown autosave, removing the Save category button. The amended
specification/plan was independently approved in `3e69b40` before code changes.

Real Chrome proves immediate request on native selection, pending disable,
sanitized failure with selection reset and unchanged saved label, deliberate
reselection retry, reload persistence, and corrections on pending/failed URL
imports surviving curation retry. Exact family/current admission, Google-only
category writes, synthetic snapshot permissions, body deadlines, immutable plan
history and duplicate preservation remain covered. No new provider/source pass.

## Passed commands

| Command | Actual result |
| --- | --- |
| `pnpm run lint` | exit0, zero warnings, rerun after autosave |
| `pnpm run typecheck` | exit0, including final post-browser check |
| `pnpm run build` | exit0, fresh autosave build |
| `pnpm test` | 118/118 |
| `pnpm run test:family` | 35/35 |
| `pnpm run test:menu` | 78/78 |
| `pnpm run test:plans` | 37/37 |
| `pnpm run test:migrations` | 70 distinct cases passed across affected reruns; final corrected security file30/30, remaining40 passed in preceding full run |
| `pnpm run test:auth` | 16/16 |
| `node --import tsx --test tests/verification/*.test.ts` | 30/30 |
| `node --import tsx --test tests/deployment/*.test.ts` | 42/42, including clean source-upload build |
| `node --import tsx tests/menu/browser.ts` | exit0 on final autosave build |
| `node --import tsx tests/menu/curation-browser.ts` | exit0; confirmed again after temporary diagnostics restored |
| `python3 -m unittest discover -s tests` | 7/7 |
| focused category/curation/metadata tests | 23/23 |
| focused menu validation/body/plan validation tests | 23/23 |
| metadata contract tests | 6/6 after actual eight-identity profile generation |
| `git diff --check` | exit0 |
| staged plan-sync and secret scan | passed, zero secret findings before implementation commits |

No application tests were skipped, removed or suppressed. The 43 independent
security focused tests and the independent review mutation check supplement the
required suites; they are not added to totals because cases overlap.

## Private command logs and visible evidence

Owned private temporary directories preserve actual command output:

- `recipe-classification-checks-KxCqIF`: initial build/family pass and four fixture failures.
- `recipe-classification-checks-2dz37o`: menu78/78, plans37/37, remaining TEMP attack fixture failure.
- `recipe-classification-checks-Ep2ANk`: corrected security30/30, auth16/16, verification30/30; initial upload packaging failure.
- `recipe-classification-checks-3mhLLe`: deployment42/42; initial native keyboard harness failure.
- `recipe-classification-checks-ewxq3z`: final autosave build and both Chrome scripts pass.
- `recipe-classification-checks-xISaQA`: final curation script passes with original Chrome helper restored.

These directories are under the private OS temporary directory, not runtime
artifacts. Feature screenshots are committed under `org/reviews/recipe-classification-*.png`.
Root and independent reviewer inspected actual pending320/1440 and failed320/1440
images: native labelled selects, saved Veggie/Side labels, wrapped source links,
reachable controls, no Save category button, clipping or horizontal overflow.
Ready-photo overview shots show card layout; pending/failed shots provide the
clear category-control evidence. The failure screenshot is retained as diagnostic
history and does not represent final acceptance.

## Test-first and correction evidence

Category parsing initially failed undefined versus null; category body mode
initially failed400; storage correction initially failed missing export; native
metadata initially failed7 versus8; real component renderer initially lacked
category controls, and later the autosave renderer correctly failed presence of
the old Save button. Each implementation followed these observed failures.

Integration corrections preserved every strict assertion:

- New plan upgrade fixture uses a valid UUID. Legacy row comparisons include
  additive null/false columns and preserve all old values/raw snapshots.
- Host rejection uses actual node:http rather than a fetch-overridden Host.
- Only validated owned random restricted test databases deny default PUBLIC
  TEMP. The shadowing attack fixture temporarily grants the exact capability,
  retains its attack assertions, revokes in finally and proves restored denial.
- Source-upload export uses git ls-files: staging the required new SQL fixed
  missing-dependency without changing production code or weakening the test.
- Native Chrome select arrows did not change a standalone select. A real
  printable type-to-select produced trusted input/change events; browser tests
  use it rather than programmatic value assignments or synthetic events.
- One pre-autosave curation run ended with Invalid InterceptionId despite all
  functional assertions completing. Temporary request diagnostics preserved all
  errors and did not reproduce it. Diagnostics were restored byte-for-byte;
  final autosave curation passed with the original helper. This was an observed
  transient harness error, not a claimed production defect/fix.

## Environment and compatibility limits

Node24.15.0/pnpm10.33.0 match the contract. Frozen installation hit sandbox DNS;
offline installation missed os-paths4.4.0. An existing installed dependency tree
with exactly matching lockfile SHA256 was copied locally; exact declared
@types/ws8.18.1 was restored from five SHA512-verified pnpm cache files. This is
cached dependency reuse, not a successful fresh frozen installation claim. No
lockfile, dependency, vendor declaration or compiler exclusion changed. Installed
Next16.4.6 guides were read before application edits.

The dedicated local cluster was started with owner-only local fixture config.
Only owned disposable databases were migrated or granted privileges. Actual
PostgreSQL produced the new profile: two columns, two checks, exactly two new
column UPDATE grants. All seven old descriptors, required identities and ten
previous profiles/grants remain unchanged. Runtime TEMP remains denied in the
restricted fixtures. Historical plan JSON remains unchanged.

The new runtime requires eight migration identities; current hosted databases
have seven. Development and hosted databases were not migrated. A future release
requires separate migration and exact-source staging/Production authorization;
older binaries reject the newer catalog after that future cutover. No push,
merge, deployment, provider-paid query, legacy bulk backfill or data import was
performed. Conservative URL metadata classification may remain Unclassified and
can be corrected by the family.


## Dropdown-only followup

Owner refinement: show only the editable dropdown instead of repeating its
category in a paragraph and visible label. Independent amendment approval:
`1e23bc1` reviewing `c24b2a0`. Verified implementation: `4a05fbf`.

Editable cards now use the selected option as the single visible category.
The existing label is sr-only for accessibility. Noneditable synthetic cards
retain their static category because they have no dropdown. Autosave, feedback,
retry/reset, identity, API, persistence and migrations are unchanged.

Full lint and typecheck passed. A fresh build and both existing real Chrome
scripts passed, logs `recipe-classification-checks-b5PIaV`. Assertions use real
protected API/DB/reload persistence and selected options, not duplicated text.
Both scripts retain native keyboard selection, autosave failure/reset/retry,
pending/failed corrections, and mobile/desktop bounds. No unrelated suites
were repeated for this presentation-only delta.

Root and independent reviewer inspected
`recipe-classification-dropdown-only-url-menu-category-pending-320.png` and
`recipe-classification-dropdown-only-url-menu-category-failed-1440.png`:
only the native select displays category, source links wrap, and controls fit.
Accessible labels remain. New screenshot names preserve prior acceptance
images. The running curation process loaded its old screenshot prefix before
that filename-only fix; root copied the new observations to followup names
and restored all prior acceptance image bytes from HEAD. No evidence was lost.

Plan-sync, staged secret scan and final org checks accompany the followup
commit. Human merge and hosted migration/release gates remain separate.

Final followup code approval: `546b3a6`, reviewing `4a05fbf`, in
`org/reviews/recipe-classification-dropdown-only-001.md`; no findings.
