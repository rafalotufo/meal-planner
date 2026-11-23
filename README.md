# Meal Planner

A Next.js App Router application protected by Google sign-in for finding existing
web recipes from a description. Results show source links, cooking summaries,
available photos and source-supported cooking times, styled with Tailwind CSS v4.

> Integration branch: this checkout includes the already deployed Vercel recipe
> app and the not-yet-released family feature. Family persistence still uses a
> private local SQLite file and **cannot run durably on Vercel Functions**. Do not
> deploy this branch by setting DATABASE_PATH or using /tmp. Hosted PostgreSQL
> work is separate, in a new worktree; no DB provider/credentials or migration
> have been configured here. The existing production deployment is unchanged.

## Local development

Use Node.js 24.x and pnpm 10.33.0 (pinned in `package.json`).
Verified with Node.js 24.15.0 and pnpm 10.33.0.

If pnpm is not installed, bootstrap the exact version once:

```bash
npm install --global pnpm@10.33.0
pnpm --version
```

Existing pnpm/Corepack users can use the pinned version from `package.json`.
Then configure authentication and private local family storage as described below,
install dependencies, explicitly migrate the local database, and start development:

```bash
pnpm install --frozen-lockfile
pnpm run db:migrate
pnpm run dev
```

Commit the generated `pnpm-lock.yaml` with dependency changes. Dependency build
scripts are reviewed explicitly in `pnpm-workspace.yaml`; unreviewed scripts
fail installation.

Open the configured origin, for example <http://localhost:3000>. Anonymous
navigation redirects to `/sign-in`. Local family storage is required in this
branch. Google eligibility comes from the server-only allowlist or a valid
recipient invitation; acceptance creates its independent durable grant.

## Google authentication setup

1. Copy `.env.example` to `.env.local`. Keep real credentials out of Git.
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
| `OPENAI_RECIPE_MODEL` | `gpt-6.2-sol` | A Responses model supporting web search and structured outputs. |

The provider boundary permits a future Gemini adapter without changing the
search form or endpoint. This increment makes two bounded OpenAI calls: one
researches source recipes using hosted web search, then a tool-free curator
summarizes validated source-specific candidates. Missing images use a fallback;
missing cooking times are omitted. Source fidelity still requires live sampling.

Queries/results are not persisted or logged by the application. Both model
requests use `store: false`; the description is sent to the configured provider.
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
and 5,000/3,000 output-token ceilings. A process allows two concurrent searches
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

## Private durable database

Use one persistent local host/volume with the pinned native SQLite driver.
Ephemeral serverless filesystems and shared network files are unsupported.
`DATABASE_PATH` is a server-only absolute path outside `public`, `.next`, and
legacy `static`, including symlink aliases. Runtime opens only an existing file
with the complete expected migration history/schema; it never creates or repairs
one. Missing/unmigrated/inaccessible storage fails closed. Builds need no DB/secrets.

Create a private directory (owner-only access), set its absolute file path in
`.env.local`, then apply reviewed SQL explicitly:

```bash
umask 077
mkdir -p .data
chmod 700 .data
# Set DATABASE_PATH to the absolute path of .data/meal-planner.sqlite.
pnpm run db:migrate
```

Keep DB/WAL/SHM files and backups outside source control. `drizzle/` contains the
reviewed SQL schema and ordered migration journal/snapshot. A public Drizzle loader
reads SQL/hashes; typed native bound statements and immediate transactions execute
it. The full ORM declarations are incompatible with strict checking in the pinned
version; see [the reviewed compatibility decision](intent/family-membership/storage-compatibility.md).
There is no unchecked schema-builder duplicate or generation command. Future schema
changes require reviewed SQL/journal updates and fresh/upgrade tests.

Use SQLite's supported backup API for a consistent backup, not a raw copy of a
live file while ignoring WAL. For example, with a private configured path:

```bash
node --env-file=.env.local --input-type=module <<'JS'
import Database from 'better-sqlite3';
const db = new Database(process.env.DATABASE_PATH, { fileMustExist: true });
try { await db.backup(process.env.DATABASE_PATH + '.backup'); }
finally { db.close(); }
JS
```

Before production migrations obtain human authorization and verify a consistent
backup/restore in isolation. To restore, stop all application processes, preserve
the original DB/WAL/SHM, restore the backup to a fresh private path, configure that
path, and verify its reviewed schema before restart. Retain encrypted backups for
30 days according to the host's policy. Keep member identity/grant data for the
membership lifetime. Invitation deadlines are enforced without a cleanup job;
expired/terminal record purging and operator erasure/export require separately
reviewed procedures. No deletion scheduler is installed. Rollback preserves the
DB; old allowlist-only code cannot serve invited users.


## Agent workflow

The agent org contract is in `org/org-chart.yaml` and `org/protocol.md`.
Every feature keeps its intent and specifications in `intent/<feature-slug>/`:
`intent.md`, `spec.md`, `plan.md`, and related design notes. The current feature
is in `intent/family-membership/`; the Vercel loop remains archived as historical evidence. See `intent/README.md` for the convention; review and
verification evidence lives in `org/reviews/`.
Human approval remains required for merges and releases.
