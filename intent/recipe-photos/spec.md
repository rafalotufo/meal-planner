# Meal Planner — reliable recipe photos specification

- Derived from: `intent/recipe-photos/intent.md`
- Author: architect
- Status: Approved — independent peer review (`org/reviews/spec-recipe-photos-001.md`) and security design clearance (`org/reviews/security-design-recipe-photos-001.md`)
- Date: 2026-11-23
- Intake evidence: `intent/recipe-photos/research.md`

## Outcome and scope

Improve photos on valid recipe-search cards using publisher-supplied metadata.
Fetch each exact cited recipe page once, deterministically select its photo,
and retain the existing model-grounded image or visual fallback on failure.
This spec explicitly supersedes the prior recipe-search prohibition on direct
server recipe-page fetching **only** for the bounded metadata path below.
No image binaries, redirects, arbitrary URL endpoint, image proxy, generated
photos, new LLM calls, provider adapter, persistence, or unrelated UI redesign.
Original source/citation membership and candidate-specific method/time validation
still complete before enrichment; metadata cannot change recipe identity.

## Integration contract

Keep the public `Recipe` and API response shape unchanged. Add a server-side
photo-enrichment function/decorator shared by all configured providers, after
`provider.search` returns validated recipes. It accepts at most six `Recipe`s,
the existing parent `AbortSignal`, and the original search `deadlineAt`.
The handler computes that deadline once when starting its existing 60-second
timer; do not start a fresh search deadline after provider completion.

Enrichment returns cards in their original order with only `imageUrl` changed.
It never changes title, source URL, summary, or time, drops no valid card, and
adds no cards. Each work item carries its exact normalized source URL; no
image evidence pool or reuse across different recipes. Configuration and
provider errors retain existing behavior. Photo-specific access, parse, DNS,
TLS, size, encoding, saturation, and timeout failures return the input image.
Build and initial page rendering make no metadata requests.

## Photo evidence and deterministic selection

Read only JSON-LD scripts, canonical links, and head Open Graph image metadata
from the exact successfully fetched source HTML. No JavaScript execution,
remote JSON-LD contexts, secondary page requests, arbitrary body image scan,
filename rewriting, inferred URL variants, or image binary probes.

Recognize Recipe JSON-LD root objects/arrays and `@graph` entries; `@type` may
be a string/array containing `Recipe` or its Schema.org URL. Do not recursively
collect Recipes from related-item/recommendation properties. A Recipe node is
associated with this result by an explicit `url`, `@id`, or `mainEntityOfPage`
URL matching the fetched source after safe normalization and fragment removal.
Explicit identity pointing elsewhere disqualifies that node. If the Recipe has
no explicit identity, accept it only when it is the sole Recipe node, a page
canonical or `og:url` matches the exact source, no declared page identity
conflicts, and normalized Recipe.name equals the card title. Normalize names
with NFKC, lowercase, punctuation-to-spaces and whitespace collapse; no fuzzy
substring matching or site-specific title rewriting. If ambiguity remains,
ignore Recipe images rather than borrow another recipe's photo.

Recipe.image supports URL strings, arrays, and ImageObject objects with
`contentUrl` or `url` (prefer contentUrl when both are usable). Preserve publisher
order; cap twenty image candidates. Accept explicit positive integer width/height
values (numeric or digit strings, at most 20,000 each). Never infer dimensions
from filenames such as `-500x500`, model prose, array order, or guessed variants.
Known dimensions below 160×90 are unusable; absent/invalid dimensions are
unknown, not a promise of sufficient size. Resolve relative metadata image URLs
against the exact fetched source URL, ignoring HTML `base`, then run unchanged
safe-URL validation. URLs must remain HTTPS and never contain credentials,
nonstandard ports, control characters, IP literals, or local hosts.

Choose in this order, deduplicating safe normalized image URLs:

1. Recipe images with declared width >=480 and height >=270: choose the smallest
   adequate declared pixel area (avoids unnecessary oversized downloads), then
   publisher order for ties.
2. Recipe images with unknown dimensions: choose publisher order. This can
   improve the observed 150 px thumbnail using a publisher's 500 px variant, but
   minimum quality is unverified until browser loading confirms actual size.
3. Usable head `og:image` / `og:image:url`, preferring its supplied HTTPS
   `og:image:secure_url` where present. Group width/height with their preceding
   root image; rank adequate known sizes, unknown sizes, then remaining usable
   sizes, using area/publisher-order tie rules above. This fallback requires
   a canonical or `og:url` equal to the exact source and no conflicting declared
   page identity. Do not use page-level metadata that describes another page.
4. Remaining usable but smaller declared Recipe images: largest declared area,
   then publisher order. Do not choose an explicitly tiny logo/avatar.
