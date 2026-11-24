---
artifact: intent/staging-first-release/plan.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Independent specification and plan review — staging-first release

## Verdict

Approved with no blocking findings. The combined documentation spec/plan matches
owner direction in `org/messages/ceo-0047.md` and may proceed through the existing
org gates. The author may mark these artifacts Approved; active guidance changes
wait for the orchestrator's matching gate record. No new owner preference or
repeated permission question is required for this already requested process edit.
This is not authorization for configuration, paid usage, deployment or release.

## Review passes

- Bugs: exact releaseSourceSha, Preview deployment/configuration attribution,
  readiness invalidation and explicit source-versus-later-audit commits prevent
  stale staging acceptance from certifying a different main revision. A clean
  pinned source checkout/export avoids the audit-HEAD trap. Staging and Production
  remain distinct builds; no Preview promotion or ancestry/content shortcut is
  introduced. The old9fc13ff owner acceptance is explicitly limited to that source.
- Security: unchanged helper/credentials/auth/session/DB/runtime and paid bounds
  remain outside the documentation change. A keyless helper's503 or inconclusive
  exit cannot become provider success; keyed staging exercises need separately
  bounded authority/evidence. Platform bypass cannot certify WAF enforcement.
  Owner acceptance of named gaps is an explicit release-risk decision, not a
  forged helper pass or permission to move missing checks to Production.
- Compliance: functional validation moves to staging as requested, while concrete
  manual merge/release scope, committed unexpired authority, Production packaging/
  readiness, canonical anonymous health and safe scoped recovery remain. One
  explicit owner approval can cover staging acceptance and the fully reviewable
  concrete Production action; separate gate records do not require duplicate
  prompts. Historical first-live evidence is preserved and clearly superseded
  for future release procedure rather than silently edited.

## Concrete grounding and usability

The current Production runbook still names real-login/provider/disconnect/WAF
checks and their two-search release budget. The plan explicitly replaces those
active requirements rather than merely adding contradictory staging language.
Existing `smoke.ts` candidate/anonymous modes remain available; dormant paid/burst
modes are not invoked by the new routine release sequence.

The staging helper actually requires `providerKeyAbsent` and complete member/
owner assertions (`tests/deployment/staging.ts:63–68,247–266`). The specification
preserves that behavior and differentiates named-gap owner acceptance from a full
helper pass. It also states the residual limits of minimal Production checks:
no claim of actual Production OAuth/provider/authenticated DB verification.

`lotufo-meals.vercel.app` is correctly treated as a separately authorized canonical
routing/auth/client prerequisite while currently recorded as a redirect. The
amendment does not claim current readiness or authorize changing Google/Production
settings. Unknown parity or failed canonical/config evidence blocks release or
uses only the release record's authorized recovery; no shared-project pause or
key revocation is inferred without scope.

The exact manifest is limited to four active guidance files, three new artifacts
and orchestrator-owned audit. The proposed acceptance example and scenario matrix
make source drift, audit commits, missing keys, platform blocking, expired authority
and failed health decisions concrete. The new graph staging_acceptance node stays
unapproved until an actual release-specific artifact exists. Existing generic
workflow/ledger tools are accurately described as audit aids, not new automatic
exact-SHA/parity enforcement.

## Verification and next handoff

Read active loop/graph, owner direction, sibling intent/spec/plan, current runbook
requirements and helper contracts. `git diff --check` passed;
`workflow_state.py check` reported consistent7nodes/108records. No application
build/test/browser or external action was performed or claimed for this doc review.

Implementation must run the planned Python workflow and org/link/whitespace/
staged-secret checks, then receive independent final exact-diff review. No
prose-mirroring tests or unrelated source/config changes are requested. No nits.
