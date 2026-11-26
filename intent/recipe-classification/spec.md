# Saved recipe classification — specification V1

- Author: architect
- Date: 2026-11-26
- Status: Approved by independent review `d891e35` of source `6c0933e`
- Auto-save amendment: Approved by independent review `3e69b40` of owner-requested amendment `eb1e15f`
- Input: accepted sibling `intent.md` (`b73ecf5`)
- Approval policy: PM intent and independent spec/plan review under `org/protocol.md`; human merge and hosted release gates remain separate.

## Product contract

Each recipe has at most one meal-role category: `main` (Main dish), `side`
(Side), or `veggie` (Veggie). Main includes vegetarian entrées; Veggie means a
vegetable accompaniment, not a vegetarian or allergen certification. `null` means
Unclassified. The menu displays that label honestly for legacy recipes, uncertain
inference and pending/failed URL imports. Classification never changes plan
composition, recipe eligibility, counts, search ranking, or scheduler behavior.

Admitted Google family members can change only this category on any saved entry,
including legacy, pending, processing and failed links. They choose one of the
three categories; there is no reset-to-auto, delete-category or broad recipe
editor in V1. This correction overrides subsequent curation/retry for that entry.
Removing and saving a recipe again creates a new entry with normal auto behavior.
Duplicate saves preserve the existing entry and its correction.

## Data and compatibility

Add shared `RecipeCategory = 'main' | 'side' | 'veggie'` and an optional nullable
`Recipe.category` field. Optionality is deliberate compatibility for historical
card producers and existing fixtures, not an unchecked enum. Canonical menu
parser output always carries `category: RecipeCategory | null`.

`parseMenuRecipe` accepts exactly the historical five keys or those five plus
`category`; missing category normalizes to null. Explicit undefined, invalid
strings/types and other extra keys are invalid. Preserve all existing text,
URL, time and unchanged-snapshot checks. `parseSavedMenuEntry`, polling and menu
save parsing must consistently accept both exact shapes and reject malformed
category. Existing search notebook cards and historical plan/suggestion JSON
snapshots normalize without writeback. Future snapshots may include the current
category; correcting a menu entry never rewrites existing plans or suggestions.
The historical OpenAI adapter remains historical and needs no new model prompt.

Use a new native SQL migration
`drizzle/postgresql/6e36359b-9b16-4642-a487-e4e5411ce477.sql`, dependent on
`557e80b6-f30b-452e-b563-12cff07158a5`, adding to `menu_recipes`:

- `category text NULL`, constrained to null or the three exact stored values.
- `category_overridden boolean NOT NULL DEFAULT false`, with a check that an
  overridden entry has a non-null category.

There is no backfill, new relation, index, trigger, function or policy.
The current runtime has table-level SELECT/INSERT/DELETE and only narrow
metadata-column UPDATE privileges. Append exactly
`menu_recipes.category: [UPDATE]` and
`menu_recipes.category_overridden: [UPDATE]` to the new compatibility profile;
the existing explicit migrator's `applyRuntimeGrants` applies these locally.
Retain existing column grants and deny table-level UPDATE and ownership/source/
saved-at updates. No hosted grant execution is authorized. Preserve role
restrictions and TEMP denial. Append the native identity,
SQL hash, required ID and exact post-migration catalog/grants profile to
`compatibility.json`, retaining every old descriptor/profile unchanged. Generate
the new profile from an owned disposable migrated database and inspect its small
catalog delta; never guess `pg_get_constraintdef` formatting. The original five
SQL files, Drizzle journal, `catalog.json`, `runtime-migrations.json`, SQLite
evidence and seven existing migration identities remain historical and unchanged.

The new runtime requires all eight identities and fails closed on an unmigrated
seven-identity database. Old binaries reject the new catalog; they are unsafe
rollback targets after a future cutover. Runtime never migrates. This work
authorizes migration tests only on disposable local databases; development-data
or hosted application, grants, release and data movement are separate operations.
Record the future compatibility/migration gate in verification and release notes.

## Automatic classification

### Search curation

Extend the existing strict per-source curation response with required nullable
`category`, whose schema enum is `main`, `side`, `veggie`, or null. Explain the
meal roles and request null when source ingredients, method and observed title
do not support a defensible role. Rejects return null category alongside the
existing null card fields. Classification uses only the already supplied source
and existing model response, never extra tools, source fetches or model calls.

Keep the current exact response shape and required ingredient/method excerpt
evidence checks. A missing required key or malformed overall response retains
the existing provider failure behavior. If an otherwise valid accepted card has
an invalid category scalar, normalize only its category to null rather than
discarding usable recipe details; never coerce it to an allowed role. Null is
also valid for an accepted card. Client-supplied invalid categories still reject.
Keep the 1200 output-token cap, byte bounds, 12-card/12-model-call caps, shared
pool leases, cancellation, source association and 60-second request deadline.
Saving the search result persists its validated category as automatic.

### URL metadata curation

Classify only the single source-associated Recipe node already selected by
`parseImportedRecipe`. Read `recipeCategory` as one bounded string or a bounded
array of strings (at most 16 entries, each at most 100 characters); normalize
case, trim and internal whitespace. Map exact role phrases:

