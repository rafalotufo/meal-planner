---
artifact: implementation
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent PostgreSQL implementation review

Reviewed current working-tree diff against `17318251dbe671a0bdd2570100091f024673c158`, org protocol and REVIEW standards, approved PostgreSQL intent/spec/plan and compatibility/native amendments, persistence and auth/services/callers, migration SQL/journal/catalog, native setup, PostgreSQL fixtures and migrated family assertions. This reviewer did not author the implementation, run concurrent build/browser work, change app/environment, or inspect/print private credentials. Root is running full validation; no passing final candidate suite is claimed here.

## Findings resolved in focused re-review

1. **Resolved [P1][Bugs/Compliance] Remove pooler-incompatible startup timeout parameters.** `lib/db/connection.ts:27` supplies `statement_timeout`, `lock_timeout`, and `idle_in_transaction_session_timeout` to `pg.Pool`. Installed `pg/lib/client.js:558-565` serializes those as startup packet parameters. The proposed Neon runtime uses its transaction pooler, whose documented supported startup parameters omit these settings; an otherwise valid pooled connection can fail with `unsupported startup parameter` before any family read. Use a pooler-compatible approach, such as transaction-local server timeouts on the checked-out transaction, reviewed role defaults for reads, and a safe client query bound; preserve lock/contention rollback guarantees and avoid session SET state leaking between pooled transactions. Add local configuration/behavior proof without provisioning hosted resources. Primary evidence: [Neon connection errors](https://github.com/neondatabase/website/blob/main/content/docs/connect/connection-errors.md), section Unsupported startup parameter; [Neon transaction pooling](https://github.com/neondatabase/website/blob/main/content/docs/connect/connection-pooling.md).

2. **Resolved [P1][Bugs/Compliance] Accept the intended direct migration / pooled runtime host pair.** `scripts/migrate-db.ts:6` requires equal `owner.host` and `runtime.host`. Neon's documented direct migration endpoint and runtime endpoint with `-pooler` suffix necessarily differ, so the explicit command rejects the approved future configuration before migrating. Validate the intended same-database endpoint pair safely (while retaining separate roles), or separate migration execution from privilege configuration with a documented reviewed operation. Cover a synthetic direct/pooler URL pair and rejection of unrelated endpoints; do not contact/provision production. Primary evidence: [Neon connection pooling](https://github.com/neondatabase/website/blob/main/content/docs/connect/connection-pooling.md), recommends direct connections for migrations/dumps and pooled runtime connections.

3. **Resolved [P2][Bugs/Compliance] Detect unknown triggers and their executable definitions.** `lib/db/connection.ts:71-84` fingerprints public columns, constraints, indexes and relations but omits `pg_trigger` and `pg_proc`. An added trigger/function that changes an inserted family ID or recipient leaves the signature unchanged and will be accepted by `openDatabase`, contrary to the unknown/changed-schema fail-closed requirement and the previous SQLite `sqlite_master` comparison that included triggers. Extend the fingerprint to user triggers and their function definitions, and cover a trigger-tampering case in an owned isolated database. Table security flags/policies should also be considered where they change application behavior without changing these existing rows.

## Positive evidence

- Await propagation is present at every changed identity/service/HTTP/render call inspected, including verified Google email updates and revocation; no service's transactional work is detached after recent fixes.
- One checked-out connection holds a transaction-scoped advisory lock before READ COMMITTED admission/member/recipient/rate-limit reads. All family mutations use the same lock; transactions roll back and release on error. Separate migration lock serializes concurrent explicit migrations. Current multi-process provisioning/acceptance/duplicate-invite/race assertions remain substantive.
- PostgreSQL schema preserves unique subject/email/token, required family, restrictive FKs, lifecycle/deadline/normalization checks and indexes. Millisecond/count bigint parsing is pool-local and rejects unsafe integers. Camel-case aliases are quoted. Request values remain bound.
- Migration history must match ordered hash/timestamp prefix and complete runtime history; DDL plus ledger runs in a single transaction. Existing SQLite migration evidence is retained and no data deletion/import path is introduced.
- Independently inspected `.next/server/app/page.js.nft.json`, family/onboarding page traces and family API traces: each includes PostgreSQL SQL, catalog JSON and migration journal. This proves required runtime asset tracing in the current local build, not a deployment.
- Existing family tests preserve provider guards, direct HTTP authorization, invitation lifecycle and current membership assertions; PostgreSQL CHECK failure injection exercises real transactional rollback. New tests cover privileges, schema/history tampering, concurrent migrations, advisory-lock timeout, bound SQL-like values and pg_dump/restore persistence. Their final actual outputs must be recorded by the orchestrator.

## Focused re-review and verdict

All three findings are resolved in the current working tree. Independently reread changed source, native setup hardening, README/AGENTS/environment guidance and the added tamper assertions.

- `lib/db/connection.ts:24-28,48-51` now sends no timeout GUCs in the startup packet. Client query timeout remains 12 seconds; transaction-local statement/lock/idle timeouts are applied inside BEGIN before the advisory lock. The settings are scoped to the current transaction and cannot leak pool session state.
- `scripts/migrate-db.ts:6-7` normalizes the Neon runtime `-pooler` suffix only for `.neon.tech` hosts, then requires equal direct endpoint, effective port and database, plus distinct roles. Independently executed those exact two source statements with synthetic URL objects: intended Neon direct/pooler and equivalent default local ports accepted; unrelated endpoint/database, same owner/runtime role and differing port rejected. No network request was made. This is local configuration proof, not live Neon compatibility testing.
- `lib/db/connection.ts:84-92` now fingerprints user trigger definitions, public function/procedure definitions, policies and RLS/force-RLS flags. `tests/family/storage.test.ts` adds real PostgreSQL unknown function/trigger and RLS tampering, requiring runtime/migration rejection.
- Independently ran `node --import tsx --test tests/family/postgresql-contract.test.ts`: 1 passed, 0 failed, exit 0, including duplicate TLS-mode rejection. Full real-PostgreSQL, production build and browser outputs remain attributed to the orchestrator; no concurrent build/browser was run by this reviewer.

Approve implementation under the independent code peer gate. No unresolved Important finding remains from this review. The orchestrator must still finish and record final full validation and independent security clearance. Human merge/release remain closed; this review authorizes neither deployment nor hosted provisioning.

## Final helper/configuration re-review

The orchestrator reports final lint/typecheck/build exit 0, family 33/auth 12/recipe 57/deployment 12 Node tests and 7 Python tests passing, plus production authentication/family Chrome flows at 320/1440. These outputs are attributed to the orchestrator, not independently rerun here.

Reviewed the final extraction of `validateMigrationPair` to `lib/db/connection.ts` and its use from the explicit migration script. The endpoint contract now has a committed second test accepting the intended synthetic Neon pair and rejecting changed host/database/port or identical role. The implementation remains the same scoped endpoint check reviewed above.

Reviewed the test-only browser isolation adjustment in `tests/family/browser.ts`: after successful production assertions and server shutdown, it closes the owned Chrome process/profile and starts a fresh one before the development server/StrictMode fragment flow. Existing production and development navigation, fragment, focus, overflow and zero-error assertions remain intact; no wait/assertion was removed or relaxed and no application/runtime/UI behavior changed. The initial combined-run development stall and screenshot remain recorded; a separate `--dev-only` pass and fresh-browser rerun are reported/being completed by the orchestrator. Fresh browser isolation between distinct production and development app processes is appropriate fixture hygiene and does not alter the behavior each scenario checks.

The code-review verdict remains **approved**. The final full browser rerun result must be recorded in verification evidence; no build/browser run was performed during this focused re-review. No new Important finding. Human merge/release gates remain closed.

## Clean-install packaging correction — independently approved

Reviewed final `pnpm-workspace.yaml` overrides, pnpm-generated lockfile delta and updated approved-plan manifest after the orchestrator's clean-room frozen install exposed retained optional SQLite peers. The scoped overrides remove only `drizzle-orm>better-sqlite3` and `drizzle-orm>@types/better-sqlite3`; the application now uses native PostgreSQL and only Drizzle's public migration-file loader, so neither SQLite package is a runtime dependency. This removes the unused native build rather than allowing it or weakening `strictDepBuilds`.

Independently compared all package records/resolution values in the staged candidate lockfile to the corrected working lockfile: **no added package records, no changed retained resolutions**, and exactly three removed records: `better-sqlite3@13.2.0`, `@types/better-sqlite3@9.6.0`, and its now-unused `node-addon-api@8.9.2`. Remaining delta consists of matching override metadata and peer-graph references. `strictDepBuilds: true` and the existing narrow `allowBuilds` entries are unchanged. Searched application/scripts/TypeScript tests: no native better-sqlite3 import remains. `git diff --check` for the packaging/manifest correction passed.

Approve this scoped packaging correction; code-review verdict remains **approved**. The orchestrator must record the fresh frozen-install result and final strict/application regressions after dependency removal. Prior in-place install success alone is insufficient proof; this correction makes the clean-install requirement concrete without approving any native lifecycle script. The completed six-turn workflow's historical evidence remains intact; post-loop mechanical packaging verification is recorded separately rather than extending its budget or implying production authority.
