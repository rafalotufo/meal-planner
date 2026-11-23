# Meal Planner — authenticated access build plan

- Derived from: approved `intent/authenticated-access/spec.md`; accepted sibling intent
- Author: senior-developer
- Status: Approved by independent reviewer (`org/reviews/plan-authenticated-access-001.md`)
- Date: 2026-11-23

## Files that change

- package.json
- pnpm-lock.yaml
- pnpm-workspace.yaml
- .gitignore
- .env.example
- lib/auth.ts
- lib/auth-client.ts
- lib/session.ts
- lib/auth-policy.ts
- proxy.ts
- app/page.tsx
- app/api/auth/[...all]/route.ts
- app/api/session/route.ts
- app/sign-in/page.tsx
- app/sign-in/sign-in-button.tsx
- app/sign-out/page.tsx
- app/sign-out/sign-out-button.tsx
- tests/auth/*.mjs
- README.md
- AGENTS.md
- CLAUDE.md
- org/loop/config.yaml
- org/reviews/authenticated-access*
- org/reviews/*authenticated-access*.md

Feature documents and org graph, status, memory, messages, loop and ledger
records remain process artifacts owned by the orchestrator. The test checklist
lives in this plan per repository convention; no duplicate task tracker.
`pnpm-workspace.yaml` changes only if a newly introduced dependency script
requires an inspected, narrow allow/deny decision; preserve existing decisions.

## Design and dependencies

Use exact stable `better-auth@1.7.27` without a database. Keep all existing
manifest versions and scripts; add `test:auth` for Node's built-in test runner.
Prefer `.mjs` tests to avoid a new loader; exact `tsx@4.23.15` is permitted only
if meaningful TypeScript-level tests need it. Inspect the pinned package's
stateless JWE, state/account-cookie, expiry and logout implementations before
coding. One-hour sessions do not refresh; browser logout cannot revoke a
previously copied cookie before expiry. Do not hand-roll session/OAuth crypto.

Dependency order: regression harness → config/session boundary → OAuth flow
and authenticated content → logout → documentation/full evidence → reviews.
Implementation, dependency mutations, tests and builds run sequentially.

## Ordered tasks and checkpoints

### 1. Capture failing HTTP regression and dependency foundation

Dependency: independent approval of this plan. Files: `tests/auth/*.mjs`,
`package.json`, `pnpm-lock.yaml`, conditional `pnpm-workspace.yaml`.

- [ ] Add Node test-runner harness that launches the built Next server on an
  isolated loopback port, owns cleanup, and asserts anonymous `/` redirects
  and `/api/session` returns 401. Run against the existing production build;
  retain concrete failing evidence before adding protection.
- [ ] Add exact Better Auth; inspect dependency changes/install scripts before
  execution, retain fail-closed lifecycle policy, generate the lockfile using
  pnpm, and verify a frozen install. Add tsx only if actually needed.
- [ ] Inspect pinned-library options and official references; record material
  incompatibilities for architect/spec review rather than weakening the spec.

Acceptance: regression fails for the current unprotected page, dependency
installation is reproducible, no unrelated dependency upgrade or blanket trust.

### 2. Close anonymous page and endpoint access

Dependency: task 1. Files: `lib/auth.ts`, `lib/session.ts`,
`lib/auth-policy.ts`, `proxy.ts`, `app/page.tsx`.

- [ ] Lazily validate canonical origin, Google credentials and a strong secret;
  missing/invalid configuration fails closed at request time, while build can
  run without secrets. Configure Google-only stateless JWE, one-hour expiry,
  disabled refresh, cookie state/account storage and secure transport policy.
- [ ] Implement exact public path/method policy and default full server session
  verification. Return page redirects, API/non-navigation 401s, and generic
  503 configuration/verification failures with private/no-store responses.
- [ ] Re-check the session in the home server component. Keep its existing
  heading-only markup. Extend HTTP regression for dotted/nested/unknown paths,
  RSC/prefetch/bypass headers and missing configuration.

Acceptance/checkpoint: anonymous requests cannot obtain protected content;
`pnpm run lint`, `pnpm run typecheck`, and `pnpm run build` pass. Run the
focused auth tests and retain failures for later OAuth routes as appropriate.

### 3. Establish Google sessions and endpoint proof

Dependency: task 2. Files: auth catch-all, `app/api/session/route.ts`,
`lib/auth-client.ts`, sign-in page/button; extend `tests/auth/*.mjs`.

- [ ] Mount only the specified auth paths/methods, retain library handler CSRF,
  state, PKCE and provider checks, and fix successful/error destinations to
  same-origin `/` and `/sign-in`. Reject unsupported providers and external
  callback destinations. Re-check the protected session endpoint server-side.
- [ ] Add accessible minimal Google button with pending/failure states. No
  session lookup hook, external assets, new server actions or extra home UI.
- [ ] Stub Google token/user-info/JWKS responses only at the outbound network
  boundary in a test-only Node preloader. Exercise real initiation/callback,
  library-issued valid sessions, malformed/forged/wrong-secret/expired cookie
  denials, state failures, cross-origin requests and disallowed methods/routes.
  No production bypass or alternate verifier is allowed.

Acceptance: a completed mocked Google flow grants both `/` and `/api/session`;
invalid sessions never do. Tests verify actual cookie attributes, absolute
expiry without an hour-long wait, redirects and no-store behavior. State any
library option uncertainty explicitly before changing the approved design.

### 4. End the browser session

Dependency: task 3. Files: sign-out page/button, auth handler if needed;
extend `tests/auth/*.mjs`.

- [ ] Require a session for `/sign-out` and sign-out POST, use the library
  handler, expire every auth cookie/chunk and navigate to `/sign-in`.
- [ ] Use the same cookie jar through sign-in, protected requests and sign-out;
  prove subsequent protected page/API requests are denied, GET cannot mutate
  logout, and cross-origin POST is rejected.

Acceptance/checkpoint: `pnpm run test:auth`, lint, typecheck and build pass;
expiry and browser logout match the documented stateless limit.

### 5. Configure, inspect the browser and record evidence

Dependency: task 4. Files: `.env.example`, `.gitignore`, README, AGENTS,
CLAUDE, `org/loop/config.yaml`; auth tests and verification/screenshots as needed.

- [ ] Document environment variable placeholders, random-secret generation,
  canonical HTTPS origin/local loopback exception, exact Google Web OAuth
  callback URI, `test:auth`, session expiry and copied-cookie revocation limit.
  Unignore only `.env.example`; append auth regression after production build
  in workflow acceptance. The standalone command starts its own built server.
- [ ] Run clean frozen install, `python3 -m unittest discover -s tests`,
  `pnpm run test:auth`, lint, typecheck, production build and native dependency
  audit. Record actual results and triage reachable high/critical findings.
- [ ] Verify sign-in and authenticated heading-only screens in an isolated
  real Chrome/browser (CDP via Node WebSocket or parent CUA) at 320 and 1440
  CSS-pixel widths using the test-network
  provider flow or a library-issued test session. Check document title/lang,
  keyboard controls, no overflow, console/network errors; save screenshots.
- [ ] Record evidence in `org/reviews/authenticated-access-verification.md`;
  run diff, plan-sync, message/memory/loop, ledger and staged secret checks.
  Coordinate commits and independent security/code review with orchestrator.

Acceptance: all required checks pass, screenshots are visually inspected, no
secrets committed, and review evidence is concrete. Real Google credentials,
consent configuration and a live Google round trip remain an explicitly
reported environment-dependent verification; mocked success is not live proof.
No merge, push, deploy or release is authorized.

## Risks and recovery

Rolling documentation can differ from pinned stateless behavior; inspect source
and test actual cryptographic session validation rather than cookie presence.
Google token material may exist in encrypted account cookies; request identity
scopes only, no refresh tokens, and verify bounded lifetime and logout deletion.
A test preloader must never be imported by production or enabled by application
configuration. Preserve all existing checks and tests. Spec changes require
architect/independent review, never silent relaxation. Shared Git metadata and
package downloads may require sandbox escalation; local store paths are not
repository defaults. Orchestrator owns review dispatch and human gates.
