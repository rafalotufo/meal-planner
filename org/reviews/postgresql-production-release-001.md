---
artifact: intent/postgresql-persistence/production-release.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent release and audit review

Approved the inspected integrated candidate's release preparation and audit preservation. No unresolved Important defect in those areas. This is independent review clearance, not human source-to-main approval or authorization to stage/promote an uncommitted, unmerged or unverified artifact. Scope is the resolved integration of PostgreSQL f595330 and already-merged main7cbe321, the Fluid lifecycle attachment, preparation evidence and recovery approach. No hosted mutation, build/browser execution, paid provider call, credential-content inspection or deployment was performed by this reviewer.

## Independently verified evidence

All381 archive manifest entries match the exact source Git object bytes, SHA256 and declared byte length, with zero mismatches. Both versions of recipe-integration-results-320.png and recipe-integration-results-1440.png are preserved, in addition to377 text artifacts. Canonical ledger and memory event files preserve the complete PostgreSQL predecessor byte prefixes. The canonical ledger and both independently archived source ledger hash chains validate. The active PostgreSQL loop state/history and workflow graph are byte-identical to f595330; completed loops were not reset, extended or combined. Six colliding message names have explicit source-to-alias mappings. Four imported notebook decisions retain original IDs/hashes/provenance and do not masquerade as PostgreSQL merge or release approval. The archive README now accurately reports381 artifacts.

The protected home retains requireFamilyContext before the notebook UI. The separate search-route guard and transaction implementation remain covered by the independent code review. The public @vercel/functions/db-connections entry point and its installed declaration/implementation support attaching the existing pg pool immediately after creation. The changed code preserves the existing transaction/client ownership and timeout configuration. Its real-PostgreSQL regression checks both successful and rolled-back transaction release, request lifetime promises and disappearance of actual idle database backends. There is no production fixture/bypass introduced by the test-only request-context symbol.

Reviewed the orchestrator's postgresql-production-verification.md: frozen install, lint, strict typecheck, production build,121Node tests and7Python tests pass in a private clean export, with the integrated notebook at320/390/768/1024/1440 and family flows at320/1440 plus development StrictMode flow. These execution results are attributed to the orchestrator's runs; I did not rerun them concurrently. The clean-export approach appropriately preserves the user's pre-existing next-env.d.ts development change. git diff --check passes in the inspected working tree. Final source/verification identity and committed secret/plan-sync checks must remain traceable when the candidate is committed.

## Snapshot compatibility assessment

The immutable custom-format Production snapshot and private hash/target manifest must remain retained with owner-only permissions. The reported direct restore failure on local17.11 is consistent with PostgreSQL's [upstream attribute-versioning compatibility note](https://www.postgresql.org/message-id/E1xQQG1-000000003jI-2cdw@gemulon.postgresql.org): an older pg_dump can emit internal pg_attver ALTER statements from a newer server, which older servers reject; updated servers ignore those DDL statements.

For a disposable local logical restore, deriving SQL from that raw backup and omitting only complete, exact internal pg_attver ALTER statements on the four known tables is acceptable. The filter must reject any other occurrence or unrecognized syntax and must not remove logical schema, grants, migration history, constraints or rows. Preserve the raw dump; restore with stop-on-error in one transaction; validate the exact expected catalog and migration hashes and domain contents. Never disable composite-type safety settings or turn general restore errors into warnings.

The orchestrator records that the bounded derived restore succeeded, normal openDatabase catalog/history validation passed, and all three empty Production domain counts remained zero; the owned isolated database was then removed. This is a derived logical compatibility restore, not proof that the unmodified raw dump restores directly into17.11. No raw credential or backup contents were exposed to this reviewer. Matching patched PostgreSQL tooling/server remains the straightforward path for future direct raw restores. This limited compatibility adaptation does not require changing the Production schema or applying a new migration.

The empty snapshot must never overwrite later memberships or durable invitation grants. Recovery after family writes must retain current PostgreSQL data and fail closed/pause traffic or use an authorized reviewed family-capable replacement. The existing pre-family deployment is not an equivalent safe application rollback once those guarantees matter.

## Remaining execution gates

Before Production-target staging, obtain/record the actual distinct human source-to-main approval, complete the clean reviewed merge, and commit scoped release authority naming the reviewed source SHA, actual Vercel project, Production staging/promotion, expiry and safe recovery. Verify the committed release record with the runbook's release_authorization gate. Imported notebook approvals and this review do not grant those actions.

The earlier explicit no-paid-call restriction remains applicable to verification. Settle the mandatory one normal search and at most one disconnect search with fresh bounded owner authority, or an explicit owner-approved verification amendment, before promotion. Do not enter a knowingly incomplete15-minute first-live check window or reuse an old two-search approval. Anonymous denial, real Google/family persistence, live provider/photo behavior, cancellation correlation and WAF evidence remain future live checks; local fixtures cannot stand in for them. Stage with --prod --skip-domain, preserve Host/platform protection, and promote only the exact verified artifact under those gates. Preview remains separate. No Production migration is needed or authorized by this review.
