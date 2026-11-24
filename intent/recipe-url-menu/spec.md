# Add a recipe URL to the menu — specification

- Author: architect; date: 2026-11-24
- Status: Approved by owner on 2026-11-24; implementation planning authorized
- Input: sibling amended `intent.md`; PM review `org/reviews/intent-recipe-url-menu-002.md`
- Owner reliability choice: “Keep it simple: save safely, start curation, and offer Retry if interrupted.”
- Supersedes the unapproved synchronous draft preserved verbatim in `design-history/synchronous-spec.md`.

## Outcome and supported operation

A family member pastes a direct HTTPS recipe URL on `/menu`. First commit a saved
link and durable pending curation state, then acknowledge the save without
waiting for a publisher. Start one bounded best-effort background attempt to
read available title, photo, summary and cooking/total time and update that
same entry. Failed or interrupted curation retains the link and offers Retry.
No search, paid AI, new discovery provider, scheduler, queue service or worker
infrastructure is added. Manual retry, not automatic eventual completion after
process failure, is the chosen recovery guarantee.

Support static HTML containing unambiguous Schema.org Recipe JSON-LD. Do not
execute publisher scripts, bypass logins/bot controls, scrape arbitrary prose,
follow redirects or interpret microdata/RDFa. A syntactically safe link can be
saved even when its page later proves unsupported, inaccessible or unsafe to
fetch; retain it honestly as a failed saved link. HTTP, credentials, IP literals,
unsafe/special hostnames or invalid URLs are rejected before save. Page retrieval
always applies the stricter DNS/network checks below. Explain supported pages,
final direct HTTPS links and possible Retry in the form's helper text.

## Request contracts

Use existing exact `POST /api/menu?import=url` with exactly `{ sourceUrl: string }`
for save-first, and `POST /api/menu?curate=retry` with exactly `{ id: string }` for
retry. Permit one query discriminator only; reject duplicate/unknown/combined
query keys. Preserve no-query snapshot save, `?lookup=saved`, GET/HEAD listing
and existing remove endpoint. No new route, Proxy bypass or public auth-policy
exception is needed. GET/HEAD with either discriminator remain invalid reads;
unsupported methods retain protected 405/Allow. No read schedules or claims work.

Every method/result uses `menuApiResponse`: canonical Host, current JWE/session-
token/identity binding, current family/admission and private/security headers.
Authenticate before parsing. Extend `readMenuBody` with exact import/retry modes:
4096 actual bytes, JSON only, fatal UTF-8, exact keys, same Origin/cross-site
checks, five-second total body deadline and current reader cancellation cleanup.
Normalize source by trimming once then existing `safeRecipeUrl` and menu ASCII/
2048-byte bounds. Preserve submitted normalized path/query/trailing slash;
fragments normalize away. Never adopt canonical/OG/Recipe-declared replacement
URLs. Validate retry IDs with the existing UUID validator.

Success is HTTP200 `{ entry, created }` for save; retry returns HTTP200
`{ entry, started: boolean }`. Validate response entries strictly. Entry extends
existing `{ id, savedAt, recipe }` with exactly `curation: { state, retryable }`:
state is `ready`, `pending`, `processing`, `failed` or derived `interrupted`;
retryable is true only for failed/interrupted URL entries. Return this metadata
consistently from list/save/retry, including search saves and duplicates. Keep
existing exact recipe snapshot request shape and `Recipe` fields unchanged.
Malformed inputs use400; missing/foreign retry entry404 without disclosure;
existing auth/Host/service errors keep401/403/421/503 and generic messages.
A curation failure is persisted status, not retroactive failure of the save.

## Durable state and migration

Add one companion `menu_recipe_curations` table. Its primary key `entry_id`
references `menu_recipes.id` with ON DELETE CASCADE. It exists only for entries
created through URL save. Persist state (`pending|processing|ready|failed`),
random generation UUID, scheduled-at and absolute expires-at safe millisecond
timestamps, nullable processing lease UUID, and the initiating verified Google
subject/email plus effective credential expiry: the minimum of verified session
expiresAt and verified JWE exp*1000, matching both existing guard checks. Constrain legal state/lease
combinations and bounded fields. No cookie, bearer token or raw HTML is stored.
Family/source ownership is derived by joining the existing menu entry, not
trusted from the client. Rows without a companion row are existing/search
snapshots and appear ready/nonretryable. Completed URL entries remain ready;
never refresh them automatically or expose an editing action.

Insert link placeholder and pending companion row atomically in the existing
single-connection READ COMMITTED/common advisory-lock transaction after current
membership/admission checks. Placeholder title is `Saved recipe link`, summary
`Recipe details are not available yet.`, image/time null; UI identifies it as a
link awaiting details and suppresses these placeholders as recipe claims. Its
validated source link is always usable. Preserve existing nonempty snapshot
constraints, ID/savedAt and keyset ordering through later curation.

