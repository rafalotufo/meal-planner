# Weekly family meal planning — specification

- Author: architect
- Date: 2026-11-24
- Status: Approved
- Independent approval: `org/reviews/weekly-meal-planning-plan-001.md`
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

## Owner presentation amendment — seven recipes without assigned dates

Source: `org/messages/ceo-0051.md`.

Owner steering on2026-11-24: “No need to label recipes with dates. Lets just have
7 recipes for the draft.” This amendment changes presentation only. The week
remains the Sunday–Saturday scheduling/history context, with its date range at
the top. The draft, final plan and retained history each display seven recipe
cards without individual weekday or date labels and without date elements in
cards. A recipe title is each card's heading; remove the separate weekday/date
heading. Saved-menu select labels identify the recipe being replaced rather than
Sunday/Monday/etc, retaining a unique accessible association with each control.

Existing zero-based slot indices continue to identify the seven stored entries
and action targets internally; the UI does not promise a particular weekday
assignment. Scheduling, Toronto calendar logic, schema, seven-snapshot ordering,
variety/recency, revisions, approvals, suggestions, finalization and the top-level
week range remain unchanged. Apply the same presentation to immutable final
and historical plans. This narrowly supersedes the individual dated dinner
presentation described above; it adds no new behavior or source paths.


## Owner follow-up amendment — no numeric dates in the main plan header

Source: `org/messages/ceo-0052.md`. Pending independent review before source
changes. This supersedes every retained-header-range presentation assumption in
the original specification and first presentation amendment. The main plan header
must show the seven-recipe plan without a numeric week/date range. Individual
cards remain recipe-title-headed and undated. This applies consistently to draft,
final and retained historical plan views. Week dates remain only inside history
controls (recent-week links and the labelled retained-week date selector), where
they distinguish which plan to open. The schedule explanation may retain weekday
words and Toronto generation time; no numeric date range is added elsewhere in
the main plan content or empty states.

Retain Sunday–Saturday calendar boundaries, stored week_start and slot identities,
generation/recency, revision handling, approvals, swaps and finalization unchanged.
This is a bounded presentation correction, not schema, authentication, scheduler,
route or deployment scope. No new source path is required.

## Owner behavior amendment — carry unrelated suggestions into the new revision

Pending independent review before source changes. Supersedes the original rule
that accepting a swap marks every other pending suggestion stale. Inside the
existing common-lock READ COMMITTED transaction, accepting a current-revision
suggestion applies its validated saved-family recipe as before, increments the
plan revision and clears approvals. Mark the chosen suggestion accepted and
other pending suggestions for that same recipe slot stale. Carry pending
suggestions for every other slot forward by updating only their base_revision
to the new plan revision. Preserve their IDs, proposing users, recipe snapshots,
menu recipe IDs, pending status and created timestamps. Their appearance and
accept/reject actions remain available on the refreshed current revision.

The overall client revision remains mandatory: requests carrying the old revision
return409, including a concurrent accept on a different slot. That request must
not consume or stale its unrelated pending suggestion; after refresh the same
suggestion can be resolved using the new revision. Other plans/families and
historical accepted/rejected/stale rows remain untouched. Keep the existing
partial pending unique constraint and100-pending-per-revision bound; moving a
subset forward cannot add pending suggestions. Finalization closes the remaining
pending suggestions normally. No migration, API union, scheduler, admission,
family isolation or approval behavior change beyond this scoped carry-forward.

## Owner uniqueness amendment — one to seven distinct weekly recipes

- Status: Approved by independent org review (`org/reviews/weekly-meal-planning-unique-plan-001.md`)
- Source: `org/messages/ceo-0054.md`; owner reports repeated recipes and requires “There should never be
  repeated recipes”; on menus with fewer than seven recipes, owner chooses a
  draft containing the available unique recipes rather than waiting for seven.
- Supersedes the original exact-seven/cycling requirement everywhere above.
  The no-card-dates/no-main-header-dates and unrelated-suggestion carry-forward
  amendments remain in force.

### User-visible contract

Each draft contains **one to seven unique recipes**, identified by the existing
normalized canonical `sourceUrl`, not menu-row IDs or titles. Zero saved recipes
still produces no draft. With one, two or six saved recipes, generate exactly
one, two or six cards; with seven or more, generate at most seven. Never cycle
candidates to fill the week. Repeating a recipe in a later week remains valid;
the existing eight-week recency preference still encourages between-week variety.

