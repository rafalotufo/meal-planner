# Preview migration refusal — read-only diagnosis 001

- Reviewer: security-researcher; date: 2026-11-25
- Fixed source: `19774c7cd8ae301682003838f083b9d825d5e56d`
- Target: recorded Preview Neon branch `br-dark-term-bbqhnxi5`, `meal_planner`.
- Scope: source/private URL-shape inspection and explicit read-only owner
  preflight only. No migration retry, DDL, grant, data, role or credential change
  was performed by this reviewer.

## Cause and correction

Root's15:42:22 migration command returned generic `execution-failure`. The
connector-provided owner/runtime URLs contained `channel_binding=require` plus
`sslmode=verify-full`. `lib/db/connection.ts:5–12` deliberately accepts only the
reviewed `sslmode` query key; `scripts/migrate-db.ts` validates both URLs before
calling `migrateDatabase`. That shape fails deterministically before connection
or migration. The generic diagnostic is not evidence of a PostgreSQL DDL failure
or of bad passwords. Do not relax the runtime URL validator or create new roles.

Normalize only the known connector parameter out of private operator URL copies,
retaining exact hostname, username, password, port/database and mandatory
`sslmode=verify-full`. Refuse other unexpected parameters rather than silently
stripping them. Root made that private-file normalization; no raw URL/password
was emitted. The reviewed remote verified-TLS contract remains unchanged.

## Independent read-only result after normalization

A temporary diagnostic helper used existing private credentials and the actual
`FamilyDatabase.readOnly` transaction path, then closed its pool; exit0:

- `transaction_read_only=on`, current actor `mp_migrator`, database `meal_planner`.
- Public-schema CREATE permission true; database CREATE false. No additional
  database privilege is required or proposed.
- Ledger safety passed; five historical applied identities, legacy ledger present,
  native ledger absent.
- `validateSchema` against the actual historical five-migration profile, owner
  identity and finite security rules passed without executing DDL.
- All nine existing application/ledger tables are owned by `mp_migrator`.

The first sandbox diagnostic stopped before SQL while the unsupported URL key
was present. An intermediate diagnostic required that key just as root had
already removed it and also stopped before SQL; accepting the already-normalized
copy allowed the final read-only preflight. None of these diagnostics reran the
migration command. Private connection values were read in-process, never printed.

## Next bounded action

Root may perform the single pinned migration CLI retry under the already recorded
exact Preview scope, using normalized private owner/runtime copies. Preserve the
failed-attempt record and the pre-migration backup receipt. After the retry,
independently inspect actual seven-migration/native-ledger/catalog/grant/data
state; a later COMMIT-response or post-commit runtime-smoke failure must still be
handled according to actual committed state. Do not infer rollback from exit1.
No alias move, Production effect, new privilege, schema repair or backup restore
is authorized by this diagnosis. `git diff --check` passed.
