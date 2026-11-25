# Attribute normalization — final corrected-source verification

2026-11-25. Fixed source25aaa9b0d8b948bc6f24710214c9eaefe0ee8dcb.
Status: full local and clean upload-only verification passed; root's complete
read-only checks also passed both hosted targets. Main merge, staging and
Production gates remain separate; no deployment readiness is implied by tests.

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

The focused checkpoint above preceded the executed final checks below. Historical SQL, journal, checksums, descriptors,
actual grants and T-Rex/application behavior are unchanged.


## Actual final command results for fixed source25aaa9b

| Command | Actual result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Exit0; exact pins/lock unchanged |
| `pnpm run lint` | Exit0; no errors or warnings |
| `pnpm run typecheck` | Exit0; generated routes and strict TypeScript passed |
| `pnpm run build` | Exit0; reviewed metadata and production compilation passed |
| `pnpm run test:migrations` |69 passed,0 failed/skipped, exit0 |
| `pnpm run test:family` |34 passed,0 failed/skipped, exit0 |
| `pnpm run test:menu` |69 passed,0 failed/skipped, exit0 |
| `pnpm run test:plans` |23 passed,0 failed/skipped, exit0 |
| `pnpm run test:auth` |16 passed,0 failed/skipped, exit0 |
| `pnpm test` |84 passed,0 failed/skipped, exit0 |
| `node --import tsx --test tests/deployment/*.test.ts` |33 passed,0 failed/skipped, exit0 |
| `python3 -m unittest discover -s tests` |7 passed, exit0 |
| `node --import tsx tests/menu/browser.ts` | Exit0; full existing real-Chrome menu flows passed |
| `node --import tsx tests/auth/browser.ts` | Exit0; existing real-Chrome auth/T-Rex flows passed at five widths |
| `git diff --check` | Exit0 |

Total328 Node tests plus7 Python tests. The migration/family/menu/plans/auth/
deployment suites ran sequentially after the completed production build. Tests
used restricted-role owned disposable databases, isolated servers/profiles and
empty paid-provider keys. No application source changed after the fixed source
commit. Detailed private logs remain ignored under `.data/dependency-attribute-*.log`.

Both Chrome suites completed without script/test weakening. Menu QA covered
save/reload/duplicate/retry/removal/focus/pagination/literal text/photo fallback
and session/family loss, with390/1440 layouts and dialog320. Auth/T-Rex passed
at320/390/768/1024/1440 with all game/search/notebook/logout/mock-Google checks,
no overflow, exactly10 intentional fixture429 messages and no unexpected console/
network errors. No real Google login or paid LLM call was performed; the existing
publisher photo remains a normal HTTPS image check, not provider grounding.

Eight representative new PNGs, sanitized auth result JSON and a SHA256 image
manifest are in `org/reviews/dependency-aware-migrations-final-candidate-browser/`.
Nineteen historical menu PNGs were privately backed up before QA and restored
hash-exact afterward. Manual inspection of new mobile-menu and desktop-running-
T-Rex images confirms readable unchanged responsive layouts, photo fallback and
the preserved short game surface. Earlier review images remain untouched.

## Complete hosted validation and independent review

Root's actual complete read-only validator passed Preview and Production for
this exact source, with five unchanged legacy migrations, no native ledger and
matching catalog/history snapshots. Exact timestamps and receipts are recorded
in `hosted-runtime-preflight.md` (d51781c). This is actual catalog-backed positive
proof, separate from pure marker-shape tests and local fixtures. No hosted
column option, role, grant, default ACL, schema, ledger or business row was changed.

Independent source security review is
`org/reviews/dependency-aware-migrations-attribute-source-security-001.md` (6c70e99).
Code-only approval is
`org/reviews/dependency-aware-migrations-hosted-source-001.md` (2ba20b0), including
an independently killed uint64-guard mutant. Final evidence review follows this
committed test/packaging handoff; it is not a human merge or release approval.

## Fresh exact-source packaging and operational boundary

`release-packaging-25aaa9b.md` and `release-upload-manifest-25aaa9b.json` record
126 verified upload files/738556 bytes, exact Git/CLI SHA1 and SHA256 matches,
and a fresh upload-only frozen install/production build without private env,
operator/test/audit state. All126 source hashes remained unchanged afterward.
Fresh production audit exits1 for the same single moderate esbuild tooling
finding, with zero high/critical; its existing reviewed deferral remains explicit.
No package upgrade, override or suppression was used.

Main/Production are unchanged by this engineer. Root must obtain the concrete
new-source main-merge approval before truthful use of its main-qualified stable
staging lane, then collect same-SHA staging evidence/gap acceptance and separate
Production candidate/promotion/recovery authority. Later audit HEADs must never
replace fixed source25 in upload attribution. No migration, grant, catalog write,
paid effect, deployment, push or merge was performed in this verification.
