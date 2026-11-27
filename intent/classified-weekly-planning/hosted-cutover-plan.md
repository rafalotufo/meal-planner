# Classified weekly planning — hosted cutover plan

- Author: architect
- Date: 2026-11-27 (America/Toronto)
- Status: Proposed; independent review and concrete owner cutover authority pending
- Source request: “Deploy main to production”, as relayed by the orchestrator
- Fixed release source: `f0b8c1e3a8dd0ae55e8a7568c53cef00637bb8b5`
- This document authorizes no migration, alias move, issuance, configuration,
  Production build/promotion, pause, restore or release by itself.

## Exact source and governing evidence

Use a clean verified export/checkout of the fixed source above for both builds.
It includes reviewed application source `72f726b`, storage `fc9b12c` and backend
`39fdc4a`; later audit commits are not replacement release sources. Local checks
and real owned Chrome evidence are recorded in sibling `verification.md`;
independent security review `ce3fc5d` and final code review `6ba4f84` preceded
owner-authorized local main integration. No local fixture is live hosted evidence.

Follow [staging-first spec](../staging-first-release/spec.md),
[staging runbook](../vercel-candidate-validation/staging-runbook.md),
[Production runbook](../vercel-deployment/deployment-runbook.md) and the
[scheduler Host correction](../weekly-plan-scheduler/hosted-target-correction.md).
The current operation adds a schema compatibility boundary; historical release
approvals, verification issuance and recovery authorizations are consumed scopes.

## Inspected baseline and exact targets

The orchestrator reports fresh read-only Vercel/Neon inspection for this release
preparation; record actual inspection timestamps in the execution evidence and
refresh immediately before effects. Values below are baseline attribution, not
claims that a cutover has happened.

| Resource | Current inspected target |
| --- | --- |
| Vercel | project `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, team `team_2c0O29FMb91g7L6sUChc9v6J`, scope `rafalotufos-projects`, unpaused |
| Production | `dpl_GHCptaMFGM7gFDHJEE7zF3kJbJTM`, source `91c419e`; generated Host `meal-planner-smlpcvad5-rafalotufos-projects.vercel.app`; all three inspected Production aliases currently map here |
| Stable Production | `https://lotufo-meals.vercel.app`; verify exact direct canonical routing/auth configuration rather than assume historical routing |
| Staging | `dpl_4oNhN5c8HvSwBZ1HcDEWLsWFM7kA`, source `91c419e`; stable origin `https://meal-planner-staging-rafalotufos.vercel.app` |
| Preview database | Neon `withered-night-50194672`, branch `br-dark-term-bbqhnxi5`, endpoint `ep-wandering-breeze-bbtscekj.c-15.us-east-1.aws.neon.tech`, database `meal_planner` |
| Production database | Neon `plain-pond-82425009`, branch `br-wild-dust-bbr2mvzw`, endpoint `ep-lively-tooth-bbi1n111.c-15.us-east-1.aws.neon.tech`, database `meal_planner` |

Both databases have five preserved legacy migration rows and three native
identities (eight total), including classification
`6e36359b-9b16-4642-a487-e4e5411ce477`. Current constraints are meals length1–7 and
suggestion index0–6. Compare exact histories, checksums, catalog and role/privilege
baseline with source manifests before proceeding; unexpected drift stops work.

Only pending migration:

- Identity/file: `80fd3d65-d202-462b-883d-6adc2eb565be` /
  `drizzle/postgresql/80fd3d65-d202-462b-883d-6adc2eb565be.sql`.
- SHA256: `2b9ffeb679e365c96aa862a6e808f0b2a87f9cd97a17cdafa0bfd3226ea669b5`.
- Dependency: classification identity above. Result: nine total identities,
  comprising five legacy and four native rows; the five-row historical public
  Drizzle journal remains unchanged.
