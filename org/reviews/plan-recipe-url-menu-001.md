---
artifact: intent/recipe-url-menu/plan.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Recipe URL menu — independent implementation-plan review

Verdict: **Approved for owner plan review.** No blocking Bugs, Security or
Compliance finding. The plan is implementable within the approved asynchronous
specification. This peer verdict does not authorize code, migration execution,
hosted changes or a new loop budget; owner plan approval remains separate.

## Evidence

- **Manifest and storage:** `plan.md:24`–`30` names the actual PostgreSQL migration,
  journal, full catalog, runtime metadata, explicit grants tool and new disposable
  rollback. `plan.md:95`–`110` preserves historical migration evidence, requires
  owner-test-database catalog inspection/public-loader hashes, exercises upgrade
  and dump/restore, and drops the companion before preserved historical rollback
  scripts. The manifest includes both `tests/menu/migration.test.ts` and
  `tests/family/storage.test.ts`, which currently assume two migrations/four app
  tables or drop `menu_recipes` directly. This accounts for the real dependent
  assertions rather than silently deleting them.
- **Privileges and compatibility:** Existing `scripts/migrate-db.ts` grants menu
  SELECT/INSERT/DELETE, and `tests/menu/migration.test.ts:66`–`79` forbids UPDATE.
  The plan explicitly changes this to only title/summary/image_url/time_kind/
  time_text UPDATE, with companion SELECT/INSERT/UPDATE and negative assertions
  for forbidden menu columns, companion DELETE/TRUNCATE, DDL and ledger writes
  (`plan.md:102`–`108`). Exact catalog and history checks remain intact in
  `lib/db/connection.ts`; no runtime repair or old-artifact rollback is proposed.
- **Authority and fenced state:** `plan.md:114`–`153` retains strict public entry
  parsing and unchanged snapshot request fields, uses the actual common-lock
  transaction/store architecture, compares captured email with current verified
  subject email and checks the same owning family at both external-effect gates.
  Guard extraction is restricted to `lib/menu/http.ts`, retaining current
  Host/JWE/session-token binding and security headers while exposing only
  server-side identity/effective expiry internally. Both session-first and
  JWE-first expiry on save/Retry are explicit tests. No unrelated session/auth
  policy or public-route change is permitted.
- **Persistence, scheduling and races:** URL placeholder/task insertion is atomic;
  `after()` registration occurs only after commit. Duplicate existing entries do
  not schedule work, active/ready Retry cannot reset expiry, and completion is
  conditional on current entry ID/generation/lease after the lock. Registration,
  process interruption, removal/resave and stale-worker tests cover the actual
  failure boundaries. Two process-local slots are finally-cleaned and non-waiting;
  no fetch holds a DB connection/write lock and no callback upserts an entry.
- **Genuine fixture feasibility:** `plan.md:170`–`179` names strict TypeScript
  native DNS/HTTPS preload and owned server/control-barrier helpers, plus the
  narrow optional-preload extension to `tests/auth/server.ts`. The existing child
  server already starts with test-only Google preload before application import;
  adding explicit composed preload paths can exercise compiled Next `after()`
  and real API/store/parser behavior without any production fixture. The plan
  names `tests/deployment/postgres-packaging.test.ts`, whose existing isolated
  `.next` copy lacks source/migration files, and requires curation through that
  environment. Successful menu responses cannot be fabricated by interception.
- **UI and polling proof:** `plan.md:157`–`184` covers labelled save/Retry states,
  request cleanup, honest uncertain-save feedback, existing removal focus and
  ready card behavior. Polling has a fixed five-second/eight-request/40-second
  budget, one request in flight and no budget reset on refresh; hidden/unmount/
  settle/cap behavior is explicit. The real Chrome helper must prove these
  bounds and read-only behavior alongside state transitions, stalled publisher,
  retry, pagination, keyboard, mobile/desktop layout and actual screenshots.

## Verification and next gate

Required commands include lint/typecheck/build, all recipe/photo/menu/family/auth/
deployment/Python suites and both existing/new real Chrome menu flows
(`plan.md:191`–`205`). Focused tests precede each implementation slice; existing
photo parser/transport remain byte-for-byte unchanged. Frozen install and this
worktree's installed Next documentation are explicit pre-code prerequisites.

No required implementation file or supported capability is missing from the
manifest. Any discovered departure requires plan amendment and peer review.
Historical hosted bootstrap verification is explicitly not a future cutover
runbook. The plan respects the current loop's remaining review turn and requires
a separately authorized bounded Build cycle after owner plan approval.

Reviewed the approved specification, plan and relevant actual schema, store,
credential guard, migration/grant, strict validation, server fixture, storage and
packaging sources. `git diff --check` passed. No application/runtime tests or
migration commands were executed for this artifact-only review.
