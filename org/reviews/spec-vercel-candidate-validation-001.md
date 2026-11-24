---
artifact: intent/vercel-candidate-validation/spec.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Independent specification review — isolated staging validation

## Verdict

Approved for implementation planning, with no blocking findings. This review
assesses the design against the accepted isolated-staging intent; it does not
verify hosted feasibility or authorize implementation, Google/Vercel settings,
deployment, database effects, promotion, project resumption or release.
No implementation plan exists yet, as expected at this gate.

## Three review passes

### Bugs and contract fidelity

The design preserves the existing single-origin application rather than changing
its trust model. `proxy.ts:12–14`, `lib/auth.ts:33–35`, `lib/http.ts:6` and
`app/api/auth/[...all]/route.ts:19,43,50–52` support using a separate Preview
canonical origin and exact registered callback without an application refactor.
The original `tests/deployment/smoke.ts` candidate/anonymous modes remain intact.

Required status and payload checks match current implementation:

- Anonymous root307/sign-in200 and protected API401 follow `proxy.ts:27–31`;
  no-store headers come from the proxy and `lib/auth-policy.ts:1`.
- Member session200 with `{ authenticated: true }` matches
  `app/api/session/route.ts:6–7`. Family GET calls the real family context and
  returns `{ members, invitations }` through `lib/family-store.ts:19–31`, so
  the helper must validate this existing shape without retaining personal data.
- A valid member search with missing provider key produces503 and nested
  `error.code: SEARCH_UNAVAILABLE` (`lib/recipes/search.ts:12,22–24,90–94`).
  The optional missing-key check is not recipe/provider success evidence.
- Expired/unprovisioned sessions cannot count as a member pass
  (`lib/session.ts:14–27`). Fresh real Google login is separated from one-hour
  nonrefreshing session reuse (`lib/auth.ts:59–65`).

Spec lines97–130 require cooperative serialization, metadata freshness, pre/post
mapping checks, bounded transport and no redirects; their stated limitations
avoid claiming that a moving alias is an immutable artifact. Preview proof is
correctly separated from the later Production build and post-promotion checks.

### Security

Read the independent security assessment in
`org/reviews/security-vercel-candidate-validation-design-001.md`; its approved
verdict is consistent with the inspected code and this design. The helper accepts
private input only after exact target/origin checks, never forwards credentials
to arbitrary destinations, and emits sanitized bounded evidence. Vercel bypass
is correctly treated as project-wide platform authority, confined to the staging
host and excluded from WAF/bot/rate-limit proof (spec lines135–178).

Preview uses separate auth/client secrets and the recorded restricted Preview
PostgreSQL target. Production credentials/data, hosted fixtures and paid-provider
keys remain excluded. Existing verified-email callback writes and one-time real
household provisioning are expressly identified as separately authorized effects
(spec lines180–190); automated cleanup/reset is forbidden.

### Compliance and operational boundaries

The specification follows the owner's isolated-staging choice and accepted intent.
Local changes stay within a strict-TypeScript operator helper/tests and runbook;
there is no auth/proxy rewrite, dependency/schema change or hosted fake identity.
Manual pinned CLI Preview operations, Hobby-only resources, no Git integration,
unchanged Production-domain set and existing merge/release gates remain explicit.

The free stable alias mechanism is conditional, not a confirmed account capability.
Spec lines81–95 expressly require complete domain enumeration and safe non-Production
classification; unknown behavior stops setup. This is an appropriate operational
prerequisite, not evidence that an arbitrary free alias is safe. Project state,
protection and effective Preview variables also remain preflights; this review
cannot authorize resuming a paused shared project to obtain a staging pass.

## Evidence and limits

Read active loop state, accepted intent, draft specification, security assessment,
current auth/session/proxy/API/provider contracts, existing deployment helper,
runbook/spec, upload exclusions and recorded Neon targets. `git diff --check`
passed. No application code changed, and no browser, Google login, account setting,
hosted HTTP, database, install or application-build verification is claimed.

Official primary references checked 2026-11-24:

- [Vercel environments](https://vercel.com/docs/deployments/environments): Preview
  isolation, first-deployment Production behavior, and separate staging resources.
- [Vercel aliases](https://vercel.com/docs/cli/alias): manual assignment versus
  ordinary project domains automatically assigned to Production.
- [Vercel deploy](https://vercel.com/docs/cli/deploy): inspect target/branch metadata;
  account/pinned CLI behavior still needs the specification's operational proof.

No substantive document edits were needed. Implementation planning must retain
these preflights and prove the bounded helper behavior through meaningful strict
TypeScript tests before operational setup is considered.