- SQL acquires common advisory lock73462901, replaces only
  `meal_plan_weeks_meals_check` with JSON array length1–8 and
  `meal_plan_suggestions_day_index_check` with0–7. Normal migration tooling appends
  exactly this native ledger identity/hash/descriptor. No row UPDATE/backfill,
  grant expansion, TEMP grant, import, provisioning, ledger rewrite or DROP of
  application tables is included. The constraint replacement itself uses the
  reviewed DROP CONSTRAINT/ADD CONSTRAINT statements; it is not table deletion.

Use distinct private `mp_migrator` direct and restricted `mp_runtime` pooled
connections to each same recorded database with verified TLS. Never print URLs,
secrets, cookies, row content or OAuth query strings. Preserve exact existing
runtime grants and role properties; no new privilege is necessary. Prefer the
reviewed migration library with no runtime-grant reconciliation requested, then
separate read-only runtime validation. If existing wrapper reenacts identical
grants, prove zero effective grant delta; any required new privilege or unrelated
pending migration needs fresh reviewed authority. Do not manually edit history.

## Compatibility interruption and recovery decision

Old eight-identity runtimes reject the new catalog on cold/reopened connections;
the new runtime rejects the old catalog. Existing warm connections do not provide
a guaranteed overlap. Migration and alias promotion are separate operations,
so each environment may return503 between migration commit and new alias routing.
Record both timestamps without claiming their difference measures user outage.

The proposed operating choice is a narrowly timed accepted possible503 gap, with
candidates READY before each target's schema change. No routine maintenance
pause/resume is proposed. If the owner instead chooses maintenance, its precise
pause/resume scope and effects on both environments must be authorized first.

After either migration, the old source91c419e deployment is not a safe rollback
artifact. Preserve the new schema/data. No compatible fallback artifact has been
established for this release. For required failed/incomplete health after schema
commit, stop and retain evidence; use a project-scoped contingency pause only if
the owner explicitly authorizes it for `meal-planner`, acknowledging that Preview
may also stop. Any interactive project-name confirmation remains owner-operated.
Resume requires a reviewed schema-compatible correction and fresh applicable
release authority. No automatic second release attempt is included.

No branch reset, application table DROP, migration history rewrite, backup restore,
old-artifact rollback, shared-key revocation or pause of other projects is allowed.
The backup below is preservation evidence, not authority to restore over new writes.

## Preparation and Preview cutover

1. Pin source and verify upload inventory, zero secret findings, local evidence
   and independent reviews. Inspect effective existing Preview/Production config
   privately, reporting names/scopes and intentional differences only. Preserve
   canonical auth/callback/Host policy, scheduler settings, protected staging,
   isolated credentials, Hobby plan and provider limits. Any required config or
   Google registration change requires separate authority; do not infer it from
   the deploy request. Record an actual dependency audit result or named limitation
   if no release audit is available; do not invent checklist passes. The
   orchestrator subsequently confirmed the source dependency audit: one moderate
   esbuild advisory, zero high/critical findings. Record its actual advisory and
   reachability/deferral in execution evidence; no dependency upgrade is implied.
2. Create an owned private staging-lane lock as the runbook specifies. Do not
   break an existing lock or race another operator. Capture stable staging and
   complete Production alias attribution **before** deployment. CLI66.6.0 rejects
   `--skip-domain` for Preview; that flag is Production-only. Deploy the exact
   fixed source using the existing project and default Preview environment,
   isolated preparation branch/ref `classified-planning-f0b8c1e`, and
   `--environment preview --no-wait --json --yes`. Bind `gitCommitSha`,
   `releaseSourceSha` and build/runtime `VERCEL_GIT_COMMIT_SHA` to the full fixed
   SHA, with `gitCommitRef` naming that isolated preparation ref. Do not pass
   `--verify`, which would create project-wide protection bypass authority.
   Branch-generated alias assignment may occur; inspect the actual deployment
   and complete alias mappings **after** deployment and prove stable staging and
   every Production alias still point to their baseline deployments. No manual
   stable/Production alias move is part of this preparation step. Inspect READY,
   source bytes/provenance, deployment ID/generated Host, project/team/Preview
   target, build/runtime metadata and effective existing isolated configuration.
   The ordinary build manifest must remain verification-disabled; do not enable
   synthetic verification or change configuration merely to make checks pass.
   Explicit source metadata is an attestation bound to upload bytes, not
   independent platform-signed Git proof. Record the resulting candidate ID
   rather than reuse old staging. A failed build changes no schema. The
   corrected preparation created Preview `dpl_5pWi2uFG3M6pMKkgrM6eB29rkz3S` at
   `meal-planner-9sutdnafh-rafalotufos-projects.vercel.app`. Provider inspection at
   `2026-11-27T14:04:42Z` still showed BUILDING. Treat inspected provider state as
   authoritative; CLI `--no-wait` readiness wording is not READY evidence. Capture
   actual final readiness and before/after mappings in execution evidence. The distinct
   Production build in step10 still requires `--prod --skip-domain`.
