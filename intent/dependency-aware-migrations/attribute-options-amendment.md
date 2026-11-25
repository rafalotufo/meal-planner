# Internal PostgreSQL attribute-version metadata amendment

- Date:2026-11-25; status:draft for independent code/security design review.
- Intermediate permission-corrected source:`58534f5` (not a release candidate).
- Applies to the existing hosted correction/release plan, not a new migration.

## Actual read-only result

Both hosted targets now pass the corrected role/default-privilege policy, but
the full validator reports incompatible-schema. Splitting its existing static
security predicates read-only establishes: complete catalog signature matches
the reviewed schema exactly; ledger safety passes; no unknown schema, function,
operator, type, extension, rule, policy, trigger, constraint, index or relation
state/owner/options exists. Only the attribute-options branch fails. All61
ordinary public table columns have a singleton `pg_attver=<positive decimal>`;
identity/generated fields are empty and every collation matches its type.
No database object, option, grant or application row was changed to diagnose it.

An initial provider-specific hypothesis was rejected by primary-source research.
This is upstream PostgreSQL internal metadata introduced by a security backpatch,
not a user-authored Neon schema effect:

- [PostgreSQL17 pg_attribute catalog](https://www.postgresql.org/docs/17/catalog-pg-attribute.html)
  documents internal pg_-prefixed options, specifically pg_attver, which cannot
  be set through ordinary DDL.
- [Official attribute-version design](https://raw.githubusercontent.com/postgres/postgres/REL_17_STABLE/src/backend/catalog/README.attver.md)
  describes WAL-LSN-based per-attribute tuple-version safety, durable across
  rollbacks. New attributes and type alterations get new versions; instances and
  application orders can have different physical values without schema drift.
- [Official implementation](https://raw.githubusercontent.com/postgres/postgres/REL_17_STABLE/src/backend/access/common/reloptions.c)
  `attoptions_get_version` parses an unsigned64 decimal with whole-string/range
  checks. `attoptions_set_version` removes an invalid zero version and otherwise
  formats canonical unsigned decimal using `%llu`.
- [Official security backpatch announcement](https://www.postgresql.org/message-id/E1xQQG1-000000003jI-2cdw@gemulon.postgresql.org)
  explicitly notes external compatibility problems with applications that reject
  any attribute options. It says ALTER-supplied pg_attver is ignored. Do not
  clear, overwrite or disable this PostgreSQL safety metadata.

## Narrow validated normalization

Add a small pure validator invoked with actual catalog `attoptions` rows inside
the existing bounded validation transaction. Accept NULL or an empty array for
the pre-existing no-options shape. Otherwise accept only a singleton string
`pg_attver=` followed by canonical positive ASCII decimal, at most20digits,
numeric value at most18446744073709551615 (unsigned64). Zero is not emitted by
the setter: it removes the marker instead. Reject duplicate markers, malformed
arrays/elements, leading zeros, signs, whitespace, exponent/hex/LSN notation,
overflow, unknown options and arbitrary pg_-prefixed names. No environment,
database/provider label or caller-supplied bypass activates normalization.

This validates a documented physical safety marker without making its
instance-specific WAL position a migration checksum or schema identity. Keep
the separate exact catalog, identity/generated/collation, index/constraint/
trigger/function/rule/RLS/owner, platform-permission and actual/effective ACL
checks unchanged. User-directed options such as n_distinct remain unsupported
and fail closed. No SQL migration, ledger write, grant, database configuration,
data import or catalog mutation is authorized or required.

## Test-first proof and release impact

Before behavior changes, add strict TypeScript red cases demonstrating that the
existing blanket check rejects the observed singleton marker. Use the same
pure validation helper in production and test all accepted/denied shapes,
unsigned64 boundaries and bounded malformed inputs. Keep real owned-database
collation, identity/generated and unsafe-option checks. Add a real owned-table
`n_distinct` mutation proving ordinary option changes still reject. Do not
modify system catalogs or elevate the restricted test role to manufacture
pg_attver on an older local PostgreSQL build; pure shape tests plus the actual
patched hosted read-only observations are separate evidence classes.

Implementation manifest: focused attribute-option policy module if needed,
`lib/db/security.ts` catalog-fed integration, `tests/migrations/**`, feature
specification/plan/setup evidence and org audit. No other application behavior
changes. Independent code/security review precedes a new frozen source.
Rerun lint/typecheck/build and all application/migration/workflow checks and
applicable Chrome verification. Recheck both hosted databases read-only through
the complete actual validator. Any further unexpected field still blocks.

Source585 and its packaging are intermediate evidence only. The final corrected
SHA needs a new clean upload inventory/build, same-SHA isolated staging and owner
acceptance of actual scope/gaps, main merge and Production/recovery authority
under the governing plan. Production remains on AeQV/d26 with no changes.
