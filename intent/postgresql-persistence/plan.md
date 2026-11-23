# PostgreSQL implementation plan

- Status: Approved
- Approval: Independent peer review under org/protocol.md; org/reviews/postgresql-design-001.md.
- Base: 17318251dbe671a0bdd2570100091f024673c158.

1. Preserve completed family loop state/history and graph snapshot under org/archives/postgresql-predecessor; capture new intent/spec/plan and independent product/design review. Initialize new bounded workflow with new artifact paths; never fabricate human approvals.
2. Prove exact stable pg driver and Drizzle compatibility under existing strict checks; record evidence and review the resulting query-layer decision. Install Homebrew postgresql@17 and set up dedicated native on-demand cluster, roles/database/secrets. Verify loopback, durable volume, restricted runtime, test isolation, stop/start.
3. Write failing PostgreSQL storage tests, implement URL/pool/transaction/migration/catalog modules and PostgreSQL SQL/journal. Prove migration atomicity, tamper denial and clean rollback. Retain original SQLite migration evidence.
4. Convert identity/family/invitation services and callers to async bound SQL on PostgreSQL with locked transactional decisions. Port existing test assertions/fixtures (including SQL triggers and backup/restore) to PostgreSQL. Add concurrency/privilege and timeout cases.
5. Run strict checks/build and all real PostgreSQL regression suites. Verify fixture-only Chrome auth/family/recipe flows at mobile/desktop, preserving historical screenshots. Review code/security independently, resolve findings, record actual evidence and final workflow state. Stop at human merge/release gates.

## Files that change

- intent/postgresql-persistence/**
- org/archives/postgresql-predecessor/**
- org/reviews/postgresql-*
- org/messages/**
- org/memory/**
- org/loop/**
- org/status.yaml
- gates/ledger.jsonl
- workflow-graph.yaml
- AGENTS.md
- README.md
- .env.example
- .gitignore
- .vercelignore
- next.config.ts
- package.json
- pnpm-lock.yaml
- pnpm-workspace.yaml
- lib/db.ts
- lib/db/**
- lib/identity-access.ts
- lib/family-store.ts
- lib/invitations.ts
- lib/auth.ts
- lib/session.ts
- app/onboarding/page.tsx
- app/family/page.tsx
- app/api/family/**
- app/api/invitations/accept/route.ts
- app/api/onboarding/provision/route.ts
- drizzle/postgresql/**
- scripts/migrate-db.ts
- scripts/postgres-*.ts
- tests/family/**
- tests/auth/**

## Risks and proof

SQL dialect, bigint/alias conversion and async propagation require strict compile plus real HTTP behavior. Global advisory lock intentionally retains existing serial mutation semantics; contention must return 503 and leave no partial writes. Pool release/rollback must hold after failure. Test infrastructure must refuse dev/remote cleanup targets. No real keys copied from source env. Drizzle failure is recorded rather than hidden. Credentials are never printed or passed in arguments. Private native cluster persists through pg_ctl stop/start, never automatically removed. Existing production and audit records remain untouched.

Verification commands: pnpm install --frozen-lockfile; pnpm run lint; pnpm run typecheck; pnpm run build; pnpm test; pnpm run test:auth; pnpm run test:family; node --import tsx --test tests/deployment/smoke.test.ts; python3 -m unittest discover -s tests; fixture browser scripts; python3 scripts/scan_secrets.py --staged. Actual outcomes belong in org/reviews/postgresql-verification.md.

## Execution notes

Independent review fixes stayed within this manifest: transaction-local pooler-safe timeouts, standard Neon endpoint-pair validation, duplicate TLS-option denial, trigger/function/RLS catalog coverage, atomic private config writes, and isolated Chrome processes between production/development QA. No application UI/provider behavior changed. Setup uses native Homebrew per owner update, with no Docker dependency. Full evidence: org/reviews/postgresql-verification.md.