5. Existing validated provider image; otherwise null and existing fallback.

Recipe-specific imagery takes precedence over a possibly collaged social image.
Metadata is publisher evidence, not proof of photo contents or availability.
A source can still mislabel its photo, block hotlinking, or later change it;
review the three observed cases against their real pages and loaded images.
No provider evidence requirement is weakened: deterministic metadata becomes
an additional explicitly approved source of image evidence only.

## SSRF-safe HTML transport

Only the validated recipe.sourceUrl enters this transport. No independent
client-supplied metadata URL is accepted. Reuse existing safe URL syntax checks
and enforce HTTPS port 443, no userinfo, no IP literals, no local/single-label
hosts, no alternate numeric encodings, and no control characters. Normalization
preserves query parameters and path identity; fragments are not sent.

Use a per-fetch `node:dns/promises.Resolver` to resolve A and AAAA records and
validate **every** returned address before connecting. Missing-family ENODATA /
ENOTFOUND may coexist with a successful other family; other resolution errors,
no addresses, >16 total addresses, malformed addresses, or any non-public address
reject the fetch. Accept only ipaddr.js addresses classified `unicast` for IPv4
and IPv6 within global unicast `2000::/3` also classified `unicast`; reject mapped IPv4, transition/tunnel,
loopback, private, CGNAT, link-local, multicast, documentation, reserved,
unspecified and unique-local ranges. Normalize/check both families explicitly;
do not classify only the address eventually chosen.

Choose one validated address and pin it through the HTTPS request's custom
lookup; that lookup must never resolve again or return any other address.
Retain the original hostname as Host, TLS SNI, and certificate identity, with
normal certificate verification enabled. Use a dedicated non-reusing HTTPS
agent/connection, no global/proxy agent, environment proxy routing, socketPath,
custom CA, client certificate, or fallback connection. A failed selected address
fails softly; no retry on a new DNS answer. This closes DNS-check/use rebinding
and avoids accidentally reusing an unvalidated pooled socket.

Send one GET with fixed HTML Accept, `Accept-Encoding: identity`, an application
User-Agent, and `Connection: close`. Never forward request cookies, authorization,
API keys, query text, Referer, or other browser/provider headers. Do not follow
**any** redirect, even same-host HTTPS redirects. Accept only HTTP 200 HTML
(`text/html`) with absent/UTF-8/US-ASCII charset and absent/identity content
encoding. Reject compressed/binary/other-encoding responses without decompression.
Cap response headers at 16 KiB and actual body bytes at 1 MiB, including streaming
chunked bodies; Content-Length is only an early rejection aid. Decode UTF-8
strictly; malformed bytes fail softly. Destroy request/body/agent and cancel
outstanding resolver queries on timeout, abort, size failure, or completion.
No image-host fetch is made by the server; selected photos still load directly
in the browser with the existing no-referrer, lazy-load, aspect-ratio and error
fallback behavior.

## Bounds and failure isolation

- At most six source attempts per successful search, deduplicated by exact
  source URL. No retries, recursive fetch, redirects, cache, or persistent queue.
- One shared process-wide limit of two active HTML fetches **including DNS**,
  shared across the two admitted searches. Saturated callers skip unavailable
  slots rather than accumulate an unbounded waiting queue. Within a search,
  process source jobs in bounded batches and never create more network work
  than acquired slots. Slot/timer/listener cleanup occurs on every path.
- At photo-stage entry, skip enrichment when <1,000 ms remains or already aborted.
  Its soft deadline is `min(now + 6000, deadlineAt - 250)` milliseconds. Each
  fetch gets at most 3,000 ms including DNS/connect/TLS/body, capped by this soft
  deadline. Resolver has one try and a <=1,000 ms DNS timeout; its queries are
  also canceled by the outer timer/signal. Do not rely on socket idle timeout
  as the total deadline.
- The photo deadline is fail-soft: settle with already enriched/original cards
  before the parent deadline, cancelling outstanding work. Parent cancellation
  still aborts the full search; photo enrichment never swallows that authority.
  If the provider has already consumed the available time, return its valid
  cards immediately instead of waiting for optional photos to cause a 504.
- Parse HTML using bounded event callbacks, without building a complete DOM.
  Collect at most 16 JSON-LD scripts, 128 KiB each / 256 KiB combined, 20 image
  candidates, and bounded head meta values. JSON traversal uses an explicit
  bounded walk: depth <= 12 and at most 1,000 visited nodes. Ignore malformed
  individual scripts; metadata limits/ambiguity yield no new photo. Never eval.

## Dependencies and implementation boundaries

