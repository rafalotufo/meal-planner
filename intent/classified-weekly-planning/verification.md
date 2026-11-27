# Classified weekly planning — local verification

- Author: senior-developer, with bounded storage/UI implementation helpers
- Date: 2026-11-27
- Approved design: `737458b`, independent approval `07affd4`; approval-header tooling correction `98fdc84`
- Storage source: `fc9b12c`; backend source: `39fdc4a`; UI/browser source: `72f726b`
- Scope: local implementation and owned disposable fixtures only; independent security/code review follows

## Result

New generated plans contain four main dishes, two sides and two veggies when
available. Selection ranks ready classified saved recipes within each category;
short pools remain partial without borrowing, repetition or unclassified fill.
Generation remains deterministic, family-scoped, idempotent and provider-free.
Plan sections use stored snapshot categories and retain original array indices.
Categorized swaps enforce the same category at suggestion and locked acceptance;
legacy null slots retain compatible unrestricted swaps. Category filters apply
in bound SQL before saved-menu pagination and compose with title search.

The additive native migration supports eight snapshots and slot7. Its actual
PostgreSQL catalog profile was captured on an owned fixture, normalized using the
same native-ledger exclusions as runtime validation. Every prior descriptor,
profile, required-prefix and independence record remains unchanged. Runtime grants
are the previous exact set. Upgrade tests preserve existing plans, menu rows,
proposals, approvals and historical ledger rows; there is no data rewrite.

## Tests first

- New eight-snapshot/index7 validation and composition checks failed before code
  (three failures: missing policy module, rejected slot7 and rejected length8),
  then passed4/4 after implementation.
- Category generation tests failed3/8 against old selection: seven instead of
  eight and unclassified rows incorrectly generated a plan. New quota SQL passes
  full4/2/2, recent-use preference, honest4/1/0 shortages and null-only empty cases.
- New store safety tests failed before comparisons: wrong-category suggestion
  unexpectedly succeeded. Corrected category after suggestion now makes acceptance
  fail409 without changing plan/revision/approvals; rejection still works.
- Filtered title/keyset regression failed against unfiltered SQL: second page
  returned50 instead of2. Current tests find all52 veggies behind55 newer mains
  with the same matching title and reject invalid category arguments.
- Storage helper observed the original meals CHECK reject8 before the migration;
  final proof accepts8/index7 and rejects9/index8/negative/empty values.
- Real owned Chrome first failed the missing category-heading assertion
  (actual empty heading list); it passes after the grouped UI implementation.
- Intermediate parallel runs during profile construction failed closed with
  incompatible-schema. After actual profile capture the coherent schema and all
  relevant suites pass; no validation was disabled to work around the mismatch.

## Command evidence

Node24.15.0, pnpm10.33.0 and pinned Next16.4.6. Frozen-lockfile installation was
completed by the orchestrator. Installed Next Server/Client Components and Route
Handlers guides were read before application changes.

| Command | Actual result |
| --- | --- |
| `pnpm run lint` | exit0, zero warnings; final repeat after browser-test additions also exit0 |
| `pnpm run typecheck` | exit0, route generation and strict TypeScript pass; final repeat exit0 |
| `pnpm run build` | exit0; reviewed runtime metadata matched SQL/journal, optimized compilation/types/static generation/traces passed |
| `pnpm test` |118/118 pass,0 skipped, exit0 |
| `pnpm run test:migrations` |71/71 pass,0 skipped, exit0; storage helper execution |
| `pnpm run test:plans` |40/40 pass,0 skipped, exit0 |
| `pnpm run test:menu` |80/80 pass,0 skipped, exit0 |
| `pnpm run test:family` |35/35 pass,0 skipped, exit0 |
| `pnpm run test:auth` |16/16 pass,0 skipped, exit0 |
| `node --import tsx --test tests/verification/*.test.ts` |30/30 pass,0 skipped, exit0 |
| `node --import tsx --test tests/deployment/*.test.ts` |43/43 pass,0 skipped, exit0; includes clean Vercel-source upload build |
| `node --import tsx tests/plans/browser.ts` | exit0, real owned Chrome/server/database |
| `node --import tsx tests/plans/curation-browser.ts` | exit0, real owned Chrome/server/database and publisher fixture |
| `node --import tsx tests/menu/browser.ts` | exit0, ordinary menu/search/save/removal/pagination/focus regression |
| `python3 -m unittest discover -s tests` |7 tests pass, exit0 |
| `git diff --check` | exit0 |
| `python3 scripts/scan_secrets.py --staged` |0 findings before each implementation commit |

The focused backend run passed36/36 before complete compiled-server regressions.
Focused storage migration/dependency/packaged-metadata checks passed15/15 before
its full71-test migration suite. These overlap with the complete counts above.
Local session output is in `/private/tmp/classified-planning-{plans,menu,family,auth,verification,deployment}.log`,
`/tmp/classified-planning-browser.log`, `/tmp/classified-planning-curation-browser.log`
and `/private/tmp/classified-planning-menu-browser.log`. These temporary logs are
supporting local evidence, not required runtime assets.

## Real browser observation

The production planning browser checks actually generate a full4/2/2 plan, verify
three semantic groups, original slot7 suggest/accept HTTP mutation and approval
reset, same-category title search past54 unrelated mains, partial pools and legacy
Unclassified grouping with unchanged stored history. Existing retained-results,
response-body/UTF8 bounds, access loss, retry, keyboard/focus, supersession,
close/reopen, duplicate and stale-revision regressions stay active. Modal geometry
at320/768/1024/1440x1000 and320x568 remained stable with maximum delta0px.

The curation browser uses actual URL save/pending exclusion/curation and explicit
existing category correction before a same-category protected picker/swap at
320/390/1440. No fabricated successful mutation response is substituted. Both
scripts report no overflow; the curation script also reports zero console errors.
Ordinary menu Chrome verified search→real save→fresh menu→reload, category controls,
removal confirmation/focus and paging. One historical screenshot regenerated by
that existing script was restored exactly; all prior audit screenshots remain.

Twenty-nine new `org/reviews/classified-weekly-planning-*.png` files are committed.
The UI helper inspected full, veggie, partial, legacy and curation views at mobile
and desktop sizes. The senior developer additionally inspected actual
`classified-weekly-planning-full-1440.png` and
`classified-weekly-planning-veggies-320.png`: clear section labels and target counts,
readable cards, usable controls and no horizontal overflow. The orchestrator also
inspected full desktop/mobile images independently.

Owned development browser RED stopped its server before the production build.
Its inactive generated `.next/dev/types` directory was moved to a private
operating-system temporary directory as instructed; production type generation
and build then passed. `next-env.d.ts` matches committed production paths. No
compiler exclusion/suppression or vendor declaration change was made.

## Operational boundary

Only owned random local test databases, servers and Chrome profiles were used;
fixtures force empty paid keys. The ignored private worktree config uses the
existing dedicated test-role URL and restricted runtime URL solely as a fixture
template rewritten to each owned database. No development/hosted migration,
provider call, hosted probe, grant, configuration, deployment, push or merge was
performed. All owned fixtures stopped and cleaned up.

The new runtime requires nine native migration identities. Applying that catalog
to development or hosted environments needs separate authorization; older
artifacts reject it and are unsafe rollback targets. This local result supplies
no release or migration authority. Existing plans are preserved, not recomposed.
