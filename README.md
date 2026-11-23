# Meal Planner

A Next.js App Router application protected by Google sign-in for finding existing
web recipes from a description. Results show source links, cooking summaries,
available photos and source-supported cooking times, styled with Tailwind CSS v4.

> This branch uses PostgreSQL for local development and Vercel-compatible family
> persistence. Native Mac setup is below. Separate Neon Preview/Production
> databases are migrated and their Vercel connection variables are configured.
> No deployment was made. Human merge/release authorization remains required;
> prior release approvals do not apply.

## Recipe search notebook

Search results appear in a responsive recipe grid, grouped under each search.
Open a previous group to revisit its results. Filters and sort choices stay
with that group and run locally without making another search request.
History stays in this page's memory and clears on refresh or navigation.

Chickpeas and Pasta pills appear when those words occur in returned recipe
titles; they do not verify ingredient lists. The “25 min or less” pill uses
only exact reported total times. Missing, ambiguous and cook-only times stay
under All recipes and sort after known totals when choosing Quickest first.
Original source links, reported time labels and optional-photo fallback remain
available on every card.


## Local development

Use Node.js 24.x and pnpm 10.33.0 (pinned in `package.json`).
Verified with Node.js 24.15.0 and pnpm 10.33.0.

If pnpm is not installed, bootstrap the exact version once:

```bash
npm install --global pnpm@10.33.0
pnpm --version
```

Existing pnpm/Corepack users can use the pinned version from `package.json`.
Install native PostgreSQL and configure authentication as described below, then:

```bash
pnpm install --frozen-lockfile
pnpm run db:setup
pnpm run db:migrate
pnpm run dev
```

Commit the generated `pnpm-lock.yaml` with dependency changes. Dependency build
scripts are reviewed explicitly in `pnpm-workspace.yaml`; unreviewed scripts
fail installation. Scoped pnpm overrides remove Drizzle’s unused optional SQLite
peers; no native SQLite build is needed for this PostgreSQL application.

Open the configured origin, for example <http://localhost:3000>. Anonymous
navigation redirects to `/sign-in`. Local family storage is required in this
branch. Google eligibility comes from the server-only allowlist or a valid
recipient invitation; acceptance creates its independent durable grant.

## Google authentication setup

1. Copy `.env.example` to `.env.local` **before** `db:setup`, or add its authentication settings to the generated file. Do not overwrite generated database URLs. Keep real credentials out of Git.
2. Set `BETTER_AUTH_URL` to the exact application origin (for example,
   `http://localhost:3000` locally or `https://meal-planner.example` in production).
   Use HTTPS outside localhost/loopback. No URL path, query, username or password
   is allowed. Open that exact host; reverse proxies must preserve its Host header.
3. Generate a random secret with `openssl rand -base64 48` and set
   `BETTER_AUTH_SECRET` to that value. At least 32 bytes are required.