Use Node HTTPS/DNS for pinned transport, htmlparser2 `10.1.0` for HTML metadata
parsing, and ipaddr.js `2.5.0` for maintained IPv4/IPv6 classification. Registry
metadata checked 2026-11-23: both are stable/nondeprecated and include TypeScript
support. htmlparser2 11/12 are ESM-only; 10.1 has dual import/require exports and
preserves the existing Node16-compiled native tests without changing the test
system. ipaddr upstream main 3.0 is not the current registry release. Do not add
an HTTP client, crawler, DOM runtime, or image service. Pin exact versions and
npm-generated lockfile; inspect install scripts/transitive changes and audit
before implementation approval. Do not run unreviewed dependency scripts.
Separate pure metadata selection from DNS/transport and shared enrichment so
fixture tests can inject resolver/request/clock seams without production mocks.

## Verification and acceptance evidence

Write failing TypeScript tests first, compiled with the existing native runner.
Cover JSON-LD string/array/ImageObject and @graph; exact explicit identity;
KingArthur-style unique unidentified Recipe + canonical/title match; multiple
or conflicting Recipes/page identity; unrelated images/logos; OG image grouping;
relative/escaped URLs; absent/invalid dimensions and deterministic ranking;
malformed/deep/oversized metadata; unsupported or unsafe image URLs. Preserve
all prior recipe/source/method/time validation tests.

Transport fixtures cover private/public mixed A/AAAA sets, mapped/tunnel IPv6,
DNS errors/timeouts, pinning despite a later rebinding answer, TLS hostname and
certificate checks, redirects, header/body limits including dishonest lengths,
compressed/non-HTML/non-UTF8 data, slow/chunked bodies, cancellation and cleanup.
Enrichment tests prove globally <= 2 active DNS+fetch jobs across searches,
<= 6 attempts, saturation/near-parent-deadline skip, soft-timeout returning valid
cards, and unchanged non-photo fields/order on every failure. Keep fixtures in
TypeScript; no runtime fixture endpoint or tests dependent on changing sites.

Separately run the real safe transport/selector against the three exact URLs
in `research.md`, without a paid LLM call. Record HTTP/access outcome, selected
source-provided URL, metadata reason/dimensions, elapsed time and any fallback.
Use the current known recipe records or clearly labeled simulated provider
response for browser QA, while metadata/photo requests are real. At mobile and
desktop, inspect loaded natural image dimensions, readability and stable image
areas; Love and Lemons must exceed the observed 150×150, Inspired Taste and King
Arthur must load photos when their accessible metadata permits it. Verify a
broken-photo fallback separately. Do not label simulated provider responses as
live recipe discovery or claim universal photo coverage.

Run npm test, Python workflow regressions, lint/typecheck/build, org checks,
plan-sync, diff and staged zero-finding secret scan. Record real commands and
independent spec/plan/code/security verdicts; human merge/release gates persist.

## Primary sources and explicit limits

- [Intake publisher evidence](research.md) documents current source metadata;
  source identity details were additionally checked by the orchestrator.
- [Recipe](https://schema.org/Recipe), [image](https://schema.org/image), and
  [Open Graph](https://ogp.me/) describe publisher image/page metadata.
- Node22 [HTTPS](https://github.com/nodejs/node/blob/v22.0.0/doc/api/https.md),
  [HTTP options](https://github.com/nodejs/node/blob/v22.0.0/doc/api/http.md), and
  [DNS resolver](https://github.com/nodejs/node/blob/v22.0.0/doc/api/dns.md)
  document custom lookup, TLS hostname, streaming and resolver cancellation.
- [htmlparser2](https://github.com/fb55/htmlparser2) and
  [ipaddr.js](https://github.com/whitequark/ipaddr.js) document parser/classifier
  APIs; published versions/exports were verified using npm registry metadata.

HTML hosts can block requests or change metadata; identity, public-DNS, no-redirect,
encoding and size policies intentionally prefer fallback over broader crawling.
No credential inspection, paid calls, new dependencies, or application changes
occurred in this design turn. Independent security review must approve the new
network boundary before implementation.


## Integration with authenticated main — 2026-11-23

The authorized local merge preserves main's allowed-Google authentication and
pnpm migration. Recipe search is available only to a currently allowed session,
checked by both request middleware and the endpoint before effects. Anonymous
search returns401; unavailable authentication fails closed. HTTPS image loading
is permitted by CSP for source photos while script and connect policies remain
unchanged. No provider or photo-retrieval behavior changes. Original verification
remains historical; combined evidence is recorded separately in
org/reviews/recipe-merge-verification.md and independently reviewed in
org/reviews/recipe-merge-review-001.md. Production release remains unapproved.
