# Repository guidance

## Commands

- Install reproducibly: `npm ci` (Node.js 22+; tested with 24.15.0/npm 11.12.1).
- Develop: `npm run dev`.
- Verify: `npm run lint`, `npm run typecheck`, `npm run build`; all must pass.
- Workflow regression tests: `python3 -m unittest discover -s tests`.
- Application behavior tests: `npm test` (TypeScript tests and fixtures compiled
  for Node's native runner; no runtime fixture endpoints).
- Production preview: `npm run start` after build.
- Secrets: `python3 scripts/scan_secrets.py --staged` (zero findings).

## Architecture and scope

TypeScript, Next.js App Router, and Tailwind CSS v4. Root layout owns metadata
and global CSS; the home page is a server component composing the recipe-search
client form. Recipe search uses a server-only configurable provider boundary,
with OpenAI implemented first and future providers deferred. Render model text
as text; keep source-specific evidence, URL checks, and usage bounds intact.
Recipe-photo enrichment may fetch only exact validated source HTML through the
approved all-address-checked, pinned HTTPS transport. Preserve its no-redirect,
no-proxy/credential-forwarding, strict byte/time/encoding and global two-job
bounds. Metadata is optional; never drop valid cards or swallow parent abort.
Drizzle ORM/Kit are dependencies;
no database engine, schema, credentials, or migration is configured yet.

## Verification and workflow

Use approved intent/spec/plan and `org/protocol.md`. Preserve org audit records,
independent review, and human merge/release gates. Report actual command output
and verify visible UI in a real browser at mobile and desktop widths. Python
unittest covers workflow tooling. Application tests and fixtures must use
TypeScript, compiled with the existing compiler for Node's native test runner.
Live provider grounding requires separately labeled live evidence. Never suppress
checks or remove failing tests to get a passing run.

## Conventions

Prefer small server components and static Tailwind utilities. Do not add client
state, external assets, database infrastructure, or additional UI without scope.
Pin exact stable dependency versions and commit npm's generated lockfile.

## Feature artifacts

Use `intent/<feature-slug>/` for every intent and all of its specifications,
including `intent.md`, `spec.md`, `plan.md`, and any feature-specific design
notes. Use lowercase kebab-case slugs. Current feature: `intent/recipe-photos/`.
Before dispatch, read the active work item from `org/loop/state.yaml` and its
sibling spec/plan; keep graph artifact paths aligned. See `intent/README.md`.
