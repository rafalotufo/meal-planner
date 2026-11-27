# Classified weekly planning — independent release preflight review

- Reviewer: reviewer
- Date: 2026-11-27 (America/Toronto)
- Proposal source: `5289d05`, corrected by `e99f3c9` and `45317d4`
- Fixed release source: `f0b8c1e3a8dd0ae55e8a7568c53cef00637bb8b5`
- Artifact: `intent/classified-weekly-planning/hosted-cutover-plan.md`
- Verdict: **Proposal approved for concrete owner cutover decision**
- This is not staging acceptance, migration authority or Production release approval.
- Outstanding blocking review findings: none after the corrections below.

## Review scope and evidence

Reviewed the complete proposed sequence against staging-first release spec, the
staging and Production runbooks, scheduler Host correction and actual scheduler
source. Earlier code/security/local verification remain attached to the fixed
release source; later audit HEAD is explicitly excluded from upload provenance.
Independently resolved the full fixed Git SHA and hashed its new migration SQL:
`2b9ffeb679e365c96aa862a6e808f0b2a87f9cd97a17cdafa0bfd3226ea669b5`,
matching the proposal. No new application-source change is proposed or reviewed.

The project/database/alias inspection, upload inventory151Git blobs/1047842bytes,
moderate dependency audit and candidate status are orchestrator evidence, not this
reviewer's independent live-provider observations. This review made no external
calls, configuration changes, database effects or deployments. Existing local
suite/browser results do not stand in for fresh hosted application behavior.

## Correctness, security and scope

The exact-target baseline and migration sections identify both recorded Neon
databases and only the pending planning identity80fd3d65-d202-462b-883d-6adc2eb565be.
The operation changes the two recipe/slot bounds and appends its native ledger
entry; it preserves old rows, all historical ledger records and reviewed grants.
Separate private verified-TLS owner/runtime connections, actual preflight catalog
checks and full private pg_dump/archive verification precede each separately
authorized schema effect. An archive check is correctly distinguished from a
successful restore, and backup restoration is not authorized.

The compatibility section explains the material release risk: either old/new
artifact rejects the opposite schema, migration and alias changes are not atomic,
and warm connections cannot guarantee overlap. A possible503 interruption must be
explicitly accepted. There is no proven compatible rollback artifact. Preservation
and separately authorized project-scoped pause are the safe failure disposition;
old-artifact rollback, schema/history rewrite, table deletion and restore over
new writes remain excluded. Project pause may also interrupt Preview, and any
interactive confirmation remains owner-operated. No automatic second attempt or
unrelated shared-key action is implied.

Preparation steps preserve default isolated Preview configuration, distinct source
and credentials, disabled verification manifest, stable/Production mappings and
platform protection. Synthetic or real-account browser writes/issuance, provider
calls, enabled scheduler probes and extra fixture data each require finite fresh
scope; absent checks remain named gaps. The initial generic deploy request is not
converted into a fictional accepted interruption/recovery or exact staging result.

After actual same-source staging results, the owner must accept their scope/gaps
before a distinct Production build. Production authority names source, project,
accepted result, migration, interruption, manual promotion and bounded anonymous
health/recovery. The accepted staging result and concrete Production authority may
be combined in one owner decision after evidence exists; the two decisions remain
separate audit records. Both cron definitions require exact path/schedule/owning
artifact/generated-host attribution after promotion. Native unattended dispatch
remains unobserved until it occurs.

## Corrections resolved during review

1. **Preview CLI command:** Initial step2 used `--skip-domain`, which the pinned
   CLI rejected outside Production. Amendment `e99f3c9` uses the actual isolated
   ref `classified-planning-f0b8c1e` and default Preview flow, preserving stable
   staging and all Production aliases before/after. Branch aliases may be created;
   they are not described as an unassigned artifact. Production correctly retains
   `--prod --skip-domain`. No project-wide `--verify` bypass is added.
2. **Readiness attribution:** The corrected candidate is
   `dpl_5pWi2uFG3M6pMKkgrM6eB29rkz3S`; provider API inspection at14:04:42Z showed
   BUILDING. Step2 now treats that inspected state as authoritative and requires
   actual final READY evidence. CLI `--no-wait` wording is not a readiness pass.
3. **Actual Preview scheduler profile:** Orchestrator inspection found scheduler
   variables Production-only. Independently confirmed `lib/plans/scheduler.ts:37`
   returns protected404 when disabled before Host/Bearer checks. Amendment
   `45317d4` therefore expects404 for current ordinary Preview, forbids enabling
   it to manufacture401 and keeps Production's enabled no-Bearer401 expectation.
   A disabled404 proves the disabled boundary, not enabled scheduler Host/auth.

## Required execution gates remain open

Before Preview schema/alias effects, obtain the concrete owner decision for the
named migration/candidate, possible503 gap, allowed validation and failure scope,
with refreshed actual readiness/target/alias evidence. The proposal's BUILDING
snapshot cannot certify a READY candidate. After authorized staging cutover,
actual attributed results and named gaps require owner acceptance; only then may
the separately authorized Production build/migration/promotion sequence proceed.

Runbook requirements for canonical routing, current configuration attribution,
separate Production artifact, generated-Host boundaries, cron ownership, minimal
anonymous health and bounded recovery remain required. No checklist pass, hosted
functional result, provider success, data write permission or human gate is
fabricated by this proposal approval. Any drift needs revalidation/fresh scope.

`git diff --check` passed. Staged secret scan before this review commit:0findings.
