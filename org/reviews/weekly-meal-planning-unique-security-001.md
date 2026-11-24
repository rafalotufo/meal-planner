# Unique weekly recipes — independent security review

- Reviewer: security-researcher
- Date: 2026-11-24
- Status: **Final whole-feature security assessment complete.**
- Exact reviewed root source: `0f0b0c84792bb9947fe4ef0790d893973a21e01b`.
- Inputs: approved uniqueness appendix in weekly intent/spec/plan, `org/reviews/weekly-meal-planning-unique-plan-001.md`, repository role/protocol/REVIEW.md and security-and-hardening skill.
- Reviewed private source: `/private/tmp/meal-planner-unique-qa-2zcxp482/project`.
- SQL0003 SHA256: `1e8f7dc3ba0e3fc4912763e42f1677183b7ece0d88788942f397dda3e9b7d447`.
- Final verdict: **CLEAR. No material bug, security or compliance findings.** Frozen source, reviewed SQL and full verification satisfy this bounded security review. The separately authorized local repair still requires the independent final source review and root's precise local-target validation. This report grants no hosted migration, deployment, merge, paid call or scheduler activation authority.

## Early SQL threat assessment and three passes

Protected assets are immutable finalized history, correct draft/proposal identity and family isolation, approval integrity and migration atomicity. The privileged boundary is reviewed owner SQL entering existing application data; malicious/malformed source keys, integer overflow, concurrent runtime writes and merged pending-index collisions must not discard data or create partial repairs.

**Bugs:** The existing runner takes migration lock73462902;0003's first statement takes FAMILY_WRITE_LOCK73462901 before application-table validation, ALTER or repair. This matches runtime family-lock-before-table-access ordering. Affected plan IDs, original revision, first snapshots/order and index mappings are materialized before mutation. Proposal mapping is restricted to affected plan IDs/current original revision/pending status. Oldest timestamp then ID deterministically selects one survivor per merged plan/user/slot. Losers become stale before survivors move to their new index and revision. The new cohort avoids collisions with still-old-index current rows under supported application invariants; unexpected corrupt future-cohort conflicts fail the transaction rather than dropping rows. No rows are inserted and pending count cannot increase. Revision overflow and missing/malformed source keys abort. No material finding.

**Security:** SQL has no external string interpolation, persistent helper, new role grant or public/runtime migration entry point. Transaction-local temporary tables use ON COMMIT DROP. Family/plan mapping is anchored to affected IDs rather than untrusted proposal content. Finalized rows, already-unique drafts and unrelated/old/nonpending proposal cohorts are excluded from repair; only affected approvals are deleted. Source validation permits the old writer's canonical ASCII HTTPS URLs, including legitimate underscore hostnames, without broadening application URL trust. The migration deliberately does not repair arbitrary invalid full snapshots; unchanged runtime snapshot validation must still fail closed. No material finding.

**Compliance:** Cardinality changes to1..7 while prior status/timestamp/revision/ownership constraints and indexes remain. First-occurrence compaction preserves stored snapshots without reloading today's menu. Raw finalized history is untouched. Rollback reinstates exact-seven only if all remaining rows satisfy it; its single DO statement rolls back constraint/history changes on failure and never pads or deletes plans. Old0000–0002 bytes match the root source. No hosted/production/deployment/job operation is authorized by this assessment. No material finding.

## Independent early evidence

- Private QA command with Node24 path: `PATH=/Users/rafael/.nvm/versions/node/v24.15.0/bin:$PATH node --import tsx --test tests/plans/migration.test.ts`; approved localhost access, exit0,3 passed. Genuine0000–0002 upgrade fixtures, collision-safe deterministic remap, preserved finals/unique/foreign plans and historical proposals, affected approval reset, idempotence, schema opening, runtime denials, rollback refusal and malformed-key/overflow transaction rollback passed. Owned random disposable test databases only; cleanup completed.
- Compared private/root0000/0001/0002 SQL bytes: identical. SHA256 respectively `22463e304a25ab4d43ded59a017f476ffc651e37f9c966903cc1bcc934afb597`, `5b984dc2492fb0bfd85c7ee46620ad61c819c81da6db606620b1fb244be52ddd`, `f6a77d005618de16b22350df733f35674fc301ef638aa087ae5654efbfea035b`.
- Reviewed current `lib/db/migrate.ts`,0003, rollback and migration tests. No build/type generation/dev-server operation was run. Root's user-modified next-env.d.ts was untouched.

## Original staged-review handoff

The early assessment deferred runtime/UI, complete regression evidence and exact copied-back source binding. Those checks are completed below; the original SQL assessment and independent test evidence are preserved.

## Frozen private runtime/UI assessment

After the developer froze the private source, independently read generator, validation, store, types, page, client controls and amended tests. No material source finding:

