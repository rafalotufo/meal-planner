# Shared saved recipe menu — specification

- Author: architect
- Date: 2026-11-24
- Status: Draft for independent security/peer review, then human specification approval
- Input: accepted sibling `intent.md`; PM decision `org/reviews/intent-saved-recipe-menu-001.md`
- Owner decision: one shared menu per family (`org/messages/ceo-0047.md`)
- Implementation and migration execution are not approved by this document.

## Outcome and scope

Current family members can add a search result to their family's durable menu,
visit `/menu` to see its saved recipes, and remove entries. All current members
have the same add/read/remove permissions. A family's menu is isolated from every
other family. Persistence is PostgreSQL, not browser storage or the search notebook.

The first version is a bounded collection with **up to 200 recipes per family**,
newest saved first. Every saved recipe remains visible on one page; there is no
pagination, sorting control, calendar, recipe editing, ingredient import, or new
provider call. The cap bounds read/render/storage costs and is visible when full;
there is no silent truncation or eviction. A later cap change requires review.

This is a narrow proposed exception to AGENTS.md's earlier “no recipe/meal CRUD”
restriction: store validated result snapshots, list them, and remove them. It
becomes actionable only after the spec and implementation-plan gates. General
recipe creation/editing and meal CRUD stay excluded.

## Grounding and technical choices

`app/recipe-card.tsx` already renders `Recipe` text, optional time/photo, and
an attributed source link. `app/search-notebook.tsx` renders those cards;
`lib/recipes/notebook.ts` keeps search history in client memory. `Recipe` in
`lib/recipes/types.ts` has no durable ID. The provider bounds titles to 160,
summaries to 600, and time text to 80 characters. `safeRecipeUrl` in
`lib/recipes/validation.ts` validates HTTPS URLs and removes fragments.

`lib/session.ts` supplies current family context; `lib/identity-access.ts`
rechecks admission and membership. `lib/db/connection.ts` supplies typed bound
queries and a single-connection READ COMMITTED transaction with common advisory
lock and local timeouts. Existing migration SQL/journal, runtime metadata and
catalog are reviewed together. Runtime compares the complete catalog exactly.

No new framework, package, ORM, service or database infrastructure is needed.
Use explicit Route Handlers, following existing family HTTP endpoints. Keep the
home page and `/menu` server components; client components own only save/remove
pending and feedback state. Frozen dependencies were installed by the orchestrator during Design. Checked
the pinned Next guides for Route Handlers (`01-getting-started/15-route-handlers.md`),
server/client components (`05-server-and-client-components.md`), route context
(`03-api-reference/03-file-conventions/route.md`) and caching. Route parameters
are promises; GET handlers are uncached by default. This checkout does not enable
Cache Components, so preserve its current dynamic/session behavior and use
`02-guides/caching-without-cache-components.md` rather than enabling the new
cache system. Recheck relevant pinned guides before implementation.

## Saved snapshot and identity

The save input is exactly `{ title, sourceUrl, summary, time }`. All four keys
are required; extra keys, arrays, wrong types and omitted/null required text
fail validation. `time` is either null or exactly `{ kind, text }`, with kind
`cook` or `total`. The client copies these fields from the selected result;
it does not send `imageUrl`, user/family IDs, timestamps or entry IDs.

Validate text as strings, trim outer whitespace, require nonempty values and
maximum UTF-16 lengths of title 160, summary 600 and time text 80. Reject NUL,
other C0 control characters except tab/newline/CR, and DEL; reject unpaired
surrogates. Render all values as React text, with wrapping. Time remains the
source's label/text, without parsing into an invented duration. No raw HTML,
Markdown rendering, scraping or source refresh occurs when saving/listing.

Normalize `sourceUrl` with the existing `safeRecipeUrl` and then require its
normalized serialized URL to be ASCII and at most 2048 bytes. The normalized
URL is both the source link and recipe identity. Keep its path, query parameter
order/values and trailing slash as serialized by WHATWG URL; do not strip
tracking parameters, lowercase paths, follow redirects or discover canonicals.
Fragments are removed and hostname/default-port normalization follows the
existing function. Two different query strings remain distinct. This predictable
rule follows current search normalization; it is not semantic recipe matching.

One entry per `(family_id, source_url)`. The first committed save retains its
snapshot, ID and saved time. Repeated/concurrent saves return that existing entry
without replacing text or changing order. Valid duplicate saves succeed even
at capacity. A delete followed by a new save creates a new ID/time and position.
A delayed remove targets the old entry ID and cannot remove its replacement.
Concurrent add/remove commits follow the common transaction lock's serialization
order; no stronger ordering than committed database outcomes is promised.

