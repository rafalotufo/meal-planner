# Meal Planner — authenticated access specification

- Derived from: accepted `intent/authenticated-access/intent.md`
- Author: architect
- Status: Approved, including Gmail eligibility amendment (`org/reviews/authenticated-access-allowlist-amendment-001.md`)
- Baseline review: `org/reviews/spec-authenticated-access-001.md`
- Scope amendment: `org/reviews/intent-authenticated-access-allowlist-001.md`
- Date: 2026-11-23

## Objective and scope

Only users holding a valid application session established through Google
sign-in may retrieve application content or execute application endpoints.
Only the four Gmail accounts explicitly listed in the accepted intent are
eligible. This supersedes the previous unrestricted-Google assumption.
Preserve the authenticated home page's sole `Meal Planner` heading. Add only
a sign-in screen and a separate sign-out screen; no home-page controls,
profiles, account database, password flow, or meal-planning features.

## Dependencies and structure

Add exact stable `better-auth@1.7.27`; retain existing Next.js 16.4.6,
React 19.3.1, Tailwind v4, Drizzle, and Node.js >=22 versions. Registry metadata
checked during Design reports Next.js ^16 and React ^19 peer compatibility.
Use Better Auth's database-free Google flow and encrypted cookie sessions;
do not implement OAuth, JWT verification, signing, or encryption primitives.
No Drizzle schema, database engine, migration, or external session store.

### Build compatibility amendment — independently approved

Review: `org/reviews/authenticated-access-types-amendment-002.md` (supersedes 001).

Add exact development-only `bun-types@1.4.5` and explicitly load only its
published `bun-types/sqlite` declaration through compiler `types`:
`["node", "react", "react-dom", "bun-types/sqlite"]`. Preserve existing Node
and React types. Better Auth 1.7.27's core declaration imports `Database` from
`bun:sqlite` unconditionally, even though this application uses Node and no
database. Existing strict checking reproduced TS2307 in
`@better-auth/core/dist/types/init-options.d.mts:17`.

The official package's standalone `sqlite.d.ts` declares that missing module
and depends only on existing Node globals. Loading all of `@types/bun` instead
conflicts with Next's `process.browser`, `ImportMetaEnv`, and Node utility
types; that earlier proposed dependency is superseded and must be removed.
A strict compiler prototype loading only the published SQLite declaration
passed with exit 0. Build must verify the stable package subpath after direct
installation through the full `pnpm run typecheck` and production build.

This is type compatibility only: no Bun runtime, SQLite usage, or database
infrastructure. Keep `skipLibCheck: false` and all other strict checks; no
local ambient shim, diagnostic suppression, or dependency patch. The official
`bun-types` package is pinned to stable 1.4.5, the same implementation package
used by `@types/bun@1.4.5`; inspect pnpm's generated lockfile and script policy.

Use `lib/auth.ts` for server-only configuration and the library instance,
`lib/auth-client.ts` for the minimal browser client, and a small server auth
helper for shared session checks. Mount the library through
`app/api/auth/[...all]/route.ts`. `proxy.ts` provides the default request
boundary; `app/page.tsx` independently requires a session. Authentication UI
lives under `app/sign-in/` and `app/sign-out/`. Add a minimal protected
`GET /api/session` endpoint returning only `{ authenticated: true }` to make
the endpoint contract executable without exposing profile information.

Use the built-in Node test runner with exact stable `tsx@4.23.15` to load
meaningful TypeScript behavior tests. The loader supports the application runtime
(registry engines >=18); do not add a separate unit framework.
The user requires new application tests and helpers to use TypeScript. Use the
exact approved tsx loader for the test suite and its transport/browser helpers;
include every test in strict typechecking. An isolated tests/auth package may
use ESM without changing the application package module mode.
Both new dependency pins and pnpm-generated lockfile changes require Build
review, including lifecycle-script policy and native audit results.

## Server-code Gmail eligibility amendment

