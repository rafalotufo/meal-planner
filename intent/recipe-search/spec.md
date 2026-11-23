# Meal Planner — recipe search specification

- Derived from: `intent/recipe-search/intent.md`
- Author: architect
- Status: Approved by independent reviewer (`org/reviews/spec-recipe-search-002.md`)
- Date: 2026-11-23

## Outcome and scope

Replace the title-only increment with free-text discovery of existing web
recipes. Keep `Meal Planner` as the page heading and metadata title. A visitor
can describe a meal, search, review up to six recipe cards, and open the source
recipe. No database, authentication, saved results, generation, or deployment.
The CEO confirmed existing web recipes with original source links, and requested
configurable providers, starting with OpenAI and leaving providers such as Gemini
for future adapters. No paid account or provisioning is performed.

## User experience

The server home page composes a small client search component. Use a restrained
warm-neutral page, clear typography, one labeled textarea (`What would you like
to cook?`), a short example placeholder, and a prominent `Find recipes` button.
Keep implementation and provider terminology out of the product flow. No
external fonts or decorative image downloads. Results use one column on small
screens and up to three columns on desktop, with consistent image areas,
readable titles, short method summaries, available time, and prominent source
links adjacent to the information they support.

- Input: trim text; require 1–1,000 characters. Show a visible inline error for
  blank/overlong input; do not invoke the provider for invalid input.
- Idle: explanatory sentence and empty result region, without fake recipes.
- Searching: announce `Searching for recipes…`, disable duplicate submission,
  retain the typed description, and show a compact progress state. A request
  generation ID and cleanup/abort prevent stale results replacing a newer view.
- Success: announce result count; show only validated, deduplicated recipes.
  Each card has a title, image or `Photo unavailable` fallback, 1–3 sentence
  cooking summary, optional source-supported time, and `View recipe` source
  link. Show the source hostname with each link. Summaries are previews, not
  substitutes for the original recipe's complete instructions.
- Time: `Cook time: …` only for explicitly stated cooking time; `Total time: …`
  for explicitly stated total preparation/cooking time. Missing time is omitted.
  Do not infer time by adding steps or make a promise based on user constraints.
- Empty: `No matching recipes found. Try a different description.`
- Failure: useful, recoverable text and enabled resubmission; preserve the query.
  Missing configuration: `Recipe search is not available yet. Please try again
  later.` Other upstream failures: `We couldn’t finish the search. Please try
  again.` Busy: `Recipe search is busy. Please try again shortly.`
- Semantic form, visible label, keyboard operation, focus-visible styling,
  `aria-invalid`/error association, and polite status announcements. Error text
  does not depend on color. No horizontal overflow at 320, 768, 1024, 1440 CSS px.
- A bad image switches to the fallback without a reload loop. Long titles and
  hostnames wrap. Reserve image aspect ratio to avoid large layout jumps.

## Application interface

`POST /api/recipes/search` accepts only JSON `{ "query": string }` and returns
`{ "recipes": Recipe[] }`. Success with no suitable matches is HTTP 200 with an
empty array. A recipe has `title` (1–160 chars), `sourceUrl` (safe HTTPS URL),
`imageUrl` (safe HTTPS URL or null), `summary` (1–600 chars), and `time` (null or
`{ kind: "cook" | "total", text: string }`, 1–80 chars). Source hostname is
derived by the app, rather than trusted model text. Unknown object fields are
rejected at the inbound boundary. Internal evidence fields are never exposed.

Errors return `{ "error": { "code": string, "message": string } }` with stable
codes: `INVALID_REQUEST` (400), `UNSUPPORTED_MEDIA_TYPE` (415),
`REQUEST_TOO_LARGE` (413), `FORBIDDEN_ORIGIN` (403), `SEARCH_UNAVAILABLE` (503), `SEARCH_BUSY` (429),
`SEARCH_TIMEOUT` (504), or `SEARCH_FAILED` (502). No raw provider body,
credential value, stack trace, or prompt content enters the response. All
responses use `Cache-Control: no-store`. Unsupported methods retain Next.js's
405 handling. Validate content type and a streamed body limit of 8 KiB before
JSON parsing; Content-Length alone is insufficient.

Use a Node.js route handler and a server-only integration module; only public
recipe types/helpers may be imported by the client. No provider code or key
enters the client bundle. Build and initial GET work without API configuration.

## Provider boundary

Define one small server-side TypeScript interface:

