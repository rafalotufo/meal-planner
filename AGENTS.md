# Repository guidance

## Commands

- Install reproducibly: `pnpm install --frozen-lockfile` (Node.js 22+; tested with 24.15.0/pnpm 10.33.0).
- Package manager: exact `pnpm@10.33.0` in `package.json`; bootstrap missing pnpm
  with `npm install --global pnpm@10.33.0`, then check `pnpm --version`.
- Develop: `pnpm run dev`.
- Verify: `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`; all must pass.
- Family regression: `pnpm run test:family` after build (owns temporary migrated databases).
- Local explicit migration: `pnpm run db:migrate` after setting private absolute `DATABASE_PATH`.
- Authentication regression: `pnpm run test:auth` after build (owns isolated servers).
- Workflow regression tests: `python3 -m unittest discover -s tests`.
- Production preview: `pnpm run start` after build.
- Secrets: `python3 scripts/scan_secrets.py --staged` (zero findings).

## Architecture and scope

TypeScript, Next.js App Router, and Tailwind CSS v4. Root layout owns metadata
and global CSS; the home page is a server component. Keep the initial home page
blank except for its `Meal Planner` heading. Family/invitation controls live on
separate pages. SQLite uses one durable local host/volume, typed bound native
statements, reviewed SQL/journal in `drizzle/`, and the public migration loader.
No runtime ORM/schema-builder imports: see the reviewed storage compatibility
amendment. Never relax strict checking or patch vendor declarations.

Google sign-in uses server-verified Better Auth sessions with stable verified
Google subject, not its ephemeral stateless user ID. Shared session reads recheck
current DB eligibility. Require `lib/session.ts` family context before all family
reads/effects; derive family IDs server-side. Only explicit auth/invite/static
exceptions in `lib/auth-policy.ts` are public. Exact POST acceptance checks raw
cryptographic identity then rechecks admission/token/recipient/membership in its
immediate transaction; only logout may clear cookies despite lost admission.

Server-only `lib/allowed-google-emails.json` authorizes allowlist-only users;
edit/rebuild/restart to activate list changes. Empty denies those users, while
pending valid invitees get onboarding only and accepted invitation grants permit
access independently. Malformed lists fail closed for all admission. Match email
by trim/lowercase only; never expose this configuration in client code, props,
errors or logs. Family membership alone never grants sign-in eligibility.

Require private absolute `DATABASE_PATH` outside public/.next/legacy static roots
and symlink aliases. Runtime never creates/migrates files. Family provisioning,
invitation creation/acceptance/revocation and metadata writes use immediate
transactions; GET/HEAD/proxy/render/session reads never provision or consume.
Only verified Google callback admission may update an existing subject's email.
Keep future shared entities scoped by required family owner; no recipe/meal CRUD.

## Verification and workflow

Use approved intent/spec/plan and `org/protocol.md`. Preserve org audit records,
independent review, and human merge/release gates. Report actual command output
and verify visible UI in a real browser at mobile and desktop widths. Python
unittest covers workflow tooling. Node's built-in runner covers authentication
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
notes. Use lowercase kebab-case slugs. Current feature: `intent/family-membership/`.
Before dispatch, read the active work item from `org/loop/state.yaml` and its
sibling spec/plan; keep graph artifact paths aligned. See `intent/README.md`.

## Test language

New application tests and test helpers must use TypeScript, including HTTP,
provider-fixture and browser helpers. Use the pinned tsx loader with Node's
built-in test runner and keep them in strict TypeScript checking. Preserve
the existing Python workflow regression tests; do not migrate or weaken them.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
