---
artifact: intent/postgresql-persistence/production-release.md
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: approved
round: 1
---

# Independent PostgreSQL production-candidate security review

Approved the inspected source candidate for the security peer gate. No Important security finding remains. This review does not supply human source-to-main approval, a production release approval or a paid-provider budget. Those remaining gates and actual hosted application verification remain explicit release prerequisites.

Reviewed the resolved integration of already-merged notebook main7cbe321 into PostgreSQL parentf595330, the production-release plan and independent plan review, current family/session/provider boundaries, scoped Fluid connection change and new regression, notebook client components, previous independent notebook/SQL/hosted reviews, and source/audit preservation notes. The merge is not yet a final committed source SHA; this verdict applies to the inspected resolved files and scoped pool attachment, and the orchestrator must bind the final verified commit to subsequent gates.

## Security passes

- **Authorization and identity:** `app/page.tsx:5` awaits `requireFamilyContext()` before rendering the new notebook UI. Compared against main7cbe321, the UI files are unchanged except that home's weaker `requirePageSession` was replaced by the stronger family requirement. The independent `app/api/recipes/search/route.ts:11` family guard still runs before the provider handler. Session/current-admission reads, verified Google subject policy, transactional family/invitation services, server allowlist contents, provider/photo transport and vercel.json have no implementation delta from PostgreSQL parentf595330. The integration therefore does not turn pending onboarding into recipe/provider access or weaken recipient/grant/single-family checks.
- **Notebook data isolation and injection:** notebook history remains page-lifetime React state, with immutable reducer updates and no shared server cache, browser storage, credential/session prop or new endpoint. Query/model/source text is rendered as escaped React text/attributes; history/filter/sort callbacks only update local state. The only search request remains the existing same-origin POST with bounded query and AbortController. Extracted cards retain noreferrer/noopener source links and no-referrer lazy unoptimized images; existing server grounding/URL/SSRF protections remain unchanged. The inherited response-array cast is not a new bypass of server validation.
- **Fluid pool lifecycle:** `lib/db/connection.ts:29-36` creates the same four-connection bounded pg pool, immediately registers `attachDatabasePool(pool)`, then wraps it in FamilyDatabase. Reviewed the actual pinned `@vercel/functions@3.11.3` public db-connections entry point, declarations, request-context implementation and pg connect/release hooks. Attachment tracks platform request context and waitUntil work until idle cleanup; it does not commit/rollback, acquire an identity, change database credentials, print connection values or migrate schema. Outside Vercel URL/region it does not schedule platform lifetime work. Its narrow subpath does not invoke unrelated OIDC features.
- **Transactions and secrets:** single checked-out connection ownership, READ COMMITTED, transaction-local timeouts, common transaction advisory lock before decision reads, explicit rollback and finally-release are unchanged. Strict remote TLS validation, duplicate-option denial, migration-pair checks, catalog/history validation, runtime least-privilege credentials and server-only configuration remain intact. No auth fixture import/bypass, hosted write, new privilege grant or secret-bearing debug output was added to production code.
- **Test and dependency scope:** the new fixture supplies a synthetic platform request context only inside the TypeScript test process, restores previous globals/environment in finally, and uses a generated local test database. It proves both successful and rolled-back transactions register lifetime work and that all idle test backends close before those promises settle. Test-server construction still forces empty paid keys and removes migration/test-admin connection variables. The new dependency is exact stable3.11.3 with generated lock changes; no compiler relaxation or vendor patch is introduced.

## Independent validation

Executed the focused regression against an owned isolated native PostgreSQL test database, with no hosted connection or provider/model call:

```text
node --import tsx --test tests/family/fluid.test.ts
1 passed, 0 failed, 0 skipped; exit0
Fluid cleanup/rollback case duration approximately10.26s
```

The initial sandboxed attempt could not open localhost5432 (EPERM); the same test passed after authorized sandbox escalation. This was an execution-permission failure, not an application regression. No development/hosted data was written. Read-only diff whitespace check passed.

The orchestrator reports the final combined candidate's frozen installation, lint, strict typecheck/build,121 Node tests,7 Python tests and fixture-only Chrome verification passed. Those full-suite/browser totals are attributed to its verification evidence; this reviewer independently executed only the focused Fluid case and source/security comparisons. The operator's private logical backup/isolated restore proof and documented pg17.12 pg_attver compatibility handling are likewise not re-executed or inferred from reading secret/dump contents here. Preserve the untouched raw dump and do not treat that local compatibility normalization as permission to change hosted schema or weaken catalog/hash checks.

## Release and audit boundaries

The new production-release request narrowly supersedes the previous stop-before-deploy limit; the reviewed plan still requires the separate human family/PostgreSQL main-merge gate, a fresh source/project/expiry/recovery-bound release record and an applicable bounded paid-search authorization before mandatory live provider checks. Imported notebook merge approval covers notebook source only. The inspected merge notes preserve exact source archives and the PostgreSQL canonical audit prefixes; they do not claim an unapproved PostgreSQL merge or reuse an old release.

The old application lacks family enforcement, so a fallback after new memberships/grants exist must preserve PostgreSQL data and use the separately agreed safe traffic/recovery path. Do not silently treat the old pre-family deployment as equivalent recovery. Preview/Production configuration and production schema are outside this review's changes.

Only this new review record was written. No existing review was replaced, source/user-development file changed, private credential/dump content read, hosted SQL executed, deployment performed or paid call made by this reviewer.
