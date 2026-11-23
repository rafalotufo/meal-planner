# Meal Planner — initial home page build plan

- Derived from: approved `spec.md`; accepted `intent/intent.md`
- Author: senior-developer
- Status: Approved by independent reviewer (org/reviews/plan-home-page-001.md)
- Date: 2026-11-23

## Files that change

- package.json
- package-lock.json
- tsconfig.json
- next-env.d.ts
- next.config.ts
- eslint.config.mjs
- postcss.config.mjs
- app/layout.tsx
- app/page.tsx
- app/globals.css
- .gitignore
- README.md
- AGENTS.md
- CLAUDE.md
- org/loop/config.yaml
- org/reviews/home-page-verification.md
- org/reviews/home-page-*.png

## Order of work

1. After independent plan approval, create the npm/TypeScript foundation.
   Pin Next.js and matching eslint-config-next to `16.4.6`; resolve compatible
   stable React/React DOM, TypeScript, ESLint, and type packages. Pin Tailwind
   and `@tailwindcss/postcss` within v4; install PostCSS, stable drizzle-orm
   (runtime), and drizzle-kit (development). Save exact versions and lockfile.
2. Add standard strict TypeScript, Next.js, and ESLint flat configurations,
   retaining framework checks. Configure Tailwind v4 through PostCSS and
   `@import "tailwindcss"`. Ignore `.next/`, TypeScript build information,
   and local generated artifacts without weakening existing secret ignores.
3. Add a root server layout with English language, `Meal Planner` metadata,
   global CSS, and system font. Add a server page with only `main` and one
   `h1` reading `Meal Planner`: white background, dark text, modest padding,
   upper-left alignment. Add no database imports or client state.
4. Supply npm scripts: `dev` (`next dev`), `build` (`next build`), `start`
   (`next start`), `lint` (`eslint . --max-warnings 0`), and `typecheck`
   (`tsc --noEmit`). Replace scaffold org acceptance commands with lint,
   typecheck, and build. Keep loop budgets, phases, and gates unchanged.
   Document npm installation/start/check commands and tested runtime in README
   and concise AGENTS/CLAUDE guidance. Explain deferred database configuration.
5. Run the checks below; resolve failures without suppressions. Start production
   locally, coordinate browser QA with the orchestrator, and record actual
   results/screenshots under `org/reviews/`. Request independent code/security
   reviews; address required findings before human merge/release gates.

## Risks and limits

Package compatibility and native build tooling are checked by installation,
lint, types, and production build. Network access may require sandbox approval.
No fonts or images are downloaded by application code. Drizzle dependencies
are installed only: database engine, schema, credentials, and migrations remain
deferred. Preserve org scripts and audit history; do not alter gate authority.

## Proof and verification

- `npm run lint`, `npm run typecheck`, `npm run build`: all exit zero.
- Start production with `npm run start`; `/` returns HTTP 200 without a DB.
- Browser: English document; exact title; one visible heading `Meal Planner`;
  no other product text, controls, or imagery; semantic main/heading structure.
- At widths 320, 768, 1024, and 1440: readable title, white page, no horizontal
  overflow. Capture screenshots; inspect console and application asset requests.
- `git diff --check`, org loop/message/memory/workflow checks, and staged
  secret scan succeed. Record any check not performed as unverified.
- No unit-test runner or tests mirroring static JSX are introduced for this page.

## Parallelization

Implementation is one sequential slice owned by senior-developer. The
orchestrator coordinates browser evidence; independent reviewers handle plan,
code, and security gates. No shared-state work or commits run concurrently.
