---
artifact: saved-recipe-menu-implementation
reviewed_commit: dee38010b7e90c4e549a0d192a62c0bcc2a226fd
base_commit: 4bbe71f
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: approved
round: 1
---

# Shared saved menu — final independent implementation security review

Verdict: approved for the subsequent independent code review and human merge
review. No required security finding remains. Reviewed the complete feature
change from4bbe71f todee3801 against the owner-approved specification, visual
choices, implementation plan and recorded boundary amendments. This does not
approve or claim merge, hosted migration, deployment, promotion or release.

## Findings by severity

No critical, high or medium security findings. No additional nit findings.

## Security evidence

- **Client lifecycle and confirmation:** `app/menu/save-recipe-button.tsx:8–24`
  prevents overlapping save actions, aborts on unmount, suppresses stale response
  updates and reports durable success only after a successful validated response.
  It sends only the recipe snapshot to a fixed same-origin endpoint and displays
  fixed error/session guidance. `menu-controls.tsx:16–60` similarly tracks and
  aborts per-entry requests; response/interaction guards prevent abandoned or
  older requests from changing newer focus state. The card remains until a
  successful removal and a fresh server page replaces it. Cancellation has no
  mutation effect. `remove-recipe-dialog.tsx:9–28` opens a native modal, focuses
  Cancel, dismisses Cancel/Escape/backdrop without a request, and calls the
  removal action only from explicit confirmation. Retries reopen the dialog.
  Confirmation is correctly treated as a UI safeguard, not an API credential.
- **Server-rendered scope and output:** `app/menu/page.tsx:10–19` obtains family
  context and verified page session before query/store reads. The store derives
  current membership again. Client props contain only validated entries and a
  bounded cursor (`page.tsx:36`, `lib/menu/types.ts`); no allowlist, identity,
  family owner, auth config or DB credential is serialized. Invalid/list-failure
  pages expose fixed text, not raw queries/errors. Snapshot/selected-title text
  is React text; source href and optional image URLs pass canonical HTTPS
  validation on writes and persisted reads (`validation.ts:7–28,47–62`).
  `RecipeCard` retains direct unoptimized/no-referrer image handling and the
  missing/failed fallback, with no new server fetch or HTML rendering.
- **Stateless credential boundary:** `lib/menu/http.ts:22–38` checks validated
  configured Host before session work and invokes public `getCookieCache` with
  explicit secret, JWE, configured-HTTPS prefix and version before any session
  helper. Cached stable Google identity, token and embedded/outer expirations
  must be valid/current. The existing cryptographic session must match both
  cached token and stable subject/email. Both identities require verified email.
  Thus the callback process's fallback adapter cannot revive missing/expired
  cache credentials or authorize a mixed same-user token. Current admission and
  family eligibility still run afterward and inside each mutation transaction.
  `tests/menu/http.test.ts:64–126` covers rejected caches/expiry/identity, same-
  user/different-session and foreign token mixes, secure/chunked positives and
  zero Set-Cookie refresh. Shared auth/session/public-policy files are unchanged.
- **All-method protection and request bounds:** both menu API modules explicitly
  route all seven Next-supported methods through the wrapper; unsupported
  methods authenticate before405 and never parse/mutate. GET/HEAD are read-only.
  Wrapper errors/successes carry private/no-store, CSP, nosniff, frame denial,
  no-referrer and configured-HTTPS HSTS (`http.ts:9–17,24–42`). The static matcher
  excludes only the two menu shapes (`proxy.ts:52–54`); all other Proxy logic
  remains unchanged. The compiled real-HTTP test source exercises Host421,
  forged forwarded Host, anonymous401, pending403, all methods, sibling/prefix
  and normalized/encoded/trailing-slash cases (200–254). `body.ts:5–33` preserves
  exact Origin/cross-site/JSON rules, actual16KiB/4KiB byte caps, a5s total read
  deadline and cleanup without awaiting hostile cancellation. The raw save and
  removal regressions leave client EOF unfinished until the400 response
  (185–197,257–270); no timeout assertion or auth test was weakened.
