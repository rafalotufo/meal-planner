# Add a recipe URL to the menu — specification

- Author: architect
- Date: 2026-11-24
- Status: Draft for independent review and owner specification approval
- Input: accepted sibling `intent.md`; owner acceptance is recorded by
  `recipe-url-menu-intent-2026-11-24` in `gates/ledger.jsonl`.
- This document does not authorize implementation, migrations or release.

## Outcome and supported pages

On `/menu`, an eligible family member can paste a direct HTTPS recipe URL and
choose **Add recipe**. One explicit submission reads the page and saves its
available recipe details into the existing shared family menu. No discovery
search, LLM, paid provider, browser automation or secondary metadata service runs.
The existing search-result save, list, pagination and confirmed-removal flows
continue to work. No database schema, dependency or infrastructure change is
needed.

The first version supports **static HTML containing Schema.org Recipe JSON-LD**.
It does not execute publisher JavaScript, bypass login/bot protection, scrape
arbitrary visible prose, follow redirects, interpret microdata/RDFa or guess
missing recipe details. HTTP links, shortened/redirecting URLs, blocked/slow or
oversized pages and pages without supported, unambiguous recipe metadata return
an understandable failure. The form explains that not every recipe site is
supported and that the final direct HTTPS link is required. These are deliberate
coverage limits, not claims of universal recipe import.

## Interface and request boundary

Extend the existing exact `POST /api/menu` handler with the single discriminator
`?import=url`. Its JSON body is exactly `{ "sourceUrl": string }`; reject extra
or missing keys, arrays, other types, duplicate query keys and combinations with
`lookup`, `after` or any other query. Preserve existing no-query snapshot saving
and `?lookup=saved` unchanged. Do not add a route or change Proxy matching or
public auth-policy exceptions. The exact menu endpoint already bypasses Next's
body-cloning Proxy and uses the equivalent `menuApiResponse` guard.

Use `menuApiResponse` for every method and result. Canonical Host, current JWE,
mandatory session-token/identity binding, admission/family checks and all private,
no-store/security headers remain mandatory, including errors and protected 405s.
GET/HEAD with the import query are invalid requests under their existing query
contract, perform no page fetch or write, and do not become import methods.
Unsupported methods keep the existing guarded 405 and Allow behavior.

Extend the bounded menu-body reader with an import mode: exact same Origin and
cross-site checks, JSON media type, fatal UTF-8 decoder, five-second total body
read deadline and cancellation/reader cleanup. Import body limit is **4096 actual
bytes**, including chunked/lying-length input. Reject an oversized declared
length early. This remains independent of the 16384-byte snapshot/lookup limits.
An invalid body cannot trigger DNS, publisher requests or writes.

Trim outer whitespace of the input once, then require well-formed text and the
existing `safeRecipeUrl` policy plus the menu source's ASCII/2048-byte normalized
URL bounds. Do not add lenient HTTP conversion, credentials, ports, IP literals,
fragment identity, special hostnames or search queries. The normalized submitted
URL is the saved source and duplicate identity. Keep its path, trailing slash and
query order/values; do not discover, adopt or fetch canonical/OG/Recipe URLs.

The successful response is the existing validated `{ entry, created }` contract,
with HTTP 200 for both new and duplicate saves. Use existing 400/401/403/421/503
contracts for malformed input, lost access, misdirected requests and unavailable
services. New expected failures use generic, bounded messages with no hostname,
IP, body, resolver/TLS detail or private configuration:

| Status | Condition | Message |
| --- | --- | --- |
| 422 | Page unavailable under safe transport, or no supported unique Recipe | `Could not read a supported recipe from this link. Try the final recipe page URL.` |
| 503 | Import capacity occupied | `Recipe import is busy. Please try again.` |
| 408 | Parent request was cancelled before a write started, if a response can still be sent | `Recipe import was cancelled. Please try again.` |

Do not expose an arbitrary page fetch response, raw markup or detailed network
oracle. A 422 deliberately groups unsafe/unavailable and unsupported content.

## Acquisition and persistence order

1. Authenticate and require current family context through the existing handler
   guard before body parsing. Parse the bounded exact body and normalized source.
2. Recheck current session/admission/family after body completion, before any
   external effect. Use a family-scoped source lookup returning a validated
   existing entry when present; return `{ entry, created: false }` without a
   publisher fetch. This lookup must use current membership, never a caller's
   family ID, and must not return another family's entry.
