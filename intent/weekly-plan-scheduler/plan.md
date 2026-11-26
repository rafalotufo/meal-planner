# Hosted weekly plan scheduler — implementation plan

- Author: architect
- Date: 2026-11-26
- Status: Common slice ready for independent design/security review; trigger
  slice pending owner timing choice
- Inputs: accepted sibling `intent.md`; sibling `spec.md`, `design-notes.md`

## Changed-file manifest

Implementation is bounded to the following paths; update this manifest and get
review of material departures before expanding the change.

- `app/api/plans/generate/route.ts`
- `lib/plans/scheduler.ts`
- `lib/plans/generate.ts`
- `proxy.ts`
- `vercel.json`
- `.env.example`
- `README.md`
- `AGENTS.md`
- `intent/weekly-meal-planning/scheduler-runbook.md`
- `intent/weekly-plan-scheduler/intent.md`
- `intent/weekly-plan-scheduler/spec.md`
- `intent/weekly-plan-scheduler/plan.md`
- `intent/weekly-plan-scheduler/design-notes.md`
- `intent/weekly-plan-scheduler/verification.md`
- `intent/weekly-plan-scheduler/staging-validation.md`
- `intent/weekly-plan-scheduler/release-preparation.md`
- `scripts/check-meal-plan-scheduler.ts`
- `tests/plans/scheduler.test.ts`
- `tests/plans/scheduler-http.test.ts`
- `tests/plans/generate.test.ts`
- `tests/plans/browser.ts`
- `tests/deployment/postgres-packaging.test.ts`
- `tests/deployment/upload-build.test.ts`
- `tests/family/server.ts`
- `tests/menu/server.ts`
- `tests/auth/server.ts`

Org workflow graph/state/status/messages/review/memory/ledger artifacts are
maintained separately by the orchestrator. No dependency/package change, SQL,
Drizzle journal/catalog or hosted migration is expected. Existing local CLI is
preserved. The final manifest may remove unneeded test-fixture server paths;
do not edit unrelated fixture behavior merely to match this list.

## Ordered work

1. **Independently approve common service slice.** Review the exact Preview
   canonical service origin, machine credential, deadline/abort contracts and
   bounded staging proof. Common-slice approval allows steps2–4,6–8 without
   `vercel.json` trigger definitions or Production activation. Native Hobby cron
   can target09:00 but deliver during09:00–09:59. Step5's trigger integration
   requires the owner timing choice and an independent review amendment naming
   the exact service Host contract. Never report the service-only slice as a
   completed scheduler fix.
2. **Failing security/calendar tests.** Add strict TypeScript handler tests with
   dependency injection for trusted configuration, internal test clock and DB
   opener. Prove configured/auth/method/Host/target rejection happens before DB
   admission; all headers; no cookies/forged user agent/date/family override;
   disabled/malformed flag; credential validation and diagnostic redaction;
   Toronto Thursday09EST/EDT boundaries, pre09/offday skip, rollover and retry.
   An ordinary internal test clock never becomes runtime request/env input.
3. **Minimal service adapter and bounds.** Implement scheduler guard and exact
   route, all seven method exports, Node runtime/dynamic/maxDuration90, optional
   execution deadline and abort handling in `generateDuePlans`. Reuse existing
   request-owned deadline pool/transactions without changing ordinary callers.
   Extract the existing per-family transaction-owned core for reuse by the
   guarded generator and rollback-only probe. Preserve SQL/locking/eligibility,
   synthetic exclusion and unique recipe selection. Add regressions that prove
   expiry/abort cannot continue new family work or leak unfinished SQL writes.
4. **Built HTTP and packaging proof.** Exact Proxy exclusion only; public policy
   unchanged. Exercise real Next server method/host/auth behavior and compiled
   route operation without source/migration files. Prove HEAD/OPTIONS never
   generate, no service credential access from client output, and malformed or
   anonymous bodies cannot enter costly parser work. Fixture servers must
   explicitly clear inherited scheduler credentials/enablement when unused,
   matching their existing paid-key isolation.
