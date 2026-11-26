# Saved recipe classification — independent security review

- Reviewer: security-researcher (independent of implementation authors)
- Date: 2026-11-26
- Reviewed source: `69b27193275844d0cf540c1d6d99f7f6ee3b092a`, cumulative from `a0deeb6`
- Inputs: approved sibling feature intent/spec/plan and design re-review `d891e35`
- Verdict: **Approved for the local implementation security gate.** No unresolved security findings or nits.

## Boundaries and evidence

The assets are family-owned saved recipe data, session credentials and the
restricted database authority. Untrusted inputs cross HTTP JSON, source JSON-LD
and model-output boundaries. Category labels are non-sensitive recipe metadata;
they create no new identity, secret, external integration or telemetry flow.

- `app/api/menu/route.ts:30–38` reuses exact menu POST and its mandatory
  `menuApiResponse` guard. The unchanged `lib/menu/http.ts` retains canonical
  Host, current JWE/token binding, family/admission checks, protected405 and
  private/security headers. Exactly one category query key/value is accepted;
  no Proxy/public-policy, session or allowlist change appears in the reviewed diff.
- `lib/menu/body.ts:5–34` retains exact Origin/cross-site checks, fatal UTF-8,
  actual-byte accounting and a five-second total streaming deadline. Category
  input is limited to4096 bytes and exactly id/category. `lib/menu/store.ts:143–150`
  validates the enum/ID, rejects verification identities, acquires the existing
  transaction lock, rechecks current membership and uses bound SQL with the
  server-derived family ID. Foreign/missing entries return the same sanitized404.
- `lib/menu/store.ts:130–137` preserves the manual override with SQL CASE after
  the existing task lease, expiry and current delegated admission checks.
  Retry does not clear the marker. Both completion/correction orders, failed
  retry, duplicate saves, removal and revoked admission are covered by passing
  restricted-role store/HTTP tests.
- `lib/recipes/curation.ts` adds only enum/null classification to the existing
  strict source-bound response. Observed title/ingredient/method checks, token
  limits and cancellation remain. `lib/recipes/category.ts:15–26` uses bounded
  exact metadata aliases; `lib/menu/recipe-metadata.ts` reads only the uniquely
  associated Recipe node. Neither path adds a fetch, model call, tool or retry.
- `lib/menu/validation.ts:22–38,70–80` rejects invalid category values and
  missing current stored projections while allowing absent category only in
  historical JSON. Plan projections carry the field; passing plan tests prove
  current snapshots preserve category and menu correction leaves historical
  snapshot bytes unchanged.
- The new native SQL adds two columns and two checks, with null/false defaults.
  Independent manifest comparison against `a0deeb6` verified that all seven old
  descriptors/required identities, all ten old profiles and independence records
  remain exact prefixes/equal. Existing grants are unchanged; the sole grant
  additions are UPDATE on category and category_overridden. Restricted-role
  tests prove ownership/source/saved-at writes and runtime TEMP remain denied.
- `app/menu/page.tsx` derives edit capability from the verified server session.
  The category control uses React-escaped labels and a bounded same-origin
  request, validates the exact returned entry/ID/category, and does not claim
  persistence optimistically. API/store checks remain authoritative. A real
  verification fixture proves category-bearing snapshot saves remain allowed
  while category-only edits return403 and expose no edit controls.

## Verification actually assessed

I independently ran the pure body/validation suite (20/20) and focused
category/curation/URL metadata suite (23/23), and inspected the implementation
diff and exact compatibility/grant delta. I read the orchestrator's completed
local integration logs in the owned temporary `recipe-classification-checks-*`
directories:

- `2dz37o`: menu78/78 and plans37/37, including hostile Host421, unfinished
  oversized/stalled body rejection before EOF, private headers, no mutation,
  correction serialization, family isolation and snapshot preservation.
- `Ep2ANk`: auth16/16, verification30/30 and corrected migration-security30/30.
  All have zero failures/skips. The broader earlier migration run's other cases
  passed; I do not claim a new full migration-suite command was run here.
- `3mhLLe`: deployment42/42, zero failures/skips.

Initial Host/TEMP failures were fixture defects, not relaxed assertions: raw
node:http now transmits the hostile Host; the restricted owned random database
fixture explicitly denies PUBLIC/runtime TEMP. The deliberate shadow-table
attack test validates its exact owned database, grants TEMP only for that attack,
retains the original search-path/shadow checks, and finally revokes it with
baseline/restored effective-denial assertions. Its rerun passed.

Browser assertions/screenshots are still being completed by the separate UI/code
review stream. This security verdict does not certify that pending visual work.
No new dependency or lockfile change was introduced; no release audit or hosted
provider success is claimed. Staged-secret scanning and diff checking are required
for this review commit.

## Gate limit

This is local security approval only, not merge, hosted migration/grants, staging
acceptance or release authority. The new runtime requires eight identities while
the recorded hosted databases have seven. A future cutover must follow the
separate exact-source staging/migration/release gates; old seven-identity binaries
are unsafe rollback targets after that migration. No production or development
database mutation was part of this review.

## Automatic-save amendment — independently approved

- Reviewed source: `76eaafb0752203a493c95c469c93a05fe7249d52`
- Input: owner-requested selection autosave; independent design approval `3e69b40`
- Verdict: **Approved for the same local security gate.** No new findings.

The amendment removes the separate Save button and calls the same category POST
when the native selection changes. I inspected the complete control delta:
Google-derived capability and exact enum guards remain; the request ref is set
synchronously to prevent concurrent effects; pending selection is disabled;
the15-second abort, unmount cleanup and post-await controller checks remain.
Success still requires the exact validated returned entry ID/category. The
saved label remains based on server props. Failure/401/403 restores that saved
selection and displays sanitized feedback, allowing deliberate re-selection
instead of an automatic retry. No credentials, endpoint, API/storage, family
authorization or synthetic permission changed from the approved `69b2719`.

I read the completed `ewxq3z` build and both menu/curation browser logs. The
orchestrator reports all three driver commands exited0; the browser logs record
successful real flows, persistence and failure recovery. Temporary diagnostic
logging did not suppress failures, and `tests/auth/chrome.ts` has no source diff.
Final screenshot/visual and any helper-restoration rerun assessment remains with
the independent code/UI reviewer. The merge, hosted migration and release limits
above still apply.