- The saved-menu family/source unique constraint and validated canonical snapshots supply distinct candidates; generation rotates each selected candidate once instead of cycling to seven. Queries remain family-bound and limited to seven choices/eight finalized history weeks.
- `parseMeals` requires1..7 fully validated canonical snapshots and distinct sources by default. Only final-status row parsing permits raw legacy duplicates; it projects first occurrences for display and retains original count for the honest legacy note. No read writes or source-history rewrite is introduced. Draft mutations/finalization still require strict unique parsing.
- Incoming proposal slots and stored proposal slots are checked against actual plan length under the common lock. Suggestion creation rejects any already-planned canonical source before an insert. Acceptance rechecks the current same-family saved recipe and rejects a source used by another slot before any meal/approval/proposal write. The existing transaction makes concurrent accept uniqueness checks atomic; the losing old-revision request still returns409.
- Reject does not require the replacement to remain unused/saved. Conflicting unrelated proposals stay pending and preserve identity/content/time at the advanced cohort; the approved same-slot stale/unrelated-cohort retention, approval reset and final immutability remain intact.
- Client options exclude all currently planned sources.409 messages are limited to200 characters from the server's generic FamilyError envelope and rendered as React text with refresh/reject guidance; no HTML sink or secret/configuration exposure is introduced. Safe existing recipe URLs remain external links only. Counts/confirmation use actual length; cards/header stay undated and legacy history has explicit original-count disclosure.

Independently ran frozen private `node --import tsx --test tests/plans/store.test.ts tests/plans/validation.test.ts` with the Node24 PATH and approved localhost access: exit0,9 passed. Together with the early migration run,12 focused tests were independently verified. No build/typegen/full-browser rerun was needed for this reviewer. Compared private/root Proxy, auth-policy, session, HTTP helper, migration/grant script, Vercel config, package/lockfile and API route: unchanged. Runtime migration metadata matches the unchanged reviewed0003 hash.

Frozen private source hashes for copy-back binding:

| File | SHA256 |
| --- | --- |
| lib/plans/generate.ts | 07648f5712cc88cd76202396285a2fec07f668bba1b7bc678dbf9d9bdf53868a |
| lib/plans/validation.ts | bf8b84dd9e90b2e8731afe5f37518bc8c0af24b05a843e4c04ec1517e07c8518 |
| lib/plans/store.ts | 701e496d3b2f645ef1b54d01502ab0588c536ffa553667e31de703084b28a653 |
| lib/plans/types.ts | d9c5520554ab7bf7d945afb951abe0a0402bf93100c759b089ce1ad30541cd01 |
| app/plans/page.tsx | 97fae060e2749d9acdbe4e50db4697ee50dcfee03b59f64d911cae5a5067c8f2 |
| app/plans/plan-controls.tsx | 2e3d85381a0f59ae5da442ce029155b7d032ca53aba857d43f9b2db064fdb39c |
| drizzle/postgresql/catalog.json | 126511c3083c45e5f72b59707991c38c511a7de2523da64cf84d5fd30b5b6466 |
| drizzle/postgresql/runtime-migrations.json | ec8f1d59bd73c3980940aad50f738866f21ec41304207dbd29ae321baae6b7c7 |

## Final source binding and complete evidence

Inspected root commit `0f0b0c84792bb9947fe4ef0790d893973a21e01b` and independently compared all nine runtime/SQL/catalog/metadata files identified above with the frozen tested private source: every byte matches the recorded hashes. The reviewed0003 hash remains `1e8f7dc3ba0e3fc4912763e42f1677183b7ece0d88788942f397dda3e9b7d447`. Root's only preexisting tracked working change at final assessment is next-env.d.ts; this review did not change it.

Read the completed current verification.md and orchestrator evidence: frozen private Node24.15.0/pnpm10.33.0 lint/typecheck/build exit0; planning20, recipes82, family34, menu35, auth16 and deployment32 tests all pass, totaling219 Node tests; Python7/7 exit0. Real Chrome320/1440 verifies unique1/2/6/7-card counts/URLs, helpful duplicate-accept409 with retained rejectability, later distinct replacement success, approval reset/stale refresh, no dates outside history controls and immutable legacy display; ten feature screenshots were produced and representative views inspected by the developer. These full suites/build/browser observations are attributed to the recorded developer/orchestrator evidence, not claimed as independently rerun by this reviewer. Independent reviewer reruns total12 focused migration/store/validation tests, all passing.

The SQL/data-repair and frozen runtime/UI assessments together close the scoped threats: no cross-family remapping/access, partial repair or overflow, duplicated weekly recipe accepted through supported actions, consumed conflicting retained proposal, silent finalized-history rewrite, misleading legacy count or new client secret/HTML exposure was found. Current admission, canonical Host/origin, protected-method/header behavior, bounded inputs/queries, approval reset and immutable finalization remain unchanged or enforced as reviewed. No material finding remains.

No local development data repair, hosted operation, build/typegen, deployment or scheduler activation was performed by this reviewer. Final clear applies to this exact source and SQL; later source drift requires fresh assessment. Prior review artifacts remain historical.
