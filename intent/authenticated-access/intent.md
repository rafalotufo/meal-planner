# Meal Planner — authenticated access

- Author: Rafael (request); product-manager (intent capture)
- Source: `org/intake/forms/authenticated-access-001.md`
- Status: Accepted
- Accepted by: product-manager under the org intent gate
- PM decision: `org/reviews/intent-authenticated-access-001.md`
- Date: 2026-11-23

## Problem

The home page currently renders without an authentication check. The owner
wants access to the website and its endpoints restricted to authenticated
users. There is no configured identity provider, session mechanism, or database,
and no application route handlers currently exist.

## Proposed outcome

Require a valid, server-verified user session before returning protected
website content or executing protected endpoint behavior. Provide the minimum
public entry points required to establish that session. Use Google sign-in,
as selected by the owner. The proposed eligibility policy is that any Google
account with a successfully verified identity may authenticate; no invitation,
email allowlist, or organization restriction is implied by this request.

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
- A successful Google sign-in establishes a session that permits the authenticated
  user to access the existing title-only home page and protected operations.
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
invitation rules, Google-account management, and additional user-profile
storage are not implicitly authorized.

## Open questions

The owner selected Google sign-in. Any successfully verified Google account
is proposed as eligible unless the owner narrows that policy later; this is an
explicit scope assumption rather than a separate invitation feature.

Technical library selection, session implementation, exact route exceptions,
Google OAuth credential setup, callback URLs, and test tooling belong to
Design. Credentials are not needed to accept the intent and must not be
recorded in source-controlled artifacts. No blocking product question remains.
