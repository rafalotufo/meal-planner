# Brave discovery and parallel recipe curation — specification

Author: architect. Baseline design approved in `org/reviews/design-brave-parallel-001.md`.
Corrective amendment below is pending independent approval.
Input: PM-accepted `intent.md` and `org/reviews/intent-brave-parallel-recipe-search-001.md`.

## Outcome and public contract

Replace the runtime search provider with Brave Web Search discovery followed by
up to twelve independent tool-free OpenAI curation requests. Return the existing
`{recipes: Recipe[]}` response, in deterministic discovery order, up to twelve
unique original sources. Fewer matches and honest empty results remain valid.
No streaming, cache, database, new provider account, schema migration or UI redesign.
The current configured/default `gpt-6.2-sol` model remains; reasoning stays low.

`requireFamilyContext` and current proxy/session/origin/request-body guards stay
before provider effects. Keep 60-second search deadline, 90-second route duration,
Vercel cancellation configuration, two concurrent searches and twenty accepted
searches per process per rolling minute. Current public input accepts1–1000 chars.

Brave accepts ≤600 characters/75 words. Build a deterministic discovery query
from at most the first560 Unicode-safe characters and first70 whitespace words,
then append `recipe` if absent. Send the FULL original query (up to1000 chars)
to every curator; no accepted card may relax its explicit constraints. Long
queries may have reduced discovery recall; do not claim all constraints were
represented in Brave retrieval. Do not invent dish substitutions or force a
single publisher. Keep the original text in the UI/notebook unchanged.

## Configuration and interfaces

- `BRAVE_SEARCH_API_KEY` is the canonical server-only Brave credential.
  `OPENAI_API_KEY` and `OPENAI_RECIPE_MODEL` retain their roles.
- New default and selected provider is `brave`. Unsupported selections,
  including the retired runtime `openai` selection, fail with existing sanitized
  SEARCH_UNAVAILABLE. No automatic paid fallback. Existing `openai.ts` may remain
  as historical/tested adapter code, but is not selected by runtime dispatch.
- Update `.env.example` and README; authorized local activation changes only
  `.env.local`'s provider selector to `brave`, preserving all credential values.
  Hosted selectors/keys and deployment remain unmodified/unapproved.
- Preserve `RecipeSearchProvider.search(query,{signal})`; an optional
  `deadlineAt` may be added to its options and passed from `createSearchHandler`.
  Direct provider calls get their own55-second child budget. Existing providers
  accepting only signal remain structurally compatible.
- Inject trusted endpoint fetch/source-loader/clock/pools through factories for
  deterministic tests only; do not introduce environment-selected fake users,
  source URLs, fixture transport, or alternate trusted provider endpoints.

## Bounds and scheduling

Hard per-admitted-search ceilings, including collection expansion:

| Work | Ceiling |
|---|---:|
| Brave requests / initial usable results | 1 / 20 |
| Safe original-page fetch attempts | 24 |
| Model curation calls / output tokens each | 12 / 1200 |
| Returned cards | 12 |
| Model payload UTF-8 bytes per item | 32768 |
| Model instruction/schema bytes per item | 8192 |
| Aggregate model payload + instruction/schema bytes | 491520 |
| Brave/model response body | 1 MiB each |
| Source HTML body | existing1 MiB each |
| Extracted evidence text per item | 24000 characters, also payload byte bound |

Byte ceilings bound input work before paid requests. No exact input-token or
currency ceiling is claimed without provider tokenization/account controls.
Reserve budget synchronously before effects, deduplicate before reservation,
never retry, and do not refill a failed curation slot with another paid call.

Module-scoped shared pools cap source/metadata jobs at2 active +48 queued and
model calls at12 active +24 queued across provider instances in one process.
FIFO acquisition checks parent/deadline before enqueue and immediately before
starting. Queue overflow is SEARCH_BUSY if no useful result; otherwise retain
completed valid results. Queued aborted jobs are removed promptly without
starting network work. Release an active lease only when its underlying work
settles, even if a caller has stopped waiting. Leases cover DNS/connect/headers
and full bounded body consumption, not just the fetch promise or headers. All
per-job timers/readers/listeners are cleaned up when actual work settles. Tests must demonstrate no
replacement job starts early when a fixture transport ignores abort. No
process/distributed rate-limit guarantee is implied; deployment remains gated
on separately reviewed provider spend and multi-instance controls.

One search uses2 source workers through the shared pool. Curation schedules
all selected source candidates concurrently through the shared model pool.
Only page evidence for up to twelve selected candidates is retained. No raw
page, query, credentials or provider error body is logged/persisted by runtime.

Brave deadline≤10seconds. Source discovery phase≤20seconds after Brave; each
actual source fetch retains existing≤3second DNS/HTTPS timeout. Provider work
has a55second child deadline bounded by parent deadline. Model calls have
≤25seconds each, including shared-pool wait, and cannot outlive provider/parent
budget. Parent abort always propagates; the handler keeps its existing504.
Local candidate/phase expiration may produce a valid partial result; it is not
permission to swallow parent abort. Cleanup cancels pending readers/queues.

