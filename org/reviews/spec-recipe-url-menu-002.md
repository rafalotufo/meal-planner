---
artifact: intent/recipe-url-menu/spec.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Recipe URL menu — independent save-first specification review

Verdict: **Approved for owner specification review.** No blocking Bugs, Security
or Compliance finding. This review applies to the revised asynchronous design,
not the historical synchronous specification or its previous review. It is not
owner specification/plan approval, implementation evidence or migration authority.

## Evidence and assessment

- **Bugs — durable acknowledgement and recovery:** `spec.md:74`–`101` atomically
  commits the link and pending state before registering `after()`. Registration
  failure preserves the committed entry; a failed status or derived interruption
  exposes explicit Retry. The response promises a saved link, not completed
  curation. Duplicate saves do not schedule extra work. This matches the owner's
  selected simple best-effort/Retry model without claiming a durable queue.
- **Bugs — fencing:** `spec.md:114`–`144` defines common-lock claim/completion,
  generation plus lease checks, expiry checks after lock acquisition and atomic
  metadata/status completion. Retry rotates generation only for failed/expired
  work; a concurrent retry cannot reset the live attempt's deadline. Callbacks
  cannot insert/upsert, and the task's cascading entry-ID foreign key prevents
  removal/resave from being affected by an old worker. Keeping ID/savedAt/source
  immutable preserves existing first-save uniqueness and pagination behavior in
  `lib/menu/store.ts:19`–`38`.
- **Security — current authority:** `spec.md:39`–`47` retains every guarded method,
  Host/JWE/token/identity/family and Origin/body boundary on the existing exact
  endpoint (`lib/menu/http.ts:21`–`42`, `lib/menu/body.ts:5`–`34`). The task stores
  no bearer credential. Its short server-recorded delegation must expire within
  30 seconds and verified credential lifetime; authorization is checked against
  the original subject/email and current owning family before fetch and again
  inside completion (`spec.md:103`–`125`). No stale task can transfer ownership.
- **Security — bounded external effect:** `spec.md:148`–`180` keeps the reviewed
  loader unchanged: public all-address validation, pinned native TLS, one GET,
  no redirects/proxy/credentials, strict byte/encoding/deadline limits and full
  cleanup (`lib/recipes/photo-transport.ts:13`–`126`). Callback cancellation is
  independent of browser abandonment after durable save; orchestration still
  propagates its own abort. Two non-waiting slots per process are explicitly not
  a global limit. No publisher script execution, secondary metadata/image fetch
  or paid provider call is introduced.
- **Compliance — storage/grants:** The actual existing table is `menu_recipes`
  (`drizzle/postgresql/0001_saved_recipe_menu.sql`), and the proposed companion
  FK targets its entry ID correctly. `spec.md:62`–`91` identifies the explicit
  SQL/journal/catalog/runtime-metadata change, legal state/lease constraints,
  legacy ready entries, narrow companion privileges and column-level metadata
  UPDATE. Existing migration tooling currently grants only menu SELECT/INSERT/
  DELETE; `tests/menu/migration.test.ts:68`–`79` currently forbids UPDATE. The
  revised grant and negative-column assertions are therefore necessary planned
  changes, not capabilities assumed to exist. The spec explicitly requires them.
  Exact catalog/history checking (`lib/db/connection.ts:67`–`101`) makes old
  artifacts incompatible after migration, as the design correctly states.
- **Bugs/Compliance — public shape and reads:** `spec.md:49`–`55` consistently
  adds only public `curation: { state, retryable }` metadata across list/save/
  retry and keeps the snapshot save payload unchanged. Existing strict
  `parseSavedMenuEntry` and exact-shape tests (`lib/menu/validation.ts:56`–`67`,
  `tests/menu/validation.test.ts:56`–`63`) must be deliberately updated and kept
  fail-closed, as required by the verification contract. Polling derives expired
  interruption without writes/claims/scheduling, has one request in flight and
  a non-resetting 40-second/eight-request cap (`spec.md:140`–`142`, `203`–`210`).
- **Compliance — platform and proof:** Read the pinned installed Next `after`
  guide from the main checkout. It documents post-response callbacks bounded by
  route/platform duration; it does not provide durable execution. The spec's
  process-interruption/manual-Retry language is accurate. Its strict TypeScript,
  real protected HTTP/browser, test-only native-transport, migration/grant,
  interruption/race and compiled-packaging checks (`spec.md:214`–`234`) are
  appropriate and do not fabricate success through API interception.

## Implementation precision to retain

Treat “verified session expiry” in `spec.md:67` and `103` as the effective
credential deadline: the earlier of verified session `expiresAt` and verified
JWE `exp`, both checked by today's `lib/menu/http.ts:33`–`35`. Capture it only
from verified server session data, and test a shorter JWE lifetime separately
from a shorter session lifetime. This is application of the existing guard's
contract, not new authority for background work.

## Limits and next gate

Static Recipe JSON-LD, final direct HTTPS URLs, no redirects/JavaScript/bot
bypass, bounded best-effort curation and manual Retry are explicit product
limits. Unsupported retrieval leaves an honestly labelled saved link. Missing
optional summary becomes `Summary unavailable.` only after successful recipe
curation. Existing/search snapshots are never overwritten by URL curation.

Owner specification approval precedes the implementation plan and code. No
migration, grants, hosted execution or runtime test was performed during review.
Reviewed the amended intent and revised specification against the source/tests
cited above; `git diff --check` passed.

## Expiry clarification confirmed

Re-read the architect's amended `spec.md:67`–`68`, `103`–`114` and `219`–`220`.
The effective delegation deadline is now explicitly the minimum of verified
session `expiresAt` and verified JWE `exp * 1000`, including fresh Retry
capture. Required regression coverage explicitly includes session-first and
JWE-first expiry for both initial curation and Retry. The precision identified
above is incorporated in the specification; approval stands.