3. Acquire a non-waiting process-local import slot; at most **two active import
   operations per Node process**. If occupied, return the busy response without
   DNS or write. No queue or retained HTML cache is introduced. Release the slot
   in `finally` on every outcome. This is a per-process resource bound, not a
   claimed global/serverless rate limit. Preserve the separate existing two-job
   photo-enrichment bound and its behavior.
4. Fetch exactly one page through the existing `createSafeHtmlLoader`, parse
   supported recipe metadata and validate the resulting menu snapshot. Hold no
   database transaction/connection or advisory write lock during network work.
5. Check parent cancellation and re-read the same cryptographic request session
   immediately before saving; it must still be current, admitted and bound to
   the original Google subject/email/session token. No cookie clearing or
   identity/email update occurs. Call existing `saveMenuRecipe`, whose immediate
   common-lock transaction rechecks current membership/admission and preserves
   source uniqueness and first-save retention. An intervening family/admission
   loss cannot produce a save.

The existing transaction controls concurrent imports/search saves/removals.
First committed save wins; duplicate replies retain its exact original snapshot,
ID, saved time and order. A removal followed by save may create a new entry as
before. The early existing-entry lookup linearizes at its authorized read and
may race a later removal; it does not promise the entry can never be removed
before the response arrives. No replacement/update operation is introduced.

All network/parse work is cancellation-aware. Reuse the loader's **three-second
maximum page deadline**, measured before DNS, within the parent request signal;
its deadline never resets on trickle. Check cancellation before/after loading,
after parsing and before save; the importer rethrows the parent abort instead
of turning it into a normal unsupported-page result. The HTTP boundary may map
that known abort to 408. A transport timeout while the parent remains active is
422. Never start a save after an already observed abort. Cancellation after the
transaction begins cannot guarantee rollback; a lost client response has an
unknown commit outcome and is resolved by checking the menu or safely retrying.

## Safe page transport

Reuse `lib/recipes/photo-transport.ts` without relaxing its contract or changing
existing photo callers. It already provides all-address public IPv4/IPv6 DNS
validation, rejection of mixed public/private answers and resolution errors,
16-address bound, a pinned native HTTPS socket, original hostname/SNI/certificate
verification, no global/proxy agent, no credentials/cookies/authorization, no
redirects, identity-only content encoding and 200 HTML-only response acceptance.
Retain 16384-byte headers, 1048576-byte response limit, UTF-8/US-ASCII charset
acceptance with fatal decoding, DNS/time bounds and cleanup of resolver, timer,
response/request and agent. Neither `fetch` nor a redirect-capable client may
replace this transport. Do not fetch image bytes or metadata URLs declared in
HTML. Failed TLS, non-200 responses and compressed/non-HTML/invalid/oversized
responses are failed acquisition, never recipe contents.

The low-level loader returns null on abort; the importer must explicitly check
the parent signal and propagate it. Existing search/provider and optional-photo
abort semantics, 90-second search route duration and cancellation configuration
remain unchanged.

## Structured metadata contract

Add a focused pure parser for imported recipe details using existing
`htmlparser2`; do not repurpose the existing photo selector to select a title or
summary it does not currently expose. Parse only `application/ld+json` scripts
(case-insensitive media type, optional parameters), not executable scripts.
Ignore individual malformed JSON documents; fail the whole parse on resource
limit overflow. Retain photo-parser-equivalent limits: 1 MiB HTML, HTML depth
256, 16 JSON-LD scripts, 128 KiB per script / 256 KiB total script text, at most
1000 visited JSON values and depth 12. Perform the bounded JSON traversal before
collecting recipes; never resolve remote JSON-LD contexts or references.

Find Recipe nodes only at document roots, root arrays and recursively nested
`@graph` arrays. Recognize `@type` as a string or array containing `Recipe`,
`https://schema.org/Recipe` or `http://schema.org/Recipe`. No fuzzy type matching,
nested recommendation traversal or merging fields from multiple Recipe nodes.
For each Recipe node, normalize declared `url`, `@id` and `mainEntityOfPage`
identities using the submitted source as the relative base and existing safe URL
rules; object identities may supply `@id` and/or `url`. Every declared identity
must be valid and equal the normalized submitted source (fragments normalize
away). A sole Recipe node with no declared identity can be associated with the
directly fetched document itself. An unbound node on a multi-Recipe page is not
eligible. Exactly one eligible node is required; zero or several fail as 422,
even if their names match. Do not select the first among competing recipes.
Canonical and OG URL tags never change source identity or resolve ambiguity.
A tracking URL whose declared Recipe identity differs may therefore require the
user to paste the publisher's final direct recipe link.

