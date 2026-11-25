# Login session expiration — intent

- Author: product-manager, from Rafael's request in this chat
- Date: 2026-11-25
- Status: Accepted for Design under the org PM intent gate
- Source request: “run the following intent with ai sdlc org skill: increase login expiration to one month”

## Problem and outcome

Google sign-in currently expires after one hour, requiring frequent sign-in.
Keep an admitted user's Google login valid for a fixed 30 days after issuance
(2,592,000 seconds), without automatic renewal. “One month” means this fixed
duration rather than a variable calendar month. This is a focused session
lifetime change to the existing login flow.

## Current evidence

`lib/auth.ts:60–62` configures both the Better Auth session lifetime and encrypted
JWE cookie-cache lifetime as 3,600 seconds, with session and cache refresh disabled.
`tests/auth/oauth.test.ts` checks callback cookie bounds, the JWE's outer expiry,
the inner session expiry, rejection of expired/tampered sessions, and absence of
cookie refresh on session reads. `lib/session.ts` rechecks current Google
admission after cryptographic session verification. `README.md:156` documents
the one-hour lifetime and copied-cookie logout limitation.

## Acceptance criteria

- New real Google sessions have a fixed 30-day lifetime. Align the required
  browser session credentials, encrypted JWE expiry, and inner session expiry
  so one layer cannot truncate the intended lifetime or outlive its authority.
- Session reads and ordinary activity do not renew expiry. Expired sessions
  remain denied. Existing issued sessions retain their original signed expiry;
  this change does not retroactively extend them.
- Preserve HttpOnly, SameSite=Lax, host-only and HTTPS Secure attributes,
  current JWE/session-token binding, canonical-origin restrictions, verified
  Google subject and server-side current admission/family checks. Longer login
  persistence grants no additional authorization.
- Logout still clears browser credentials. A copied stateless Google cookie
  may remain usable until its issued expiry, now up to 30 days for new sessions,
  while current admission rechecks continue to apply. Document this consequence
  and the existing emergency secret-rotation option accurately.
- Keep Google provider token expiry, OAuth state and invitation cookies,
  staging verification session/run/capability/nonce expiry, and all other
  short-lived credentials at their existing durations. Do not mechanically
  replace every occurrence of 3,600 in tests or code.
- Meaningful TypeScript regressions prove the 30-day issuance contract, expiry
  denial, no refresh, and security boundaries through existing HTTP fixtures.
  Required lint/typecheck/build, relevant regressions, workflow checks and staged
  secret scanning pass with actual evidence. Verify the unchanged login UI in a
  real browser at mobile and desktop widths; distinguish fixture observations
  from real Google or hosted authentication evidence.
- Update active operational documentation and repository guidance to the new
  lifetime. Preserve historical feature specifications and audit records.

## Scope and handoff

Local design, implementation and verification proceed through independent
org design/plan/code/security gates. No new UI, remember-me option, rolling
session, centralized session revocation system, dependency, schema migration,
data change, hosted configuration, push, merge or deployment is authorized.
Human merge and release gates remain separate.

No product ambiguity blocks Design. The architect must verify the pinned Better
Auth behavior and all cookie/session expiry layers, define exact regression
evidence and preserve current handling of existing sessions. The longer copied
cookie exposure is an explicit consequence of the requested lifetime, not a
new revocation guarantee.
