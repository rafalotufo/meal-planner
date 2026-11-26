# Hosted weekly scheduler — independent security design review

- Reviewer: security-researcher
- Date: 2026-11-26
- Reviewed source: `2fb7e5d960f7a4fc9fd4d4fa53f18e677fb8e1a6`
- Artifacts: `intent/weekly-plan-scheduler/intent.md`, `spec.md`, `plan.md`,
  `design-notes.md`; existing generator/connection/Proxy contracts
- Verdict: **Approved for implementation and scoped staging verification**
- Scope: design assessment only; no code, Production mutation or release approval

## Resolved design decisions

The owner selected native Vercel Hobby cron, accepted its one-hour delay, and
changed the weekly target to Wednesday09:00 America/Toronto. The final design
uses weekly UTC13/14 Wednesday expressions plus trusted Toronto due checks.
The first due delivery may occur09:00–09:59; the extra summer10EDT invocation
is explicitly documented as a later reconciliation opportunity. This resolves
the original unselected timing gate; it does not promise an exact-minute SLA.

The final `spec.md:61`–87 resolves the security host contract. This review
explicitly approves **only the machine route's** fixed Production canonical
service origin `https://meal-planner-rafalotufos-projects.vercel.app`, independent
of the unchanged browser origin `https://lotufo-meals.vercel.app`. Preview uses
its one fixed staging canonical origin. Runtime must reject other configured
origins, require the exact existing Vercel project and environment, verify
matching browser-origin configuration and authenticate the dedicated bearer.
No wildcard host, forwarded header, cookie or arbitrary `VERCEL_URL` is trusted.

Official [cron documentation](https://vercel.com/docs/schedules/cron-jobs/manage-cron-jobs)
identifies the production domain as the invocation target; the
[system-variable documentation](https://vercel.com/docs/environment-variables/system-environment-variables#vercel_url)
describes a generated deployment hostname. Secure origin validation alone does
not prove native routing. The inspected automatic production alias is a
concrete narrow service boundary; release must reinspect the registered target
and observe the first actual native request. A mismatch requires reviewed
correction, never extra alias acceptance or a fabricated pass. This remains a
release observation obligation rather than an unresolved implementation design.

No blocking security finding remains in this fixed design. The earlier pending
verdict is preserved in Git history; this revision supersedes it after the
actual owner amendment and concrete service-origin specification.

## Threat model and required controls

The untrusted boundary is every HTTP caller, including signed-in Google and
synthetic verification members. The privileged assets are the service bearer,
the restricted runtime database capability, family-owned weekly plans and
retained edits/history. Platform deployment configuration is trusted operator
input; client Host, forwarded headers, cookies, cron-schedule headers and
User-Agent are not proof of service identity.

The fixed specification and changed-file plan capture the required controls:

- Dedicated, independently scoped staging/Production random bearer; explicit
  enablement, fail-closed malformed configuration and constant-time fixed-size
  comparison. No credential in URL, argv, logs, browser state or responses.
- Exact handler-only Proxy exclusion with full method/Host/target guards and
  private/security headers. No public auth-policy entry or user-cookie
  substitution. GET alone may act after service authentication; HEAD/OPTIONS
  and every other method remain protected nonmutating405 responses.
- No query/body/date/family/identity override; actual trusted server time and
  allowlist validation before database admission, including skipped runs.
- One request-owned deadline spanning schema admission, bounded family pages
  and locked per-family transactions; close underlying work before response.
  Abort prevents additional scheduling, and deadline expiry destroys the owned
  connection rather than leaving a background mutation.
- Preserve synthetic-family exclusion, current persisted member eligibility,
  ready menu snapshots, parameterized queries, verified TLS, restricted role,
  common lock, unique family/week key and unchanged existing/final plans.
  Retries reconcile partial completed families without deleting or regenerating
  history. Off-day recovery remains separately scoped.

These are design obligations, not findings that implementation already meets
them. Final assessment requires hostile HTTP, malformed config/allowlist,
deadline/abort, concurrent repeat and privacy tests against the built route.
Retain the audit disposition below; reassess if implementation adds a new
serving or dependency path. No forced upgrade is authorized.

## Staging and release limitations

The orchestrator's read-only staging aggregate reports one Google household,
zero saved Google menu recipes and zero plans. Today is Thursday, so the
amended Wednesday handler must skip before database admission. It cannot prove
hosted due-day storage or creation. The strict-target operator probe in
`spec.md:175`–196 is approved only for the recorded Preview database, verified
TLS, the existing eligible real household, at most seven transient snapshots,
internal deterministic Wednesday clock and mandatory sentinel rollback. It has
no Production fallback or commit option. Before/after preservation is required.
This probe and disposable local tests remain distinct proof classes from
deployed HTTP. Do not seed fake Google identities, widen the allowlist or
persist fixture data to claim a hosted pass. A synthetic browser member never
gains global scheduler authority.

Preview manual invocation is not unattended cron delivery. Native delivery,
production Host attribution and first scheduled-run status require later
authorized observation. Exact-source staging acceptance, human merge and fresh
Production release/activation authorization remain ungranted by this review.

## Dependency audit

Independently ran the native `pnpm audit --json` on2026-11-26: exit1,
**one moderate esbuild advisory, zero high/critical**. This is not a clean audit.
`pnpm why esbuild` confirms affected0.18.20 via Drizzle Kit's
`@esbuild-kit/esm-loader`/`core-utils` chain, including Better Auth's optional
peer path. The issue is
[GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99),
concerning development-server cross-origin reads; patched versions start0.25.0.
Existing source uses Next/native pg and the public migration loader, with no
esbuild serve invocation. The design adds neither a dependency nor affected
serve API. Retain the existing documented tooling deferral and reassessment
**by2026-12-01**, earlier on serving/tooling changes, from
`org/reviews/security-saved-recipe-menu-release-audit-001.md`. Final source
review must confirm the implementation preserves this reachability assessment.

## Evidence and verification

- Read `lib/plans/generate.ts`, `lib/db/connection.ts`, `proxy.ts`,
  `lib/auth-policy.ts` and the verification principal/scope specification.
- Read current official Vercel cron authentication, delivery, domain, precision,
  rollback and system-variable documentation on2026-11-26.
- No application code or hosted state was changed for this review.
