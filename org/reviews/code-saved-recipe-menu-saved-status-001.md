---
artifact: saved-recipe-menu-saved-status-correction
base_commit: 0225e33
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Saved recipe controls — independent focused code review

Approved. No remaining required findings. Reviewed the owner0056 correction
against0225e33, its amended spec/plan/README, actual application/test diff and
final verification section `Owner0056 — disable saved recipes and remove Add
again`. This scope includes disabling known-saved controls
and the bounded membership lookup; it does not grant merge or hosted authority.

## Correctness and scope

- SaveRecipeButton removes Add again, shows disabled Added to menu after a
  confirmed save or known membership, disables unknown/checking status, and
  keeps membership-check retry separate from actual-save retry. It never treats
  a failed lookup as proof that saving is available. Fixed session/family guidance
  and validated save responses remain; duplicate server saves remain idempotent.
- SearchNotebook owns membership by canonical source URL, shared across filter
  remounts and result groups. Active-search selection/retry keys invalidate
  checks; cleanup aborts and generation checks discard abandoned responses.
  Per-URL save counters prevent an older check from overwriting a later local
  save. Response fields/array bounds/request membership are validated before
  updating state. No pagination traversal, provider work, polling or full-menu
  materialization is introduced.
- The exact POST lookup mode uses the existing all-method Host/JWE/admission/
  family guard and Origin/actual16KiB/five-second body reader. Unknown/duplicate/
  mixed query keys fail. Only1–6 validated URLs reach the store; bound family
  and ANY(text[]) predicates plus LIMIT6 query the existing scoped index. Only
  matching requested URLs return, with no snapshots/owners/IDs and no write.
  GET pagination, schema/grants, Proxy and photo/provider boundaries are unchanged.
- Spec/plan and README now describe disabled saved controls, bounded checking,
  separate retries and fresh/reopened checks. The superseded available-after-
  success/no-initial-lookup language is removed. The title-focus correction,
  dialog/removal focus and owned-fixture cleanup remain intact. The review did
  not edit or restore the user's existing next-env.d.ts development-types change.

## Resolved test-evidence finding

During review, the first proposed reopen test clicked the currently selected
first notebook heading twice. The approved notebook does not collapse its active
panel, so that sequence did not reopen anything; claiming reopen coverage from
it was incorrect. This was a required evidence correction, not an application
runtime defect.

The final helper now captures the saved group's ID, clicks an actually collapsed
heading, asserts a different group is active, returns to the saved ID, asserts
that exact group is active again, then checks its saved button stays disabled.
The author reran the full actual Chrome matrix successfully after this correction.
The fresh-same-URL case also waits for the newly submitted query's heading rather
than accepting the previous group's already-disabled button. The finding is closed.

## Verification and proof limits

Independently executed `node --import tsx --test tests/menu/validation.test.ts`:
6passed,0failed. An isolated temporary copy with lookup's maximum changed from6
to60 made the actual lookup-bound regression fail (5passed/1failed); original
repository code was untouched and temporary files removed. git diff --check
passed. Inspected the390px disabled-state screenshot: Added to menu is visibly
disabled with saved feedback; Add again is absent.

Read the actual new HTTP/body/validation/source-free-package/browser tests.
They cover membership beyond the first50, family isolation, exact shapes/query/
Origin/no-effect denial, disabled-click no-save requests, unknown/error/retry,
real switched-group reopen, fresh/reloaded same-URL searches, filter remounts
and cancellation of a delayed old lookup while a later search owns status.
No claim is made that a concurrent successful save during initial checking was
browser-tested: unknown controls are intentionally disabled; counters are a
separate defensive code guard.

The author's final handoff reports lint, isolated strict typecheck/build,
recipe82/menu35/family34/deployment32 and the expanded actual Chrome suite all passing,
including the corrected reopen test and existing390/1440/dialog320 flows. These
full commands were not redundantly rerun by this reviewer; independent commands
and inspected evidence are distinguished above. Security reassessment of the
lookup is handled separately by the security researcher, not inferred from old
whole-feature approval. No live DB/server/browser, application/test edit, migration,
merge or deployment was performed by this reviewer; only this report was written.
