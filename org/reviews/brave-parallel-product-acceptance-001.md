# Brave parallel recipe search — PM product acceptance consultation

- Date: 2026-11-25.
- Reviewer: product-manager; no application authoring, provider calls or source
  changes performed in this consultation.
- Reviewed: accepted intent/spec/plan, `live-verification.md`, `live-results.json`.
- Verdict: **Selected local implementation scope met with a material disclosed
  broad-query recall limitation. No additional product-scope correction required
  before independent source review and human merge consideration.**

## Reasoning

The accepted intent asks for bounded collection-to-individual-recipe discovery,
parallel source-specific curation and up to twelve cards with honest fewer-result
behavior. It does not promise twelve cards, a minimum broad-query count or a
particular live latency. The corrected broad observation demonstrates that the
original query can reach a recipe through collection expansion, undergo actual
parallel curation and return a validated card. Named-query evidence separately
shows eight cards, exceeding the old six-card cap. This meets the selected
functional local implementation scope without changing the acceptance criteria.

The actual broad result is nevertheless weak: **one accepted Butternut Squash
Mac and Cheese card from one publisher after twenty-four source attempts**.
Four curation calls ran in parallel; three candidates were rejected. That is not
proof of reliable broad coverage, sufficient choice, personalization for everyone
who likes chicken fingers/burgers, or an improvement in broad recall. A successful
HTTP200 alone is not a broad-quality success claim. The original502 remains part
of the evidence and is not erased by the successful corrective observation.

The accepted card is not disqualified merely because it is neither chicken
fingers nor burgers: those were examples of liked meals, not an explicit
exclusive ingredient/dish constraint. Conversely, the PM does not independently
certify that this family would like it or that it meets unstated preferences.
Exact source evidence checks and model constraint handling must remain intact.

## Required handoff disclosure

Human merge/release consideration must receive the exact8-card named/1-card
broad yields, the initial broad failure and corrected8.163-second observation,
source outcomes and budget saturation, rather than a claim of10/20 broad results
or a general production performance win. The current local implementation can be
reported complete only together with those limitations and passing independent
technical/security review. This consultation is not human merge, staging-gap,
paid-testing or release approval.

The chosen ceiling permits bounded partial results; it does not justify retries,
extra Brave searches, relaxed page identity/evidence checks, broader source/model
budgets or hidden dish substitution to produce a more attractive count. Current
live verification authority is exhausted. Further paid coverage needs separate
authority. Collection-link relevance/prioritization can be evaluated as a future
bounded improvement, using fixtures first, without pretending it was validated by
this observation.

No new numeric acceptance threshold is imposed after implementation. If the
owner requires consistently broader choice before adoption, that is a concrete
product decision for a subsequent reviewed scope/verification amendment.
