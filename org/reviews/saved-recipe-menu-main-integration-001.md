---
artifact: saved-recipe-menu-main-integration
feature_parent: 645802308349503c1a9aa5ff3341028d95bcebb9
main_parent: 6efc2cff6bcf2b206c0b958c0ecd742a4d5bf828
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Saved menu — independent current-main integration review

No required code or evidence-preservation findings. Approved integration source
for the owner-authorized merge on the fresh combined evidence below; unresolved
secondary-browser limits must remain explicitly labeled in the handoff. This is review of the pending merged tree
against both recorded parents, not a claim that a merge/deployment occurred or
that earlier feature-only runtime results certify this combined source.

## Source and interface review

- Compared the combined application tree to both parents. Main's shared root
  layout/home and family/account presentation are retained. Root adds only the
  fresh ordinary Menu link beside Recipes/Family, without session reads or eager
  protected prefetch. Menu removes its duplicate outer container/header and owns
  one main and Your menu h1. The existing heading ID/tabIndex remains, preserving
  deliberate paging focus and the no-initial-title-focus correction.
- Menu save/status controls, notebook state, dialog/refresh/focus lifecycle,
  bounded API/Host/JWE/admission/CSRF/body guards, family-scoped queries, schema/
  grants, cursor contracts and direct browser photo behavior match the reviewed
  feature parent. No diff in those runtime sources was introduced by integration.
  Search/provider/photo/configuration boundaries remain unchanged.
- Inherited shared-layout HTTP tests now include Menu in common single-header/
  main/h1 checks, public navigation and anonymous protection. Shared-layout
  browser expectations include its header link, Tab order and no-prefetch check.
  Menu's browser helper accounts for brand→Recipes→Menu keyboard order without
  removing prior saved-state/confirmation/paging/focus assertions.
- The feature spec/plan explicitly reconcile the approved current-main shared
  shell. New layout/shared-test paths are named. Main's staging-first guidance
  and runbooks are retained; an authorized merge does not fabricate same-SHA
  staging acceptance or remove target-specific schema/cutover/recovery gates.

## Independent audit-preservation verification

Executed read-only byte/hash comparisons against the actual Git parents:

- All366 files listed by the archive manifest match both their recorded SHA256
  and exact original bytes at feature6458023. Independently enumerated the full
  original gates, messages, loop, memory, status and root workflow set: no missing
  archived file. Archived ledger complete-chain verification exits0.
- Canonical main ledger bytes remain an exact prefix of the new ledger; every
  original canonical main message is unchanged. Canonical loop config/state/
  history, memory events, status and workflow graph match main6efc2cf exactly at
  the review snapshot. Divergent branch chains were not concatenated or rewritten.
- Current feature spec/plan/visual links to original path-qualified owner records
  now name their archived copies. Unique historical review reports remain present;
  archive README and main-integration-audit.md distinguish historical records
  from new canonical authority. Canonical ceo-0050 records the actual new owner
  merge/Production instruction, with operational gates preserved.
- `gate_ledger.py verify --record saved-menu-human-merge-20261124` exits0. Its
  new canonical record names feature6458023, owner Rafael and the new canonical
  message, not the unrelated old feature ceo-0050 preserved in the archive.
- git diff --check passed. Reviewer changed only this report, no application,
  global audit state, Git index, user next-env.d.ts, database or external service.

## Verification and limits

Root/developer reports fresh combined frozen install/lint/typecheck/build and
199Node tests passing (82recipe,35menu,34family,16auth,32deployment). Actual menu
Chrome390/1440 and dialog320 pass, including shared-header keyboard behavior,
confirmation/status/paging/focus; actual auth Chrome320/390/768/1024/1440 plus
search/game/photo/logout pass. These commands/browser sessions were not duplicated
by this reviewer; the independent source/archive/ledger checks above are separate.

The inherited shared-layout browser helper stalled after its sign-in320 capture
while CDP remained responsive; its screenshot/wait code is unchanged. A bounded
private rerun is diagnosing it, and the inherited family browser had not completed
at this review update. Neither is labeled passed. The stall alone does not prove
an application regression or establish a tool-only root cause. Combined HTTP
landmark/navigation/guard tests plus passing actual menu/auth browser coverage
provide meaningful evidence for the changed shared shell; family/account page
runtime source is byte-identical to the main parent. Do not fabricate a complete
six-route browser pass or hide this residual coverage limit. Root retains final
actual job outcomes and exact-source attribution before release.

The inherited main shared-layout browser helper allocates its scenario and awaits
Chrome outside its try/finally. Its startup-failure cleanup weakness predates
this integration and is unchanged; root records it as a follow-up, not a newly
introduced menu defect or claimed failure of a successful current QA run.

No hosted mutation, migration, merge, deployment or release was executed by this
reviewer. The owner instruction authorizes the merge/deployment objective; exact
staging acceptance, schema compatibility interruption and safe recovery scope
remain separately evidenced operational prerequisites under current runbooks.

## Final secondary-browser completion

Root subsequently reports family Chrome production/development and five-width
authentication QA passed. The bounded private shared-layout rerun retained its
original six-route320/1440 assertions and passed with diagnostic CDP deadlines,
phase labels and cleanup only; no repository/runtime source changed. The original
unbounded process remains inconclusive/terminated143. Its exactly attributed
owned fixture/profile were cleaned. This closes the earlier pending coverage
attribution without recasting that original stalled job as a pass. Results are
root/developer observations, not independently rerun browser sessions.
