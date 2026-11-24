# PostgreSQL proxy recovery verification

Correction to first live attempt: runtime now statically imports the reviewed catalog and validated ordered migration metadata. Runtime PostgreSQL startup has no filesystem/public-loader path. Explicit migrations retain the public Drizzle loader and compare its fresh SQL hashes/journal timestamps to the reviewed metadata before connecting or writing. The actual pnpm build command runs the same upload-included verifier before Next, without regenerating files or weakening strict checks. No hosted migration, auth/Host/TLS/transaction/provider/SSRF change is involved.

## Reproduction and rejected experiments

The initial page/API-only trace check missed the distinct Node proxy. The realcompiled file-presence test failed for missing proxy SQL; explicit middleware include then actual recursive-inventory experiments each remained RED after real rebuilds and were rejected. The inventory experiment first encountered a strict UTF-8 overload error; specifying UTF-8 fixed compilation but did not fix packaging. Those source/config experiments are absent from the correction.

The stronger regression packages .next and dependency link/package.json into a private temporary runtime containing no lib/source/drizzle/env files, starts real Next with existing test-process-only Google transport and an isolated migrated local PostgreSQL database, then exercises callback/onboarding/provision/home/session. It failed before the correction (onboarding307; no valid callback admission when packaged SQL unavailable) and passes after it. This supersedes filesystem-presence assertions because the runtime now intentionally uses bundled metadata. No test is skipped or authorization mocked in production code.

## Actual checks

Private clean export with Node24.15.0/pnpm10.33.0; automated processes force OPENAI_API_KEY empty. User checkout/.next/dev and the user's next-env.d.ts change are untouched.

| Check | Result |
| --- | --- |
| Metadata regressions |5passed: exact fresh public-loader agreement; stale SQL; stale journal; malformed/empty/reordered/unsafe/stale manifest rejection; changed catalog-copy rejection |
| pnpm run build | Exit0, mandatory verifier and Next Production build |
| Isolated compiled runtime regression |1passed, real HTTP and native PostgreSQL, no source/migration files |
| pnpm run lint | Exit0, no warnings |
| pnpm run typecheck | Exit0, strict TS6 and skipLibCheck:false |
| pnpm run test:auth |12passed |
| pnpm run test:family |34passed |
| Existing deployment smoke tests |12passed |
| pnpm test |63passed |
| Python workflow unittest |7passed |
| Authentication/recipe Chrome |320/390/768/1024/1440, notebook/photo/filter/loading/error/reload/keyboard, no unexpected errors/overflow |
| Family Production Chrome |320/1440 onboarding/copied invitation/unlisted acceptance/shared family/revoke/logout pass |

Total127Node tests and7Python tests passed. Independent code review approved in postgresql-proxy-packaging-001.md; independent security review approved in postgresql-proxy-security-001.md. Security independently reran the initial five metadata/package checks successfully. Fixture/browser evidence is not a live provider/OAuth claim.

One development-browser run timed out during HMR after /api/invitation-context204 and /sign-in200; captured screenshot shows pending navigation, with a CSS preload warning. This was not counted as passing. Its export-only dev cache/failure evidence was preserved; a fresh-cache rerun is recorded below when complete. No warning suppression or increased timeout was introduced.

Fresh recovery screenshots use postgresql-recovery-* names; prior screenshots/reviews/attempt evidence are preserved. Production is owner-paused and independently returns503 DEPLOYMENT_PAUSED. Production PostgreSQL verified unchanged/empty after first attempt; no paid verification search was used. The correction has not been merged to main, staged or deployed. Renewed exact-source merge/release/resume authority remains required by the runbook.

Blocking update: the fresh-cache combined development rerun also timed out. Controlled dev-only comparison with the old reviewed connection/migrate source passed, while the corrected static-JSON runtime failed. Therefore inheritance/cache-only is disproven; this candidate is not release-ready despite production/packaging checks. No prewarm, warning filter or increased timeout is accepted. Import-level bisection is in progress, with all failures preserved privately and Production still paused.

## Final correction and completed verification

The migration-only JSON and TypeScript-constant probes also failed the pending client transition; no JSON-specific/framework cause is established. Both representation workarounds are rejected. Final runtime retains the simpler bundled catalog JSON and validated migration metadata JSON, with complete public-loader hash/journal and fresh catalog agreement checks in build/migration tooling.

The independently approved behavioral correction is a full same-origin document handoff after a successful invitation-cookie POST: window.location.replace('/sign-in'). It retains token capture/stripping before POST, active cleanup, generic error UI and the fixed destination; removes only the unused client-router dependency. The existing untouched cold-development StrictMode browser assertions now pass, with no prewarming, timeout increase or warning filtering.

Final clean-export run completed successfully: frozen install, mandatory prebuild verifier/Production build, lint, strict typecheck,63recipe tests,12auth tests,34family tests,18deployment tests (including5metadata and1real compiled package test), and7Python tests. Total127Node+7Python. Both full Chrome helpers exit0: recipe/notebook320/390/768/1024/1440; familyProduction320/1440 and developmentStrictMode. Separate fresh-cache dev-only handoff regression also exits0. New recovery screenshots preserve historical committed evidence.

The unchanged next-env.d.ts user development edit remains unstaged. No hosted database write/migration, secret/config change, Preview deployment, paid search, release promotion or resume occurred during correction. Read-only Vercel snapshots confirm identical environment IDs/scopes and Preview separation; the failed artifact remains paused. Final corrected source needs its own reviewed commit and renewed owner merge/release/resume authorization under the runbook.
