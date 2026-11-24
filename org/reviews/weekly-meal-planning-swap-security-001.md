# Swap suggestion retention — independent security review

- Reviewer: security-researcher
- Date: 2026-11-24
- Scope: `aced6ec859735cf9da079cc4d48b5d658712ffc9` through exact source `917b9ebf8e7915f415e873cfc4ecdd224ab48f59`; clean working tree at review start.
- Authority: `org/messages/ceo-0053.md`, amended weekly intent/spec/plan and independently approved `org/reviews/weekly-meal-planning-swap-plan-001.md`.
- Method: repository role/protocol, REVIEW.md three passes and security-and-hardening skill; focused source, schema-constraint and regression assessment.
- Verdict: **clear**. No material bug, security or compliance findings. No source correction requested. Previous review artifacts remain historical; this review grants no merge, release, migration or scheduler activation authority.

## Threat model and assessment

The changed boundary is a member's accepted proposal becoming a new plan revision while other members' pending proposals remain actionable. Assets are family isolation, proposal identity/content, approval accuracy and transactional integrity. Abuse cases are selecting foreign/stale proposals, carrying another plan's or historical rows forward, duplicating pending entries, exceeding the pending cap, and concurrent accepts consuming a losing request's proposal.

**Bugs pass:** The only application change is the bound acceptance UPDATE in `lib/plans/store.ts`. Its WHERE clause selects the authorized plan, its old current revision and pending status. The chosen row becomes accepted, same-slot competitors become stale, and other-slot rows update only base_revision. IDs, author/menu IDs, snapshots and timestamps remain untouched. Nonpending history, old pending cohorts and other plans are excluded. The current cohort already satisfies the unique `(plan_id,base_revision,day_index,user_id)` pending index; moving its unrelated-slot subset to the new revision preserves that uniqueness. Supported application operations cannot create future-revision pending rows before this locked acceptance. Promotion creates no rows and removes at least the accepted row from pending, so the100-per-revision cap cannot increase. Finalization still closes current pending rows. No material finding.

**Security pass:** Authorization is unchanged: the existing common-lock transaction rechecks current admission/membership, selects the plan by ID and derived family, validates the current revision/read-only status and selects the pending suggestion by ID/plan/revision. Acceptance still rechecks and validates the currently saved same-family menu recipe. The new UPDATE follows those checks within the same transaction, uses bound parameters and narrows its revision scope. All approvals are still removed after content changes. Concurrent old-revision requests fail409 before effects; their unrelated pending proposals survive for refreshed resolution. A failure rolls back plan, approval and suggestion changes together. No additional client input, data disclosure, credential, public path, external fetch, dependency or privilege is introduced. No material finding.

**Compliance pass:** Runtime behavior matches the owner-authorized same-slot invalidation and unrelated-slot retention amendment, including unchanged approval reset and stale-client semantics. Schema, HTTP unions, authentication, family policy, scheduler and deployment configuration are unchanged. Added multiuser/raw-row and concurrent regressions directly cover the amended contract; the browser delta submits two physical proposals, retains the second after first acceptance and resolves it using refreshed real HTTP. No material finding.

## Evidence and limits

- Independently ran `node --import tsx --test tests/plans/store.test.ts` with approved localhost access: exit0,5 passed,0 failed. Tests use owned disposable local databases and cleanup; no development/hosted data effects.
- The new regressions compare complete retained/accepted/competing rows, preserve other-plan and historical-pending rows, verify stale409 then successful retained resolution, and race two different-slot accepts. Existing store tests retain family/admission, malformed snapshot, cap and immutable-final coverage.
- `git diff --check aced6ec..917b9eb`: exit0.
- Application/configuration diff inspection confirms only `lib/plans/store.ts` changed among lib/app/scripts/schema/package/lockfile/Proxy/Vercel paths:4 insertions,1 deletion.
- Read current verification evidence reporting lint/typecheck/build exit0,15 planning tests,199 existing Node tests,7 Python tests and real Chrome320/1440 two-card retention flow. Those full suites/build/browser checks were not independently repeated here.

This bounded review does not reopen unchanged infrastructure or assess a new release/dependency audit. No build, production/hosted operation, scheduler installation or activation was performed by this reviewer. Only this new report was written.
