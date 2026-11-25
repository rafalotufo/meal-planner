# Internal attribute metadata — independent security design review

- Reviewer: security-researcher; 2026-11-25
- Reviewed amendment: `ed07050` (`9faf933` plus upstream row-type binding)
- Artifact: `intent/dependency-aware-migrations/attribute-options-amendment.md`
- Verdict: **Approved for the specified local correction and verification**

## Evidence and trust assessment

The root's read-only diagnosis separates this cause from the prior permission
correction: approved application catalog and ledger safety match, with only the
blanket attribute-options predicate rejecting the server-maintained marker.
I made no hosted call and do not substitute research for that observation.

Independent primary-source research confirms this is core PostgreSQL metadata,
not a guessed provider exception. The [PostgreSQL17 catalog documentation](https://www.postgresql.org/docs/17/catalog-pg-attribute.html)
identifies the reserved internal option. The pinned upstream
[attribute-version design](https://github.com/postgres/postgres/blob/2a9b6b5d4af701bb0c1ad2fd827bdefb25364782/src/backend/catalog/README.attver.md)
explains per-attribute WAL-LSN versioning for safe composite-tuple interpretation.
It is physical bookkeeping, not stable migration identity. The
[security backpatch announcement](https://www.postgresql.org/message-id/E1xQQG1-000000003jI-2cdw@gemulon.postgresql.org)
explicitly describes external tools rejecting attribute options as a compatibility
problem and says user-supplied ALTER values are ignored.

I also fetched upstream source directly because a web cache served older file
content. At the pinned revision, [reloptions.c](https://github.com/postgres/postgres/blob/2a9b6b5d4af701bb0c1ad2fd827bdefb25364782/src/backend/access/common/reloptions.c)
reads the internal version as whole-string unsigned decimal and emits canonical
unsigned decimal for a nonzero version; zero removes the marker.
[xlogdefs.h](https://github.com/postgres/postgres/blob/2a9b6b5d4af701bb0c1ad2fd827bdefb25364782/src/include/access/xlogdefs.h)
defines the64-bit unsigned LSN and invalid zero. This justifies the proposed
positive uint64 bound and distinguishes emitted form from looser parser inputs.

## Approved policy boundary

NULL/empty options preserve the no-options contract. A nonempty value must be
one exact canonical `pg_attver` string, within the unsigned64 bound, and bound to
an actual row-typed relation by independent `pg_class.reltype<>0` metadata.
An index or other non-row-typed relation cannot acquire an exception merely by
presenting that string. No provider label, caller flag or environment override
is needed or approved.

Do not ignore arbitrary `pg_` names or mixed options. Duplicate, malformed,
noncanonical, overflow, signed, whitespace, nested or sparse values fail closed.
Bound length before BigInt conversion and require a true full-string match:
JavaScript regex `$` alone can accept a terminal newline, and BigInt accepts
surrounding whitespace. Missing/malformed row-type binding must not approve a
marker. Unexpected array properties are outside the canonical catalog shape.

All actual columns/types/defaults, identity/generated state, collation, owners,
indexes/constraints, rules/triggers/functions/RLS, migration history and direct/
effective privilege checks remain mandatory. Ordinary user-set options remain
unsupported. This does not clear or alter PostgreSQL's safety marker, disable
its mismatch protection, write a ledger, or make an unexplained schema safe.

## Required proof and gates

Add red-first strict TypeScript cases and exercise the same policy from real
catalog validation. Cover NULL/empty and positive singleton forms, values1 and
UINT64_MAX, zero/overflow and every malformed/mixed form, final line terminators,
unknown keys and false/missing row-type binding. Preserve existing security
regressions and add an owned-database `n_distinct` drift rejection. Do not mutate
system catalogs or elevate the test role to synthesize the internal marker.
Pure positive cases and real patched-hosted read-only observations are separate
evidence classes.

No unresolved design security finding remains. Exact-source implementation
review, required checks, full hosted read-only revalidation and refreshed
same-source packaging/staging remain necessary. This approval does not establish
hosted readiness or authorize a migration, grant, main merge or deployment.
