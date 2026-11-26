# Hosted weekly scheduler — independent security design review

- Reviewer: security-researcher
- Date: 2026-11-26
- Artifacts: `intent/weekly-plan-scheduler/intent.md`, draft `spec.md`,
  `design-notes.md`; existing generator/connection/Proxy contracts
- Verdict: **Pending design completion; implementation not approved**
- Scope: design assessment only; no code, hosted mutation or release approval

## Decisions required before approval

1. **Important — Bugs / Compliance: native dispatch Host is unresolved.**
   `spec.md:56` requires an exact trusted Host, but `spec.md:59` explicitly
   leaves its contract undecided. Vercel's [cron management documentation](https://vercel.com/docs/schedules/cron-jobs/manage-cron-jobs)
   describes invocation on the deployment serving the production domain;
   the [system-variable documentation](https://vercel.com/docs/environment-variables/system-environment-variables#vercel_url)
   describes `VERCEL_URL` as the generated deployment hostname. These are not
   evidence that cron sends that generated hostname as Host. A secure exact
   `VERCEL_URL` comparison may therefore still reject the real trigger. Define
   the concrete service-host contract and its inspected activation preflight;
   preserve browser canonical-host checks. Do not replace the gap with a
   wildcard hostname, arbitrary forwarded header, redirect, or a fabricated
   successful native dispatch observation.
2. **Important — Compliance: owner timing selection is outstanding.**
   `spec.md:17` proposes dual UTC13/14 triggers while `spec.md:22` correctly
   states their adoption requires the owner's timing decision. Current
   [Vercel cron pricing documentation](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing)
   confirms Hobby's hourly precision. Do not approve this as an exact09:00
   implementation or activate a paid plan/external repository without the
   corresponding authority. Preserve the question as a real gate, not implied
   acceptance from elapsed time.

The implementation plan was not present at this review snapshot. This review
does not approve an unwritten changed-file manifest or verification procedure.

## Threat model and required controls

The untrusted boundary is every HTTP caller, including signed-in Google and
synthetic verification members. The privileged assets are the service bearer,
the restricted runtime database capability, family-owned weekly plans and
retained edits/history. Platform deployment configuration is trusted operator
input; client Host, forwarded headers, cookies, cron-schedule headers and
User-Agent are not proof of service identity.

The draft captures the appropriate common-handler controls:

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
Run the native lockfile audit before release and triage reachable high/critical
findings without forced upgrades.

## Staging and release limitations

The orchestrator's read-only staging aggregate reports one Google household,
zero saved Google menu recipes and zero plans. Authenticated hosted invocation
can honestly prove the empty outcome and handler boundary; it cannot prove
hosted creation from that dataset. Local disposable DB or separately reviewed
rollback-only storage proof remains a distinct proof class. Do not seed fake
Google identities, widen the allowlist or persist synthetic fixture data merely
to claim a hosted pass. A synthetic browser member never gains global scheduler
authority.

Preview manual invocation is not unattended cron delivery. Native delivery,
production Host attribution and first scheduled-run status require later
authorized observation. Exact-source staging acceptance, human merge and fresh
Production release/activation authorization remain ungranted by this review.

## Evidence and verification

- Read `lib/plans/generate.ts`, `lib/db/connection.ts`, `proxy.ts`,
  `lib/auth-policy.ts` and the verification principal/scope specification.
- Read current official Vercel cron authentication, delivery, domain, precision,
  rollback and system-variable documentation on2026-11-26.
- No application code or hosted state was changed for this review.
