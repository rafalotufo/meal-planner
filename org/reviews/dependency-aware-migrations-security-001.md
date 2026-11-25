# Dependency-aware migrations — independent security review

- Reviewer: security-researcher; 2026-11-24
- Source: `ef5d85e` (implementation `84e5136`, CLI correction `986531a`, ledger-exclusion correction `ef5d85e`)
- Scope: migration graph/source loading/history, runtime compatibility/security validation, explicit commands, fixture boundaries and adoption documentation
- Verdict: **Approved for the reviewed local implementation; no unresolved blocking security finding**

## Trust and integrity assessment

The reviewed graph binds UUID identities to source hashes, dependencies and
legacy aliases, rejects collisions/missing dependencies/cycles, and requires
explicit descriptor-bound independence for every incomparable approved pair.
Finite exact applied-set catalogs remain separate from the history decision.
Legacy ledger tuples are not rewritten or backfilled; new native identities
record their checksum and descriptor digest only after execution. Legacy
dependency immutability also depends on reviewed source because the original
ledger never persisted descriptor metadata. This limitation is documented.

`lib/db/migrate.ts:21` acquires the existing transaction advisory lock before
history decisions. Ledger relation safety and the actual preflight profile are
validated before pending SQL. SQL, matching ledger records, approved grants and
final effective runtime privilege checks use the same bounded transaction.
Existing dangerous grants are rejected rather than repaired. Owner tooling
identity and required target-role privileges are distinct checks. The known
hosted separation of table migrator from database/schema bootstrap owner is
preserved in source without contacting hosted resources.

`lib/db/validation.ts:58` validates ledger relation metadata before row reads,
preventing a view or forced-RLS ledger from executing unreviewed expressions.
The corrected native-ledger exclusions at line52 require verified presence and
exact catalog kind/name membership; quoted or dotted lookalikes remain visible.
The separate ledger contract checks its exact columns, primary key and index.

`lib/db/security.ts:5` enforces the runtime principal, privileged-role flags,
membership in both directions, expected object/schema ownership, direct and
effective table/column grants, grant options, database/schema CREATE privileges,
default ACLs and required runtime access. It rejects unsupported routines,
triggers, rewrite rules, policies, types and additional security-bearing object
classes, altered collation, invalid constraints/indexes and RLS state. The
current finite profiles approve ordinary tables/indexes only; supporting another
object class requires an appropriately extended reviewed validator/profile.

`lib/db/connection.ts:39` makes standalone reads use a bounded repeatable-read
READ ONLY transaction; explicit writes use the existing guarded transaction.
Transaction-local `pg_catalog,public,pg_temp` ordering protects application reads
without unsupported pooled startup options. Runtime defaults remain strict;
owner tooling is explicit. Runtime imports bundled metadata rather than SQL or
migration execution code. Verified remote TLS, separate credentials and generic
public storage errors remain intact. The explicit CLI distinguishes a committed
migration from a later credential/connectivity smoke failure without printing a
raw driver error.

## Findings resolved with independent evidence

- `security-researcher-0029`: an unreviewed DELETE rewrite rule originally passed
  validation and silently retained a menu entry after DELETE. I reproduced that
  behavior on an owned database. The added `pg_rewrite` rejection and ledger
  safety checks now reject the same rule in runtime and explicit migration.
- `security-researcher-0030`: a unique index named
  `"__app_migrations.hidden"` originally disappeared through a blanket prefix
  exclusion, silently limiting each family to one menu recipe. I reproduced the
  bypass. Correction `ef5d85e` excludes only verified exact ledger members. I
  independently repeated the quoted-index attack with native ledger both absent
  and present; both runtime and migrator rejected it. A normal native migration
  and runtime validation succeeded before mutation. Exact absent-ledger PK-name
  and quoted-table lookalikes also have regression coverage.

Both versioned findings are closed with concrete correction evidence.

## Executed independent verification

`node --import tsx --test tests/migrations/*.test.ts` against the final reviewed
source: **36 passed, 0 failed**, exit0, approximately11.2seconds. This includes
legacy convergence/order preservation, native dependencies/concurrency/rollback,
identity/checksum failures, actual function/trigger/rule/constraint/RLS/ACL drift,
ledger-view sequence protection, older compatible application operations,
temporary shadow protection and sanitized pre/postcommit diagnostic commands.
The initial run exposed a Gmail-only fixture mismatch; a later run exposed a
restricted-role backend-disconnect cleanup race. Those fixture corrections were
reviewed and the final suite completed successfully without elevated roles.

Additional independent owned-database probes passed:

- Actual invalid-password and closed-loopback-port driver failures produce only
  sanitized permission/connection reasons; runtime reports only its generic
  storage error. Raw error messages, credentials, host and role are not printed.
- A trigger using only a built-in PostgreSQL function is rejected independently
  of the routine-presence check.
- Table ALL privileges (including PostgreSQL17 MAINTAIN), column REFERENCES and
  a custom text-search configuration are rejected by runtime and migrator.
- The corrected rewrite-rule and both native-presence quoted-index variants
  described above are rejected.

All additional probe databases were cleaned up. One earlier suite cleanup
failure did not identify its generated name, so I have not guessed and deleted
other agents' databases; the orchestrator retains that temporary-fixture cleanup
limitation. No shared application data was changed by these tests.

## Limits and gates

Source-controlled SQL and compatibility metadata remain trusted, reviewed code;
this is not a sandbox for arbitrary malicious SQL or a proof against a trusted
administrator changing data. Future migrations must be transaction-safe and
receive effect/security review and exact combination evidence. A checksum from
the database cannot approve itself. Pre-curation application binaries also need
the documented curation-aware semantic backport, not metadata alone.

This assessment does not claim hosted runtime validation or authorize a shared
migration, hosted access, deployment, push or merge. The orchestrator records
project-wide build/regression/browser evidence separately and retains the human
merge/release gates. No dependency upgrade or new external service is included.

Cleanup followup: the earlier fixture has now been uniquely identified and
verified read-only. Automatic approval review rejected its DROP before execution;
it remains untouched pending explicit owner cleanup authority. Exact evidence is
in `org/reviews/dependency-aware-migrations-cleanup-001.md`.
