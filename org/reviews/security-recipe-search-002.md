---
artifact: recipe-search-implementation
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: clear
round: 2
---

# Recipe-search security correction rereview

## Verdict

Clear for the local implementation increment. The MED availability finding in
`security-recipe-search-001.md` / `security-researcher-0001` is resolved. No new
required finding was identified in the correction. This is not successful
live-retrieval acceptance, merge approval, or public release authorization.

## Evidence for resolution

- `lib/recipes/search.ts:81`–`:84` starts the shared deadline and caller-abort
  propagation before body intake. `:94`–`:98` reserves one of two active slots
  before awaiting the body, so stalled uploads cannot bypass admission.
- `search.ts:34`–`:45` attaches cancellation to the request-scoped signal and
  checks that signal before/after reads. Cancellation closes pending reads;
  the implementation deliberately does not await an uncooperative underlying
  cancellation hook. The reader listener and lock are released in `:59`–`:62`.
- `search.ts:98`–`:108` retains validation/configuration before spending the
  accepted-search allowance, rechecks its rolling limit before invocation, and
  gives both provider calls the same signal/budget. Invalid intake and missing
  configuration do not consume accepted-search allowance. `:112`–`:119` clears
  timers/listeners, releases only admitted slots, and cancels unread rejected
  request bodies without waiting on their hooks.
- The plan's HTTP task now explicitly covers intake in the request deadline and
  active capacity while preserving the paid-search minute semantics. No key,
  endpoint, provider, source-validation, UI, dependency, or release authority
  was changed by this correction.

## Independently run checks

`npm test` exited 0: **25 tests, 25 pass, zero failures/skips/cancellations**.
New TypeScript regressions verify never-ending body timeout, caller abort during
intake, rejected/oversized body cancellation with an uncooperative cancel hook,
and preservation of the accepted-search allowance after invalid/configuration
failures. Existing provider-timeout, caller-abort, slot-release, rate, grounding,
and input validation cases remain green.

An additional independent TypeScript check,
`/private/tmp/recipe-body-fix-recheck.ts`, exited 0 against the real compiled
handler. With two incomplete bodies and 20 ms deadlines, a third request
returned 429; both incomplete requests returned 504 within the 100 ms observation
window, both body readers were canceled, and neither provider construction nor
invocation occurred during the stall. The cancel hooks deliberately never
resolved, yet responses settled. A following valid request returned 200 and
invoked the injected provider once, confirming admission cleanup.

Targeted source/test secret scan exited 0 with zero findings; `git diff --check`
exited 0. The orchestrator/developer's post-correction lint/typecheck/build and
Python evidence was reported as passing, not independently rerun here. Initial
audit results remain applicable because package/lockfile inputs are unchanged:
zero production findings; four preexisting moderate dev-only Drizzle/esbuild
findings, no high/critical. The existing owner/recheck date and public-release
header/spending/shared-limiter decisions remain as recorded in round 1.

No paid/live provider call, secret output, application edit, commit,
status/loop/ledger mutation, merge, or release occurred in this rereview. The
orchestrator may close `security-researcher-0001` with this report as evidence.
Live provider/source fidelity remains separately pending.
