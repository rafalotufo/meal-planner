# PM intent review — hosted weekly plan scheduler

- Reviewer: product-manager
- Date: 2026-11-26
- Artifact: `intent/weekly-plan-scheduler/intent.md`
- Source: Rafael's active request and preceding read-only incident diagnosis
- Verdict: **Accepted for Design** under the org PM intent gate

## Assessment

The owner has identified the missing capability precisely: the current UI
promises Thursday drafts while no hosted trigger invokes the generator.
Activating a reliable hosted execution path solves the reported problem
without requiring a recipe algorithm, identity or database redesign.

The intent preserves the owner-selected Thursday 09:00 America/Toronto outcome,
the existing forthcoming-week and unique-recipe semantics, and preservation of
all existing drafts/history. Acceptance distinguishes configured triggers,
observed hosted execution and deterministic local calendar tests. This prevents
a second false claim that deployment alone establishes unattended scheduling.

The request explicitly includes staging validation and preparation for a later
Production approval. Existing isolated staging work necessary for that proof
is in scope. Production deployment, configuration, activation and new paid
features are outside the current authority. No previous release approval is
reused.

## Design obligations and risks

1. Verify current platform plan/scheduling constraints and DST behavior from
   official sources before choosing cron expressions. Escalate any material
   difference between requested 09:00 delivery and available guarantees, or
   any new cost; do not silently substitute an hourly best-effort promise.
2. Preserve machine/user authentication separation and the global scheduler's
   exclusion of synthetic families. Staging evidence needs a reviewed real or
   rollback-only isolated data procedure, not an expanded verification bypass.
3. Keep exact-source staging evidence and explicit gaps in the release package.
   Production activation must remain gated after local/staging success.

No product ambiguity blocks Design. The architect and independent reviewers may
resolve technical choices within these requirements; material timing, cost,
schema or authority expansion returns to the owner.

## Evidence

- `intent/weekly-meal-planning/scheduler-runbook.md:3` records no installed job
  and unactivated hosted scheduling.
- `app/plans/page.tsx:24` displays the scheduled Thursday expectation based on
  `MEAL_PLAN_DRAFT_DAY` independently of whether a hosted trigger exists.
- `scripts/generate-meal-plans.ts:6` owns CLI invocation and actual server time;
  no application route currently invokes its generator.
- `intent/staging-first-release/spec.md:10` establishes exact-source staging,
  owner acceptance and the separate Production release sequence.

This is a PM scope acceptance, not spec/plan approval, implementation review,
staging acceptance, human merge approval or Production release authorization.

## Owner amendment accepted — 2026-11-26

Rafael explicitly selected Vercel Hobby cron with up to one hour of delivery
delay and changed the intended day to Wednesday at 09:00 Eastern time. The
PM accepts the amendment appended to the intent: hosted delivery is Wednesday
09:00–10:00 America/Toronto, with DST preserved and no paid upgrade. The earlier
Thursday outcome and concern about exact-minute Hobby delivery are superseded
by this concrete owner choice; the incident findings remain historical.

Set hosted `MEAL_PLAN_DRAFT_DAY=Wednesday` so the UI describes the actual
reviewed schedule. Preserve CLI compatibility where possible. Today's Thursday
staging request is off-day evidence, not a due-run observation; due-storage
coverage must be attributed to the approved rollback-only or local procedure.
Production activation and release authorization remain pending.
