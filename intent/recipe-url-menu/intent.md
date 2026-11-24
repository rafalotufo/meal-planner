# Add a recipe URL to the menu — intent

- Author: product-manager, from Rafael's active chat request
- Date: 2026-11-24
- Status: Accepted by owner on 2026-11-24; Design authorized
- Source: “Lets add the ability to add to the menu a recipe from a url. So no search needed, this is the direct link to the recipe. Use sdlc org workflow for this intent”
- PM assessment: `org/reviews/intent-recipe-url-menu-001.md`

## Problem

An eligible family member who already has a recipe's direct URL must currently
use recipe search to obtain a saveable result. The menu accepts a complete
recipe snapshot, not a URL alone, so the existing interface cannot directly
save a recipe found elsewhere.

## Requested outcome

Let an eligible current family member paste a direct recipe URL and add that
recipe to the existing shared family menu without running recipe search.
The saved entry must remain available through the existing menu's source link,
persistence, pagination and confirmed-removal flows.

The owner confirmed: “Read the linked page and save its title, photo, summary
and time when available.” The flow therefore acquires available recipe metadata
from the linked page. It does not run recipe discovery or require the user to
enter a title manually. The owner subsequently accepted this written intent with “approved” in the
active chat on 2026-11-24. This authorizes Design; later gates remain separate.

## Acceptance criteria

- A discoverable control on the menu accepts a direct recipe URL without
  requiring a search, a search-result card or a paid recipe-discovery call.
- Only an eligible current family member can use it. Derive the family owner
  server-side, and recheck admission and membership at the actual save boundary.
  Pending identities and other families cannot read or write the caller's menu.
- Saving persists in the same family-shared collection across reloads, sessions
  and devices. Keep the existing no-collection-maximum policy and bounded pages.
- Read the linked page and retain its available title, photo, summary and
  cooking/total time. Missing optional details remain honestly unavailable,
  rather than guessed. Design must define minimum recipe evidence and fallback
  presentation compatible with current storage, and must not invent metadata.
- Inaccessible pages, non-recipe pages and failed/unsafe acquisition produce
  clear recoverable errors without saving a bogus entry.
- The saved source remains a validated, attributed, usable link. Render recipe
  text as text; never render publisher HTML or execute publisher scripts.
- Repeated and concurrent saves, including a URL already saved from search,
  have a deterministic outcome consistent with the existing normalized source
  identity and first-save retention policy unless separately reviewed.
- Provide labelled input, keyboard operation, visible focus and clear pending,
  success, duplicate and recoverable-failure feedback at mobile and desktop
  widths. Invalid input and failed acquisition must not claim a successful save.
- Keep the existing menu list, source opening, search-result saving, retained
  photos, pagination and removal confirmation working. Existing entries remain
  readable and safe; do not silently replace their snapshots.
- Preserve authentication, family, invitation, search/provider, cancellation,
  photo-safety and deployment boundaries. New effects require reviewed limits,
  validation and failure behavior before implementation.
- Add meaningful strict TypeScript regression coverage and real-browser mobile
  and desktop evidence, then complete required repository checks and independent
  code/security review before the human merge gate.

## Confirmed product decision and Design questions

The owner selected automatic page metadata acquisition: “Read the linked page
and save its title, photo, summary and time when available.” The product manager
accepts this scope as a narrow addition to the existing family menu.

Design must define supported structured recipe
evidence, selection if a page contains multiple recipes, minimum required
fields, missing-details presentation, inaccessible/non-recipe handling and the
save interaction. It must define safe bounded page fetching, URL identity and
redirect/canonical handling without silently broadening existing deduplication
or photo-fetch guarantees. It may reuse suitable existing parsing/transport only
after assessing its contract. No paid AI or discovery call is implied.

These are technical design questions, not unresolved product choices. Owner
acceptance opens Design under the invoked SDLC skill; specification approval
and plan approval remain separate gates before implementation.

## Current grounding

- `app/menu/page.tsx` guards the menu with current family context, lists stored
  recipes and has no add-from-URL form.
- `app/menu/save-recipe-button.tsx` submits a complete selected recipe snapshot
  to `POST /api/menu`; it cannot create that snapshot from a URL alone.
- `lib/menu/validation.ts` requires exactly title, sourceUrl, imageUrl, summary
  and time. Title and summary are nonempty bounded text; time/photo may be null.
- `lib/menu/store.ts` scopes reads/writes by verified membership, saves under
  the existing transaction/advisory lock and returns the first snapshot for a
  duplicate normalized source URL without changing its position.
- `intent/saved-recipe-menu/spec.md` deliberately excludes scraping and recipe
  import. This intent proposes only the specific additional URL-saving flow;
  its approved design/plan must describe the narrow scope expansion.

## Constraints and out of scope

Reuse the installed Next.js/TypeScript/Tailwind and native PostgreSQL architecture,
current family menu and guarded mutation conventions. Runtime never migrates.
Read the installed Next.js documentation before application edits. For page
acquisition, require server-only bounded HTTPS transport, SSRF
protection, cancellation and untrusted-content handling; preserve existing photo
protections and never fetch while holding a database write lock. Do not assume
the current photo parser or transport already satisfies a recipe-import contract.

No meal scheduling, additional menus, recipe editing, general user-authored
recipes, ingredients/instructions archive, recipe generation, shopping lists,
nutrition, new providers, paid usage, image storage, public sharing, account
changes, unrelated redesign or dependency changes are requested. No local data
import, hosted migration, hosted configuration, push, merge, deployment,
promotion or release is authorized. Preserve completed audit artifacts and the
human merge/release gates.

## Handoff

The product manager accepted the confirmed metadata acquisition scope, and the
owner accepted this written intent on 2026-11-24 with “approved” after the
orchestrator requested intent acceptance. The architect now produces the sibling
specification for independent review and owner approval. Build planning follows
specification approval; code follows plan approval. No implementation or release
approval is implied by intent acceptance.
