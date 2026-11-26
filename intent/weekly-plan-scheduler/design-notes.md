# Hosted scheduler — architecture evidence

Author: architect. Inspected 2026-11-26. This research does not activate a job.

## Platform constraints

The live team inspection supplied by the orchestrator reports the existing
`rafalotufos-projects` team on Hobby. Current official Vercel documentation
states cron's precision is within the scheduled hour on Hobby, compared with
minute precision on Pro/Enterprise. A paid upgrade is not authorized. A cron
expression targeting 09:00 therefore cannot promise a 09:00 start on Hobby.
[Usage and pricing](https://vercel.com/docs/schedules/cron-jobs/usage-and-pricing).

Vercel's newer Schedules beta supports named timezones but Hobby imposes a
15-minute jitter window, so it does not remove the timing limitation. It also
introduces a new beta platform feature without an established repository
operational contract. Keep this correction on the existing cron mechanism
unless the owner selects a different approach.
[Schedules limits](https://vercel.com/docs/schedules/limits).

Native cron invokes Production only; Preview testing must call the deployed
handler directly. Delivery is best effort, can duplicate or miss, and failures
are not automatically retried. `CRON_SECRET` is deployment-captured and delivered
as a Bearer authorization header. A cached/redirected response can prevent
execution. Check routing/authentication and the installed definitions after
activation; deployment readiness alone cannot prove a scheduled delivery.
[Managing cron jobs](https://vercel.com/docs/schedules/cron-jobs/manage-cron-jobs).

Cron uses UTC. The owner subsequently selected Wednesday09:00ET and accepted Hobby's one-hour
delay in the active chat. Weekly `0 13 * * 3` and `0 14 * * 3` invoke the same service
handler: 13UTC is 09EDT/08EST; 14UTC is 10EDT/09EST. The application retains the
actual America/Toronto configured-Wednesday-at-or-after09 due check. The earlier winter
invocation skips; the later summer invocation is an idempotent retry. This
retains DST behavior without an automatic time-change deployment.
[Cron reference](https://vercel.com/docs/schedules/cron-jobs).

## Routing evidence that must be checked

The existing service accepts only its configured canonical Host. Native cron
chooses its Production request target; the cron path cannot specify an external
origin and redirects do not deliver the work. Confirm the actual cron domain
selection is compatible with `https://lotufo-meals.vercel.app` before activation.
Use a separately reviewed explicit `MEAL_PLAN_SCHEDULER_ORIGIN` machine-only
origin, scoped to this exact authenticated route; do not widen browser canonical
Host acceptance or trust a client forwarding header. Live project inspection
reports Production automatic alias
`meal-planner-rafalotufos-projects.vercel.app`. This is the proposed native
service-origin choice, not verified scheduled dispatch. Preview
validation uses only its existing canonical staging origin. `VERCEL_URL` is
not used to guess or widen the set of permitted targets. A manually invoked canonical handler on
Preview proves the handler only, not Production platform dispatch.

## Existing storage and identity boundary

`generateDuePlans` already uses bounded keyset family pages, the common
transaction advisory lock, current persisted member eligibility, a unique
family/week key, immutable existing plans and exclusion of synthetic families.
Its SQL selects only ready curated snapshots. Preserve those decisions.

The new route uses a dedicated service credential, never a Google cookie or a
verification identity. Existing verification cookie issuance cannot authorize
this privileged operation. A narrow exact-path Proxy exclusion is appropriate
only when the handler independently rejects noncanonical Host and supplies the
same private/security headers on every method and failure.

The existing request-owned deadline pool and transactions in
`lib/db/connection.ts` can bound schema admission, family paging and each
per-family transaction. Reuse them without adding a migration or weakening
ordinary DB callers. Partial successful family transactions may remain committed
if a later family fails; an authorized same-day rerun safely reconciles them.

## Staging proof

The read-only inventory found one real Google staging household, zero menu
recipes and zero plans. Today is Thursday, off-day for the owner's amended
Wednesday schedule. Direct Preview calls can prove authenticated offday skip
and rejection guards, not a due HTTP mutation or unattended Preview delivery.
A reviewed operator probe may use a deterministic Wednesday clock solely inside
an owned rollback-only transaction on the recorded isolated Preview target. It
inserts at most seven transient menu snapshots, exercises the same per-family
core twice, verifies created/repeat behavior and rolls everything back. Read
before/after aggregate counts and hashes to prove preservation. This is a
separate storage proof class, never a claim the deployed route used that clock.
No runtime date override, fake Google user, widened allowlist or synthetic
family exception is introduced. No Production data or credential is involved.

## Installed framework grounding

Read installed Next16.4.6
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`
on 2026-11-26. The service route exports all seven supported HTTP methods
explicitly; authenticated GET alone performs work and HEAD/OPTIONS do not gain
implicit successful dispatch. Use the Web Request/Response API and explicit
Node runtime/dynamic execution. Preserve Node24 and unrelated build settings.
