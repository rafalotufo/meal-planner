# Meal Planner — reliable recipe photos

- Author: product-manager, from Rafael's request
- Source: `org/intake/forms/recipe-photos-001.md`
- Status: Accepted for Design under the org PM intent gate
- Decision: `org/reviews/intent-recipe-photos-001.md`
- Date: 2026-11-23

## Problem

Several otherwise valid recipe-search cards have no photo even though their
original recipe pages contain photographs. The current gnocchi results show
the issue: Love and Lemons uses a 150-by-150 thumbnail, while Inspired Taste
and King Arthur have no image element or image URL. This makes recipes harder
to compare and gives the impression that useful recipe photos do not exist.

The orchestrator observed these cards in the current application and checked
that the original public pages contain photos. This is intake evidence, not a
claim that the PM independently reproduced the browser observations.

## Proposed outcome

Select usable recipe photographs more reliably from each result's original
source, preferring a larger suitable photo over a small thumbnail when the
source supplies one. Show the photograph that belongs to that recipe while
preserving accurate titles, links, method summaries, and available times.
Keep the existing intentional fallback when a photo cannot be safely obtained
or the browser cannot load it.

### Acceptance criteria

- For the observed Love and Lemons gnocchi result, select a larger
  source-grounded recipe photograph when the source exposes one, rather than
  retaining the observed 150-by-150 thumbnail solely because it was first.
- For the observed Inspired Taste and King Arthur gnocchi results, obtain and
  display a recipe photograph when an accessible source exposes a safe,
  recipe-specific image candidate. Record any remaining source-access failure
  explicitly; do not claim universal photo coverage.
- Selected images have evidence tied to the exact recipe source. Do not guess
  image URLs, rewrite a thumbnail URL to invent a larger variant, select an
  unrelated logo/avatar/advertisement, reuse another recipe's photo, or create
  generated art to fill a gap.
- Photo selection has deterministic, tested precedence for usable candidates
  and larger variants supplied by the source. The approved design defines
  candidate eligibility and sufficient evidence of size and recipe association.
- A missing, unsafe, blocked, malformed, or broken image leaves an otherwise
  valid recipe card usable with the existing fallback. Photo enrichment failure
  does not turn a successful recipe search into an error or discard its valid
  title, source, method, or time.
- Source URL/citation membership, recipe-specific method/time evidence, output
  limits, safe URL checks, credential handling, text rendering, usage guards,
  and search cancellation/deadline behavior remain intact. Any necessary new
  retrieval policy receives explicit design and security review before code.
- The photo improvement fits the existing configurable provider boundary.
  Do not add another LLM provider or require a database, login, or new paid
  service merely to retrieve recipe photos.
- TypeScript behavior tests cover photo candidate selection, source binding,
  malicious/malformed metadata, inaccessible sources, and failure fallback.
  Required application/workflow checks pass. Real-browser verification at
  mobile and desktop sizes confirms loaded photos, legible cards, stable image
  areas, and broken-photo fallback, with separately labeled live-source and
  simulated evidence.

## Affected users and systems

Visitors reviewing recipe-search results gain more useful photographs. The
search service's image selection and, if approved in Design, bounded image
metadata retrieval change. The existing search form, recipe data contract,
source links, method/time grounding, and provider configuration remain the
foundation; this is a focused follow-up to `intent/recipe-search/`.

## Constraints

- Preserve the previous feature's artifacts and audit trail; keep this feature's
  intent/spec/plan and design notes together under `intent/recipe-photos/`.
- The prior approved spec explicitly prohibits following recipe URLs or image
  redirects server-side (`intent/recipe-search/spec.md`, Resource and security
  boundaries). This intent does not silently remove that protection. Any new
  server-side metadata retrieval must be explicitly approved in the new spec
  and plan, with SSRF protection, DNS/address and redirect safety, response-size
  and request/time bounds, content handling, and cancellation considered.
- Treat publisher metadata as untrusted. Do not weaken existing safe URL checks
  or source-grounding rules to increase apparent photo coverage.
- No extra paid provider calls or paid-service provisioning are authorized by
  this PM capture. The architect should prefer the smallest practical design
  and document any operational requirements for the orchestrator.
- Preserve bounded org execution, independent spec/plan/code/security review,
  and human merge/release approval.

## Out of scope

Generated photos, recipe generation, stock-image substitution, an image-search
product, unrelated visual redesign, accounts, saved recipes, database changes,
new LLM providers, unbounded crawling, arbitrary image proxying, paid account
creation, deployment, merge, and release.

## Design questions

- Which source-provided metadata reliably identifies the recipe photograph and
  a larger usable variant on the observed pages? Define precedence and how to
  distinguish recipe photos from unrelated page images.
- Would provider-independent source-photo enrichment reduce dependence on what
  hosted LLM retrieval exposes? This is a preferred candidate to evaluate, not
  a mandated architecture or permission to bypass the prior fetch restriction.
- If direct source retrieval is necessary, how can it safely remain bounded,
  cancellable, fail-soft, and isolated from method/time/citation validation?
- Which live-source observations and fixtures will demonstrate improved
  coverage/quality without treating changing external pages as deterministic
  automated test dependencies?

No product ambiguity blocks Design. The architect owns the retrieval choice
and concrete safety contract; the independent reviewers must approve changes
to the existing network boundary before implementation.
