# Dependency-aware migrations — specification

- Author: architect; date: 2026-11-24
- Status: Approved by independent reviewer7a08bfe against architecturec00be7b; implementation amendments below reviewed in-session
- Inputs: sibling intent, PM acceptance and `tooling-assessment.md`

## Decision

Retain pinned stable Drizzle's public `readMigrationFiles` for immutable legacy
SQL loading and SHA256 checksums. Keep native typed bound `pg` queries and SQL as
the schema source. Add a small explicit dependency planner and reviewed runtime
compatibility manifest. Do not introduce ORM/schema-builder runtime imports or
upgrade to Drizzle v1 RC as part of this feature. Its folder/history conversion
and snapshot-based inference do not establish this application's security or
compatibility contract. Reconsider stable v1 separately with migration proof.

History answers which immutable changes ran; compatibility answers whether this
application may safely use their actual combined schema. They are separate
checks. Neither applied-row count nor an extra table nor an observed checksum is
sufficient evidence of application compatibility.

## Stable identity and dependencies

Assign every legacy migration a fixed UUID in committed reviewed metadata,
bound to its unchanged SQL SHA256 and exact legacy `(id,created_at)` tuple.
New migrations receive random UUIDv4 identities and UUID-bearing filenames;
never allocate another sequential identity or copy an existing UUID to new work.
Validate duplicate IDs, SQL filenames and legacy aliases before connection.
Same UUID with different hash, dependency declaration or legacy alias is a
conflicting identity, even across branches. The immutable descriptor digest
binds ID, SQL hash, ordered canonical dependency IDs and legacy alias. Changing
SQL/dependencies requires a new migration ID, not editing an applied descriptor.
File order, journal index, timestamps and human labels do not establish identity.

Each descriptor names exact dependency UUIDs. Reject missing referenced
descriptors, missing applied prerequisites and graph cycles. Topologically sort
pending required migrations with deterministic UUID tie breaking. Every
incomparable pair in a permitted combined set must have an explicit reviewed
independence declaration bound to both immutable descriptor digests. Absence of
that declaration fails closed even if two CREATE TABLE statements look disjoint.
Dependencies and independence must be consistent; a dependent pair cannot be
declared independent. Do not infer compatibility by parsing arbitrary SQL.

Legacy required graph:0000 family is root;0001 menu depends on0000;0002 weekly
planning depends on0001;0003 uniqueness repair depends on0002;0004 URL curation
depends on0001. Review0004 as independent of0002 and0003 only after both execution
orders and combined structural/security contract pass on disposable databases.
0003 repairs weekly plan data;0004 adds companion curation rows and its FK cascade
without changing weekly-plan semantics. The accompanying restricted curation
grants are an explicit part of compatibility, not implied by CREATE TABLE.

## Immutable ledger transition

Leave `public.__drizzle_migrations` and all existing `(id,hash,created_at)` rows
untouched. Read each row by its committed legacy alias, not position or prefix
length. Reject unknown aliases, tuple collisions or changed hashes. An explicit
migration run can execute a still-pending legacy SQL migration and insert its
original reserved tuple only after successful execution; this permits0004 before
0002/0003 without renumbering records. Never insert a historical row merely to
claim a missing migration ran.

New UUID-native migrations append only to a separate
`public.__app_migrations` identity ledger with primary-key UUID, SQL hash and
immutable descriptor digest. Create this ledger only during explicit migration;
do not backfill existing historical rows into it. The applied set is the union
of validated legacy aliases and validated native records. A native record cannot
duplicate a legacy identity. Its absence is valid for existing legacy-only
databases; runtime checks for presence using catalog reads and never creates it.
Validate either ledger's exact reviewed columns, constraints, indexes, ownership,
absence of triggers/RLS/policies and restricted grants. Do not silently exclude
ledger security from catalog validation. Existing rollback-only test fixtures
must account for this new explicit infrastructure table without deleting or
weakening historical migration tests.

Before any pending SQL, validate the actual applied set's approved pre-migration
structural/security profile. Pending SQL must not hide unexplained pre-existing
objects, replace an attacker function or "repair" drift into an accepted result.
Record finite reviewed partial profiles for empty,0000,0000–0001,0000–0002,
0000–0003,0000–0001+0004,0000–0002+0004 and all five; these are only states
supported by this graph. Unknown combinations fail before SQL. An empty database
still requires an empty managed-schema/security contract. Native infrastructure
ledger absence/presence has an explicit validated contract in each state.

