# Hosted permission correction — developer verification

2026-11-24. Source58534f5. Status: full local tests/build/browser verification passed;
full lint is pending relocation of private operator instrumentation, with hosted
read-only recheck, final code review and refreshed packaging tracked separately.

The shared typed policy is called with actual catalog-derived context and rows
inside the existing bounded transaction. The only schema/security behavior
change replaces the blanket membership/default-ACL predicates with the reviewed
finite platform baseline. Runtime role flags and actual object/column/schema/
effective ACL checks remain independent. No runtime caller/environment override,
SQL migration, descriptor/checksum edit, actual grant or hosted write is added.

Actual focused results before source handoff:

- `node --import tsx --test tests/migrations/platform-permissions.test.ts`:
  26 passed,0 failed/skipped, exit0.
- `pnpm run test:migrations`:62 passed,0 failed/skipped, exit0; includes unchanged
  owned-database malicious ACL/default/schema/ledger and non-disclosure tests.
- `pnpm run typecheck`:exit0; generated routes and strict checking passed.
- Focused ESLint on both changed library files and new policy test:exit0.
- Full lint initially stopped on a private operator helper under `.data/` using
  CommonJS imports. That helper is not release source; root is relocating it,
  and full lint must pass without a suppression or weakened application check.

Red-first evidence is in `hosted-permission-red-evidence.md`. Positive pure tests
are not claimed to have manufactured Neon roles on local PostgreSQL. Negative
single-binding cases cover real baseline rows and empty arrays; provider signals
cannot fall through to the normal empty policy. Malformed arrays/fields and
unknown fields reject. Normal generic database names retain the prior empty
contract, and managed-creator non-owner defaults remain prohibited.

Broad results and any review-driven corrections will be appended truthfully
before implementation completion. Existing e4 packaging evidence remains
historical and cannot certify this changed source or a deployment.

## Full local results on corrected source58534f5

| Command | Actual result |
| --- | --- |
| `pnpm run typecheck` | Exit0; strict checking passed |
| `pnpm run build` | Exit0; metadata verification and production compilation passed |
| `pnpm run test:migrations` |62 passed,0 failed/skipped, exit0 |
| `pnpm run test:family` |34 passed,0 failed/skipped, exit0 |
| `pnpm run test:menu` |69 passed,0 failed/skipped, exit0 |
| `pnpm run test:plans` |23 passed,0 failed/skipped, exit0 |
| `pnpm run test:auth` |16 passed,0 failed/skipped, exit0 |
| `pnpm test` |84 passed,0 failed/skipped, exit0 |
| `node --import tsx --test tests/deployment/*.test.ts` |33 passed,0 failed/skipped, exit0 |
| `python3 -m unittest discover -s tests` |7 passed,exit0 |
| `node --import tsx tests/menu/browser.ts` | Exit0; existing real-Chrome menu QA passed |
| `node --import tsx tests/auth/browser.ts` | Exit0; authentication/T-Rex QA passed at all five widths |

Total321 Node tests and7 Python tests. The family/menu/plans/auth/deployment
suites ran sequentially after the successful production build. All application
fixtures used owned disposable databases and restricted runtime credentials;
Google/search were test transports, paid keys stayed empty. No hosted role,
default ACL, migration, schema or business data was changed by this engineer.
Private detailed logs are retained under `.data/dependency-hosted-*.log`.

Both existing Chrome scripts passed without code changes. The auth/T-Rex result
records widths320/390/768/1024/1440, no horizontal overflow, all game/search/
notebook/logout/mock-Google checks, exactly10 intentional fixture429 errors and
no unexpected console/network errors. Menu QA retained save/reload/duplicate/
retry/removal/focus/photo/pagination/session-loss coverage at390/1440 and dialog320.
Eight representative new images plus sanitized auth result and SHA256 manifest
are in `org/reviews/dependency-aware-migrations-hosted-correction-browser/`.
Nineteen historical menu PNGs were backed up before QA and restored hash-exact.
Manual inspection of new mobile running-game and desktop menu captures confirms
readable unchanged responsive layouts, safe literal text/photo fallbacks and the
preserved shorter T-Rex surface. Earlier broader UI evidence remains untouched.

Independent security review source58534f5 is recorded in commit77780dc, including
26 policy tests,87 mutation probes and5 disposable integration tests. It is
separate from the engineer's321-test result. Final code review and hosted
read-only revalidation are root-owned evidence, not assumed passes here.
Full root lint must pass after its private CommonJS inspector is relocated;
application checks were not suppressed to hide that instrumentation failure.
