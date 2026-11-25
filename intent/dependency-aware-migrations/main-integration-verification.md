# Combined main integration verification

- Date:2026-11-24; author:senior-developer.
- Approved integration plan: `main-integration.md`; independent approval2906f4a.
- Feature intake4f44838; pinned main d26ea59742f904f399128477bfeb369a0049ba62.
- Combined source49e2a64625d97adee760e44847ad445ea2b8f3d8.
- Status: combined verification passed; independent final review precedes root's
  owner-approved local-main fast-forward/rebuild/restart.

## Preservation and integration

Both checkouts were clean. Merging pinned main into the feature branch produced
one normal no-fast-forward merge with no conflicts. The existing identical
unused audit-helper binding correction needed no resolution. Source comparisons
passed exactly:

```text
git diff --exit-code ef5d85e -- lib/db drizzle/postgresql scripts/migrate-db.ts scripts/check-db.ts
git diff --exit-code d26ea59 -- app/t-rex-runner.tsx lib/t-rex-canvas.ts lib/t-rex-runner.ts tests/auth/browser.ts tests/recipe-t-rex-runner.test.ts
```

The reviewed migration implementation remains byte-identical to ef5d85e.
Main's T-Rex code, new tests, browser harness and all imported review/intention
artifacts remain intact. There were no application, migration or test fixes
needed after integration. No historical audit, SQL, journal, checksum or image
was replaced by the new combined evidence.

## Actual combined results

Node24.15.0/pnpm10.33.0 and PostgreSQL17; the feature worktree's build only.
Each listed command exited0. The frozen install reported already up to date,
with no lockfile change. An initial sandbox-only offline install attempt stopped
before modification because its store-path context required interactive module
removal; the normal approved exact frozen install completed successfully.

| Command | Actual result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Locked dependencies already up to date |
| `pnpm run lint` | Zero errors/warnings |
| `pnpm run typecheck` | Route generation and strict checking passed |
| `pnpm run build` | Reviewed metadata and production build passed |
| `pnpm run test:migrations` |36 passed,0 failed/skipped |
| `pnpm run test:family` |34 passed,0 failed/skipped |
| `pnpm run test:menu` |69 passed,0 failed/skipped |
| `pnpm run test:plans` |23 passed,0 failed/skipped |
| `pnpm run test:auth` |16 passed,0 failed/skipped |
| `pnpm test` |84 passed,0 failed/skipped, including the two new T-Rex ramp tests |
| `node --import tsx --test tests/deployment/*.test.ts` |33 passed,0 failed/skipped |
| `python3 -m unittest discover -s tests` |7 passed |
| `node --import tsx tests/menu/browser.ts` | Real Chrome menu flows passed |
| `node --import tsx tests/auth/browser.ts` | Real Chrome authentication/T-Rex flows passed at all five widths |
| `git diff --check` | Passed |

Total295 Node tests plus7 Python tests, and both real-Chrome QA scripts.
Database/application suites ran sequentially after the completed production
build. Owned random disposable databases used the restricted test role;
application servers used restricted runtime credentials. Fixture providers
remained test-only and paid keys stayed empty. No real Google login or LLM call
was performed. The auth-browser harness loads its existing real HTTPS publisher
photo; that is distinct from a paid discovery/provider effect.

Detailed private logs are ignored under `.data/dependency-main-*.log`; the
sequential suite result JSON records actual exits/counts. There were no test,
compilation or browser failures on the merged source.

## Browser evidence and manual inspection

New evidence is in `org/reviews/dependency-aware-migrations-main-browser/`:
11 menu PNGs,29 auth/T-Rex PNGs, sanitized browser-result JSON and a SHA256 image
manifest. Before menu QA,19 historical saved-menu PNGs were copied to an owned
private backup. After capturing combined evidence, every original was restored
and checked against its exact pre-run hash. Main's auth-browser harness writes
new screenshots into its owned temporary profile, so it overwrote no historical
review image. Only screenshot artifacts were copied from that profile.

Menu Chrome verified search/save/reload persistence, duplicate/cache freshness,
retry behavior, cancellation and removal confirmation, keyboard focus,
read-error recovery, literal untrusted text, retained/missing/failed photos,
pagination and family/session loss. It reported no overflow or unexpected
console errors at390/1440; confirmation was also exercised at320.

Auth/T-Rex Chrome passed at320,390,768,1024 and1440. It verified the preserved
shorter full-width5:1 canvas/backing store, game lifecycle and input behavior,
search/notebook/filter flows, responsive layout and logout/mock-Google callback.
It reported exactly10 intentional fixture429 messages and an empty unexpected
console/network-error list. Browser result JSON records each width's actual pass.

Manual visual inspection covered the new menu photo screenshots at390/1440 and
running T-Rex screenshots at320/1440. The mobile layouts scroll vertically
without horizontal overflow, navigation and controls remain readable, and the
shorter game surface and desktop card layout match main's refined behavior.
The publisher photo is visible; missing photos and literal markup stay safe.

## Boundaries and next action

This developer handoff did not update main, touch main's build, start/restart
its local application, migrate the shared development database, contact hosted
databases, push or deploy. All migration execution in this verification was on
owned disposable databases. Root owns final independent-review coordination,
clean-tip recheck and the separately approved local-main/build/restart steps.
The prior finite-profile/older-application semantic-backport limitations remain
unchanged. No new release, hosted migration or deployment authority is implied.
