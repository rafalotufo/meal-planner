# Authenticated access — verification evidence

## Baseline (before authentication implementation)

Date: 2026-11-23. Node v24.15.0; pnpm 10.33.0.

- `pnpm install --frozen-lockfile --store-dir /private/tmp/meal-planner-pnpm-store`: exit 0, 372 packages installed. Initial sandbox attempt failed DNS; approved network retry succeeded. Lockfile unchanged.
- `python3 -m unittest discover -s tests`: exit 0, 7 tests passed.
- Intent-turn `scripts/org_loop.py advance` executed all configured checks: Python tests, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`; each exit 0. Machine-readable results are in `org/loop/history.jsonl`.
- `git diff --check`: exit 0.
- `python3 scripts/org_message.py check`: 11 messages, 0 violations at capture.
- `python3 scripts/org_memory.py check` and `python3 scripts/org_loop.py check`: 0 violations.
- Intent capture staged secret scan: 0 findings.

These results establish the original application baseline only. Authentication runtime tests and browser evidence remain pending implementation.

## Workflow limits

The graph checker reports consistency. Its status display also warns about older approvals for reused gate names while new feature nodes are not started. Historical gate records are preserved; none is reused to approve this feature. New intent approval uses `intent-authenticated-access-001`.

## Implementation and reviewed scope amendments

The delivered policy requires Google sign-in plus current membership in the
administrator's server-only Gmail code list. The four owner-confirmed members
are in `lib/allowed-google-emails.json`; addresses are deliberately omitted
from this general evidence report and browser UI. Eligibility is enforced
before session creation and after every cryptographically verified session read.
Empty configuration denies everyone; malformed configuration is unavailable.
See the independent intent/spec/plan allowlist amendment records.

Better Auth 1.7.27 is the exact new runtime dependency. Its public types import
`bun:sqlite`, although this application runs on Node without a database.
Strict typecheck first failed with TS2307. Adding full Bun globals caused
incompatible Next `process.browser` and `ImportMetaEnv` declarations. Independent
amendment review approved exact dev-only `bun-types@1.4.5` and only its published
`bun-types/sqlite` declaration, alongside Node/React types. No runtime Bun,
shim, `skipLibCheck`, suppression or weakened test was introduced.

The pinned Google code-flow provider normally trusts the HTTPS token
backchannel and decodes its ID token. An adversarial transport fixture showed
that invalid-signature/audience tokens were otherwise accepted. The existing
Google user-info override now invokes the library's public
`verifyGoogleIdToken` helper before delegating profile mapping to the library.
This retains library crypto and verifies Google signature, issuer, audience,
expiry and essential identity claim types. The wrapper additionally requires
strict verified email and current exact Gmail membership.

## Tests-first evidence

Before application protection, `node --test tests/auth/access.test.mjs` exited
1 with both intended failures:

```text
anonymous home navigation requires sign-in: 200 !== 307
direct protected endpoint requires authentication: 404 !== 401
```

Before the allowlist implementation, the focused administrator-list HTTP
regression exited 1 because an unlisted signed Google identity returned `/`
rather than `/sign-in?error=1`. After the reviewed scope implementation it is
rejected without session issuance.

Independent review found a permissive configuration-syntax check. Added mixed
valid/invalid-list tests first; the focused test failed with `Missing expected
exception`. Tightened local-part grammar to reject semicolons and leading,
trailing or consecutive dots while preserving exact explicitly configured plus
tags. Focused pure policy tests then passed (3/3). No alias canonicalization.

The Node fetch API normalized a custom Host during an early test; raw Node HTTP
transport now proves a malicious Host returns 421. RSC redirect assertions
resolve Next's protocol-relative response location against the configured
origin. Adversarial provider tests use independent server processes to avoid
tripping the real library rate limiter; rate limiting is not disabled.

## Final installation and command evidence

Runtime: Node v24.15.0; pnpm 10.33.0. All pre-existing direct dependency and
dev-dependency versions were compared with the pre-feature manifest and are
unchanged. pnpm generated the lockfile. The existing strict dependency-script
allowlist was retained; added packages introduce no new install-script approval.

A clean install moved the previous `node_modules` into an owned temporary
backup, then ran:

```text
pnpm install --offline --frozen-lockfile --store-dir /private/tmp/meal-planner-pnpm-store
Packages: +393
clean_frozen_install_exit: 0
lockfile_unchanged: True
all_existing_direct_dependency_versions_preserved: True
```

The earlier repeat frozen install also exited 0 without lock changes. Store and
backup paths are local verification details, not repository configuration.

Final strict checks after the syntax correction and clean install:

```text
pnpm run lint: exit 0 (eslint . --max-warnings 0)
pnpm run typecheck: exit 0 (next typegen && tsc --noEmit)
pnpm run build: exit 0 (next build --webpack)
```

The final production build reports dynamic `/`, `/sign-in`, `/sign-out`,
`/api/session`, `/api/auth/[...all]` and a Proxy boundary. Builds need no
production secrets; request-time missing/invalid configuration fails closed.

`pnpm run test:auth` starts isolated real production servers and uses Node's
built-in runner. Its 11 tests exercise:

- Exact verified Gmail matching, trim/case handling, no dot/plus/domain aliasing,
  empty-list denial and malformed mixed-list unavailability.
- Absence of every configured address from all `.next/static` browser assets.
- Anonymous pages, unknown/dotted paths, nested APIs, RSC/prefetch/bypass-header
  variants and server-action POST denial.
- Arbitrary and malformed cookies; missing/short/unsafe authentication config;
  HTTPS Secure, HttpOnly, SameSite=Lax and host-only state-cookie attributes.
- Real Google initiation, state and PKCE, signed token/JWKS transport fixtures,
  actual callback/session issuance, heading-only HTML and protected API success.
- Signature, audience, issuer and token expiry failures; mismatched state;
  forbidden providers/options/destinations, Origin and request methods.
- Cryptographically valid but expired, wrong-secret, now-unlisted and unverified
  session claims; signed-token-only denial; one-hour absolute JWE expiry;
  no session cookie refresh; raw Host injection denial.
- Chunked session/account-cookie reads, deletion of every cookie on POST logout,
  cross-origin logout denial, and subsequent page/API denial with the same jar.
- Unlisted, unverified, string-verified, wrong-domain, plus and dot-variant
  signed Google profiles failing to obtain any application session.

The test-process preloader replaces only outbound Google token/JWKS transport.
Its success identity comes from the first real configured member; no fake
production member, alternate verifier, environment-selected fake user or
session-minting endpoint exists. Test-only library helpers re-encrypt session
fixtures to prove server-side expiry/current-membership checks. Production
never imports the fixture modules.

## Real browser evidence

`node --import tsx tests/auth/browser.ts` uses a new isolated headless Google Chrome profile
and the actual production build. Sign-in and authenticated screenshots were
captured at 320 and 1440 CSS-pixel widths and visually inspected:

- `org/reviews/authenticated-access-sign-in-320.png`
- `org/reviews/authenticated-access-home-320.png`
- `org/reviews/authenticated-access-sign-in-1440.png`
- `org/reviews/authenticated-access-home-1440.png`

Both widths have English document language, `Meal Planner` document title,
one visible heading, no horizontal overflow, and an accessible keyboard-focused
Google button. Authenticated body text is exactly `Meal Planner`. Real browser
logout clears access and redirects subsequent root navigation to sign-in.
Clicking the actual Google button completes the mocked provider authorization
navigation and real callback/session flow back to the authenticated page.
Only the test browser intercepts Google's authorization navigation; token/JWKS
responses are supplied by the isolated server's test transport fixture.

An initial real-browser check exposed an automatic `/favicon.ico` 404 after
login. Reviewed root metadata now declares a blank data-URI icon, avoiding the
unneeded request without adding an asset or widening public authentication paths.
Final Chrome results have no application console warnings/errors or failed
network requests. Screenshots contain no configured address or session data.

## Native audit and reachability

Both `pnpm audit --json` and `pnpm audit --prod` exit 1 with one moderate
advisory, zero high and zero critical findings: esbuild 0.18.20,
[GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99).
Full audit reports the existing Drizzle Kit development-tool chain. Production
audit also follows Better Auth's optional Drizzle Kit peer, so this must not be
reported as a zero-finding production audit or classified solely by manifest
placement.

The vulnerable behavior is esbuild's development `serve` feature. No selected
stateless authentication source uses Drizzle Kit or esbuild, and scans found
no `drizzle-kit`, `esbuild-kit` or esbuild 0.18.20 in the production server JS
or `.nft.json` traces. Runtime auth does not configure an adapter/database or
start an esbuild development server. No forced dependency override or unrelated
Drizzle upgrade was applied. Deferral is subject to independent security review;
retain the inherited review deadline of 2026-12-07 or before enabling that tooling/serve path.

## Process checks and limitations

`git diff --check` passes. Org message check reports 15 messages and zero
violations; memory and loop checks report zero violations. The current
`plan-authenticated-access-allowlist-001` gate record verifies. The lightweight
org YAML reader interprets colons inside block-sequence scalars as mappings,
even when quoted; the acceptance commands now use its supported flow sequence,
preserving all four existing commands and appending `pnpm run test:auth` after
build. No workflow parser changes or check reductions were needed.

Final staged secret scanning, active plan-sync, workflow turn records, commits
and independent code/security verdicts are orchestrator-owned and must be
recorded before handoff is complete. Human merge/release gates remain intact.

Actual Google OAuth credentials and consent-screen configuration were not
available. Mocked local success is not a claim of live Google account success;
a dedicated permitted Google account must complete the real provider round
trip in the configured environment. Browser logout cannot revoke copied
stateless cookies for a still-allowed user before their fixed one-hour expiry;
removing membership and activating the updated code does deny old sessions.

## User-requested TypeScript consistency

After the original HTTP/browser checks, the owner requested TypeScript for the
access matcher and every new application test/helper. The production matcher
is now `lib/google-access.ts` with explicit unknown-input and boolean/string-array
contracts. All files under `tests/auth/` are TypeScript, including the HTTP
server, Google network fixture and Chrome CDP helper. The isolated package
marker enables ESM without changing the application package's module mode.

Exact approved dev dependency `tsx@4.23.15` loads these tests through Node's
built-in runner: `node --import tsx --test tests/auth/*.test.ts`. Every test
remains in strict tsc checking; no any, ignored checks or excluded tests were
introduced. `allowImportingTsExtensions` is enabled with the existing `noEmit`
for explicit test-source imports, as supported by TypeScript. Both AGENTS.md
and CLAUDE.md now require TypeScript for new application tests/helpers and
retain existing Python workflow tests. Original pre-conversion commands above
remain historical evidence, not claims that bare Node ran TypeScript then.

Chrome verification now also captures Runtime.consoleAPICalled error/warn
events in addition to exceptions, browser log entries and network failures.
Final post-conversion check results are recorded below.

### Final post-conversion results

```text
pnpm install --frozen-lockfile --store-dir /private/tmp/meal-planner-pnpm-store: exit 0
pnpm run lint: exit 0
pnpm run typecheck: exit 0 (application and all test/helper TypeScript included)
pnpm run build: exit 0
pnpm run test:auth: exit 0; 11 tests, 11 pass, 0 fail/cancel/skip/todo
node --import tsx tests/auth/browser.ts: exit 0
python3 -m unittest discover -s tests: exit 0; Ran 7 tests; OK
```

The final TypeScript suite retains every HTTP, cryptographic and membership
assertion from the earlier JavaScript form. It additionally asserts that the
production CSP has a nonce and never includes `unsafe-eval`; the development
policy permits it only when `NODE_ENV === 'development'`, as required by Next.
Chrome captured Runtime console error/warn events, browser log entries,
exceptions and failed network requests; the final error collection is empty.
Both final-width screenshot sets were regenerated from the unchanged production
behavior after conversion. Live Google credentials/consent remain unverified.

## Orchestrator final checks

Implementation turn 4 reran all five configured acceptance commands after the TypeScript conversion; every command exited 0. Staged secret scan: 0 findings. Staged diff check: exit 0. Active-plan hook check: exit 0 after matching its required exact `Status: Approved` metadata format and escaping the catch-all's literal opening bracket with fnmatch `[[]`. These are metadata-only corrections; no planned application scope changed.

The legacy plan checker prints the first approved record for a reused gate name (the historical home-page approval). Its manifest check passes, but that old approval is not evidence for this feature. Separately verified `plan-authenticated-access-typescript-001` with `--require-committed`: exit 0, current plan path, reviewer and commit beece7e. Current intent/spec/plan amendments have distinct append-only gate records.

Message check: 16 messages, 0 violations at this checkpoint. Memory and loop checks: 0 violations. Independent code review approved (`code-authenticated-access-001.md`) and security review clear (`security-authenticated-access-001.md`). Root also visually inspected all four mobile/desktop screenshots. Remaining human merge/release gates and live Google environment check are unchanged.

Final bounded loop completed six turns with `status: solved`. Security turn 5 and independent review turn 6 each reran Python tests, lint, strict typecheck, production build and auth tests; every exit was 0. Implementation commit: `a2f015d`. The workflow graph now places implementation at `in_review` for the human `code_owner_approve` gate; no merge approval or release authorization was created or reused.
