# Login session expiration — specification

- Author: architect; date: 2026-11-25
- Status: Draft for independent org design review
- Inputs: accepted sibling `intent.md`; existing authenticated-access contracts
- Approval: org peer review before implementation; human merge/release gates remain

## Objective and behavior

New real Google logins last a fixed 30 days (2,592,000 seconds) after issuance.
Ordinary reads and activity never slide this deadline. Existing issued sessions
retain their signed expiry and receive no new credentials merely from a read.
Users must sign in again to obtain the longer lifetime. Browser removal or
privacy policies may end persistence earlier; this is the server's maximum,
not a guarantee that a browser retains a cookie for 30 days.

Change only the Google session transport configuration. Keep verified Google
subject, JWE/session-token binding, current admission and family rechecks,
canonical origin/Host, CSRF protections and private response headers intact.
No schema, dependency, OAuth scope, UI, allowlist, deployment or hosted changes.

## Pinned implementation evidence and design

The repository pins Better Auth 1.7.27. Its installed source establishes:

- `dist/db/internal-adapter.mjs:26,302`: `session.expiresIn` sets the inner
  session expiry at creation.
- `dist/cookies/index.mjs:49–51,99–102,173–176`: `expiresIn` sets the signed
  session-token cookie's Max-Age; cache maxAge sets session-data cookie Max-Age
  and outer JWE lifetime. Both values must become 2,592,000.
- The same cache maxAge also supplies the default **account-data** cookie's
  lifetime. Preserve its existing 3,600 seconds explicitly with
  `advanced.cookies.account_data.attributes.maxAge: 3600`; otherwise changing
  cache maxAge inadvertently retains Google account/token data for a month.
  `dist/cookies/session-store.mjs:157–164` applies that override to both the
  account cookie and its separate encrypted account payload. The account cookie
  is not needed by the application session reader; its expiry must not shorten
  valid application admission.
- `dist/api/routes/session.mjs:59,75,79–94`: the cache path checks binding and
  outer/inner expiry, then returns without rewriting cookies when
  `refreshCache: false`. Preserve it and `disableSessionRefresh: true`.

Use one descriptive constant in `lib/auth.ts` for the 30-day session value;
no new module is needed. Keep HTTPS Secure selection and all defaults unchanged
when adding the narrow account-data override. State cookies, provider access
tokens, invite contexts and synthetic verification cookies retain their current
durations. Historical specs and audit evidence remain immutable.

Official documentation supports expiry, refresh disabling and per-cookie
attributes: [session management](https://better-auth.com/docs/concepts/session-management)
and [cookies](https://better-auth.com/docs/concepts/cookies). Pinned source above
governs the version-specific account-cookie behavior.

## Security consequence and compatibility

Stateless logout clears this browser's credentials and cannot revoke an already
copied Google session. New copied credentials may remain usable for up to 30
days, subject to current admission checks. Document that consequence in current
README guidance and the existing emergency `BETTER_AUTH_SECRET` rotation option.
Do not introduce centralized revocation or claim browser logout provides it.
Keep synthetic staging verification session/run/capability/nonce expiry and
revocation unchanged. Existing shorter signed sessions remain valid only until
their own existing deadlines; do not reinterpret their iat using the new value.

## Acceptance and verification

1. Real fixture OAuth callback issues session-token and session-data cookies
   with exactly 2,592,000-second Max-Age, preserving HttpOnly, SameSite=Lax,
   Path=/ and absence of Domain. Decode the actual session JWE and assert
   `exp - iat` equals 2,592,000; bound inner expiresAt around callback issuance
   with a small timing tolerance on both sides, so a short duration cannot pass.
2. The account-data cookie and its separately decoded JWE remain 3,600 seconds.
   Prove application session access works after omitting that cookie. Preserve
   existing OAuth state and HTTPS security regressions.
3. Repeated protected page/session reads issue no replacement credentials and
   preserve the original credential bytes. A valid shorter legacy-shaped
   signed session remains accepted without renewal; independently expired
   outer-JWE and inner-session fixtures remain denied. Use test-only signed
   payload manipulation, never a runtime bypass or 30-day wall-clock wait.
4. Preserve current tampering, wrong-key, verified identity, admission loss,
   token binding, unsupported OAuth input, Origin and logout tests. Run the
   existing auth/family/menu and synthetic verification regressions, with no
   mechanically widened short-lived fixtures.
5. Required lint, strict typecheck, production build, relevant Node regressions,
   Python workflow tests, plan synchronization, org checks and staged secret
   scanning pass with recorded command evidence. Use the existing isolated
   Chrome auth flow at mobile and desktop sizes; inspect screenshots and record
   fixture/browser limits explicitly. Do not claim real Google or hosted proof.

## Boundaries and open questions

Always use strict TypeScript and existing isolated database/server fixtures.
Never modify vendor code, relax checks, seed development/hosted data, or expose
cookies in logs/screenshots. Ask for separate authority for human merge/release
or any hosted effects. There are no unresolved product questions; the PM's fixed
30-day interpretation and non-renewal policy define this scope.
