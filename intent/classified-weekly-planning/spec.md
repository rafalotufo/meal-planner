# Classified weekly planning — specification V1

- Author: architect
- Date: 2026-11-27
- Status: In review
- Input: accepted sibling `intent.md`, PM source `466a316`
- Gate: independent peer approval of this specification and sibling plan before code

## Outcome and boundaries

A newly generated week selects four main dishes, two sides and two veggies when
available, with distinct sources. Show the three categories separately. Keep the
existing weekly scheduling window, approval/finalization/revision rules, family
and identity boundaries, bounded scheduler execution and provider-free generation.
Short pools produce an honestly partial plan without borrowing from other groups;
an entirely unclassified or otherwise ineligible pool produces no draft. Legacy
snapshots remain readable without read effects or rewriting their JSON.

This is one planning capability with selection, swap and rendering invariants.
No category editing, backfill, configurable quotas, daily assignment, schedule,
provider, dependency, verification authority or hosted operation is added.

## Shared planning policy and selection

Add a small pure `lib/plans/composition.ts` for category targets/order, maximum
meal count8 and same-category replacement predicate. Reuse existing
`RecipeCategory` (`main`, `side`, `veggie`) and labels rather than another enum.
Keep this module free of database/server imports so UI and strict tests share the
same fixed targets. Constants are product policy, not environment configuration.

`generateFamilyPlan` retains its locked transaction, eligibility and existing-week
check. Rank eligible ready family saves **within each nonnull category** using
`row_number() OVER (PARTITION BY m.category ORDER BY used.last_use ASC NULLS FIRST,
md5(week || source_url), source_url,id)`. Retain the current eight-finalized-weeks /
56-day recent-use window. Filter `main` rank<=4, `side` rank<=2, `veggie` rank<=2
and return a bounded maximum8 rows in main/side/veggie order and rank order. SQL
predicates remain bound; no user-provided SQL fragment. Exclude nonready curation
before ranking. Category correction changes future selection, never old snapshots.

Remove the old global seven-choice limit and global candidate rotation; the
existing week-specific hash already gives deterministic tie-breaking while recent
usage remains the first selection preference. Preserve source uniqueness from the
family/source unique storage invariant. Snapshot each selected current category.
If zero candidates, return existing `empty` outcome; do not insert an empty array.
Existing draft/final plans still return `existing`, with no recomposition.

## Eight-slot native schema compatibility

Append native migration identity `80fd3d65-d202-462b-883d-6adc2eb565be` in
`drizzle/postgresql/80fd3d65-d202-462b-883d-6adc2eb565be.sql`, depending on current
classification identity `6e36359b-9b16-4642-a487-e4e5411ce477`. Acquire the common
transaction advisory lock before table access. Replace only
`meal_plan_weeks_meals_check` with the same JSON-array check and length BETWEEN1
AND8, and `meal_plan_suggestions_day_index_check` with BETWEEN0 AND7. Verify actual
constraint names on an owned local fixture before implementing SQL. Keep all
other constraints/indexes/grants and every prior SQL/hash/profile unchanged.
There is no data UPDATE, approval invalidation, ledger rewrite, TEMP grant or
rollback script. Existing rows satisfy the broader bounds byte-for-byte.

Append the migration descriptor/hash and required identity to compatibility.json;
append an exact PostgreSQL-derived catalog profile for the full nine-identity
set, using exported `catalogSignature` on an owned disposable database after
executing the reviewed migration against the previous eight-identity schema.
Copy unchanged reviewed runtime grants into the new profile, then verify real
restricted runtime permissions and migration idempotence. Do not guess PostgreSQL
constraint strings or alter the historical five-row public Drizzle journal,
legacy catalog.json or runtime-migrations metadata (they describe historical SQL).
Build/packaged runtime must accept only the new complete profile and fail closed
for older catalogs; old artifacts reject the new schema. No development or hosted
migration is authorized. Any future release must migrate under separately reviewed
authority and preserve schema/data; an older runtime is not a safe rollback target.

## Validation and indexed swaps

`parseMeals` accepts1..8 valid snapshots, retaining current distinct-source policy
and finalized-only legacy duplicate compatibility. `parsePlanAction` permits day
indices0..7; database/store also enforce index<actual meals.length. The wire key
`day` and storage `day_index` remain compatibility names for a recipe array slot,
not calendar-day assignment. Plan/suggestion wire shapes remain unchanged.

