# Meal Planner

A Next.js App Router application. The initial home page displays only
**Meal Planner**, styled with Tailwind CSS v4.

## Local development

Use Node.js 22 or newer and pnpm 10.33.0 (pinned in `package.json`).
Verified with Node.js 24.15.0 and pnpm 10.33.0.

If pnpm is not installed, bootstrap the exact version once:

```bash
npm install --global pnpm@10.33.0
pnpm --version
```

Existing pnpm/Corepack users can use the pinned version from `package.json`.
Then install dependencies and start development:

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

Commit the generated `pnpm-lock.yaml` with dependency changes. Dependency build
scripts are reviewed explicitly in `pnpm-workspace.yaml`; unreviewed scripts
fail installation.

Open <http://localhost:3000>. No environment variables or database are needed.

## Verification and production preview

```bash
python3 -m unittest discover -s tests
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run start
```

The production preview also runs at <http://localhost:3000>. Check the home
page at mobile and desktop widths: one heading, white background, no horizontal
overflow, and no additional product content.

Python's standard-library tests cover workflow tooling, including the active
feature plan path used by the PR and staged-change checks. Select a plan via
`--plan intent/<feature-slug>/plan.md`, or let `workflow-graph.yaml` select it.
Repositories without a graph retain the legacy root `plan.md` fallback.

## Database

Drizzle ORM and Drizzle Kit are installed for future database access and
migrations. Database engine, schema, connection settings, and migrations are
intentionally deferred until the first feature that requires persistence.

## Agent workflow

The agent org contract is in `org/org-chart.yaml` and `org/protocol.md`.
Every feature keeps its intent and specifications in `intent/<feature-slug>/`:
`intent.md`, `spec.md`, `plan.md`, and related design notes. The current feature
is in `intent/pnpm-migration/`. See `intent/README.md` for the convention; review and
verification evidence lives in `org/reviews/`.
Human approval remains required for merges and releases.
