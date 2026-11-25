# Dependency-aware migrations — independent threat model

- Security researcher; 2026-11-24
- Design reviewed: `c00be7b`; independent design approval: `7a08bfe`
- This is design analysis, not an implementation approval.

## Assets and boundaries

Application data, family isolation, admission/session behavior and migration
history must survive branch changes. The owner/migration credential is a trusted
explicit executor. The runtime credential is untrusted for schema administration
and must remain limited to reviewed DML. The restricted test role owns only random
disposable test databases and cannot access development data.

Source-controlled migration descriptors and exact schema/privilege profiles are
the compatibility authority. A database's ledger rows, object definitions and
ACLs are observations to validate, never authority to expand that contract.
Compatibility backports cross the same review boundary as application code;
checksums copied from the database or fetched dynamically cannot authorize them.

## Abuse cases and required defenses

- A branch reuses an ID or edits applied SQL/dependencies: reject conflicting
  aliases/UUIDs/source hashes and native persisted descriptor digests. Preserve
  legacy tuples; legacy descriptor immutability additionally depends on reviewed
  source because the original ledger never stored that metadata.
- An extra migration claims independence while touching a protected object:
  explicit descriptor-bound independence is necessary but insufficient. Validate
  exact actual preflight and final schemas and privilege contracts, including
  security state, before accepting that combined set.
- Pending SQL replaces or repairs an unexplained object: preflight validation
  must reject drift before pending effects; final validation alone is inadequate.
- Trigger, function, policy, weakened constraint, invalid index or widened grant
  changes behavior despite similar table columns: validate all relevant catalog
  state and ACL/effective privileges, and reject unsupported object classes.
- PUBLIC grants, role membership, default grants or column ACLs expand access:
  compare allowed grants and effective target-role privileges; forbid grant
  options, dangerous schema privileges and privileged runtime attributes.
- Search-path or temporary objects shadow application/system names: use fixed
  `pg_catalog,public,pg_temp` ordering on application and validation connections;
  protect managed schemas and reject unsupported user objects.
- Repeated/concurrent application double-executes work or failure leaves a
  half-applied schema: acquire the bounded transaction advisory lock before
  history decisions, execute SQL plus matching ledger insert and final checks
  on one connection, and roll back them together on failure.
- Startup or session reads mutate schema: runtime history/catalog checks use one
  bounded repeatable-read read-only snapshot and never call execution tooling.
- Connection, permission or SQL failures expose credentials/internal catalog:
  operator diagnostics use a closed fixed message set; runtime collapses all
  reasons to its generic storage failure and HTTP never exposes internals.

## Explicit limits

The finite supported combinations require review for each new migration/set.
The validator does not infer general SQL compatibility. A database administrator
with owner/superuser access remains trusted; this contract does not prove data
was never modified by that administrator. An unmodified old binary cannot learn
new trust automatically. No shared/hosted migration, release or deployment action
is implied by implementation or this threat assessment.

Implementation sign-off requires actual code inspection and disposable-database
security mutation evidence, followed by independent review and required checks.