4. Create a Google OAuth **Web application** client. Register exactly
   `<BETTER_AUTH_URL>/api/auth/callback/google` as its authorized redirect URI,
   e.g. `http://localhost:3000/api/auth/callback/google`. Configure Google's consent
   screen/test users as appropriate for your project. Put the client values in
   `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; neither is a public browser variable.
5. Restart the server, visit `/sign-in`, and select **Continue with Google**.
   To end the current browser session, visit `/sign-out` and select **Sign out**.

Maintain authorized accounts in `lib/allowed-google-emails.json`. This checked-in
server-code array contains the owner-approved Gmail addresses; it is not sent
to browser code or exposed by an endpoint. To add or remove access, edit the
array, rebuild, and restart/redeploy the application through the normal review
and release gates. An empty array denies allowlist-only users; valid pending recipients and
accepted invitation grants retain their intended admission. Malformed
configuration fails closed for all application admission. Address matching trims whitespace and lowercases only; dots, plus
suffixes and `googlemail.com` aliases are not merged. Google must assert a
verified email. Eligibility is checked before creating sessions and on every
protected request, so removing an allowlist-only account blocks its old sessions after the
updated code is activated. A separately accepted invitation grant remains tied
to its verified Google subject; family membership alone never creates eligibility. The UI uses the same generic failure for denied
accounts and other sign-in failures.

Missing or invalid configuration returns a closed `503` response. Builds do not
require secrets. Application pages and endpoints verify sessions on the server;
protected APIs return `401` for anonymous requests. Only exact sign-in/OAuth, invitation shell/context POST, and non-sensitive
framework asset exceptions are public. New pages,
route handlers and actions must also check the shared server session helper
before reading protected data or performing side effects. Current family context
is also mandatory for the recipe home/search endpoint, before any paid provider
work; pending onboarding identities cannot search.

Sessions use encrypted HttpOnly, SameSite=Lax, host-only cookies, Secure on HTTPS.
They expire after one hour without refresh. Logout clears the current browser's
auth and invitation-context cookies, including after admission loss; it cannot revoke a previously copied cookie before expiry. Rotate
`BETTER_AUTH_SECRET` to invalidate all sessions in an emergency. Google access
uses identity scopes only; no offline/refresh-token access is requested.

Sources: [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next),
[Google provider](https://better-auth.com/docs/authentication/google), and
[stateless sessions](https://better-auth.com/docs/concepts/session-management#stateless-session-management).

## Local worktrees

The tracked `.worktreeinclude` copies the ignored root `.env.local` into future
local Codex-managed worktrees. The file must already exist at the source
checkout's root. Existing worktrees are not backfilled, and `.env.local` remains
ignored by Git. Create worktrees from a branch containing the committed rule. See the
[Codex worktree documentation](https://learn.chatgpt.com/docs/environments/git-worktrees#copy-ignored-local-files-into-managed-worktrees).

## Recipe-search configuration

Set `OPENAI_API_KEY` in a local, git-ignored `.env.local`. Restart the server
after changing configuration. Keep the key out of client code and Git.

Optional server variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `RECIPE_SEARCH_PROVIDER` | `openai` | Provider selection; only OpenAI is implemented. Unsupported values return a controlled unavailable state. |
| `OPENAI_RECIPE_MODEL` | `gpt-6.2-sol` | A Responses model supporting hosted web search. |

The provider boundary permits a future Gemini adapter without changing the
search form or endpoint. One bounded OpenAI request researches source recipes
using hosted web search and writes their card summaries in the same response.
The server checks exact native source citations and source-specific method and
metadata excerpts before exposing public cards. There is no second curator,
automatic retry, or repair call. Missing images use a fallback; missing cooking
times are omitted. Evidence and summaries come from the same model response,
so these checks bind records structurally rather than independently verifying
every source fact or dietary constraint. Source fidelity still requires live sampling.

Queries/results are not persisted or logged by the application. The model
request uses `store: false`; the description is sent to the configured provider.
Recipe photos load directly from their source hosts, without a referrer. The
server fetches only exact validated recipe pages through a bounded, pinned-
address HTTPS metadata path; it never proxies or downloads image binaries.

After any configured provider returns valid recipes, deterministic enrichment
prefers source-associated Recipe JSON-LD images, then page-bound Open Graph
metadata according to declared size and publisher order. It never guesses a
larger filename or borrows a related recipe's photo. Unknown dimensions require
browser verification; inaccessible, ambiguous, unsafe or broken photos retain
the existing image or fallback.

Metadata retrieval validates every A/AAAA address before pinning one public
address with the original TLS/Host identity. It does not follow redirects, use
environment proxies, forward credentials, or execute publisher scripts. Parsing
uses exact htmlparser2 10.1.0; address classification uses ipaddr.js 2.5.0.
At most six exact pages are attempted per search, with two active DNS/HTML jobs
per process, a six-second optional stage and three-second per-page bound.
This work shares the original search deadline, skips near its expiry and fails
softly without discarding valid recipe cards. No additional model call is made.

Each search has a 60-second deadline, at most eight hosted research tool calls,
and a 5,000 output-token ceiling. A process allows two concurrent searches
and twenty accepted searches per rolling minute. These are local usage bounds;
multi-instance traffic controls and provider spending settings require review
before public deployment. Allowed Google sessions protect the endpoint; per-user quotas and paid service provisioning are deferred.

## Verification and production preview

```bash
python3 -m unittest discover -s tests
pnpm test
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run test:auth
pnpm run test:family
node --import tsx --test tests/deployment/smoke.test.ts
pnpm run start
```

The production preview also runs at <http://localhost:3000>, with the configured
Google credentials. Check sign-in and the authenticated home page at mobile and
desktop widths, including recipe cards, missing-photo fallback, keyboard use,
loading, errors and no horizontal overflow.

`test:auth` uses Node's built-in runner with the pinned tsx loader for TypeScript tests and helpers, starts its own production servers, and
owns temporary migrated databases and needs no real Google credentials. It intercepts outbound Google token/JWKS HTTP
responses only in a test-process preloader and then exercises real OAuth state,
provider signature verification, encrypted sessions, denial/expiry and logout.
Production code has no fake user, test provider, or alternate session verifier.
These local tests do not prove a real Google consent/credential round trip;
perform that with a dedicated Google test account in the configured environment.
Optional isolated macOS Chrome QA after build: `node --import tsx tests/auth/browser.ts`
and `node --import tsx tests/family/browser.ts`. These use test-only Google/recipe/image
fixtures and a temporary browser profile, with no paid calls or production DB.

Recipe behavior tests and fixtures use TypeScript compiled into ignored
`build/recipe-tests/` by `pnpm test`, then run with Node's native runner.
They use injected transport fixtures without credentials or production fixture modes.
Live recipe discovery still requires separate provider/source verification.

Python's standard-library tests cover workflow tooling, including the active
feature plan path used by the PR and staged-change checks. Select a plan via
`--plan intent/<feature-slug>/plan.md`, or let `workflow-graph.yaml` select it.
Repositories without a graph retain the legacy root `plan.md` fallback.

## Vercel deployment

Deployment targets a new Hobby project in `rafalotufos-projects`, using a stable
Vercel-provided HTTPS URL. Follow the
[deployment runbook](intent/vercel-deployment/deployment-runbook.md) for local
login, Production-only environment variables, Google callback setup, bounded
checks, manual promotion and recovery. No Git auto-production deployment or
paid hosting features are configured. Existing OpenAI project limits stay unchanged.

`vercel.json` keeps the Next.js build on pnpm's frozen lockfile and enables
cancellation for the Node search function; its platform duration is 90 seconds
while the application's own deadline remains 60 seconds. Set
`ENABLE_EXPERIMENTAL_COREPACK=1` in Vercel to honor exact pnpm 10.33.0, and verify
effective build/function settings. Node 24.x is pinned by major; Vercel controls
hosted patch updates. Local `.env*` files and operator/audit/test directories
are excluded from CLI uploads. Production deployment requires explicit release
approval after review and merge; local authentication does not grant that approval.

## Families and invitations

Visit `/family` after signing in to see your family, invite someone by verified
Google email, or revoke a pending invitation. Copy the generated link and share
it with its intended recipient. It is shown only once, expires after seven days,
and is never emailed automatically. Revocation affects pending invitations; it
does not remove accepted members or their independent sign-in grants.

The link's fragment is removed before navigation and placed in an HttpOnly
selection cookie; only its SHA-256 hash is stored in the database. A recipient
must sign in with the matching Google-verified email and explicitly **Join family**.
A pending invitation blocks automatic family creation even if its recipient signs
in without the link; reopen the link to accept. Anyone already in a family cannot
accept another invitation, including one-person families with no data.

An eligible new user without a pending invitation or presented invitation context
automatically receives a family through a guarded POST. Page loads never create
families. Canceling onboarding signs out and leaves the invitation pending; invalid,
expired or revoked links never fall through to family creation. An allowlisted
person can later sign in normally without an active invitation/context to create
their own family. An unlisted person needs a valid invitation or an accepted grant.

Membership is keyed by verified Google subject and persists across logout/restart.
Pre-feature cookies require a fresh Google login. A fresh verified login may update
that subject's email; stale cookie reads cannot rewrite it or merge identities.
Recipes and meals are not implemented. Every future shared record must have a
required family owner; reads/updates/deletes must constrain record ID and the
server-derived family ID, and related records must share that ownership.

## Native PostgreSQL development

Install the versioned Homebrew formula (verified PostgreSQL 17.11 on Apple Silicon):

```bash
HOMEBREW_NO_AUTO_UPDATE=1 HOMEBREW_NO_INSTALL_CLEANUP=1 brew install postgresql@17
pnpm install --frozen-lockfile
pnpm run db:setup
pnpm run db:migrate
pnpm run dev
```

`db:setup` creates a dedicated private cluster at
`~/Library/Application Support/MealPlanner/postgresql-17/data`, starts it on
`127.0.0.1:5432`, and creates `meal_planner_dev`. It uses SCRAM passwords and
separate `mp_bootstrap` (setup only), `mp_migrator` (schema owner), `mp_runtime`
(DML only; read-only migration ledger) and `mp_test` (isolated DB creation) roles.
Test credentials cannot connect to development data. Directories are 0700;
credentials and `.env.local` are 0600, excluded from Git and CLI uploads.
Generated credentials stay in the private cluster directory; ignored
`.data/postgres/development.env` and `.env.local` hold local connection settings.
Never paste these URLs into shell arguments, logs, issue reports or chat.

Homebrew may create its own default cluster at `/opt/homebrew/var/postgresql@17`;
this project does not use/start that cluster or register `brew services`.
The formula is keg-only; scripts resolve its bin directory through `brew --prefix`.
Docker is unnecessary. Its initial evaluation created no project containers or
volumes. Database files persist through stop/start and Mac restarts.

```bash
pnpm run db:status
pnpm run db:stop    # only this project's cluster; preserves data
pnpm run db:start   # start on demand, including after restarting the Mac
pnpm run db:migrate # explicit reviewed migrations; never runs on requests/build
```

If port 5432 is occupied, stop and resolve the conflict explicitly; do not kill
other services. Preserve the private cluster and credentials when changing
worktrees. Running `db:setup` in another checkout reuses this project cluster and
writes that checkout's ignored config. It rejects symlink/ownership ambiguity.
It never deletes/reset databases or replaces an unrelated cluster. Use a separate
reviewed setup if another development project already owns these role/database names.

Runtime requires server-only `DATABASE_URL`; migrations use the schema-owner
`MIGRATION_DATABASE_URL`. Builds need no database/secrets. Missing/unmigrated,
changed-history or unexpected-schema databases fail closed. `drizzle/postgresql/`
contains reviewed SQL, journal and catalog signature, included explicitly in Next
server traces. Catalog verification includes columns/constraints/indexes, functions,
triggers and row-security flags/policies. The original SQLite SQL/journal/snapshot
are historical evidence and never executed by the new runtime.

Typed native `pg` queries and the public Drizzle migration loader preserve strict
checking. The pinned ORM's PostgreSQL entry point independently reproduced 70
strict declaration failures; see
[compatibility evidence](intent/postgresql-persistence/storage-compatibility.md).
Family mutations hold one transaction-level advisory lock before their decision
reads on the same connection. This retains conservative cross-process ordering,
with transaction-local timeouts supported by Neon transaction pooling and bounded
client queries. Global mutation serialization is a deliberate small-app tradeoff.

### Tests and backups

After build, `pnpm run test:family` and `pnpm run test:auth` use real PostgreSQL.
They load the dedicated `TEST_DATABASE_URL` from the ignored development config,
require loopback and the `mp_test` role, create random `mp_test_<hex>` databases,
and clean up only their own databases after checking ownership. They never reset
the development database. PostgreSQL must be started and local migration applied
before the runtime-role regression. Test servers force empty provider keys and
use test-process-only Google fixtures. Browser commands are
`node --import tsx tests/auth/browser.ts` and
`node --import tsx tests/family/browser.ts` (isolated real Chrome, 320/1440).

Use PostgreSQL `pg_dump` custom format and `pg_restore`, with `PGHOST`, `PGPORT`,
`PGUSER`, `PGDATABASE` and `PGPASSWORD` supplied through a private process
environment or 0600 pgpass file; never put the URL/password in arguments. Use
Homebrew's versioned `bin` directory. Keep backup directories 0700 and files 0600,
and verify restore into a fresh isolated database before relying on a backup.
The real-PostgreSQL regression performs dump/restore and verifies durable invited
access across complete application restart. No backup/deletion scheduler is installed.

The initial rollback SQL is a destructive proof **only for disposable test DBs**;
the suite exercises it and remigrates. It is not a development or production reset.
For operational rollback, preserve PostgreSQL data and restore a verified backup
only after a reviewed plan; old SQLite code cannot read PostgreSQL invitation grants.
Retain encrypted backups for 30 days under the host's policy. Membership identity
and grants persist for the membership lifetime; record purging/erasure/export need
separately reviewed procedures.

Read-only discovery found no DATABASE_PATH config or `.data` entries in main,
the source family checkout, or this migration checkout at task start. That is a
limited discovery, not a claim that no SQLite data exists elsewhere. Nothing was
deleted or imported. If an existing SQLite DB is identified, preserve it and a
consistent backup; review transfer/identity/grant/count validation before cutover.

### Hosted Neon / Vercel database configuration

Rafael authorized hosted setup on 2026-11-23, with an explicit stop before deployment.
Both independent PostgreSQL17 projects are provisioned in AWS N. Virginia, matching
Vercel iad1, on the Neon Free plan with fixed0.25CU and plan-default auto-suspend:

| Vercel environment | Neon project | Database |
| --- | --- | --- |
| Production | [meal-planner-production](https://console.neon.tech/app/projects/plain-pond-82425009) | meal_planner |
| Preview | [meal-planner-preview](https://console.neon.tech/app/projects/withered-night-50194672) | meal_planner |

Each has distinct endpoints and passwords. The SQL-created mp_migrator owns the
four migration/domain tables and has public-schema USAGE/CREATE, without database
creation, role creation, superuser, replication or RLS-bypass privileges. mp_runtime
has only CONNECT, schema USAGE, migration-ledger SELECT and domain-table DML;
neither role inherits privileged roles. PUBLIC database/schema privileges are revoked.

The reviewed initial migration passed exact catalog/history validation on both.
Vercel meal-planner has a separate sensitive DATABASE_URL per Preview/Production,
using the corresponding mp_runtime pooled endpoint with sslmode=verify-full.
MIGRATION_DATABASE_URL and bootstrap credentials remain only in owner-private,
ignored .data/neon files; no migration-owner credential is stored in Vercel.
Local .env.local continues to target native Mac PostgreSQL.

There was no deployment/promotion, no local-data import and no fixture data left in
either hosted database. The existing production deployment is unchanged; new database
variables apply to a future deployment. Preview currently has only its database
variable: before deploying that app, configure its own auth origin/secret and Google
OAuth credentials/callback. Do not silently reuse Production auth/provider secrets.

Resource mapping and sanitized Vercel metadata are in
intent/postgresql-persistence/hosted-resources.json and hosted-vercel-metadata.json.
The explicit scripts/postgres-hosted.ts helper reads only these recorded targets
and mode0600 .data/neon credentials. Its initial-setup verify action makes read-only
remote checks and expects empty domain tables; provision is an operator action requiring fresh scope verification, never a
startup/build hook. It cannot reset/delete a database or rotate existing passwords.

Keep Preview and Production isolated. Future deployments/migrations need their
applicable fresh authorization and backup/recovery review. Free platform history is
six hours; no offsite backup scheduler has been deployed. Before release, review
pool lifecycle integration recommended for Vercel Fluid (attachDatabasePool) and
complete real hosted app verification. No app deployment was used to verify this setup.
See [hosted evidence](org/reviews/postgresql-hosted-verification.md) and the
[deployment runbook](intent/vercel-deployment/deployment-runbook.md).

## Agent workflow

The agent org contract is in `org/org-chart.yaml` and `org/protocol.md`.
Every feature keeps its intent and specifications in `intent/<feature-slug>/`:
`intent.md`, `spec.md`, `plan.md`, and related design notes. The current feature
is in `intent/postgresql-persistence/`; prior family/Vercel artifacts and loop snapshots remain historical evidence. See `intent/README.md` for the convention; review and
verification evidence lives in `org/reviews/`.
Human approval remains required for merges and releases.
