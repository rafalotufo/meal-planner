# PostgreSQL migration — verification and local handoff

Date: 2026-11-23 (America/Toronto). Source base: 17318251dbe671a0bdd2570100091f024673c158. Branch: codex/postgresql-persistence. Owner authorized local PostgreSQL setup/migration/testing, then explicitly selected native Homebrew rather than Docker for memory use. No hosted provisioning, production variables/migrations, deployment, paid calls, merge or release was performed.

## Native setup actually performed

- Rechecked Docker stopped/no PostgreSQL tools/no 5432 listener. Initial Docker evaluation started Desktop and pulled official PostgreSQL17 image, but created no container/volume/database. After the owner changed direction, Docker Desktop was closed; native setup has no Docker dependency. Pulled image was not deleted.
- Installed Homebrew postgresql@17 **17.11_1** (server/client17.11), with krb5 dependency. Homebrew postinstall created its default cluster at /opt/homebrew/var/postgresql@17, left unused/unstarted. The installer also ran its default cache/old-keg cleanup (including obsolete flyctl0.4.118; current0.4.120 remains); future documented install disables automatic cleanup. No unrelated service/container/volume was changed or removed by project setup.
- `pnpm run db:setup`, `pnpm run db:migrate`: exit0. Dedicated persistent cluster: ~/Library/Application Support/MealPlanner/postgresql-17/data. Private socket directory and files, SCRAM authentication, only127.0.0.1:5432 listener. shared_buffers64MB, max_connections60 (shared buffers are not total process memory). No login/background service registered.
- Setup created bootstrap, migration owner, restricted runtime, isolated CREATEDB test roles; no credential value printed or passed as a CLI argument. Private generated config is ignored; fixture servers force empty OPENAI_API_KEY after overrides and strip owner/test URL env vars. Runtime role cannot DDL/create databases/write migration history; test role cannot connect to development data (real regression).
- Repeated setup, `db:stop`, `db:start`, repeated migration all exit0, preserving development schema. Setup rerun preserves runtime domain rights. Tests separately prove persistent invited grants via pg_dump/pg_restore and full application restart.
- Read-only preservation discovery checked DATABASE_PATH config and .data entries in main, c7a4 source family and b204 migration checkout. No configured SQLite data found in those locations at task start. This does not assert absence elsewhere. No SQLite file deleted, copied or imported. Original SQL/journal/snapshot remain byte-exact historical evidence.

## Actual command results on final implementation

| Command | Actual result |
| --- | --- |
| pnpm install --frozen-lockfile | exit0 after final dependency replacement; original pre-retirement install rejected unapproved better-sqlite3 build script, no scripts blanket-approved |
| pnpm run lint | exit0, zero warnings/errors |
| pnpm run typecheck | exit0, strict TS6, skipLibCheck:false, unchanged compiler configuration |
| pnpm run build | exit0, optimized Next16.4.6 webpack build |
| pnpm test | **57 passed**,0 failed, exit0 (recipe/photo behavior unchanged) |
| pnpm run test:auth | **12 passed**,0 failed, exit0, real HTTP and isolated PostgreSQL |
| pnpm run test:family | **33 passed**,0 failed, exit0, real PostgreSQL |
| node --import tsx --test tests/deployment/smoke.test.ts | **12 passed**,0 failed, exit0 with local listening permitted |
| python3 -m unittest discover -s tests | **7 tests OK**, exit0 |
| node --import tsx tests/auth/browser.ts | exit0, isolated Chrome at320/1440: fixture Google, recipe/photo, focus, logout |
| node --import tsx tests/family/browser.ts | final exit0: full production320/1440 and separate fresh-Chrome development StrictMode |
| node --import tsx tests/family/browser.ts --dev-only | exit0, isolated StrictMode reproduction |
| pnpm audit --json | exit1,0high/critical; one inherited moderate esbuild advisory through drizzle-kit tooling |

**114 Node tests plus7 Python tests.** Family coverage preserves original auth/invitation/concurrency assertions and adds URL/TLS duplicate validation, Neon endpoint pairing, role separation, repeat/concurrent migrations, atomic DDL/ledger rollback, disposable initial down/remigration, hash/index/constraint/trigger/function/RLS tampering, SQL-looking bound subjects and exact bigint timestamps. Existing PostgreSQL advisory-lock timeout HTTP test proves503, no orphan writes and recovery on subsequent request. Two-process provision/create/accept and invitation-create-vs-provision races pass.

Initial family run27/29 exposed two unported fixture details (SQLite trigger syntax and pg_restore requiring an explicit dbname flag); both fixed, focused acceptance8/8 then full33/33 pass. No production behavior or assertion weakened. One unprivileged deployment-helper run hit sandbox EPERM on loopback listen; permitted rerun12/12 passed.

