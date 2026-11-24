---
artifact: saved-recipe-menu-main-integration
feature_parent: 645802308349503c1a9aa5ff3341028d95bcebb9
main_parent: 6efc2cff6bcf2b206c0b958c0ecd742a4d5bf828
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: approved
round: 1
---

# Saved menu — current-main integration and cutover security review

Verdict: security clear for the reviewed combined source and reviewable cutover
proposal; no new execution-blocking security defect found. This reviews the
pending integration of both recorded parents, not a completed merge or hosted
operation. Combined QA limits and the specific operational prerequisites below
remain visible; approval is not a fabricated all-browser or hosted pass.

## Source and audit evidence

- `app/layout.tsx:10–29` remains static server presentation. The added Menu link
  is a fixed same-origin ordinary anchor, with no eager prefetch/session read,
  identity/configuration prop or new client state. Main's brand/Recipes/Family
  navigation and page guards remain. `app/menu/page.tsx:9–18` retains family and
  verified-session checks before bounded store reads; one Your menu h1 replaces
  only the duplicate header/shell, retaining heading ID/tabIndex and intentional
  pagination focus. Existing private data still reaches only authorized pages.
- Diff against feature6458023 is empty for menu API modules, `lib/menu`, Proxy,
  shared auth/session/identity/public-policy code, DB connection, schema/catalog/
  migration/grant code, recipe search/provider/photo code and hosting/dependency
  configuration. Mandatory JWE-before-session, token/stable-identity binding,
  all-method Host/private/security headers, bounded exact-query saved lookup,
  Origin/body deadline, family scoping and common-lock mutation rechecks retain
  their reviewed implementation. No provider/auth regression is introduced by
  moving presentation to the shared shell.
- Family/account/invite changes inherited from main are presentation only:
  request methods/bodies, invitation fragment handling, admission decisions,
  provisioning/accept/revoke/logout effects and literal React text remain.
  Browser-helper changes account for the extra navigation stop using real input
  events, not a production bypass. Shared-layout HTTP/browser assertions include
  Menu, protected navigation, no eager protected prefetch and one header/main/h1.
- Independently verified all366 archive-manifest files match both their SHA256
  and exact original Git bytes at6458023. Canonical ledger retains main6efc2cf's
  complete original bytes as a prefix. Conflicting original feature audit records
  remain unmodified under `org/archive/saved-recipe-menu-pre-main-6458023/`;
  source-qualified spec/plan links identify those preserved approvals. The
  integration audit distinguishes historical branches from new canonical owner
  authority. Independent code reviewer also verifies original canonical main
  message and archived-chain integrity; divergent ledger tails are not spliced.

## Hosted cutover proposal

Reviewed `hosted-cutover-plan.md` and the sanitized `hosted-preflight.md`. Root's
preflight records exact known Vercel/team/Hobby/Node24 targets and direct canonical
ProductionJ2oX unchanged, both Neon targets verified-TLS/restricted with initial
one-migration catalogs and1family/1user/0invitations. I did not independently
contact Vercel/Neon or inspect private credential/backup contents.

The proposed sequence correctly treats strict old/new catalog incompatibility as
an interruption boundary, not an additive zero-downtime rollout:

- Pin one clean reviewed release SHA; deploy/inspect its unassigned Preview
  candidate before schema effects. Private full target-specific backups use
  PostgreSQL17, verified TLS, child-environment credentials and owner-only files,
  outside Git/uploads. Archive decoding/TOC checks are honestly distinguished
  from a real-data restore rehearsal; refresh Production backup before cutover.
- Apply only reviewed0001 and explicit menu SELECT/INSERT/DELETE, never bootstrap
  reprovisioning or blanket privileges. Verify runtime catalog/history/role and
  existing-table integrity. The proposal explicitly handles separately committed
  grants: a grant failure does not imply schema rollback, and only authorized
  idempotent grant repair is permitted.
- Validate/accept the exact same SHA on isolated staging before a separate
  Production build/promotion. Keyless/protected or owner-reported evidence cannot
  become provider success or a fabricated helper pass. Existing real-family
  save/removal validation needs concrete agreed scope; no persistent synthetic
  hosted users/rows, copied Production cookie, auth bypass or unapproved spend.
- Before migration/interruption effects, record the concrete decision covering
  both exact targets, accepted503/maintenance risk and safe failure disposition.
  Before Production build/promotion also retain current exact-SHA staging
  acceptance/profile and committed unexpired release authority. The generic
  owner merge/deploy instruction authorizes the objective/preparation; current
  AGENTS/runbooks still require this target-specific schema/recovery scope.
  Do not ask the owner to repeat already authorized generic merge/deploy intent.
- After schema commit, old initial-catalog deployments are incompatible rollback
  targets. Preserve new data/schema; never use disposable rollback SQL, drop the
  table/history, reset branches or restore backups over newer writes. A fallback
  artifact must be compatible, reviewed/accepted and specifically authorized.
  If none is healthy, only an explicitly scoped project pause/maintenance action
  is allowed, acknowledging Preview interruption and any actual owner-operated
  confirmation. Resume needs compatible correction/release authority. This is
  an actual necessary recovery boundary, not generic hypothetical approval.
- Production retains canonical routing/auth/configuration, bounded anonymous
  health plus15-minute observation, and read-only schema/role checks. Anonymous
  health is not authenticated menu/OAuth/provider certification. Later audit HEAD
  remains distinct from fixed source; profile/source drift invalidates readiness.

No hosted migration, pause, alias movement, Production build/promotion or external
write is performed or approved merely by this security report.

## Verification and remaining limits

Independently executed read-only archive/source/hash/main-ledger-prefix checks,
application/operational-document secret scan (0 findings), and git diff --check
(exit0). No runtime build/server/browser/database or external operation by this
reviewer. Parent relays fresh isolated frozen install/lint/typecheck/build GREEN,
199Node tests GREEN, menu Chrome390/1440/dialog320 GREEN and inherited auth Chrome
320/390/768/1024/1440 with game/photo/logout GREEN. Those are author evidence,
not tests redundantly rerun by this reviewer.

At this review snapshot the secondary shared-layout browser helper stalled after
sign-in320 with CDP still responsive; its bounded diagnosis/rerun and separate
family browser run remain pending. This report does not label those flows passed
or infer a production issue from an unfinished harness. Root must record final
actual results/disposition before claiming combined acceptance or promoting.

Separately relayed the inherited main shared-layout helper's preexisting Chrome-
startup-outside-finally cleanup weakness to root/code reviewer. It is unchanged
by integration, is not a new menu authentication defect, and remains a disclosed
fixture-ownership follow-up rather than an assertion that a successful run leaked
resources. Keep the user's active dev server/next-env/dev types untouched.

Original menu security approvals and fresh source checks support this integration;
actual final merge/source attribution, remaining QA, exact staging acceptance and
specific schema/interruption/recovery/release controls remain orchestrator-owned.

## Later attributed QA update

After the snapshot above, the parent relayed the author's completed family browser
Production/dev pass and auth five-width pass, plus a bounded private rerun of the
shared-layout six-route320/1440 flow with its original assertions passing. The
original unbounded shared-layout run remains inconclusive and was terminated143;
it is not rewritten as a pass or assigned an unproved tool-only cause. The bounded
rerun added only private CDP deadlines/phase labels/cleanup, with no repository
application/helper-source change. Parent reports ownership-proven non-FORCE
cleanup of that interrupted run's fixture database/profile. These later results
resolve the earlier pending attribution separately; this reviewer did not execute
them. Local main integration subsequently completed with pinned release source
1788143. Hosted schema/cutover/staging/release authority remains a separate scope.
