# PostgreSQL production release

- Status: Approved
- Approval: Independent preparation/release-plan review; org/reviews/postgresql-production-plan-001.md.
- Owner request: Rafael, 2026-11-23: "Lets deploy production using postgres"
- Scope: existing Vercel meal-planner Production, project prj_ntxXnJAVA977jHjLNDR7xJuwSx4V / team_2c0O29FMb91g7L6sUChc9v6J, existing stable origin https://meal-planner-delta-six-55.vercel.app, PostgreSQL project plain-pond-82425009. Preview remains separate.

The request supersedes the previous stop-before-deploy restriction for this release. It does not authorize deleting data, new providers/paid features, importing local user data, broader identity access, or unbounded paid model tests. Preserve human merge and committed release gates; do not reuse old release approvals. Prepare a concrete verified source candidate before any remaining approval request.

## Preparation

1. Recheck live project/environment/deployment and PostgreSQL schema/roles. Establish recovery: preserve current deployment and a consistent private PostgreSQL snapshot/restore proof; never destructive schema rollback after new memberships/grants exist. Reverting to old code loses family enforcement, so fallback scope must be explicit.
2. Integrate already-human-merged main7cbe321 (recipe grid/notebook) into PostgreSQL branch f595330 while preserving family guards. Archive exact conflicting audit records from both tips, reconcile ledger chains with sourced imports, keep completed loop records immutable and active paths consistent. Source family/main worktrees are not modified during preparation. Preserve user's next-env.d.ts development change.
3. Review and implement Vercel Fluid pool lifecycle using official attachDatabasePool guidance, exact stable dependency, unchanged strict compiler. Test the changed connection behavior with real PostgreSQL and existing test-only transports.
4. Run frozen install, lint, strict typecheck, build, all recipe/notebook/auth/family/deployment/Python regressions, fixture Chrome mobile/desktop, audit, secret and plan-sync checks on an isolated clean export/candidate so active user development is not disturbed. Check Vercel upload exclusions and runtime migration/catalog assets.
5. Independent code/security/release review of final candidate, including notebook integration and transactional family guard. Record exact source SHA and approvals. Human merge gate remains explicit; source must be clean/reviewed/merged before deployment under the existing runbook.
6. Record fresh scoped release authorization with source SHA/project/expiry/recovery. Stage Production using --prod --skip-domain, inspect readiness and fail-closed candidate checks without weakening Host/protection. Promote exactly the verified Production artifact only under gate authority. No Preview credentials/config changes.
7. Verify Production anonymous denial, actual Google/family persistence and existing UI at mobile/desktop; never add auth bypass or fake production users. Paid model searches remain separately bounded/authorized; do not infer them from deployment permission where the prior no-paid-call constraint remains. Stop/restore safe traffic state if mandatory verification fails. Record actual results and limits.

## Files that change

- intent/postgresql-persistence/**
- intent/recipe-search-notebook/**
- org/reviews/*recipe-search-notebook*
- org/reviews/recipe-integration-results-*.png
- org/merge/postgresql-notebook-2026-11-23/**
- org/reviews/postgresql-*
- org/messages/**
- org/memory/**
- org/status.yaml
- org/loop/**
- workflow-graph.yaml
- gates/ledger.jsonl
- README.md
- AGENTS.md
- package.json
- pnpm-lock.yaml
- lib/db/**
- lib/db.ts
- app/page.tsx
- app/recipe-search.tsx
- app/recipe-card.tsx
- app/search-notebook.tsx
- lib/recipes/notebook.ts
- tests/auth/browser.ts
- tests/family/**
- tests/recipe-notebook.test.ts
- tests/postgres-*.test.ts
- scripts/postgres-*.ts

No production migration is planned: both hosted schemas already match the reviewed initial migration. Future data migrations require new explicit scope. No deploy until remaining human gates and verification prerequisites are satisfied.
