---
artifact: intent/vercel-candidate-validation/solutions.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Independent review — Vercel candidate validation options

## Verdict

Approved as researched options for owner discussion. No blocking findings.
This is not intent acceptance, selection of an architecture, a spec/plan approval,
or authority for implementation, external configuration, deployment or promotion.
The isolated-staging versus exact-Production-artifact decision remains open.

Reviewed the sibling intent, active loop, org protocol, REVIEW.md, authentication
and effect wrappers, deployment runbook/spec, package manifest and the official
sources below. No spec/plan exists at this exploration stage, as intended.

## Three review passes

- Bugs: the application Host rejection is correctly identified before Google
  (`proxy.ts:9–14`), with the additional origin/callback dependencies captured
  (`lib/auth.ts:33–35`, `lib/http.ts:6`,
  `app/api/auth/[...all]/route.ts:14,19,43,50–52`). The options correctly explain
  why attaching an alias or registering a callback alone cannot fix current
  behavior, and why a QA-only baseURL cannot survive unchanged promotion.
- Security: existing Google subject verification, admission/family requirements,
  host-only session behavior, finite origin trust and environment isolation remain
  requirements. OAuth Proxy is treated as shared authentication authority, not a
  simple configuration switch; compatibility with pinned Better Auth 1.7.27 is
  explicitly unverified. Platform bypass secrets stay scoped and are not treated
  as Google/app authentication or WAF verification.
- Compliance: scope stays at research. Production and Preview proof are separated,
  deployment identity and alias movement are addressed, and human merge/release
  gates are preserved. The owner-reported OAuth failure is not presented as a
  newly reproduced or diagnosed live Google error.

## Design follow-up, not a research blocker

For the exact-Production-candidate option, “read-only validation” describes the
intended test operations, not a promise of a database-read-only OAuth flow:
`lib/auth.ts:53` can update an existing subject's verified email at callback.
A future specification must account for that existing effect and authorize the
chosen test identity/data boundaries before real hosted sign-in. The current
research does not authorize such a flow.

## Corrections and verification

Corrected one citation from `lib/http.ts:5` to the actual origin guard at line6.
No substantive author decisions changed. `git diff --check` passed. No browser,
OAuth, deployed-app or application-build verification is claimed for this
research-only review; node_modules is absent. The orchestrator records workflow
test output separately.

Official documentation checked 2026-11-24:

- [Google server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server):
  exact registered redirect URI matching.
- [Google OAuth client settings](https://support.google.com/cloud/answer/15549257?hl=en):
  redirect and JavaScript-origin configuration rules.
- [Vercel deployment promotion](https://vercel.com/docs/deployments/promoting-a-deployment):
  Preview rebuild versus staged Production promotion without rebuild.
- [Better Auth OAuth Proxy](https://better-auth.com/docs/plugins/oauth-proxy):
  trusted callback server and shared authentication authority.
- [Vercel automation bypass](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation):
  platform protections bypassed and limits of that test access path.
