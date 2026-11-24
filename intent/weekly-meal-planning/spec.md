# Weekly family meal planning — specification

- Author: architect
- Date: 2026-11-24
- Status: Draft for independent org peer review
- Inputs: accepted `intent.md`, saved `brainstorm.md`, PM review

## Outcome and scope

A protected `/plans` screen lets the family react to an automatically generated
Sunday–Saturday draft. Each dated day has one dinner from the saved menu.
Members approve the current draft or propose a concrete replacement. Any current
eligible member can accept/reject suggestions and confirm the week. There is
no attendance/away option, new family role, notification, cooking assignment,
recipe editing or AI/provider call.

The PM defaults become these explicit design choices: seven dinners;
America/Toronto calendar time; generation after 09:00 on the configured weekday;
shared-member confirmation; history of finalized **planned**, not consumed,
meals. A finalized plan is immutable, including current/upcoming weeks. The UI
warns before confirmation that later edits are unavailable in this increment.
Actual-consumption tracking and correction/reopening are deferred.

## Calendar and automatic scheduler

`MEAL_PLAN_DRAFT_DAY` is a server environment setting accepting full English
weekday names case-insensitively after trimming, default `Thursday` only when
unset. Empty/invalid values fail closed with a configuration error. Use fixed
`America/Toronto`, not the execution host timezone. Date helpers use calendar
arithmetic on ISO dates; derive Toronto date/weekday/hour via Intl format parts.
Never add 24 hours to a local midnight to advance a calendar date.

A trusted `scripts/generate-meal-plans.ts` CLI runs due work. The CLI takes no
client identity/family/date overrides; production time is `new Date()`. The core
function accepts an explicit clock only as an ordinary dependency for tests,
not through an environment or HTTP bypass. Before 09:00 or on another weekday
it reports skipped, writes nothing and exits successfully. A due run targets
the first Sunday **strictly after** its Toronto run date; a configured Sunday
therefore targets the following Sunday. Generate seven dates through Saturday.

Prepare a macOS launchd plist template with absolute Node/project placeholders,
`StartInterval=3600`, `RunAtLoad=true`, and a private working directory. The
program invokes Node24 with `--env-file=.env.local --import tsx` and the CLI;
secrets stay in the existing owner-only environment file, never in the plist.
The hourly trigger allows application logic to own Toronto time and configured
day without relying on host timezone. After 09:00 the first successful run
creates the draft; duplicate runs leave it unchanged. No historical backfill
or off-day catch-up. A machine stopped for the entire due day misses that week;
this limitation is visible in the runbook.

The CLI is a privileged local service operation authenticated by possession of
the restricted DATABASE_URL and local account access, not a public endpoint.
Use `openDatabase` and existing runtime schema validation, never migrate. Validate
the server allowlist before any work; enumerate family IDs in keyset pages of
100, one single-connection transaction per family. Acquire the existing common
write advisory lock before checking family existence, eligibility, existing
week, menu or recency. Inside the lock require at least one persisted member
currently eligible through an invitation grant or validated allowlist match.
Malformed allowlists fail closed even for granted users. Membership alone does
not qualify. Do not mutate user email, admission, family membership or invites.

Unique `(family_id, week_start)` and transaction locking make retries/concurrent
workers safe. Existing drafts/final plans and family edits are never regenerated.
Empty menus skip creation without inventing meals; later due-day retries can
create after recipes are saved. Failures return a nonzero process status and a
generic credential-free error; successes report aggregate counts only. No paid
keys, titles, emails, family IDs or connection URLs are logged.

**Activation boundary:** implement/test the CLI, plist template and runbook;
do not install or bootstrap launchd, change `vercel.json`, add auth-policy
exceptions, activate hosted scheduling, or deploy. This implementation is ready
for an explicitly authorized scheduler activation, not evidence an unattended
Production job is already running. A hosted scheduler requires a separately
reviewed release integration; the local worker is not claimed to run inside
Vercel. Reads, render, Proxy and session checks never create drafts.

## Variety algorithm

Use only the target family's saved menu. Consider finalized weeks earlier than
the target week and within the previous eight weeks. Drafts do not affect
recency. Match recipe identity by normalized saved `source_url`, so removing and
re-saving a recipe cannot erase its recent-use identity.

