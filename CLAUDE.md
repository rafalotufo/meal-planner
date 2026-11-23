# Repository memory

Read `AGENTS.md` for shared repository guidance, architecture, conventions,
verification requirements, and agent-org gates.

Use Node.js 24.x (tested with 24.15.0/pnpm 10.33.0). Install with `pnpm install --frozen-lockfile`.
The package manager is pinned in `package.json`. If missing, bootstrap once with
`npm install --global pnpm@10.33.0` and check `pnpm --version`.
Run `pnpm run lint`, `pnpm run typecheck`, and `pnpm run build`; all must pass.
Run workflow regression tests with `python3 -m unittest discover -s tests`.
Preview production with `pnpm run start`. Verify the UI in a real browser and
report actual evidence. Run `pnpm run test:auth` after build for real HTTP auth
regressions using Node's built-in test runner and test-only Google network stubs.
Never introduce a production authentication bypass. Google configuration and
the callback URI are documented in README; credentials remain server-only.
Run `pnpm run test:family` after build. New pages/endpoints/actions authenticate
before effects and use current `requireFamilyContext` for all family-owned reads
and writes. Never trust a caller's family ID. Membership uses verified Google
subject, with exactly one non-null family per application member. Only users
without invitations auto-provision through guarded POST; existing members cannot
accept another invitation. Pending invitees get onboarding only; acceptance
atomically creates membership and an independent durable grant.

The server-only `lib/allowed-google-emails.json` list controls allowlist-only
users at issuance and every shared read. Empty denies those users, but valid
pending invitations and accepted grants retain their intended admission.
Malformed configuration fails closed. Edit/rebuild/restart for list changes;
never expose the list in client code, HTML, errors or logs. Membership alone
must not create an eligibility bypass. One-hour sessions do not refresh; logout
clears cookies even after admission loss and cannot revoke copied cookies.

Keep main’s approved recipe-search home UI; family controls live at `/family`.
The home/search endpoint must require current family context before provider
effects. Preserve recipe/photo URL, SSRF, deadline/usage, cancellation and fallback
protections. Run `pnpm test` and deployment helper regressions as well. Private SQLite
storage requires one durable local host and absolute `DATABASE_PATH` outside
public/.next/legacy static and aliases. Run `pnpm run db:migrate` explicitly;
ordinary reads/build/imports never create or migrate storage. Reviewed SQL is the
schema source of truth, with public Drizzle migration-file loading and typed
native parameterized statements/immediate transactions. The reviewed compatibility
amendment forbids importing the broken full ORM declaration graph or suppressing
strict checks. Retain the narrow Better Auth dev-only `bun-types/sqlite` types.
Never remove tests, add a production fixture bypass, or relax compiler checks.
Preserve org audit records, independent reviews and human merge/release gates.

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

## Integration and deployment boundary

Main’s Vercel deployment remains live and unchanged. This family branch still
requires local durable SQLite and is not ready for Vercel Functions. Do not use
/tmp or an environment variable as a substitute for persistent storage. Hosted
PostgreSQL work belongs in a separately requested worktree; no provider/DB
provisioning or migration occurs here. Preserve Node24, main’s Vercel config,
manual release gates and secret isolation. Existing production release records
are historical authority for their source, never this family integration.
