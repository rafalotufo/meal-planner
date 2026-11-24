# Swap suggestion retention — independent final review 001

- Reviewer: independent reviewer; writer: senior-developer. Reviewer did not author the feature or correction.
- Date: 2026-11-24; refinement final-review turn4.
- Scope: `aced6ec859735cf9da079cc4d48b5d658712ffc9` through exact source `917b9ebf8e7915f415e873cfc4ecdd224ab48f59`.
- Inputs: ceo-0053, active intent/brainstorm/spec/plan and verification, approved swap amendment, independent swap security report, AGENTS.md, org protocol/reviewer role, REVIEW.md and code-review-and-quality skill.
- Verdict: **Approve local implementation. No material bug, security or compliance findings; no required changes.** Prior final reports remain historical. Human merge/release, hosted migration/deployment and scheduler activation remain separately gated.

## Review passes

**Bugs:** The only runtime change is the acceptance UPDATE in `lib/plans/store.ts`. It affects only the authorized plan's current-revision pending cohort. The chosen suggestion becomes accepted; pending competitors on its slot become stale; other slots retain pending status and update only base_revision. Their IDs, users, menu IDs, snapshots and timestamps stay intact. Previously resolved history and other plan/old-revision cohorts are excluded. The week revision increment and global approval deletion remain atomic with that UPDATE under the existing common advisory lock. The next-revision pending uniqueness invariant is preserved because supported operations cannot precreate future-revision proposals. Carrying a subset forward creates no rows and reduces pending count. Concurrent old-revision acceptance fails before effects, leaving its other-slot proposal available for refreshed resolution. Existing cap/finalize and immutable-history handling remain sound. No defect found.

**Security:** Membership/admission, derived family plan lookup, current revision/editability checks and current-family saved-menu validation still precede effects in the same locked READ COMMITTED transaction. Bound parameters remain mandatory; the new predicate narrows the previous update by revision. No new client input, API union, schema/grant, authentication rule, scheduler effect, dependency or external integration appears. Independent security review is clear for the same exact source SHA. No security finding.

**Compliance:** Source matches ceo-0053 and the reviewed amendment: only competing proposals for the addressed slot are cleared, while unrelated pending proposals remain actionable after refresh. Approvals still reset globally and stale overall client revision still returns409. Existing undated header/card presentation and history controls remain intact. Source/tests fit the approved manifest. No scope or policy breach found.

Readability/architecture/performance: the focused CASE update expresses the three outcomes within the existing acceptance transaction, without a new abstraction or additional query. Existing plan/revision index and100-pending bound limit the cohort. There is no structural or performance regression requiring action.

## Independent evidence

- Ran `node --import tsx --test tests/plans/store.test.ts`: initial sandbox attempt failed on localhost EPERM; approved localhost rerun passed5/5. Repeated against exact committed source917b9eb after strengthened scoping assertions: exit0,5 passed,0 failed. Owned disposable test databases were cleaned up; development/hosted resources were not used.
- Tests cover complete unrelated-row preservation, multiuser same-slot accepted/stale outcomes, other-plan and historical-cohort preservation, stale409 then refreshed resolution, concurrent different-slot accepts with one surviving loser, cap/finalization, admission/family isolation and immutable history.
- `git diff --check aced6ec859735cf9da079cc4d48b5d658712ffc9`: exit0.
- Independently inspected browser source delta: both proposals use physical native controls/real HTTP; accepting the first retains the second with the same stored identity/content; a physical refreshed accept resolves it. Existing stale-device, pagination, confirmation/history, accessibility and undated-content checks remain.
- Opened refreshed swap1440 and swap320 screenshots. Desktop visibly shows the accepted first recipe and a pending proposed replacement with Accept/Reject on the second. Mobile long title wraps inside the card; no header/card date range reappears. These captures were supplied by the developer's real-browser run, independently visually inspected here.

## Supplied verification and limits

Reviewed recorded red/green evidence: the new focused regressions failed with the original all-pending-stale behavior before correction, then passed. Developer reports final lint/typecheck/build exit0,15 planning tests passed, and complete Chrome320/1440 two-card retention/resolve flow passed on the stable build; six screenshots were recaptured. Root reran82 recipe/photo,34 family,35 menu,16 auth and32 deployment tests, all passing (199 existing plus15 planning =214 Node); Python7/7 passed. Independent security reviewer separately reran5 store tests and reported clear. Root reports plan-sync and staged secret checks0.

This reviewer did not rerun full build/HTTP/browser or all existing suites, and distinguishes supplied results from own targeted execution above. No source/process/ledger edits, commits, hosted/development effects, deployment or scheduler activation were performed by this reviewer. Remaining audit recording and human gates belong to the orchestrator/owner.
