---
artifact: saved-recipe-menu-saved-status
base_commit: 0225e338382ae99670c5c14b80d194eb9c6f12b9
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: approved
round: 1
---

# Saved-button state — focused independent security review

Verdict: approved. No required security finding in the final stable working-tree
correction relative to0225e33. Owner ceo-0056 authorizes disabling recipes already
saved and removing Add again; sibling spec/plan now describe the new behavior and
bounded read-only lookup. This supplements the original implementation security
review without claiming it reviewed this later change. No merge, hosted migration,
deployment or release authority is supplied.

## Findings and source evidence

No critical, high or medium security finding. No additional nits.

- `app/api/menu/route.ts:25–36` routes lookup through the existing menu guard,
  current family context and verified identity **before** parsing. It accepts
  exactly one query pair `lookup=saved`; wrong values, duplicates and mixed/
  extra selectors return400. Save/remove and GET query policies stay separate.
  There is no new endpoint matcher, public exception or client family selector.
- `lib/menu/body.ts:5–33` adds only lookup's exact `{sourceUrls}` shape and shares
  the existing16KiB actual-byte/JSON/Origin/cross-site/five-second intake rule.
  Neither the timeout/cancellation implementation nor remove's4KiB bound changes.
  `validation.ts:12–19` accepts1–6 input URLs, normalizes/deduplicates them with
  the existing HTTPS/ASCII/2048-character boundary and rejects any invalid item.
- `lib/menu/store.ts:11–16` derives the current member's family, binds it and the
  normalized candidates to a single SELECT with `source_url=ANY($2::text[])`
  and LIMIT6. The existing family/source unique index supports this bounded
  membership query independently of paginated listing. Only matching requested
  source URLs are returned; no recipe snapshot, entry ID, family/user field or
  secret leaves the store. It does not save, provision, count/materialize the
  menu or invoke a provider/photo fetch. Existing writes and their transaction
  member rechecks are unchanged.
- `app/search-notebook.tsx:22–70` scopes status to the active search's normalized
  candidates, validates returned URLs against that batch, aborts abandoned
  requests and checks generation before applying results. Per-URL save revisions
  prevent a lookup started earlier from reverting a later confirmed save.
  Checking/error handling does not silently send a save. Status contains only
  already displayed source URLs and booleans, with no server configuration.
- `app/menu/save-recipe-button.tsx:12–35` blocks saves unless current status is
  available, retains the in-flight/unmount guards, and disables confirmed saved
  actions with the literal Added to menu label. Lookup retry invokes only its
  separate check callback. Actual save failures retain save retry; no durable
  success is claimed before the validated API response. All text/error guidance
  remains React text and fixed messages.

Confirmed no delta from0225e33 to the existing JWE/session-token/identity wrapper,
Proxy matcher, shared auth/session/public policy, SQL/catalog/grants/migration
code, recipe search/provider/photo implementation or hosting configuration.
The mandatory cache precondition, all-method Host/admission/private/CSP/HSTS
policy, one-hour/no-refresh behavior, common write lock and source/photo browser
boundary therefore retain their prior reviewed implementation. Lookup uses the
same wrapper and private error handling; it does not bypass them by query mode.

## Verification reviewed and executed

Independently ran `node --import tsx --test tests/menu/validation.test.ts
 tests/menu/body.test.ts`:12 passed,0 failed/skipped/cancelled. This includes the
new candidate normalization/shape and lookup byte/Origin bounds plus unchanged
stalled/trickle deadline tests. Ran a corrected explicit-path secrets scan over
lib/menu and changed client/API application files:0 findings. `git diff --check`
passed. No Next build, server, browser, DB or hosted action was run by this reviewer.

Read the final verification.md section “Owner0056 — disable saved recipes and
remove Add again” and test sources. Developer-recorded final GREEN covers:

- RealHTTP lookup1/1, full menu35/35, family34/34, recipes82/82 and deployment32/32;
  strict lint/typecheck/build pass in the isolated Node24 build.
- `tests/menu/http.test.ts:28–47`: membership beyond the first50, two-family
  isolation, malformed query/body/URL/count/Origin/anonymous denial, private
  security headers and unchanged persistent row count.
- Compiled package lookup with actual save/list/page/remove and no source SQL/lib
  directories; no runtime migration or packaging fallback.
- Real Chrome390/1440 (existing dialog320 checks retained): disabled saved click
  sends no save POST, lookup failure/retry sends no save, current saves disable,
  actual different-group reopen/filter/reload/new same-URL searches stay correct,
  aborted older check cannot replace the newer result, and an oldest saved URL in
  a54-row menu is disabled without saving. Production test hooks were not added.

Those compiled/browser results are attributed to the completed author evidence,
not independently rerun here. The earlier tests keep raw save/remove POST bodies
unfinished while proving the same path's application parser deadline; this review
does not claim a separately measured hosted ingress SLA or a new raw lookup test.
The original screenshots are preserved; new disabled-state captures use distinct
names. Parent final staging/commit and exact-revision audit remain outstanding.
