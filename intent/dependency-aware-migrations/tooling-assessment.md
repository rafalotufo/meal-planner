# Drizzle tooling and local diagnosis

- Architect;2026-11-24; evaluated before behavior changes
- Application dependency pins remain `drizzle-orm@0.45.4` and `drizzle-kit@0.31.11`.

## Observed starting state

This worktree already contains0000 family,0001 menu,0002 weekly planning,0003
uniqueness repair and0004 URL curation. Initial Git status was clean. The
private existing native configuration was made available without running
`db:setup`. A bounded REPEATABLE READ READ ONLY transaction using the existing
runtime role queried only historical migration IDs and curation-table existence:
`legacyIds:[0,1,2,3,4]`, `curationTablePresent:true`. It rolled back without writes;
no raw database errors, credentials, row data or schema definitions were printed.
This establishes the reported older-checkout reproduction needs a test profile;
it does not establish compatibility of0004 merely from its presence.

Existing `checkHistory` compares ordered row hashes/timestamps against an exact
array prefix; `checkSchema` compares exact catalog rows. Runtime startup calls
both. The catalog already covers definitions for columns, constraints, indexes,
functions, triggers and RLS flags/policies, but not all security state such as
ACLs, trigger enabled flags, policy permissiveness or index/constraint state.
The explicit migrate tool grants runtime privileges after its transaction;
the new design moves approved grants/final validation into explicit execution's
transaction. No runtime schema migration is introduced.

## Stable tooling experiment

`tests/migrations/drizzle-prototype.test.ts` uses only the pinned public loader
and node-postgres adapter/migrator in an owned random database created by
`mp_test`. It ran successfully with one passed test. It applies a later-timestamp
independent CREATE TABLE first, adds an earlier-timestamp CREATE TABLE and reruns:
the earlier table is absent. Replacing the same timestamp with a different SQL
checksum also succeeds without applying that SQL or rejecting the collision.
The ledger still has only the original row. This is measured behavior, not an
assumption. Temporary folder and owned database were cleaned up.

Installed `drizzle-orm/pg-core/dialect.js` selects only the latest applied
timestamp and applies SQL only when `folderMillis` is greater. The public
`readMigrationFiles` preserves SQL bytes for SHA256 and journal timestamps but
does not supply dependency IDs or runtime security compatibility. Reuse the
loader/checksum boundary, not the timestamp-only execution policy.

## Current v1 assessment

Official npm registry dist-tags read2026-11-24 report stable/latest0.45.4 ORM and
0.31.11 Kit, with both `rc` tags at1.0.0-rc.6. No repository dependency is upgraded.
Official [v1 upgrade instructions](https://orm.drizzle.team/docs/upgrade-v1)
describe per-migration timestamp/name folders, snapshot conversion, history
columns `name`/`applied_at`, and execution of missing folder names even when their
timestamp predates applied work. Unmatched history stops conversion. Their
`check` examines local branch histories, not the database's applied history.
The [commutative-migrations design](https://github.com/drizzle-team/drizzle-orm/discussions/5005)
describes snapshot-based branch conflict detection and automatic parent merging.
The [RC6 notes](https://orm.drizzle.team/docs/latest-releases/drizzle-orm-v1rc6)
still label a release candidate and list breaking changes.

These are useful supported capabilities, but snapshot inference cannot establish
the owner's required explicit independent review or this application's security
effects. This repository has SQL/journal/catalog evidence, no Drizzle generated
snapshot chain, and a custom `public.__drizzle_migrations(id integer PRIMARY KEY,
hash text,created_at bigint)` rather than an untouched stock serial ledger.
Adopting v1 would require a separately proven conversion and TypeScript/runtime
compatibility assessment. Its documented history backfill is not needed for the
append-only alias/side-ledger transition selected here.

### Executed RC6 prototype

Installed exact ORM/Kit1.0.0-rc.6 and pg8.23.1 with install scripts disabled in
an owned `/private/tmp/mp-drizzle-rc.*` folder, leaving repository dependencies
and lockfile unchanged. Generated a real common base snapshot with
`prototype_base(id integer PRIMARY KEY)`, copied that history into two branch
folders, then generated each branch using the supported CLI:

```text
node node_modules/drizzle-kit/bin.js generate --dialect postgresql --schema schema.ts --out <branch> --name <name>
node node_modules/drizzle-kit/bin.js check --dialect postgresql --out <merged>
```

Conflict branches both add `prototype_base.value`, one text and one integer.
Combining their generated folders and running `check` exits1 with one conflict
across the two `add_column` branches. It recommends deleting those folders and
resetting databases that applied them; neither recommendation was executed.

Independent branches instead add `prototype_independent_a` and
`prototype_independent_b` respectively. The merged generated history passes
`check` with exit0. `tests/migrations/drizzle-rc-prototype.ts <temp-root>` then
uses the public RC adapter/migrator against two owned restricted-role databases.
Applying A first then merged produces both tables and three history rows;
applying B first then merged also produces both, including the older missing A
migration. Repeated merged runs preserve history exactly. These actual positive
results confirm the RC materially improves on pinned stable's timestamp policy.

A third owned database exercises our exact custom legacy ledger shape and one
executed base migration row `(id0,hash,created_at)`. Direct RC migration to the
merged folder rejects that upgrade; the historical tuple remains unchanged.
This is a concrete compatibility failure, not proof that a separately designed
RC conversion could never work. An initial experiment passed the stable-style
bare client to RC's changed constructor and failed; correcting it to RC's
`drizzle({ client })` made both independent-order proofs pass. No application
code or dependency declarations were changed to accommodate RC.

Final executed RC command exits0 and prints three bounded results: both order
proofs and the custom-ledger rejection characterization. All experiment-owned
databases are cleaned up by ownership-checking fixture cleanup. The temporary
package/snapshot files are not application artifacts or compatibility authority.

## Selected approach and limits

Retain stable supported SQL loading and pinned dependencies. Implement the
minimal dependency/identity policy missing from the stable migrator; retain
application schema/security validation using explicit reviewed profiles. Leave
existing historical rows intact and use a separate native UUID ledger only for
new IDs. This avoids claiming a generated snapshot diff proves arbitrary SQL
security or requiring a release candidate upgrade on a high-impact storage path.
The implementation must still prove actual dependency/order/security behavior
on disposable databases before it is considered complete.
