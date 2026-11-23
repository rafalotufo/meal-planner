# Vercel deployment — local Build verification

Date: 2026-11-23. Approved plan source: 96f3154; plan approval committed in
4bbc1fe. This report distinguishes local readiness from hosted acceptance.

## Actual local results

| Command / check | Result |
| --- | --- |
| Frozen install | Exit 0, pnpm 10.33.0 / Node 24.15.0; lockfile unchanged |
| `pnpm run lint` | Exit 0 |
| `pnpm run typecheck` | Exit 0, new helpers included under strict root tsconfig |
| `pnpm test` | 57 passed, 0 failed |
| `node --import tsx --test tests/deployment/smoke.test.ts` | 11 passed, 0 failed |
| `pnpm run build` | Exit 0, webpack production build; expected seven application routes |
| `pnpm run test:auth` | 12 passed, 0 failed |
| `python3 -m unittest discover -s tests` | 7 passed |
| `node --import tsx tests/auth/browser.ts` | Isolated Chrome 320/1440: sign-in, authenticated form/results, image, keyboard, no overflow, logout passed; zero console/network errors |
| `git diff -- pnpm-lock.yaml` | Empty; no dependency changes |

Test-first record: the new operator tests first failed with missing smoke.ts
(exit 1). After implementation all eleven passed, including a real isolated
HTTP redirect refusal and a two-second abort. The initial concurrent root
typecheck also saw the intentionally missing helper; the completed helper
passed strict typecheck without suppressions. No production fixtures added.

Browser evidence uses existing Google/search fixtures and a real publisher
500x500 photo, with **zero LLM calls**. Visually inspected existing
recipe-integration-results-320.png and -1440.png: clear form, stable recipe photo
area, usable text, no horizontal overflow. Existing screenshot files are
unchanged and not added to this feature. These checks do not prove real OAuth,
hosted photo transport, loading/deadline behavior or Vercel cancellation.

## Dependency audit

`pnpm audit --json` returned exit 1: one **moderate**, zero high/critical.
Pre-existing esbuild 0.18.20 under drizzle-kit -> @esbuild-kit/esm-loader ->
@esbuild-kit/core-utils is affected by
[GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99).
The advisory concerns esbuild's development serve API CORS. The app's runtime,
Next.js build and tests do not invoke that serve API; no database tooling is
configured. Defer the tooling dependency upgrade to a separately reviewed
change; do not run that vulnerable development server. Revisit by 2026-12-23
or before using Drizzle Kit's development server. No forced fix, suppression
or package/lockfile version change was made.

## Packaging and access evidence

A temporary clean source export applied the committed .vercelignore exclusions
to tracked files plus new Vercel config: 50 files, no .env*, tests, audit folders,
operator state, dependencies or build outputs copied. Frozen install and build
both exited 0 in this export, without any environment file. This is a packaging
check, not a Vercel build or deployed function inspection.

Tooling-only environment issues: sandbox pnpm store context requested module
replacement, resolved by using the same approved package-store execution as
baseline. A shell started directly in the temporary export selected broken
Homebrew Node 22; running pnpm --dir from the repository used the correct Node
24 toolchain. No app change or weakened check addressed these environment errors.

Vercel CLI 66.6.0 was fetched with install scripts disabled, following inspection
of official package scripts/integrity. Interactive owner login succeeded.
Read-only team/project listing confirmed rafalotufos-projects is Hobby and has
no projects. No project was created or linked; no configuration or deployment
was performed. Login credential values were not read, printed or committed.

## Acceptance scope

D1 local configuration/build and D2 upload/secret boundaries are implemented;
effective hosted Node/duration/cancellation and environment scope remain unverified.
D3 local regressions pass; real hosted OAuth/provider/source and 390/1440 QA
remain release checks. D3a client abort output is intentionally inconclusive
without hosted invocation evidence; natural hosted timeout remains mandatory.
D4 helper checks are tested locally, not a published WAF policy or billing change.
D5/D6 runbook specifies manual gates, candidate 421, promotion, first-live checks,
scoped pause/rollback and incident diagnosis. Human merge, configuration and
release approvals remain outstanding. No hosted success is claimed.
