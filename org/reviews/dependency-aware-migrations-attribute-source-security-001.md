# Internal attribute metadata — independent source security review

- Reviewer: security-researcher; 2026-11-25
- Reviewed exact source: `25aaa9b`
- Design/security basis: `ed07050`, independent security design `3c81236`
- Verdict: **Source correction approved; no unresolved security finding**

## Implementation assessment

The delta replaces only the blanket rejection of non-NULL attribute options.
`lib/db/security.ts` obtains each actual public attribute's options and whether
its relation has a row type, using `pg_class.reltype<>0` in the existing bounded
catalog-validation transaction. The same pure `validateAttributeOptions` called
by unit tests is invoked with these real catalog values. No caller, environment
or provider flag supplies a trusted row-type assertion.

`lib/db/attribute-options.ts` requires a boolean relation binding even for empty
options. NULL and an exact ordinary empty array preserve the no-options shape.
The nonempty case is one ordinary array data element containing a canonical
positive `pg_attver` uint64 on a row-typed relation. Own-key and data-descriptor
checks reject sparse/accessor/nested/extra-property/subclass shapes before
reading an accessor. A30-character bound precedes BigInt conversion. The regex
match must equal the complete string, preventing JavaScript's terminal-newline
`$` behavior from admitting whitespace which BigInt would otherwise accept.
Unsigned overflow, zero, signs, leading zeroes, unknown keys and mixed/duplicate
options remain rejected with the sanitized incompatible-schema reason.

The accepted option is documented upstream physical version metadata, not an
application option or schema/migration identity. Its changing WAL position is
not pinned as a portable checksum. This does not clear or modify a marker,
disable PostgreSQL's tuple-safety checks, or infer arbitrary SQL compatibility.
Primary-source semantics and the immutable upstream source revision are recorded
in the independent design review and amendment.

The existing identity/generated/collation checks remain intact. Exact catalog,
ledger, owner, constraint/index state, function/trigger/rule/RLS and actual/
effective ACL checks are unchanged. The previously reviewed exact hosted role/
default-ACL policy is unchanged. No SQL migration, grant, role/configuration,
application data or ledger write is added.

## Independent executed evidence

Against the frozen helper/integration:

- `node --import tsx --test tests/migrations/attribute-options.test.ts`:
  **6 passed,0 failed**, exit0.
- Additional deterministic pure probes: **129 canonical uint64 values accepted**
  (including UINT64_MAX), and **1540 noncanonical/context/shape variants rejected**.
  These include terminal whitespace and line separators, a million-digit value
  and an accessor which was verified never to execute. The probed helper bytes
  equal the frozen candidate.
- An additional owned disposable database probe set `n_distinct=42` on an
  existing text column. Both strict runtime validation and explicit migration
  rejected it. The option remained present and the historical ledger remained
  unchanged after rejection; the fixture was cleaned up. This independently
  confirms that ordinary option drift is not hidden by normalization.

The committed real ordinary-option regression was written before behavior
changes in `7c476bc`. No system-catalog mutation or elevated test role was used
to fabricate an internal marker. Pure positive tests and real patched-server
observations remain distinct evidence classes.

## Operator-hosted receipt, separately attributed

The orchestrator reports full strict read-only validation of exact source
`25aaa9b` passing on both recorded targets on2026-11-25:
Preview at13:30:22.205Z and Production at13:30:25.226Z. The receipt reports five
reviewed historical migrations, no native ledger, and successful complete schema,
permission and attribute checks inside bounded read-only transactions, with no
hosted write. This is the operator's observation, not an independently executed
hosted test by this reviewer. I made no hosted connection.

## Remaining gates

This is source/security approval, not Production deployment authority. The full
fresh suite/build/browser evidence, clean exact-source upload packaging and
same-SHA isolated staging must be completed and attributed truthfully. Owner
acceptance of concrete source, scope and staging gaps, main merge and separate
Production/recovery authority remain governed by the release plan. Earlier audit
HEADs or previous release approvals cannot certify or authorize this source.