`lib/allowed-google-emails.json` is the server-code configuration. Seed it
with exactly `thomasnlotufo@gmail.com`, `erikafn@gmail.com`,
`aclotufo4@gmail.com`, and `rafalotufo@gmail.com`, as confirmed in the intent.
Only server-only authentication/session modules import the list; never import
it into client components, embed it in HTML, expose a list endpoint, or log it.
No administration UI, roles, invitation database, or additional dependency.
Changing eligibility requires editing this file, rebuilding, and activating
the new code through restart/redeployment; edits are not a live admin feature.

Place pure eligibility matching in TypeScript `lib/google-access.ts` with
`isAllowedGoogleUser(user, allowedEmails)`. This module contains no account
list or environment access, so Node's built-in tests can import the production
matcher without importing server-only framework modules. Accept only an
object with string `email` and strict boolean `emailVerified === true`.
Normalize both verified email and configuration strings only by trimming
whitespace and lowercasing, then compare exact complete addresses. Do not
collapse dots, remove plus suffixes, accept `googlemail.com` aliases, compare
substrings, match only a domain, or trust a request-supplied email claim.

Validate configuration before using it: it must be an array containing only
syntactically valid Gmail address strings. Empty array intentionally denies
everyone. Malformed configuration must fail closed through the existing generic
authentication-unavailable contract; it must not be filtered into a broader
policy or treated as unrestricted access.

Enforce eligibility twice. During Google user-info processing, use the pinned
library's `verifyGoogleIdToken` verifier for signature, issuer, audience, and
expiry, require its trusted `email_verified === true`, and check its verified
email against the configured list before returning provider user information
for session issuance. Returning no user must deny sign-in without issuing a
session. Do not weaken library state/PKCE/CSRF protections or accept unsigned
JWT payloads. The existing provider `getUserInfo` override is the issuance
boundary; inspect both authorization-code and direct-ID-token paths so neither
can bypass the check.

After `auth.api.getSession` verifies each request, the shared `readSession`
helper rechecks current session `emailVerified === true` and exact email
membership before returning an authorized session. Proxy, page, endpoint, and
action protection must all use that helper; direct raw library-session reads
are insufficient. A valid cryptographic cookie for a now-removed member is
therefore denied on its next protected request after the updated configuration
is activated, even before cookie expiry. Denied eligibility uses the same
generic page redirect/API unauthorized response as other denied sessions;
messages must reveal neither list contents nor why a particular account failed.

The Google network fixture reads the first configured account for its success
identity; do not add a fake production member to make tests pass. Extend
`tests/auth/access-policy.test.ts` with allowed/unlisted/unverified inputs,
trim/case matching, no dot/plus/domain-alias normalization, empty-list denial,
malformed configuration, and removal from the supplied list. Real HTTP tests
must additionally prove unlisted and unverified signed Google callbacks issue
no session and validly encrypted/signed but unlisted, removed, or unverified
session cookies cannot retrieve protected pages or `/api/session`. Keep fixtures
and library-cookie creation test-process-only, without a production bypass.

## Request policy and public surface

The proxy covers every application request by default, including unknown
routes, dotted pathnames, API subpaths, RSC requests, and requests carrying
`x-middleware-subrequest`. Do not exempt routes by file extension, broad
`/api` prefix, prefetch header, or cookie presence. Only framework static
assets under `/_next/static/` are public. No user content may live there.
There are no external assets or image-optimizer needs in this feature.

Public exceptions are exact paths and methods:

| Path | Methods | Purpose |
|---|---|---|
| `/sign-in` | GET, HEAD | Minimal public sign-in screen |
| `/api/auth/sign-in/social` | POST | Begin Google authorization |
| `/api/auth/callback/google` | GET | Complete provider callback |
| `/_next/static/…` | GET, HEAD | Non-sensitive framework assets |

`POST /api/auth/sign-out` requires an existing session. The auth catch-all
must deny unneeded library paths/methods with 404/405 before forwarding;
mounting a library does not make every library endpoint public. Browser client
code must not perform an unnecessary public session lookup. Provider errors
return to `/sign-in` with a generic message; do not expose provider details,
codes, state, credentials, or user profile fields in UI or logs.