A recognized associated Recipe and a valid nonempty `name` are minimum evidence.
An ordinary page with only title/OG tags cannot become a recipe. This validates
the publisher's declared structured content; it does not independently verify
its truth or require downloading ingredients/instructions.

Convert selected-node fields into the current exact `MenuRecipe` shape:

| Field | Mapping and fallback |
| --- | --- |
| `title` | Recipe `name`, trimmed, nonempty, at most 160 UTF-16 units; invalid/missing/oversized title fails acquisition. No hostname/page-title/generated replacement. |
| `summary` | Recipe `description` as plain text, or the literal UI fallback `Summary unavailable.` if absent/invalid/empty. Use bounded `htmlparser2` text extraction to remove markup and decode entities, drop script/style contents, collapse whitespace and trim. Limit input to 8192 UTF-16 units; unsupported values use fallback. Truncate usable description to at most 600 units without splitting surrogate pairs. This is a stored absence label, not generated recipe content. Do not rewrite existing snapshots. |
| `time` | Prefer supported `totalTime`, otherwise supported `cookTime`, otherwise null. Support bounded positive ISO day/hour/minute/second durations with integer components, no years/months/weeks/fractions/signs; require total safe integer seconds between 1 and 604800 (7 days). Render exact positive components as English day/hour/minute/second text in at most 80 units, retain kind `total`/`cook`. Never sum prep+cook or infer unavailable time. |
| `imageUrl` | Select from this node's `image` using the existing photo selector's safe relative HTTPS resolution, ImageObject `contentUrl`/`url`, dimension validation and deterministic recipe-sized/unknown/small ordering. At most 20 image candidates; do not pool competing nodes. Optionally fall back to the existing selector's OG image result only when every collected canonical/OG identity binds the same source under that selector's existing page-bound rules. Missing/unsafe/invalid image becomes null. |
| `sourceUrl` | The normalized submitted source, never a publisher-supplied replacement. |

Text must be well-formed Unicode and satisfy existing menu control-character
validation. Invalid optional metadata is unavailable, never an opportunity to
relax storage validation. The final snapshot must pass `parseMenuRecipe` before
any write. Preserve current fields, runtime catalog and table constraints;
`Summary unavailable.` satisfies the existing nonempty summary requirement
without nullable-schema or migration changes.

Prefer a small import-specific image helper over changing search photo behavior;
it may reuse pure existing helpers if extraction can be shown behavior-preserving
with existing photo regressions. The plan must name any shared-file change and
prove existing photo behavior unchanged. Imported photos remain publisher URLs
rendered by the existing unoptimized browser image with no-referrer and missing/
failed-image fallback. No server image fetch, archive or durable availability
promise is added.

## Menu interaction

Render a small labelled form near the `/menu` heading, before saved entries,
including the empty menu. Label: **Recipe URL**; input uses `type="url"`,
`inputMode="url"`, sensible max length and a placeholder direct HTTPS link.
Helper text explains supported structured recipe pages and available metadata.
The server remains authoritative for validation. Show the form only when the
menu page's existing load/query state is valid; preserve existing load-error and
invalid-page recovery instead of hiding a failed read behind an apparent success.

The scoped client component owns only input/pending/feedback and its request
controller. Disable its submit and input while pending, prevent duplicate
in-flight submissions, show **Adding…**, and announce state in a polite atomic
live region. Cancel the browser request on unmount and impose a 15-second client
response deadline with cleanup. An unmounted/stale request must not update a new
form or claim success. No request runs on typing, input blur, render, GET/HEAD,
menu refresh or preload.

Validate success with `parseSavedMenuEntry` and a boolean `created`. New-save
feedback names the recipe and says it was added; duplicate feedback says it is
already in the menu. Retain the submitted input on error and provide retry.
On a lost/timeout response, say the result could not be confirmed and suggest
checking the menu or retrying, rather than falsely asserting no save occurred.
401/403 give the existing sign-in/family-access guidance. Invalid/acquisition/busy
errors have useful stable messages and do not display raw publisher content.

After successful add/duplicate, refresh the current server page without
optimistically accumulating cards. On older cursor pages, preserve the page and
provide a **Newest recipes** link so the user can see a newly saved recipe;
an old duplicate may itself be on another page and need not move to the front.
Maintain input focus and use live feedback; do not steal focus to an entry title
or mark recipe text selected. Keep existing removal-confirmation focus behavior,
source attribution, photo behavior, no collection maximum and 50-entry keyset
pages. Update the empty-state copy to mention adding a URL as well as search.
Ensure labels, focus outlines, wrapping, errors and controls work at 320/390px
and 1440px without horizontal overflow. No new modal, preview-confirmation step,
editable metadata, ingredients/instructions display or extra navigation is needed.

