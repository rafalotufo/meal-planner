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
- intent/vercel-deployment/deployment-runbook.md
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
- app/invite/invite-context.tsx
- drizzle/postgresql/runtime-migrations.json
- next.config.ts
- tests/deployment/**
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
- tests/auth/server.ts
- tests/family/**
- tests/recipe-notebook.test.ts
- tests/postgres-*.test.ts
- scripts/postgres-*.ts

No production migration is planned: both hosted schemas already match the reviewed initial migration. Future data migrations require new explicit scope. No deploy until remaining human gates and verification prerequisites are satisfied.

## Proxy packaging correction after first promotion

The first live Google callback succeeded, but authenticated onboarding returned503 before provider effects. Production read-only TLS/roles/catalog/history checks pass and domain tables remain empty. The separate .next/server/middleware.js.nft.json lacks PostgreSQL startup assets; the page/API traces contain them. The /* include matches route paths but not the emitted root middleware trace entry. Preserve the failed deployment and this evidence; pause only this project under the authorized recovery path (owner confirmation required by existing runbook). No paid searches were used.

Add a compiled-artifact regression that first fails on the missing proxy SQL/journal/catalog files. Evaluate a minimal explicit middleware include with unchanged strict checking, SQL, authorization and credentials. Rebuild in the isolated export and require the regression to pass before retaining the fix; if this option is not applied to middleware, diagnose supported traceable file access rather than patching vendor code. Rerun strict checks and family/auth/deployment regressions plus fixture browser checks; independently review the correction. A changed source SHA requires reviewed correction and renewed release authority before staging/resuming, under the runbook recovery gate. Do not silently resume or reuse authority for7c651c2 on different application code.

Experiment result: adding a literal middleware include did not alter the rebuilt proxy trace; the compiled regression remained RED. Do not retain that ineffective configuration or state that the glob mismatch alone explains the framework behavior. A private NFT probe instead confirms that a direct literal recursive directory read traces all reviewed assets. Evaluate a legitimate startup inventory check in repositoryMigrations before the existing public loader: require the SQL/journal/catalog inputs to exist, then keep existing hash/catalog validation unchanged. This makes filesystem access visible to source tracing without vendor patches, fake file references, copied secrets or static hash duplication. Retain only after a real rebuilt proxy trace and packaged-runtime regression pass.

The inventory experiment also failed the real rebuilt proxy regression, despite the standalone NFT probe; reject it and remove the added readiness read. The supported correction is to remove runtime filesystem dependence rather than rely on a proxy tracing behavior that the actual build does not provide:

- Statically import the committed catalog and a committed ordered migration metadata JSON ({hash,folderMillis}) into the runtime connection module. Runtime still compares exact reviewed migration history and exact catalog to PostgreSQL, never migrates or repairs.
- Move filesystem/public Drizzle migration loading into a separate explicit-migration module. Before any migration write, compare the fresh loader metadata to the committed runtime manifest.
- Chain an upload-included verifier under lib/db into pnpm build before Next. It fails on empty/malformed/stale/reordered manifest, changed SQL or journal; never auto-updates a manifest. Retain strict TS6/vendor checks.
- Regression: start the real compiled app from an isolated package containing .next, package.json and dependency link but no source/drizzle directory; existing test-process-only Google fixture and isolated PostgreSQL must exercise callback, onboarding, provisioning and protected home. This must fail before the correction and pass afterward. Also test fresh-loader/manifest agreement and stale SQL/journal rejection using private disposable filesystem copies. Replace the earlier file-presence assertion because bundled metadata removes those runtime file requirements.
- Run strict build/lint/typecheck, relevant auth/family/deployment and browser checks, and independent code/security review. Preserve first failed release and all rejected-experiment evidence. Production remains paused and a newly reviewed SHA needs renewed merge/release/resume authority.

Cold-development verification is currently blocking the static-JSON candidate: the old reviewed runtime passes the identical fresh-cache dev-only StrictMode scenario, whereas the corrected JSON-import runtime stalls client navigation despite successful server responses. Do not call this inherited or bypass it with prewarming. Isolate static catalog versus migration metadata imports. If webpack JSON-module dependency behavior is the trigger, evaluate a bundled TypeScript metadata constant with identical reviewed content instead; the mandatory verifier must then compare both the complete catalog constant to committed catalog.json and ordered migration metadata to the fresh public loader. This preserves one reviewed schema source with a checked generated runtime representation. Require unchanged cold-development assertions, compiled no-source runtime, strict checks and independent re-review before retaining any variant.

Catalog-only JSON import reproduces the cold-development failure in the controlled bisection. Evaluate the approved TypeScript representation under lib/db/reviewed-runtime.ts: runtime catalog/migration constants have identical reviewed content and no JSON-module imports; the build/explicit-migration verifier compares both catalog.json and fresh loader metadata before proceeding. Remove the uncommitted JSON runtime manifest variant. Add stale-catalog rejection coverage. Do not retain this representation unless cold development, compiled no-source operation and strict regressions pass; no prewarming or application router change.

The migration-only JSON and checked TypeScript representations also failed the same cold client transition; representation is not established as the cause. Reject the TypeScript variant rather than add a second schema source without evidence. Retain the simpler reviewed static JSON runtime design. The reproducible remaining failure is the invitation-context handoff: cookie-setting POST succeeds, client router requests sign-in successfully, but pending client navigation does not commit under cold development compilation/replay.

Evaluate a narrowly scoped full same-origin navigation after successful invitation-cookie capture: window.location.replace('/sign-in'), preserving fragment capture/stripping, active-effect cleanup, POST checks and generic error behavior. This explicitly reloads the authentication boundary with the new HttpOnly invitation cookie and avoids dependence on retained client router/cache state. It does not prewarm, mock admission, extend timeouts, suppress warnings or alter acceptance assertions. Existing production copied-link and cold-development StrictMode flows must both pass, including fragment absence from all server URLs. Require independent design/code/security approval of this small handoff change alongside the filesystem-free runtime.
