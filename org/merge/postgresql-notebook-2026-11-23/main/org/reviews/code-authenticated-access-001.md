---
artifact: implementation
reviewer: reviewer
verdict: approved
round: 1
---

# Independent code review — authenticated access

## Verdict

Approved the implementation against the accepted intent, current specification,
plan and independently reviewed amendments. No unresolved blocking bugs,
security or compliance findings remain in this code review. Separate security
assessment, orchestrator process checks and human merge/release gates remain.

## Review passes and evidence

- Bugs: `proxy.ts` defaults to full session verification for application
  requests, with exact path/method public exceptions. Pages redirect to the
  configured canonical sign-in URL; direct endpoints/non-navigation operations
  deny unauthorized access. `app/page.tsx` and `app/api/session/route.ts`
  independently check the shared helper before returning protected content.
  Missing/invalid configuration fails closed and protected responses do not
  cache session decisions across users.
- Security: `lib/auth.ts:42` uses the pinned library's Google verifier for
  signature, issuer, audience, expiry and maximum token age before profile
  mapping. The following eligibility check requires strict verified Gmail
  email and configured exact membership before session issuance.
  `lib/session.ts:9` cryptographically verifies cookies, then rechecks current
  eligibility. Removing an account through activated code denies its existing
  sessions. Client input cannot override provider, scopes or destinations.
  The catch-all retains handler origin/CSRF/state/PKCE protection and exposes
  only the reviewed auth routes. No production code imports the test fixture
  or implements a fake-user/session-minting bypass.
- Compliance: the configured four accounts match the accepted owner list;
  trim/lowercase matching preserves dots/plus aliases rather than expanding
  eligibility. The server-only list is absent from browser assets. The home
  remains heading-only; authentication UI and blank inline icon are the
  reviewed minimal additions. README and agent instructions describe current
  eligibility, configuration, activation and session limits accurately.

## Finding resolved during review

[P2, compliance] The initial configuration regex accepted malformed unquoted
Gmail local parts, including semicolons and leading/consecutive dots. I
independently reproduced that a valid member was granted access even when a
malformed entry appeared alongside it, violating the whole-list fail-closed
contract. The developer added failing mixed-list tests and tightened the
local-part grammar. `lib/google-access.ts` now rejects those malformed entries,
retains explicitly configured plus tags, and preserves exact identity matching.
The focused three policy/browser-bundle tests passed independently. No
suppression, removed test, broadened matching or quality-bar reduction was used.

## Verification reviewed

`org/reviews/authenticated-access-verification.md` records final post-conversion
frozen installation, lint, strict application/test typecheck, production build,
11/11 authentication tests, seven Python workflow tests and the real Chrome
harness, all exit zero. The tests cover actual server behavior: successful
mocked Google callback, invalid provider signature/audience/issuer/expiry,
state binding, unlisted/unverified claims, authenticated page/API access,
forged/expired/removed-member cookies, current eligibility, malformed policy,
logout/chunk deletion, canonical Host, secure cookie attributes and no-store
responses. Production CSP is nonce-based and excludes unsafe-eval; the latter
is enabled only for documented development compatibility.

All new auth tests and helpers are TypeScript, including server, provider
transport and browser code. Exact `tsx@4.23.15` loads the suite and child
fixture. Existing `**/*.ts` compiler inclusion checks them strictly;
`noEmit`, `strict` and `skipLibCheck: false` remain. The optional ESM package
marker is local to tests. No explicit any, diagnostic suppression, test skip,
or new test exclusion was introduced. Existing dependency pins and the strict
lifecycle-script policy are retained; the lockfile records the reviewed exact
Better Auth, Bun declaration-only and tsx additions.

I visually inspected all four final screenshots at 320 and 1440 CSS-pixel
widths: plain sign-in with a visible keyboard focus ring, no horizontal
clipping, and the authenticated home containing only `Meal Planner`.
The final TypeScript Chrome run regenerated these images and reports an empty
collection of console errors/warnings, browser errors and failed requests.
Live Google credentials/consent were not available and are not claimed verified.

## Independent regression-sensitivity experiment

See `org/reviews/authenticated-access-mutation-001.md`. In an owned isolated
copy of the confirmed production build, I inverted the compiled proxy's session
truthiness exactly once. Eight HTTP/OAuth tests then exited 1 with two relevant
failures: anonymous boundary redirection and valid-session page access.
Restoring that single copied expression made the identical eight-test control
pass with exit zero. Shared source/build state was never mutated, and the owned
temporary project was removed. Subsequent TypeScript-only conversions preserved
the guard semantics; the final delivered TypeScript suite also passes normally.

## Limits and remaining human gates

Both native audits report one inherited moderate esbuild advisory and zero
high/critical findings; the verification report traces its development-server
reachability and optional Drizzle peer path rather than claiming a clean
production audit. The independent security reviewer owns its disposition.
Stateless logout cannot revoke a copied cookie for a still-eligible account
before the fixed one-hour expiry; membership removal and secret rotation are
accurately documented. Real Google environment setup and the live provider
round trip remain external verification. This code verdict authorizes neither
merge nor production release.
