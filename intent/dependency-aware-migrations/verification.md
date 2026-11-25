# Dependency-aware migrations — verification

2026-11-24, Node24.15.0 and pnpm10.33.0, native PostgreSQL17.
Reviewed implementation source: `ef5d85e3e97510b75748105879572a1530aa61f0`.
Later commits containing review/workflow/evidence are audit-only; they are not a
deployment or release approval. No hosted target was contacted.

## Actual final command results

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Exit0; exact locked dependencies installed, lockfile unchanged |
| `pnpm run lint` | Exit0; zero warnings |
| `pnpm run typecheck` | Exit0; route generation and strict TypeScript checking passed |
| `pnpm run build` | Exit0; reviewed SQL/runtime metadata verified before successful production build |
| `pnpm run test:migrations` | Exit0;36 passed,0 failed/skipped |
| `pnpm run test:family` | Exit0;34 passed,0 failed/skipped |
| `pnpm run test:menu` | Exit0;69 passed,0 failed/skipped |
| `pnpm run test:plans` | Exit0;23 passed,0 failed/skipped |
| `pnpm run test:auth` | Exit0;16 passed,0 failed/skipped |
| `pnpm test` | Exit0;82 passed,0 failed/skipped |
| `node --import tsx --test tests/deployment/*.test.ts` | Exit0;33 passed,0 failed/skipped, including packaged runtime and HTTP fault non-disclosure |
| `python3 -m unittest discover -s tests` | Exit0;7 passed |
| `node --import tsx tests/menu/browser.ts` | Exit0; real Chrome owned database/server/profile QA passed |
| `node --env-file=.data/postgres/development.env --import tsx scripts/check-db.ts` | Exit0; read-only native development history/schema/runtime permissions compatible |
| `git diff --check` | Exit0 |

Total:293 Node tests and7 Python tests, plus real-browser QA. Database suites
ran sequentially against the completed production build. Commands used owned
random disposable databases with the restricted test role; fixture application
servers used the restricted runtime role and empty paid-provider keys. Operator
credentials were never passed in command arguments or printed.

Secret scans before implementation, correction and documentation commits returned
zero findings. The final audit commit also records its staged scan result.
Private detailed command logs remain ignored under `.data/dependency-*.log`.

## What the regressions prove

Both approved independent legacy orders converge to the same validated catalog
without changing historical tuples or retained data. Dependencies execute actual
CREATE-before-INSERT SQL even with reverse manifest order. Native UUID records,
repeat/concurrent runs and atomic schema/ledger rollback are exercised. Unknown
additions, missing dependencies, cycles, identity collisions, changed checksums
and descriptor digests fail closed. Trusted compatibility is an explicit reviewed
applied-set profile; a checksum cannot grant compatibility by itself.

Real SQL drift cases include functions, disabled triggers, constraints,
collations, domains, RLS/policies, rewrite rules, default/table/column grants,
grant options and ledger write grants. Ledger views are rejected before their
nontransactional sequence effect can run. Quoted dotted indexes/tables and an
absent-ledger primary-key-name lookalike cannot disappear through ledger filters.
Temporary-table shadowing is tested against the safe transaction-local path.

The older-required-ID profile performs restricted bound reads/writes and uses
curation-aware meal generation/suggestion logic to exclude unfinished links.
This proves a compatible application with fewer required migrations, not every
historical four-migration binary. Actual pre-curation application source needs
the semantic backport described in `local-adoption.md`.

Read-only runtime and operator checks preserve ledger/schema state. Actual
connection/permission faults and changed checksums produce fixed operator
categories. Protected HTTP faults expose generic private errors without internal
reason codes or raw driver messages. The explicit migrator's postcommit runtime
credential-failure regression verifies committed records are preserved and its
diagnostic identifies both the committed stage and sanitized permission reason.

## Independent evidence and browser inspection

Design approval: `org/reviews/dependency-aware-migrations-design-001.md`.
Security approval: `org/reviews/dependency-aware-migrations-security-001.md`.
Final code approval is recorded separately under `org/reviews/` after this
verification artifact. Independent security probes reproduced and then verified
the correction of rewrite-rule and quoted-index bypasses; both versioned findings
are closed. A reviewer mutation experiment in an owned temporary mirror disabled
the descriptor-digest guard: the corruption test failed as expected. The source
workspace was never mutated, and the temporary mirror was removed.

Chrome confirmed search/save/reload persistence, duplicate/status handling,
removal confirmation and retry, keyboard focus, literal untrusted text,
retained/missing/failed photos, pagination and session/family loss. It reported
no overflow or console errors at390/1440 widths; confirmation was also captured
at320. Manual inspection of the390 and1440 photo/menu screenshots confirms
readable layouts and the expected responsive navigation/form/cards. Eleven new
screenshots are in `org/reviews/dependency-aware-migrations-browser/`. Original
historical screenshot bytes were backed up before QA and restored exactly.

## Earlier failures and corrections

The red-first database convergence test failed against original position-based
history checking; `red-test-evidence.md` preserves that evidence. Initial lint
found a new unused import and an existing unused audit-helper binding. The
import was removed; the helper's behavior-neutral correction preserves its exact
historically reviewed bytes and hashes through `audit-helper-lint-amendment.md`.
No lint suppression or historical review/hash rewrite was used.

Family regression exposed owner credentials reused by secondary HTTP servers,
then administrative fault injections incorrectly using runtime credentials.
Fixtures now separate restricted application URLs from explicit owner setup.
One root verification run overlapped a rebuild and failed because `.next` was
temporarily incomplete; the final suites ran after the successful build.
An initial semantic-profile test used an unsupported non-Gmail fixture; the
fixture was corrected without altering authentication. Early inherited runtime
permission probes sent expected-denied write statements to development; all
were denied. Those probes now run exclusively on owned disposable databases.

One independent runner encountered a cleanup race while a runtime backend was
disconnecting; the test role cannot terminate another role's backend. Cleanup
now has a bounded retry after verifying exact random name and owner, with no
privilege elevation. All final suites cleaned their owned fixtures successfully.
The earlier orphan was uniquely identified read-only as
`mp_test_26ec1eb9d7b56457daff96aa`: restricted test owner, exact failed collation
fixture signature, no application rows and no active backends. Automatic approval
review rejected the narrowly scoped DROP before execution, interpreting the
owner's no-data-removal boundary as including this disposable fixture. It remains
intact pending explicit owner cleanup authority. No retry or indirect bypass was
attempted; no other test database was removed to guess its identity. The final
security follow-up records the inspection and rejection.

## Operational limits

Compatibility is deliberately finite and source-reviewed, not automatic SQL
commutativity inference. Unsupported security object classes fail closed.
Legacy dependency descriptor immutability relies on reviewed source history;
native descriptors additionally have a stored digest. SQL execution uses trusted
reviewed migration source, not a sandbox for arbitrary untrusted SQL.

Historical0000–0004 SQL, journal/checksums, SQLite evidence and T-Rex/application
UI source remain unchanged. Development diagnosis and final compatibility checks
made no schema/data/grant changes. No shared development migration, hosted
operation, local application restart, push, merge, deployment or release occurred.
Use `local-adoption.md` for exact local steps and separate migration authority.