| Observed normalized metadata | Category |
| --- | --- |
| main, main dish, main course, entree, entrée | main |
| side, side dish | side |
| veggie, vegetable side, vegetable side dish, vegetable accompaniment | veggie |

Duplicate aliases of the same category agree. Conflicting mapped roles, invalid
metadata shapes/limits, absent metadata or no mapped role yield null while
preserving other usable details. Unknown descriptors alongside a single mapped
role do not invent another role; `vegetarian`, `vegan`, `vegetables`, `dinner`,
`salad`, or a title containing a vegetable alone never imply Veggie. Do not read
another node, collection, snippet or unassociated recipe to decide the role.
This intentionally conservative path can leave common sites unclassified;
manual correction is the explicit recovery. No model call, title heuristic,
new fetch, photo pass, automatic retry or longer task is added. Keep the current
three-second attempt, source transport and delegated admission/lease checks.

## Storage and correction transaction

Add category to menu row selection, insert, row validation and automatic
completion. Require the category field in current stored-row projections,
including `lib/plans/generate.ts` and both suggest/accept menu reads in
`lib/plans/store.ts`; missing stored fields must not silently normalize to null.
Only historical JSON snapshot parsing accepts the absent category field. New
generation and suggestion/acceptance snapshots preserve the selected saved
category without changing selection/eligibility or existing snapshot bytes.
Insert normal saves with override=false. URL placeholders start
null/false. Existing duplicates remain no-ops. Curation completion updates other
details as before and sets category with an SQL CASE: preserve stored category
when category_overridden=true, otherwise use the curated category (possibly
null). Do not clear the marker on task scheduling/retry/failure.

`updateMenuRecipeCategory` validates the ID and exact non-null category, rejects
verification principals via `requireGoogleIdentity`, then runs the existing
single-connection transaction. After its common advisory lock and local bounded
timeouts, `requireMember` rechecks current admission/family membership and the
UPDATE matches both entry ID and server-derived family ID. Set category and
override=true atomically; return the canonical saved entry. Missing and foreign
IDs both return sanitized404. Serial completion-before-correction and
correction-before-completion both leave the correction intact. Concurrent user
corrections are last committed write wins; no revision protocol is needed for
this category-only control. Removal cannot resurrect an entry.

## HTTP and identity boundary

Reuse POST on exact `/api/menu?category=update`, which is already protected by
the equivalent menu handler guard and bypasses Proxy body buffering. No new
path, public exception or Proxy pattern is needed. Accept only this exact query
key/value with one occurrence and no other parameters. Read an exact JSON body
`{ id, category }` via a new category mode in `readMenuBody`: 4096 bytes,
five-second streaming deadline, fatal UTF-8 parsing, canonical Origin,
cross-site rejection and existing content-type/cancel rules.

Use `menuApiResponse`, `requireFamilyContext`, current cryptographic identity
binding and transactional admission checks. Return200 `{ entry }`. Preserve
existing sanitized400/401/403/404/503 errors, canonical Host421, protected405 and
private/security headers on every method. Test duplicate/unknown query keys and
body limits/deadline with real HTTP. No GET/HEAD effect is introduced.

Verification principals retain approved snapshot save/list/remove and plan
flows, including category-bearing snapshots, but cannot perform this newly added
category-only edit or URL curation. The menu page passes a server-derived
`canEditCategory` boolean for Google identity only; hide the edit control for
verification identity while still displaying the category. The API/store denial
is authoritative. Do not alter verification grants, runs, allowlist or sessions.

## Menu interaction and verification

Owner amendment: changing the dropdown saves automatically; there is no Save
category button or form submission. Render a compact saved-category label and
an explicitly labelled native select for each menu entry; null starts at a
disabled Unclassified placeholder. Native controls preserve keyboard operation
and mobile usability. Each validated changed selection immediately starts the
existing category-only request; disable the select while it is pending to avoid
duplicate or overlapping submissions.
Keep drafts local to the small control, and key/reset them by entry ID and
persisted category so refreshes do not show another entry's stale value. Use a
bounded abortable request and display local pending, success and sanitized
failure status. On success validate the returned entry then refresh through the
existing router. Keep the saved label at the actual persisted value until
success is reflected by refreshed props. On failure restore the select to that
stored category (including the disabled Unclassified placeholder for null),
retain the saved label, and let choosing the desired value again retry. No
separate retry/save button is introduced. Do not optimistically claim persistence.

Category changes must not break removal focus restoration, URL preparation
polling, pagination, retries, title/source links or snapshot save behavior.
Scope UI to `/menu`; search cards and plan layout need no new labels or controls.
Verify real Chrome at320 and1440px including long titles, keyboard selection,
available category, legacy null, pending/failed links, successful automatic-save
refresh and failed-write reset/reselection. Register failure fixtures before the
native keyboard selection so the onChange request is actually intercepted.
Required unit/store/HTTP/migration/regression evidence and exact
changed-file manifest are in sibling `plan.md`.

Installed Next documentation is unavailable because dependencies are absent in
this worktree. Before any application code, install with the pinned frozen
lockfile and read the installed Server/Client Components and Route Handlers
guides. Do not substitute remembered conventions or weaken checks.