All pending SQL and its matching ledger insertion execute on the same connection
in a single READ COMMITTED transaction after advisory lock73462902. Preserve
statement10s, lock5s, idle15s and client/connect timeouts. Re-read applied history
after acquiring the lock. Failed SQL or final schema validation rolls back every
schema/ledger change made by that run. Repeated/concurrent runs never reapply
an already committed descriptor. Never silently repair untrusted history.

## Trusted compatibility profiles

Bundle a reviewed JSON manifest containing known immutable descriptors, the
checkout's required IDs, reviewed independence pairs and supported exact applied
sets. Each supported set names its complete structural/security catalog and
privilege contract. Require every checkout-required ID to be present and
unchanged. Additional applied IDs are accepted only when known and included in
an exact approved set compatible with this checkout. No wildcard extra schemas,
tables, functions, permissions or migrations. Unsupported combinations remain
database-ahead even if each individual migration is known separately.

An older branch obtains trust by deliberately backporting the reviewed
compatibility-only code/manifest/catalog change from an identified trusted source
commit, obtaining independent review, rebuilding and restarting. It may know the
new descriptor without making that ID required or bundling/executing its SQL.
The backport includes dependencies, hashes/digests, independence evidence,
complete effect catalog, permitted grants, old application regression evidence
and source/review references. This is source-control trust, with the same review
authority as application code; no database row, network download, environment
switch, checksum prompt or automatic metadata regeneration can authorize safety.
An unmodified older binary will still reject newer databases. Builds verify
present SQL against trusted metadata and never query or mutate a database.

For this implementation provide the five-migration current profile and an
explicit older required0000–0003 profile accepting the approved five-migration
schema. Regression proof uses that profile through the same production
validator and real restricted connection, then executes representative older
application bound family/menu/weekly-plan reads and writes under the approved
combined privilege contract; no test-only authentication bypass.
Additional application/profile choices are explicit library/tooling inputs;
production runtime always uses its bundled reviewed default.

## Catalog and security contract

Compare the actual catalog against the exact approved set, independently of the
history. Cover required columns/types/nullability/defaults, constraints including
validation/deferral state, index definitions and validity/readiness, relation
kinds, RLS and FORCE RLS, policy command/roles/expressions/permissive mode, trigger
definition and enabled state, functions/procedures including definition,
SECURITY DEFINER/configuration/ownership and EXECUTE privileges. Unknown public
relations, routines, triggers, policies, constraints and indexes fail closed.
Reject unsupported application-owned objects in other user schemas or altered
namespace/search-path behavior that could redirect unqualified SQL. Use a
reviewed fixed `pg_catalog,public,pg_temp` search path for validation and
application SQL; explicit pg_temp last prevents implicit temporary-table shadowing;
preserve verified TLS and bound query values. Do not claim arbitrary PostgreSQL
extension or superuser tamper detection: privileged database owners can mutate
both schema and data, and are outside the untrusted application-role boundary.

Normalize only explicitly known deployment bindings (object owner, dedicated
runtime role), never unknown grantees/privileges. The supported local/hosted
runtime is `mp_runtime`; object owner is the dedicated migrator or owned test
role. Runtime must have the reviewed required table/column DML and ledger SELECT,
and no DDL/schema CREATE, TRUNCATE, REFERENCES, TRIGGER, migration-ledger write,
unreviewed function EXECUTE, grant option or privileged role attributes/membership.
PUBLIC and unrelated-role grants on managed data objects must be rejected.
Fresh PostgreSQL17's PUBLIC schema USAGE is permitted in empty/owner tooling
states (it conveys neither data access nor CREATE); PUBLIC/runtime schema CREATE
is never permitted. Explicit runtime-grant setup may revoke PUBLIC schema USAGE
and grant dedicated runtime USAGE instead. Validate
column-level UPDATE separately so curation cannot change source/family/identity.
Validate schema USAGE/CREATE and runtime role attributes/inheritance as well as
effective privileges, not only direct ACL text. Missing required grants fail
with sanitized permission diagnosis. Owner-based disposable fixture validation
uses explicit tooling owner mode, not a production runtime privilege bypass.
`openDatabase` defaults to strict runtime validation; it never selects owner mode
from role ownership or identity. Owner mode is an explicit tooling input only.
Migration validation can run before runtime grants have been applied but must
still reject dangerous existing ACLs. Before commit the owner connection checks
the final actual ACLs and effective privileges for the validated target runtime
role, using role-qualified privilege catalog functions on that same transaction.
An optional postcommit restricted-connection smoke can confirm connectivity, but
is not claimed to roll back an already committed migration if it fails.

