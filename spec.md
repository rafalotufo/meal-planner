# Meal Planner — initial home page specification

- Derived from: `intent/intent.md` at `7c42bd7`
- Author: architect
- Status: Approved by independent reviewer (org/reviews/spec-home-page-001.md)
- Date: 2026-11-23

## Requirements

- `/` returns HTTP 200 and displays one visible `h1`: `Meal Planner`.
- No other visible product text, navigation, controls, imagery, or starter content.
- Browser title is `Meal Planner`; document language is English.
- White page, dark text, system sans-serif font, modest padding, upper-left title.
- Semantic `main`/`h1`; readable without horizontal overflow at 320, 768, 1024,
  and 1440 CSS-pixel widths.
- Development and production rendering require no database, credentials,
  environment setup, or external font/image requests.
- Include Drizzle ORM and Kit dependencies, with database engine, connection,
  schema, and generated/executed migrations deferred until persistence is needed.

## Design

Use TypeScript and the Next.js App Router. `app/layout.tsx` supplies root HTML,
metadata, and global CSS; `app/page.tsx` is a server component with only the main
landmark and heading. No client state, API routes, data fetching, or database
imports. Use Tailwind v4 via `@tailwindcss/postcss` in `postcss.config.mjs` and
`@import "tailwindcss"` in global CSS. No custom abstractions or theme selector.

Pin stable Next.js `16.4.6`, verified by the orchestrator against npm and official
docs on 2026-11-23. Resolve compatible stable React/React DOM, TypeScript, ESLint,
and matching `eslint-config-next`; keep Tailwind and its adapter in major v4.
Record exact installed versions and commit `package-lock.json`. Install stable
`drizzle-orm` as runtime and `drizzle-kit` as development dependencies. Exclude
prereleases. Document the tested Node.js 24.15.0/npm 11.12.1 runtime and a supported
Node.js requirement; Next.js documents a minimum of Node.js 20.9.

## Standards and gotchas

Accepted intent controls scope; Tailwind v4 supersedes the original v3 text.
Independent spec/plan reviews precede code; org merge/release gates remain.
Existing `CLAUDE.md` make commands and Python-test acceptance commands in
`org/loop/config.yaml` are placeholders. The plan must replace these with real
application checks, without suppressing failures. Preserve org artifacts.
Inspect production rendering so development controls do not confuse title-only
acceptance. Do not invent a database config, empty migration, or pretend API.

## Verification

Run `npm run lint`, `npm run typecheck`, and `npm run build` successfully.
Start production server; verify HTTP 200, document title, exact heading, no
additional product UI, semantic structure, and no horizontal overflow at the
four widths above. Save browser visual evidence and inspect console/application
requests for errors. Run org consistency, diff, and staged-secret checks.
No unit-test runner is needed just to mirror static JSX; report unperformed
runtime/browser checks as unverified.

## Deferred decisions and sources

Database engine, hosting, schema, and migration flow are deferred to the first
persistence feature (product owner/architect); none blocks the home page.
Official references retrieved by the orchestrator before this design dispatch:
- <https://nextjs.org/docs/app/getting-started/installation>
- <https://nextjs.org/docs/app/getting-started/layouts-and-pages>
- <https://tailwindcss.com/docs/installation/framework-guides/nextjs>
- <https://orm.drizzle.team/docs/overview>
- <https://orm.drizzle.team/docs/kit-overview>
