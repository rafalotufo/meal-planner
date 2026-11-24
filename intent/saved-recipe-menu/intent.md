# Saved recipe menu

- Author: product-manager, from Rafael's request
- Date: 2026-11-24
- Source: current owner request to use the SDLC org workflow
- Ownership clarification: owner selected “One shared menu per family.”
- Collection size clarification: owner explicitly requested no maximum saved-recipe count.
- Photo clarification: owner requested keeping photos when available, with fallback
  only when missing or failed.
- Removal clarification: owner requires confirmation before removing a saved recipe.
- Status: Accepted for Design under the org PM intent gate
- PM verdict: Accepted; `org/reviews/intent-saved-recipe-menu-001.md`

## Problem

Users can search for recipes and open their original sources, but cannot keep
selected recipes in a durable menu. The search notebook is client memory, so
its search results are not a saved collection that survives reloads or later
sessions. Users also lack a dedicated place to review or remove saved choices.

## Requested outcome

Add an action to recipe search results that saves a recipe to the menu. Provide
a separate, discoverable menu page listing saved recipes and allowing their
removal. Saved choices persist across reloads, sign-out/sign-in, and devices.
The menu is a collection of recipe choices; calendar dates or meal scheduling
are not part of this request.

The owner confirmed **one shared menu per family**, consistent with the existing
family-owned shared-entity contract. All eligible current family members can
view the same menu, save recipes to it, and remove entries from it. Members of
other families have their own independent menus.

## Acceptance criteria

- An eligible current family member can save a recipe directly from a search
  result, with clear pending, success, and recoverable failure feedback.
- A discoverable separate menu page makes all recipes saved within the approved
  ownership scope accessible and provides a useful empty state. There is no
  application maximum saved-recipe count; bounded page navigation may keep
  individual reads/renders small without truncating the collection.
- Each saved entry preserves enough of the selected result to identify it and
  decide whether to open it: title, summary, original source link, and supported
  cooking or total time when available. Missing time remains unavailable rather
  than guessed. Retain the selected result's photo when available, with the existing safe
  unavailable fallback only when missing or failed. Persisting a publisher URL
  does not archive its image bytes or promise permanent availability.
- Opening the original source remains available from saved entries. Displayed
  recipe text remains text and source attribution remains visible.
- A user can request removal, confirm the selected recipe in a dialog, and see
  the result. Canceling or dismissing leaves the recipe unchanged. Removal affects
  only the menu entry within the authorized ownership scope; later saving the
  recipe again remains possible.
- Saved entries and removals persist across reloads and later authenticated
  sessions. Listing, saving, and removing do not initiate recipe discovery or
  additional LLM/provider calls.
- Repeated or concurrent saves of the same recipe have a defined, deterministic
  outcome. The proposed behavior is one entry per source recipe in a menu;
  Design must define the identity/deduplication rule and retry semantics.
- Current admission and family membership are checked server-side before menu
  reads or effects. Pending invitees and unauthorized users cannot access the
  menu, and one family cannot read, save into, or remove another family's data.
- Menu controls work with a keyboard, have descriptive accessible names and
  clear feedback, and remain usable without horizontal overflow at mobile and
  desktop widths.
- Existing recipe search, notebook, waiting-game, authentication, invitation,
  family, provider cancellation, and photo safety behavior remain intact.
- Implementation receives meaningful strict TypeScript regression coverage for
  persistence, duplicate/retry behavior, authorization, and removal. Required
  lint, typecheck, build, recipe/photo, family, auth, deployment, Python workflow,
  staged secret, and real-browser checks pass with recorded actual evidence.

## Affected users and systems

Authenticated Meal Planner users with current family context; search result
cards and navigation; a new menu page and its server boundaries; PostgreSQL
storage and explicit migration artifacts; automated and browser verification.

Current grounding: `app/recipe-card.tsx` displays recipe title, summary, optional
image/time, and source link; `lib/recipes/types.ts` has no durable recipe ID;
`lib/recipes/notebook.ts` keeps results only in client state. `app/page.tsx` and
`lib/session.ts` already enforce current family context, and
`intent/family-membership/intent.md` establishes family ownership for future
recipes and shared data.

## Constraints

- Keep the existing Next.js, strict TypeScript, Tailwind, native bound PostgreSQL
  query, and reviewed explicit migration architecture. Runtime never migrates.
- This intent proposes a narrowly scoped expansion of the existing prohibition
  on recipe/meal CRUD: saving result snapshots to a menu, listing those entries,
  and removing them. Only an approved specification and implementation plan
  may activate that expansion. General recipe creation/editing stays excluded.
- Derive ownership server-side using `lib/session.ts`; client-provided family
  IDs or menu-entry IDs alone cannot authorize access. Preserve Google identity,
  admission, invitation, session-expiry, and family rules.
- Treat save payloads and persisted recipe fields as untrusted. Design must
  bound and validate fields, safe source links, mutation requests, storage, and
  errors; do not expose configuration, credentials, or other families' data.
- Preserve existing grounding and photo SSRF protections. Persisting a result
  must not silently turn an ephemeral image URL into a new server fetch path,
  unrestricted image proxy, or permanent safety guarantee.
- Keep the Meal Planner heading and existing search interface. Scope new UI to
  menu discovery/navigation, result save actions, menu listing/removal, and the
  states needed to make those flows understandable.
- Use `intent/saved-recipe-menu/` for this feature's artifacts. Preserve org
  records, independent reviews, bounded-loop controls, and human merge/release
  gates. Existing hosted setup authority does not authorize future hosted
  migrations, deployment, promotion, paid features, or data import.

## Out of scope

Meal calendars or scheduling; multiple named menus; user-authored recipes;
recipe editing; ingredients or instructions import; recipe generation; search
history persistence; shopping lists; nutrition features; new providers; photo
downloads or storage infrastructure; public sharing; family switching or roles;
unrelated dependency/authentication changes; hosted migration execution,
deployment, merge, or release.

## Confirmed product decision

The owner selected one shared menu per family and explicitly rejected a maximum
saved-recipe count. Design must bound individual reads/renders through navigation
without limiting collection size. The owner clarified that photos must
be retained when available, and fallback used only when missing or failed. This
supersedes the architect's initial all-fallback proposal. The owner subsequently
required a confirmation dialog before removal. Specification, plan,
implementation, merge, and release retain their respective gates.

## Open questions for Design

1. Define the saved snapshot contract, whether a repeated save retains the
   original snapshot or replaces it, recipe identity/URL normalization, ordering,
   and concurrent add/remove outcomes. Prefer the smallest predictable behavior.
2. Retain available photo URLs safely; define validation and missing/failed
   fallback without introducing server image fetching or storage infrastructure.
3. Define bounded per-request storage work, authorization/transaction boundaries, API or
   action contracts, empty/error states, navigation, and verification strategy.
   A separate operational decision is required before applying a future
   migration to any hosted database.

These questions do not authorize implementation. Product ambiguity returns to
the owner; technical choices belong in the reviewed sibling specification.
