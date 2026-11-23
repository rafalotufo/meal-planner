---
artifact: implementation
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: clear
round: 1
---

# Independent security assessment — authenticated access

## Verdict

No unresolved blocking security findings in the final TypeScript implementation,
including the approved server-code Gmail eligibility amendment. This assessment
supports code review; it does not authorize human merge, deployment or release.

## Threat model and controls

Assets are application access, server authentication/Google secrets, encrypted
session/provider-token material, and the administrator's membership list.
Trust boundaries are browser requests into proxy/handlers, the Google token and
JWKS HTTPS backchannel, server-controlled membership configuration, and isolated
test transport fixtures. Primary abuse cases are forged identity/session claims,
OAuth/CSRF substitution, stale membership, route/header bypasses, redirect or
membership disclosure, and dependency-supplied execution.

- Identity and eligibility: `lib/auth.ts:36-46` uses the pinned library's
  public `verifyGoogleIdToken` before accepting subject/email claims, then
  requires strict verified email and exact configured membership before session
  creation. The initial vendor authorization-code profile decoder trusted its
  HTTPS token backchannel; adversarial signature/audience tests exposed that
  insufficient validation for this specification. The supported verifier now
  checks RS256 signature/JWKS, Google issuer, configured audience and expiry.
  No handwritten OAuth/session cryptography or client ID-token mode was added.
- Current authorization: `lib/session.ts:8-10` performs full library session
  verification, then checks eligibility on every request. Proxy, home page,
  protected API and logout use this helper. Activating rebuilt membership
  configuration denies valid old cookies for removed accounts. The four
  owner-confirmed entries stay in the server-only imported JSON configuration.
- Policy validation: `lib/google-access.ts:3-32` validates the complete list,
  denies an empty list, rejects malformed mixed lists, requires boolean
  `emailVerified === true`, and matches trimmed/lowercased complete addresses.
  Dots, plus tags and domain aliases are not collapsed or expanded. The earlier
  permissive punctuation/dot grammar was corrected with failing regression
  evidence and is no longer an open finding.
- HTTP boundary: `proxy.ts` protects unknown/dotted/API/RSC/prefetch requests
  by default. `lib/auth-policy.ts` permits only exact sign-in/callback methods
  and non-sensitive framework static assets. `app/api/auth/[...all]/route.ts`
  restricts provider/options/body shape/destinations, rejects untrusted Origin,
  and forwards mutations through the library HTTP handler to retain CSRF/state/
  PKCE safeguards. Canonical-origin/Host checks reject redirect-host injection.
- Sessions and disclosure: JWE plus the library-signed session token, fixed
  one-hour expiry and disabled refresh are configured in `lib/auth.ts`.
  Runtime tests verify expiry, wrong-secret/tampered claims and token binding.
  Logout removes base and chunked session/account cookies. HttpOnly/Lax/host-only
  attributes and HTTPS Secure cookies are tested. Responses are generic and
  private/no-store; no list or profile endpoint is exposed. Production nonce
  CSP excludes unsafe-eval; the exception is restricted to development only.
- Test isolation and TypeScript: production code never imports the Google
  fixture or reads a fake-user/test-provider flag. Only the test-owned child
  process preloads `tsx` and `tests/auth/google-network.ts`. The fixture
  replaces Google token/JWKS HTTP transport while the actual library verifier,
  callback, cookie issuance and request guards run. All new tests/helpers are
  TypeScript, strictly checked without any/diagnostic suppressions. Exact
  dev-only `tsx@4.23.15` was already a transitive tool; no new lifecycle approval
  was introduced. `strictDepBuilds` and the narrow existing script map remain.

## Independent evidence

- Ran final `pnpm run test:auth`: exit 0, 11 tests passed, zero failures,
  skips, cancellations or todos. This includes cryptographic provider/session
  failures, denied identities, protected requests, current eligibility, state/
  origin/redirect handling, HTTPS cookie attributes and chunked-cookie logout.
- Ran final `pnpm audit --prod --json`: exit 1, one moderate, zero high and
  zero critical findings; classification and reachability are below.
- Scanned every current `.next/static` file for every configured address:
  zero matches. Parsed all production server `.nft.json` traces: zero fixture,
  esbuild or Drizzle Kit entries. Source search likewise found no production
  fixture imports, NODE_OPTIONS setup, test signing keys or fixture token path.
- Source/dependency secret scan across configuration, auth/session/policy,
  proxy, manifest, lockfile and test transport/server files: zero findings.
  `git diff --check` passed. Final staged scanning remains orchestrator-owned.
- Reviewed final verification evidence: clean/frozen install, lint, strict
  typecheck (including tests/helpers), production build and seven Python tests
  pass. Isolated real Chrome at 320/1440 widths verifies actual controls,
  mocked Google navigation/callback, logout, heading-only content and empty
  Runtime console/log/exception/network error collection. Those build and
  Chrome checks were performed by the developer/orchestrator, not rerun here.

## Retained nonblocking dependency risk

Both full and production audits report esbuild 0.18.20,
[GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99).
Production audit now follows Better Auth's optional Drizzle Kit peer, so this
is not described as a zero-finding production audit or classified solely by
manifest placement. The vulnerable esbuild development serve feature is not
used by the selected database-free authentication, Next Webpack build or test
transport path; final production traces contain neither esbuild nor Drizzle
Kit. No forced upgrade, override or audit suppression was applied.

Preserve the inherited deferral in `security-pnpm-migration-001.md`:
senior-developer owns reassessment by **2026-12-07**, before any release, or
before enabling affected serve functionality, whichever comes first.

## Limits and release considerations

Live Google credentials/consent configuration and a real permitted Google
account round trip were unavailable; local signed transport fixtures are not
live-provider proof. Browser logout cannot revoke a copied cookie for an
otherwise eligible account before expiry; activated membership removal does
block that account's subsequent requests. The library's production limiter
uses process memory; a multi-instance/serverless release needs a shared or
platform limiter and trusted proxy/IP configuration. No production environment,
registry signatures or deployment was verified.

Reviewed official Better Auth [security](https://better-auth.com/docs/reference/security),
[Google provider](https://better-auth.com/docs/authentication/google) and
[session documentation](https://better-auth.com/docs/concepts/session-management)
alongside the pinned package implementation. The skill's shared security
checklist reference is absent locally; its available hardening patterns and
security workflow were used. See `authenticated-access-verification.md` for
complete command and browser evidence. Human merge/release gates remain intact.
