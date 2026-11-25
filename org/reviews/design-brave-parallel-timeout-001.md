# Brave parallel search — owner timeout amendment review

- Reviewer: reviewer, independent of architect and implementation author.
- Reviewed amendment: `348baf0`; owner steering: `org/messages/ceo-0070.md`.
- Verdict: **Approved for local implementation. No blocking design findings.**
- This approval covers the timeout design only. It does not approve final source,
  resolve the separate instruction-ItemList finding, or authorize paid calls,
  merge, hosted changes or release.

## Correctness and scope

The owner asked that one slow recipe not hold completed results until the full
search deadline. The amendment reduces the former25second per-item model budget
to8000ms, starting before model-pool enqueue and covering headers, response body
and validation. It does not reset the clock after queue acquisition. Provider/
parent deadlines remain tighter upper bounds (`spec.md:88–103`). No new public
option, UI flow, retry, replacement call or higher usage ceiling is introduced.

The result contract is explicit: completed validated siblings survive a local
item expiry; a late answer is ignored. With no surviving card and an eligible
curation expiry, sanitized SEARCH_TIMEOUT wins over an explicit rejection, so
incomplete work cannot become a false successful no-results response
(`spec.md:206–220`). Parent abort continues to override all partial outcomes.
This is consistent with the owner intent and the existing60second handler.

## Security/resource behavior

Queued expiration removes the job without starting a late paid request. Active
expiration stops waiting for that item and signals cancellation, while its
module-scoped lease remains occupied until the underlying transport/body work
actually settles. This preserves the existing global source2/model12 ceilings
and avoids admitting replacement work while a timed-out operation still runs.
The per-search1Brave/24source/12curation/1200output-token bounds and aggregate
input/response limits are unchanged. No paid follow-up is authorized; the prior
three-query implemented-pipeline smoke budget is already exhausted.

## Implementation proof required before final source approval

The plan's existing manifest covers the focused orchestration/pool regressions.
Use short injected timing or a clock to prove:

- A valid completed sibling survives a hung item; late results are ignored.
- All-expired and mixed explicit-rejection plus expiry return SEARCH_TIMEOUT.
- Queue wait consumes the same8second budget; no reset or late start after a
  held lease releases. Check the deadline before a paid start and accepting
  output, including scheduling-delay boundaries.
- Parent abort wins even when a sibling already completed.
- An abort-ignoring active operation retains its lease until actual settlement;
  queued jobs, readers, listeners and timers follow existing cleanup rules.

Run affected recipe/concurrency/pipeline tests and final lint/typecheck/build.
The separate parser correction and this timeout implementation must both appear
in the final reviewed source. The earlier live performance observations used
prior timeout behavior; do not relabel them as an8second-live verification.

I reviewed the actual intent/spec/plan diff and owner decision. No application
edit, network/model request, database operation or implementation test was made
for this design-only approval. Full code/security review remains pending.
