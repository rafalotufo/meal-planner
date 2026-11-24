---
artifact: intent/authenticated-access/spec.md
reviewer: reviewer
verdict: approved
round: 1
---

# Independent specification review — authenticated access

## Verdict

Approved for planning under `org/protocol.md`. No blocking findings across
bugs, security, or compliance. This is an independent review of the architect's
specification, not implementation approval or a human merge/release decision.

## Evidence and review passes

- Bugs: `intent/authenticated-access/spec.md:44`–`84` defines default protection
  for pages, direct endpoints, unknown/dotted routes, RSC requests, and server
  operations. It requires full session validation plus checks at implemented
  resource boundaries, and distinguishes browser redirects from API 401s.
  Missing configuration produces a closed 503 path rather than anonymous access.
- Security: lines 51–65 enumerate the public method/path exceptions and require
  the catch-all to deny unrelated library routes. Lines 88–114 fix the canonical
  origin, keep secrets on the server, retain provider/CSRF/state/PKCE checks,
  and bound encrypted sessions to one hour without refresh. Lines 116–122
  disclose the stateless copied-cookie revocation limit accurately.
- Compliance: lines 10–40 follow the accepted Google-sign-in intent and preserve
  the authenticated heading-only home page. The protected session endpoint
  supplies an executable endpoint contract without adding product data. Minimal
  sign-in/sign-out UI and no database fit the accepted scope. Lines 139–176
  require behavioral HTTP/browser evidence and independent reviews before the
  human merge/release gates.

## Official-source verification

Reviewed on 2026-11-23:

- [Better Auth Next.js integration](https://better-auth.com/docs/integrations/next)
  supports the App Router handler and full Next.js 16 Node-runtime proxy check.
- [Better Auth session management](https://better-auth.com/docs/concepts/session-management)
  documents database-free Google sessions, JWE cookie caching, cookie-backed
  state/account data, and disabling refresh. Account cookies may contain
  encrypted provider token material; Build must preserve the specification's
  identity-only scopes, no refresh-token request, bounded cookie lifetime, and
  cookie-chunk handling. Stateless logout cannot invalidate copied cookies.
- [Better Auth Google provider](https://better-auth.com/docs/authentication/google)
  confirms credentials and the `/api/auth/callback/google` redirect path.
- [Better Auth security](https://better-auth.com/docs/reference/security)
  confirms origin and OAuth defenses. Direct `auth.api` calls skip handler
  CSRF protections, so the specification correctly uses the public handler for
  browser mutations and reserves direct session reads for server checks.

## Implementation checkpoints and limits

The design is implementable without a production authentication bypass. Build
must prove the pinned library's actual cookie expiry/deletion and successful
OAuth callback with provider responses intercepted only in a test process;
configuration-shaped tests alone are insufficient. Check public path/method
normalization, callback destination rejection, cookie chunk deletion, and
no-store responses in runtime tests. Rolling documentation is not a substitute
for inspecting the pinned implementation where behavior is uncertain.

A real Google credential/consent round trip remains an explicitly reported
external configuration check. No live sign-in, runtime test, dependency audit,
or application security clearance is claimed by this specification review.