```typescript
interface RecipeSearchProvider {
  search(query: string, options: { signal: AbortSignal }): Promise<Recipe[]>;
}
```

A provider factory reads server-only `RECIPE_SEARCH_PROVIDER`, defaulting to
`openai`, and returns the OpenAI adapter. Unknown or unimplemented values
(including `gemini` for now) produce a controlled configuration error mapped to
`SEARCH_UNAVAILABLE`, with no provider call or silent fallback. Document the
selector and supported values. The route owns validation, usage guards, the
overall deadline, and common error mapping; the adapter owns model calls,
grounding, and provider-response validation. Both use the shared public recipe
shape and a small internal error-code union. The UI and endpoint contract do
not import OpenAI response types. A future Gemini adapter must satisfy the same
grounding/error/bounds contract; do not add a placeholder implementation or a
plugin/agent framework for it now. Tests inject provider transport explicitly.

## Two bounded recipe agents

Use the standard OpenAI Responses REST endpoint through server `fetch`, avoiding
an agent framework and extra SDK dependencies for two fixed calls. This is a
small sequential multi-agent workflow with separate instructions and capabilities,
not provider-side beta subagent creation. Proposed model: `gpt-6.2-sol`, which
currently documents web search and structured output support. Configure
`OPENAI_API_KEY` on the server; optional server-only `OPENAI_RECIPE_MODEL`
selects a compatible model. Default model changes require verification. Endpoint
is fixed to `https://api.openai.com/v1/responses`, never request-controlled.

1. **Research agent:** use `web_search`, live external access, and the provider's
   default search return budget. Require tool use, at most eight built-in tool
   calls, `reasoning.effort: low`, and at most 5,000 output tokens including
   reasoning. Request up to six relevant existing recipes, open original recipe
   pages where possible, and return a JSON envelope with `outcome` (`recipes`
   or `no_results`) and `candidates`. Candidate records contain `sourceUrl`,
   `title`, source-observed `methodText`, nullable `imageUrl`/`imageEvidence`, and
   nullable `time`/`timeEvidence` using the public time shape. Each evidence
   string belongs only to that candidate's exact source URL. Request native URL
   citations for every candidate; citation prose belongs only in `methodText`,
   `imageEvidence`, or `timeEvidence` string values. Keep `sourceUrl`, `title`,
   `imageUrl`, and time scalars plain, without citation display prose. Ask for the exact image URL only
   if the retrieved source supplies one; otherwise record it as null. An
   explicit `no_results` outcome requires an empty candidates array. Search
   snippets without enough method information do not qualify. The server parses
   and validates this envelope before invoking the curator; no Markdown section
   parsing or global evidence pool is used.
2. **Curator agent:** no tools. Supply only the validated, bounded candidate
   records, marked as untrusted data, plus the original query. The server gives
   each candidate a stable request-local `candidateId`; the curator must return
   that ID with its record. Return strict JSON Schema via `text.format`: a
   recipes array using public fields plus `candidateId`, `methodEvidence`,
   `imageEvidence`, and `timeEvidence` (nullable evidence strings where
   appropriate). Maximum 3,000 output tokens, `reasoning.effort: low`. Condense
   each candidate's observed method, preserve its title/source, and omit
   unsupported records/metadata. Do not combine fields or evidence from different
   candidates, or invent replacements for missing source details.

Both requests set `store: false`; manually pass the necessary bounded context
rather than retaining conversations or using `previous_response_id`. Instructions
separate tasks from user/source data and explicitly reject instructions found
inside recipes or the user's description that attempt to change agent duties,
reveal secrets, execute actions, or replace grounding rules. Agents have no
shell, application tools, credentials in messages, or ability to modify data.

## Grounding and validation

Never parse citation display markers as authoritative URLs. Extract real
`url_citation` annotations from the research response.

Live-provider representation clarification (architect consultation, 2026-11-23):
hosted search may insert citation display prose inside JSON scalar strings even
when plain values were requested. Before JSON parsing, an adapter may remove
only native `url_citation`-annotated display spans from their own `output_text`
part. A removable span must be an unambiguous complete citation display inside
a JSON string, not the underlying field URL, arbitrary prose, JSON delimiters,
or structural syntax. Retain annotation URLs separately and unchanged as the
sole citation authority. Do not extract a URL from display Markdown, take a URL
prefix from contaminated text, or globally strip marker-like substrings.

