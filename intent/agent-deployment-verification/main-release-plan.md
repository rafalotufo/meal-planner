# Verification feature — main integration and release preparation

- Author: senior-developer; date: 2026-11-25
- Status: Draft for independent review
- Inputs: reviewed feature `a8867b4`, current main `cd60db4`, approved sibling specification/plan, owner's request to merge and deploy using verification flow.
- Boundary: this plan authorizes local integration and proof only. Root coordinates Git/audit reconciliation and exact staging/Production operational gates; this worker performs no shared/hosted mutation or deployment.

## Concrete integration findings

Main adds reviewed `platform-permissions.ts` and `attribute-options.ts` validators
and wires them into `lib/db/security.ts`. The feature has not intentionally changed
that validator: a normal merge must retain main's finite hosted permission baseline,
strict attribute normalization and all corresponding tests, while preserving both
new native verification migrations, immutable descriptors and column-grant profiles.
Do not replace main's security file with the older branch copy or widen the policy.

The current Vercel upload excludes `scripts/`, but package dev/typecheck/build
prefixes call `scripts/build-verification-manifest.ts`. A clean upload therefore
cannot generate its required immutable policy. Local `.verification/` is gitignored
but not currently upload-excluded, so a stale generated policy could also leak into
a CLI source package. Both packaging defects must be corrected before deployment.

## Ordered local work and proof

1. [ ] Write a strict TypeScript clean-upload regression first. Export only tracked
   application/config/package files allowed by the actual `.vercelignore`; never
   copy env files, credentials, audit records, test/operator tooling or local build
   output. Validate the exclusion grammar instead of silently approximating unknown
   patterns. Use an owned temporary directory and matching pinned dependency links.
2. [ ] Run the exported package build to record the actual missing-generator RED.
   Do not make scripts uploadable or supply an existing generated manifest to hide it.
3. [ ] Move the generator to `lib/verification/build-manifest.ts`, update package
   prefixes and relative imports, and add `.verification` to `.vercelignore`.
   Keep operator scripts/tests/audit excluded and ordinary/Production generation
   disabled. Keep trusted Preview generation and immutable runtime binding unchanged.
4. [ ] Rebuild the same clean export for GREEN. Assert the omitted script/private
   state are absent, policy generation begins without a pre-existing manifest,
   the package passes prebuild metadata verification and produces a real Next build.
   Record actual source/package inventory and commands without exposing secrets.
5. [ ] After root merges main, verify both finite hosted validators and their
   tests remain present. Validate combined migration metadata, exact column grants
   and all local application regressions using only owned disposable databases.
   Main's platform baseline and strict unknown-state rejection remain unchanged.
   Reconcile `tests/migrations/security.test.ts` as the union of both branches:
   retain main's real `n_distinct=42` rejection and the feature's native-ledger/
   counter assertions. Run focused platform-permissions and attribute-options
   tests plus the real security fixture against the combined verification catalog.
6. [ ] Run lint/typecheck/build, migration/family/menu/plans/auth/recipe/deployment
   and Python workflow suites, focused verification tests and real mobile/desktop
   browser verification. Serialize fixture builds; record actual browser gaps.
7. [ ] Obtain independent code/security review of the exact combined source and
   packaging proof. Root may merge that reviewed local result to main under owner
   authority, then separately validate/accept the exact release SHA on isolated
   staging before Production packaging/promotion and minimal anonymous health.

## Files that change

- `intent/agent-deployment-verification/main-release-plan.md`
- `intent/agent-deployment-verification/main-release-verification.md`
- `intent/agent-deployment-verification/plan.md`
- `lib/verification/build-manifest.ts`
- `scripts/build-verification-manifest.ts` (move/removal only)
- `package.json`
- `.vercelignore`
- `tests/migrations/security.test.ts` (union-preserving merge reconciliation only)
- `tests/deployment/upload-build.test.ts`
- `tests/deployment/upload-source.ts`
- `tests/verification/server.ts` (generator move compatibility only, if required)

Root owns Git merge conflicts, workflow graph/ledger/message reconciliation and
all operational authorization. Any additional implementation conflict requires a
specific plan refinement before editing; no broad validator or gate exception.

## Required evidence and limits

The clean export must build with Node24.15.0/pnpm10.33.0, locked dependencies and
empty paid keys, without database access or local generated-policy input. It proves
source packaging/buildability, not Vercel readiness, hosted Google/provider success,
exact staging release acceptance or Production behavior. The two new native
migrations and scoped grants remain separately gated on each recorded hosted target.
No fake helper flags, cached artifact or local browser pass may substitute for
actual exact-source hosted verification and the existing release recovery scope.
