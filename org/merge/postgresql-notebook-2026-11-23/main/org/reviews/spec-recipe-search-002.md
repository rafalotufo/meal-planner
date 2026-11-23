---
artifact: intent/recipe-search/spec.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 2
---

# Independent recipe-search specification review — revision

## Findings (by severity)

No blocking findings. Both required changes from
`org/reviews/spec-recipe-search-001.md` are resolved.

## Evidence

- `intent/recipe-search/spec.md:114` now defines a parsed research envelope
  containing source-specific candidate records instead of a global evidence
  pool. The server validates and deduplicates records, then assigns its own
  request-local candidate IDs (`spec.md:160`).
- Curator validation resolves that ID, requires the same source URL/title,
  and checks method evidence against that candidate's method only
  (`spec.md:167`). Time kind/text and image URL must match the same candidate,
  with evidence drawn from its own corresponding evidence field
  (`spec.md:173`). This rejects the two-source evidence-swapping counterexample
  from round 1 while preserving the documented limitation that source-reading
  accuracy still needs live evaluation (`spec.md:188`).
- `spec.md:151` requires completed provider response and completed web-search
  execution for either outcome. Explicit `no_results` with zero candidates can
  return an empty result without citations or a curator call. Nonempty uncited
  output, missing search execution, and contradictory outcome/candidate shapes
  remain failures. Empty discovery is therefore distinct from absent grounding.
- Verification explicitly covers source-specific evidence swaps and separate
  no-results/no-tool/nonempty-uncited cases. The configurable OpenAI-first
  provider boundary, bounded transport/usage, safe rendering, responsive UI,
  and human merge/release gates remain aligned with the accepted intent.
- Re-read the changed specification against the prior review and accepted
  intent. `git diff --check` passed. Official API facts verified in round 1
  are unchanged; no additional external capability is assumed by this revision.

## Verdict and limits

Approved for build planning under the org peer-review gate. This is document
approval, not implementation or live-provider acceptance. No application code,
credential access, paid API call, browser run, loop/status/ledger mutation,
merge, or release occurred in this review.
