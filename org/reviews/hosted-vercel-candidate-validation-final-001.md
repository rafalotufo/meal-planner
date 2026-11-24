---
artifact: intent/vercel-candidate-validation/hosted-results.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: pending
status: interim
round: 1
source_commit: 9fc13ff27a636483fdf3503d5c8bf9f149550e45
---

# Interim independent review — actual Preview setup and deployment

## Interim conclusion

Completed setup/deployment evidence is consistent with the scoped owner authority.
No defect in the completed steps is identified. Final operational approval remains
pending: the staging alias is unmapped, concurrent Production-domain inventory
changed, and genuine staging OAuth/member/browser validation is not established.
This record does not approve alias assignment, a complete validation pass or any
Production effect. The pending state reflects incomplete operational evidence,
not a new code-review finding or a request to repeat already granted permissions.

## Evidence inspected

Read `org/messages/orchestrator-0049.md`, `hosted-results.md`, owner decisions
`ceo-0030` through `ceo-0032`, and only the named sanitized private deployment and
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

## Remaining evidence before final operational sign-off

Reconcile the externally added domain with the owner and preserve its assignment;
record the resulting complete current Production baseline without overwriting the
historical one. After that is resolved, any authorized staging-only alias operation
must prove exact Preview mapping, unchanged branch classification and unchanged
reconciled Production assignments. Run the appropriate bounded anonymous checks
with fresh pre/post evidence; record platform denials as inconclusive. Genuine
OAuth/member/browser evidence and any separately scoped persistent identity effects
must remain explicit before a full authenticated validation pass can be claimed.

`git diff --check` passed. No independent application tests/build were rerun for
this evidence-only interim review, and no external mutation or secret handling was
performed. The orchestrator owns continued operations and the final evidence update.
