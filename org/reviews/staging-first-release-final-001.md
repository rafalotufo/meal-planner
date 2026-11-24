---
artifact: staging-first-release-docs
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
baseline: 0f909d2
---

# Final independent review — staging-first release guidance

## Verdict

Approved with no blocking findings. The stable four-document implementation
matches the approved intent/spec/plan and owner process direction. Functional
validation is placed on exact-source staging before a separately authorized
Production build/promotion; minimal canonical anonymous health and scoped recovery
remain in Production. No deployment, configuration, provider usage, migration,
merge or release authority is granted by this documentation review.

## Bugs, security and compliance

- The Production runbook replaces the old mandatory Production login/paid search/
  disconnect/WAF/browser certification rather than retaining contradictory live
  call requirements. Historical first-live scope remains evidence of past work,
  explicitly superseded for future procedure. Dormant helper modes are unchanged.
- Exact releaseSourceSha/Preview/profile acceptance, alias/configuration freshness
  and source-versus-audit-HEAD instructions are consistent across both runbooks,
  README and AGENTS. Production uploads a clean pinned source directory and must
  prove source attribution; ancestry, equal-looking code and metadata alone are
  insufficient. Generic gates are explicitly not automatic exact-SHA/parity proof.
- The current keyless helper contract is preserved. Missing-key503 and platform
  challenges remain limited/inconclusive evidence; a named-gap owner decision
  cannot manufacture helper success or individual attestations. Separately keyed
  staging coverage needs its own bounded authority/profile/evidence and does not
  copy Production credentials or silently move missing checks to Production.
- One explicit concrete owner decision may cover staging acceptance and reviewable
  Production actions, recorded in appropriate separate gates without repeated
  prompts. Old9fc13ff acceptance does not certify a new source or grant a release.
- Existing project/configuration and credentials are preserved and verified;
  creation/rotation, relinking, protection changes and canonical lotufo-meals
  routing/auth/callback configuration require actual separate authority. Last-
  recorded keyless/redirect facts are not represented as fresh account inspection.
- Minimal Production health is limited to readiness/configuration/canonical
  anonymous checks and15-minute observation/recovery scope. Actual Production
  OAuth/provider/authenticated DB limits are stated. Only explicitly authorized
  safe rollback/pause can recover; no automatic resume, key revocation or paid retry.

All nine plan scenarios are expressed in actionable instructions: matching source,
new main SHA, later audit commits, staging config/alias drift, keyless/provider gap,
protected evidence, unresolved canonical redirect, missing/expired release authority
and failed canonical health. The graph's release-specific staging acceptance remains
operator-attested; no runtime enforcement or fabricated completed node is claimed.

## Independent verification and limits

Reviewed the stable diff against0f909d2 in exactly the four active-guidance files.
Independently checked all eight newly added local Markdown links resolve and README
outside its Vercel section is byte-identical. Verified helper/tests, generic gate/
workflow scripts, package manifest and Vercel runtime configuration are unchanged.
`git diff --check` passed. The writer records Python workflow regression7/7 passing;
no application build/test/browser or external action is claimed for this docs-only
change, and none is required to mirror prose.

No unrelated historical evidence, runtime contract or approval threshold was
weakened. The orchestrator records real final org/gate/secret checks and commits
the documentation; no further reviewer correction is required.

## Mechanical plan-parser follow-up

The initial documentation commit6cff3aa preceded the final plan-sync check, which
found the plan heading was not the parser's required manifest heading. Reviewed
the exact follow-up delta: only `## Exact implementation manifest` changes to
`## Files that change`; no file manifest, scope or guidance changes. Independently
ran `python3 scripts/check_plan_sync.py --hook --plan intent/staging-first-release/plan.md`
on the staged correction: exit0. The unchanged memory checker also reports zero
violations after the digest refresh. No parser/guard/test/compiler restriction was
weakened; this is a transparent mechanical audit fix, not a new implementation.

The whole-branch check subsequently exposed another manifest-format issue:
path bullets carried trailing scope prose or brace/multiple-path notation that
the parser did not expand. Reviewedb4f51da: paths are now individual parser-readable
bullets, with the same scope restrictions retained in adjacent prose. Approved
files/scope are unchanged. The earlier staged-only check did not prove AGENTS
coverage; independently ran the actual full-baseline command
`python3 scripts/check_plan_sync.py --base fce96bf --head HEAD --plan intent/staging-first-release/plan.md --two-dot`:
exit0. No parser or enforcement rule changed, and no extra tests/code edits were made.