The explicit local migration must include SQL/journal, reviewed full catalog,
runtime migration metadata and restricted privileges. Permit only required
SELECT/INSERT/UPDATE on the companion table and column-level UPDATE of recipe
title/summary/image/time; do not grant menu UPDATE of ID/family/source/savedAt,
DDL, TRUNCATE or migration-ledger writes. Existing menu delete cascades tasks.
Native typed bound SQL only. Runtime never creates/migrates. Local migration
implementation/testing awaits approved plan; no hosted migration, grants,
configuration, deployment or release execution is authorized. Exact catalog
checking means pre-amendment artifacts are incompatible rollback targets after
migration; retain data and use a reviewed compatible correction/release path.

## Scheduling, authority and races

After successful new-entry commit, register a Next `after()` callback containing
only entry ID and generation. Register no work before commit. Response promises
only durable saved link/pending state. If registration fails, preserve the link
and mark its matching task failed where possible; otherwise expiry exposes Retry.
`after()` is a supported post-response attempt, not durable execution or a queue.
Process shutdown/function timeout can interrupt it; there is no hidden scheduler
or retry loop. Never launch an untracked detached promise.

Each generation expires no later than scheduled-at+30 seconds or the captured
effective credential expiry (min(session expiresAt, JWE exp*1000)), whichever is
earlier. Capture both from the verified request, never client input. A callback uses its own bounded
abort/deadline after commit, independent of browser disconnect; search/provider
parent-abort behavior remains unchanged. Do not retain request cookies/headers.
The saved task is narrow server-recorded delegation to curate this exact entry,
not general session authority. Before external effect and before metadata update,
recheck its deadline, original subject/email's current admission and membership
in that same owning family. Mismatch/expiry prevents fetch/update and permits
safe task-failure cleanup only. Any currently eligible family member may Retry,
creating fresh delegation from that request's verified identity/effective expiry.

A callback claims only a matching pending generation under a short common-lock
transaction; assign a random lease UUID and processing state. At most two active
curation callbacks per Node process, non-waiting; occupied capacity marks that
matching task failed with generic retry guidance, never queues work in memory.
This is a per-process resource bound, not a global/serverless rate limit. Keep
existing photo enrichment's separate two-job bound unchanged. Fetch outside DB
connections/transactions/write locks; release all slots/resources in finally.

After parsing, complete in a short common-lock transaction: recheck authorization,
entry existence, generation, lease, processing state and deadline after acquiring
the lock; conditionally UPDATE only that entry's permitted metadata columns and
mark task ready atomically. Failures similarly update only the matching live task
with no raw error details. Never INSERT/upsert from a callback. Delete removes
the task; a late worker cannot resurrect the entry or affect a later new ID for
the same URL. Old generations/leases cannot overwrite retry/newer results.

Concurrent URL/search saves preserve first committed entry and snapshot. Duplicate
URL save returns existing entry/status without overwriting or scheduling another
attempt. Search-save collision with a pending URL entry returns that pending
entry unchanged, as first-save policy requires. Duplicate ready entries never
recurate. Retry only failed or expired pending/processing tasks: atomically rotate
generation, clear lease and set pending with fresh bounded delegation, then
schedule once after commit. A concurrent duplicate Retry sees active work and
returns started:false without resetting its deadline or scheduling another job.
Ready retries likewise return started:false; foreign/missing IDs return404.

Expired pending/processing rows are exposed as `interrupted`, retryable, by
read-time derivation. GET/HEAD/render never persist this change or claim/retry
jobs. Check expiry on every transition so late work cannot complete after it.
Cancellation after save cannot undo persistence; lost save responses have an
unknown commit outcome and are safely resolved through menu inspection/retry.

## Safe acquisition and metadata

Reuse unchanged `createSafeHtmlLoader`: one GET, maximum three seconds including
DNS, all-address public IPv4/IPv6 validation, mixed/reserved-answer rejection,
16-address bound, pinned native HTTPS/SNI/certificate validation, no proxies,
credentials, cookies or redirects. Retain200 HTML-only response, 16KiB headers,
1MiB response, identity encoding, supported UTF-8/US-ASCII declaration and fatal
decoding, bounded DNS/deadline and complete cleanup. No image-byte/secondary URL
fetches. Parent worker abort is explicitly checked/rethrown by orchestration;
loader null alone must not swallow it. Network/unsupported/parse failure becomes
failed curation with retained link and generic guidance, not fabricated content.

Use a focused pure `htmlparser2` parser. Only application/ld+json scripts; ignore
individually malformed documents but fail on limits: HTML depth256, 16 scripts,
128KiB/script, 256KiB total JSON, 1000 JSON values, JSON depth12. Traverse roots,
root arrays and @graph arrays only; recognize exact Recipe type forms already
supported by photo metadata. No remote contexts/references or merging nodes.
Declared url/@id/mainEntityOfPage identities must safely resolve to the submitted
source; one sole Recipe without declarations may bind to the fetched document.
Require exactly one eligible node and a valid name; reject competing/unsupported
nodes. Canonical/OG URLs cannot rewrite identity or resolve ambiguity.

