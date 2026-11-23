# Meal Planner

A Next.js App Router application protected by Google sign-in. The authenticated
home page displays only **Meal Planner**, styled with Tailwind CSS v4.

## Local development

Use Node.js 22 or newer and pnpm 10.33.0 (pinned in `package.json`).
Verified with Node.js 24.15.0 and pnpm 10.33.0.

If pnpm is not installed, bootstrap the exact version once:

```bash
npm install --global pnpm@10.33.0
pnpm --version
```

Existing pnpm/Corepack users can use the pinned version from `package.json`.
Then install dependencies, configure authentication and private storage as described
below, explicitly apply the local migrations, and start development:

```bash
pnpm install --frozen-lockfile
# Configure .env.local and create its private storage directory first.
pnpm run db:migrate
pnpm run dev
```

Commit the generated `pnpm-lock.yaml` with dependency changes. Dependency build
scripts are reviewed explicitly in `pnpm-workspace.yaml`; unreviewed scripts
fail installation.

Open the exact configured origin, for example [localhost:3000](http://localhost:3000).
Anonymous navigation redirects to `/sign-in`. Eligible users either have an
allowlisted verified Gmail account or a recipient-bound invitation. There is no
password signup, public family discovery, or family-switching interface.

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
5. Configure `DATABASE_PATH` and explicitly migrate it as described below.
   Restart the server, visit `/sign-in`, and select **Continue with Google**.
   To end the current browser session, visit `/sign-out` and select **Sign out**.

Maintain authorized accounts in `lib/allowed-google-emails.json`. This checked-in
server-code array contains the owner-approved Gmail addresses; it is not sent
to browser code or exposed by an endpoint. To add or remove access, edit the
array, rebuild, and restart/redeploy the application through the normal review
and release gates. An empty array denies allowlist-only users; valid invitation recipients and
accepted invitation members remain eligible. Malformed configuration fails closed
for all application access. Address matching trims whitespace and lowercases only; dots, plus
suffixes and `googlemail.com` aliases are not merged. Google must assert a
verified email. Eligibility is checked before creating sessions and on every
protected request. Removing an allowlist-only account blocks its old sessions
after the updated code is activated; an accepted invitation grant independently
authorizes its verified Google subject. Family membership by itself never grants
sign-in eligibility. The UI uses the same generic failure for denied
accounts and other sign-in failures.

Missing or invalid configuration returns a closed `503` response. Builds do not
require secrets. Application pages and endpoints verify sessions on the server;
protected APIs return `401` for anonymous requests. Only the exact sign-in/OAuth, invitation shell/context POST and non-sensitive
framework asset paths are public. New pages,
route handlers and actions must also check the shared server session helper
before reading protected data or performing side effects. Family-owned operations
also require current `requireFamilyContext`; onboarding identities are not members.

Sessions use encrypted HttpOnly, SameSite=Lax, host-only cookies, Secure on HTTPS.
They expire after one hour without refresh. Logout clears the current browser's
auth and invitation-context cookies, including after invitation eligibility is
revoked or expires; it cannot revoke a previously copied cookie before expiry. Rotate
`BETTER_AUTH_SECRET` to invalidate all sessions in an emergency. Google access
uses identity scopes only; no offline/refresh-token access is requested.

Sources: [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next),
[Google provider](https://better-auth.com/docs/authentication/google), and
[stateless sessions](https://better-auth.com/docs/concepts/session-management#stateless-session-management).

## Verification and production preview

```bash
python3 -m unittest discover -s tests
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run test:auth
pnpm run test:family
pnpm run start
```

The production preview also runs at <http://localhost:3000>, with the configured
Google credentials. Check sign-in and the authenticated home page at mobile and
desktop widths: one heading, white background, no horizontal overflow, and no
additional product content.

`test:auth` uses Node's built-in runner with the pinned tsx loader for TypeScript tests and helpers, starts its own production servers, and
owns migrated temporary databases and needs no real Google credentials. It intercepts outbound Google token/JWKS HTTP
responses only in a test-process preloader and then exercises real OAuth state,
provider signature verification, encrypted sessions, denial/expiry and logout.
Production code has no fake user, test provider, or alternate session verifier.
These local tests do not prove a real Google consent/credential round trip;
perform that with a dedicated Google test account in the configured environment.
Optional isolated macOS Chrome QA after build: `node --import tsx tests/auth/browser.ts`
and `node --import tsx tests/family/browser.ts`. Family QA also verifies the dev
StrictMode fragment flow. These helpers use a dedicated temporary Chrome profile,
never your logged-in browser, and save family-specific evidence under `org/reviews/`.

Python's standard-library tests cover workflow tooling, including the active
feature plan path used by the PR and staged-change checks. Select a plan via
`--plan intent/<feature-slug>/plan.md`, or let `workflow-graph.yaml` select it.
Repositories without a graph retain the legacy root `plan.md` fallback.

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
is in `intent/family-membership/`. See `intent/README.md` for the convention; review and
verification evidence lives in `org/reviews/`.
Human approval remains required for merges and releases.
