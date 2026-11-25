# Attribute normalization — focused checkpoint

2026-11-25. Status: focused code/test checkpoint ready for root's complete
hosted read-only check; full application/Chrome verification and final source
reviews still pending. No release/deployment readiness is claimed.

The production validator reads attoptions and actual pg_class.reltype<>0 from
catalogs and calls the same strict helper exercised by TypeScript tests. Only
the old blanket attoptions predicate is replaced. Existing identity/generated/
collation, complete schema, ledger, owner, relation/index/constraint/function/
trigger/rule/RLS and permission checks remain in place. No provider label or
environment/caller bypass selects normalization, and no catalog is modified.

Actual focused results:

- Pure attribute-option suite:6 passed,0 failed/skipped, exit0. Accepted decimal
  cases include9007199254740993 and uint64 maximum18446744073709551615; maximum+1
  and final LF/CRLF/U+2028/U+2029 reject without Number rounding/whitespace parsing.
- Owned-database targeted option/collation/constraint security cases:4 passed,
  0 failed/skipped, exit0. Real n_distinct=42 still rejects both runtime and
  migration use without repair. No elevated fixture or catalog write created
  pg_attver on the older local server.
- Focused ESLint on the changed library/helper/test:exit0.
- `pnpm run typecheck`:exit0 with route generation and existing strict settings.

The first typecheck identified unknown-value narrowing and an ES2017-target
BigInt-literal issue. A declared never-returning error function and BigInt's
bounded decimal constructor resolved those errors; compiler settings and vendor
types were not relaxed. Red-first evidence is in
`attribute-options-red-evidence.md`. Root's actual patched hosted observations
and pure shape proof remain separate evidence classes.

Broad test/build/browser results and complete hosted-validator outcomes will be
recorded only after execution. Historical SQL, journal, checksums, descriptors,
actual grants and T-Rex/application behavior are unchanged.
