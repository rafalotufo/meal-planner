# Single-call recipe search — intent

- Author: product-manager, from Rafael's selected implementation request
- Status: Accepted for Design under the org PM intent gate
- Decision: `org/reviews/intent-single-call-recipe-search-001.md`
- Source: `org/messages/ceo-0019.md` and the active chat
- Date: 2026-11-23

## Problem

Recipe searches can take tens of seconds. The current OpenAI provider waits
for a web-research call and then a second, tool-free curation call before
returning recipe cards. Rafael requested timed comparisons, reviewed the
results, and selected combining research and curation into one model call.

The request is explicit: “Let run reseach and curaton in a single call. Use
SDLC org skill for this intent.” It authorizes local design, implementation,
and verification through the existing org gates. Human merge and release
approval remain separate.

## Proposed outcome

The configured OpenAI research model finds existing web recipes and produces
their concise card summaries in the same Responses API request. The server
validates source-specific evidence before returning the existing public recipe
shape. Remove the separate curator model request, without replacing it with a
retry or a fallback second call.

This intent explicitly supersedes the two-model-call arrangement in
`intent/recipe-search/spec.md`; its source-grounding, security, and resource
boundaries remain requirements. The default/configured model stays as it is.
This is the user's selected design, not a claim that the benchmark established
a universal latency win.

## Acceptance criteria

- An admitted, valid, configured search uses one OpenAI Responses request to
  research and curate existing recipes. Hosted web-search actions may occur
  inside that request within the existing tool limit. Invalid requests and
  unavailable configuration still make no provider request.
- There is no second curator request, automatic retry, or multi-call fallback
  on a successful, empty, malformed, incomplete, refused, or failed response.
- Cards retain original source titles/links, faithful concise method summaries,
  source-supported cook/total times, and optional source-supported photos.
  Require completed web search, native exact-URL citation membership, bounded
  source-specific method evidence, deduplication, and at most six cards.
  The architect must specify how combined evidence and summaries are bound and
  validated. Removing a model phase must not remove these checks.
- Explicit grounded no-results remains distinct from malformed or ungrounded
  output. Unsupported metadata retains honest null/fallback behavior rather
  than fabricated values. Treat user and retrieved text as untrusted data.
- Preserve the existing public `Recipe`/API shape, model configuration, optional
  photo enrichment and pinned safe transport, overall cancellation/deadline,
  request/concurrency/rate/byte/output bounds, sanitized errors, and server-only
  credential handling.
- Preserve Google session protection and allowlist handling, the search notebook,
  local filters/sorting/history, visible loading/error/empty states, source links,
  and mobile/desktop behavior. No provider or evidence details enter the UI.
- Meaningful TypeScript regressions prove the one-request path and grounding,
  failure, metadata, and abort behavior. Required tests, lint, strict typecheck,
  build, workflow checks, secret scan, and real-browser mobile/desktop checks
  pass. Label live-provider evidence separately from fixtures, record actual
  timings/result quality, and do not claim a guaranteed search duration.

## Evidence and limits

`research.md` preserves the concise findings from the local live comparison.
Single-call research/curation passed the experiment's structural validation in
six of six trials, with a 28.0-second median including photos and a
19.3–38.7-second range. Results varied with web work and card count. The
experiment is design evidence, not verification of the production change or
independent proof of every recipe fact.

## Out of scope and handoff

No new model/provider, dependencies, database, persistence, UI redesign, streaming,
caching, arbitrary retrieval, weakened evidence/transport checks, paid-service
provisioning, billing/limit change, merge, push, or production deployment.

No product ambiguity blocks Design. Architecture must define the combined
response envelope, validation and failure semantics, retain existing bounds,
and plan deterministic coverage plus bounded live verification. Independent
spec/plan/code/security review and the existing bounded org loop remain in force.