Runtime reads history/catalog/privileges in one repeatable-read READ ONLY
transaction with bounded local settings, so it does not combine pre- and
post-migration states. No schema, ledger, grant, provision, session write or
migration advisory lock occurs in this read path. Generic public errors remain
`Storage unavailable`; internal reason codes never enter API/HTML/props/logs.

## Operator diagnostics

Expose a closed set of sanitized migration/verification reasons: database-ahead,
missing-dependency, checksum-mismatch, conflicting-identity, dependency-cycle,
incompatible-schema, connection-failure, permission-failure and execution-failure.
Messages contain only fixed advice and validated repository IDs if needed; no
raw SQL, catalog definitions, connection exception, credential, URL, host or
database/role-specific error detail. Map SQLSTATE classes internally, never print
driver messages. Unknown faults become a fixed execution/storage failure. Runtime
always collapses reasons to its existing generic error.

## Acceptance evidence and boundaries

Failing TypeScript tests first, then prove both reviewed independent orders have
identical validated schemas; dependency ordering; missing/cyclic dependencies;
repeat/concurrent execution; schema+ledger rollback; changed hashes/collisions;
unknown and known-but-unapproved additions; actual constraint/index/trigger/
function/grant/RLS incompatibilities; immutable legacy rows and retained data;
older required profile on approved newer DB; read-only runtime and generic HTTP
failure. Use only restricted-role owned random disposable databases. Keep real
Google fixture boundaries and no paid provider calls. Run all repository checks
listed in the plan; record actual counts/exits and independent reviews. No UI
feature is added; existing browser menu checks at mobile/desktop cover regressions.
No shared/hosted migration, deployment, push or merge is authorized.

## Implementation review amendments

Independent reviewer approved the bounded connection interface amendment: unbound
`all`/`one` are read-only and use their own bounded REPEATABLE READ transaction;
unbound `execute` uses the existing advisory-locked bounded write transaction.
Explicit client-bound calls retain the surrounding transaction, including
INSERT RETURNING. SET LOCAL search_path is `pg_catalog, public, pg_temp`; no
unsupported startup `options` parameter is sent to Neon pooled connections.
Only reviewed explicit migration SQL temporarily uses `public, pg_catalog,
pg_temp` so unchanged historical unqualified CREATE statements target public;
preflight/final validators restore catalog-first resolution.

Object-owner binding is `mp_migrator` in supported deployments. `mp_test` is
normalized only for random owned `mp_test_<24 hex>` fixture databases. Hosted
schema/database bootstrap ownership stays separate (including neondb_owner or
pg_database_owner); schema USAGE is pre-provisioned, never changed by the
migration owner tool. Runtime database CREATE is forbidden. Existing PUBLIC
TEMP privilege can remain; explicit pg_temp-last lookup prevents temp shadowing.
Supported current profiles forbid user routines, triggers, policies, rewrite
rules, domains/enums, operators, collations, conversions, extended statistics,
text-search objects and other user schemas. Supporting such future objects
needs an explicit validator/profile amendment, rather than a broad allowlist.

Legacy rows contain only historical ID/hash/timestamp; no descriptor digest is
backfilled. Their dependency/identity semantics come from reviewed immutable
source mappings; the database cannot attest to metadata never recorded there.
Native records persist descriptor digests and reject changed descriptors.

The older requirement profile is a compatible application with the semantic
curation backport, not an arbitrary older binary. Pre-curation weekly generation
and suggestion acceptance read pending placeholders unless the reviewed current
curation-aware filters are backported too. The regression uses current compatible
application operations while omitting0004 from required migration IDs and proves
unready links remain excluded from meals/suggestions. Trust approval must include
those semantic behaviors and truthful menu presentation, not just SQL catalogs.

`db:check` is a separately approved read-only operator entrypoint using the same
validator with closed sanitized diagnostics. Public HTTP continues to return only
existing generic error messages; restarts against a tampered ledger exercise
session, home and both menu surfaces without exposing reason codes or repairing
history. Denied-write privilege probes run only on owned disposable databases;
shared diagnosis uses only read-only connections.
