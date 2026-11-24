# Saved recipe menu — visual Design preview

- Author: architect
- Date: 2026-11-24
- Status: Proposed visual design for owner review; no visual approval claimed.
- Preview: `mockups/menu-preview.html`
- Based on: approved sibling specification and existing `app/page.tsx`,
  `app/recipe-search.tsx`, `app/search-notebook.tsx`, `app/recipe-card.tsx`.

## Design contract

Preserve the current stone surfaces, emerald actions, serif Meal Planner/search
headings, compact header, notebook accordion, filters, source links and recipe
card layout. The only home additions are the Menu navigation link and a
recipe-specific Add to menu action with pending, success and retry feedback.
There is no redesigned landing page or new dashboard.

The new Menu page reuses recipe cards, adds a shared-family explanation and
Remove from menu actions, and offers clear empty/error states. Per the owner's
subsequent request, removal first opens `Remove recipe from menu?`, names the
selected recipe, and offers Cancel and Remove from menu. Cancel has initial
focus; Cancel, Escape and backdrop dismissal leave the recipe unchanged and
return focus to the triggering control. Confirmation alone starts removal;
every removal retry is confirmed again. Keep available
photos; show Photo unavailable only for missing/failed images. No collection
maximum. Older/Newest navigation replaces the visible page. Product uses 50
entries per keyset page; this compact preview uses three representative cards
per page solely to let reviewers inspect the page transition without scrolling
through 50 repeated examples. It does not change the specification's page size.

Desktop uses three card columns, tablet two, and narrow/mobile one, keeping
44px actions and wrapping text. The preview initially opens Menu (saved host preference takes precedence).
The preview width switch changes presentation;
all navigation, filters, sorting, adding, duplicate saving, pending feedback,
confirmation, removal and older/newest links work locally. Host design controls expose the
screen and empty/error/missing-photo states. Failed actions can be retried;
removing the final item reveals the empty state. Product implementation still
requires its approved plan, real authorization/storage and runtime verification.

## Preview boundaries

This is an interactive Design proposal, not the application implementation.
All recipes are illustrative samples, not verified search results. Images are
self-contained food illustrations labeled Sample image, showing the intended
photo area without loading external media. Sample View recipe links open the
publisher homepage and do not claim an exact recipe/source match. Pending
requests and failures are local simulations; there are no API/provider calls,
authentication effects, data writes or durable recipe persistence.

Changing device/page/state can be remembered by the conversation host; this is
preview preference state only. Sample saved choices remain local to the preview.
No calendar, recipe editor, extra collection limits or new photo infrastructure
is introduced. Visual review does not substitute for implementation/browser
regression checks or authorize migrations, merge or release.
