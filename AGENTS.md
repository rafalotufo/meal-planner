# Repository guidance

## Commands

- Install reproducibly: `npm ci` (Node.js 22+; tested with 24.15.0/npm 11.12.1).
- Develop: `npm run dev`.
- Verify: `npm run lint`, `npm run typecheck`, `npm run build`; all must pass.
- Production preview: `npm run start` after build.
- Secrets: `python3 scripts/scan_secrets.py --staged` (zero findings).

## Architecture and scope

TypeScript, Next.js App Router, and Tailwind CSS v4. Root layout owns metadata
and global CSS; the home page is a server component. Keep the initial home page
blank except for its `Meal Planner` heading. Drizzle ORM/Kit are dependencies;
no database engine, schema, credentials, or migration is configured yet.

## Verification and workflow

Use approved intent/spec/plan and `org/protocol.md`. Preserve org audit records,
independent review, and human merge/release gates. Report actual command output
and verify visible UI in a real browser at mobile and desktop widths. No unit
test runner exists for the static title page; add meaningful tests with future
behavior. Never suppress checks or remove failing tests to get a passing run.

## Conventions

Prefer small server components and static Tailwind utilities. Do not add client
state, external assets, database infrastructure, or additional UI without scope.
Pin exact stable dependency versions and commit npm's generated lockfile.

## Feature artifacts

Use `intent/<feature-slug>/` for every intent and all of its specifications,
including `intent.md`, `spec.md`, `plan.md`, and any feature-specific design
notes. Use lowercase kebab-case slugs. Current feature: `intent/home-page/`.
Before dispatch, read the active work item from `org/loop/state.yaml` and its
sibling spec/plan; keep graph artifact paths aligned. See `intent/README.md`.
