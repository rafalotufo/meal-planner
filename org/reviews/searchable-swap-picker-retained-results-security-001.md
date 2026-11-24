# Retained swap search results — independent security review

- Reviewer: security-researcher
- Date: 2026-11-24
- Status: **Final independent security assessment complete.**
- Exact root source: `4f91e9c2b833dddbe154a795c60cc869f4035366`.
- Inputs: approved retained-results appendix in `intent/searchable-swap-picker/{spec,plan}.md`, latest owner no-updating-label steering, org security role/protocol, REVIEW.md and security-and-hardening skill.
- Private source: `/private/tmp/meal-planner-retained-results-0he__gw5/project`.
- Final verdict: **CLEAR. No material bug, security or compliance findings.** This bounded review does not grant merge, deployment, hosted or scheduler authority.

## Threat boundaries and early passes

Assets are confidential family recipes, valid current query/page selection, intended captured swap target and correct asynchronous outcomes. The changed boundary separates a retained validated display snapshot from current requested query/cursor and actionable selection. Abuse cases are confirming a previously selected old result, selecting/paging stale retained cards, late responses replacing/enabling new state, retained confidential data after current401/403 and old-opening state leaking into a reopened dialog.

**Bugs:** `displayed` contains validated page/query/after together, committed only after current-instance/current-request success. Query/page reset invalidates the request version, aborts previous work, clears selection/outcome/error and enters loading while retaining display. `unavailable` includes loading, error, missing snapshot and query/cursor mismatch; it disables choice buttons and handlers, paging and confirmation. Counts/no-match text use displayed metadata; changed query resets requested cursor. Ordinary current errors keep the prior snapshot locked with Retry, whereas current401/403 clears it. No material finding at this stage.

**Security:** Existing512KiB/fatalUTF8/JSON/strict-page validation, cancellation/deadline and version/alive success/error/finally guards remain. Retaining an old display does not bypass response validation or authorize an old selected value. Only current validated response enables new choices. Dismissal unmounts the keyed instance and clears retained data; captured-target and parent mutation protections remain outside this scoped change. Latest authorization failures clear retained recipes and expose existing recovery links. No server/API/auth/public-policy/schema/image-policy boundary changes were found in the dialog. No material finding at this stage.

**Compliance:** No visible updating label is rendered with retained results; aria-busy remains. Initial loading without a successful snapshot still has its own message. Stable-frame CSS, native focus/dismissal, explicit confirmation, no-dates and planning contracts remain. Final browser proof must demonstrate actual IDs remain visible/nonempty but disabled during typing/body delay, latest atomic replacement, ordinary error retention and current401/403 clearing. No final compliance verdict before frozen-source/evidence review.

## Original staged-review handoff

The early assessment deferred frozen source, real retained-ID/query/cursor/race/error/access evidence and root-source binding. Those checks are completed below; early review notes are preserved.

## Final frozen-source review and evidence

Independently resolved `4f91e9c2b833dddbe154a795c60cc869f4035366`, reviewed its complete runtime/browser delta and verified every one of its7 changed paths against original working bytes, private tested bytes and committed bytes: all identical. Dialog SHA256 is `fd0a0cd71103b2ac9e3629746d2250dddb29207ce30e6b0bd0fcca2aa0d825ca`; browser test SHA256 is `404048ad7b818065d0723c55db0f22ccf8dab088d7f91eecc982656cef91c7e8`. The remaining paths are feature verification and four existing modal screenshots. No parent/API/store/validator/image/auth/schema/guard/configuration path changed.

Final Bugs/Security/Compliance passes confirm the preliminary analysis: retained page and provenance are a single state value; selection becomes absent and all stale choice/paging/confirmation paths are locked through loading/error/query-or-cursor mismatch. Query reset invalidates request versions before aborting old work and never reuses the displayed old cursor. Only fully validated current-instance/current-request success commits new page/query/cursor. Ordinary error retention cannot become a selectable success; current401/403 clears retained confidential entries. Late success/error/finally and dismissed-instance completion guards remain intact. Closing/reopening does not retain the old snapshot. No visible Updating label was introduced; aria-busy, stable frame and native focus/dismissal remain. No material finding remains.

Read completed original verification.md and actual private `browser-final.log`. Chrome reproduces the old red behavior43→0 during typing, then demonstrates green43→43 with identical ordered IDs across physical successive typing/debounce and delayed response-body loading; old choices/paging/confirmation disabled and selection cleared. Validated latest response then replaces the IDs without restoring selection. Malformed current response retains old cards locked with Retry; current401/403 clears cards; retry recovers; changed query drops old cursor; valid empty response replaces old cards. Prior malformed/oversized/UTF8, latest-response/GET close-reopen/real delayed mutation, explicit single-POST, captured stale409, family planning/history and image fallback flows still pass. All55 physical geometry samples report0px delta, including320×568.

Recorded frozen private evidence: lint/typecheck/build exit0;223 distinct Node tests (82 recipe,34 family,39 menu,16 auth,20 plans,32 deployment) and7 Python tests pass; full Chrome flow exit0. Developer visually inspected the refreshed browse/selected mobile/desktop screenshots. These commands/browser/visual observations are attributed to recorded developer/orchestrator evidence and actual inspected logs; this reviewer did not rerun browser/build/suites for this narrow dialog-state change.

Only this report was edited by the reviewer. No application edits, builds/typegen, original-dev/cache effects, development/hosted access or data writes occurred. Clearance applies to the exact source above; later runtime drift requires fresh assessment. Human merge/release remain separate.
