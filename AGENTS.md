# Repository guidance

## Commands

- Install reproducibly: `pnpm install --frozen-lockfile` (Node.js 24.x; tested with 24.15.0/pnpm 10.33.0).
- Package manager: exact `pnpm@10.33.0` in `package.json`; bootstrap missing pnpm
  with `npm install --global pnpm@10.33.0`, then check `pnpm --version`.
- Develop: `pnpm run dev`.
- Verify: `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`; all must pass.
- Family regression: `pnpm run test:family` after build (owns temporary migrated databases).
- Menu regression: `pnpm run test:menu` after build; real Chrome menu QA:
  `node --import tsx tests/menu/browser.ts` (owned test database/server/profile).
- Local explicit migration: `pnpm run db:migrate` after `pnpm run db:setup` (separate owner/runtime URLs).
- Recipe/photo regressions: `pnpm test` (compiled TypeScript and native Node runner).
- Deployment regression after build: `node --import tsx --test tests/deployment/*.test.ts` (includes isolated compiled proxy/page/API operation without migration/source files).
- Authentication regression: `pnpm run test:auth` after build (owns isolated servers).
- Workflow regression tests: `python3 -m unittest discover -s tests`.
- Production preview: `pnpm run start` after build.
- Secrets: `python3 scripts/scan_secrets.py --staged` (zero findings).

## Architecture and scope

TypeScript, Next.js App Router, and Tailwind CSS v4. Root layout owns metadata
and global CSS; the home page is a server component composing main’s approved
recipe-search form and Meal Planner heading. Family/invitation controls live on
separate pages. PostgreSQL is the sole runtime database locally and on future Vercel
deployments. Use typed bound native pg queries, reviewed SQL/journal/catalog in
`drizzle/postgresql/`, and the public Drizzle migration loader. Native Mac setup
uses Homebrew postgresql@17 and a dedicated on-demand private cluster; no Docker
or global brew service. Preserve the original SQLite migration evidence.
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

Require server-only DATABASE_URL; remote URLs require verified TLS. Runtime never
creates/migrates schema. Family provisioning, invitation creation/acceptance/revocation
and metadata writes use single-connection READ COMMITTED transactions with a common
transaction advisory lock acquired before decision reads and bounded local timeouts.
GET/HEAD/proxy/render/session reads never provision or consume.
Only verified Google callback admission may update an existing subject's email.
Keep shared entities scoped by required family owner. The approved saved-menu
exception permits validated search-result snapshot save/list/remove only;
general recipe creation/editing and meal CRUD remain outside scope.
Exact `/api/menu` and `/api/menu/[id]/remove` paths use the equivalent menu
handler guard because pinned Next Proxy buffers unfinished request bodies before
dispatch. Keep canonical Host, mandatory current JWE/session-token identity
binding, family/admission checks and private/security headers on every method,
including protected405. These are not public auth-policy exceptions; retain
Proxy for all other shapes and `/menu`. See the feature request-timeout note.

Recipe search/provider/photos remain as approved on main, with Node24 runtime,
90-second Vercel route duration and cancellation configuration unchanged. Require
current family context on the home page and search route before provider effects;
pending identities cannot search. Preserve server-only provider configuration,
text rendering, grounding/URL checks, paid-usage bounds, and photo SSRF protections
(all-address validation, pinned HTTPS, no redirects/proxy/credentials, strict byte/
time/encoding limits and two-job bounds). Never swallow parent abort.

Native local PostgreSQL remains the development database. Hosted Neon Preview and
Production were separately authorized and configured on 2026-11-23; see
intent/postgresql-persistence/hosted-setup.md and hosted-resources.json for the exact
scope/targets. Both initial schemas are migrated, with sensitive restricted pooled
DATABASE_URL variables separately in Vercel. Migration/bootstrap credentials stay
private outside Vercel. This authority does not authorize a deployment, promotion,
merge, future migration, paid feature/plan, or local-data import. Never remove/import
SQLite data automatically. Preserve main’s vercel.json, environment isolation and
manual deployment gates; old release approvals do not authorize this branch.
The separately approved saved-menu cutover on2026-11-24 applied0001 and narrow
menu grants to Preview and Production; see intent/saved-recipe-menu/production-result-2026-11-24.md
for exact source/deployment and actual observation status. Initial-only old
artifacts reject this catalog and are not safe rollback targets. Preserve new
schema/data; use only a reviewed compatible correction or explicitly authorized
scoped pause. No DROP, ledger rewrite or backup restore is implied by deployment
authority. This completed scope grants no future release/migration permission.
The separately approved latest-main cutover on 2026-11-24 applied 0002–0004
on both recorded hosted targets; see intent/t-rex-refinements/production-release.md
for fixed source d26ea59, Production AeQV, preservation and observation evidence.
The hosted runtime contract now requires all five migrations. Older two-migration
Production artifacts are incompatible; preserve the current schema/data. Migration
0003 uses temporary tables: its approved execution temporarily granted database
TEMP only to mp_migrator, then restored the original ACL; runtime TEMP stays denied.
This operational history provides no authority for a future migration or grant.
Future releases follow intent/staging-first-release/spec.md and the staging/
Production runbooks: validate and obtain owner scope/gap acceptance for the exact
release SHA on isolated staging before a separate Production build, manual
release approval/promotion and minimal canonical anonymous health/recovery.
Keep later audit HEAD distinct from fixed release source; drift requires fresh
staging validation. Keyless/protected staging cannot imply provider success or
fabricated helper passes. Canonical Production routing/auth/callback changes and
paid staging coverage need concrete separate authority; no new deployment is
authorized here. See intent/vercel-deployment/deployment-runbook.md.
Keep private cluster/config files owner-only. Local test databases use the distinct
restricted CREATEDB role and owned random names, never development/hosted data;
test servers force empty paid keys. Hosted checks use recorded targets, verified
TLS and read-only or explicit rollback-only verification, with no persistent fake data.

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
checks or remove failing tests to get a passing run. After fixture development QA has
stopped its owned dev server, Next16.4.6 may leave duplicate global LayoutProps
in .next/dev/types and .next/types. Move only the inactive generated dev/types
directory to a private temporary backup, then regenerate production types/build.
Do not exclude application/tests or weaken the compiler to handle this cache issue.

## Conventions

Prefer small server components and static Tailwind utilities. Do not add client
state, external assets, database infrastructure, or additional UI without scope.
Pin exact stable dependency versions and commit pnpm's generated `pnpm-lock.yaml`.

## Feature artifacts

Use `intent/<feature-slug>/` for every intent and all of its specifications,
including `intent.md`, `spec.md`, `plan.md`, and any feature-specific design
notes. Use lowercase kebab-case slugs. Current feature: `intent/postgresql-persistence/`.
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
