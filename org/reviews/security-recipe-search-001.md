---
artifact: recipe-search-implementation
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: changes
round: 1
---

# Recipe-search independent security assessment

## Finding

**[MED — availability] Bound and cancel the request-body read.**
`lib/recipes/search.ts:26`–`:48` awaits the streamed body with no deadline or
abort listener. The handler does not start its timer/listener until `:80`–`:83`,
after `await readQuery(request)` at `:73`. Therefore a client that sends fewer
than 8 KiB and does not finish the body holds a handler outside the advertised
request deadline and usage admission guard. Caller cancellation also cannot
settle that read independently. The body-size cap limits bytes, not duration.

A TypeScript reproduction at `/private/tmp/recipe-body-abort-repro.ts` used the
real compiled handler, a body containing an incomplete JSON object, a 10 ms
configured deadline, and caller abort at 5 ms. At 50 ms the handler was still
unresolved; zero provider calls occurred. It returned 504 only after the repro
manually completed the body. This is a bounded availability correction, not a
claim that credentials or paid-provider limits were bypassed.

Start a request-scoped deadline before reading the body, propagate caller abort
to an abort-aware reader, cancel pending reads on timeout/abort, and release
read locks/listeners/timers in every exit. Preserve the two-call shared budget
and post-validation paid-work rate/concurrency semantics. Add TypeScript
regressions for an unclosed body reaching the deadline and a caller abort during
body reading; both must settle promptly without creating/invoking the provider.
A correction and independent rereview are required before security clearance.

## Threat model and controls checked

Assets: server API key, paid-provider quota, visitor query confidentiality,
recipe/source integrity, and service availability. Boundaries: public HTTP
request → handler; handler → OpenAI; retrieved page/model output → parsed
candidate/curator records; validated records → browser text/links/images.

- **Public paid endpoint:** no user account is required by scope. Origin checks
  (`search.ts:68`) prevent ordinary foreign-origin browser submission; they are
  explicitly not authentication. Two active searches and twenty accepted per
  rolling minute are enforced by the module-scoped handler (`:63`, `:75`–`:79`),
  with slot cleanup (`:94`–`:98`). The identified body-read gap precedes them.
- **Secrets/data disclosure:** `server.ts:1`–`:9` reads environment credentials
  behind `server-only`. `openai.ts:168`–`:170` sends the key only in the fixed
  HTTPS endpoint's Authorization header, never the prompt. Both calls set
  `store: false`; errors map to stable generic bodies (`search.ts:6`–`:24`).
  No query/result persistence or full prompt/response logging was found.
- **Tampering/injection:** user text and retrieved content have no executable
  app tools. Model JSON is parsed as unknown; source URLs require native
  citation membership and safe syntax, candidates receive server IDs, and
  curator method/time/photo evidence stays within that candidate
  (`openai.ts:89`–`:144`). These checks cannot establish original-source truth;
  the separately pending live evaluation remains necessary.
- **XSS/SSRF:** recipe strings render through React text. Links use
  `noopener noreferrer` (`app/recipe-search.tsx:23`–`:30`). URL validation rejects
  credentials, non-HTTPS, ports, literals/local hosts and controls
  (`validation.ts:7`–`:24`). Only the fixed provider endpoint is server-fetched.
  Unoptimized images load directly in the browser with no-referrer and fallback
  (`app/recipe-search.tsx:14`–`:19`); no arbitrary server image/source proxy was
  introduced. External image hosts still receive ordinary browser requests.
- **Resource limits:** provider bodies have a 1 MiB streamed cap, research text
  is capped at 20,000 characters, results at six, researcher tool calls at eight,
  and research/curator output tokens at 5,000/3,000 (`openai.ts:91`, `:147`–`:181`).
  There are two fixed calls with no retries or autonomous recursion.

## Dependency and release decisions

Independent `npm audit --omit=dev --json` exited 0: zero production findings.
`npm audit --json` exited 1: four moderate, zero high/critical, unchanged
Drizzle Kit → esbuild-kit → esbuild development-only findings. No dependency or
lockfile changes were introduced by this feature. The upstream
[esbuild advisory](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99)
affects its development-server cross-origin response exposure through 0.24.2;
0.25.0 fixes it. This app's Next commands do not start that esbuild serve path.
Preserve the existing deferral: senior-developer rechecks by 2026-12-07 and
before enabling Drizzle tooling or release; do not apply the proposed breaking
Drizzle downgrade automatically.

Public release still requires operator decisions for shared multi-instance
traffic limits, spending controls, and public TLS/security headers. A local GET
returned 200 with no CSP/HSTS/X-Frame-Options/X-Content-Type-Options/Referrer-Policy;
`next.config.ts:3` remains the preexisting empty config. This local implementation
assessment does not approve that configuration for public deployment. Header
policy should be verified at the eventual hosting boundary, including a CSP
compatible with intended recipe image loading. No release is currently in scope.

## Independent verification and limits

- `npm test`: exit 0; 21 tests, 21 pass, zero failures/skips/cancellations.
- Targeted body-read/abort repro: above unresolved-at-50-ms result, no provider.
- Secret scan on application/service and recipe test files: exit 0,
  `scan_secrets: 0 finding(s)`; `.env`/`.env.*` remain ignored.
- `git diff --check`: exit 0. Read approved intent/spec/plan, org rules,
  implementation diff from `0bc1b139` through `382cd35`, current code, and
  orchestrator's automated/browser evidence.
- Build/lint/typecheck and real-browser evidence were read from the recorded
  verification; those checks were not independently rerun in this assessment.
- No paid API calls, credentials printed, code/config edits, dependency upgrades,
  merge, release, or gate/status/ledger mutations. Live retrieval/source fidelity
  remains explicitly unverified. Final staged scan remains the orchestrator's
  checkpoint responsibility.
