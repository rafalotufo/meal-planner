# Meal Planner

A Next.js App Router application protected by Google sign-in for finding existing
web recipes from a description. Results show source links, cooking summaries,
available photos and source-supported cooking times, styled with Tailwind CSS v4.

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
pnpm run start
```

The production preview also runs at <http://localhost:3000>, with the configured
Google credentials. Check sign-in and the authenticated home page at mobile and
desktop widths, including recipe cards, missing-photo fallback, keyboard use,
loading, errors and no horizontal overflow.

`test:auth` uses Node's built-in runner with the pinned tsx loader for TypeScript tests and helpers, starts its own production servers, and
needs no real Google credentials. It intercepts outbound Google token/JWKS HTTP
responses only in a test-process preloader and then exercises real OAuth state,
provider signature verification, encrypted sessions, denial/expiry and logout.
Production code has no fake user, test provider, or alternate session verifier.
These local tests do not prove a real Google consent/credential round trip;
perform that with a dedicated Google test account in the configured environment.
Optional macOS Chrome visual QA: `node --import tsx tests/auth/browser.ts` (after build).

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

## Database

Drizzle ORM and Drizzle Kit are installed for future database access and
migrations. Database engine, schema, connection settings, and migrations are
intentionally deferred until the first feature that requires persistence.

## Agent workflow

The agent org contract is in `org/org-chart.yaml` and `org/protocol.md`.
Every feature keeps its intent and specifications in `intent/<feature-slug>/`:
`intent.md`, `spec.md`, `plan.md`, and related design notes. The current feature
is in `intent/vercel-deployment/`. See `intent/README.md` for the convention; review and
verification evidence lives in `org/reviews/`.
Human approval remains required for merges and releases.
