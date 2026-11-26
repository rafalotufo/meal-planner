# Saved recipe classification — intent

- Author: product-manager, from Rafael's request in this chat
- Date: 2026-11-26
- Status: Accepted for Design under the org PM intent gate
- Source request: “I want to be able to classify saved recipes as either main dish, side, or veggie. Let's have it auto classify on recipe curation. Run this with aí SDLC org workflow”
- PM review: `org/reviews/intent-recipe-classification-001.md`

## Problem and outcome

Saved recipes have titles, summaries, times and photos but no meal-role category.
Give each recipe one classification so family members can distinguish mains,
other sides and vegetable accompaniments. Automatically assign that category
when recipe details are curated, then retain it with the family's saved recipe.

## Proposed product interpretation

- **Main dish:** the central dish of a meal, including vegetarian entrées.
- **Side:** an accompaniment other than a vegetable-focused accompaniment.
- **Veggie:** a vegetable-focused accompaniment; this is a meal role, not a
  claim that every vegetarian recipe belongs here.

Categories are exclusive. Classification should follow the observed recipe's
normal role rather than treating ingredient presence as dietary certification.
Recipes without sufficient information, legacy saves and unprepared links may
remain explicitly unclassified until classified; never invent a category merely
to fill a required field. Unclassified is a compatibility state, not a fourth
user-selectable meal-role category.

The orchestrator surfaced these semantics and the recommended manual-correction
option in an optional owner question. With no answer after the reply window,
the orchestrator directed the stated default: include manual corrections. This
is an explicit workflow assumption, not a fabricated owner answer. The owner may
steer it before implementation. The PM accepts this bounded default because
ambiguous dishes can play different roles in different families and inference
can be wrong.

## Current evidence

- `lib/recipes/types.ts:3–9` has no category in the shared recipe card shape.
- `lib/recipes/curation.ts:7–15,41–50` uses one bounded model response per
  accepted source and returns a recipe card, with strict schema/evidence checks.
- `lib/menu/curation.ts:9–29` separately curates saved URL details using one
  safe HTML load and deterministic structured metadata within a three-second
  attempt. This path currently has no model call.
- `lib/menu/recipe-metadata.ts:126–135` selects one associated Recipe node;
  imported details currently omit ingredients, instructions and recipeCategory.
- `lib/menu/store.ts:129–136` checks current delegated admission and task lease
  inside the transaction before committing curated recipe details.
- `app/menu/menu-controls.tsx:129–136` renders ready recipe cards separately
  from pending/failed saved links, including explicit retry for failed tasks.
- `lib/menu/validation.ts:22–37` requires an exact recipe shape;
  `lib/plans/types.ts:3–4` reuses menu recipes in persistent plan snapshots.
  Adding classification must preserve historical recipe and plan compatibility.

## Acceptance criteria for the automatic-classification core

1. Curated search-result recipes carry a validated category derived from the
   same observed recipe source; saving such a result preserves it. Classifying
   adds no separate search, source fetch or model call to that search path and
   preserves its existing request deadlines, output bounds and abort behavior.
2. The saved-URL details curation path also attempts classification from its
   associated observed recipe metadata, within the existing safe fetch and task
   authorization/deadline boundaries. The architect must explicitly specify how
   this deterministic path gets an honest category without introducing an
   unbounded task, automatic paid retry or additional source fetch.
3. The saved-menu UI displays each current category with the three agreed labels
   and handles unclassified/pending/failed cases clearly. Classification failure
   alone must not discard a saved link or otherwise usable recipe details.
4. Category is durable and family-scoped. Reload, pagination, duplicates and
   curation retry preserve consistent values; invalid categories and cross-family
   writes are rejected. No admission, synthetic identity or session bypass is
   introduced.
5. Legacy saved recipes and immutable historical plan snapshots remain readable
   without bulk provider work or invented categories. No read may provision,
   classify through a network effect or migrate data. Existing weekly generation,
   recipe eligibility, counts and swap behavior remain unchanged.
6. Meaningful strict TypeScript coverage proves category validation, automatic
   assignment and propagation through both curation/save paths, legacy handling,
   authorization and any implemented correction races. Inspect the actual UI in
   real Chrome at mobile and desktop widths. Run required lint/typecheck/build,
   relevant regressions, workflow checks and staged secret scanning.

## Manual correction and legacy recipes

Admitted family members can choose Main dish, Side or Veggie on their family's
saved recipes, including existing unclassified saves. This is category-only
editing. A correction persists across reload and cannot be overwritten by an
in-flight curation or retry; duplicate saves do not silently reset it. Pending
and failed links remain usable and may be categorized without waiting for
successful details curation. The design must specify how corrections and
curation completion serialize, using the existing transaction/admission policy.
No general recipe editing follows from this requirement.

Legacy saves remain visibly unclassified until a user corrects them or an
explicit existing curation operation produces a supported category. No bulk
paid backfill, read-time effects or mutation of historical plans is allowed.

## Boundaries and handoff

Proceed through PM intent review, architect design/plan, independent peer review,
local implementation/verification, security review and code review under
`org/protocol.md`. Changes to native migration artifacts and disposable local
test databases may be proposed during design if durable storage needs them;
hosted schema changes, grants, migration execution and release require separate
authority.

No automatic legacy backfill, background reclassification, dietary/allergen
claims, category filtering, scheduler composition changes, meal CRUD, broad
recipe editor, extra provider retries, external assets, dependencies, push,
merge, staging deployment or Production action is included. Human merge and
release gates remain separate.
