# Local adoption and troubleshooting

This is an operator handoff, not authorization to change the shared development
database. This task inspected that database read-only and exercised migration
changes only in owned disposable databases. Hosted migration, deployment, push
and merge require separate authority.

## Choose the compatible source

Use the independently reviewed implementation and compatibility manifest from
this feature. A pre-feature binary still rejects a database-ahead schema. For an
older application, backport the validator and the reviewed compatibility package
through its normal code-review process, rebuild and restart. Keep the older
application's required migration IDs; add only reviewed known descriptors and
the exact accepted applied-set catalog/privilege profile. Include the source
commit, independent review and older-application regression evidence in that
backport. Do not copy a checksum from the database into a manifest as approval.

For actual pre-curation application source, metadata alone is insufficient.
That source's meal generator and suggestion/acceptance reads can select pending
URL-save placeholders from `menu_recipes`. Backport and review the curation-aware
read filters from the integrated application (including generation and
suggestion/acceptance), and prove unfinished links cannot become meals while
ready snapshots remain usable. The older-required-migration regression exercises
a compatible application with fewer required IDs; it is not approval of every
historical four-migration application binary. Reassess other behavioral changes
for each exact application source before approving its compatibility package.

The current source contains all five historical migrations. The read-only local
diagnosis found ledger IDs0–4 and `menu_recipe_curations`. This does not authorize
new SQL or prove compatibility by itself: the new validator must still approve
the complete actual schema and security state. An already compatible database
does not need migration execution merely to activate the new validator.

## Adoption sequence

1. Preserve unrelated work, use Node24.x/pnpm10.33.0, and install with
   `pnpm install --frozen-lockfile`. Preserve private configuration permissions.
   Existing native setup does not need to be provisioned again for this feature.
2. Check that the private runtime URL targets the intended native loopback
   development database, without printing credentials. Keep migration and runtime
   roles separate. Do not substitute a hosted URL for a local check.
3. Run the read-only operator validation documented in the root README. If it
   passes and all required migrations are already present, rebuild with
   `pnpm run build`, stop the old local application, and start the reviewed build
   with `pnpm run start`. Configure the intended existing local origin. Verify
   sign-in and representative family/menu operations locally.
4. If migrations are missing, stop here until the owner separately authorizes
   the exact pending IDs and target. Review the SQL, dependencies, independence
   declarations, combined catalog and grants. Take an owner-only PostgreSQL
   backup and prove restoration into an owned isolated database using the existing
   backup procedure before executing a shared-data migration.
5. After that separate authorization, run `pnpm run db:migrate` with the private
   owner/runtime pair for that exact local target. The runner obtains its lock,
   validates the existing state, executes pending SQL and ledger inserts, applies
   reviewed runtime grants and validates the result in one transaction. Rerun
   the read-only check, rebuild/restart, and verify local application behavior.

No step calls `drizzle-kit push`, resets a database, renumbers legacy rows,
marks a migration applied without execution, imports data or removes extra
objects to make validation pass. Preserve data if adoption fails; investigate
with the exact reviewed source and a disposable reproduction.

## Failure categories

Operator output uses fixed reason codes and advice. Runtime pages and APIs
continue to return only `Storage unavailable` or their existing generic service
response. Do not add raw driver errors, URLs or catalog definitions to logs.

| Reason | Action |
| --- | --- |
| `database-ahead` | Obtain the reviewed compatibility backport for the exact additional applied set, or use a compatible reviewed application. Unknown additions remain blocked. |
| `missing-dependency` | Review missing prerequisite IDs and required SQL. Execution needs separate authority; do not insert ledger rows manually. |
| `checksum-mismatch` | Recover the immutable reviewed source or investigate ledger corruption. Do not edit an applied checksum to agree. |
| `conflicting-identity` | Resolve reused IDs, legacy aliases or changed descriptors through review. New work needs a fresh UUID. |
| `dependency-cycle` | Correct the proposed dependency graph before execution. Applied descriptors remain immutable. |
| `incompatible-schema` | Reproduce unexplained structural or security drift in an isolated database and review a compatible correction. Extra tables alone do not establish safety. |
| `connection-failure` | Check the dedicated local cluster and private target configuration. Preserve verified TLS for remote URLs. |
| `permission-failure` | Check the intended owner/runtime pair and approved least-privilege contract. Do not grant ownership, privileged membership or broad table/column permissions as a workaround. |
| `execution-failure` | Use the reviewed SQL and a disposable database to isolate the failure. Failed migration transactions preserve pre-run schema and ledger state. |

## Creating future branch migrations

Generate a fresh random UUIDv4 and use its UUID-bearing SQL filename. Add the
immutable descriptor with SQL SHA256 and exact dependency UUIDs to the reviewed
manifest. Never allocate another sequential legacy ID. Explicitly review each
incomparable migration pair and bind its independence declaration to both
descriptor digests. Add approved exact combined and preflight profiles, including
privileges and security effects, and prove both orders on disposable databases.
An unsupported combination stays blocked even when its individual migrations
are separately known. This finite contract deliberately does not infer general
SQL commutativity.

Existing historical SQL, journal, checksums and ledger tuples remain unchanged.
Future UUID-native records use the separate ledger created only when an explicit
run executes native migration SQL. Existing legacy entries are not backfilled
or rewritten. The application never creates either ledger.
