---
artifact: recipe-search-main-integration
reviewed_at: 2026-11-23
reviewer: merge-reviewer
verdict: approved
---

# Recipe search and authenticated main integration review

Independent integration review of recipe-search/photo branch HEAD `1b71017` with
main `d5f1583`. Prior whole-feature code/security reviews remain applicable;
this report assesses their integration, not production release readiness.

## Reviewed behavior

- The server home component awaits `requirePageSession()` before rendering the
  recipe-search client. The recipe POST route calls the existing `readSession`
  eligibility verifier before invoking the handler, returns anonymous `401`,
  and fails closed with generic `503` on session exceptions. No identity,
  allowlist or credentials are passed to client props or provider requests.
- Proxy canonical-host checks, public exceptions, session gating, no-store,
  nonce scripts, same-origin connections, anti-framing and referrer policy are
  preserved. Its only integration change permits `https:` in `img-src`, needed
  for direct external recipe photos. This grants image loading only; scripts
  and fetch connections remain constrained. Recipe image URL validation and
  `no-referrer` image attributes remain in place.
- Recipe provider, source validation, bounded metadata transport, pinned
  public DNS/TLS behavior, concurrency/deadline budgets and fallbacks are
  unchanged from the previously approved recipe branch.
- Both pnpm migration and exact package versions are retained. The generated
  pnpm lock differs from main by the two reviewed photo dependencies and six
  transitive packages, with no existing dependency pins changed. There is no
  new lifecycle-script approval. Existing auth audit deferral remains documented
  in `security-authenticated-access-001.md`; this review does not claim zero
  production advisories.
- HTTP regressions cover anonymous/spoofed requests, allowed query validation
  without paid calls, and tampered/expired/removed/unverified sessions. Browser
  QA uses test-only Google transport plus browser-intercepted recipe results
  and real publisher HTTPS image loading, with separate integration evidence
  paths. Production code gains no test session/provider mode.

## Verification

Independently ran `pnpm test`: exit 0, 57 passing recipe TypeScript tests,
zero failures/skips/cancellations. `git diff --check` for application, recipes,
auth tests and dependency files passed. The author reports the new CSP
regression failed against the unchanged authentication CSP (11/12 tests pass),
then added only HTTPS image permission. Independently transpiled the actual route in memory and stubbed only its session
and recipe-handler boundaries. Anonymous sessions returned 401 without invoking
recipes; allowed sessions reached the handler; session exceptions returned 503
without another handler call. Inverting the route's session negation in an
in-memory copy made the same assertions fail (200 instead of 401). Tracked
source/build files were untouched.

The orchestrator reports the final combined tree passed frozen pnpm install,
57 recipe tests, 12 authentication tests, seven Python workflow regressions,
lint, typecheck and production build, all exit 0. Staged secret scan and
plan-sync hook also exited 0. Its isolated real-Chrome QA passed at 320 and
1440 CSS pixels: authenticated recipe form and fixture result cards, real HTTPS
500-by-500 publisher photo, no horizontal overflow, logout and mocked Google
button flow, with no console/network errors. The orchestrator visually inspected
both result screenshots. These are explicitly author/browser reports, not
independent reruns of the same commands by this reviewer. The browser response
fixture proves integrated rendering/CSP, not live recipe discovery or a real
Google consent round trip.

No application edits were made by this reviewer. Org chain/history conflict
resolution is handled separately by the audit integrator.

## Verdict

**Approved; integration security clear.** No required integration finding
remains. The appended recipe-photo spec/plan amendments correctly describe the
protected endpoint, HTTPS photo policy, retained pnpm workflow and separate
verification evidence. The code and tests fit the existing shared boundaries
without weakening source retrieval, session eligibility or dependency policy.

Historical feature reviews and documented dependency deferrals remain in force.
Audit-chain reconciliation is separately owned by the audit integrator. This
verdict approves the scoped integration and its spec/plan amendment; it does not
perform a merge, authorize deployment, grant a release approval or claim a real
Google/LLM round trip.