For missing, malformed, forged, expired, or currently ineligible sessions:

- Page GET/HEAD navigation redirects to the canonical `/sign-in` URL without
  returning protected page content. Use a fixed return destination `/`.
- `/api` and `/api/…` requests return 401 JSON `{ "error": "Unauthorized" }`
  with no protected data. Non-navigation protected operations, including
  server-action POSTs, return an unauthenticated denial before side effects.
- Session verification/configuration errors fail closed, using a generic 503
  for unavailable authentication. Public sign-in may show unavailable state;
  it must never grant an anonymous session or expose exception details.

Use the shared eligibility-aware session helper in Node-runtime proxy; it
performs full `auth.api.getSession({ headers: request.headers })` verification,
not `getSessionCookie` presence checks. Re-check at each
implemented page/endpoint/action boundary before protected reads or effects;
future route handlers and server actions must use the shared server helper.
Layouts alone are insufficient. Do not cache session decisions across users;
protected and auth responses use private/no-store behavior. No new application
server actions are needed solely to implement login/logout.

## Google, configuration, and session lifecycle

Required server configuration: `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`,
`GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET`. Keep credentials server-only.
Require a canonical URL origin, HTTPS except explicit localhost/loopback local
development, and a random secret of at least 32 bytes. Build/type generation
may succeed without deployment secrets through lazy runtime initialization;
requests must fail closed when configuration is missing or invalid. Never
supply a fallback secret or derive security configuration from request Host.
The only trusted origin is the configured application origin. Production
must use HTTPS; local production-preview HTTP is allowed only for loopback.

The Google OAuth Web client must register exactly
`<BETTER_AUTH_URL>/api/auth/callback/google`. Retain Better Auth's OAuth state,
PKCE, provider verification, origin, Fetch Metadata, and CSRF checks. Use only
the Google provider with ordinary identity scopes; no offline access, extra
Google API permissions, local password registration, account linking, or
One Tap. Reject external callback destinations and unsupported providers.
A successful flow returns to `/`; retry and cancellation return to sign-in.
Use same-origin JSON requests for sign-in/sign-out; both mutations are POST.

Explicitly configure JWE cookie-cache sessions, cookie-backed OAuth state,
and the library's supported stateless account-cookie behavior. Set both
session expiry and cookie-cache max age to one hour (3600 seconds), disable
session and cache refresh, and verify actual expiry behavior in tests. Keep
HttpOnly, SameSite=Lax, Path=/, host-only cookies and Secure for HTTPS.
No session tokens go in localStorage or browser-readable application state.
Use short-lived encrypted library account/state cookies; do not request or
persist Google refresh tokens for this identity-only application.

`/sign-out` requires authentication and offers a POST action through the
library browser client. Successful logout expires every auth cookie and
navigates to `/sign-in`; subsequent requests using that browser's current
cookie jar are denied. Stateless logout does not revoke a previously copied
cookie for a still-eligible account before its fixed one-hour expiry.
Removing an account from the activated configuration denies its copied cookies
on subsequent protected requests. There is no per-session revocation store
or global Google logout. An emergency server
secret rotation invalidates existing sessions, requiring everyone to sign in.

## UI and contributor instructions

The sign-in page uses the existing plain typography, one heading, a keyboard
accessible `Continue with Google` button, a pending state, and a generic
failure message. The separate sign-out screen provides a keyboard accessible
sign-out button. Preserve English document language and `Meal Planner`
metadata. Do not add external fonts, logos, tracking, or unrelated navigation.
Keep client code limited to interactive authentication controls.

Update current README/agent guidance with the active feature and environment
setup, canonical URLs, secret generation, Google callback configuration,
expiry/revocation limits, server-code allowlist maintenance/activation, and
verification command. Commit `.env.example`
with placeholders and explicitly unignore that file only; real `.env*` stay
ignored. Preserve audit history and the existing dependency-script allowlist.

## Verification and acceptance