For a categorized slot, suggestion requires current ready same-family menu recipe
category to equal the slot's stored snapshot category; otherwise sanitized409.
At acceptance re-read that ready menu recipe inside the existing common locked
transaction and recheck its **current** category against the slot snapshot before
updating revision, approvals or suggestions. Thus category correction after a
suggestion, historical incompatible pending suggestions and crafted foreign IDs
cannot break composition. Continue existing uniqueness and current-admission
checks; wrong category never partially changes the plan. Rejection remains
possible for an incompatible suggestion. For legacy missing/null category slots,
keep existing any-ready-category replacement behavior; accepting a categorized
replacement then makes that new snapshot's category authoritative for future swaps.

No global quota check is imposed on historical plans or finalization; a historical
plan may contain counts above or below current targets. A partial plan remains
confirmable through existing explicit confirmation. Verification principals keep
only current approve/suggest operations and admission checks; do not add category
editing, accept/finalize, curation or other synthetic effects.

## Filtered saved-menu read for the picker

Extend the existing exact protected GET `/api/menu` query with optional single
`category=main|side|veggie` alongside current optional `q` and `after`. Reject
empty/unknown/null-text enums, duplicates, unknown keys and mixtures that are
invalid under existing rules with sanitized400. This is distinct from existing
POST `?category=update`; POST routing does not change. No new route, public policy,
Proxy exception, body protocol, origin/Host/security header or identity grant.

Append optional `category?: unknown` to `listMenuRecipes`; validate with existing
`isRecipeCategory`, treating only undefined as no filter. Add bound `m.category`
predicate before the existing LIMIT51/keyset pagination. Preserve existing title
search collation, cursor validation/order, ready-state returned shape and50-item
page. Unfiltered Menu reads remain identical. Menu cursor identifies a boundary;
the picker resets cursor on search/category change and carries its category on
every page request. Same-category entries beyond first50 unrelated recipes must
be discoverable; client-only filtering of unfiltered pages is insufficient UX.

Picker receives slot snapshot category/null from PlanControls and includes it
in every lookup. It also filters ready/unplanned choices by this category as
client defense; server mutation remains authoritative. Explain the category in
picker context and use honest no-match/already-planned wording. Preserve retained
results, request versions, search debounce, body bounds, cancellation, modal focus
and retry/access-loss behavior. Category must participate in effect dependencies
and displayed response context if component reuse can change it; alternatively
existing per-open keyed dialog identity safely fixes it for that dialog lifetime.

## Grouped display and historical truth

Render stable semantic sections headed **Main dishes**, **Sides**, **Veggies** in
that order, including empty sections. Each displays actual snapshot count and
current target (4/2/2), described as a current target rather than a historical
compliance claim. Add **Unclassified** only when legacy null/missing snapshots
exist. Explain that saved snapshots determine these groups and older plans may
use a different mix; do not claim older plans were generated to new quotas.

Compute groups as `{ meal, index }` references to the original `plan.meals` array;
never sort/filter that original array or use a group's local index as the action
slot. Keep suggestion labels, controls and stable `data-plan-suggest` original
index. Slot7 remains reachable under Veggies in a full generated plan. Use h2
section headings and h3 recipe titles; preserve accessible recipe links,
thumbnail frames, keyboard controls and focus recovery. Shortage text says to
save or classify more recipes in Menu; no buttons to regenerate/fill old plans.
Update page copy from seven choices to target4/2/2 and improve no-draft guidance
for unclassified-only menus. No extra client state beyond existing modal category.

## Evidence and commands

Tests first for selection quotas/ranking/shortages and null exclusion; schema
upgrade preservation and restricted rights;8/9 meal bounds,7/8 indices; store
same-category create/accept/category-race and legacy behavior; filtered lookup
search/keyset/validation/family checks; real HTTP wrong-category/eighth-slot flows.
Adapt existing generation fixtures explicitly to categorized eligibility while
keeping separate legacy snapshot fixtures and preserving historical adapter tests.

Run sibling plan's checks with actual output; use owned random disposable DBs,
empty paid keys and owned Chrome/server/profile. Browser evidence at320/1440
must show full and partial groups, legacy Unclassified, category-filtered search
and slot7 suggest/accept, keyboard/focus and no horizontal overflow. Preserve old
screenshots and save new classified-weekly-planning-prefixed images.

Installed Next16.4.6 guides read during design:
`node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
and `15-route-handlers.md`. Existing Server page/Client controls split, promise
searchParams and exact guarded route pattern remain appropriate. No web API
research or new framework pattern is needed.
