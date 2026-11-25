# Login session expiration — independent implementation review

- Reviewer: reviewer; date: 2026-11-25
- Verdict: Approved for local completion and human merge review
- Scope: implementation against peer-approved sibling intent/spec/plan; no merge, push, hosted or release approval
- Evidence: `intent/login-session-expiration/verification.md`, actual temporary command logs inspected, and six committed feature screenshots

## Findings

No blocking or optional findings. Completed bugs, security and compliance passes
and reviewed correctness, simplicity, architecture, security and performance.
The change adds one duration constant and a narrow cookie override; no new
runtime abstraction, dependency, schema or authorization path is introduced.

## Reviewed behavior and evidence

- `lib/auth.ts:9,62–70` sets inner-session and encrypted session-cache expiry
  to the same fixed 2,592,000 seconds, retains both refresh disablements, and
  caps account-data browser/JWE lifetime at 3,600 seconds through the supported
  cookie override. The existing Secure selection and default HttpOnly,
  SameSite and host-only attributes are preserved. Pinned source behavior was
  independently checked during the design review.
- `tests/auth/oauth.test.ts:28–57,90–112` verifies actual HTTP callback cookie
  Max-Age, decoded session/account JWE lifetimes, two-sided inner expiry bounds,
  continued application access without account-data, unchanged bytes/no
  Set-Cookie on repeated page/session reads, and shorter legacy-shaped signed
  expiry without renewal. Existing expired outer/inner, tamper, wrong-key,
  identity, Origin, token and logout cases remain. The actual RED log fails
  `3600 !== 2592000` at line42 against the old production configuration; the
  same focused test passes after the change. This demonstrates detection of
  the old-lifetime regression rather than relying on test inspection alone.
- `README.md:156–163` and `AGENTS.md:130–137` accurately document fixed expiry,
  old-session compatibility and the copied-credential window. No new
  revocation guarantee is claimed; current admission checks continue to bound
  access. Provider token, OAuth state and staging verification lifetimes are
  not mechanically widened.
- `tests/auth/login-expiration-browser.ts:9–36` uses the existing isolated
  server/database/Chrome and test-only Google transport for actual login,
  navigation and logout at390px and1440px. Independently opened all six PNGs:
  readable controls, normal layouts, no clipping or exposed credentials.
  Existing Chrome viewport code checks horizontal overflow; the focused run
  checks an empty console/network error list and reports success.

Actual logs support the final verification record: lint, strict typecheck and
production build pass; focused OAuth1/1, auth16/16, family35/35, menu69/69,
verification29/29, deployment40/40 and Python7/7 pass with no skipped Node tests.
The clean upload/deployment checks and synthetic expiry/revocation regressions
remain local fixtures. `git diff --check` passed during independent review.
Root completes final staged secret, plan-sync and org-state checks before the
handoff. Signed-fixture expiry proof is not elapsed30day, live Google, hosted,
Safari or Firefox proof; the verification record states those limits.

Local implementation is approved. Longer copied stateless Google credentials
remain a documented consequence of the requested lifetime, subject to current
admission checks. Human merge/release approval is still required.