5. **Pending trigger slice and operating docs.** Under approved timing choice, add dual weekly
   UTC13/14 cron entries to existing `vercel.json`, keeping all other settings.
   Add disabled-by-default env examples, update active README/AGENTS and append
   supersession link to the old unactivated runbook. Document exact separate
   service origin, secret capture/rotation, same-day reconciliation, no automatic
   failure retry/backfill, failure visibility and first actual schedule check.
   Avoid presenting09:00 as guaranteed start/completion under Hobby jitter.
6. **Local verification and independent reviews.** Record commands and actual
   output in `verification.md`. Fix findings with focused regressions and rerun
   affected checks. Have independent security and code reviewers examine the
   fixed implementation before selecting a clean releaseSourceSha.
7. **Authorized isolated Preview validation of common slice.** Use existing staging lock/alias,
   keyless restricted DB and exact clean source. Configure fresh independent
   Preview CRON_SECRET, enablement and exact service origin only; verify target isolation without
   printing values. Inspect deployment source/branch/project/alias/runtime.
   Directly call unauthorized/wrong-token/method/valid paths through real HTTPS;
   record actual empty1 result/repeat on the existing menu-empty household.
   Never claim native cron ran on Preview. Run the reviewed strict-target
   rollback-only probe, asserting before/after preservation. Browser mobile/
   desktop plan checks reuse existing valid staging identity/session only; if
   unavailable state the gap and retain local real-Chrome evidence separately.
8. **Prepare the approval package.** Record exact source/Preview/profile/results,
   gaps and requested staging acceptance, merge and later Production authority.
   Proposed Production actions bind separate secret/enablement, compatible
   separate Production build/manual promotion, inspected registered cron host,
   precise two schedule definitions, canonical routing, anonymous health and
   first actual Thursday delivery observation. Leave Production untouched.

## Verification commands

Run on the final source where applicable and record actual exits/counts:

- `pnpm install --frozen-lockfile` using Node24/pnpm10.33.0
- focused `node --import tsx --test tests/plans/scheduler*.test.ts`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm test`
- `pnpm run test:plans`
- `pnpm run test:family`
- `pnpm run test:menu`
- `pnpm run test:auth`
- `node --import tsx --test tests/deployment/*.test.ts`
- `python3 -m unittest discover -s tests`
- `node --import tsx tests/plans/browser.ts` (owned DB/server/profile, real
  Chrome320/1440; no paid keys, no production identity)
- `git diff --check`
- plan-sync against this manifest, org/workflow/ledger consistency checks
- `python3 scripts/scan_secrets.py --staged` with zero findings before commits

Do not weaken tests/compiler/lint to pass. Handle inactive generated Next dev
cache only as documented by AGENTS. Hosted checks use verified TLS recorded
targets and private credentials; evidence contains aggregate counts, safe
hashes/statuses and exact deployment/source IDs only.

## Decisions and release blockers

- Common service slice may proceed after independent review; trigger/activation
  remains incomplete until the owner decision and reviewed integration.
- Owner choice: native Hobby delivery window versus a separately authorized
  different scheduler/paid plan. No platform plan/feature change in this task.
- Native cron Host must match the reviewed service Host contract. Registration
  and manual canonical handler success alone cannot prove this. Inspect actual
  definition host and require first authorized native run observation; a
  mismatch blocks activation until a reviewed compatible correction.
- Existing staging menu is empty: direct hosted invocation cannot prove
  creation. Rollback-only staging DB probe and local integration tests are
  separate evidence, with no persistent fixture rows or invented route output.
- Preview cron absence is expected. Full end-to-end automatic Production
  dispatch remains unobserved before release; list that limit explicitly.
- No source drift between accepted staging and proposed Production source.
  Later audit commits remain distinct. No migration, grant or destructive
  recovery; no Production rollout until fresh owner approval.
