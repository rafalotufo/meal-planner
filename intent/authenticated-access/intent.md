# Meal Planner — authenticated access

- Author: Rafael (request); product-manager (intent capture)
- Source: `org/intake/forms/authenticated-access-001.md`
- Scope amendment: `org/intake/forms/authenticated-access-allowlist-001.md`
- Status: Accepted
- Accepted by: product-manager under the org intent gate
- PM decision: `org/reviews/intent-authenticated-access-001.md`
- Amendment decision: `org/reviews/intent-authenticated-access-allowlist-001.md`
- Date: 2026-11-23

## Problem

The initial request required authentication for the website and its endpoints.
The owner has now narrowed eligibility: Google authentication alone must not
grant access. Only Gmail accounts explicitly listed in server-side code
configuration may sign in or use protected application content and endpoints.
The existing database-free Google/session design must incorporate this policy.

## Proposed outcome

Require a valid, server-verified user session before returning protected
website content or executing protected endpoint behavior. Provide the minimum
public entry points required to establish that session. Use Google sign-in,
as selected by the owner. Administrators maintain the eligible Gmail email
addresses in server-only code configuration. This supersedes the earlier
assumption that any verified Google account is eligible.

The initial confirmed list is:

- `thomasnlotufo@gmail.com` (owner confirmed correction of `thomasnlotufo@gmail`)
- `erikafn@gmail.com`
- `aclotufo4@gmail.com`
- `rafalotufo@gmail.com` (subsequently added by the owner)

### Acceptance criteria

- Unauthenticated visitors cannot retrieve protected page content; browser
  navigation takes them to the sign-in flow.
- Direct requests to protected endpoints and server actions, where present,
  enforce authentication on the server before protected data or behavior is
  available. Endpoint denial has an explicit API-appropriate response defined
  in the specification; hiding UI or redirecting only in client code is
  insufficient.
- Missing, malformed, invalid, or expired sessions grant no protected access.
  Authentication configuration or validation failures do not open access.
- A successful Google sign-in establishes an authorized application session
  only for a Google-verified Gmail email on the configured list. Unlisted or
  unverified identities are denied before session issuance.
- Match the verified email by trimming whitespace and lowercasing, then exact
  comparison. Do not collapse Gmail dots, remove plus suffixes, accept aliases,
  use substring/domain-only matching, or trust client-supplied email values.
- An empty list denies all users. Every protected page, endpoint, and action
  checks current eligibility as well as session validity before protected data
  or effects. Removing an account from the deployed code configuration denies
  that account's existing sessions on subsequent requests, even before expiry.
- The allowlist is server-only configuration, not a browser payload or public
  endpoint. Denied sign-in/access uses generic messaging that does not reveal
  list membership, the list itself, or provider details.
- Signing out clears the current browser's application session and subsequent
  requests from that browser require sign-in again. The specification must
  define session expiry, logout behavior, and any session-revocation limits.
- Public exceptions are explicit and minimal: the sign-in entry point, any
  provider callbacks or authentication endpoints needed to establish a
  session, and non-sensitive assets required to render those flows. Public
  exceptions must not return protected application content or operations.
- Meaningful runtime regression coverage exercises unauthenticated direct
  requests, valid authenticated requests, invalid and expired sessions, sign-in,
  sign-out, and attempted access after sign-out. Tests cover the actual server
  boundary rather than only rendered UI or mocked client state.
- Regression coverage proves allowed and denied Google identities, unverified
  email denial, trim/lowercase exact matching without dot/plus normalization,
  empty-list denial, and removal denying existing sessions before expiry.
- Lint, typecheck, production build, Python workflow tests, and staged secret
  scanning pass without suppressed checks. Verify the sign-in and authenticated
  page flows in a real browser at mobile and desktop widths during Build/Test.
- Independent spec, plan, code, and security reviews precede the existing
  human merge and release gates.

## Affected users and systems

Visitors must sign in before using Meal Planner. Application page delivery,
endpoint handling, session lifecycle, authentication configuration, contributor
setup instructions, and verification are affected. The implementation must
establish a clear default protection boundary for future application routes.
Administrators change the eligible-account list through code changes and the
normal deployment process; there is no browser administration interface.

## Constraints

Use the existing Next.js App Router and pnpm workflow. Keep the authenticated
home page limited to its `Meal Planner` heading; add only authentication UI
required by the approved specification. Do not assume a database is necessary
or configure an identity provider account without an approved design. Keep
credentials outside source control and preserve existing org audit records.
Follow `org/protocol.md` and keep feature specifications in this folder.

## Out of scope

Meal-planning features, role-based permissions, tenant isolation, user profiles,
unrelated UI, broad dependency upgrades, production deployment, merge, and
release. Locally managed passwords, account registration and recovery,
invitation flows, an administration UI, an administrator role system,
Google-account management, and additional user-profile storage are not
implicitly authorized. The configured Gmail accounts receive application
access; inclusion does not create an administrator role.

## Open questions

The owner selected Google sign-in and explicitly replaced unrestricted Google
eligibility with the server-code Gmail list above. The malformed first entry
was clarified by the owner as `thomasnlotufo@gmail.com`; no correction remains
pending.

Technical library selection, session implementation, exact route exceptions,
Google OAuth credential setup, callback URLs, and test tooling belong to
Design. Credentials are not needed to accept the intent and must not be
recorded in source-controlled artifacts. No blocking product question remains.
