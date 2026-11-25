# Hosted permission correction — developer verification

2026-11-24. Status: focused implementation verified; full exact-source checks,
independent source review, hosted read-only recheck and refreshed packaging pending.

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
