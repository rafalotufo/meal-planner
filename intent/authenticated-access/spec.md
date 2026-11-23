# Meal Planner — authenticated access specification

- Derived from: accepted `intent/authenticated-access/intent.md`
- Author: architect
- Status: Approved by independent reviewer (`org/reviews/spec-authenticated-access-001.md`)
- Date: 2026-11-23

## Objective and scope

Only users holding a valid application session established through Google
sign-in may retrieve application content or execute application endpoints.
Any verified Google account is eligible under the explicit intent assumption.
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

Review: `org/reviews/authenticated-access-types-amendment-001.md`.

Allow exact development-only `@types/bun@1.4.5` (registry dependency
`bun-types@1.4.5`). Better Auth 1.7.27's published core declaration imports
`Database` from `bun:sqlite` unconditionally, although this application uses
Node and no database. With existing `skipLibCheck: false`, `pnpm run typecheck`
reproduced TS2307 at `@better-auth/core/dist/types/init-options.d.mts:17`.
The published Bun type definitions supply that missing module; this does not
install a Bun runtime or authorize any SQLite database usage. Keep all strict
checks; no local ambient shim, ignored diagnostic, patched dependency, or
`skipLibCheck` change is permitted. If TypeScript 6 requires explicit ambient
type inclusion, add `bun` to an explicit compiler `types` list that also
preserves the existing Node/React ambient types, and verify the complete
application typecheck/build rather than copying Bun's compiler configuration.
Registry verification returned stable 1.4.5 on 2026-11-23; installation and
successful strict typechecking remain Build evidence, not assumed success.

Use `lib/auth.ts` for server-only configuration and the library instance,
`lib/auth-client.ts` for the minimal browser client, and a small server auth
helper for shared session checks. Mount the library through
`app/api/auth/[...all]/route.ts`. `proxy.ts` provides the default request
boundary; `app/page.tsx` independently requires a session. Authentication UI
lives under `app/sign-in/` and `app/sign-out/`. Add a minimal protected
`GET /api/session` endpoint returning only `{ authenticated: true }` to make
the endpoint contract executable without exposing profile information.

Use the built-in Node test runner for meaningful behavior tests. If TypeScript
module loading is needed, exact stable `tsx@4.23.15` is compatible with the
supported runtime (registry engines >=18); do not add a separate unit framework.
Use `.mjs` for a network-level harness where TypeScript loading is unnecessary.
Both new dependency pins and pnpm-generated lockfile changes require Build
review, including lifecycle-script policy and native audit results.

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

For missing, malformed, forged, or expired sessions:

- Page GET/HEAD navigation redirects to the canonical `/sign-in` URL without
  returning protected page content. Use a fixed return destination `/`.
- `/api` and `/api/…` requests return 401 JSON `{ "error": "Unauthorized" }`
  with no protected data. Non-navigation protected operations, including
  server-action POSTs, return an unauthenticated denial before side effects.
- Session verification/configuration errors fail closed, using a generic 503
  for unavailable authentication. Public sign-in may show unavailable state;
  it must never grant an anonymous session or expose exception details.

Use full `auth.api.getSession({ headers: request.headers })` verification in
Node-runtime proxy, not `getSessionCookie` presence checks. Re-check at each
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
cookie before its fixed one-hour expiry. This limit is explicit: there is
no per-user revocation store or global Google logout. An emergency server
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
expiry/revocation limits, and verification command. Commit `.env.example`
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
- Arbitrary, tampered, expired, and wrong-secret cookies cannot retrieve
  protected HTML or endpoint success. A valid library-issued session can.
- Exercise real sign-in initiation and callback state checks; reject missing
  or mismatched state, unsupported providers, malicious callback URLs,
  cross-origin sign-in/sign-out, and inappropriate request methods.
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
  `@types/bun` supplies Bun built-in API declarations; TypeScript 6 may require
  explicit ambient type inclusion. Only the missing declaration dependency is
  adopted; retain this repository's Node runtime and strict compiler settings.
- [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication):
  library selection and checks near protected data/action execution.
- npm registry queries `pnpm view better-auth version peerDependencies engines --json`
  and `pnpm view tsx version engines --json` returned stable 1.7.27 and 4.23.15.
  The selected Better Auth tarball integrity is
  `sha512-UPkaFZ16tjxXa6BeTCqu1H8Tfw9xY38nPhxBb6Sh88RjJNrO4GBXSDRfpxTn61uMFC0q/XrIUJ6i0/MEPOw7zg==`.

Sources accessed 2026-11-23. Build must inspect the pinned implementation where
rolling documentation leaves an option or stateless edge case uncertain;
material changes require specification revision and review before proceeding.
