# Attribute option normalization — red-first evidence

2026-11-25. Before runtime behavior changes, root's complete bounded read-only
validator rejected both hosted targets with incompatible-schema. The concrete
remaining predicate was blanket rejection of attoptions: all61 ordinary public
table columns carried one canonical positive pg_attver marker, while the exact
schema signature, collations, identity/generated state and other security checks
matched. See the approved `attribute-options-amendment.md`; no catalogs changed.

The new strict TypeScript `attribute-options.test.ts` was written first. Its
initial command exited1 with MODULE_NOT_FOUND for the not-yet-implemented shared
production helper (`.data/dependency-attribute-red.log`). This API-absence red
proof is distinct from the actual hosted validator rejection reported by root.

A separate real owned-database regression was also added before behavior edits:
`node --import tsx --test --test-name-pattern='ordinary column option' tests/migrations/security.test.ts`
passed1/1, exit0. It applies n_distinct=42 through ordinary DDL on the owned test
table and confirms both strict runtime and explicit migration validation reject
without repair. That negative must remain passing after normalization. No
system-catalog write, elevated fixture or hosted mutation manufactured pg_attver.

The new pure cases include NULL/empty arrays on both known relation classes,
uint64 boundaries and values beyond Number's exact range, non-row-type rejection,
full-string LF/CRLF/Unicode-line-separator traps, zero/leading zeros/signs/
whitespace/hex/exponents/overflow/long inputs, unknown/mixed/duplicate options,
sparse/nested/non-string arrays, extra string/symbol/non-enumerable properties,
array subclasses/accessors and missing/nonboolean relation bindings.
