# Login session expiration — local verification

- Author: senior-developer; date: 2026-11-25
- Scope: local feature branch, owned random PostgreSQL fixture databases and isolated Chrome profile; no development/hosted data changes, merge, push or release
- Environment: Node24.15.0, pnpm10.33.0, pinned lockfile dependencies

## Test-first evidence

The unchanged one-hour application built successfully. The new focused real HTTP
OAuth regression then failed with exit1 at `tests/auth/oauth.test.ts:42`:
`3600 !== 2592000`. This confirmed that the test detects the requested change
before `lib/auth.ts` was edited.

After the narrow configuration change and production rebuild, the same command
passed1/1 with exit0:

```text
node --import tsx --test --test-name-pattern="Google OAuth completes" tests/auth/oauth.test.ts
```

It checks exact token/session-data cookie Max-Age, encrypted session lifetime,
both lower and upper inner-session expiry bounds, one-hour account-data cookie
and encrypted payload, admission without account-data, repeated reads without
replacement credentials, and a shorter legacy-shaped signed session without
renewal. Existing independent expired outer-JWE/inner-session, tampering,
wrong-key, identity, admission and logout assertions remain active.

## Verification results

All commands below completed with exit0. Raw logs remain in private temporary
files and are not repository artifacts.

| Command | Actual result |
| --- | --- |
| `pnpm run lint` | Passed, zero warnings |
| `pnpm run typecheck` | Passed strict TypeScript and generated route types |
| `pnpm run build` | Passed optimized production build and runtime metadata validation |
| Focused OAuth command above | 1 passed, 0 failed |
| `pnpm run test:auth` | 16 passed, 0 failed |
| `pnpm run test:family` | 35 passed, 0 failed |
| `pnpm run test:menu` | 69 passed, 0 failed |
| `node --import tsx --test --test-concurrency=1 tests/verification/*.test.ts` | 29 passed, 0 failed |
| `node --import tsx --test tests/deployment/*.test.ts` | 40 passed, 0 failed |
| `python3 -m unittest discover -s tests` | 7 passed, OK |
| `node --import tsx tests/auth/login-expiration-browser.ts` | Chrome login/navigation/logout passed at390px and1440px |
| `python3 scripts/check_plan_sync.py --hook --plan intent/login-session-expiration/plan.md` | Passed against staged implementation and approved manifest |
| `python3 scripts/org_message.py check` | 378 messages, zero violations |
| `python3 scripts/org_loop.py check` | Zero violations |
| `python3 scripts/org_memory.py check` | Zero violations |
| `python3 scripts/scan_secrets.py --staged` | Zero findings |
| `git diff --check` and `git diff --cached --check` | Passed |

The Node runs reported zero skipped, cancelled or todo tests. Synthetic
verification regressions include real compiled enabled-Preview exchange,
revocation/conflict logout, source-less packaging and simulated-Production
denial; these are isolated local fixtures, not hosted operations. Menu tests
retain current token/JWE binding, admission loss and secure cookie/chunk checks.

## Browser evidence

The focused TypeScript helper replaces the broad legacy auth/game browser run
to keep QA scoped to this feature and preserve historical screenshots. It owns
its local production server, random migrated test database and temporary Chrome
profile, and forces empty paid provider keys using the existing server fixture.
It uses the real Google sign-in control, automatic onboarding, protected home
navigation and sign-out control at both widths; no auth-cookie reads through
browser JavaScript or runtime bypass is introduced.

All six screenshots were opened and visually inspected: readable controls,
unchanged layouts and no clipped content. The helper also asserts no horizontal
overflow and an empty browser console/network error list. Evidence lives under
`org/reviews/`:

- `login-session-expiration-sign-in-390.png`
- `login-session-expiration-home-390.png`
- `login-session-expiration-sign-out-390.png`
- `login-session-expiration-sign-in-1440.png`
- `login-session-expiration-home-1440.png`
- `login-session-expiration-sign-out-1440.png`

The helper stopped its owned server/Chrome and removed its temporary browser
profile; fixture cleanup removed its owned random database.

## Limits and security consequence

OAuth uses the existing test-process-only Google transport fixture; no live
Google, paid provider, hosted deployment, real elapsed30days or Firefox/Safari
success is claimed. Signed expiry and response headers prove the configured
duration without waiting a month. Browsers may discard cookies earlier.

Existing sessions retain their own signed expiry. Browser logout clears local
cookies and cannot revoke a copied stateless Google credential before its
expiry, potentially up to30days for newly issued sessions, subject to current
admission checks. The separate account-data lifetime remains one hour and
synthetic verification session/capability/run durations are unchanged.