The server validates structure and URL safety; it does not cryptographically
prove that text came from an earlier paid search. An admitted family member can
forge an otherwise valid snapshot request. There is no public write access or
new user-authored-recipe UI. Avoid search-result signing/token storage solely
for this collection; do not present persisted client text as newly verified source
content. Source attribution and the existing search grounding remain intact.

### Photos

Save only text/source/time. Persist **no photo URL, image bytes or metadata**.
The menu uses the existing intentional “Photo unavailable” fallback with
`imageUrl: null`. This keeps durable snapshots independent of publisher URL
expiry and avoids admitting an arbitrary durable image target or introducing a
server fetch/proxy. Search result photos continue unchanged under the existing
approved enrichment and transport protections. No background refresh, image
fetch during save/list, Next image optimization of saved links, or new origin
allowlist is introduced. Optional photos were explicitly optional in the intent;
photo persistence can be a separate scoped increment.

## User flows and state

1. Add a visible `Menu` link in the home header and a `Recipe search` link on the
   menu page. Preserve the Meal Planner heading and search/notebook/game layout.
2. Each search card has an `Add to menu` button with an accessible recipe-specific
   name. During its own request, show `Adding…`, disable only that action and
   announce progress. On success announce `Saved to menu` with a menu link;
   on failure retain the result and allow retry. The action remains available
   after success so a later removal elsewhere does not leave a permanently
   disabled local “saved” flag. Duplicate saves are harmless. No initial menu
   fetch, saved-state badge on every card, polling or real-time synchronization.
3. `/menu` shows `Your menu`, a short shared-family explanation, count `N of 200`,
   and all saved cards in `saved_at DESC, id DESC` order. Show title, summary,
   source hostname/link, exact time label or `Time not provided`, and fallback.
   Empty state explains that recipes can be added from search and links there.
4. Each menu card has a recipe-specific `Remove from menu` button. Disable it
   while removing and leave the card visible until confirmed success. Then
   remove it and update count/empty state; announce removal. Failure leaves the
   card and a local retry message. No confirmation modal or undo is necessary:
   re-adding from search is available and removal affects only the saved entry.
5. Initial list failure renders a recoverable generic menu error with a full
   `/menu` reload link. It must not masquerade as an empty menu. Session loss
   during an action shows sign-in/onboarding guidance appropriate to 401/403.
   Other errors use fixed messages, never server exception text.

No optimistic durable-success claim before the server responds. Multiple cards
for the same source can have independent request feedback, backed by server
idempotency. Views update after their own successful action or a fresh navigation/
reload; another device's changes need a reload. Do not overwrite newer in-page
state with a late list response, or update state after an abandoned component.
An uncertain save/remove failure may have committed; retry is safe under these
identity rules. Revalidate/reload the menu when navigating back to it after a
save rather than relying on a stale prefetched/RSC payload.

Controls need visible focus, keyboard operation, at least existing 44px action
height, polite status and error announcements, wrapping long text/URLs, and no
horizontal overflow at 390px and 1440px. After removing a focused card, move focus
to the next remaining remove control, previous control, or empty-state search
link so keyboard focus is not lost. Source links retain `noopener noreferrer`
and their existing new-tab disclosure.

## HTTP and authorization contract

| Endpoint | Request | Success |
| --- | --- | --- |
| `GET /api/menu` | no body or ownership selector | 200 `{ entries: SavedMenuEntry[] }` |
| `POST /api/menu` | exact save snapshot above | 200 `{ entry: SavedMenuEntry, created: boolean }` |
| `POST /api/menu/[id]/remove` | exact empty JSON object `{}` | 200 `{ removed: true }` |

`SavedMenuEntry` has exactly `id` (server random UUID), `savedAt` (nonnegative
safe integer epoch milliseconds), and `recipe` (`Recipe` with imageUrl null).
Responses contain no family/user IDs, admission data, raw DB columns or secrets.
Removal accepts only a canonical lowercase UUID; invalid IDs give 400. A valid
missing/other-family ID produces the same successful no-op response, without
revealing whether it exists. Unknown query parameters on menu API endpoints
are rejected with 400 rather than interpreted as ownership/filter controls.

Use Node runtime and private/no-store responses for all successes and failures;
no public caching or module-global user/menu state. `/menu` is dynamic via session
headers and current DB reads, with no cross-request recipe list cache. Listing
and rendering share a server store function, not an internal HTTP fetch.
HEAD/GET do no insert, delete, provisioning, migration or photo/provider work.
Unsupported methods use framework 405 and cannot mutate anything.

Every route and page independently invokes `requireFamilyContext` before menu
reads/effects; proxy enforcement remains an additional layer. The store also
uses the verified identity and current admission/membership, following the
existing familySummary/requireMember pattern. Never accept the family owner
from input. Reads bind the server-derived family ID, and mutations recheck
`requireMember` inside their write transaction before deciding ownership or
reading entries. A pre-request context alone cannot authorize a later write.

