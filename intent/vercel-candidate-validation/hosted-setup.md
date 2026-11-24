# Preview-only hosted setup — isolated staging

- Author: architect
- Date: 2026-11-24
- Status: Approved operational scope — owner authority and independent review
- Review: `org/reviews/hosted-vercel-candidate-validation-001.md`
- Authority: `org/messages/ceo-0030.md` — Rafael: “Run the preview-only deployment
  from this worktree branch. Lets configure the domains for the oauth client first.”
- Reviewed local baseline: `d485897`; sibling approved `spec.md`, `plan.md`,
  `staging-runbook.md` and verification evidence remain the implementation contract.

This authority permits necessary Preview-only domain/OAuth configuration and one
Preview deployment from the reviewed current worktree branch without a merge.
It does not authorize Production changes/promotion, schema migration, data import,
provider calls, billing changes, a new project, Git integration, or project resume.
No additional application change is proposed. Preserve the completed Build loop.

## Recorded preflight and scope

The orchestrator's complete account preflight reported the following; read it
again before effects and stop on drift rather than assume it is still current:

- Hobby scope `rafalotufos-projects`, team `team_2c0O29FMb91g7L6sUChc9v6J`,
  project `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, Node24, paused false.
- Production target `dpl_Hf41h7Cr65E6U2UBv3duCa83FYFT`, generated origin
  `https://meal-planner-nmdnzzwyp-rafalotufos-projects.vercel.app`.
- Sole project domain `meal-planner-delta-six-55.vercel.app`, verified true,
  `gitBranch: null`. Additional alias `meal-planner-rafalotufos-projects.vercel.app`
  maps to that same Production deployment. Preserve both assignments exactly.
- No Preview deployment currently exists. Preview environment has only the
  existing sensitive `DATABASE_URL`; authentication/provider keys are currently
  Production-only. Do not copy those Production credentials into Preview.

Acquire the private staging lane lock before the first domain/OAuth mutation
and retain it through the complete setup and validation interval.

## Domain first, with Preview classification in the same request

Candidate hostname: `meal-planner-staging-rafalotufos.vercel.app`.
It is proposed, not yet reserved or confirmed available. Keep it distinct from
all existing Production and generated hostnames. Enumerate all alias/domain
pages and verify no conflicting owner/project before the creation attempt.

Use the authenticated pinned CLI's API transport, explicit team/project scope,
with a nonsecret JSON input file for this **single branch-qualified** operation:

```text
POST /v10/projects/prj_ntxXnJAVA977jHjLNDR7xJuwSx4V/domains
?teamId=team_2c0O29FMb91g7L6sUChc9v6J
```

```json
{
  "name": "meal-planner-staging-rafalotufos.vercel.app",
  "gitBranch": "codex/vercel-candidate-validation"
}
```

Do not create an unqualified domain and patch it later: that intermediate state
can classify it as Production. Do not set a redirect or custom environment.
Require response and fresh readback to retain this exact name/project/branch,
`verified: true`, no redirect and no Production/default assignment. Confirm the
complete existing Production-domain set and deployment target remain unchanged.
An unused staging hostname need not serve application traffic before deployment.

The REST API documents `gitBranch`, and Vercel documents branch-qualified
project domains as Preview routing. CLI deployments must be associated with the
same branch; no Git integration is needed merely to submit/check Git metadata.
However, the public API docs do not explicitly guarantee that an arbitrary free
`*.vercel.app` name accepts branch-qualified creation on this account. The scoped
request and readback establish that capability. On rejection, stripped/null
branch, failed verification, ownership conflict, unexpected Production routing
or any paid requirement: stop, retain sanitized evidence and do not retry with
weaker classification, purchase a domain or move an existing alias. Report any
partial resource rather than deleting/rewriting unrelated domains.

## Google callback and Preview configuration

Only after the safe staging hostname is confirmed, configure a dedicated Google
Web OAuth client with exact redirect URI:
`https://meal-planner-staging-rafalotufos.vercel.app/api/auth/callback/google`.
This server redirect flow requires the callback registration, not merely a
JavaScript Origin entry. Verify account/project and consent/test-user settings;
if the selected Google project is uninitialized, establish only the minimum
staging consent/client setup. Preserve all existing Production OAuth clients,
secrets and registrations, even if they reside in another Google project.
Use owner-supplied required identity/contact choices; do not invent them.

Privately configure Preview-only `BETTER_AUTH_URL` to the exact staging origin,
a new random `BETTER_AUTH_SECRET` of at least32bytes, new staging Google client
ID/secret, `RECIPE_SEARCH_PROVIDER=openai`, and the existing pinned build policy.
Leave `OPENAI_API_KEY` absent/empty. Keep existing Preview restricted pooled
`DATABASE_URL` unchanged; privately verify its recorded Neon Preview target,
verified TLS and distinction from Production. No env pull or secret output.
Do not change Development/Production variables, allowlist, protection or WAF.

## Preview deployment and bounded validation

Acquire the runbook's private exclusive staging lane lock. Capture clean reviewed
source SHA/current branch and Production assignments. Deploy with pinned CLI66.6.0
from this worktree to Preview only: no `--prod`, custom target, Production prebuilt
output or promotion. Inspect actual target/readiness/team/project/source/branch;
wrong/missing attribution is inconclusive, never permission to reclassify it.
The domain branch must match the deployment's actual Git association. If Vercel
has not attached the staging alias automatically, assign only that qualified
staging hostname to the inspected Preview deployment, then inspect again.

Require alias-to-Preview mapping, unchanged branch classification and unchanged
Production domain/deployment assignments before browser/session use. Reuse the
implemented check/finalize helper and fresh sanitized pre/post metadata. Maintain
normal Google verification and one-hour host-only sessions; never copy Production
cookies, introduce fixtures or silently provision a household. This authority
covers configuration/deployment; persistent Preview onboarding effects require
explicitly scoped real-identity authority before member tests. Anonymous checks
are possible first; incomplete Google/member/browser evidence remains inconclusive.

On failure stop and report sanitized partial results; do not auto-retry deployments,
remove resources, weaken authentication/protection, reset databases or pause/resume
the shared project. Record actual staging domain/client/deployment ID and source SHA,
never secret values, personal identities or OAuth query strings. Confirm all
Production assignments unchanged at the end and release only this run's lane lock.

## Primary references checked 2026-11-24

- [Add Project Domain](https://vercel.com/docs/rest-api/projects/add-a-domain-to-a-project):
  atomic name/`gitBranch` request and verified project/branch response.
- [Branch domains](https://vercel.com/docs/domains/working-with-domains/assign-domain-to-a-git-branch):
  Preview domain associated with a selected branch.
- [Aliases](https://vercel.com/docs/cli/alias): unqualified project domains apply
  to Production; CLI branch association needs Git metadata; manual alias support.
- [Google server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server):
  exact registered callback URI.