Run `pnpm install --frozen-lockfile`, `python3 -m unittest discover -s tests`,
`pnpm run lint`, `pnpm run typecheck`, and `pnpm run build`; all must pass.
Add an executable auth regression command and include it in current workflow
acceptance. Tests first demonstrate the currently unprotected behavior, then
exercise the production build through real HTTP requests:

- Anonymous `/`, dotted/unknown pages, nested endpoints, and `/api/session`
  deny access correctly, including RSC/prefetch/bypass-header variants.
- Arbitrary, tampered, expired, wrong-secret, unlisted, removed-member, and
  unverified-email cookies cannot retrieve protected HTML or endpoint success.
  A valid library-issued session for a currently listed verified account can.
- Exercise real sign-in initiation and callback state checks; reject missing
  or mismatched state, unsupported providers, malicious callback URLs,
  cross-origin sign-in/sign-out, and inappropriate request methods.
- Verify only configured, Google-verified Gmail accounts can obtain sessions;
  test empty-list denial and current eligibility checks after removal.
- Exercise successful OAuth callback and session creation with provider
  HTTP responses stubbed only at the network boundary in a test process.
  Never add a production auth bypass, test provider, session-minting route,
  environment-controlled fake-user path, or alternate production verifier.
- Using the same browser cookie jar, sign out, confirm cookie deletion,
  then verify subsequent page and direct API requests are denied. Demonstrate
  absolute expiry without a one-hour sleep using test-only clock control or
  library cookie helpers; test tooling must not weaken production validation.
- Start without required configuration and confirm protected requests deny
  access. Verify Set-Cookie attributes and private/no-store headers.

Verify sign-in and authenticated title-only screens in a real browser at
320 and 1440 CSS-pixel widths, with no horizontal overflow and no application
console/network failures. Save screenshots and actual command evidence.
A mocked provider proves local integration, not access to a real Google
account: actual Google credentials/consent configuration and a final live
Google round trip remain an explicitly reported environment-dependent check.
No live success may be claimed without performing that check.

Run the native dependency audit, staged secret scanner, diff check, org
message/memory/loop checks, active plan-sync, and gate-ledger verification.
Independent spec and plan approval precede code; independent code/security
reviews precede human merge/release. No merge, deployment, or release here.

## Official sources checked during Design

- [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next):
  App Router handlers and Node-runtime Next16 proxy session verification.
- [Better Auth session management](https://better-auth.com/docs/concepts/session-management#stateless-session-management):
  no-database mode, encrypted cache, refresh options, and revocation limits.
- [Better Auth Google provider](https://better-auth.com/docs/authentication/google):
  provider credentials, callback URI, and minimal Google configuration.
- [Better Auth cookie settings](https://better-auth.com/docs/concepts/cookies):
  encrypted cookie format and transport attributes.
- [Better Auth security](https://better-auth.com/docs/reference/security):
  origin/CSRF and OAuth protections.
- [Better Auth options](https://better-auth.com/docs/reference/options):
  trusted origins, fixed baseURL, account state, disabled paths, and expiry.
- [Bun TypeScript definitions](https://bun.sh/docs/typescript):
  `@types/bun` delegates to the official `bun-types` package. Load only its
  SQLite declaration for this compatibility need; retain the repository's
  Node runtime and strict compiler settings.
- [Official SQLite declaration source](https://github.com/oven-sh/bun/blob/main/packages/bun-types/sqlite.d.ts):
  the installed 1.4.5 declaration is a self-contained `bun:sqlite` ambient module.
- [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication):
  library selection and checks near protected data/action execution.
- npm registry queries `pnpm view better-auth version peerDependencies engines --json`
  and `pnpm view tsx version engines --json` returned stable 1.7.27 and 4.23.15.
  The selected Better Auth tarball integrity is
  `sha512-UPkaFZ16tjxXa6BeTCqu1H8Tfw9xY38nPhxBb6Sh88RjJNrO4GBXSDRfpxTn61uMFC0q/XrIUJ6i0/MEPOw7zg==`.

Sources accessed 2026-11-23. Build must inspect the pinned implementation where
rolling documentation leaves an option or stateless edge case uncertain;
material changes require specification revision and review before proceeding.
