# Dependency-aware migrations — implementation plan

- Author: architect; date: 2026-11-24
- Status: Draft; independent review required before behavior changes
- Inputs: sibling intent/spec/tooling assessment; PM acceptance

## Slices and proof

1. Record read-only development diagnosis and pinned/current Drizzle assessment.
   Characterize pinned out-of-order omission and branch identity collision using
   disposable databases; keep experiments isolated from application imports.
   Commit design artifacts and obtain independent specification/plan verdict.
2. Write strict TypeScript regressions first and record their actual failing
   output before implementation. Pure planner tests cover UUID collisions,
   conflicting immutable descriptors, checksum changes, missing dependencies,
   cycles and absent independence approvals. Owned PostgreSQL tests cover both
   approved0002/0003 versus0004 orders and equivalent complete validated schema,
   preserved historical tuples/data, repeated and concurrent runs, and atomic
   schema/ledger rollback. Include native UUID records so coverage is not confined
   to reordered legacy IDs.
3. Add validated runtime graph/profiles with fixed legacy UUID bindings,
   descriptor digests and narrowly reviewed independence declarations. Keep the
   legacy SQL/journal/runtime hash evidence unchanged. Retain Drizzle public
   loading; verify immutable source and metadata in prebuild without a database.
   Add UUID SQL loading only to explicit tooling, never runtime. Test absent SQL
   for known optional newer migration accepted at runtime but never executable.
4. Implement graph history/planning and append-only native ledger under the
   existing transaction/advisory-lock/timeouts. Map existing rows without update,
   renumber or backfill. Apply pending SQL and its original legacy/new native
   record atomically; validate approved pre-state before pending SQL, so migrations
   cannot mask drift, and final structural/security verification remains inside the
   transaction. Accept a validated optional runtime-role binding in explicit
   tooling so least-privilege grants and owner-side effective-privilege checks
   for that target runtime role complete in this same
   transaction; remove the old post-commit grant sequence. No implicit migrate.
5. Expand catalog/security validation and separate it from required history.
   Use exact approved applied-set profiles, fixed safe search path and one
   bounded repeatable-read READ ONLY runtime snapshot. Validate ledger security,
   ACL/effective table+column grants, role/schema privileges, functions, trigger
   enabled state, constraint/index state and RLS/policy semantics. Test actual
   malicious/unexplained SQL changes, not only manifest tampering. Exercise
   explicit owner tooling validation for existing fixture paths and restricted
   runtime validation for application paths.
6. Add closed sanitized operator reason codes; runtime error remains generic.
   Test connection/permission failures without printing raw drivers, credentials
   or internal diagnostics. Prove read-only validation via restricted grants and
   database snapshots; exercise older required profile on newer approved schema.
   Verify packaged runtime works without migration files/source and does not
   expose internal reason codes in HTTP responses.
7. Update native setup/troubleshooting and exact adoption guide. Run required
   checks, record actual evidence and limitations, then obtain independent code
   and security reviews. Resolve findings and repeat affected verification.
   Stop at reviewed local implementation; no shared/hosted migration or release.

## Changed-file manifest

- `intent/dependency-aware-migrations/**`: intent/spec/plan, tooling research,
  test/evidence/adoption notes; no historical artifact rewrites.
- `tests/migrations/**`: strict TypeScript prototypes, pure and PostgreSQL
  regressions plus bounded helpers using existing owned fixture utilities.
- `lib/db/runtime-metadata.ts`, new focused `lib/db/*` graph/history/catalog/
  diagnostic modules as needed: bundled reviewed metadata and validators.
- `lib/db/connection.ts`: safe search path, consistent read-only validation,
  preserved typed native queries, TLS and bounded transaction behavior.
- `lib/db/repository-migrations.ts`, `lib/db/migrate.ts`,
  `lib/db/verify-runtime-metadata.ts`: explicit source loading/execution and
  build-only metadata checks; no database during build.
- `drizzle/postgresql/`: new reviewed dependency/compatibility metadata and
  schema/security profile artifacts only. Historical0000–0004 SQL, journal and
  hashes remain unchanged; optional catalog format extension must retain its
  reviewed structural content. No new domain schema is requested.
- `scripts/migrate-db.ts`: sanitized diagnostics and transactional least-
  privilege grants from approved profile. Setup helper only if needed to
  preserve credential/ledger-read permissions; no shared setup execution.
- `tests/family/**`, `tests/menu/**`, `tests/plans/**`,
  `tests/deployment/**`, `tests/auth/**`: meaningful compatibility/owner-mode
  fixture adjustments and packaged/runtime/HTTP regression assertions; do not
  delete old failures or relax security expectations.
- `README.md`, `package.json`: setup/troubleshooting and migration test command.
  No dependency version or lockfile change is planned.
- `org/**`, `workflow-graph.yaml`: append/advance workflow review/evidence/status
  records through repository scripts, preserving historical audit chains.

## Verification commands

Use Node24.15.0/pnpm10.33.0 and frozen install. Commands requiring PostgreSQL
read private ignored config; only restricted-role owned random databases are
created/migrated/dropped. Never reset development or contact hosted targets.

```text
node --import tsx --test tests/migrations/*.test.ts
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run test:family
pnpm run test:menu
pnpm run test:plans
pnpm run test:auth
pnpm test
node --import tsx --test tests/deployment/*.test.ts
python3 -m unittest discover -s tests
node --import tsx tests/menu/browser.ts
python3 scripts/scan_secrets.py --staged
git diff --check
```

Use existing browser fixture owned server/database/profile with desktop/mobile
widths; no live Google credentials or paid provider keys. Record actual command
exits/counts and browser observation, not assumed passes. Verify staged secret
scan before each local commit. Code/security reviewers are independent writers
of review files. Changes to implementation decisions update this plan/spec and
receive affected review rather than weakening the contract.

## Risks and limits

Exact approved schema combinations are deliberately finite; a new combination
needs a reviewed profile and application regression evidence. SQL checksum is
not an effect proof. Stable UUIDs prevent routine branch numbering collisions,
while validation rejects copied identities; no ID generator can make malicious
reuse safe. Historical legacy checksums remain their original source hashes.
Native side ledger must not accidentally become a runtime write dependency.
Read-only snapshot consistency, owner normalization, column privileges, grants
and function/trigger/RLS state are security review priorities. Database owners
remain trusted administrators; no claim to detect owner-authored data tampering.
Old binaries without the compatibility backport still fail closed. Local
adoption needs separate execution authority and backup verification; this task
provides exact steps but does not run them on shared development or hosted data.