- **Tenant isolation and transactions:** `store.ts:11–18,21–40` uses typed bound
  queries, the current member's family on every SELECT/DELETE and LIMIT51 keyset
  pagination. Cursors are canonical bounded positions, never authority tokens.
  Save/remove use the unchanged common advisory-lock transaction before their
  admission/member decision. Duplicate snapshots stay first-save-wins, and
  foreign/missing removal IDs have identical successful no-op behavior. No
  provider/photo I/O occurs inside stores or locks. Isolation/race tests exercise
  real DB-backed stores and no production test-only branch.
- **Storage, privileges and recovery:** the additive menu SQL includes required
  family FK, unique family/source and page-order indexes, bounded fields, paired
  time and safe timestamps. Full reviewed catalog/history/hash checks remain
  strict; malformed stored entries fail closed. `scripts/migrate-db.ts:10–14`
  grants only menu SELECT/INSERT/DELETE. Restricted-role tests actually reject
  UPDATE/TRUNCATE/DDL/history writes; upgrade, repetition, dump/restore and
  disposable rollback tests preserve initial SQL/evidence and exact catalog
  compatibility. Test DBs use validated loopback mp_test-owned random names and
  ownership-checked cleanup; existing mp_runtime grants are local to those DBs,
  without cluster-role changes or development-data writes.
- **Packaging and hosted boundary:** `tests/deployment/postgres-packaging.test.ts:
  13–39` asserts no repository lib/drizzle directories exist, then actually saves,
  lists, server-renders `/menu`, removes and lists empty using compiled output.
  Runtime gains no migrator/owner credential/source-SQL fallback. Hosted-tool
  changes add only the explicit menu table/ownership/grant and forbidden-
  privilege expectations (`scripts/postgres-hosted.ts:60–113`); they were not
  executed. Its initial-empty-data assumption is explicitly not a future
  populated-data migration runbook. Strict old/new catalog incompatibility and
  separately authorized backup/cutover/recovery remain documented.

Diff inspection confirmed no changes to `lib/recipes/`, the search Route Handler,
shared auth/session/identity policy, DB connection/transaction implementation,
vercel.json, Next config, upload exclusions, lockfile, original PostgreSQL SQL or
initial rollback. Search90s, cancellation/paid-usage bounds, photo all-address/
pinned transport/no-redirect/byte/time/two-job protections therefore remain intact.
The optional card action slot and notebook save control do not alter provider
execution. New test transport and one-shot browser failures stay under tests.

## Verification and limits

Independently executed during this final review:

- `node --import tsx lib/db/verify-runtime-metadata.ts`: exit0; SQL/journal metadata
  matches the reviewed runtime manifest.
- `python3 scripts/scan_secrets.py --base 4bbe71f --head dee3801`: exit0,0 findings.
  An initial invocation with positional paths was rejected as invalid usage;
  the corrected base/head scan covers the entire reviewed change.
- `node --import tsx --test tests/menu/validation.test.ts tests/menu/body.test.ts`:
  10 passed,0 failed/skipped/cancelled; focused hostile input/deadline boundaries.
- `git diff --check`: exit0.

Read the completed verification record at `verification.md:267–326` and relevant
HTTP/browser/compiled-package test source. The developer's final record reports
194Node tests (82recipe,32menu,34family,14auth,32deployment),7Python tests,
lint/typecheck/build/frozen install and production Chrome390/1440 plus dialog320
acceptance passing. Those full runtime/browser commands were not redundantly
rerun by this reviewer; independent targeted checks are listed separately above.
Parent-inspected screenshots and real menu HTTP/storage browser tests provide
UI evidence; the HTML visual preview is not used as runtime proof.

No server/browser/DB/hosted action was taken during this review. Retained
publisher images remain mutable external browser-loaded links; syntax validation
is not provenance or a future DNS/redirect guarantee. The5s body deadline is
verified at the local authenticated application boundary, not an untested hosted
ingress SLA. Copied cookies retain the existing one-hour stateless/no-refresh
limitation. Human merge/release and target-specific hosted migration authority
remain outstanding; this security verdict supplies none of them.
