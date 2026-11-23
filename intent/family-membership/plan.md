# Meal Planner — family membership build plan

- Derived from: approved sibling `spec.md` and accepted `intent.md`
- Author: senior-developer
- Status: Approved
- Approval: Rafael; `org/messages/ceo-0006.md`; independent review `org/reviews/plan-family-membership-001.md`
- Storage compatibility amendment: `storage-compatibility.md` — independently
  approved under the org spec/plan peer gate; see
  `org/reviews/family-membership-storage-amendment-001.md`. Original human approval is retained.
- Date: 2026-11-23

## Files that change

- package.json
- pnpm-lock.yaml
- pnpm-workspace.yaml
- .gitignore
- .env.example
- drizzle/*.sql
- drizzle/meta/*.json
- lib/db.ts
- lib/db/connection.ts
- lib/db/schema.ts
- lib/db/migrate.ts
- scripts/migrate-db.ts
- lib/identity-access.ts
- lib/family-store.ts
- lib/family.ts
- lib/invitations.ts
- lib/invitation-context.ts
- lib/http.ts
- lib/auth.ts
- lib/session.ts
- lib/auth-policy.ts
- proxy.ts
- app/page.tsx
- app/api/session/route.ts
- app/api/auth/[[]...all]/route.ts
- app/sign-in/sign-in-button.tsx
- app/sign-out/page.tsx
- app/onboarding/page.tsx
- app/onboarding/onboarding-controls.tsx
- app/invite/page.tsx
- app/invite/invite-context.tsx
- app/family/page.tsx
- app/family/family-controls.tsx
- app/api/invitation-context/route.ts
- app/api/onboarding/provision/route.ts
- app/api/invitations/accept/route.ts
- app/api/family/route.ts
- app/api/family/invitations/route.ts
- app/api/family/invitations/[[]id]/revoke/route.ts
- tests/auth/*.ts
- tests/family/*.ts
- tests/family/package.json
- README.md
- AGENTS.md
- CLAUDE.md
- org/loop/config.yaml

`[[]` matches literal opening brackets in the checker's fnmatch manifest.
`pnpm-workspace.yaml` is conditional on an inspected new lifecycle-script need;
retain its fail-closed policy. Existing dependency versions, allowlist contents,
strict compiler settings and home markup are otherwise preserved. Feature,
review, screenshot, message, status, memory, graph and ledger records are process
artifacts maintained by the orchestrator, not additional application scope.

## Approach and dependency order

Keep one durable-host SQLite file, reviewed SQL/Drizzle migration artifacts and
the public `drizzle-orm/migrator` file loader, and Better Auth's one-hour
nonrefreshing encrypted sessions. Use native typed parameterized SQL and
`database.transaction(callback).immediate()` instead of runtime ORM/table-builder
imports; `lib/db/schema.ts` contains domain row interfaces only. Existing
Drizzle versions remain installed and strict checking remains unchanged. See
the approved `storage-compatibility.md` amendment for the reproduced declaration
failure and native/public-loader proof. Pin only the approved driver/types.
Application membership uses verified Google subject, never Better Auth's generated
stateless user ID. Invitation grants are durable and separate from membership;
allowlist-only users remain subject to current eligibility on every request.

Dependency path: compatibility proof → migrated persistence → stable identity
and HTTP fixtures → allowlisted onboarding → recipient-bound invitation creation
→ invited onboarding/acceptance → management/revocation → browser and full review.
Implement these steps sequentially because auth, persistence and fixtures share
contracts. Independent review remains separate from writing. The task list below
is the only checklist; do not create another `tasks/` tracker.

For behavior changes, first add a focused failing TypeScript assertion against
the actual boundary, retain its expected failure, then implement and reach green
before committing the slice. Never delete/suppress tests to make a checkpoint pass.
Initial generated SQL, journal and snapshot form one atomic reviewed migration
artifact; SQL is now the schema source of truth. Later changes use reviewed SQL
migrations and journal updates, not a second unchecked table-builder schema.

## Ordered tasks and checkpoints

### 1. Prove the native and session foundations

Dependency: plan approval. Files: package.json, pnpm-lock.yaml, conditional pnpm-workspace.yaml (small).
- [x] Inspect package contents/provenance/transitives before execution; add exact `better-sqlite3@13.2.0` and dev-only `@types/better-sqlite3@9.6.0`; generate pnpm's lockfile and prove frozen installation.
- [x] In a disposable temporary TypeScript probe, exercise native open/query/transaction/backup and Better Auth's real HTTP handler plus test-process Google transport: verified `googleSubject` survives JWE caching with input enabled and `returned: true`. No probe is imported by production.
Verify: `pnpm install --frozen-lockfile`, `pnpm audit --json`, native/protocol probe, `pnpm run typecheck`, `pnpm run build`. Capture actual output; a failed mapping/native assumption requires spec revision/review, not a fallback identity or unchecked cast.

### 2. Make the database contract executable

Dependency: 1 and peer approval of the compatibility amendment. Files: lib/db/schema.ts, tests/family/storage.test.ts, tests/family/package.json; reviewed drizzle SQL/meta set (medium plus audit artifacts).
- [x] Preserve the three approved tables, indexes, non-null single-family membership, unique subject/email/token hash, restricted foreign keys and invitation-state checks in reviewed explicit SQL. Retain the initial generated SQL, journal and snapshot together; use interfaces-only domain row types instead of runtime ORM schema builders.
- [x] Test real SQLite constraints and fresh/repeat migrations against temporary files; no placeholder recipe/meal tables or Better Auth tables.
Verify: inspect the SQL/journal artifact against the approved table contract; `node --import tsx --test tests/family/storage.test.ts` after task 3 wires the migrator. Keep the intentional initial red evidence with this schema/migration slice rather than committing a broken checkpoint. No generation command/config is added.

### 3. Open only explicitly migrated durable storage

Dependency: 2. Files: lib/db/connection.ts, lib/db/migrate.ts, lib/db.ts, scripts/migrate-db.ts, package.json (medium).
- [x] Separate testable connection/migration code from the lazy server-only adapter. Require absolute `DATABASE_PATH`, existing migrated runtime file, WAL, foreign keys, 5-second busy timeout; imports/build never create or migrate it.
- [x] Add `db:migrate` and `test:family` scripts exactly as specified; prove missing schema/path, invalid path and lock failure close access, and reopening preserves rows.
- [x] Use the public migration-file loader and native immediate migration transaction: validate applied history as an exact ordered hash/timestamp prefix, execute missing trusted SQL and append history atomically, with repeat no-op and complete rollback on failure. Runtime opening verifies full history and required schema without auto-repair; changed/extra/reordered history and schema drift fail closed.
Verify: `node --import tsx --test tests/family/storage.test.ts`; `pnpm run typecheck`; `pnpm run build` with no database/secrets. Migration tests own temporary files and clean them on failure.

### Checkpoint A — persistence proof

- [x] Tasks 1–3 are green; archive native compatibility and schema/migration evidence. No application route depends on unfinished storage behavior yet.

### 4. Give the HTTP harness isolated persistent identities

Dependency: 3. Files: tests/auth/server.ts, tests/auth/google-network.ts, tests/auth/flow.ts, tests/family/database.ts (medium).
- [x] Every server owns a migrated temporary database and cleanup; explicit missing/unmigrated cases can opt out. Extend only the test-process transport with distinct signed Google subjects/emails and changed-email cases.
- [x] Keep OAuth initiation/callback separate from completing onboarding so tests can inspect pending access and POST provisioning/acceptance explicitly; omit fixed success destinations in default helper requests so the server owns them, and support restart against the same test-owned file.
Verify: `pnpm run test:auth` against the existing behavior and strict `pnpm run typecheck`; inspect that application code imports no fixture and no production fake-user/config switch exists.

### 5. Carry a stable verified subject through admission

Dependency: 4. Files: lib/identity-access.ts, lib/auth.ts, lib/session.ts, tests/family/identity.test.ts, tests/auth/oauth.test.ts (medium).
- [x] Implement typed admission states from current SQLite membership/grants/invitations plus the existing allowlist matcher; pending invitees get onboarding only, durable grants permit later unlisted login, membership alone never grants access. Malformed configuration/storage errors fail closed.
- [x] Populate only verified Google `sub`, retain it in encrypted cache, and reject legacy cookies missing it. Only fresh verified post-admission callbacks may update an existing subject's unique email; older cookie reads never write or merge identities.
Verify: focused identity tests and real callback/JWE assertions; changed-email/collision/stale-cookie cases, empty/malformed policy, allowlist removal, and stable subject across fresh login/restart. Retain existing signature/audience/issuer/expiry checks and absolute session lifetime.

### 6. Enforce member-only routes and safe logout

Dependency: 5. Files: lib/auth-policy.ts, proxy.ts, app/page.tsx, app/api/session/route.ts, app/sign-out/page.tsx (medium); finish the shared session helper from 5.
- [x] Require current family context for member pages/APIs; route eligible onboarding identities to onboarding, deny other protected APIs, ignore caller context headers, and preserve heading-only `/`.
- [x] Exact sign-out GET/HEAD and POST use the cryptographic-only helper at proxy/page/handler even after admission loss; no database/admission lookup or family data on this exception.
Verify: `tests/auth/access.test.ts` and `tests/family/identity.test.ts` through real HTTP; anonymous/dotted/RSC/prefetch/header-bypass cases, pending-member denial, database outage, and eligibility-loss sign-out. Add these assertions in the same green auth-boundary slice with task 7.

### 7. Complete an allowlisted user's first-login path

Dependency: 6. Files: app/api/auth/[...all]/route.ts, app/sign-in/sign-in-button.tsx, lib/family-store.ts, tests/family/provisioning.test.ts, tests/auth/oauth.test.ts (medium).
- [x] Fix successful OAuth destinations to `/onboarding` in client, forwarding and response validation; retain strict Google-only shape and reject injected subject/family/direct-token fields and generic mutation routes. Clear invitation-context cookie with all library cookie chunks on logout.
- [x] Implement transactional no-invitation provisioning and idempotent existing-membership return without rewriting email. Atomically recheck eligibility, membership and pending invitations before creating one family/user.
Verify: build then auth/identity/provisioning tests, updating old success assertions to complete the approved onboarding POST rather than weakening protected-home checks. The HTTP completion path becomes green in task 8 before committing this slice.

### 8. Expose guarded automatic setup

Dependency: 7. Files: lib/family.ts, app/onboarding/page.tsx, app/onboarding/onboarding-controls.tsx, app/api/onboarding/provision/route.ts, tests/family/provisioning.test.ts (medium).
- [x] Separate eligible identity from server-owned `{ userId, familyId }`; server rendering stays read-only. Auto-POST only for eligible users without membership, active invitation or presented context; derive all ownership server-side.
- [x] Retries/concurrent connections create no duplicates or orphans; GET/HEAD/prefetch/session reads cannot provision. A racing invitation wins or loses according to the immediate transaction's lock order, never both.
Verify: `pnpm run build`, `pnpm run test:auth`, `node --import tsx --test tests/family/provisioning.test.ts`; use real HTTP and separate SQLite connections/processes, including rollback/lock failures.

### Checkpoint B — first-login vertical flow

- [x] Tasks 4–8 yield a working allowlisted login → POST setup → title-only home → logout path; strict checks and all existing auth regressions pass. The not-yet-created invitation tests are added with the next slices.

### 9. Create recipient-bound invitations within a family

Dependency: 8. Files: lib/invitations.ts, lib/http.ts, app/api/family/invitations/route.ts, tests/family/invitations.test.ts (medium).
- [x] Member context owns every query; validate bounded recipient email and exact JSON shape/Origin, generate 32 random bytes, persist only hash, return fragment link once, enforce seven-day expiry and transactional duplicate/member/self checks.
- [x] Enforce durable 10/hour and 20-active-per-family limits; duplicate/conflict responses reveal no other family's/account's state. Reject client-supplied family ownership and unsupported methods.
Verify: built-server HTTP creation tests, actual DB hash/plaintext inspection, count/limit boundaries and concurrent creation through separate connections; no token or personal-data logging.

### 10. Preserve secret invitation context across sign-in

Dependency: 9. Files: lib/invitation-context.ts, app/invite/page.tsx, app/invite/invite-context.tsx, app/api/invitation-context/route.ts, tests/family/context.test.ts (medium).
- [x] Add only the specified public shell/POST policy entries; capture then remove fragment, same-origin POST a bounded token into host-only HttpOnly context cookie, return uniform `204` without invitation lookup, then navigate to sign-in.
- [x] Onboarding asks a verified pending recipient to reopen their link when context is absent; invalid/wrong-recipient/expired/revoked context never falls through to provisioning, and context alone grants no data/access.
Verify: real HTTP exact public methods, CSRF/size/cookie attributes and no lookup/preview; browser proof of fragment removal and absent server-path/referrer token is completed at task 13. Policy wiring reuses task 6's file in this small slice.

### 11. Join the invited family atomically

Dependency: 10. Files: lib/invitations.ts, app/api/invitations/accept/route.ts, app/onboarding/page.tsx, app/onboarding/onboarding-controls.tsx, tests/family/acceptance.test.ts (medium).
- [x] Let only exact POST acceptance reach the handler with cryptographic identity (including eligibility loss for a uniform denial), then recheck current admission, verified recipient and matching pending secret within an immediate transaction: reject any existing membership, insert user/family assignment and durable grant, consume invitation together, clear context; exact completed retry returns the same success only.
- [x] Prove unlisted invitee onboarding → acceptance → later login with consumed invitation works; pending/expired/revoked recipients cannot retrieve member data. Cancel signs out without consuming invite or creating family.
Verify: real HTTP independent cookie jars, subject/email collisions, wrong recipient, expiry/revoke races, same/different invitation concurrency, transaction rollback, and rejection for existing one-person/empty-family members.

### 12. Manage only the current family's members and invitations

Dependency: 11. Files: app/api/family/route.ts, app/api/family/invitations/[id]/revoke/route.ts, app/family/page.tsx, app/family/family-controls.tsx, tests/family/isolation.test.ts (medium).
- [x] Show own members and pending expiry/status, create/copy once and revoke only own pending invitations; all pages/actions repeat family guards, with accessible local form state and no home navigation additions.
- [x] Two real families cannot list/revoke each other's invitations, learn foreign IDs, switch membership or regain access from stale family claims. Revocation does not remove an accepted member's independent grant.
Verify: built-server two-family HTTP isolation and foreign-ID/forged-field tests; revoked/expired pending and removed-allowlist sessions still sign out and clear every cookie while other routes deny.

### Checkpoint C — family sharing vertical flow

- [x] Tasks 9–12 are green under `pnpm run test:family` and `pnpm run test:auth`; replay, limits, recipient binding, durable grants, outage/lock and cross-process races have concrete passing evidence.

### 13. Verify the actual interfaces and operating instructions

Dependency: 12. Files: tests/family/browser.ts, tests/auth/browser.ts, README.md, .env.example, .gitignore (medium).
- [ ] Exercise actual copied-link capture, invited Google callback/acceptance, automatic setup, family form/revoke and logout in isolated real Chrome at 320/1440. Reuse test-only provider transport; verify keyboard/focus, no overflow, heading-only home and no application console/network errors; visually inspect saved screenshots.
- [ ] Document durable-host `DATABASE_PATH`, explicit migrations, `/family`, new eligibility policy and legacy re-login, supported consistent backup/restore with 30-day retention, and the future family-owned DAL contract. Ignore DB/WAL/SHM/backup files; no secrets or fixture bypass.
Verify: `node --import tsx tests/family/browser.ts` and the adapted auth browser helper; save evidence under `org/reviews/`. Perform backup/restore only on a test-owned temporary database; live Google proof remains explicitly external unless actually performed.

### 14. Close verification and independent review

Dependency: 13. Files: AGENTS.md, CLAUDE.md, org/loop/config.yaml (small); evidence/review records are process artifacts.
- [ ] Update current repository guidance and append family regression to loop acceptance after build/auth; keep TypeScript/strict/no-bypass rules, family context before effects, exact public exceptions and Python regression coverage. Do not rewrite historical auth records.
- [ ] Run the full commands below, independent code/security review, fix findings and rerun affected checks. Orchestrator records normal bounded turns, current plan gate and artifact, then requests human merge/release; never self-approve, extend the loop budget or apply production migrations.

## Final verification and recovery

Run frozen install, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`,
`pnpm run test:auth`, `pnpm run test:family`, browser QA, and
`python3 -m unittest discover -s tests`; run `pnpm audit --json` and triage
reachable high/critical issues without forced upgrades. Record actual output.
Run `git diff --check`, `python3 scripts/scan_secrets.py --staged`, org
message/memory/loop checks, and `python3 scripts/check_plan_sync.py --hook
--plan intent/family-membership/plan.md --ledger gates/ledger.jsonl`.
The legacy checker chooses the first historical matching gate: separately
verify the new family plan approval by its explicit record ID with
`gate_ledger.py verify --record <family-plan-record> --require-committed` and
confirm its artifact/commit matches this approved plan. Never reuse an older gate.

Native loading or subject-mapping incompatibility stops the affected slice for
reviewed spec amendment. SQLite requires a persistent local volume on one host;
do not provision a service or silently substitute ephemeral/network storage.
No new account/family deletion or cleanup command is required by this V1; expiry
is enforced on every lookup and any later purge is separately reviewed. Before
production migration obtain human authorization and a verified consistent
backup; rollback preserves data and documents that old allowlist-only code
cannot serve invited users. No production migration, merge, push or release is
authorized by plan approval. No blocking product question remains; native/mapping
proof and independent implementation/security review remain required.
