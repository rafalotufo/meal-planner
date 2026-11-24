# Weekly draft worker — activation runbook

The worker and template are implemented for separately authorized local activation.
No job is installed. Hosted/Production scheduling is unactivated. This worker does
not run inside Vercel. No hosted migration, deployment or scheduler activation is
part of this feature implementation. Preserve the staging-first release gates.

After explicit activation authority, use Node24 and the existing restricted
runtime DATABASE_URL in an owner-only `.env.local` (mode600). Apply the reviewed
migration separately using the owner operation; the worker never migrates.
Set `MEAL_PLAN_DRAFT_DAY=Thursday` or another full English weekday. Unset defaults
to Thursday; empty/invalid values fail closed. No paid provider keys are needed.

Manual due check: `pnpm run plans:generate`. The CLI accepts no arguments, date,
identity or family overrides. Its only output is aggregate counts or a generic
error and nonzero exit. Inspect the exit status; never put credentials into argv,
logs or the plist. The restricted runtime role/local account are the service's
credentials. Keep the working directory and environment private.

For later authorized activation, copy `weekly-meal-plans.plist.example` privately,
replace `ABSOLUTE_NODE24` with the absolute Node24 binary and `PRIVATE_PROJECT`
with the absolute project directory, and review the resulting arguments and file
permissions before installing into that local account's LaunchAgents. Installation
and `launchctl bootstrap` require separate authorization and are deliberately not
performed here. Deactivation unloads/removes that owned LaunchAgent; it does not
delete plans. Do not install the template while it still contains placeholders.

The hourly RunAtLoad/StartInterval trigger invokes application logic using
America/Toronto time regardless of the host timezone. On the configured weekday,
the first successful run at/after09:00 creates the following strictly subsequent
Sunday–Saturday draft. On Sunday this means next Sunday. Earlier/off-day calls
skip. Retries preserve existing drafts and final weeks; empty menus and families
without eligible persisted members are skipped. A later same-day retry can create
a draft after menu additions. Malformed allowlists fail closed.

A machine stopped for the entire due day misses that week's draft. There is no
historical backfill or off-day catch-up. Failures should be investigated from the
exit status and database availability without printing secrets; retry only on the
due day. Existing history and current family edits are never regenerated. A hosted
scheduler needs separately reviewed integration and release/activation authority.