POSTs require exact configured Origin and reject `Sec-Fetch-Site: cross-site`,
matching `lib/http.ts`; same-site is not an Origin substitute. Require JSON
content type. Parse streamed save bodies under **16 KiB actual byte limit**,
including chunked bodies and false Content-Length, with a **5-second total body
read deadline** and cancellation/reader cleanup. Over-limit, malformed/unknown
fields and expired body reads return 400 without a write. Removal may reuse
the existing 4 KiB `readJson` limit but needs the same bounded read deadline.
Use a menu-specific bounded parser or a backward-compatible helper option;
never raise unrelated family endpoint limits. Authenticate before body parsing;
finish parsing and validation before acquiring a DB write lock.

Error bodies follow existing fixed `{ error: string }` responses:

| Status | Meaning / fixed menu message |
| --- | --- |
| 400 | Invalid request |
| 401 | Unauthorized (existing proxy/session behavior) |
| 403 | Forbidden for Origin; Family membership required for pending/unprovisioned identities |
| 409 | Menu is full. Remove a recipe before adding another. |
| 503 | Service unavailable (DB/schema/transaction failure) |

The current proxy may return its existing `Authentication unavailable` 503
before a handler; clients treat any 503 generically. Do not change existing
proxy or auth contracts to unify strings. Aborts/transport failure do not
fabricate success. Avoid logging request text, raw exceptions, queries, URLs,
identities or database credentials. Preserve search's 90-second route duration,
paid-usage bounds, parent-abort handling and two-job photo bound exactly.

## Storage and transaction design

Add one additive SQL migration, after `0000_family.sql`, creating
`menu_recipes`. SQL stays the schema source of truth; add a typed domain row
without runtime ORM/schema-builder imports.

| Column | Contract |
| --- | --- |
| id | text primary key; application-generated random UUID |
| family_id | required text FK to families(id), ON DELETE RESTRICT |
| source_url | required text, normalized ASCII HTTPS URL, max 2048 bytes |
| title | required text; trimmed nonempty, max 160 UTF-16 units in application |
| summary | required text; trimmed nonempty, max 600 UTF-16 units in application |
| time_kind | nullable text: cook or total |
| time_text | nullable text; trimmed nonempty, max 80 UTF-16 units in application |
| saved_at | required bigint; nonnegative safe integer epoch milliseconds |

SQL CHECKs enforce nonempty/trimmed bounded text by PostgreSQL character count,
source byte limit, time null-pair consistency/kind and safe timestamp range.
Application UTF-16 bounds are equal or stricter than SQL character bounds.
Source URL syntactic normalization remains the validated application boundary;
reads validate persisted rows before building a public `Recipe`/URL instance.
Malformed stored data fails the entire list with generic service failure; do not
silently drop rows or render an unsafe link. No created-by user is needed for
permissions or display in this increment.

Unique index `(family_id, source_url)` enforces deduplication; normalized ASCII
URL's 2048-byte bound plus the server-generated family UUID keeps index keys
bounded. Add `(family_id, saved_at DESC, id DESC)` for deterministic listing.
No additional menu parent row, schema trigger, sequence, RLS system or per-user
collection table. Existing restricted runtime roles and bound queries remain
the isolation boundary; every SELECT/DELETE includes family_id explicitly.

Save uses `FamilyDatabase.transaction` with its unchanged common
`FAMILY_WRITE_LOCK`. After that lock and admission/member recheck: look up the
family+source; return it if present; otherwise count family entries; reject at
200; insert a random-ID snapshot with server timestamp and return it. Unique
constraint remains defense in depth. No UPDATE permission or query is needed
for menu rows. Remove uses the same transaction and recheck, deleting only
`WHERE family_id=$family AND id=$id`. No row is a success. Transaction timeouts
and rollback behavior remain unchanged. This deliberately uses existing global
write serialization rather than introducing an independent lock that could race
with membership/admission metadata writes. No network fetch occurs inside locks.

List queries use only the authorized family, order as above and **LIMIT 201**.
If more than 200 rows are found, return service failure rather than hiding data
or emitting an unbounded list. The cap is enforced by cooperating application
writers under the lock; a migration owner can bypass it and is trusted. No
claim of a SQL per-family count constraint or globally serializable reads.

### Migration, grants and operational boundary

