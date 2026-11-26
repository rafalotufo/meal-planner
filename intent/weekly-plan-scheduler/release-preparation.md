# Wednesday weekly scheduler — production approval package

Status: ready for owner staging acceptance, merge and Production release approval; no Production authorization recorded.

The owner selected native Vercel Hobby cron on Wednesday at09:00
America/Toronto, accepting delivery during09:00–09:59. Two UTC definitions,
`0 13 * * 3` and `0 14 * * 3`, handle daylight and standard time. The early
winter call skips; the later summer call normally reports an existing plan
and can reconcile an earlier failure as late as10:59. Native delivery is best
effort; there is no exact-minute SLA or automatic platform failure retry.

## Fixed source and acceptance

The fixed releaseSourceSha is `7fe1531d07f2fb6028c98e4f38b73d20f805e5fa`.
It passed independent [code](../../org/reviews/code-weekly-plan-scheduler-001.md)
and [security](../../org/reviews/security-weekly-plan-scheduler-code-001.md)
review, required build/lint/typecheck,334Node tests,7workflow tests and local
real-Chrome320/1440 verification.

[Exact-source staging validation](staging-validation.md) completed on Ready
Preview `dpl_773UDFo49UGV7yyzG4d5QdF49tRb`, profile
`0e9720bd59672d42d883cd024fc227e3643ebe88bfff42039ce899e0027cf7a6`.
All13protected HTTPS checks passed; the separate Preview rollback-only storage
probe passed creation/repeat/draft/final preservation and unchanged hashes.
The staging alias is retained on that build; Production remains unchanged.

Owner acceptance must explicitly include the limits recorded there: actual
hosted due-Wednesday HTTP writes, native cron request Host/first unattended
run, hosted disconnect behavior and hosted Google/member UI/provider success
were not observed. Local/rollback proof is not relabeled as those observations.
The inherited moderate esbuild advisory remains with zero high/critical findings
and its existing2026-12-01 reassessment; no runtime WebSocket feature was added.

The requested decision is acceptance of that exact staging source/profile and
named coverage, human merge of the reviewed feature/audit artifacts, and fresh
bounded Production configuration/build/promotion/activation/recovery authority
below. Later audit HEAD is distinct: export/build Production from the fixed
releaseSourceSha above. Any runtime source/configuration drift requires fresh
attributed staging validation and acceptance. No approval is implied by this
package or prior releases.

## Proposed bounded Production scope

After owner acceptance of the completed package only:

1. Verify the fixed source, committed independent reviews, clean upload blobs,
   recorded Production database target and unchanged seven-identity catalog.
   No schema migration, grants, data import, paid plan or provider call.
2. Configure a fresh independent sensitive Production `CRON_SECRET` of32random
   bytes, `MEAL_PLAN_SCHEDULER_ENABLED=true`, `MEAL_PLAN_DRAFT_DAY=Wednesday`
   and `MEAL_PLAN_SCHEDULER_ORIGIN=https://meal-planner-rafalotufos-projects.vercel.app`.
   Preserve canonical browser `BETTER_AUTH_URL=https://lotufo-meals.vercel.app`,
   existing Google/provider/database credentials and unrelated configuration.
   Never reuse the Preview credential or put secrets in argv/audit output.
3. Build a separate Production candidate from the same fixed releaseSourceSha
   with `--prod --skip-domain`. Inspect project, source, target, Node24,
   route duration90 and registered cron path/schedules/target metadata where
   exposed. Reinspect the fixed automatic Production alias against the configured
   service origin. A known target mismatch blocks promotion/activation and needs
   a reviewed compatible correction; never broaden browser Host policy to pass
   a check. Actual native request Host is a post-activation observation and
   cannot be certified by a candidate that has not received a native invocation.
4. Manually promote that inspected Production candidate. Verify all existing
   Production aliases, canonical anonymous health and unchanged staging mapping.
   Monitor credential-free runtime errors/status for15minutes. No real
   Production login, provider request or fake data is part of routine health.

Current compatible recovery target is Production
`dpl_GL3gRCVHKknoJjBacFhwNbm2d1oo`, release source
`4fe9097657df1c641d511a276c81ec3ae118f8ee`, which has the same schema contract
and no cron definitions. Proposed recovery authority is a rollback to that exact
artifact during the bounded release observation on required health failure,
after verifying compatibility has not drifted. It does not authorize data
deletion, schema rollback, project pause or a future unrelated recovery.

## Native delivery observation

Preview never executes native Vercel cron. Manual hosted handler validation
cannot certify an unattended delivery. If activated before then, the next
scheduled opportunity is Wednesday2026-12-02,09:00–09:59ET (14:00–14:59UTC).
Check installed target/Host and the aggregate completion event, then verify
only missing upcoming family weeks were created and existing plans preserved.
This first-run observation is pending, not a fabricated pre-release pass.
Any additional operator retry, off-day backfill or corrective Production work
needs concrete scope; no client date override or history reset is introduced.

## Approval boundary

The requested work authorizes isolated staging validation and preparation.
It does not authorize Production configuration, build, promotion or activation.
The [org workflow](../../org/protocol.md) reserves human merge and release gates;
the [staging-first contract](../staging-first-release/spec.md) additionally
requires owner acceptance of the exact source, Preview profile and stated gaps.
The exact source, staging deployment/profile, coverage limits and proposed
actions above are the reviewable basis for a combined, explicitly scoped decision.
