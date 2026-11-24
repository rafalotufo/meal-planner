---
artifact: intent/vercel-candidate-validation/hosted-results.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
status: final
round: 1
source_commit: 9fc13ff27a636483fdf3503d5c8bf9f149550e45
---

# Final scoped review — actual Preview setup and deployment

## Final scoped verdict

Approved for the owner-requested Preview configuration and deployment scope.
The dedicated staging callback/configuration, one READY reviewed-source Preview,
stable staging mapping and public sign-in layout evidence are complete. This
approval does not certify full authenticated staging validation: CLI app checks
remain platform-blocked/inconclusive, and Google round-trip/member/keyboard
checks were not completed. No Production promotion or routing change is approved.

The initial review held final sign-off because the alias was unmapped and a
Production domain had appeared concurrently. Owner reconciliation and fresh
post-operation evidence resolve that operational hold, as recorded below.

## Initial deployment evidence inspected

Read `org/messages/orchestrator-0074.md`, `hosted-results.md`, owner decisions
`ceo-0040` through `ceo-0042`, and only the named sanitized private deployment and
pre-alias result files. Verified the recorded source commit exists and contains
the independently reviewed packaging exclusions. No secret files or raw logs
were opened and no hosted account/API/browser action was performed.

- The sanitized deployment response records READY deployment
  `dpl_ALHqB6jCB6emyBNHTTbBzmfsV5Hi`, project
  `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, owning team
  `team_2c0O29FMb91g7L6sUChc9v6J`, commit
  `9fc13ff27a636483fdf3503d5c8bf9f149550e45`, and branch
  `codex/vercel-candidate-validation`. Its `target:null` is recorded consistently
  with the operator's explicit Preview deployment command; no Production/promotion
  operation is reported. The response's alias array is empty, so `aliasAssigned:true`
  is not evidence that the intended stable staging hostname is serving the app.
- Fresh domain metadata shows the staging hostname verified and qualified to that
  exact branch/project, with no redirect. The alias inventory has no staging
  hostname. This supports holding credentials/browser app validation until the
  eventual stable-origin mapping is verified.
- Both original Production aliases remain mapped to
  `dpl_Hf41h7Cr65E6U2UBv3duCa83FYFT`. The new `lotufo-meals.vercel.app` domain has
  null branch, redirects to the original Production domain and maps to the same
  Production deployment. This is real inventory drift; it cannot be silently
  excluded from pre/post comparison or assumed authorized by this workflow.
- The held manual staging assignment follows the reviewed fail-closed drift
  condition. The credential-free staging404 DEPLOYMENT_NOT_FOUND observation is
  accurately labeled as an unmapped-host result, not application/auth success.

## Configuration and packaging scope

Execution evidence attributes the dedicated staging Google client, exact callback,
External/Testing status and single specifically approved test user to the relevant
owner decisions. The Preview auth secret/client are independent, paid provider key
absent, existing Preview DB unchanged and Production metadata preserved. Those
configuration observations are operator evidence; this reviewer did not independently
reopen Google or decrypt/compare secret values.

The clean76-file payload install/build and mandatory PostgreSQL metadata verification
are explicitly recorded separately from actual READY deployment. Source/package
state remains attributable to the clean recorded commit. There is no claim of
migration, fixture identity, copied Production cookie, paid provider call, new
project, Git integration, resume or Production release.

## Initial hold and final resolution

The initial hold required reconciliation of the externally added domain and fresh
mapping/Production evidence. `org/messages/ceo-0043.md` now confirms the owner added
`lotufo-meals.vercel.app` as the intended Production URL and directs preservation
of its existing mapping while completing authorized staging-only work. The
historical baseline remains distinct from the reconciled baseline.

Read `.data/staging-ops/alias-mapped-result.json`, `post.json` and `post-result.json`:

- At15:17:35.923Z, the stable staging hostname maps to the exact READY Preview
  deployment/source/branch. At15:19:54.958Z, the post evidence still records
  `stagingAliasMapped:true`, target Preview, the same source SHA/deployment ID,
  complete domain/alias inventories and safe non-Production classification.
- Reconciled Production aliases/domains/deployment, Production env metadata,
  Preview env metadata and existing Preview DB metadata are all reported unchanged;
  paid provider key remains absent. The post evidence includes the owner-added
  Production domain rather than silently deleting it from the comparison.
- Bounded CLI checks received Vercel SSO302 and correctly remained exit2
  REQUEST_UNAVAILABLE. A failed/inconclusive check report must not be finalized
  or described as an authenticated pass. No bypass, redirect following or app
  credential was used to work around the platform challenge.
- Independently viewed both hosted390px/1440px screenshots: they show the expected
  Meal Planner sign-in heading and Google button, without identity/credential
  disclosure or visible layout clipping. The operator records equal viewport/
  scroll widths. Screenshots establish visible public sign-in layout, not Google
  authentication or the unverified keyboard sequence.

Full Google allowed/denied round-trip, member session/family reads, sign-out/fresh
sign-in and provider behavior remain explicitly unverified. No database write or
household provisioning is claimed. These limits do not prevent completion of the
specific owner-authorized setup/deployment request, but must remain visible in the
handoff. A future full authenticated validation run needs its actual evidence and
any independently scoped real-identity effects; this review invents no pass.

`git diff --check` passed. No independent application tests/build were rerun for
this evidence-only final review, and no external mutation or secret handling was
performed. The orchestrator owns serialized audit updates and final handoff; no further external action is required by this scoped review.
