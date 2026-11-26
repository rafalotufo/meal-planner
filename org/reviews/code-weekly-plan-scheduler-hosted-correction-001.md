# Own-deployment scheduler Host correction — independent code review

- Reviewer: reviewer, independent of implementer
- Date: 2026-11-26
- Fixed source: f8383f3dbfc14b4ab3b2cfdd3c648d6abc3d06a9
- Design: hosted-target-correction.md, approved independently in1ebdab3/65e504f
- Verdict: **Approved for authorized exact-source isolated Preview validation and human review**
- Blocking code findings: none

## Correctness and trust boundary

The runtime diff is confined to lib/plans/scheduler.ts. Its small validator
accepts only nonempty lowercase ASCII DNS metadata with valid1–63character
labels, alphanumeric ends, at most253characters and a deployment label before
the.vercel.app suffix. Schemes, ports, credentials, paths, query/fragment,
whitespace, uppercase, Unicode, wildcard and empty/oversized labels fail closed.
Missing metadata returns503 even for the stable service Host.

The suffix check applies exclusively to trusted server VERCEL_URL syntax.
Incoming requests use exact equality with the fixed configured service hostname
or that one validated own hostname. There is no incoming suffix/wildcard rule,
forwarding-header authority, guessed fallback or project setting override.
The new behavior addresses the observed native generated-host mismatch directly.

Existing fixed project/environment/service/browser-origin/Wednesday guards,
independent constant-time bearer check, exact target/body/method rejection,
private/security headers, no-cookie authority and error redaction remain intact.
No Proxy/browser/menu/Better Auth policy, deadline/lifetime behavior, database
core/schema/grant, dependency/provider or recipe-selection change is introduced.

## Verification assessed

The new tests first reproduced own generated Host421 instead of401 and missing
metadata200 instead of503. After correction, Preview/Production stable and own
Hosts, wrong/no tokens, all methods, foreign generated Hosts, forwarding metadata,
query rejection and malformed metadata are covered. Concurrent due requests now
span both accepted Hosts while preserving one created/final plan and closed pools.

Compiled HTTP tests exercise both service Hosts and reject another deployment.
Ordinary generated-host pages/menu/session/sign-in remain421, including exact
menu guards. Compiled source-less packaging exercises both service Hosts.
The API route, same bounded waitUntil promise and cancellation settings are
unchanged from the reviewed implementation.

Independent reviewer checks:

- Six pure scheduler boundary/target/calendar/Host/metadata tests passed.
- Two real built HTTP Host/metadata regressions passed using owned local servers.
- In an owned temporary source copy, replaced exact own-Host equality with
  incoming.vercel.app suffix acceptance: the foreign-generated-Host test failed.
- In that copy, removed mandatory validated metadata: the missing/malformed
  metadata test failed. Both failures were assertions, not loader/DB errors.
- Shared files were never mutated for these correction checks; the temporary
  copy was removed. No paid call or hosted/Production operation was performed.

Reviewed the developer's final local record:337Node/7Python tests, required
lint/typecheck/build, plan/source-less packaging, real Chrome320/1440 and audit
results pass. Full suite/browser runs belong to that record; this reviewer does
not claim rerunning all. New screenshots preserve original evidence and use a
correction-specific prefix. Active docs distinguish stable origin from exact
platform-owned generated Host and forbid system-variable overrides.

## Scope and remaining gates

This approval permits only the existing authorized local/staging correction
scope. New exact-source Preview evidence must actually exercise both inspected
HTTPS origins and distinguish platform interception from app responses. Runtime
VERCEL_URL attribution, ordinary generated browser421, rollback-only storage,
preservation and cleanup remain required staging checks.

The first7fe release failed and was safely rolled back to GL3g; its authority is
consumed. This approval grants no new Production configuration/build/promotion.
Fresh corrected-source/profile staging acceptance and owner release authority
remain necessary. Candidate service401 and registered cron-host equality are
future release checks, not completed observations. Unattended Wednesday delivery
and actual cloud disconnect behavior remain unobserved.
