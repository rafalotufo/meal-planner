---
artifact: intent/vercel-candidate-validation/hosted-setup.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Operational review — Preview domain, Google client and deployment

## Verdict

Approved within the explicit scope recorded in `org/messages/ceo-0030.md`:
necessary Preview-only domain/OAuth setup, then one reviewed-worktree Preview
deployment without merge. No new owner confirmation is requested for those
already authorized actions. This review does not expand authority to Production,
promotion, resume, migrations/imports, paid services/provider calls or persistent
Preview household effects.

## Evidence and bounds

Read the completed Build loop, approved sibling intent/spec/plan/runbook and the
128-line hosted setup proposal. The implementation acceptance records all eight
required commands passing; no application source change is proposed here.
The account baseline in the proposal is attributed to the orchestrator, not a new
independent account inspection by this reviewer. Refresh it before effects.

- Bugs: the atomic name+`gitBranch` request avoids an unqualified intermediate
  project domain. Exact project/team, branch, verification, redirect absence and
  unchanged complete Production assignments must survive fresh readback before
  Google configuration continues. Deployment must prove Preview and matching Git
  association; hostname shape is insufficient. Stop on account/API disagreement.
- Security: dedicated staging Google client/secret and independent auth secret
  remain Preview-only. Existing Preview DB stays unchanged, Production credentials
  and OAuth clients remain untouched, OpenAI key stays absent, and no fixture or
  cookie copying bypasses normal auth. Consent contact choices must come from
  the owner where required. Unknown state is not permission to weaken protection.
- Compliance: one scoped free branch-domain attempt is consistent with the
  selected isolation requirement. Its success on this account is not established
  by generic docs; rejection/null branch/unverified ownership/paid requirements
  must stop without fallback. Existing production deployment/domain mappings and
  shared-project state remain fixed. Member tests wait for independently scoped
  real-identity callback/provisioning effects, as the proposal states.

Use the existing runbook's cooperative lane lock across the whole mutation
sequence, including initial domain assignment, Google configuration and deployment;
the later deployment-section reminder does not shorten the approved lock interval.
Only the owned lock may be released. Preserve partial results and stop rather than
retry, promote, resume or broaden scope if a prerequisite fails.

## References and verification limits

Checked official [Add Project Domain](https://vercel.com/docs/rest-api/projects/add-a-domain-to-a-project):
name and `gitBranch` may be sent together, with project/branch/verified response
fields. Checked [branch-domain documentation](https://vercel.com/docs/domains/working-with-domains/assign-domain-to-a-git-branch):
Preview classification is associated with the selected branch. These support the
request shape, not arbitrary free-host availability or actual account capability.

`git diff --check` passed. No API mutation, account inspection, browser, OAuth,
HTTP/deployment, database, provider or application-build operation was performed
by this reviewer. The orchestrator records actual effects and readbacks; no
hosted validation success is inferred from this operational approval.