Map title from name (nonempty, well-formed, max160); invalid title fails curation.
Description is bounded plain text: cap input8192 units, strip markup/script/style
contents, decode entities/collapse whitespace and safely truncate to600 units.
Absent/invalid description becomes `Summary unavailable.`. Prefer valid totalTime,
then cookTime, else null; support positive integer ISO day/hour/minute/second
components totaling1..604800 seconds, no fractional/calendar units, and format
exact English components within80 units. Never infer prep+cook or generate prose.
Select selected-node safe HTTPS image candidates with existing dimension/order
policy, max20; unsafe/missing photo is null. OG fallback is allowed only under
existing selector's page-identity rules. Do not pool competing Recipe photos or
relax existing search-photo behavior. Validate final snapshot with parseMenuRecipe.
Render text as text and publisher images via existing no-referrer/unoptimized
browser display and unavailable fallback; persist URLs, never archive images.

## Menu experience and update visibility

Provide a labelled Recipe URL form near `/menu` heading, including empty state;
no form on invalid-query or actual load-error state. One pending save at a time,
visible keyboard focus, min44px controls, wrapping and no overflow at320/390/1440.
Announce save pending, committed saved link, duplicate, details pending/ready/
failed/interrupted and Retry outcomes distinctly. A failed save never claims
persistence; failed curation explicitly says the link remains saved. Preserve
input on request error; client timeout says save could not be confirmed. Use
15-second client deadlines and abort/cleanup on unmount; stale replies cannot
update a replacement component. Update empty copy to mention URL or search.

Pending cards show source plus `Preparing recipe details…`; failed/interrupted
cards retain source, concise unavailable/interrupted message and Retry details.
Completed cards use normal RecipeCard including honest missing optional values.
All states retain existing confirmed removal; Retry has its own pending state
and polite atomic live feedback, never requires reopening the source or search.
After save/retry refresh current server page; on older pages offer Newest recipes
rather than moving duplicates or accumulating cards. Preserve input/focus and
existing removal focus behavior. No preview dialog or metadata editor is added.

While visible current-page entries are pending/processing, perform read-only
current-page GET polling every5 seconds, at most8 requests/40 seconds per mount
or explicit save/retry, max one in flight. Stop when settled, hidden, unmounted
or capped; cap is wall-clock time and never resets on each response. Refresh
server-rendered page only when validated returned state/content changes; no
optimistic invented metadata. After cap, show Refresh menu if needed. Hidden
pages may resume only within remaining budget. No forever polling, execution
from reads or guarantee that a closed browser observes completion is implied.

## Verification, grounding and next gate

Strict TypeScript/node:test+tsx regressions must prove commit-before-fetch,
restart-persistent placeholder/state, supported parser mapping/bounds, actual
safe transport, registration/worker interruption and manual retry; concurrency
slots/leases, simultaneous Retry/save/search, both session-first and JWE-first
expiry (including Retry), admission loss before
fetch/commit, removal/resave and stale generation no-ops. Cover Host/JWE/token/
Origin/body/deadline/query/method guards and headers; no unauthorized fetch,
write, cross-family disclosure or provider call. Test migrated existing ready
entries, full catalog/grants and forbidden UPDATE columns, malformed persisted
state, compiled runtime packaging without source/migration files. Test GET/HEAD
polling as read-only, bounded and unable to schedule/claim/retry work.

Real Chrome mobile/desktop QA must exercise actual protected save/curation/retry
with owned test databases/servers/profiles, strict TypeScript test-process-only
native transport preload and empty paid keys. Do not fabricate successful API
responses or add production fixtures/bypasses. Verify immediate link while
publisher stalled, status transitions after server update/reload, failure/Retry,
interruption/expiry, bounded polling, focus/live feedback, image fallback,
pagination, duplicate and confirmed removal. Visually inspect screenshots and
console/network evidence. Existing recipe/photo/menu/auth/family/deployment and
Python checks plus lint/typecheck/build/plan-sync/diff/staged-secret checks remain
required at Build; record actual outputs/limits without hosted/provider claims.

Grounded in actual menu store/body/validation/UI, schema/catalog/runtime grants,
Proxy and safe photo transport/parser. This worktree lacks dependencies; reviewed
pinned main-checkout Next Route Handler and `after` guides. Reinstall frozen and
re-read worktree guides before code. Official [Next after documentation](https://nextjs.org/docs/app/api-reference/functions/after)
and [Vercel function API](https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package#waituntil)
confirm post-response lifetime is bounded by route/platform duration; neither
supplies a durable queue. Structured fields follow the primary [Schema.org Recipe definition](https://schema.org/Recipe);
the parser/duration subset above is a deliberate application limit.

Independent review and owner specification approval precede the implementation
plan; approved plan precedes code. No implementation, migration execution,
new paid service, hosted configuration, merge or release is approved here.
