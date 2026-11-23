# Repository memory

Read `AGENTS.md` for shared repository guidance, architecture, conventions,
verification requirements, and agent-org gates.

Use Node.js 22+ (tested with 24.15.0/pnpm 10.33.0). Install with `pnpm install --frozen-lockfile`.
The package manager is pinned in `package.json`. If missing, bootstrap once with
`npm install --global pnpm@10.33.0` and check `pnpm --version`.
Run `pnpm run lint`, `pnpm run typecheck`, and `pnpm run build`; all must pass.
Run workflow regression tests with `python3 -m unittest discover -s tests`.
Preview production with `pnpm run start`. Verify the UI in a real browser and
report actual evidence. Run `pnpm run test:auth` after build for real HTTP auth
regressions using Node's built-in test runner and test-only Google network stubs.
Never introduce a production authentication bypass. Google configuration and
the callback URI are documented in README; credentials remain server-only.
New pages/endpoints/actions must authenticate before effects. The server-code
`lib/allowed-google-emails.json` list restricts verified Gmail membership at
issuance and every shared session read. Empty denies all. Edit/rebuild/restart
to activate changes; never expose the list in client code, HTML, errors or logs. Sessions expire
after one hour without refresh; logout only clears the browser's current session.

Next.js App Router and Tailwind CSS v4 render only the `Meal Planner` heading
for authenticated users, with minimal public Google sign-in and protected logout.
Better Auth's Bun SQLite declaration is loaded narrowly through dev-only
`bun-types/sqlite`; do not load conflicting Bun globals or relax TypeScript.
Drizzle ORM/Kit are installed; database configuration and migrations are deferred.
Do not suppress checks or remove failing tests. Preserve independent reviews,
org audit records, and human merge/release approvals. Record repeated mistakes
and their corrections here when evidence warrants it.

## Feature artifacts

Use `intent/<feature-slug>/` for every intent and all of its specifications,
including `intent.md`, `spec.md`, `plan.md`, and any feature-specific design
notes. Use lowercase kebab-case slugs. Current feature: `intent/authenticated-access/`.
Before dispatch, read the active work item from `org/loop/state.yaml` and its
sibling spec/plan; keep graph artifact paths aligned. See `intent/README.md`.

## Test language

New application tests and test helpers must use TypeScript, including HTTP,
provider-fixture and browser helpers. Use the pinned tsx loader with Node's
built-in test runner and keep them in strict TypeScript checking. Preserve
the existing Python workflow regression tests; do not migrate or weaken them.
