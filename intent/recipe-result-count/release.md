# Recipe result count — release preparation

Owner instruction: “Merge and deploy this change so I can try it in the app.”
The local merge is approved in gate `recipe-result-count-human-merge-20261124`.
Independent source/release review: `org/reviews/recipe-result-count-release.md`.
The completed shared-layout loop is historical and has not been reopened.

## Local verification

Application source is one changed research-instruction line in
`lib/recipes/openai.ts`; all other changes are feature evidence/reviews and the
append-only merge decision. Base and current local main were64f3a76794f79fea37c39e062368c1844832f71e.
The original lint/typecheck/build/Python passes and both authorized live searches
are in verification.md. Fresh release regressions passed199Node tests:
82recipe,34family,16auth,35menu,32deployment. Dedicated local mp_test temporary
databases and fixture servers only; no hosted or development data mutated.

Initial deployment tests hit sandbox loopback EPERM. The network-enabled rerun
exposed missing worktree test configuration; the existing private native-local
configuration was made available owner-only, then the complete affected suites
passed. No check or fixture was weakened. No application source changed in
response to these environment failures.

`pnpm audit --prod` reports the existing single moderate esbuild advisory
GHSA-67mh-4wv8-2f99 in Better Auth's drizzle-kit development-server tooling chain,
no high/critical finding. Previous independent reachability triage is
`org/reviews/security-saved-recipe-menu-release-audit-001.md`; dependency graph
unchanged. No upgrade or audit suppression.

## Target and configuration preflight

Fresh pinned scripts-disabled Vercel66.6.0 API/CLI inspection at21:07–21:09UTC:
existing meal-planner project prj_ntxXnJAVA977jHjLNDR7xJuwSx4V, team
team_2c0O29FMb91g7L6sUChc9v6J / rafalotufos-projects, Hobby, unpaused,
Next.js/Node24.x, frozen install/build, no Git integration, automatic Production
domain assignment disabled. All domains/aliases inspected without continuation.
Canonical lotufo-meals has no redirect; staging remains branch-qualified main.
Stable staging points atCMzD; three Production aliases point at9a7V.

Private comparisons matched Preview stable auth origin, canonical Production
auth origin, provider=openai, Production model=gpt-6.2-sol and corepack=1 in both
targets. No branch overrides. Preview has no OpenAI key or model override and
uses the unchanged source default. Credential values were not retrieved or
printed. Existing sensitive DB/auth/Google/provider entries and protection
remain unchanged; no configuration/domain/database effect is authorized here.

Next: pin the committed reviewed source and clean export; deploy/validate that
exact source on isolated Preview. Actual staging results/gaps must be recorded
and accepted by the owner before separate Production packaging/promotion.
No Production release authorization is claimed by the earlier merge/deploy
instruction alone before exact staging scope and gaps are reviewable.

## Completed merge and staging

Local main was clean at the expected base and fast-forwarded to exact reviewed
release source `4e66fb7bf1e9887c6c88e89fae984005ff02f118`. Source correction
commit80d92de is followed by a documentation-only plan-approval format correction;
the initial plan-sync failure was a missing machine-readable Approved header,
not an implementation departure. Final full-base plan-sync passed after the
independently approved status/manifest and truthful engineer gate were recorded.
Staged secret scanning reported zero findings. No remote is configured.

A clean archive of pinned4e66fb7 produced100upload files/445277bytes. Every
upload file's SHA1 matched the export; required runtime/SQL/config/lock assets
were present and env/private/audit files excluded. A separate copy containing
only those upload files passed frozen install and production build. Source
export and private receipts remain ignored and owner-only for the pinned release.

Preview deployment and actual staged checks are recorded in staging.md.
Independent exact-source staging handoff approved in
`org/reviews/recipe-result-count-staging.md`. Current environment metadata matched
both the pre/post staging inspections and the previous saved-menu release;
domain/project settings remained unchanged. Current Production9a7V readback
confirmed READY/Production and its recorded saved-menu source1788143, with
identical runtime/schema contract and only the prompt line differing in app code.

Owner exact-source staging acceptance and concrete Production scope/recovery
authority remain outstanding. No Production build or promotion has occurred.
Later audit commits record evidence only; they must not replace pinned4e66fb7 as
the source for this release.