3. Before schema effects obtain concrete owner authorization for this exact
   Preview migration, staging alias move, possible503 gap, validation scope and
   failure disposition. This plan may be presented alongside the READY candidate.
4. Immediately before Preview migration, take a complete private PostgreSQL17
   custom-format `pg_dump` of that exact database. Use verified TLS, private child
   environment and directory0700/file0600 outside uploads/Git. Verify nonempty
   archive, `pg_restore --list` tables and both ledger entries, archive hash and
   sanitized result. This verifies an archive, not a successful restore. Recheck
   exact schema/history/grants and only-one-pending migration; stop on drift.
5. Apply only the migration above with reviewed pinned-source explicit tooling;
   preserve grants. Verify nine-identity catalog/history and runtime read-only
   connectivity/role/grant equality. Transaction failures require verification of
   rollback; a post-commit smoke failure does not undo a committed migration.
6. Move only the existing stable staging alias to the READY same-source Preview.
   Capture complete Production aliases/domain classifications before/after and
   verify unchanged. Old staging is incompatible after migration; no automatic
   alias restore to source91c419e. Record the exact new Preview ID/profile/schema
   and validation interval. Preserve unrelated mappings and protection settings.
7. Perform only separately authorized staging checks. For limited keyless scope,
   anonymous/Host/security/configuration checks are valid evidence but cannot
   certify authenticated planning/OAuth/provider behavior. Current inspected
   scheduler settings are Production-only: ordinary Preview remains disabled.
   Its exact `/api/plans/generate` returns404 with private/security headers when
   `MEAL_PLAN_SCHEDULER_ENABLED` is absent/false; expect that disabled response on
   both its generated and stable staging origins where platform access allows.
   Do not enable Preview scheduler configuration for this preparation. A separately
   authorized enabled Preview profile would instead require no-credential401 on
   those two service Hosts, with renewed configuration attribution and staging
   acceptance. Ordinary generated-Host page/menu requests must421. Platform
   interception is inconclusive. Bearer off-day checks, rollback-only hosted probe
   and browser/data operations require concrete run authority; never force runtime
   dates or execute a due write merely to obtain a pass. Production remains
   enabled and its step10 generated service no-Bearer expectation remains401.

### Optional staging application lane

A Google-free application run needs explicit fresh scope naming the exact
Preview source/deployment/profile, alias-scoped private Shareable Link, run/member
count, duration, approved save/plan read/approve/suggest effects, revocation and
owned cleanup. Existing verification CLI/private-channel rules apply. Do not use
project-wide bypass, real-account handoff, fake Google claims, Production cookies
or public protection removal. Any applicable plan snapshot fixtures/cleanup must
be specifically reviewed and authorized; issuance alone does not authorize
arbitrary DB seed writes. A permitted synthetic run proves only observed
application checks; Google/provider/invitation/URL-curation/platform-enforcement
gaps remain. If not authorized or unavailable, record those checks not-run.

A real Google run needs owner participation/identity and exact write scope. No
paid provider exercise, search retry/burst or WAF publication is proposed. Missing
live checks are named gaps for explicit owner acceptance, never fabricated helper
passes or automatic Production fallback.

## Staging acceptance, then Production

