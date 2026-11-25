# CLI Preview source attribution — independent operational assessment

- Reviewer: reviewer; date: 2026-11-25
- Fixed release source: `19774c7cd8ae301682003838f083b9d825d5e56d`
- Verdict: **Acceptable scoped operator-supplied attribution; no source change
  or weakened target guard is required for this proposal.**
- Scope: read-only assessment. No CLI deployment, Git, database, alias or
  environment mutation was performed by this reviewer.

The approved specification at lines137–160 permits build-known source/profile
from trusted build inputs and explicitly limits the model to trusted source/build/
platform administration. The source SHA is not cryptographic Git-provider
attestation. Supplying the truthful fixed SHA to this exact CLI deployment at
both build and runtime preserves `target.ts:18–27`: the immutable manifest and
current metadata must still agree, along with all real Preview/project/deployment/
origin/database/run checks. There is no fake user, wildcard trust, missing-value
fallback or replacement of an actual deployment ID.

Use only the clean pinned19774c7 Git source/export whose139-file inventory and
blob hashes have been checked. Record the two explicit per-deployment inputs as
operator-provided source attribution, along with actual upload/deployment identity
and profile. Do not claim a GitHub-linked trigger, provider-signed commit proof,
repository integration or other Git metadata that was not observed. Do not set or
spoof actual environment/project/deployment identifiers to force admission.
Later audit HEAD remains distinct from the release source.

Vercel documents separate `--build-env` and `--env` controls for build and runtime
inputs in its [deploy CLI reference](https://vercel.com/docs/cli/deploy).
`VERCEL_GIT_COMMIT_SHA` is not listed in its current [reserved variable
list](https://vercel.com/docs/environment-variables/reserved-environment-variables).
These support the proposed mechanism; actual CLI acceptance/effective values
still need observation, and no successful retry is asserted by this review.

The reported generic build error alone does not identify the missing input.
Treat absent CLI source SHA as a hypothesis until verified; if the retry fails,
inspect the nonsecret input presence/shape and actual build result rather than
inventing another identity value or bypassing guards. Successful build alone is
not staging acceptance. Retain the failed attempt in evidence; fresh exact-target
runtime/browser, schema and ingress verification and owner gap/release gates still
apply. This note does not grant new hosted/schema/provider/Production authority.

`git diff --check` passed. Official references were consulted2026-11-25.