Preserve initial PostgreSQL SQL bytes and SQLite migration evidence. Append the
journal entry, regenerate/review runtime-migrations metadata and complete catalog
including the new table, constraints and indexes. The build verifier must still
reject metadata/SQL drift, and runtime must fail closed on an old schema. Review
local migration tooling and test grants: currently `scripts/migrate-db.ts` and
hosted setup use explicit table allowlists, and hosted inspection expects only
the initial tables. Add narrowly scoped `SELECT, INSERT, DELETE` grants on the
new table to the runtime where appropriate, keeping no DDL, TRUNCATE, migration
ledger writes, owner credential, or UPDATE grant for it. Do not broaden grants
to all tables. Update owned disposable test database setup/catalog expectations.

The implementation plan must identify every affected grant/catalog/role test
and staged packaging contract; do not merely add SQL while the runtime catalog
or restricted role rejects it. Retain bundling of reviewed runtime metadata and
compiled-operation tests without repository SQL/source files. Preserve current
Next tracing and `.vercelignore` boundaries; no environment/bootstrap artifacts
or test fixtures enter deployment uploads.

Authorized local/test execution uses the dedicated native cluster and owned
random test databases only. No hosted migration, privilege change or deployment
is authorized. Existing Preview/Production schemas will be incompatible with
the new runtime until separately authorized migration/release preparation; the
future operational handoff must name exact recorded targets and rollout order.
An old runtime also rejects the expanded catalog, so this repository's strict
catalog contract is not an online backward-compatible rollout: coordinate a
separately authorized maintenance/cutover and recovery plan before any hosted
migration. Do not promise zero-downtime migration or silently relax catalog
checking. Avoid local-development data mutation during automated tests.

## Verification and acceptance evidence

All new helpers/tests remain strict TypeScript with pinned tsx and native Node
runner. Write failing behavior tests before implementation. The plan must
provide an explicit command/script that actually discovers the new menu tests;
current `pnpm test` selects `tests/recipe-*.test.js` only. Preserve all existing
Python workflow tests. No fake-user production bypass or hosted synthetic rows.

| Area | Required proof |
| --- | --- |
| Validation | Exact keys/nested time, null/type/missing fields, whitespace, UTF-16/surrogates/controls, boundaries; source HTTPS/credentials/ports/private-literal/path/query/fragment/default-port cases; canonical length growth; hostile text rendered literally. |
| HTTP parsing/CSRF | Missing/wrong Origin and cross-site fail, content-type rejection, malformed/chunked/false-length/oversized/slow body cancellation; authentication before parsing; no write after any rejected body. |
| Persistence | Save and list after fresh DB connection/server restart; same-family second identity sees it; duplicate retains first snapshot/ID/time; concurrent duplicate unique, capacity 199→200 race, duplicate at capacity, remove frees a slot. |
| Isolation/admission | Two real fixture families; all reads/add/removes scoped; body family/user selectors rejected; guessed UUID removal indistinguishable; expired/denied/pending identities denied; membership/admission changed between outer check and transaction fails with no write. |
| Concurrency | Concurrent add/remove commits follow lock order; repeated/missing deletion succeeds; delayed old-ID remove leaves new entry intact; transaction failure rolls back; DB unavailable/schema drift produces generic errors. |
| Storage/security | Fresh + initial-schema upgrade migration; restricted runtime grants work only as required; no DDL/history write/TRUNCATE/UPDATE on menu table; metadata/catalog drift rejected; malformed stored row fails closed; 201-row owner-seeded fixture fails bounded read. |
| No external effects | Save/list/remove and menu rendering never invoke provider/photo network paths; saved imageUrl always null; server-only configuration absent from browser props/bundle/error evidence. |
| Browser 390/1440 | Test-process search/OAuth fixtures; real Chrome save→navigate→reload→remove→reload, duplicate feedback, empty/full/error/retry states, keyboard announcements/focus, source link, long text, no horizontal overflow, no console/unexpected network errors. |
| Regression/package | Existing auth/family/search/photo/game/deployment checks; compiled menu page and APIs operate with runtime metadata but no migration/source files; upload excludes private/test material; strict typechecking includes new tests. |

During Build record actual outputs for frozen install, Node24/pnpm10.33,
`pnpm run lint`, `pnpm run typecheck`, `pnpm test`, `pnpm run build`,
`pnpm run test:family`, `pnpm run test:auth`,
`node --import tsx --test tests/deployment/*.test.ts`, the explicit menu suite,
`python3 -m unittest discover -s tests`, staged secret scan, plan-sync and
`git diff --check`. Capture inspected mobile/desktop screenshots and browser
behavior evidence under distinct feature names; no live paid search is needed.
Follow the documented inactive Next dev-types backup procedure if fixture QA
causes duplicate generated global types; never suppress compiler checks.

Independent spec/security reviews precede human specification approval; an
approved implementation plan precedes code. Code/security review and all required
checks precede the human merge gate. Hosted migration, deployment/promotion and
release remain explicit separate owner decisions. This draft is Design evidence,
not an assertion that any new behavior or runtime verification already exists.