Initial combined production+development Chrome run passed production but stalled during dev navigation with a CSS-preload warning; screenshot postgres-dev-context-failure.png retained. Fresh --dev-only reproduction passed. The helper now closes the production browser/profile and starts a fresh owned Chrome before development, separating JS/HMR/interception state. Full helper rerun passed original waits/assertions unchanged; independent code reviewer approved the fixture isolation. No app fix or warning filter was introduced.

Root visually inspected postgres-auth-home-320/1440, postgres-join-320 and postgres-joined-1440: preserved recipe/photo layout, readable onboarding/family forms and no horizontal overflow. Test helpers assert viewport containment and zero browser application errors; other screenshots are stored beside this report. Fixture Google, recipe and image data only, no live/paid providers.

## Compatibility and packaging

Public Drizzle PostgreSQL0.45.4 strict prototype independently reproduced70 declaration errors; native pg8.23.1 plus public Drizzle migration loader passed the identical strict compiler probe. See intent/postgresql-persistence/storage-compatibility.md and independent design review. No TS exclusions/suppressions/ambient replacements/vendor patches/prerelease/unrelated optional drivers were used. Retired direct better-sqlite3 dependencies; Better Auth's existing development SQLite ambient type support remains.

Runtime PostgreSQL uses small lazy pools, required private URL with verified remote TLS, and no filesystem DB. Transaction-local timeouts avoid unsupported Neon pooler startup GUCs. Synthetic direct/pooled Neon URL validation passes without network. Protected home/family/search `.nft` manifests each contain all4 PostgreSQL artifacts (SQL, journal, catalog and disposable rollback proof); no Vercel configuration/manual gate changed. No live Neon endpoint was provisioned or tested; hosted connection/role/candidate verification remains a future authorized operation.

## Independent gates and audit

- org/reviews/postgresql-design-001.md: product acceptance, spec/plan/native/compatibility approval.
- org/reviews/postgresql-code-001.md: approved after pooler/endpoint/catalog findings and final helper review.
- org/reviews/postgresql-security-001.md: approved after duplicate-TLS and private-file safety findings.
- Completed prior family loop and graph archived byte-exact under org/archives/postgresql-predecessor with SHA256 manifest, independently compared to base. Existing historical reviews/messages/merge archive/gate ledger are preserved. New loop selects PostgreSQL artifacts and new review queue identity, without reusing old approvals.
- Main remains766a7925b9489ea9bfda97355f3c2f9c7d99ca67; source family remains17318251dbe671a0bdd2570100091f024673c158. Neither source checkout changed by this migration.

Local commands and future gated Neon configuration: README.md, Native PostgreSQL development. Human family-to-main merge and production provisioning/migration/release authority remain separate and closed.

Post-browser workflow acceptance initially hit Next16.4.6 duplicate global LayoutProps in inactive .next/dev/types versus .next/types, causing downstream build/start failures. Preserved the inactive generated dev/types directory in a private temporary backup after the owned dev server stopped, then regenerated production output. This same cache issue was documented in the source integration; AGENTS now records the safe recovery. No tracked source/test deletion or compiler exclusion/suppression.

Final staged secret/plan/audit checks and bounded-loop final result are recorded with the handoff commit; no merge/release is implied.

Final bounded workflow: six turns, **solved**, all configured acceptance commands exit0 on security and final review turns. The graph now marks implementation in_review for the human merge gate, with release not_started. New intent/spec/plan ledger entries identify actual independent agent approvers and review evidence, never a human or production approval. Staged secret scanner0findings, approved-plan coverage, diff whitespace, message/memory/loop checks and preserved ledger chain passed.

## Clean-install packaging follow-up

A separate clean directory using the final package manifest and inherited peer snapshots exposed ERR_PNPM_IGNORED_BUILDS for the retired better-sqlite3 optional Drizzle peer, despite in-place install passing. No native build was approved. Tested pnpm scoped removal overrides for drizzle-orm>better-sqlite3 and drizzle-orm>@types/better-sqlite3; regenerated the lock with pinned pnpm10.33.0. This removes only better-sqlite3, its types, and node-addon-api, preserving every retained package resolution and strictDepBuilds/allowBuilds policy. No runtime SQL/type/compiler behavior changed. Independent code-review packaging addendum approved the exact diff. `pnpm why better-sqlite3` now returns no dependency.

A truly fresh frozen install with no node_modules then installed416packages, exit0, without approving or bypassing dependency scripts; the checkout's frozen install also exit0. An isolated proof-directory command initially selected the Mac's old global Node22 and failed before install; using this project's required Node24 via pnpm --dir resolved that environment mismatch. No global Node changes made. The complete final lint/typecheck/build and114Node/7Python rerun after the packaging correction is captured in the ignored private .data/postgresql-final-verification.log; results are summarized below.

Post-packaging final verification: lint0, strict typecheck0, production build0, recipe/photo57/57, auth12/12, family33/33, deployment12/12, Python7/7, all exit0. Final build protected-route traces rechecked:4PostgreSQL assets in each home/family/search manifest. Browser UI/runtime source is unchanged from the successful independent-mode production/development QA; dependency removal affects only unused peers.