Use the actual displayed recipe count in the main heading, any count label and
confirmation text, including singular “1 recipe”. Do not promise seven dinners
when fewer are available. Explain that saving more recipes can fill the weekly
plan, without suggesting duplicates are allowed inside it. Cards and main plan
header remain undated; calendar dates remain only in history controls. Internal
indices identify recipes, not weekday assignments, and range from zero through
`meals.length - 1` within the existing maximum of six.

### Generation, validation and swap invariants

Generation retains the existing eligibility, family lock, bounded query,
recency ranking, deterministic week tie-break and idempotent nonregeneration.
Emit each selected candidate once; any week-dependent rotation preserves the
candidate count and uniqueness. Compare canonical `sourceUrl` throughout.

Extend snapshot parsing from exactly seven to one through seven valid snapshots.
Ordinary draft parsing also requires unique canonical sources. A malformed,
empty, over-seven or duplicate draft is unavailable, never silently changed by
a read. The explicit migration below repairs existing legitimate duplicate
drafts before the new runtime opens the upgraded schema. Validate user-supplied
indices against the selected plan's actual length under the lock, in addition
to the existing generic integer0–6 body validation; out-of-range input is400.

Before storing a suggestion, under the common family write lock reject a
replacement whose canonical source already appears anywhere in the plan. Return
409 with a useful safe message, e.g. “That recipe is already in this plan.
Choose another saved recipe.” This includes choosing the current slot's recipe;
no no-op or duplicate proposal is created. The UI filters all currently planned
sources out of replacement choices, not just the target card's source. Server
checks remain authoritative for stale clients, re-saved menu IDs and direct HTTP.

Accept re-reads the current saved-family replacement as before and, before any
write, repeats the canonical uniqueness check against every other current slot.
A pending replacement may have become used by another accepted suggestion.
That proposal remains pending and visible: accepting it returns a useful409,
while rejecting it still works. Do not auto-delete/stale that unrelated proposal.
The reject path must not require a replacement to be unused or still saved.

Preserve the reviewed carry-forward rules: accepting a valid unique swap bumps
the plan revision, clears approvals, accepts the chosen proposal, stales only
same-slot competitors and carries other-slot pending proposals forward by changing
only base_revision. No content/identity loss for unrelated suggestions. Concurrent
requests with old revisions receive409; after refresh a retained suggestion may
be accepted if unique, or rejected if its recipe is now used. The client renders
the bounded safe duplicate-conflict message as text with refresh/reject guidance,
not the existing misleading implication that refresh necessarily fixes it.
Finalization requires a valid one-to-seven unique draft and remains immutable.

### Additive schema migration and repair of existing drafts

Append **`0003_unique_weekly_recipes.sql`** to the reviewed PostgreSQL migration
journal. Never rewrite0002 SQL, its hash/timestamp or already applied history.
Replace its meals-cardinality constraint with JSON-array length between1and7;
keep status/timestamp/revision/ownership constraints and existing indexes.
Application validation enforces canonical snapshot shape and uniqueness. Runtime
migration metadata and exact catalog must match the new fourth migration.
Existing grants remain unchanged: no new runtime privileges or schema capability.

The same explicit SQL migration also repairs existing duplicate **drafts**, past
or upcoming, preserving all first-occurrence recipe snapshots and their relative
order. Stored valid snapshots from the existing writer already carry canonical
sourceUrl values. Use that canonical key, not title or menu ID, to group them;
compacting a draft must not reload recipes from today's menu, which would lose
saved edits or removed-recipe snapshots. Missing/malformed source keys must abort
repair rather than silently discard content. General repair of arbitrary corrupt
snapshot JSON remains outside scope and existing fail-closed validation remains.

The migration runner already owns migration advisory lock73462902. The **first
statement** of0003 must acquire `pg_advisory_xact_lock(73462901)`, the common
FAMILY_WRITE_LOCK, before **any application-table ALTER, validation or repair
statement**, inside that existing single-connection READ COMMITTED transaction.
Mandatory order is73462902 then73462901, then table locks/access. Taking an ALTER
exclusive table lock before the family advisory lock can deadlock a runtime
writer that holds the family lock and waits for table access; never use that
order. The additional family lock supplements, rather than replaces, the runner's
migration lock.
Build transaction-local mapping from each affected plan's old index to the
compacted first-occurrence index. Materialize the affected IDs, original revision,
compacted meals and mappings before updates, using transaction-local temporary
structures or CTEs. No persistent helper table/function or runtime grant is needed.

For each affected draft only:

