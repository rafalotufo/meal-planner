# Local main integration

Owner explicitly approved merging Brave search to local main. This integration
first merges pinned main1f7cf8b into feature c0c8858; the orchestrator will obtain
independent combined-source review and record the owner merge gate before a
separate senior-developer fast-forward of local main. No push, deployment,
hosted migration/data changes or additional paid queries are authorized.

## Concrete plan and preservation

Main adds the seven-identity database contract, Preview-only synthetic
verification and fixed thirty-day Google sessions. Feature adds Brave Web Search,
bounded source extraction, parallel source-bound curation with8second item
deadlines and twelve-card notebook lookup chunks. Runtime deltas are disjoint;
preserve both. AGENTS and README must retain both contracts. The main verification
test server will explicitly clear OpenAI and both Brave key aliases and select
Brave, matching all existing feature fixture servers. No production bypass.

The only dirty intake file, generated next-env.d.ts, differed only by .next/dev
versus .next production type imports. Its bytes were backed up in a private
temporary file before restoring the tracked production form. No user source was
discarded. A fresh production type generation/build verifies the active form.

Both divergent audit snapshots are preserved byte-for-byte in
org/merge/brave-parallel-main-2026-11-25/{feature,main}/ with per-file SHA256
manifest.json (feature409/main393 records). The24merge conflicts all concern
workflow state or reused message IDs. Canonical messages, memory events and
hash-chained ledger use main as baseline; Brave solved9/10 loop/config/history
and active graph remain. The review queue retains main entries plus distinct
Brave entries. Archived feature message/memory IDs resolve pre-integration
Brave references when main reused the same IDs. Seven distinct existing Brave
approval decisions are transcribed append-only via gate_ledger.py with original
date/hash/archive evidence, not fabricated or backdated approval. ledger-imports.json
maps their original hashes. Main's prior ledger is an unchanged byte prefix.

## Narrow integration manifest amendment

Add `tests/verification/server.ts` to this integration's permitted changes. The
only delta is fixture environment configuration: explicitly empty
OPENAI_API_KEY, BRAVE_SEARCH_API_KEY and BRAVE_API_KEY and select Brave. This new
main-owned helper did not exist in the original Brave manifest. The amendment
ensures new synthetic-verification QA cannot inherit paid Brave credentials;
it changes no application authentication behavior, build target or provider
budgets. Independent combined-source review must assess this exact amendment.

## Verification to complete

Run frozen installation, recipe, lint, typecheck and production build. Then run
family, menu, auth, plans, migrations, deployment and all verification tests;
Python workflow regressions and org/ledger validators; actual Chrome Brave
390/1440, login-expiration and synthetic-verification browser helpers where
applicable. All database-backed runs own random test databases, local servers
and profiles, and all fixture provider keys stay empty. Archive/regenerate
inactive dev types only under the existing AGENTS procedure. Record concrete
results below; no previous branch check certifies this combined source.

Integration work does not advance or extend the solved9/10 implementation loop.
Independent code/security review and the final local-main handoff remain with
the orchestrator; human release gates stay closed.

## Integration source checkpoint

Frozen installation, lint, typecheck and production build pass; recipe suite
112/112 and Python7/7 pass. Original noninteractive pnpm install requested a TTY;
CI=true removed that prompt. Sandbox registry DNS then failed; approved scoped
registry access completed frozen install in3.3s without lockfile changes.
Typecheck initially hit the documented inactive dev/types duplication. Process
inspection confirmed no worktree dev server (the unrelated main-checkout Next
server was left untouched); only .next/dev/types moved to a private backup,
then production types/build passed. No checking exclusions or source relaxation.

Message validator398/0 and loop validator0 pass. Ledger verify accepts the
transcribed chain. Strict graph validation needs committed ledger state; memory
check currently reports a pre-existing/merged compact-context size overflow
(16762bytes versus16384), accurately retained for orchestrator housekeeping.
No historical notifications were improperly closed. Independent reviewer
verified all802 archive blobs and approved the fixture-only manifest amendment.
Remaining combined suites/browser results will be appended as audit evidence.

## Completed combined verification