8. Write actual attributed staging evidence naming the **full fixed source**,
   new Preview deployment ID, stable alias, config/schema profile, interval,
   observed proof classes and every missing/inconclusive check. Revoke any
   temporary scoped link/run and reconcile this run's owned lock. Obtain owner
   staging scope/gap acceptance for those exact results. Neither old source91c419e
   validation nor generic “deploy main” satisfies this exact-result gate.
9. With that acceptance available, obtain fresh committed/unexpired Production
   release authority naming source, Vercel project/team, accepted staging artifact,
   Production migration, possible503 interruption, separate candidate build/manual
   promotion,15-minute anonymous health window and precise recovery scope. The
   owner may combine staging acceptance and this concrete Production decision in
   one approval after the actual staging package is reviewable; record separate
   gate decisions without asking twice. No Production build before that gate.
10. Recheck source/profile/schema/alias parity and authorization expiry. Build a
    distinct **Production** candidate from the pinned source using CLI66.6.0
    `deploy --prod --skip-domain` with explicit project/scope; never promote
    Preview or implicitly deploy later audit HEAD. Inspect READY and provenance,
    exact own generated hostname/system `VERCEL_URL`, Node24, pnpm10.33.0,
    search runtime/duration90/cancellation, unchanged config and scheduler contract.
    Candidate ordinary browser/static/session requests must421/no-store, and exact
    generated-Host `/api/plans/generate` with no Bearer must401/security headers.
    Platform-protected evidence remains inconclusive; resolve required packaging
    coverage or name the exact gap for owner decision before further effects.
11. Repeat private full backup/archive checks and exact one-pending/read-only
    preflight for Production. Under the authorized interruption window apply only
    the same migration, verify new catalog/runtime/grants read-only, and promptly
    manually promote **that inspected Production candidate**. Preserve staging,
    all three existing Production aliases, direct canonical origin and unrelated
    mappings. Record exact migration commit/promotion timestamps and deployment ID.
12. Verify all intended Production alias/source attribution and direct canonical
    routing. Inspect **both** installed cron definitions: exact path
    `/api/plans/generate`, unchanged Wednesday13/14UTC expressions, owner deployment
    equal to this promoted artifact and service Host equal to its own inspected
    generated hostname/system `VERCEL_URL`. Alias equality alone is insufficient.
    Mismatch fails the release check; do not widen Host acceptance in place.
13. Run existing minimal anonymous smoke on
    `https://lotufo-meals.vercel.app`: root307 exactly to same-origin `/sign-in`,
    sign-in200, protected session/search401 and no-store/security headers. Anonymous
    empty search has no provider effect. Supplement with read-only target/catalog/
    privilege checks; do not report them as authenticated browser proof. Observe
    sanitized runtime/configuration errors for at most15minutes after promotion.
    No real Production login, paid search, cancellation run, WAF burst, fake data
    or manual scheduled-generation write is included. On required failure or
    incomplete canonical/health evidence invoke only the authorized recovery.
14. Record final source/deployment/alias/schema/grants, actual commands/statuses,
    preservation evidence, remaining gaps and recovery outcome. Automatic native
    Wednesday dispatch remains unobserved until it actually occurs; installed cron
    definitions, manual checks and local fixtures do not prove unattended delivery.
    The owner remains responsible for ongoing monitoring beyond this bounded run.

## Decisions still required before external effects

- Independent review of this exact cutover proposal and prepared Preview source/
  candidate inventory; no fabricated approval status.
- Owner scope for the named Preview migration/alias cutover, accepted possible503
  gap and safe failure disposition. Optional synthetic/browser/probe authority is
  separate and finite; otherwise explicitly omit those effects.
- Actual same-source staging results followed by owner acceptance of their named
  gaps, then concrete Production migration/build/promotion/interruption/recovery
  authorization. No grant expansion, config/domain/OAuth change, paid activity or
  destructive restoration is implied.

All work above is bounded to this fixed source and the two recorded databases/
existing Vercel project. Drift requires revalidation or fresh authority; this
proposal supplies no standing permission for later releases or migrations.
