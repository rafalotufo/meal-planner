---
artifact: intent/recipe-photos/intent.md
reviewed_at: 2026-11-23
reviewer: product-manager
verdict: approved
round: 1
---

# PM scope decision — reliable recipe photos

## Verdict

Accepted for Design under the org PM intent authority. The request is concrete:
inspect current results and improve recipe-photo selection when original pages
already contain useful photographs. This is a PM scope decision, not independent
peer review of PM-authored text. Separate spec, plan, code, and security gates
remain, with merge and release reserved for the human CEO.

## Findings

No blocking product ambiguity. The current fallback remains correct for genuinely
missing or inaccessible images, but it does not satisfy the requested improvement
when accessible recipe pages provide usable photos. Prefer larger source-supplied
images, avoid guessed or unrelated photographs, and fail softly without losing
otherwise valid recipe information.

The prior recipe-search spec prohibits following recipe URLs/image redirects
server-side. Better metadata retrieval is therefore a design change requiring
explicit new approval and security review, not a reason to bypass URL checks.
Provider-independent enrichment is a useful design candidate, not a PM mandate.
Preserve recipe-specific method/time/citation evidence and usage bounds.

## Evidence

- `org/intake/forms/recipe-photos-001.md`, Details: observed gnocchi cards use a
  150-by-150 Love and Lemons photo and omit Inspired Taste/King Arthur photos
  despite original pages containing photographs. These browser observations
  were supplied by the orchestrator; the PM did not independently repeat them.
- `org/loop/state.yaml`: the active recipe-search loop completed at turn six
  with `status: solved`; this is a new focused intent, not a reopened or extended
  loop budget.
- `intent/recipe-search/intent.md`, Acceptance criteria: source-backed pictures,
  honest fallback, original-source links, and preserved method/time accuracy.
- `intent/recipe-search/spec.md`, Grounding and validation / Resource and
  security boundaries: optional photo evidence is candidate-specific; images
  load directly in the browser; direct server-side recipe/image fetching is
  prohibited; the search deadline and per-process guards bound resource use.
- `intent/recipe-search/plan.md`, Live evaluation, limits, and handoff: hosted
  retrieval can omit image URLs; source comparison remains necessary.
- `intent/recipe-photos/intent.md`: captures focused acceptance, source-binding,
  fail-soft behavior, new retrieval review requirements, and exclusions.

## Handoff and limits

Architect should inspect the observed sources, propose deterministic metadata
selection and size preference, and explicitly address any new network boundary.
The reviewer/security researcher must assess SSRF, redirects, address resolution,
response/request/time limits, abort propagation, and untrusted metadata before
implementation. Avoid an oversized crawler or image service for this scope.

This PM turn made no application, provider-call, loop, graph, ledger, status,
commit, merge, or release changes. It performed no independent browser or live
source check. The orchestrator owns recording and committing the completed turn.
