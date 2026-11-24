# PostgreSQL integrated Production candidate verification

Date: 2026-11-23. Writer: orchestrator. Scope: PostgreSQL f595330 integrated with already-merged main7cbe321, plus Vercel Fluid pool lifecycle support. This is preparation evidence, not a source-to-main merge or release approval. No deployment, alias promotion, Production database mutation, real Google login or paid provider call was performed.

Verification ran in a private clean export with Node24.15.0/pnpm10.33.0. It excludes the user's pre-existing next-env.d.ts development change and all live provider keys. Automated processes force OPENAI_API_KEY empty and use existing test-process-only Google/recipe transports. Export build/dev output is separate from the user's active checkout.

| Command | Actual result |
| --- | --- |
| pnpm install --frozen-lockfile | Exit0 |
| pnpm run lint | Exit0; zero warnings |
| pnpm run typecheck | Exit0; strict checks and vendor declaration checks intact |
| pnpm run build | Exit0; Production build |
| pnpm test | 63passed,0failed |
| pnpm run test:auth | 12passed,0failed |
| pnpm run test:family | 34passed,0failed; actual isolated native PostgreSQL |
| node --import tsx --test tests/deployment/smoke.test.ts | 12passed,0failed |
| python3 -m unittest discover -s tests | 7passed |
| node --import tsx tests/auth/browser.ts | Chrome320/390/768/1024/1440: sign-in, family-provisioned home, photo, notebook/history, filters/sort, loading/error retention, empty/long content, reload reset, keyboard; no overflow or unexpected console/network errors |
| node --import tsx tests/family/browser.ts | Production Chrome320/1440 onboarding/invitations/shared family/revoke/logout pass; fresh development Chrome StrictMode fragment/sign-in pass |
| pnpm audit --json | One inherited moderate esbuild advisory; zero high/critical |

Total:121Node tests and7Python tests. Screenshots use fresh postgresql-release-* filenames. Orchestrator visually inspected mobile results and desktop notebook. The migration SQL, catalog.json and journal are present in both protected page and search-route production trace manifests. The Fluid helper is bundled in server chunks. Private local state/provider credentials/tests/audit artifacts are excluded by .vercelignore.

## Fluid lifecycle regression

The new real-PostgreSQL test failed before attachment because successful/rolled-back transactions registered no request waitUntil work. After the supported public @vercel/functions/db-connections attachment, both paths register cleanup, the actual idle backend exists before cleanup, and it disappears before the helper promises settle (about10seconds). Installed top-level @vercel/functions declarations expose optional ws declarations under strict checking; its documented public db-connections subpath avoids unrelated exports without suppressions, vendor patches, skipLibCheck or changed transaction ownership.

## Snapshot and recovery proof

A consistent custom-format Production snapshot is retained privately, mode600 under a mode700 ignored directory. Its SHA256/size/target are in a private manifest; no credentials/data are committed. Snapshot size13668bytes. Production domain tables were empty (families/users/invitations zero); migration history has the reviewed initial migration.

Neon PostgreSQL17.12 adds internal pg_attver attribute bookkeeping, while the Mac/client is17.11. A direct restore of the raw old-client dump into vanilla17.11 fails. The [upstream PostgreSQL compatibility note](https://www.postgresql.org/message-id/E1xQQG1-000000003jI-2cdw@gemulon.postgresql.org) documents that old pg_dump emits these internal ALTER COLUMN statements and old servers reject them. The immutable raw dump was retained. A derived in-memory SQL restore omitted only complete, exact pg_attver ALTER statements on the four known tables; any other occurrence fails closed. No logical DDL, constraints, indexes, history or rows were filtered. Stop-on-error/single-transaction restore into an owned disposable local test database succeeded; normal openDatabase exact catalog and migration-hash validation passed; all three domain counts remained zero. The owned test database was removed afterward. This proves a derived logical compatibility restore, not an unmodified raw restore on17.11. No safety setting was disabled.

Do not restore this empty snapshot over later memberships or durable grants. Recovery after family writes must preserve current PostgreSQL data and fail closed/pause traffic, unless a reviewed family-capable replacement is authorized. The old pre-family deployment is not an equivalent safe rollback for admitted invitees.

## Audit integration

381 exact artifacts preserve both divergent source namespaces, including both versions of historical binary screenshots. Canonical PostgreSQL ledger and memory retain their original complete byte prefixes; actual main Notebook decisions/events are imported with explicit provenance. Six message collisions are aliased with references reconciled. Completed loops are immutable and separately archived. Existing approvals do not grant the pending PostgreSQL/family source merge or release.

Independent code, security and release-preparation reviews approved without Important findings; security independently reran the Fluid regression successfully. Staged plan-sync and diff checks exit0; staged secret scan zero findings.

Remaining live gates: human source-to-main approval, committed scoped release authorization with exact source/project/expiry/recovery, and bounded paid-check authorization or an owner-approved verification amendment. Real production Google/family and provider/cancellation/WAF verification can only be recorded after the approved artifact is live.