1. Preserve its id/family/week/status/created/finalized values. Replace meals with
   the first snapshot for each canonical source in original order and increment
   revision exactly once. If increment would overflow the existing integer
   revision bound, fail/roll back the migration; never reset a revision silently.
2. Delete its approvals so old content approvals cannot survive the change.
3. Remap only current-original-revision pending suggestions using the old-index
   mapping. Preserve IDs, proposing users, menu IDs, recipe snapshots, status and
   created timestamps for retained proposals; set their base_revision to the new
   plan revision and day_index to the compacted target index.
4. Duplicate target cards can merge several proposals from the same user into
   one partial-unique-index key. Select a deterministic winner per affected
   plan/user/new-index by oldest created_at, then id. Mark losing proposals stale
   **before** remapping winners, so no transient uniqueness violation occurs.
   Retained proposals whose replacement is already elsewhere in the compacted
   plan remain pending/rejectable, subject to the new acceptance409 rule.

Untouched unique drafts retain meals/revision/approvals/suggestions byte-for-byte.
Other plans' nonpending and noncurrent-revision rows remain unchanged. A source
family cannot influence another family's mapping. The migration is atomic and
its ordinary journal idempotency prevents repeat bumps/repair. No GET/HEAD,
render, session read or scheduler invocation repairs an existing draft.

Finalized rows, their snapshots and historical proposal/approval facts are never
rewritten. Legacy finalized plans may contain duplicate raw entries from the
old release. Their read path accepts otherwise valid one-to-seven historical
snapshots, projects first-occurrence canonical sources once for display and shows
a clear legacy note that the original finalized plan contained repeated entries.
Keep the original count available for honest wording; do not represent this as
a historical data correction. This status-specific legacy path must not relax
unique-draft parsing or permit duplicate finalization. Eight-week recency still
reads the retained raw finalized snapshots and computes max-use per source.

Add a disposable-test rollback for0003 before the existing weekly/menu/initial
rollback. Since compacted valid plans cannot be padded without reintroducing
repeats, a standalone0003 rollback restores the previous exact-seven constraint
only when all remaining plans satisfy it; otherwise fail explicitly. Never pad,
delete or silently mutate plans to make rollback pass. Full clean-database tests
may drop the weekly tables via their existing reviewed rollback before removing
that migration-history entry, provided ordering and journal completeness remain
explicit and tested. Update count assertions3->4 without weakening prior checks.

### Verification and authority for this amendment

Write real red tests before source edits. Cover menus1,2,6,7,8+; recipe identity
when a source is removed/re-saved under a new menu ID; direct duplicate proposals;
locked acceptance when two pending slots propose the same unused replacement;
retention/rejection of the now-conflicting pending proposal; stale concurrent
accept409; dynamic slot bounds and counts; all previous carry-forward/approval
reset/finalization/isolation assertions.

Migration fixtures must apply genuine0000–0002 SQL/history before0003, then seed
mixed duplicate drafts, already unique drafts, finalized duplicates, approvals
and competing/unrelated proposals. Assert first-snapshot/order preservation,
correct slot/cohort remap and deterministic losers, exactly one revision bump,
approval invalidation only where required, no cross-plan/family/history mutation,
unchanged finalized raw snapshots, readable legacy final projection, idempotent
rerun, exact catalog/hash/grants, rollback and untouched prior migration bytes.

Real HTTP/browser tests must no longer accept the same replacement into two
cards. Show the pending second suggestion survives the first acceptance but is
blocked from duplication and can be rejected, then use a different unused
replacement to complete the ordinary successful flow. Verify distinct card URLs,
variable card counts, accurate headings/confirmation, no card/main-header dates,
mobile320/desktop1440, historical readability and genuine UI events. Retain all
unrelated workflow/auth/security assertions and run the full required commands.

This amendment authorizes local implementation, isolated-test migrations and the
necessary reviewed local repair of the owner-reported duplicate draft. Apply that
local migration only after regression checks and independent security/source
review, using the existing owner/runtime tooling; root verifies the precise
dedicated local target before that operation. No hosted
migration, deployment, merge, paid call or job activation is authorized. Preserve
uncommitted user changes to `next-env.d.ts` untouched.

Verification must preserve the owner's active dev server and its `.next` cache.
Root prepares a private temporary source copy with the current approved/pending
manifest sources, pinned dependency link and private test configuration, runs
required checks/browser there and returns feature evidence. Do not stop the
owner's server, regenerate this checkout's `next-env.d.ts` or commit its existing
dev-path change. This test arrangement adds no runtime/framework configuration.
