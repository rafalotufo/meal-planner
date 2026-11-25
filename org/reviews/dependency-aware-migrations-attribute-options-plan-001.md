# PostgreSQL internal attribute metadata — independent plan review

- Reviewer:reviewer; date:2026-11-25; independent of amendment writer.
- Reviewed amendment:`intent/dependency-aware-migrations/attribute-options-amendment.md` at `9faf933e86071574851179209d68d64dfde1da69`.
- Verdict:**Approved for the narrow local implementation and verification; release readiness remains unestablished.**

## Bugs and compatibility

No blocking findings. The actual full-validator failure is isolated to attribute
options; matching structural signatures alone did not waive security validation.
The [PostgreSQL17 catalog documentation](https://www.postgresql.org/docs/17/catalog-pg-attribute.html)
identifies pg_attver as internal metadata. I independently inspected the
[REL_17_STABLE implementation](https://raw.githubusercontent.com/postgres/postgres/REL_17_STABLE/src/backend/access/common/reloptions.c):
its reader parses an unsigned64 decimal; its setter removes the zero sentinel
and emits canonical decimal for a nonzero value. The
[attribute-version design](https://raw.githubusercontent.com/postgres/postgres/REL_17_STABLE/src/backend/catalog/README.attver.md)
explains that the value derives from WAL position and protects tuple descriptor
compatibility. Exact value equality across databases or application orders
would therefore confuse physical metadata with application schema identity.

NULL/empty options and one canonical positive pg_attver decimal bounded to
unsigned64 are a finite documented contract. Validate length before numeric
conversion and preserve exact integer precision; Number coercion cannot enforce
the upper boundary. Reject zero, leading zeros, malformed/null elements, mixed
or duplicate options and every unknown name. Boundary regressions must include
18446744073709551615, overflow and an exact value above Number's safe integer
range. No provider/context switch is needed for upstream core metadata.

## Security and compliance

The amendment preserves the PostgreSQL safety mechanism: it does not clear its
marker, change server settings or modify catalogs. Ordinary options, including
n_distinct, remain unsupported; a real owned-database mutation must prove that
boundary. Pure tests exercise the production helper, while actual hosted
read-only validation supplies separate integration evidence unavailable on an
older local server. No role elevation or shared/hosted fixture mutation follows.

Keep identity/generated/collation checks and every existing catalog, permissions,
history and immutable-checksum rule intact. This is narrowly attributable
normalization, not permission to ignore pg_-prefixed options generally. Source585
remains intermediate: independently review the final source, rerun the full
required checks and both strict hosted validators, then regenerate packaging and
exact-source staging evidence. Any further unknown metadata still blocks.

This approval crosses no main merge, deployment, hosted migration/configuration,
paid-provider or Production gate. Fresh owner acceptance of the final source,
concrete staging profile/gaps and bounded Production/recovery scope remains
required under the governing release plan.