## Verification and review contract

Write meaningful strict TypeScript regressions before implementation. Use the
native Node runner and pinned tsx loader; tests and fixture helpers stay in strict
typechecking. Required evidence covers:

- Parser: single/root-array/@graph Recipe, association/relative identities,
  mismatched and ambiguous nodes, malformed scripts/limits, literal hostile text,
  missing/oversized fields, safe summary fallback/truncation, exact time mapping,
  image selection/unsafe images and no cross-recipe mixing. No fallback recipe
  from OG/title alone; no metadata/identity URL fetch.
- Transport/import orchestration: existing SSRF/DNS/pinning/TLS/no-proxy/no-redirect/
  bytes/encoding/deadline regressions; parent abort propagated before/after load
  and before save, all slots released, only two active imports, no unbounded
  queue, no fetch under a write lock, and zero provider calls.
- Real protected HTTP: valid import persists and survives restart/relogin;
  duplicate and concurrent URL/search saves preserve first snapshot; cross-family
  isolation, pending/denied/expired/mismatched-token identities, Host/Origin/body
  rejects, query/method contracts, protected headers on every outcome; admitted
  unfinished/trickled request is bounded before publisher effects; admission loss
  during fetch prevents save. Existing duplicate skips publisher acquisition.
- Real Chrome: supported import through actual protected HTTP, reload, retained
  available photo/time/summary and honest optional fallbacks, inaccessible/invalid/
  unsupported/busy/lost-response retry feedback, duplicate, keyboard/live status,
  older-page/newest navigation, confirmed removal and existing search save at
  mobile and desktop widths. Inspect screenshots visually and check runtime
  console/network errors, overflow and absence of provider calls.
- Packaging: compiled page/API/import parser/transport operate without migration
  or source files, including existing isolated deployment checks. No private
  configuration or HTML leaks into bundle, props or errors.

HTTP/browser success fixtures must exercise actual server import parsing and
save, not intercept `/api/menu?import=url` to fabricate success. Reuse the
existing test-process-only transport-fixture pattern: inject at the native
HTTPS/DNS module boundary from strict TypeScript test preload code into an owned
child server. Production imports no fixture, adds no env-controlled fake recipe
or auth bypass and never permits localhost/private fetches for tests. Chrome
may intercept only publisher image loads and intentional failure scenarios.
All databases/servers/browser profiles are isolated and owned; paid keys forced
empty. Hosted/development data is untouched.

Build verification must include the required lint, typecheck, build, recipe/photo,
menu, family, auth, deployment and Python workflow suites plus menu browser QA,
plan-sync, diff and staged-secret checks. Record actual outputs and coverage
limits; no live provider/hosted execution is implied. Independent code and
security reviews precede the human merge gate, and staging/release keep their
separate exact-source owner gates.

## Grounding and handoff

Reviewed actual `lib/menu/{body,http,store,validation,types}.ts`, exact menu API,
menu page/controls, `proxy.ts`, recipe types/validation/photo transport/parser/
enricher and existing menu/body/HTTP/browser and photo fixtures. Existing
`saveMenuRecipe` already handles membership and source uniqueness in its common-
lock transaction. The menu body-reader mode and handler discriminator are the
narrow request changes; snapshot schema and Proxy policy stay intact.

Applied API/interface design and security-hardening skill guidance for explicit
contracts and pinned safe acquisition. Confirmed the Schema.org Recipe and
[totalTime](https://schema.org/totalTime) duration contract against the primary
[Recipe definition](https://schema.org/Recipe); the supported subset and display
mapping above are this application's deliberate choices, not a claim to implement
all JSON-LD or ISO duration forms.

This worktree currently has no `node_modules`. Read the pinned installed Next
Route Handlers and route API guides from
`/Users/rafael/projects/meal-planner/node_modules/next/dist/docs/01-app/` during
Design: `01-getting-started/15-route-handlers.md` and
`03-api-reference/03-file-conventions/route.md`. They confirm explicit method
exports and Request/Response handlers. Before source edits, reproducibly install
this worktree's dependencies and re-read its relevant installed guides, including
server/client composition and current caching conventions. Do not change the
pinned Next, React, Node24, Tailwind or pnpm configuration.

No unresolved product question blocks this specification. Owner approval must
explicitly accept the supported-page limits, missing-summary absence label and
one-step import/save behavior described here. Independent review precedes owner
specification approval. Only then prepare the sibling implementation plan; no
application code or plan is produced in this Design turn.