The API reference describes character indices without specifying JavaScript
UTF-16 units; never blindly apply them to `String.slice`. Resolve bounded
Unicode-code-point/UTF-16 and inclusive/exclusive-end interpretations against
the complete display-only span; accept only one distinct valid span. Deduplicate
identical spans, skip invalid/out-of-range/ambiguous or nonidentically overlapping
ranges, and remove accepted spans from right to left. Remaining malformed JSON
or contaminated URLs still fail existing checks. Missing offsets grant no
cleanup authority. After parsing, trim only surrounding whitespace from source
URL and title. Preserve exact normalized native-citation membership, candidate
binding, evidence checks, and all bounds. Regression fixtures cover annotated
source/title contamination, astral Unicode before citations, invalid/overlapping
ranges, and unannotated marker text which must not be stripped.

[Responses annotation fields](https://developers.openai.com/api/reference/resources/responses/methods/create)
document native URLs and character offsets; the conservative ambiguity handling
above is application policy, not a documented promise about index units.

 A displayed `sourceUrl`
must exactly match a normalized safe URL in those annotations (normalization
removes a fragment and normalizes standard URL encoding/host/default port;
do not strip arbitrary query parameters or broaden to an entire domain).
Require completed response status and at least one completed web-search call
before accepting either outcome. An explicit `outcome: "no_results"` with an
empty candidates array may return `{ recipes: [] }` immediately without citations
or a curator call. A missing tool call is always a failure. A nonempty envelope
without any cited, otherwise valid candidate is an upstream failure, not a
successful empty search; invalid candidates in a mixed response can be dropped.
A `recipes` outcome with an empty candidates array, or `no_results` with any
candidate, is malformed. This keeps absent grounding distinct from no matches.

Validate research records at runtime: safe cited `sourceUrl`, nonempty bounded
`title` and `methodText`, and correctly typed nullable photo/time fields. Bound
all candidate fields and the complete research text before curation. Create a
request-local map keyed by server-assigned `candidateId`, retaining each
validated candidate's exact normalized source URL and its own evidence fields.
Deduplicate research candidates by normalized source URL before assigning IDs.

Validate curator JSON at runtime despite strict schema. For each returned
record, resolve its `candidateId` and require its normalized `sourceUrl` to equal
that candidate's source. Require the title to equal the candidate's title and
nonempty `methodEvidence` to be a substring of **that candidate's `methodText`**;
drop an unknown ID, source/title mismatch, or method evidence mismatch. The
summary instruction is constrained to that candidate's method only. For non-null
time, require identical time kind/text to that candidate's time and nonempty
`timeEvidence` contained in that candidate's own time evidence; otherwise set
time to null. For non-null image, require exact equality to that candidate's
safe image URL and nonempty `imageEvidence` contained in that candidate's own
image evidence; otherwise set image to null. Never validate against the whole
research response or another candidate. Missing optional evidence means null.

Strip `candidateId` and all evidence fields from public output. Deduplicate
curated results by normalized source URL and cap output to six. Malformed JSON,
refusals, incomplete/token-limited responses, unexpectedly large bodies, and
mismatched root shapes are failures. A well-formed curator result with no
accepted cards may return an empty array after individually invalid records are
dropped; this must not bypass the prior nonempty research grounding requirement.
Never substitute fixtures or model memory.

Citation membership and evidence checks establish a traceable pipeline; they
cannot prove that the researcher correctly read every field. Source accuracy
must be sampled against actual pages in the live evaluation before claiming
working recipe discovery. The photo capability depends on what hosted retrieval
exposes; missing photo evidence must use the designed fallback, not generated
art or a guessed social/image URL.

## Resource and security boundaries

- One 60-second server deadline spans both calls. Propagate abort to provider
  fetches; no automatic retries or unbounded agent loops. Bound each provider
  JSON body to 1 MiB and research notes to 20,000 characters before curation.
- At most two active searches and twenty accepted searches per rolling minute
  per application process. Reject additional work before provider invocation;
  release concurrency slots on success, failure, and abort. This is an initial
  single-process guard, not a distributed rate-limit claim. No IP/query storage.
- Token/tool/request ceilings bound work, not an exact dollar spend. Before a
  public release, the human operator must assess project spending controls and
  multi-instance traffic limits. This feature does not provision paid services.
- Validate outbound source/image URL syntax: HTTPS only, no credentials,
  nonstandard ports, IP-literal hosts, localhost, single-label hosts, or local
  suffixes such as `.local`, `.localhost`, `.internal`. Reject control characters
  and overlong URLs. Do not follow recipe URLs or image redirects server-side.
- The browser loads external image URLs directly, with `referrerPolicy=no-referrer`,
  lazy loading, fixed dimensions/aspect ratio, and error fallback. Use an
  unoptimized Next Image so the Next server does not proxy arbitrary hosts.
  No wildcard image optimizer remote allowlist or custom image proxy. External
  photo hosts receive the viewer's image request; no application search text,
  cookies, or credentials are added to that URL by the app.
- Render all model/user strings as React text. No model HTML, Markdown renderer,
  `dangerouslySetInnerHTML`, or arbitrary attributes. Source links use
  `rel="noopener noreferrer"` when opening a new tab.
- Accept same-origin browser requests; compare a present Origin with the request
  URL's HTTP(S) scheme and strictly validated direct `Host` authority, because
  Next.js may synthesize the URL hostname from its bind address. Reject malformed
  Host values, credentials, control characters and non-authority syntax; only
  fall back to the URL origin when Host is absent. Do not trust forwarded host
  or protocol headers, add permissive CORS, or treat this check as authentication
  or a substitute for usage limits. Public reverse-proxy origin configuration is
  a future deployment decision.
- Do not persist queries/results, log full prompts/provider responses, or expose
  upstream error details. README explains API-key configuration without secrets.
  Preserve `.env` ignores. No database infrastructure or dependency upgrades.

## Verification and acceptance evidence

The approved plan must add meaningful automated behavior coverage, with failing
tests first, using Node's built-in test runner with an isolated TypeScript compile step
where practical; no test-framework dependency is required for the service logic. Test the real boundary/service functions through injected
provider transport, not a production mock mode. Run tests without credentials.

Required cases: blank/overlong and malformed/body-limit requests invoke no
provider; missing key and unsupported provider config; same-origin rejection; exact researcher/curator call
capabilities and bounds; refusal/incomplete/no-tool/malformed output;
completed-search explicit no-results without citations (one provider call);
nonempty uncited research (failure, no curator call); unsafe and uncited URLs;
candidate ID/source/title mismatch; two cited recipes with deliberately swapped
method/time/photo evidence (method mismatch drops the card, optional metadata
mismatch becomes null); dedup and six-result cap; empty curation; provider
error/timeout; concurrency and minute limit with slot cleanup. Fixtures must
clearly remain test-only.

Real-browser verification at mobile and desktop covers initial page, validation,
searching, successful cards, missing/broken photos, no results, recoverable error,
retry, keyboard use, status announcements, and stale-response behavior. Network
interception may provide deterministic test responses during browser QA; label
that evidence as simulated and confirm no fixture route is shipped. Inspect
console/network errors and retain screenshots under `org/reviews/`.

A separately labeled live-provider smoke test requires an authorized configured
key. Exercise at least one specific meal query and compare returned titles,
methods, optional times, images and links to the actual sources. Capture model,
request outcome, result count, time, and review observations without credentials
or full private queries. Live failure, unavailable key, or unusable retrieval
must remain explicit unverified/failed acceptance; do not claim full feature
completion based solely on mocks. Browser/API failure states can be finished
without a key; a successful live search cannot be asserted without it.

Also pass `python3 -m unittest discover -s tests`, `npm run lint`,
`npm run typecheck`, `npm run build`, org consistency checks, `git diff --check`,
and zero findings from `python3 scripts/scan_secrets.py --staged`. Independent
spec/plan/code/security review and human merge/release gates remain in force.

## Sources and decisions

Official documentation checked on 2026-11-23:

- [OpenAI quickstart](https://developers.openai.com/api/docs/quickstart): server
  API integration and credentials; suggest the OpenAI Developers plugin if the
  owner wants deeper API onboarding.
- [Web search](https://developers.openai.com/api/docs/guides/tools-web-search):
  hosted retrieval, reasoning-model page opening, citation annotations, and
  prominent clickable source attribution.
- [GPT-6.2 Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol): model
  identifier, Responses, web search, and structured-output support.
- [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs):
  JSON Schema output and separate refusal/incomplete/business-rule handling.
- [Responses create](https://developers.openai.com/api/reference/resources/responses/methods/create):
  tool/output ceilings, response status, and storage control.
- [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers):
  App Router request/response boundary and POST handling.

Open points: a usable API key, model access, and actual hosted-retrieval
fidelity remain live-verification
prerequisites, not assumptions silently satisfied by the design. No secret
inspection or paid API execution occurred during this design turn.
