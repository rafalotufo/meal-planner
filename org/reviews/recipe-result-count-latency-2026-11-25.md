# Recipe count latency — independent evidence review

Date: 2026-11-25. Reviewer: `review_latency_method` (independent subagent).

Reviewed `intent/recipe-result-count/latency-2026-11-25.md`, its sibling JSONL,
the temporary TypeScript harness, and the application provider/search/photo
implementation. No paid calls, application edits, or deployment actions were
performed by the reviewer.

**Verdict: approved as exploratory decision evidence. No required corrections.**
This verdict does not approve a product change, merge, or release.

- All nine retained records exactly match the live run's temporary JSONL.
  The recorded provider source SHA-256 matches the checkout.
- Independently recomputed all table values, completion/full-target counts,
  medians, ranges, and paired deltas. Six-result median: 36.435 s;
  ten-result median: 44.369 s; difference: 7.934 s (21.776%).
  Twenty completed once (8 results, 54.787 s) and timed out twice.
- Temporary variants change the research target and validated-result cap;
  existing model, research/output budgets, validation, cancellation deadline,
  and safe photo enrichment remain in effect. Photo attempts still cover
  only the first six recipes. No application source changes were observed.
- The report distinguishes returned count from requested count, failures from
  successful responses, and local provider/photo timing from application or
  browser latency. It discloses instrumentation overhead, the instrumentation
  clone's unbounded read, absent raw response retention, and incomplete timeout
  usage metadata.
- One trial per query/count does not establish repeat-run variance, p95,
  reliability, factual source quality, or dietary accuracy; the report says so.
  Keeping six under current budgets is a defensible provisional recommendation.
  It does not imply twenty is impossible with different budgets or ten always
  increases latency by the observed median percentage.

Validation: read-only Python recomputation and byte-for-byte data comparison
passed. Application lint/typecheck/build exit 0 was reported by the primary
agent; these commands were not independently rerun because the evidence change
contains no application code.