## Discovery and safe source evidence

Call only `GET https://api.search.brave.com/res/v1/web/search` with key header,
`count=20`, English/Canada defaults matching trials, and plain text decorations.
Disable redirects. Parse bounded JSON; require a valid `web.results` array;
legitimate empty results return no results, malformed discovery is SEARCH_FAILED.
Only safe HTTPS result URLs become candidates; use existing URL normalization,
retain query parameters and deduplicate exact normalized source URLs. Search
snippets/title/image metadata never establish recipe evidence.

Every original-source request uses existing `createSafeHtmlLoader` without
changing defaults used by menu import. Keep all-address public DNS validation,
pinned native HTTPS, hostname verification, no redirects/proxy/credentials,
header/body/encoding/time bounds. Enclose its jobs in the shared source pool;
recheck parent abort after its null return because optional loader catches abort.
No URL from model output is ever fetched.

Process source waves of two and their results in queue order, independent of
completion order. Original search rank defines order; expanded links inherit
parent rank plus link order. Stop selection at twelve eligible candidates or
the source-phase/budget limit. Never stop merely because twelve unverified
collection pages were fetched.

### Broad-query collection expansion

Parse HTML with installed htmlparser2; exclude scripts/styles/navigation/header/
footer/aside from page text and ordinary links. Principal-heading identity is a
separate channel: capture an H1 inside the main/article content region even
when its immediate wrapper is an article header. Do not capture site-header,
navigation, footer or sidebar headings, and do not admit header links or body
text through this exception. Retain the existing single principal H1 count and
its exact normalized binding to the unique associated Recipe name; conflicting
or multiple content headings remain unsupported. Bound parser depth≤256, visited
JSON-LD nodes≤1000/depth≤12, ≤16JSON-LD scripts and ≤262144combined script bytes.
Recognize explicit ItemList/CollectionPage or collection/category/index URL/title
signals; a bare Recipe object is insufficient because collections embed recipes.
Reject a collection as a card. Expand at most two relevant fetched collections,
up to twelve deduplicated safe links from each, within the same24 total fetch
budget. Prefer ItemList item URLs (ignore javascript/data), then content-region
anchors whose text/path suggests a recipe. Reject current page/fragment-only,
login/account/cart/search/category/tag/pagination/media/download/navigation links.
Resolve relatives against actual fetched source, ignoring HTML base tags; all
children still pass full
safe transport. Insert eligible children before remaining unexpanded search
hits so twenty collection hits cannot exhaust the fetch budget before recipes.
No recursive expansion of collection children and no additional Brave request.
Fixtures must prove relevant broad collections lead to individual cards and
avoid arbitrary embedded links or examples being presented under parent URLs.

### Candidate identity and text

A selected candidate needs a bounded source title, ingredients and cooking
information from its own fetched page. Prefer a unique source-associated Recipe
node: normalize each declared url/@id/mainEntityOfPage, strip fragment using the
existing URL helper, and reject conflicting identities. If identity absent,
require a sole Recipe and a consistent principal heading; never select another
recipe from a multi-recipe graph. Collection detection overrides embedded Recipe.
For a normal standalone page without usable JSON-LD, principal heading and
bounded content-region cooking/ingredient text may be supplied to the curator,
which must reject insufficient source evidence. Avoid relying on snippet text.

Create a bounded source record with server-owned sourceUrl/title choices,
plain source text and selected recipe ingredient/method text. Trim at Unicode
boundaries; if fixed fields exceed payload bound, skip the candidate. Text
normalization must be deterministic and shared by quote checking. Do not truncate
JSON into apparently authoritative structured data or borrow adjacent recipes.

## Per-result curation and validation

One `POST https://api.openai.com/v1/responses` per selected candidate: existing
model, low reasoning, store:false, no tools, max_output_tokens1200. Use strict
JSON-schema output supported by Responses (`text.format`). The prompt treats
original query and all supplied evidence as untrusted data, forbids following
embedded instructions/model-memory substitutes, asks to reject collections,
insufficient methods/ingredients and explicit query mismatches, and requests a
faithful one-sentence summary only from this source.

Result fields: accepted:boolean, reason:string, title:string|null,
summary:string|null, methodExcerpt:string|null, ingredientExcerpt:string|null.
Optional time/image values are derived deterministically from the source,
rather than generated by the model; this avoids observed metadata formatting
failures. Rejected results return null card fields. Reasons are not public/logged.

Require completed non-refused output, exact schema, bounded title≤160/summary≤600,
method and ingredient excerpts≤350, both nonempty exact substrings of their own
source evidence. Title must match a server-owned observed title choice after
whitespace normalization; do not trust model-written sourceUrl or identifiers.
Required failures reject the card, never repair quotes through another model
call or loosen containment. Exact quotes are structural evidence, not proof of
all dietary claims; independently inspect representative live source matches.
Keep the full query on each call and preserve conservative unknown/null behavior.

