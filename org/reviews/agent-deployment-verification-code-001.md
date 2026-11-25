# Agent deployment verification — independent code review 001

- Reviewer: reviewer; date: 2026-11-25
- Reviewed source: `e7f1d08..5ab8906`; production correction through `f0db7c6`
- Inputs: approved intent/spec/plan, implementation evidence, actual application,
  SQL/catalog/operator/helper/test changes and code-security001
- Verdict: **No blocking or required findings; approved for local delivery and
  human merge consideration, subject to completing the root's final verification.**
- This review grants no merge, push, hosted migration/configuration/data,
  provider-spend, deployment or release authority.

## Assessment

Applied the code-review-and-quality skill's correctness, readability, architecture,
security and performance axes and `REVIEW.md` bugs/security/compliance passes.
Reviewed the regression intent before the implementation and checked callers and
independent guards. No cosmetic findings are raised.

- **Target and admission:** `lib/verification/target.ts:18–27` binds immutable
  enabled Preview policy to current project/deployment/source/profile/origin/DB
  metadata, with explicit Production rejection. The session adapter uses the raw
  opaque credential and current database admission, not injected identities;
  `store.ts:10–25` rechecks session/run/member/family and target bindings.
  `lib/identity-access.ts` retains Google-only verification and validates malformed
  Google lists on synthetic admission too. Family context remains server-derived.
- **Browser entry and input:** exact enabled GET/HEAD entry receives a signed
  Proxy nonce and matching HttpOnly cookie; incoming nonce headers are overwritten.
  The page reads that value rather than setting cookies during render. The narrow
  same-origin Referrer-Policy correction preserves exact POST Origin rejection
  instead of accepting Origin:null. `lib/verification/http.ts:26–44` independently
  covers canonical Host, target, method, content bounds, CSRF, throttles and
  private/security headers for the exact Proxy-exempt API on every method.
- **Deadline and transaction correctness:** the request-owned initial catalog
  read, body handling, throttle and exchange share an absolute deadline.
  `lib/db/connection.ts` owns connection destruction, server timeouts and
  post-expiry query rejection, including late acquisition and client error events.
  Existing default transaction paths remain unchanged. Real no-EOF, lock, delayed
  callback and pool-recovery tests verify meaningful consequences beyond a mocked
  response race. Lost COMMIT responses remain explicitly ambiguous; exchange is
  not advertised as safely retryable.
- **Preserved family effects:** typed central member resolution is used in menu,
  family and plan stores. Mutations recheck admission under the common advisory
  lock. Menu independently binds raw opaque digest/token/principal while retaining
  Google's exact JWE/current-token/subject/email branch. Synthetic provisioning,
  invitations, URL-curation delegation and plan finalize/resolve are denied
  server-side; global plan generation filters synthetic families. Page/client
  boundaries pass bounded views and family IDs rather than credentials or the
  synthetic principal object.
- **Credential lifecycle and operator scope:** capabilities and sessions are
  high-entropy digests with fixed expiry and current revocation. Conflicting
  credentials deny admission; logout separately extracts only one valid opaque
  token for targeted revocation, including a stale Google-cookie conflict.
  Operator issuance checks the recorded Preview target and TLS and writes an
  exclusive private handoff. The optional seed is fixed, opt-in owned data with
  no provider/image effects. Cleanup first revokes and then rejects cross-family
  plan relationships in both directions. The independently found logout/cleanup
  findings are fixed and have concrete regressions; neither is unresolved here.
- **SQL/history/privileges:** both native descriptors and the additive predicate
  correction preserve all legacy SQL, descriptors, profiles and independence
  declarations. SQL branch checks and composite FKs distinguish Google from
  synthetic rows; broad table ACLs are removed before restricted column grants.
  The strict catalog contract and runtime metadata checks remain intact.
  Correction/dump-restore tests preserve the initial native ledger identity/data;
  older application artifacts are explicitly incompatible rather than safe
  rollback targets. Test rollback is gated to owned random restricted-role
  disposable databases, empty verification infrastructure and exact descriptors.
- **Test/packaged boundaries:** `tests/verification/server.ts:58–82` copies real
  Proxy and metadata into an owned local build, can remove only that copy's source
  after build, and permits only the bounded old logout-route override for a RED
  reproduction. No application module imports this helper or a hosted-selectable
  test bypass. Real Chrome uses the native form and server-set cookie; local
  platform metadata/TLS simulation is clearly attributed. Credentials are not
  printed or included in screenshots. Broader trace privacy remains operational.
- **Evidence and maintainability:** the synthetic validator accepts only bounded
  typed observations for exact run/member/source/profile and cannot set Google
  flags or release acceptance. Legacy Google finalization rejects opaque cookies.
  Missing browsers, hosted ingress/pinning, providers and remote private handoff
  remain explicit gaps. Changes are feature-owned modules and reviewed small
  commits; no new dependency or suppression was added. Admission adds bounded
  database work and exchange uses shared throttles; no new unbounded private-list
  query or background-job eligibility was found.

## Independently executed evidence

- `node --import tsx --test tests/verification/cookies.test.ts tests/verification/target.test.ts tests/deployment/staging.test.ts`:
  **24 passed, exit0**.
- Isolated temporary-copy mutation experiment: original target tests **2 passed,
  exit0**; removing the runtime Preview/Production guards made the copied-settings
  Production-denial test **fail, exit1**. Only private temporary copies changed;
  they were removed afterward. Application/test source was not modified.
- `node --import tsx lib/db/verify-runtime-metadata.ts`: **exit0**, reviewed SQL and
  journal match runtime metadata.
- Read-only JSON comparison: all5 historical descriptors, all8 historical schema
  profiles and both independence entries remain unchanged; two native descriptors
  and two reviewed profiles are added. Historical0000–0004 SQL diff is empty.
- `git diff --check`: **exit0**.

Root-reported full legacy suites, real Chrome390/1440, corrected Proxy transport
and stripped-runtime packaging are separate delivery evidence; this reviewer did
not rerun or relabel them as independent results. Final fresh lint/typecheck/build,
new suites and full deployment results were still being collected at handoff.
No hosted or paid-provider request was made during this review. Local approval
cannot certify the uninspected live ingress, Firefox/Safari or Google OAuth gaps.
