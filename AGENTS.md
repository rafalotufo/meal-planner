# Repository guidance

## Commands

- Install reproducibly: `pnpm install --frozen-lockfile` (Node.js 22+; tested with 24.15.0/pnpm 10.33.0).
- Package manager: exact `pnpm@10.33.0` in `package.json`; bootstrap missing pnpm
  with `npm install --global pnpm@10.33.0`, then check `pnpm --version`.
- Develop: `pnpm run dev`.
- Verify: `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`; all must pass.
- Authentication regression: `pnpm run test:auth` after build (owns isolated servers).
- Workflow regression tests: `python3 -m unittest discover -s tests`.
- Application behavior tests: `pnpm test` (TypeScript tests and fixtures compiled
  for Node's native runner; no runtime fixture endpoints).
- Production preview: `pnpm run start` after build.
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
Google sign-in uses server-verified Better Auth sessions. See README for required
server-only environment variables and the exact Google OAuth callback. Keep
new pages, handlers and actions protected with `lib/session.ts` before effects.
Only the explicit auth/static exceptions in `lib/auth-policy.ts` are public.
Allowed Google identities are configured in server-only imported
`lib/allowed-google-emails.json`; edit/rebuild/restart to activate membership
changes. Empty denies all, malformed is unavailable. Match verified Gmail email
by trim/lowercase only before session creation and every protected request.
Never expose this list in client code, props, errors or logs.

## Verification and workflow

Use approved intent/spec/plan and `org/protocol.md`. Preserve org audit records,
independent review, and human merge/release gates. Report actual command output
and verify visible UI in a real browser at mobile and desktop widths. Python
unittest covers workflow tooling. Application tests and fixtures must use
TypeScript, compiled with the existing compiler for Node's native test runner.
Live provider grounding requires separately labeled live evidence. Node's built-in
runner covers authentication
through real HTTP and a test-process-only Google transport fixture; production
code must never import it or add a fake-user bypass. Sessions expire after one
hour without refresh; browser logout cannot revoke copied cookies before expiry.
The dev-only `bun-types/sqlite` ambient declaration supports Better Auth's public
types; keep Node/React types and strict checks. Never suppress
checks or remove failing tests to get a passing run.

## Conventions

Prefer small server components and static Tailwind utilities. Do not add client
state, external assets, database infrastructure, or additional UI without scope.
Pin exact stable dependency versions and commit pnpm's generated `pnpm-lock.yaml`.

## Feature artifacts

Use `intent/<feature-slug>/` for every intent and all of its specifications,
including `intent.md`, `spec.md`, `plan.md`, and any feature-specific design
notes. Use lowercase kebab-case slugs. Current feature: `intent/vercel-deployment/`.
Before dispatch, read the active work item from `org/loop/state.yaml` and its
sibling spec/plan; keep graph artifact paths aligned. See `intent/README.md`.

## Test language

New application tests and test helpers must use TypeScript, including HTTP,
provider-fixture and browser helpers. Use the pinned tsx loader with Node's
built-in test runner and keep them in strict TypeScript checking. Preserve
the existing Python workflow regression tests; do not migrate or weaken them.
