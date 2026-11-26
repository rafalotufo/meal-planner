# Scheduler generated-host correction — independent security design review

- Reviewer: security-researcher
- Date: 2026-11-26
- Reviewed design: `3a3767b`, `intent/weekly-plan-scheduler/hosted-target-correction.md`
  and its sibling spec/plan amendments
- Verdict: **Approved for corrective implementation and isolated staging validation**
- Blocking design security findings: **none**
- This is not final code approval or a new Production release authorization.

## Finding and corrected trust boundary

The observed registered cron target was the first candidate's generated
deployment hostname, while the original guard admitted its stable service alias
only. The original stable-host Preview tests and anonymous browser health did
not establish that integration. Preserve the original exact-source evidence,
consumed approval and recovery history; do not rewrite them into successful
native-dispatch evidence.

The correction defines a narrow, acceptable service-only Host set:

1. The existing fixed environment-specific stable service hostname.
2. This deployment's exact trusted server-side `VERCEL_URL`, after strict
   validation and actual runtime/deployment attribution.

The official [system environment documentation](https://vercel.com/docs/environment-variables/system-environment-variables#vercel_url),
independently read on2026-11-26, identifies `VERCEL_URL` as the generated
deployment domain without a scheme, available at build and runtime. The same
source distinguishes project identity and deployment environment and notes a
Standard Deployment Protection interaction. The proposed design addresses that
limitation by requiring actual availability/attribution and failing closed;
it does not invent a fallback or authorize protection changes.

This is **not** suffix-based request admission. Syntax validation applies to
trusted configuration; incoming Host must then equal one of the two exact
strings. A different plausible generated hostname remains421 even with a valid
bearer. Client Host/forwarding headers, query fields, cookies, User-Agent,
schedule metadata and aliases cannot choose or add an accepted deployment.

## Mandatory implementation controls

`hosted-target-correction.md:52`–87 specifies the necessary restrictions:

- Require nonempty lowercase ASCII DNS hostname metadata, total length≤253,
  labels1–63, alphanumeric label ends, internal hyphens and nonempty deployment
  prefix before the exact `.vercel.app` suffix. Reject normalization tricks,
  scheme, port, userinfo, path, query, fragment, whitespace, uppercase, wildcard,
  empty labels and leading/trailing dots.
- Missing/malformed `VERCEL_URL` must fail503 before storage even when the
  incoming request uses the stable service hostname. Do not trim, guess or
  reconstruct system metadata. Do not create project/per-deployment overrides
  pretending to be the actual platform-generated hostname.
- Keep existing fixed Vercel project/environment, stable service-origin and
  browser-origin configuration, explicit Wednesday, enablement and independent
  64hex credential requirements. Passing the new Host check alone grants no
  operation: independent exact constant-time Bearer authentication remains
  mandatory for every supported method.
- Apply the second Host only in the exact machine handler. Ordinary page,
  Proxy, menu, Better Auth and family/session rules must still reject generated
  Hosts421. No public auth-policy entry, browser cookie authority or global
  generated-host exception is approved.
- Preserve all method/target/security headers, trusted clock, request-owned
  deadline/pool, same-promise lifecycle retention, transaction settlement,
  current member eligibility, synthetic exclusion and existing/final history.
  No migration, grant, provider, dependency or runtime override is introduced.

These are implementation obligations. Approval depends on the code implementing
them exactly; the `.vercel.app` hostname shape by itself is not authentication
or proof that a deployment belongs to this project.

## Proof and approval gates

The proposed red-first regressions cover both environments, both service Hosts,
all methods, missing/wrong credentials, malformed/missing trusted metadata,
different generated Hosts, forwarded-header attempts, due/offday behavior,
headers, no unauthorized storage admission and ordinary generated-host421.
Built HTTP and compiled packaging checks are required in addition to injected
handler tests. Final security review must inspect actual code and verification.

Exact-source Preview validation must exercise BOTH the stable origin and the
inspected own generated HTTPS origin, with unchanged independent bearer and
scoped private platform access. Platform interception cannot count as an app
401/421. Actual runtime `VERCEL_URL` attribution must match the inspected
deployment, not merely an operator-supplied metadata claim. Thursday success
must be labeled offday/no-DB; the rollback-only Wednesday probe remains a
separate storage proof. No persistent fake data or copied Production credential.

A future newly authorized Production candidate must demonstrate generated
service401 without credentials and ordinary generated-host421 before promotion.
After any authorized promotion, both installed definitions must bind to the
current deployment and its own inspected generated hostname. Mismatch is a
failed release check requiring only that attempt's scoped recovery; it does not
authorize widening Host acceptance or another automatic attempt.

The first unattended Wednesday execution remains unobserved until it occurs.
Neither manual Preview success, candidate401, registered configuration nor
rollback-only storage proves scheduled delivery. Preserve this gap explicitly.

The first one-attempt Production approval is consumed. This review authorizes
no new Production configuration, candidate build, promotion, activation,
migration, data effect or recovery. The owner's original fix/staging/preparation
request supports this corrective design/build/staging work. A new fixed-source
staging acceptance and concrete owner release decision remain required.

## Review verification

Read the committed correction and sibling amendments against the existing
service guard, canonical-host and release contracts; independently checked the
official system-variable documentation. No runtime code, hosted state, original
release evidence or approval ledger was edited for this review. Diff check and
zero-finding staged secret scan accompany this report's exact-path commit.
