---
artifact: local main-to-family integration candidate
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
feature_parent: 5eaff43d0aa8d652ee505b9bae1012799060169e
main_parent: 766a7925b9489ea9bfda97355f3c2f9c7d99ca67
---

# Independent review — update the family branch from main

## Verdict and boundary

Approved for the explicitly requested **local main-to-feature integration** of
the two parents above. No unresolved blocking integration finding remains in
the resolved working-tree candidate. This is not approval to merge the family
feature into main, deploy it, apply a production migration, or reuse a historical
release authorization. The integration owner records the resulting merge commit
after staging these reviewed resolutions.

The existing SQLite family adapter remains local durable-host storage and
cannot be deployed durably on Vercel Functions. PostgreSQL migration and Mac
setup are separate work in the requested new chat/worktree; no provider choice,
provisioning, credentials, schema migration or production action was added here.

## Code and policy review

- `app/page.tsx` retains main's recipe-search form and layout and requires
  `requireFamilyContext()` before rendering them. The explicit update-from-main
  scope is recorded in the live family artifacts, superseding their earlier
  heading-only constraint for this integrated checkout.
- `app/api/recipes/search/route.ts` independently requires current family
  context before calling `searchRecipes`. Pending provisioning and invited
  identities cannot consume paid provider work even if a proxy check is skipped.
  The new integration regression exercises both pending states and a forged
  middleware-subrequest header, then proves provisioned/accepted members reach
  real input validation. Tests deliberately use an empty provider key.
- Compared main's recipe UI, `lib/recipes/` implementation, Vercel settings,
  worktree inclusion and recipe test compiler configuration: retained code is
  unchanged. Source-bound photo transport, cancellation, request/usage bounds,
  rendering safety and existing CSRF/Origin checks are preserved. The search
  route still uses Node runtime, a 90-second duration and the existing Vercel
  cancellation setting. Node `24.x`, exact package pins and the pnpm lockfile
  combine both branches' approved dependencies.
- Family identity, session, admission, membership, invitation and native storage
  implementation remain unchanged from the independently approved family
  branch. Proxy retains the family gates and main's image CSP allowance. No
  anonymous API exception, fake-user bypass, strict-check suppression or weaker
  ownership predicate was introduced.
- **Resolved privacy finding:** imported `.vercelignore` initially omitted local
  family data. The owner added `.data/`, SQLite/DB sidecar and backup patterns,
  matching existing family exclusions. Private DB/WAL/SHM/backups must not enter
  a CLI upload, even though this integration is separately blocked from release.
- Existing tests were adapted to the retained recipe UI rather than deleting
  home checks: auth/browser tests still verify authentication, title/lang,
  keyboard use, logout and responsive rendering, and now also verify recipe
  cards and a 500-pixel image fixture. The added relative-redirect assertion
  resolves a legitimate `Location: /onboarding` against the test server origin;
  it does not weaken the destination or admission contract.

## Independent audit verification

Performed read-only checks against the candidate and exact Git source blobs:

- All **129** entries in `org/merge/family-main-2026-11-23/manifest.json` match
  their source commit bytes, recorded size and SHA-256 hash; zero mismatches.
- Verified both archived gate-ledger chains and the current canonical chain
  with `scripts/gate_ledger.py`. Main's **45-record** ledger is an exact byte
  prefix of the canonical ledger. The five appended records import only the
  existing family intent/spec/plan/storage-amendment approvals, with original
  record IDs, hashes and decision timestamps identified in evidence. They are
  explicitly imports, not new human decisions. No family merge/release approval
  was imported or invented.
- Main's memory stream is an exact byte prefix. The **15** appended records use
  fresh IDs, all **64** live IDs are unique, and their archived source references
  resolve. Historical source streams remain unchanged in the archive.
- Verified all **36** live feature messages against their source text with
  collision references transformed. The **13** renamed collision copies retain
  exact transformed content plus explicit archival provenance. No stale colliding
  message ID remains in live family intent/spec/plan or family review artifacts;
  membership decisions and human spec/plan approvals resolve to the family
  messages rather than unrelated main decisions.
- Completed family loop state and history remain byte-for-byte identical to
  their feature-parent snapshots. The active graph still points to the family
  artifacts with implementation `in_review` and release `not_started`; main's
  historical production authority does not authorize this family integration.

## Verification evidence and limits

The integration owner reports all final candidate checks completed with exit 0:
strict typecheck, lint with zero warnings, production build, recipe/photo **57**,
auth **12**, family **27**, deployment helper **12**, and Python workflow **7**
tests. Both integrated auth/recipe/image Chrome QA and full family Chrome QA at
320/1440 plus development StrictMode passed. Provider/Google/image behavior in
these checks uses isolated test fixtures; no paid/live-provider or deployment
call is claimed. The additional family test checks pending recipe access before
provisioning and before invitation acceptance.

This reviewer independently inspected code, tests, policy and archival integrity;
the runtime/browser totals above are attributed to the integration owner. No
concurrent build, live Google/provider request, Vercel action or application edit
was performed by this reviewer. Only this review record was written. Final
staging, clean conflict resolution and local merge-commit recording remain the
integration owner's mechanical work; human feature-to-main and production gates
remain intact.
