# Brave discovery and parallel recipe curation — intent

- Author: orchestrator, from Rafael's active chat request, 2026-11-25.
- Status: Accepted for Design under the org product-manager intent gate.
- Decision: `org/reviews/intent-brave-parallel-recipe-search-001.md`.
- Owner request: “Lets implement Brave web search with parallel per-result curation in the app. Use ai sdlc org workflow for this intent”.

## Problem and selected outcome

The current single-call OpenAI research/curation provider typically takes tens
of seconds and returns at most six cards. Following live experiments, Rafael
selected Brave Web Search discovery followed by independent, tool-free model
curation of fetched source evidence, with curation requests running in parallel.
Implement this locally through the repository's delegated org intent/spec/plan
and independent code/security gates. Merge, push, hosted configuration changes,
migrations, deployment and release remain separate human gates.

## Scope and acceptance

- Replace the app's search discovery path with the exact Brave Web Search API
  `/res/v1/web/search`, not LLM Context or Brave Answers. Keep the existing
  configured OpenAI recipe model for source-specific tool-free curation.
- Fetch original pages through bounded safe transport. Each accepted recipe
  needs source-associated ingredients and observed cooking steps; snippets,
  model memory and generated recipes are insufficient. Bind URLs server-side.
  Treat all page/model/user data as untrusted; preserve text rendering.
- Run independent per-result curation concurrently, with request-wide budgets,
  process-wide caps and abort-aware queueing; no uncontrolled per-user fan-out.
  Benchmark twelve-way concurrency is design evidence, not permission for
  unbounded calls or a guaranteed latency target. Product ceilings for the first
  implementation are one Brave search, twenty initial search hits, twenty-four
  original-page fetch attempts including any collection expansion, twelve model
  curation calls and twelve returned cards per admitted request. Curation uses
  at most 1,200 output tokens per call with no automatic retry, research tool,
  or fallback provider call. At most twelve curation calls may run concurrently
  across this application process; architecture must specify bounded queueing,
  aggregate input bytes/tokens and cancellation. It may choose lower bounds
  where needed for correctness or the existing sixty-second request deadline;
  raising these ceilings requires a reviewed scope amendment.
- Return more useful recipes where available, targeting up to twelve validated
  unique cards from bounded discovery, with honest fewer/no-result behavior.
  Start with one Brave request considering at most twenty results. The target
  of twelve is a maximum, not an entitlement to pad or relax user constraints.
  Broad requests must remain useful: design bounded extraction of individual
  recipe links from relevant collections, or another deterministic bounded
  discovery treatment, rather than treating a collection itself as a recipe.
  Do not silently replace a broad request with guessed dishes or restrict all
  searches to a single publisher. Named dishes may use the original query with
  recipe-focused terms, while retaining every explicit user constraint.
- Preserve the Recipe/public API shape, family/admission authorization before
  all paid effects, private headers, overall request deadline/cancellation,
  sanitized errors, optional photo safety and two-job photo bound. A candidate
  failure must not discard other valid results; a parent abort must propagate.
- Required cooking/ingredient evidence failures reject the card; unsupported
  optional time/image metadata is omitted. Define precise evidence validation,
  single-recipe vs collection handling and source title binding in the spec.
- Support counts above six throughout notebook saved-status lookup/save flows;
  retain authenticated owner scope and existing narrow menu endpoint bounds
  through bounded request chunking where appropriate. No general recipe/meal
  CRUD, database migration, UI redesign or new persistent cache.
- Keep credentials server-only. Document the canonical Brave key and provider
  configuration. Existing `.env.local` credentials may be used privately for
  authorized bounded verification; no secret values are committed or logged.
- TypeScript fixtures prove discovery, curation validation, failures, ordering,
  process/request concurrency and budgets, timeout/abort/queue cleanup, source
  SSRF safety, and larger-result menu integration. Required lint/typecheck/build,
  recipe/photo/auth/family/menu/deployment and Python workflow regressions pass.
  Verify mobile/desktop UI in a real browser using isolated test infrastructure.
- Record actual end-to-end live timing and valid yield separately from fixture
  success. A narrowly bounded post-build live smoke may reuse existing keys;
  no new paid accounts/plans, provider spend limits, or hosted settings.

## Evidence and limits

The preceding chat's ignored local artifacts under
`build/brave-search-benchmark/` contain Web Search, LLM Context, Answers
availability, and per-result curation trials. Preserve a sanitized durable
research summary with exact settings and limitations before these files expire.

Most relevant: twelve candidate pages at concurrency 1/2/4 took 40.0/21.9/10.5
seconds for curation; all-twelve concurrent requests took 4.23 seconds. The latter
had 11/12 required-evidence passes, three optional time mismatches, and 93.4%
cached input. It excludes Brave discovery, photo enrichment and app latency.
Pages were refetched for the last comparison; character counts matched, but
baseline bytes were not retained. Original broad queries often found collections;
dish searches and recipe-specific URL paths improved standalone recipe yield.
These observations do not prove uncached performance, dietary fidelity, or
production-scale throughput. Never reduce validation to reproduce timing wins.

## Workflow boundaries

The existing dependency-aware migration workflow is unfinished at its separate
Production decision. Its exact graph/config/state/history are archived under
`org/archive/before-brave-parallel-recipe-search/`; no completion, approval or
release is implied by selecting this new work item. Preserve its audit records.
The existing org delegates intent acceptance to PM and spec/plan gates to peer
review; this request authorizes that local design/build/test loop. Human
code-owner merge and release gates remain pending until explicitly approved.
