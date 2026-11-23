---
artifact: implementation
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: approved
round: 1
---

# Independent PostgreSQL security review

Reviewed approved PostgreSQL intent/spec/plan and native amendment, org protocol, REVIEW.md, connection/transaction/migration code, identity/admission and invitation services, guarded HTTP callers, native setup/migration scripts, PostgreSQL SQL, test server/database/backup/role helpers, Next tracing and ignore rules. This reviewer did not implement application code, install software, alter a service/database, provision hosting, deploy, or call live Google/model providers. Only this review record and dummy temporary local probes were written.

## Findings

1. **Resolved [P1][Security] Reject duplicate TLS parameters before passing the URL to pg.** `lib/db/connection.ts:12` validates `url.searchParams.get('sslmode')`, which returns the first value. The installed `pg-connection-string@2.14.1` parser iterates all search entries and overwrites earlier values, so `postgresql://user:dummy@example.test/db?sslmode=verify-full&sslmode=disable` passes validation but constructs a pg client with `connectionParameters.ssl === false`. This violates mandatory certificate-verified remote TLS and can transmit database credentials/data unencrypted for a malformed server configuration. Independently reproduced without connecting to a server. Reject duplicate `sslmode` values (both orders) and retain the query-key allowlist; add a regression. No real credentials were used or printed. The author added `getAll('sslmode').length > 1` rejection and both duplicate orders to the regression. Independently reran the test (1 passed, exit 0) and a separate pg Client construction probe: both duplicate orders reject; the valid remote verify-full URL retains SSL without rejectUnauthorized:false. This closes the observed TLS bypass.

2. **Resolved [P2][Security/Compliance] Protect preexisting private configuration destinations.** The original `scripts/postgres-local.ts` used `mkdir(...,{mode:0700})` and `writeFile(...,{mode:0600})` without validating existing `.data`/env paths. Existing file permissions remain unchanged by writeFile's mode, and symlinks are followed. A dummy temporary probe independently confirmed a preexisting 0644 file remained 0644 and a symlink write modified its target. Current code adds ownership/non-symlink/physical-path validation, chmod 0700/0600 and exclusive random sibling writes followed by rename for generated env files. Both `.data` and `.data/postgres` are checked before secret output; `.env.local` is checked before reading or writing. This closes the observed issue. Actual inspected credentials/env files were 0600 and cluster/data/socket directories 0700 before this fix, so this review does not claim an actual secret exposure.

## Controls assessed

- Family mutations use one checked-out connection, READ COMMITTED, the common transaction-scoped advisory lock before admission/membership/invitation/rate-limit decisions, explicit rollback, and release in finally. Subject/email/token uniqueness and mandatory family FKs remain in PostgreSQL. Bound external values remain data; no request-controlled SQL identifiers were introduced. Provider/photo implementation and Vercel duration/cancellation settings are untouched, and recipe route still awaits current family context before provider effects.
- Stable Google subject, verified recipient binding, full current admission rechecks, invitation-first provisioning, durable accepted grants, single-family rejection and uniform API errors remain. Callback metadata update and invitation revoke await their transactions.
- Runtime is distinct from migration owner; local test role has CREATEDB but no superuser/CREATEROLE. PUBLIC development database connect and schema privileges are revoked. Explicit migration grants SELECT-only ledger access and DML on domain tables. Tests assert runtime cannot DDL/create databases/write ledger and test credentials cannot connect to development DB. Setup rerun was amended to preserve runtime domain grants while denying ledger DML.
- Native pg_ctl targets the fixed private cluster only and requires its ownership marker and PG_VERSION. Initdb uses SCRAM host/local authentication and a private pwfile; no password is placed in command arguments. Loopback listen config and private socket/data directories are explicit. Homebrew's default cluster/service is not used.
- Test cleanup names are generated inside each fixture, owned by mp_test, and constrained to loopback/test role; cleanup rechecks ownership. Backup/restore requires matching protocol/host/credentials plus random test DB names, uses a private temporary directory and password environment variables, and removes only that owned directory. No SQLite files are deleted or imported automatically.
- Independently inspected protected home, family API and recipe API `.nft.json` manifests: each includes PostgreSQL migration SQL, journal and catalog signature. `.data`/env/database backups remain ignored by Git and Vercel. No credential contents were printed during this review.

## Independently executed probes

```text
Dummy temporary fs probe:
  existing file mode after writeFile(mode 0600): 644
  writeFile followed symlink: true
  temporary directory removed in finally

Dummy remote URL validation plus pg Client construction (no network):
  validator accepted duplicate sslmode; effective TLS: false

Read-only Next trace inspection:
  .next/server/app/api/family/route.js.nft.json: catalog/journal/SQL present
  .next/server/app/page.js.nft.json: catalog/journal/SQL present
  .next/server/app/api/recipes/search/route.js.nft.json: catalog/journal/SQL present
```

Full application regression/browser/audit totals are owned by the implementation agent and must be recorded in its verification artifact; this security review does not substitute prior branch results. Both security findings are resolved and independently rechecked. Approved for the security peer gate; full implementation verification and code-owner review remain separately required. Human merge, hosted provisioning/migration and release gates remain closed.

## Final targeted validation after fixes

```text
node --import tsx --test tests/family/postgresql-contract.test.ts
1 passed, 0 failed; exit 0

Separate dummy URL/pg Client construction probe (no network):
Both duplicate orders rejected; valid remote URL retains certificate verification.
exit 0
```

The on-disk review includes the fixed URL check, private destination validation/atomic writes, owned-cluster guard and setup rerun grant preservation. Certificate verification is assessed against the installed primary `pg-connection-string` implementation, not an assumption that sslmode=require is sufficient. No production or hosted action is authorized by this approval.
