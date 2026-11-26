# Hosted weekly plan scheduler — intent

- Author: product-manager, from Rafael's active chat
- Date: 2026-11-26
- Status: Accepted for Design under the repository org PM intent gate
- Source: owner request to fix the missing scheduler, validate staging, and
  prepare a Production release for approval using the AI SDLC org workflow
- PM decision: `org/reviews/intent-weekly-plan-scheduler-001.md`

## Problem and evidence

The weekly-planning UI promises Thursday drafts after 09:00 America/Toronto,
but the implemented generator is a local CLI with an uninstalled launchd
template. `intent/weekly-meal-planning/scheduler-runbook.md` explicitly records
hosted scheduling as unactivated. The owner's expected Thursday run therefore
has no execution trigger in Production.

The preceding read-only incident investigation inspected current Vercel
Production deployment `dpl_GL3gRCVHKknoJjBacFhwNbm2d1oo`, source
`4fe9097657df1c641d511a276c81ec3ae118f8ee`: deployment `crons` was empty and the
project cron `definitions` array was empty. The calendar calculation correctly
maps 2026-11-26 09:00 America/Toronto to 14:00 UTC and targets week 2026-11-29.
This is missing integration and activation, not evidence of a failed worker run
or a timezone conversion defect. Fresh release evidence must inspect its own
actual deployment and configuration rather than reuse this incident snapshot.

## Requested outcome

Production automatically invokes weekly plan generation every Thursday at
09:00 Eastern time, following America/Toronto daylight-saving transitions.
Eligible families receive the upcoming strictly subsequent Sunday–Saturday
draft from their saved menu. A running personal computer is not required.
Existing plans, family edits, final history, admission rules, recipe uniqueness
and selection behavior remain intact.

Complete local implementation and verification, validate the exact proposed
release source in the existing isolated staging lane, and present a concrete
Production release and activation package for owner approval. This request
does not authorize Production deployment, configuration changes or activation.

## Acceptance criteria

- A reviewed hosted trigger invokes the existing bounded generator with
  narrowly scoped machine authentication. Missing/invalid credentials,
  noncanonical hosts, unsupported methods and unauthorized callers cannot
  generate plans or obtain family/configuration details. Ordinary page,
  render, session and user reads remain effect-free.
- The intended trigger time is Thursday 09:00 America/Toronto in both standard
  and daylight time. Architecture must establish the actual platform schedule,
  plan limits and delivery guarantees from current official documentation.
  Do not represent UTC cron as timezone-aware or promise exact delivery where
  the platform permits timing jitter. Any material timing/cost constraint is
  escalated with a concrete alternative before introducing paid features or
  silently weakening the requested time.
- Due checks use actual trusted server time. Preserve no arbitrary client date,
  family or identity overrides. Document the retry, missed-run and recovery
  behavior; duplicate/concurrent invocations leave existing drafts, final plans
  and family edits unchanged. No unreviewed historical backfill is introduced.
- Preserve the existing generator's family eligibility, synthetic-family
  exclusion, bounded queries, locks/timeouts, menu curation eligibility,
  one-to-seven unique recipes and zero paid-provider-call behavior. Runtime
  never migrates or gains schema-owner privileges.
- Configuration and deployment artifacts contain the concrete hosted trigger,
  not just an operator reminder or inactive template. Server-only scheduler
  credentials remain private, separately scoped to staging and Production,
  absent from URLs, browser state, screenshots, logs and versioned evidence.
- Strict TypeScript regressions exercise authentication, schedule boundaries
  across DST, due/off-day behavior, failure handling and repeat invocation.
  Required repository verification and independent design, security and final
  reviews pass with actual evidence.
- Staging validation binds an exact clean release SHA, Preview deployment,
  stable origin and sanitized configuration profile. It demonstrates the
  hosted handler's authorized/unauthorized behavior, real storage behavior and
  duplicate safety through an explicitly reviewed isolated staging procedure.
  Separate observed due-day execution from deterministic local clock tests;
  do not invent a hosted cron delivery observation. Existing verification
  principals retain their approved scope and global scheduler exclusion.
- Inspect the staging UI in a real browser at mobile and desktop widths for
  affected plan behavior. State any unavailable authentication or timing
  coverage explicitly. Preserve existing real staging data; no persistent fake
  data, Production-cookie copy or expanded Google allowlist is implied.
- The release package identifies the fixed source, staging results and gaps,
  proposed Production configuration/activation, no-migration expectation,
  rollback or scoped-disable procedure, and bounded post-release observation.
  Owner staging acceptance, human merge gate where applicable, and separate
  Production release authorization remain pending until actually granted.

## Authority and constraints

The owner authorizes the org design/build/test cycle and the existing isolated
staging deployment/configuration work necessary to validate this scheduler.
This supersedes the original weekly feature's prohibition on preparing hosted
integration and the narrow preservation rule for `vercel.json` only to the
extent required for this reviewed scheduler change. Preserve unrelated
deployment settings and all manual release gates.

No Production write, scheduler activation, deployment/promotion, migration,
grant change, paid plan/feature/provider request, data import or destructive
cleanup is authorized. Production credentials are not copied into staging.
Existing PostgreSQL schema and identity/authentication contracts remain the
baseline. A genuinely necessary schema/authority expansion must be reviewed
and escalated before execution; do not assume it from this intent.

## Out of scope

Recipe selection redesign, notifications, calendar-day assignment, new family
roles or timezones, general meal CRUD, unrelated UI additions, provider
integration changes, migration work and unattended Production recovery.

## Design handoff

Architect: choose a documented hosted scheduling mechanism satisfying Eastern
time and platform constraints; specify request/authentication, deadline and
Proxy interaction, failure visibility, duplicate safety, deployment activation
and staging proof. Keep the existing CLI usable unless a reviewed reason
requires a change. Prepare `spec.md`, a bounded `plan.md` changed-file manifest
and the staging/release procedure for independent review before implementation.

Material uncertainty is schedule delivery precision on the existing platform
plan and the available eligible staging dataset. Resolve these explicitly;
neither justifies fabricated evidence or an authentication bypass.
