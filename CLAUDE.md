# Repository memory

Read `AGENTS.md` for shared repository guidance, architecture, conventions,
verification requirements, and agent-org gates.

Use Node.js 22+ (tested with 24.15.0/npm 11.12.1). Install with `npm ci`.
Run `npm run lint`, `npm run typecheck`, and `npm run build`; all must pass.
Run workflow regression tests with `python3 -m unittest discover -s tests`.
Preview production with `npm run start`. Verify the UI in a real browser and
report actual evidence. The static title page has no JavaScript unit-test runner.

Next.js App Router and Tailwind CSS v4 render only the `Meal Planner` heading.
Drizzle ORM/Kit are installed; database configuration and migrations are deferred.
Do not suppress checks or remove failing tests. Preserve independent reviews,
org audit records, and human merge/release approvals. Record repeated mistakes
and their corrections here when evidence warrants it.

## Feature artifacts

Use `intent/<feature-slug>/` for every intent and all of its specifications,
including `intent.md`, `spec.md`, `plan.md`, and any feature-specific design
notes. Use lowercase kebab-case slugs. Current feature: `intent/home-page/`.
Before dispatch, read the active work item from `org/loop/state.yaml` and its
sibling spec/plan; keep graph artifact paths aligned. See `intent/README.md`.