Select up to seven distinct menu rows ordered by their latest finalized use
(oldest first, never-used before used), then by a deterministic per-week tie
break, e.g. PostgreSQL's built-in `md5(week_start || source_url)`, then source URL.
Return at most seven candidates; use indexed family/week history filtering and
at most eight matching weekly records with seven JSON meal elements each. No
unbounded application-side menu/history loading. Query statement timeouts stay
in force. Retain safe stable ordering for exact ties.

Place these candidates into seven dates; if fewer than seven recipes exist,
cycle through them. Use deterministic week-dependent placement so a tiny menu
need not put every recipe on the same weekday every week. Repeats are valid;
with seven or fewer saved recipes a different set every week is impossible.
The UI explains that adding menu recipes gives future drafts more variety.
With at least fourteen recipes and a finalized prior week, the next draft can
select seven recipes absent from that prior week. Tests prove this observable
behavior, rather than merely matching implementation sort order.

## Persistence and schema compatibility

Add reviewed explicit migration `0002_weekly_meal_planning.sql`; preserve the
original SQLite and previous PostgreSQL SQL bytes. Update the PostgreSQL journal,
runtime migration hashes and exact catalog from an owned migrated disposable
database. No runtime schema-builder/ORM imports. Add a test-only rollback for
the new tables, run before menu/initial rollback in existing storage tests.

Use three family-owned entities:

- `meal_plan_weeks`: UUID text id, family FK, Sunday `week_start` date, integer
  positive revision starting at 1, `draft|final` status, seven-element `meals`
  JSONB array, safe bigint created timestamp and nullable finalization timestamp.
  Unique family/week; index family/week descending. Each array item is a complete
  validated existing MenuRecipe snapshot; its array index is Sunday=0 through
  Saturday=6. Week selection strings are strict actual ISO Sunday dates; cast
  PostgreSQL DATE to text when reading. Enforce array length/type, status/final
  timestamp consistency, safe timestamps and positive bounded revisions in SQL.
- `meal_plan_approvals`: plan FK, current member user FK, revision and timestamp;
  unique plan/user. Store only existing user identifiers, no duplicate email.
- `meal_plan_suggestions`: UUID text id, plan FK, proposing user FK, base revision,
  day index 0–6, menu recipe id (no deletion-cascading menu FK), complete recipe
  snapshot JSONB, `pending|accepted|rejected|stale` status and safe timestamp.
  A partial unique index allows one pending suggestion per plan/revision/day/user.
  Index plan/revision/status. Limit total pending suggestions at one revision
  to 100 under lock; reject further input with a useful 409 until resolved.

Family ownership always derives through the matched plan's family. Approval
and suggestion inserts verify the proposing user belongs to that same family
inside the transaction. No FK to menu rows may erase history on menu deletion.
Validate all stored snapshot shapes via existing `parseMenuRecipe` semantics;
malformed rows fail as unavailable, never become trusted client props.

Explicit migration grants: existing restricted runtime retains its old grants;
add SELECT/INSERT/UPDATE for weeks and suggestions and SELECT/INSERT/UPDATE/DELETE
for approvals (accepted content changes clear approvals). Do not grant weekly
DELETE/TRUNCATE/DDL or migration-history writes. Tests verify denied operations.
Update domain row/types without importing a runtime schema builder.

## Read and mutation interfaces

`/plans` is a server page guarded first by `requireFamilyContext` from session.ts,
then the current cryptographic/admitted identity for store calls. Reads recheck
`requireMember` and derive family IDs server-side. Use existing Proxy coverage
without altering matcher or public exceptions.

Query parameters: optional `week=YYYY-MM-DD` (actual Sunday) and optional
`menuAfter` (existing strict menu cursor) only. Reject arrays/duplicates/unknown
keys. Default to latest existing current/upcoming week; if absent show the
current-week empty state with the configured next-draft explanation. Return
bounded history links (12 prior finalized weeks, with a labelled week-date
selector to open any older retained week), selected week, current member's
approval, current-revision approvals,
current pending suggestions (max100), and one existing 50-recipe menu page.
Menu choice pagination preserves the selected week and permits selecting older
saved entries. No private allowlist, secret or family ID enters props.

Implement one `POST /api/plans/[id]` with strict action body unions:

- `{ action: 'approve', revision }`
- `{ action: 'suggest', revision, day, menuRecipeId }`
- `{ action: 'accept', revision, suggestionId }`
- `{ action: 'reject', revision, suggestionId }`
- `{ action: 'finalize', revision }`

