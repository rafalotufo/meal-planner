# Login session expiration — independent security review

- Reviewer: security-researcher; date: 2026-11-25
- Verdict: Approved for local implementation scope; no blocking findings
- Scope: accepted intent, approved specification/plan, final runtime/test/doc diff and sibling verification evidence
- Human merge, hosted validation and release decisions remain separate

## Threat model and findings

The trust boundary is the browser's bearer credentials entering protected
requests. Assets are authenticated family access and the Google account data
inside its separate encrypted cookie. A stolen pair of Google session credentials
can impersonate its holder until signed expiry, subject to current admission
checks. Extending that maximum from one hour to30days is the requested behavior
and increases this existing replay window. Browser logout cannot revoke a copied
stateless credential. README.md:155–162, AGENTS.md:130–137 and the feature's
verification record explicitly document that consequence and existing emergency
secret rotation. No revocation guarantee is claimed.

No blocking or optional security findings remain. The implementation changes no
authentication flow, principal, admission rule, schema, provider scope, secret,
dependency or synthetic verification credential.

## Evidence

- `lib/auth.ts:9,61–70` uses the same fixed2,592,000-second value for inner
  Google session creation and encrypted session cache, preserves both refresh
  disablements, preserves HTTPS Secure selection, and independently limits
  account_data to3,600seconds. In pinned Better Auth1.7.27,
  `dist/cookies/index.mjs:27–42` merges the narrow account override last;
  `dist/cookies/session-store.mjs:157–165` uses it for both browser Max-Age
  and encrypted account-payload expiry. Sensitive account data therefore does
  not inherit the longer session lifetime.
- The unchanged `lib/session.ts:12–30,37–41` verifies the current cryptographic
  session, rechecks Google admission and derives family context server-side.
  Unchanged `lib/menu/http.ts:31–39` requires current JWE/session-token identity
  binding and uses the minimum signed outer/inner expiry for effects. No
  authorization cache or client-provided family authority is added.
- The pinned cached-session path (`dist/api/routes/session.mjs:41–96`) checks
  signed-token binding and outer/inner expiry before returning without renewal.
  It neither requires account-data nor recomputes old expiry from the new
  configured duration. Existing issued sessions therefore keep their deadlines.
- `tests/auth/oauth.test.ts:28–57,78–128` checks exact new cookie/JWE duration,
  two-sided inner-expiry bounds, account cookie/JWE retention, access without
  account-data, repeated unchanged credentials, shorter legacy-shaped sessions
  without renewal, and independent expired/tampered/wrong-key/identity rejection.
  Existing admission, token binding, CSRF/Origin and logout regressions remain.
- `lib/verification/store.ts:45` retains15-minute synthetic sessions bounded
  by run expiry; verification cookie/store/issuer/runtime sources are unchanged.
  No Google cookie or synthetic bypass is introduced in production code.
  The focused Chrome helper uses the existing owned fixture server/profile,
  empty paid keys and test-process-only Google transport; it does not log or
  screenshot cookie values.

## Verification and limits

Reviewed `intent/login-session-expiration/verification.md`: the new focused HTTP
test failed against the one-hour runtime before the change, then passed after
rebuild. Recorded passing suites are auth16, family35, menu69, verification29,
deployment40 and Python7, with no skipped tests; lint, strict typecheck, production
build, manifest synchronization and secret scanning passed. Real Chrome completed
login/navigation/logout at390px and1440px with six screenshots inspected by the
developer and no reported console/network errors. This review inspected source
and those recorded command results; it did not rerun broad suites concurrently.

Evidence proves local fixture behavior and signed lifetime policy. It does not
prove live Google, hosted operation, real elapsed30days or Firefox/Safari
persistence. Browser retention can end earlier. No deployment, migration, paid
provider operation, push or merge is authorized by this review.
