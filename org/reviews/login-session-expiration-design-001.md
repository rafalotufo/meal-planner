# Login session expiration — independent design and plan review

- Reviewer: reviewer; date: 2026-11-25
- Verdict: Approved for local implementation under the org spec/plan peer gates
- Artifacts: `intent/login-session-expiration/spec.md`, `intent/login-session-expiration/plan.md`
- Scope: design and plan only; no implementation, merge, hosted or release approval

## Findings

No blocking or optional findings. Reviewed bugs, security and compliance passes
against the accepted PM intent and pinned Better Auth 1.7.27 source.

## Evidence and implementation obligations

- **Bugs:** Specification lines 24–45 aligns the inner session, signed token
  browser lifetime, cache browser lifetime and outer JWE at 2,592,000 seconds.
  Pinned `node_modules/better-auth/dist/db/internal-adapter.mjs:302` creates the
  inner expiry from sessionExpiration; `dist/cookies/index.mjs:49–51,99–102`
  establishes the independent cookie/cache dependencies. Shared session reads
  use the signed inner and outer expiry rather than deriving a new deadline
  from the new configuration, so existing sessions are not retroactively
  extended (`dist/api/routes/session.mjs:59–94`).
- **Security:** The important account-cookie coupling is explicitly resolved,
  not ignored: spec lines 31–38 preserves `account_data` at 3,600 seconds through
  supported per-cookie attributes. `dist/cookies/index.mjs:27–42` merges that
  narrow override last; `dist/cookies/session-store.mjs:157–165` applies its
  maxAge to both browser cookie and account JWE. Other cookie attributes retain
  defaults. Spec lines 56–63 accurately exposes the longer copied-credential
  window and preserves current admission checks and staging expiry policies.
- **Compliance:** Plan lines 10–31 requires a failing HTTP regression before
  runtime changes and local verification before independent final/security
  review. Its explicit path manifest (lines 40–47) bounds implementation and
  allows a focused TypeScript browser helper without rewriting historical
  screenshots. No schema, dependency or hosted effects are included.

Approval depends on the stated implementation obligations: exact cookie and
outer-JWE lifetimes, two-sided inner-expiry bounds, independent one-hour account
cookie/JWE checks, access without account-data, no credential rewrite on repeated
reads, shorter legacy-shaped session acceptance without renewal, and independent
expired outer/inner denial. Keep tampering/token binding/admission/security tests.
Run the specified command checks and inspect real Chrome mobile/desktop evidence;
report fixture limits without claiming real Google, elapsed-month or hosted proof.
The final implementation and security reviews remain required. Human merge and
release gates remain pending.
