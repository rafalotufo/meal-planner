# Brave parallel recipe search — early threat model

- Author: security-researcher; date: 2026-11-25.
- Stage: design consultation only; **not implementation/security approval**.
- Inputs: accepted intent, `lib/recipes/search.ts`, `photo-transport.ts`,
  `validation.ts`, `lib/menu/recipe-metadata.ts`, `app/search-notebook.tsx`.
- User already authorized this integration and bounded local org loop. No new
  service plan, credentials, hosted settings, migrations or release is implied.

## Assets and trust boundaries

Assets are server API credentials, family authorization/private data, provider
spend, process availability and truthful recipe attribution. Trust boundaries:
request → family/admission/handler guards; Brave → candidate URLs; original HTTPS
pages → extraction; extraction → external model; model → public Recipe cards;
notebook → authenticated menu status/save. Brave, publishers, JSON-LD, links and
model output are all untrusted. Existing citations cannot simply be replaced by
model assertions: the replacement is explicit fetched-source evidence binding.

## Required controls and abuse cases

1. **SSRF and credential leakage.** `safeRecipeUrl` is a syntax check, not
   sufficient network admission. Every initial and expanded page must use the
   existing native transport's all-address validation, pinned HTTPS, TLS checks,
   no redirects/proxy/cookies/credentials, byte/header/encoding/time limits.
   Resolve links against the original fetched URL, ignoring HTML `base`. Never
   fetch model-generated links. Test mixed public/private DNS, rebinding,
   protocol/credential/port URLs, redirects, encoded/relative links, and private
   links discovered inside an otherwise public collection.
2. **Fan-out and denial of service.** One search/20hits/24page attempts/12model
   calls/1200output tokens are independent hard request budgets. Count attempts
   before scheduling, including failures, collection expansion and queue entry;
   never replenish on rejection. Bound input bytes (including JSON encoding),
   extracted nodes/text/depth/links and aggregate input across a request. Share
   model12/source2 active slots across provider instances in one process, with
   bounded queues and no unbounded Promise.all input or retry/fallback path.
   Per-process caps do not establish distributed spend control.
3. **Cancellation and orphan work.** Global slots cover complete response-body
   consumption and source DNS/body lifetime. Parent abort must propagate, remove
   queued jobs and stop later paid starts; do not turn it into a successful empty
   array or optional metadata failure. Release listeners/timers and slots on all
   paths, while not freeing a slot before the owned transport actually stops.
   Verify concurrent searches, mid-queue abort, body-read abort and saturation
   recovery. Preserve the existing60second request/90second route contract.
4. **Prompt injection and fabricated cards.** Supply page/user data separately
   from curation instructions; no browsing/tools in the curator. Return a strict,
   bounded schema, but independently validate its values. Assign URL identity
   server-side; titles and required ingredient/method evidence must belong to
   that page. Exact excerpts are necessary, not proof of summary fidelity or
   dietary matching. Reject unsupported required evidence; omit unsupported
   optional time/image fields rather than fabricating or rejecting sibling cards.
5. **Collection/source confusion.** A collection can embed one printable Recipe
   object (observed during benchmarks). Mere Recipe schema existence, or the
   existing menu parser's single-node fallback, cannot prove a standalone result.
   Bind declared recipe identities to source and evaluate page/recipe identity,
   heading/title and collection signals. Deterministic collection expansion must
   not emit the collection as a meal or attribute one child to its parent URL.
   Preserve all explicit user constraints in every curation call, even when the
   discovery query is shortened to Brave's600character/75word limit.
6. **Privacy and public projection.** Keep existing family/admission guard before
   provider work and handler origin/body/rate/concurrency checks. Send only the
   query and selected public-source evidence, never sessions, admission lists or
   family records. Keep keys/configuration server-only and errors sanitized; do
   not log source bodies, raw model responses, queries or provider error bodies.
   Public cards contain only the existing text-rendered Recipe fields. Preserve
   URL/photo validation; never render source/model HTML.
7. **Larger-result menu integration.** Chunk status lookups into existing six-URL
   bounds; validate each response against only its requested chunk. Abort/ignore
   stale notebook requests, fail affected unknown membership closed, and do not
   turn a lookup retry into a save. No broader menu endpoint, family-ID input or
   ownership exemption is required for twelve cards. Test the seventh/twelfth
   result, partial lookup failure and switching active searches during lookup.
8. **Verification isolation.** Test servers must force both Brave key names and
   OpenAI keys empty despite Next loading `.env.local`. Keep provider/page
   fixtures out of production imports; no fake-user bypass. Browser/DB tests own
   random isolated resources. Separately label bounded live implementation
   smoke timing versus fixtures, prior benchmarks and actual authenticated UI.

## Formal implementation gate

Review implemented queues/budgets, source parser and follow-up discovery,
curator validation, app configuration, menu chunks and cancellation tests.
Require actual lint/typecheck/build/regression and mobile/desktop evidence.
A source-associated excerpt or successful fixture is not proof of all recipe
facts. No security clearance is granted until those artifacts and code exist.