Integrated source73bb7f3 has both expected parents c0c8858/1f7cf8b. A byte
comparison of62 main-changed application/database/script/test/config paths found
only the independently approved tests/verification/server.ts key-clearing delta.
All five Brave discovery/source/curation/concurrency/coordinator modules remain
byte-identical to reviewed feature sourcee14feec. Main's thirty-day session and
seven-migration contracts survive. No runtime merge conflict or dependency
version/lockfile change was introduced by resolution.

| Command | Actual result | Command evidence |
| --- | --- | --- |
| `CI=true pnpm install --frozen-lockfile` | exit0 | `/private/tmp/brave-merge-install.log` |
| `pnpm run lint` | exit0 | `/private/tmp/brave-merge-lint.log` |
| `pnpm run typecheck` | exit0, repeated after browser QA | `/private/tmp/brave-merge-final-types.log` |
| `pnpm run build` | exit0, repeated after browser QA | `/private/tmp/brave-merge-final-build.log` |
| `pnpm test` |112passed,0failed | `/private/tmp/brave-merge-recipes.log` |
| `pnpm run test:family` |35passed,0failed | `/private/tmp/brave-merge-family.log` |
| `pnpm run test:menu` |69passed,0failed | `/private/tmp/brave-merge-menu.log` |
| `pnpm run test:auth` |16passed,0failed | `/private/tmp/brave-merge-auth.log` |
| `pnpm run test:plans` |23passed,0failed | `/private/tmp/brave-merge-plans.log` |
| `pnpm run test:migrations` |69passed,0failed | `/private/tmp/brave-merge-migrations.log` |
| `node --import tsx --test tests/deployment/*.test.ts` |40passed,0failed | `/private/tmp/brave-merge-deployment.log` |
| `node --import tsx --test tests/verification/*.test.ts` |29passed,0failed | `/private/tmp/brave-merge-verification.log` |
| `python3 -m unittest discover -s tests` |7passed | `/private/tmp/brave-merge-python.log` |
| `node --import tsx tests/menu/brave-search-browser.ts` | Chrome390/1440pass | `/private/tmp/brave-merge-brave-browser.log` |
| `node --import tsx tests/auth/login-expiration-browser.ts` | Chrome390/1440pass | `/private/tmp/brave-merge-login-browser.log` |
| `node --import tsx tests/verification/browser.ts` | Chrome390/1440pass,0errors/Google/provider calls | `/private/tmp/brave-merge-verification-browser.log` |

393 Node tests and7 Python tests pass with zero failures, cancellations or skips.
The earlier progress checkpoint called family34; the actual integrated family
log is35, as reflected here. All fixtures used owned disposable databases and
servers, not development/hosted data. The synthetic browser used a real local
Preview build and loopback TLS with simulated platform metadata, not hosted
proof. Chrome158.0.8127.88 was used; Firefox/Safari were not exercised.

Brave browser QA includes twelve-card rendering, seventh/twelfth saves, failed
second lookup chunk/retry, out-of-chunk response rejection, save/lookup races,
selection abort, filters and keyboard focus. Login browser checks sign-in,
navigation and logout. Synthetic verification checks entry, home, menu, family,
plans and revoked logout. Eighteen fresh screenshots live under
`org/reviews/brave-main-integration/`; original screenshot bytes were restored
exactly. Visual inspection confirms readable stacked mobile cards including
saved card7 and an unclipped desktop search form/navigation. After the owned
login dev fixture stopped, its generated dev/types was privately backed up
again and production types/build regenerated successfully.

Independent combined code review3fb5644 and security review6e4a368 approve
source73bb7f3. Root resolved compact-memory overflow with legitimate fulfilled
handoff closures in04ba132; no validators weakened or historical review verdicts
rewritten. Message/memory/loop/strictgraph checks pass after reconciliation.
The main canonical ledger remains an unchanged prefix followed by archival
transcriptions and new explicit owner decisions. Staged diff/secret checks at
integration commit passed with zero findings; the evidence commit repeats them.

No paid search/curation calls, hosted mutation, migration, push, deployment or
local-app restart occurred. Local main has not yet been moved by this work item;
that exact reviewed fast-forward awaits the orchestrator's final handoff and
current clean-tip checks. The solved implementation loop remains9/10.