Exact required keys; UUID IDs; integer day0–6; positive safe bounded revision;
no client-supplied family/user/week/snapshot. Require family context, current
identity, canonical same-origin JSON and existing bounded reader before store
effects. Preserve Proxy canonical Host, identity/admission and private/security
headers. Provide explicit handlers for all seven supported HTTP methods; methods
other than POST are protected 405 with `Allow: POST` after family enforcement.
No API GET creation or HTTP scheduler endpoint is added.

Every mutation executes in the existing locked READ COMMITTED transaction and
rechecks `requireMember` before decision reads. Query plan with both id/family;
foreign/missing IDs return generic404. Reject stale revision, finalized plans,
and plans whose week is before the current Toronto Sunday with409. Past drafts
remain read-only/unfinalized, excluded from recency; no automatic archival writes.

Approval is idempotent for the same member/revision. Suggestion takes a fresh
current-family menu snapshot; same pending member/day/revision/recipe retry
returns success, another replacement conflicts until the first is resolved.
Suggesting the already planned recipe is invalid. Accept rechecks that the menu
row is still saved by that family, applies its validated snapshot, increments
plan revision, clears approvals and marks other pending suggestions stale.
Reject affects only the identified current-revision pending suggestion. Repeated
accept/reject does not reapply a change; stale action gets409 and refresh guidance.
Finalization needs no unanimous response: explicit confirmation warns that pending
suggestions will be closed, keeps meals/revision and valid approvals, marks
remaining pending suggestions rejected, sets final status/time atomically.

Success returns `{ ok: true }`; client refreshes the server view. Errors use
existing generic FamilyError envelope:400 invalid input,401 unauthenticated,
403 admission/family/origin failure,404 inaccessible plan,409 stale/final/action
conflict,503 unavailable. No internal SQL/configuration detail is exposed.

## Presentation and accessibility

Add “Plan” navigation beside Menu using existing static server layout styling
and prefetch disabled. `/plans` has one main/h1, clear Sunday–Saturday date range,
draft/final label, Toronto schedule explanation and a responsive seven-day grid
(one column mobile, suitable desktop columns). Render titles as text and safe
external recipe links with existing URL validation; no new assets or server
photo fetches. Readable title/link snapshots survive menu removal.

Draft controls show “Looks good”, a labelled saved-menu select and “Suggest swap”
for each dinner, pending proposed replacement with explicit accept/reject, and
“Confirm week” with an inline confirmation step. No attendance control. Show
approval count without asserting silent members agreed; accepting a swap visibly
explains approvals must be renewed. History clearly says “Planned meals”. Final
and past weeks show no active mutation controls. Empty menu links to Menu/search;
missing draft and failed load are distinct states.

Client state is limited to form selection, confirmation and request feedback.
Use existing native controls, visible focus, >=44px actions, disabled pending
states, alert/status semantics, abort/timeout on requests and no optimistic
success. A409 prompts refresh;401/403 offer existing sign-in/access links. At
320px/1440px there must be no document horizontal overflow, including long titles.

## Verification and source grounding

Architect read the installed Next16.4.6 `01-app/01-getting-started/03-layouts-and-pages.md`
and `01-app/03-api-reference/03-file-conventions/route.md` in this worktree after
frozen install. Async searchParams/params, server page ownership and explicit
method exports follow those guides. Reuse Next/React/Tailwind versions already
pinned; no new dependencies.

Tests are strict TypeScript with Node's native runner/tsx. Calendar tests cover
Thursday/Sunday configuration, invalid/unset/empty env, before/after09:00,
year/month boundaries and both Toronto DST transitions. Integration tests cover
variety with >=14 recipes, small/empty menus, persisted snapshots, same-family
only reads/mutations, denied/revoked admission, current-revision approval,
concurrent workers/actions, stale edits, final/history immutability, malformed
snapshots, migration upgrade/rollback/catalog/grants and no GET/HEAD writes.
Scheduler tests exercise production core on isolated migrated databases and
validate CLI configuration/failures without development or hosted effects.

Real Chrome test uses existing test-process-only Google fixture and owned
server/profile/database; seed menu and invoke scheduler core only in the test
process. Exercise approve, suggest, accept (approval reset), stale conflict,
confirm and history at320/1440px, check focus/labels/no overflow/no attendance,
and save/visually inspect representative screenshots. No fake-user production
bypass or paid keys. Full required command list and manifest are in plan.md.
