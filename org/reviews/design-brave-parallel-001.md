# Brave parallel recipe search — independent design review

- Reviewer: reviewer, independent of architect and PM.
- Reviewed design source: `f09624c`, with tooling-format correction `f9cd9d6`;
  early threat consultation: `a1b78ca`.
- Artifacts: `intent/brave-parallel-recipe-search/spec.md` and `plan.md`.
- Verdict: **Approved for local implementation. No blocking findings.**
- This is specification/plan approval, not implementation, merge or release approval.

## Review evidence

**Bugs/correctness.** The source/curation split is consistent with the owner’s
selected approach and preserves the existing public Recipe/HTTP shape. The
specification distinguishes ranked discovery from grounded source evidence,
retains the full original query when Brave retrieval must be shortened
(spec:18–25), assigns URLs server-side, rejects collection-as-recipe ambiguity
(spec:118–154), and requires title and ingredient/method excerpt checks
(spec:156–179). Stable discovery order does not depend on model completion
order. Candidate errors, legitimate rejections and total technical failure are
separate outcomes; parent abort has precedence (spec:190–199).

**Security/resource control.** The fixed request ceilings and aggregate encoded
input bounds are explicit before effects (spec:49–67). Process-wide source2/
model12 pools have bounded FIFO queues, abort cleanup and leases covering full
body consumption; a transport that ignores cancellation cannot free capacity
early (spec:69–93). Original and expanded URLs reuse the current pinned native
HTTPS loader, whose implementation already validates all DNS answers, denies
redirects/proxies/credentials, and caps time/encoding/body size. Collection links
are bounded and nonrecursive (spec:105–136). No model-produced URL is fetched.
The existing menu loader defaults are preserved, and photo metadata derives
from the already-fetched page, avoiding an unbudgeted second publisher pass.

**Compliance/handoff.** The accepted PM ceilings are retained without a new
account, provider fallback, persistent cache, database or deployment change.
The six-URL `parseMenuSourceUrls` contract actually exists in
`lib/menu/validation.ts:16`; the plan correctly changes notebook lookup into
at most two bounded authenticated chunks rather than widening that server
boundary (spec:201–211). Stale lookup/save reconciliation and failed-chunk
behavior are explicit. The plan names relevant implementation/test/documentation
paths and orders red-to-green slices before full verification. Empty paid-key
fixture handling, actual isolated Chrome390/1440 coverage, required repository
regressions, and a separately labeled maximum-two-query live smoke are included
(plan:20–43,88–117). Benchmark caching and direct-handler evidence limitations
are preserved rather than presented as production guarantees.

## Resolved workflow compatibility finding

[P2, Compliance] The original plan used prose-bearing manifest bullets and a
status header that the existing plan-sync parser did not recognize. This would
block the first implementation checkpoint even with semantic approval. Root
identified the issue; the reviewer reproduced `_plan_is_approved == False` and
`lib/recipes/brave.ts` absent from parsed literal entries. Architect correction
`f9cd9d6` supplied26bare path/glob entries and separated descriptions. The final
approval header is exactly `- Status: Approved`. Direct checks using the existing
parser now prove status acceptance and coverage of all declared application/test
paths. No workflow tooling or enforcement rule was changed.

## Implementation checkpoints

These are required proofs already in the reviewed plan, not new scope:

- Exercise global pools across provider instances, abort-ignoring body readers,
  queue saturation/removal, aggregate byte limits and no paid slot refills.
- Prove broad collection expansion reaches individual source pages without
  accepting an embedded example under its parent URL. Unsafe/ambiguous sources
  must fail closed; a JSON-LD Recipe node alone is insufficient.
- Prove twelve-card saved-status integration on the seventh/twelfth card, a
  failed second chunk, selection aborts and save-during-lookup races.
- Inspect representative live source matches; exact excerpts do not independently
  establish summary fidelity, dietary safety or “picky eater” suitability.

No code tests, mutation test, browser run, paid request, database operation or
application edit was performed in this design-only review. Final source/security
reviews must assess implementation and actual verification output independently.
