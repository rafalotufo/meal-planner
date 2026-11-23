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
Then install dependencies, configure authentication as described below, and start
development:

```bash
pnpm install --frozen-lockfile
pnpm run dev
```

Commit the generated `pnpm-lock.yaml` with dependency changes. Dependency build
scripts are reviewed explicitly in `pnpm-workspace.yaml`; unreviewed scripts
fail installation.

Open <http://localhost:3000>. Authentication configuration is required; no database
is needed. Anonymous navigation redirects to `/sign-in`. A Google
account may sign in only if its verified Gmail address appears in the
administrator's server-code list. There is no local signup or administration UI.

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
and release gates. An empty array denies everyone; malformed configuration
fails closed. Address matching trims whitespace and lowercases only; dots, plus
suffixes and `googlemail.com` aliases are not merged. Google must assert a
verified email. Eligibility is checked before creating sessions and on every
protected request, so removing an account blocks its old sessions after the
updated code is activated. The UI uses the same generic failure for denied
accounts and other sign-in failures.

Missing or invalid configuration returns a closed `503` response. Builds do not
require secrets. Application pages and endpoints verify sessions on the server;
protected APIs return `401` for anonymous requests. Only the exact sign-in,
Google callback and non-sensitive framework asset paths are public. New pages,
route handlers and actions must also check the shared server session helper
before reading protected data or performing side effects.

Sessions use encrypted HttpOnly, SameSite=Lax, host-only cookies, Secure on HTTPS.
They expire after one hour without refresh. Logout clears the current browser's
auth cookies; it cannot revoke a previously copied cookie before expiry. Rotate
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
pnpm run start
```

The production preview also runs at <http://localhost:3000>, with the configured
Google credentials. Check sign-in and the authenticated home page at mobile and
desktop widths: one heading, white background, no horizontal overflow, and no
additional product content.

`test:auth` uses Node's built-in runner with the pinned tsx loader for TypeScript tests and helpers, starts its own production servers, and
needs no real Google credentials. It intercepts outbound Google token/JWKS HTTP
responses only in a test-process preloader and then exercises real OAuth state,
provider signature verification, encrypted sessions, denial/expiry and logout.
Production code has no fake user, test provider, or alternate session verifier.
These local tests do not prove a real Google consent/credential round trip;
perform that with a dedicated Google test account in the configured environment.
Optional macOS Chrome visual QA: `node --import tsx tests/auth/browser.ts` (after build).

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
is in `intent/authenticated-access/`. See `intent/README.md` for the convention; review and
verification evidence lives in `org/reviews/`.
Human approval remains required for merges and releases.
