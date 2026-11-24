---
artifact: implementation
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent code review — PostgreSQL production candidate

## Scope and verdict

Approved under the independent code peer gate. No unresolved Important correctness, security or compliance finding in the inspected candidate. This review covers the resolved integration of main `7cbe321c432532316dd23d94598ee5e75f3ce309` into PostgreSQL `f5953303ac2bcfddf6d776e651cdddc2d4393d48`, the scoped Vercel Fluid pool attachment and regression, protected notebook/grid home, and updated browser fixtures. It is not human source-to-main merge approval, a deployment, production migration, paid-call authorization or proof of live Google/provider behavior.

Read active `org/loop/state.yaml`, sibling PostgreSQL spec/plan, approved `production-release.md` and independent production plan review, org protocol/REVIEW, notebook intent/spec/plan and previous independent reviews. Applied code-review and React/Next performance guidance. No application/main/source-worktree mutation, credential-content read, build/browser invocation, live provider request or hosted database action was performed by this reviewer. Only this review record was written.

## Correctness and boundaries

- `app/page.tsx:5` retains the stronger `await requireFamilyContext()` before rendering any Notebook/recipe interface, rather than importing main's weaker session-only guard. The notebook UI is composed only after current database admission/membership. Independently compared `lib/session.ts`, identity/family/invitation services and `app/api/recipes/search/route.ts` against the PostgreSQL parent: byte-exact. The search route still independently checks family context before invoking the unchanged provider boundary.
- Independently compared the imported `app/recipe-search.tsx`, `app/recipe-card.tsx`, `app/search-notebook.tsx`, `lib/recipes/notebook.ts` and `tests/recipe-notebook.test.ts` to main7cbe: exact bytes. This resolves the intended integration without inventing another Notebook implementation. Page-lifetime React state has no localStorage/database history, request generation/abort guards remain, and filter/sort/group actions remain client-only. Source URLs/text, total-vs-cook time and image fallback safeguards remain present.
- PostgreSQL transaction semantics are unchanged: one checked-out client, READ COMMITTED, transaction-local bounded timeouts, common transaction advisory lock before admission/recipient/member/rate-limit decisions, rollback and client release. `connectDatabase` only adds lifecycle attachment around the existing Pool; it does not replace transaction ownership, introduce request-time migrations or change URL/TLS configuration. Native local setup and isolated database helpers remain the established path.
- Provider server code/photo transport, `vercel.json` duration/cancellation/manual deployment configuration and strict `tsconfig.json` were independently byte-compared to PGf595330 and are unchanged. No runtime auth fixture import or fake-user bypass was added.

## Fluid pool lifecycle and packaging

`lib/db/connection.ts` imports `attachDatabasePool` from the package's exported public `@vercel/functions/db-connections` subpath and calls it immediately after Pool construction. Exact dependency `@vercel/functions@3.11.3` and generated lockfile are recorded. Inspected installed package exports/declarations and implementation: this entry point depends on request-context/deadline helpers rather than importing the broad OIDC package root. It wraps pg checkout to capture per-request lifetime context and observes release events without owning COMMIT/ROLLBACK. The idle-lifetime mechanism is inactive outside Vercel URL/region/request context. Existing max4, idle10s, connection5s, client query12s bounds remain.

This follows [Vercel's official pool-lifecycle guidance](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package), which recommends attaching a supported pool immediately after creation so idle clients can be released before Fluid suspension. The [official pooling guide](https://vercel.com/kb/guide/connection-pooling-with-functions) also recommends module-scoped reused pools; existing lazy application caching is preserved. These are source/API checks, not a live Fluid deployment claim.

`tests/family/fluid.test.ts` uses an owned real PostgreSQL fixture and a test-process-only request-context symbol. It verifies successful and failed transactions both register lifetime work, confirms sessions exist, awaits the registered promises, then checks no fixture database backends remain. It restores prior global context and Vercel environment values and closes the pool/admin connection/owned database. This is meaningful runtime proof of idle cleanup rather than a mock assertion of an attachment function call. Root reports this regression passed within family34; this reviewer did not rerun it concurrently.

## Browser and regression evidence

Reviewed integrated browser helpers: authentication fixture setup now explicitly provisions the owned PostgreSQL family before protected home checks; existing family-pending HTTP denial assertions remain in `tests/family/main-integration.test.ts`. Notebook fixture checks cover widths320/390/768/1024/1440, 1/2/3-column layouts, >=44px controls, title/time filters and stable sorting, per-group choices, no extra requests for local actions, loading/error retention, empty/long content, reload clearing, keyboard focus, source/photo behavior and logout. Production/development family scenarios retain fresh owned Chrome/profile isolation. New screenshot names preserve earlier evidence.

The intentional HTTP429 console allowance is limited to the exact fixture search URL/message and asserts exactly one occurrence per width; unexpected errors still fail. No broad warning filter, assertion removal or increased provider authority is introduced. Fixture servers continue to force empty paid-provider credentials and test-process Google transport. Browser search bodies are explicitly intercepted fixtures; publisher image loading is HTTPS evidence, not a model call.

The orchestrator reports clean-export frozen install, lint, strict typecheck and optimized build passing; recipe/notebook63 + auth12 + family34 + deployment12 Node tests and Python7 passing; integrated Chrome320..1440 and family production/development passing. These totals are attributed to the orchestrator's actual clean-export runs, not reused parent-branch totals or independently rerun here. Candidate verification records should retain exact command logs/source manifest and distinguish local fixture success from mandatory future live checks.

## Audit integrity and minor documentation note

Independently hashed every entry in `org/merge/postgresql-notebook-2026-11-23/manifest.json`: **381 entries checked, 0 mismatches**. Canonical gate ledger and memory event files preserve the full PostgreSQL predecessor byte prefixes before sourced imports. Main Notebook decisions are imported as their historical scope, not invented PostgreSQL merge/release authorization. Completed PostgreSQL loop state/history remain historical and are not reset to obtain another solved loop. `git diff --check` passed during inspection.

One nonblocking documentation correction was sent to the orchestrator: the merge archive README says377 preserved artifacts while the current verified manifest contains381. Update the count to match the manifest; no archived content defect was found.

The code peer gate is clear. Human merge and fresh scoped release authority, independent security clearance, recovery scope and mandatory authorized live verification remain distinct execution requirements under the approved release plan/runbook.

Orchestrator resolution: archive README count now381 (377text plus four historical image versions), matching the independently verified manifest.
