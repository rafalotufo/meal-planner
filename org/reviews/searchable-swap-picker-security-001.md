# Searchable swap picker — independent security review

- Reviewer: security-researcher
- Date: 2026-11-24
- Status: **Final independent security assessment complete.**
- Exact reviewed root source: `b0627be7e2e65eed7061c4cbb1bb4182ed436a52`.
- Inputs: org protocol/security-researcher role, REVIEW.md, security-and-hardening skill and approved `intent/searchable-swap-picker/{intent,spec,plan}.md`, including explicit Unicode-lowercase clarification.
- Reviewed private source: `/private/tmp/meal-planner-swap-modal-qa-3jajuef1/project`.
- Final verdict: **CLEAR. No material bug, security or compliance findings.** Final source review and recorded complete verification satisfy this bounded assessment. Human merge/release remain separate; no hosted access, migration, deployment or scheduler authority is granted.

## Trust boundaries and early review

Assets are family menu confidentiality, current admission, intended swap target/revision, suggestion correctness and browser privacy. Boundaries are query/cursor → protected menu read; persisted recipes → validated response/page/image; asynchronous GET → current dialog page/selection; and explicit confirmation → captured protected plan mutation. Abuse cases include foreign cursors/family injection, SQL wildcard/injection, oversized/malformed pages, stale asynchronous results/selection, wrong-slot submission after refresh/reopen, duplicate POSTs and unsafe thumbnail retrieval.

**Bugs:** Source inspection finds full-menu search combined with existing family/cursor predicates before LIMIT51; omitted/blank search preserves existing listing. Native dialog instances capture the opened target. Query/page resets synchronously clear selection/page and invalidate/abort older work; effect tokens guard success/error/finally after response parsing.512KiB response counting, fatal UTF-8, JSON-as-unknown and strict canonical page validation precede rendering. A current selected visible unplanned entry is required before explicit submission. Parent inFlight plus dialog submitting guard prevents repeated confirmation; unmounted-instance completion cannot dismiss a reopened keyed instance. No material finding at this stage; runtime race/browser evidence is still pending.

**Security:** Search parser enforces well-formed trimmed100-code-unit text without controls. SQL binds its literal substring, uses static schema-qualified ICU lowercase on both operands and retains existing cursor collation/order. Current family derives from requireMember; arbitrary well-formed cursor cannot escape that predicate. Menu exact-handler JWE/session-token identity binding, canonical Host, admission/family checks, protected405/private/security headers remain unchanged. POST save/lookup query rules remain strict. No owner/configuration field is added. Response IDs/sources/order/cursor/shape/count are checked; titles/statuses use React text. Thumbnails use validated saved URLs through unoptimized lazy browser Image with no-referrer and URL-scoped fallback; no optimizer/server photo/provider effect or sample image asset is added. Existing planning store remains authoritative. No material finding at this stage.

**Compliance:** Native named/described dialog, initial search focus, explicit selection/confirmation and captured plan/revision/slot follow the approved contract; GETs cancel on changes/dismissal and have12-second deadlines. Background selection does not itself POST. The ICU clarification introduces no schema/configuration change or fallback; hosted collation support remains an explicit read-only pre-release compatibility check without present hosted authority. No dependencies, migration, authentication/public-policy/Proxy or deployment change was found. No final compliance verdict before completed browser/full checks.

## Independent preliminary evidence

- Private Node24 `node --import tsx --test tests/menu/validation.test.ts`: exit0,8 passed, including bounded query/Unicode and exact canonical response-page checks.
- Byte comparison to original source: `lib/menu/http.ts`, `lib/menu/body.ts`, `lib/plans/store.ts`, `lib/session.ts`, `lib/auth-policy.ts`, `proxy.ts`, `vercel.json`, package.json and lockfile unchanged.
- Read current menu store/GET/validation, native dialog and parent controls. No source edits, build/typegen, dev-server or hosted/data operation performed by reviewer.

## Original staged-review handoff

The early review deferred frozen-source changes, actual async/browser/full-suite evidence and exact root-source binding. Those checks are completed below; early independent findings and command evidence remain preserved.

## Final frozen-source assessment and evidence

Independently resolved the root commit above and compared every one of the23 paths in the root-owned private `copyback-hashes.json`: original working bytes, committed bytes, frozen private bytes and recorded SHA256 all match. This includes every changed runtime source, validator, test and supplied screenshot/evidence. Final differences from the preliminary review are the stricter `Array.from` sparse-entry validation, stable effect-counter cleanup and short-mobile/44px-close layout corrections; these introduce no additional trust boundary or material finding.

Key frozen runtime SHA256 values:

| File | SHA256 |
| --- | --- |
| app/api/menu/route.ts | 7fcbc286c37a9b87e02a2c7a3448d70fa8bf56b70834dd7f14aaff3275f0e8d1 |
| lib/menu/store.ts | 53005988ccb145ed40d604b237f532c6e473080f6e4d32fdee62fbb79824c6f3 |
| lib/menu/validation.ts | 8b04ae4eaf8fc755a39d47e40b0aa591488da0afee03a2b3a9870f21ec497a4d |
| app/plans/plan-controls.tsx | 0696a46c028a5cac52d5aec5333dae0cf9699362409a107be594423cde15a3e7 |
| app/plans/swap-recipe-dialog.tsx | 2bc9adb4399a8c75c373be67c80b2d0f13e8791b8942686476ba187cf4eac934 |

Final Bugs/Security/Compliance passes find no unresolved issue. Query/page changes discard selection and cancel superseded fetch/reader work; monotonic version checks cover success/error/finally, including post-fetch pending bodies. Captured target/revision and keyed alive-instance checks isolate reopened dialogs; global inFlight remains held until the original mutation settles. Dismissal does not claim mutation rollback. Network pages fail closed on byte/UTF8/JSON/shape/order/identity/cursor errors. Safe image display remains browser-only, unoptimized/no-referrer with fallback. Search remains a current-family, bound literal read with unchanged exact guard/private/security headers and no write effect. The ICU clarification uses only the existing static collation and keeps ordering unchanged; its hosted compatibility check remains a pre-release obligation, not assumed evidence.

Independently reran final original-source Node24 `node --import tsx --test tests/menu/validation.test.ts`: exit0,8 passed, including sparse direct-caller regression. `git diff --check b0627be7e2e65eed7061c4cbb1bb4182ed436a52`: exit0. Inspected actual final menu/browser logs: menu39/39 and both browser pass summaries covering malformed/oversized/invalidUTF8 responses, access/retry, delayed-header/body supersession, GET close/reopen, real-POST delayed completion isolation and captured-stale409 recovery.

Read complete current verification.md and orchestrator results: final private lint/typecheck/build exit0; recipes82+family34+menu39+auth16+plans20+deployment32 =223 distinct Node tests passed, with planning/deployment repeated on the final build; Python7/7 exit0. Chrome320/1440 and320×568 covers native keyboard/focus/dismissal, explicit one-POST selection, full-menu search/pages, saved/null/broken thumbnails, practical footer, preserved uniqueness/retention/history and no-date behavior. Developer inspected all four modal screenshots. These full-suite/build/browser/visual observations are attributed to recorded developer/orchestrator evidence, not claimed as independently rerun by this reviewer.

Only this report was edited by this reviewer. The user-modified next-env.d.ts, live server/cache, development/hosted data and private configuration were untouched. No new dependency/release advisory audit was needed for this unchanged dependency graph and unreleased feature. Final clearance applies to this exact source; subsequent source changes require reassessment. No material finding remains.