Select optional photos from already-fetched HTML using existing
`selectRecipePhoto` source/title association rules. Derive explicit total/cook
metadata from the associated Recipe node's stated durations; no arithmetic to
infer total from prep/cook. Unknown/conflicting/malformed metadata stays null.
No second publisher photo-fetch stage for Brave: server no longer attaches
`createPhotoEnricher` to this path. Existing photo transport/metadata/enricher
modules and regression evidence remain intact. All new source/photo metadata
network work therefore stays within the same24attempts and shared2active jobs.

### Results and failures

Sort accepted cards by source discovery order, then deduplicate server-owned
sourceUrl and cap at12. A source/model error only rejects that candidate.
If at least one valid card survives, return it despite other local failures.
If all eligible curations explicitly reject, return empty recipes. If every
attempt failed technically and none made an explicit rejection, return sanitized
SEARCH_FAILED (or SEARCH_TIMEOUT for exhausted local time, SEARCH_BUSY for pool
capacity). Do not describe total provider failure as genuine no-results.
Parent abort takes precedence over all empty/partial/error outcomes.

## Twelve-card notebook/menu integration

Keep server `parseMenuSourceUrls` and six-URL lookup endpoint limit unchanged.
Validate/normalize up to12 current search sources separately, split into chunks
of≤6 and perform at most two authenticated POST lookups. Validate each response
against only its chunk; never accept an out-of-chunk source. Combine only current
selection/generation results. Abort both requests on selection change/unmount.
A failed chunk must not mark its sources unsaved or initiate saves; retain known
saved statuses and expose existing retry status for affected unknown sources.
Preserve save-version reconciliation so stale lookup responses never overwrite
new successful saves. No client keys/provider/evidence details or new UI flows.

## Verification and release boundary

Meaningful TypeScript tests cover bounds/queues/cancellation/hostile content,
collection expansion and source association, unavailable config and no paid
fallback, optional metadata, partial failures, stable ordering and twelve-card
saved-status chunks. Existing auth/session/family/proxy/menu guarantees remain.
Tests own isolated servers/DBs and force both Brave key aliases and OpenAI key
empty; production code must not import fixtures. Real Chrome/CDP via existing
`tests/auth/chrome.ts` at390/1440 verifies12visible cards, menu saved-state checks,
keyboard/focus, filters, retry/stale-save races and no overflow/console errors.

Run repository lint/typecheck/build, recipe/photo, auth/family/menu/deployment
and Python regressions, secret scan and workflow checks. The baseline allowed
two live implemented-provider/handler smoke searches using configured keys. Both
were executed: the named query returned eight cards in9.701seconds; the broad
picky-eater query returned sanitized502 in15.784seconds with one Brave request
and zero model requests. Preserve that failure as actual observation.

The corrective amendment proposes ONE additional live smoke of that same broad
query after the principal-H1 correction, relevant fixture/full-build checks and
independent amendment approval. The total ceiling becomes three live searches
for this implementation verification, with every per-search source/model/byte/
time/concurrency ceiling unchanged. No further live retry, plan/account change,
provider spend-limit change or hosted action is included. Without peer approval,
the original two-query cap remains in force. For the authorized smoke, report
stage timings and validated yield without private queries or source bodies.
Label it as excluding authenticated HTTP/browser if run directly. Paid keys stay
empty during protected HTTP/browser fixture testing. No new deployment is
included; merge/release require fresh explicit human authorization.

## Sources read

- Installed Next16.4.6 route-handler guide:
  `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`.
- Installed Image API guide, current Recipe API/source transport/notebook/menu
  implementation and `research.md` benchmark limitations.
- Official Brave Web Search API and search-operator docs from this chat; official
  OpenAI Structured Outputs guide (Responses `text.format`) used in prototype.


## Corrective amendment evidence — principal H1, 2026-11-25

Status: Proposed for independent peer review, not self-approved by architect.
The actual broad-search source phase fetched My Kids Lick The Bowl collection
children successfully but emitted no eligible candidates. The saved local
`broad-source-diagnosis.json` and `broad-source-{2..12}.html` show matching source
Recipe identity/canonical/title evidence, while the generic header suppression
removed principal H1 elements inside article headers. This is a parser defect,
not evidence that Brave produced no recipes and not permission to relax source
identity, graph limits, TLS/SSRF or collection rejection.

A minimal synthetic regression must first fail for a valid article/header/H1
source, then pass after separating identity capture from suppressed page text.
It must still reject siteheader/nav dummy headings, conflicting principal title,
multiple content H1s and a collection embedding one Recipe. Replay saved public
HTML offline to show the exact missed children can now reach curation. Do not
claim this replay is a successful live model/admission/browser run. The one
proposed corrective live smoke checks that the implemented pipeline now serves
the original broad query; it does not erase the prior502 or guarantee yield.
