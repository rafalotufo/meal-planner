# Isolated staging validation — implementation plan

- Author: senior-developer
- Date: 2026-11-24
- Status: Draft — independent plan review pending
- Based on: accepted sibling `intent.md`, approved `spec.md`, owner continuation
  `org/messages/ceo-0029.md`, and independent spec/security Design reviews.
- Scope: local operator tooling and documentation only. No external setting,
  deployment, household provisioning, migration, provider call, merge or release.

## Files that change

- tests/deployment/staging.ts
- tests/deployment/staging.test.ts
- intent/vercel-candidate-validation/staging-runbook.md
- intent/vercel-candidate-validation/plan.md
- intent/vercel-candidate-validation/verification.md
- intent/vercel-candidate-validation/intent.md
- intent/vercel-deployment/deployment-runbook.md
- org/loop/config.yaml
- org/loop/state.yaml
- org/loop/history.jsonl
- org/loop/archive/vercel-candidate-validation-design-2026-11-24/**
- org/status.yaml
- org/messages/**
- org/memory/context.md
- org/memory/events.jsonl
- org/reviews/plan-vercel-candidate-validation-*.md
- org/reviews/code-vercel-candidate-validation-*.md
- org/reviews/security-vercel-candidate-validation-*.md
- org/reviews/vercel-candidate-validation-*.png
- gates/ledger.jsonl
- workflow-graph.yaml

The orchestrator owns all global audit mutations and serialized commits. Only
the new helper/test and runbook link affect operator behavior. Keep existing
`smoke.ts`, application/auth/proxy/configuration/dependencies, lockfile, schema,
strict compiler and test inclusion unchanged. Existing `.vercelignore` already
excludes tests, intent and org records from uploads; no upload change is needed.

## Operator contract

Use one helper module with exported typed validation/check/finalization functions
and a guarded Node/tsx CLI, following `smoke.ts`; no new package or service.
Treat parsed JSON as `unknown` and validate exact keys/types/lengths before use.
Unknown fields in public input or private stdin are errors; never echo input or
exception text. Keep the implementation cohesive rather than introduce a generic
deployment framework. A second helper module needs a documented reason before
it is added to this manifest.

### Public files and commands

The CLI has two phases:

```text
node --import tsx tests/deployment/staging.ts check EXPECTED.json PRE.json [anonymous|member|missing-provider]
node --import tsx tests/deployment/staging.ts finalize EXPECTED.json PRE.json CHECK.json POST.json ATTESTATIONS.json
```

`anonymous` is the default. `member` includes anonymous checks followed by
authenticated reads. `missing-provider` additionally makes one valid bounded
search expecting missing-key503, only with explicit operator selection and the
Preview key-absence assertion. There are no retries or paid-success checks.

`check` emits a sanitized provisional report. The operator captures fresh
post-check control-plane metadata and invokes `finalize`; a post snapshot
prepared before the HTTP checks ended cannot certify a pass. `finalize` has no
network effects and never reads private input. Both commands emit one JSON
result; fixed diagnostic text may go to stderr. Exit0 means a completed scoped
pass, exit1 invalid input or a concrete app assertion failure, exit2 incomplete
or inconclusive. Successful HTTP checks alone always remain provisional.

Public schemas are version1 and bounded to64KiB per file:

- Expected target: `version`, `runId`, `origin`, `sourceSha`, `deploymentId`,
  `teamId`, `projectId`, `productionDeploymentId`, `productionOrigins`.
  `runId` is a bounded safe identifier, SHA is40 lowercase hex, IDs are bounded
  safe identifiers. Team/project must match the approved recorded resource IDs.
  Origins are exact normalized HTTPS single-label `*.vercel.app` origins, no
  path/query/fragment/credentials/port; reject the staging origin if it is in the
  complete Production-origin set or its deployment ID equals Production's.
- Pre/post inspection: `version`, `runId`, `capturedAt`, `origin`, `sourceSha`,
  `deploymentId`, `teamId`, `projectId`, `environment`, `ready`,
  `generatedOrigins`, `productionDeploymentId`, `productionOrigins`,
  `aliasesComplete`, `domainsComplete`, `aliasIsProduction`,
  `previewConfigurationVerified`, `providerKeyAbsent`.
  Require Preview/ready, complete enumeration, safe manual alias classification,
  privately verified Preview configuration, absent provider key and exact target
  agreement. Staging origin must differ from the deployment's generated origins.
  Array lengths/counts are bounded and duplicates rejected. Unknown/incomplete
  evidence is inconclusive rather than permission to proceed.
- Owner attestations: `version`, `runId`, `capturedAt`, `googleAllowed`,
  `googleDenied`, `browser390`, `browser1440`, `keyboard`,
  `signOutAndFreshSignIn`, `stagingSessionProvenance`.
  Each assertion is a boolean. No identity, email, family identifier or secret
  value is included. These are owner attestations, not machine verification.
- Check report: only normalized expected target IDs/origin/source/run attribution,
  start/end timestamps, requested mode, fixed-code outcomes for the known check
  names, status/timing and provisional outcome. No headers, raw JSON/HTML, OAuth
  Location, cookies, personal values or arbitrary reason strings are retained.
  Finalization validates the full report shape and matching target/run/time order;
  public files are operator-trusted evidence, not cryptographic attestations.

Pre inspection must be no more than five minutes old at check start, with no
future timestamp. Validate expected target and pre inspection before reading
stdin or issuing any HTTP request. Post inspection must be fresh at finalization,
captured at/after the HTTP end time, and have identical target, source, generated
hostnames and Production-domain/deployment assignments. Drift is a failed run;
missing/stale evidence is inconclusive. Do not reissue HTTP just to finalize.

Full validation is complete only with member checks and all owner assertions
for the same run. Anonymous-only evidence remains useful scoped evidence but
cannot become an overall authenticated-validation pass. Missing Google/browser
attestations or expired/unprovisioned member sessions are inconclusive. A reused
session is labeled `session-reuse`; a new round trip is separately owner-attested.

### Private input, transport and locks

Only `check` may consume one private stdin JSON object, at most24KiB within10s,
with optional `sessionCookie` (max16KiB) and `protectionBypass` (max4KiB). Validate
nonempty printable values without controls, reject unknown keys and never echo
parse failures. Member modes require a staging session; anonymous requests never
receive its Cookie even if supplied. Protection bypass is placed only in the
documented header on exact staging-host requests, never URL parameters or global
browser headers. Cookie provenance requires the operator's staging assertion;
a raw Cookie header does not itself prove its issuing hostname.

Use native fetch, exact fixed paths and manual redirects; never follow any
Location. Ten-second per-request and sixty-second HTTP-run deadlines also cover
body reads, even for injected fetch/read streams that ignore AbortSignal. Bound
HTML to1MiB and JSON to64KiB, cancel unused/oversized bodies and remove timers/
listeners in `finally`. Keep all response content in memory only. Platform
challenge markers, transport failure, unexpected platform auth redirects or
missing app evidence are inconclusive; valid app responses with wrong contracts
fail. No raw exception/body values enter output. No arbitrary-host test option
is exposed by the CLI; tests inject a fetcher in-process.

The runbook takes a cooperative exclusive local lane directory lock before any
deploy/alias/login work and retains it until finalization/abort. It records only
run ID, with owner-only permissions; no automatic stale-lock removal. Helper CLI
invocations also take an exclusive process lock in the private local `.data/`
area, release only the lock they acquired in `finally`, and never remove the
outer lane lock. Other operators/CI must agree not to move the alias during the
lane. This prevents local overlap, not arbitrary out-of-band remote changes.

## Ordered tasks and verification checkpoints

### 1. RED — target/evidence contract (two files)

Write strict TypeScript native-runner tests before implementing the helper.
Prove invalid/wrong Production target, wrong team/project, generated URL,
unready/non-Preview or unclassified alias, stale/future/incomplete metadata and
unknown fields cannot trigger private input reads or network activity. Prove
valid metadata allows only known exact-origin requests. Record expected failures.

Verification: `node --import tsx --test tests/deployment/staging.test.ts` fails
for the absent implementation/behavior, then passes this slice after GREEN.

### 2. RED/GREEN — bounded checks and finalization (same two files)

Add tests for anonymous/member request separation, no redirects or credential
forwarding, expected root307/sign-in200/API401/member200 contracts, family shape
`{ members, invitations }`, explicit-only missing-key503 with nested
`error.code: SEARCH_UNAVAILABLE`, malformed/truncated/oversized HTML/JSON,
fetch/body stalls, deadlines, platform challenges and sanitized errors.
Verify no provider POST by default, no second request after redirect failure,
all cleanup paths, expired/unprovisioned sessions, post snapshot captured too
early, Production/alias/source drift and missing real-Google/browser attestation.
Exercise CLI child processes for bounded secret stdin, invalid-target-before-
stdin behavior, exit codes, process-lock contention/release and credential-free
stdout/stderr. Native test doubles stay in tests, never application code.

Implement the minimum helper behavior to satisfy these tests. Independently
validate family members/invitations array item shapes in memory with current
public API fields, but retain no item values. Use fixed check names and reason
codes so malformed fixtures cannot inject log fields. Add time injection only
where it makes freshness tests deterministic, not as a public CLI override.

Checkpoint: focused tests, strict typecheck/lint, review helper size/clarity and
no application imports/effects. Read relevant local Next docs before any code
as required by AGENTS even though the helper does not use framework APIs.

### 3. Operational runbook (two documents)

Write staging-runbook.md with exact public schemas/examples, check/finalize
commands, private stdin guidance, lane/process-lock lifecycle and clear report
limits. Link it from the existing runbook without changing Production modes.
Document future one-time setup and per-run procedures as separately authorized
operations: inspect account/Hobby/no Git/current project state, safe available
alias, complete domain pages, separate Preview settings/client, existing Preview
DB and approved real test identity/callback/provisioning effects. Shared project
pause/resumption remains a separate owner decision; never auto-resume it.

Use pinned install-scripts-disabled66.6.0 CLI read-only commands and dashboard
evidence to populate only allowlisted metadata fields. The orchestrator verified
the pinned cached CLI help without account access: `inspect <deployment> --json`,
`alias ls --json --limit 100 --next <cursor>` and
`domains inspect <domain> --json` are supported. Do not assume an undocumented
JSON field schema or archive raw output (it may contain env information). Alias
enumeration requires every `--next` page; the dashboard project-domain view must
establish Production classification.
Unknown mapping/classification/private effective config yields no snapshot/pass.
No env pull, automatic extractor, API token argument or new CLI dependency.

Checkpoint: runnable examples match tested parser; manual source review confirms
complete Production-domain evidence, no secret filenames/values in examples,
and no action crosses existing merge/release/hosted setup gates.

### 4. Full verification and independent handoff

Record Node24/pnpm10.33 and frozen installation. Run:

```text
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
node --import tsx --test tests/deployment/*.test.ts
pnpm run test:auth
pnpm run test:family
python3 -m unittest discover -s tests
python3 scripts/scan_secrets.py --staged
```

Run plan-sync against this plan and preserve strict inclusion/vendor types. New
helper/test paths remain excluded from uploads by unchanged `.vercelignore`.
Run existing real-browser auth QA at390/1440 using owned fixture servers and
distinct staging-feature screenshot evidence; preserve existing screenshot bytes
by backing up/restoring historical names if the helper cannot choose an output
prefix. Label it fixture/local evidence, not hosted OAuth or provider success.
Run no hosted check, real login, search or environment mutation in this task.
Record exact commands/results, changes and limitations in verification.md.

Independent security/code reviewers inspect final stable changes and evidence.
Fix blocking findings without weakening tests, update this plan for material
implementation departures, and rerun only affected checks plus required final
verification. Commit with the orchestrator; human merge/release and concrete
hosted setup authorization remain separate. No fake validation report is issued
for an account that has not been configured/deployed and inspected.

## Risks, prerequisites and proof limits

- Free alias availability and safe non-Production classification are not proved
  by this implementation. Stop future setup if unknown; no paid/new-project or
  Git-integration fallback is implied.
- Public inspection/owner evidence is trusted operator input. Typed checking
  prevents accidental target/time mixups; it cannot authenticate fabricated
  metadata or detect an out-of-band alias move-and-restore.
- Preview's recorded database is not an automatically disposable test database.
  Retain only the owner-approved real staging household and perform no cleanup
  SQL/reset. Callback/provisioning effects need later operational authority.
- Empty staging provider key means recipe/provider/photo success is unverified.
  Missing-key error checks cannot substitute for live provider evidence.
- Staging success covers its source/deployment/configuration only; Production
  still has a distinct build, candidate checks and post-promotion smoke checks.

## Primary references checked during planning

- [Vercel inspect](https://vercel.com/docs/cli/inspect): documented read-only
  inspection; no assumption that current docs guarantee pinned JSON output.
- [Vercel aliases](https://vercel.com/docs/cli/alias): explicit scope, alias
  targets, complete pagination and Production-domain assignment warning.
- [Vercel project](https://vercel.com/docs/cli/project): project inspection;
  account state and effective private settings remain operator preflights.
