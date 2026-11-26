# Scheduler generated-host correction — independent final security assessment

- Reviewer: security-researcher
- Date: 2026-11-26
- Fixed corrective source: `f8383f3dbfc14b4ab3b2cfdd3c648d6abc3d06a9`
- Design approval: `security-weekly-plan-scheduler-hosted-correction-design-001.md`
  at `65e504f`; corrective design `3a3767b`
- Verdict: **Approved for isolated both-origin staging validation and release preparation**
- Unresolved blocking security findings: **none**
- No new Production configuration/build/promotion/activation authority is granted.

## Corrected boundary

The recorded first release demonstrated an availability defect: registered cron
requests targeted the candidate's generated hostname, outside the original
fixed-alias guard. The corrective tests reproduced the old421instead of401,
and missing metadata200instead of503, before changing the guard. Preserve the
first source, failed attempt, consumed approval and recovery evidence as history;
the previous acceptance does not certify the corrected source.

The runtime change is confined to `lib/plans/scheduler.ts`:

- Lines27–29 validate the trusted server metadata as a bounded lowercase ASCII
  DNS hostname with valid1–63character labels, alphanumeric label ends, no empty
  labels, total length≤253 and a nonempty prefix before `.vercel.app`. URL syntax,
  whitespace, Unicode, uppercase, wildcards and oversized labels are rejected.
- Lines41–45 require valid `VERCEL_URL` before admitting either service Host.
  Missing/malformed metadata returns generic503 before storage. Existing fixed
  project/environment/service-origin/browser-origin, Wednesday, enablement and
  independent64hex secret checks remain mandatory.
- Lines46–47 compare incoming Host by **exact equality** with the configured
  stable service hostname or that one validated own-deployment string. The
  suffix restriction validates trusted metadata only; it is never applied as
  incoming request admission. A different generated hostname remains421 even
  with a valid credential, and forwarded headers cannot add an accepted Host.
- Lines48–54 retain independent exact constant-time Bearer authentication,
  protected non-GET405 and strict no-query/body/override target checks. Passing
  the generated Host check alone grants no operation or browser session.

The actual route continues to obtain its environment only from server
`process.env`. No client field can set `VERCEL_URL`; no fallback/hostname
reconstruction or project environment override is introduced. This follows the
official [system environment contract](https://vercel.com/docs/environment-variables/system-environment-variables#vercel_url)
and the independently approved design. Actual deployment/system-value
attribution remains an operator verification requirement, not something DNS
syntax alone proves.

I compared the fixed source to7fe1531 for Proxy, menu code, generator/storage,
route lifecycle, cron settings and dependency manifests/lock: those contracts
are unchanged. Ordinary generated-host page/menu/session/sign-in requests
remain421. No public policy entry, Google/session change, schema/grant,
runtime clock/family override, provider call or dependency change was added.
The existing60second deadline, same bounded waitUntil work, current eligibility,
synthetic exclusion, idempotency and immutable existing/final history remain.

## Verification and evidence provenance

Independently ran
`node --import tsx --test tests/plans/scheduler.test.ts`: **exit0,7/7** using its
owned disposable local database. This covers both environments and both Hosts,
no/wrong Bearer401, all protected methods/headers, authorized offday skip,
foreign/sibling generated Host421, hostile forwarding metadata, malformed or
missing system metadata503 on either Host, and cross-host concurrent due
generation that creates one draft and preserves its finalized snapshot.
I also independently checked Node24 rejection of line-break metadata and read
the final built-HTTP/compiled-packaging regressions. The runtime guard did not
change after that independent run; final diff/whitespace checks passed.

The committed `hosted-target-correction-verification.md` records developer
evidence: lint/typecheck/build,337complete Node tests (recipes112, plans35,
auth16, family35, menu69, deployment41, verification29), Python7 and real Chrome
320/1440 passed. Built HTTP covers stable/generated service paths, malformed
system metadata and ordinary generated-host421. Compiled packaging exercises
both service Hosts without source/migration files. These broad runs and Chrome
observations are developer evidence; I did not rerun every suite or browser.

No dependency changed relative to the previously audited source. The earlier
independent full audit and the developer's current high-threshold audit retain
**one existing moderate esbuild advisory and zero high/critical findings**.
The audit is not clean and the advisory is not fixed. No affected esbuild serve
path was introduced by this Host-only correction. Retain the existing tooling
deferral and **2026-12-01** reassessment deadline from
`security-saved-recipe-menu-release-audit-001.md`; no forced update or extension.

## Staging and Production limits

The existing owner-authorized isolated Preview procedure may proceed on this
exact source with deployment-only independent credentials and the recorded
restricted verified-TLS database. Validate the actual stable AND own generated
HTTPS origins, preserving independent narrowly scoped platform access/cookie
jars. Platform interception cannot count as app401/421. Do not override the
system hostname, copy Production secrets, alter shared protection or weaken
guards to make a check pass. Revoke each temporary platform capability and
verify fresh denial. Preserve the existing rollback-only storage proof and
before/after checks as a separate evidence class.

Today's Thursday HTTP should skip before database admission. Manual Preview
results cannot establish due-day hosted storage, hosted disconnect handling or
unattended cron delivery. Actual new staging outcomes were not certified by
this code review and must be attributed separately.

The old one-attempt Production authority is consumed. A new source/profile
acceptance and fresh concrete owner release approval are required before any
new Production action. A later authorized candidate must demonstrate generated
service401 without a bearer and ordinary generated-host421; after promotion,
both registered cron Hosts must equal the current deployment's own inspected
hostname. A mismatch fails release checks and permits only its explicitly scoped
recovery. The first real unattended Wednesday run remains unobserved until it
occurs. No review, metadata inspection or rollback-only probe fabricates it.

This reviewer performed no runtime code edit or hosted mutation. Only this
assessment is committed; its staged secret scan must report zero findings.
