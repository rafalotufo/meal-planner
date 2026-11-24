---
artifact: saved-recipe-menu-backend
reviewed_commit: 165fd308c289ed79686a3f9d3f35d36839bef8ff
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: provisional-clear
round: 1
---

# Saved menu backend — bounded source security consultation

Verdict: provisional clear; no required security defect found in this backend
checkpoint. This is a source consultation while UI work proceeds, not final
whole-feature approval. Backend paths reviewed below have no diff between
165fd30 and the inspected current HEAD7b08115. No Next build/type generation,
server, browser, database or hosted action was run by this reviewer.

## Source findings

- `lib/menu/http.ts:22–38` derives secret and origin from validated server config,
  rejects wrong Host before session work, and requires the public JWE cookie
  verifier **before** any session helper. Its explicit secret, JWE strategy,
  configured-HTTPS secure prefix and version prevent alternate credential modes.
  Cached user is validated by `verifiedIdentity`; both embedded and outer JWT
  expirations must be finite/current. Returned cryptographic session must match
  both cached token and stable subject/email. This rejects same-user/different-
  session adapter fallback, rather than merely comparing ephemeral user IDs.
  Current family eligibility is then rechecked; mutation stores recheck again.
- Every normal/error exit receives private/no-store, CSP, nosniff, frame denial,
  no-referrer and configured-HTTPS HSTS (`http.ts:9–17,24–42`). No credential/raw
  exception response is added. Unsupported methods are authenticated before405.
  Both API route modules explicitly export all seven Next-supported methods;
  removal GET/HEAD never reuse POST (`app/api/menu/route.ts:13–40`, removal:
  13–31). `/api/menu` HEAD reuses only the read-only GET contract.
- `proxy.ts:52–54` excludes only the two static menu shapes. Public auth policy
  is unchanged. Real-HTTP test source covers all methods, wrong Host despite
  forged forwarded Host, anonymous/pending identities, sibling/prefix paths and
  normalized/trailing/encoded variants (`tests/menu/http.test.ts:200–254`).
  Coverage is compiled application HTTP, not an isolated regex assertion.
- `lib/menu/body.ts:5–33` requires configured Origin, rejects cross-site/invalid
  JSON, counts actual bytes at16KiB/4KiB, and races reads against a5s deadline.
  Unfinished cancellation is not awaited before returning; reader lock and timer
  are cleaned up. Auth precedes parsing and parsing precedes SQL. The real raw
  request tests keep save/remove bodies unfinished until the response arrives
  (`http.test.ts:185–197,257–270`); they do not end client bodies to pass timing.
- `validation.ts:7–28,38–62` bounds/normalizes exact text, nested time, URL and
  cursor input, rejects malformed stored rows, and requires canonical persisted
  values. URL validation is syntactic; server save/list/remove never fetches
  source/photo targets. Direct publisher images keep the approved browser
  boundary and its documented DNS/redirect/provenance limits; this consultation
  does not treat URL syntax as an SSRF/provenance guarantee.
- `store.ts:11–18,21–40` binds the current member's family on every query and uses
  LIMIT51 with canonical tuple pagination. Save/remove invoke the unchanged
  transaction helper before `requireMember`, deriving ownership after the common
  lock. First-save snapshots are retained; foreign/missing UUID removal is the
  same no-op. SQL is bound; source/photo URLs do not enter SQL syntax or network
  calls. Isolation/race test source exercises real DB-backed stores without a
  production bypass (`tests/menu/isolation.test.ts:16–54`).
- `0001_saved_recipe_menu.sql:1–22` requires family ownership/FK, bounds snapshots
  and safe time pairs, and includes unique family/source plus page-order indexes.
  The reviewed complete runtime catalog/metadata remain the compatibility
  contract. `scripts/migrate-db.ts:10–14` adds only explicit SELECT/INSERT/DELETE
  menu privileges. Actual allow/deny and upgrade/rollback test source is present
  (`tests/menu/migration.test.ts:32–79`). Original migration/rollback evidence is
  preserved; the menu rollback remains disposable-only.
- `tests/menu/database.ts:10–33` validates existing private native runtime config,
  then substitutes only an owned random `mp_test_<24hex>` DB, uses DB-local
  CONNECT/USAGE grants and invokes the migration tool with credentials solely
  in its child environment. No cluster-role change or development write is
  added. Cleanup delegates to the ownership-checked existing fixture. HTTP
  fixtures use that restricted runtime, not migration credentials.

## Evidence reviewed and remaining obligations

HTTP test source includes missing/tampered/wrong-key caches, outer/embedded
expiry, absent subject, false verified-email status, mixed identities and
same-user distinct tokens, valid/missing chunks, configured secure-prefixed JWE
and no Set-Cookie refresh (64–126). The current helper schema, identity validator
and explicit prefix selection also fail closed on malformed identity/expiry
shapes. `verification.md` records31/31 after the timeout/session corrections,
then32/32 with dump/restore, plus14/14 auth; these are developer-recorded results,
not tests independently rerun during this consultation.

The later hosted-tool compatibility task remains open: `scripts/postgres-hosted.ts`
still has its initial table/grant expectations. This is not a request to run it
against hosted targets, and is not treated as completed checkpoint behavior.
UI confirmation/photo display, final compiled packaging proof, full regression
commands and formal final independent security review remain required before
whole-feature approval. Hosted migrations/cutover/release remain separately
authorized operations. Static `git diff --check` passed.
