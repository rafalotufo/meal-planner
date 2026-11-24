# Add a recipe URL to the menu — intent

- Author: product-manager, from Rafael's active chat request
- Date: 2026-11-24
- Status: Accepted scope via owner-directed amendment; revised architecture/specification review pending
- Source: “Lets add the ability to add to the menu a recipe from a url. So no search needed, this is the direct link to the recipe. Use sdlc org workflow for this intent”
- PM assessments: `org/reviews/intent-recipe-url-menu-001.md` (original);
  `org/reviews/intent-recipe-url-menu-002.md` (save-first amendment)

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
and time when available,” then accepted the original written intent with
“approved” on 2026-11-24. That acceptance authorized Design of the original
metadata-import flow; it remains historical evidence, not approval of a revised
specification or implementation.

After reviewing the draft specification, before approving it, the owner amended
the outcome: “Lets save the recipe immediately, but start a process that will
curate the recipe, find image, summary etc, then update the saved entry”.

The current intent is therefore **save first, curate asynchronously**. After
input validation and current family authorization, persist the source link as an
honest pending menu entry and acknowledge that durable save without waiting for
publisher retrieval. Start bounded curation that obtains available metadata and
updates that same entry. Users can distinguish the saved link from a completed
recipe snapshot. No recipe search, manual title entry, paid AI or new discovery
provider is implied. The PM accepts this explicit product amendment; the revised
architecture/specification still requires review and its normal approval gate.
The owner also selected reliability behavior: “Keep it simple: save safely,
start curation, and offer Retry if interrupted.” No independent scheduler or
queue infrastructure and no guaranteed unattended recovery are requested.

## Acceptance criteria

- A discoverable control on the menu accepts a direct recipe URL without
  requiring a search, a search-result card or a paid recipe-discovery call.
- Only an eligible current family member can use it. Derive the family owner
  server-side, and recheck admission and membership at the actual save boundary.
  Pending identities and other families cannot read or write the caller's menu.
- Saving persists in the same family-shared collection across reloads, sessions
  and devices. Keep the existing no-collection-maximum policy and bounded pages.
- A valid authorized URL submission durably saves a pending source-link entry
  before network curation. Acknowledge success only after that save commits;
  do not represent request receipt or in-memory work as persistence. Curation
  must not delay that response while waiting for the publisher.
- The pending entry is visible in the shared menu across reloads and sessions,
  with its real source link and explicit pending status. Any temporary label
  identifies a saved link awaiting details rather than pretending to be a
  publisher recipe title or summary.
- Start asynchronous curation of that source and update the same saved entry
  with its available title, photo, summary and cooking/total time. Missing
  optional details remain honestly unavailable,
  rather than guessed. Design must define minimum recipe evidence and fallback
  presentation compatible with current storage, and must not invent metadata.
- Inaccessible/non-recipe pages and failed or unsafe curation leave an honestly
  labelled saved link with a clear failed/unavailable state and an explicit
  bounded retry path. Do not invent a recipe snapshot, discard the user's saved
  link silently or announce completed curation on failure. Invalid/unsafe URL
  input is rejected before saving or fetching.
- A retry acts on the same still-existing entry, clearly announces its pending
  and eventual outcome, and cannot create duplicate entries or silently begin
  unbounded attempts. Interrupted work retains the durable link and offers
  explicit Retry; any stale pending label must explain interruption rather than
  imply background progress is guaranteed. No unattended recovery guarantee or
  independent queue/scheduler infrastructure is requested.
- The saved source remains a validated, attributed, usable link. Render recipe
  text as text; never render publisher HTML or execute publisher scripts.
- Repeated and concurrent saves, including a URL already saved from search,
  have a deterministic outcome consistent with the existing normalized source
  identity and first-save retention policy. A duplicate of a pending entry
  returns that entry rather than creating another entry or redundant unbounded
  work. Curation may fill the placeholder created by this flow; it must not
  overwrite existing search-result snapshots or already completed snapshots.
- Provide labelled input, keyboard operation, visible focus and clear pending,
  durable-save success, curation pending/completed/failed, duplicate and retry
  feedback at mobile and desktop widths. Save failure must not claim a saved
  entry; curation failure must not imply the committed link was never saved.
- Keep the existing menu list, source opening, search-result saving, retained
  photos, pagination and removal confirmation working. Existing entries remain
  readable and safe; do not silently replace their snapshots. Removing a pending
  or failed entry uses the same confirmation flow and prevents later work from
  restoring it. A late completion for an old entry must not update a replacement
  created by a later save of the same URL.
- Authorize curation effects and final updates against current eligibility and
  the server-derived owning family. Admission or membership changes between save,
  retrieval and update must not allow stale work to bypass authorization. Never
  transfer an entry or its metadata across families or recreate a removed row.
- Saving and curation have distinct cancellation boundaries: an abandoned client
  response cannot undo an already committed save. Design must define supported
  post-response execution, bounded cancellation and retry, and update races
  without assuming detached in-process promises reliably survive a serverless
  request.
- Preserve authentication, family, invitation, search/provider, cancellation,
  photo-safety and deployment boundaries. New effects require reviewed limits,
  validation and failure behavior before implementation.
- Add meaningful strict TypeScript regression coverage and real-browser mobile
  and desktop evidence, then complete required repository checks and independent
  code/security review before the human merge gate.

## Confirmed product decision and Design questions

The owner selected automatic metadata acquisition and then explicitly changed
its timing to immediate save followed by curation and update. This supersedes
the original draft specification's fetch-before-save and no-update design. The
original owner intent approval and draft review remain historical; they are not
approval of exact amended architecture.

Design must define a truthful pending/failed/completed record contract and
compatible listing/card behavior, how supported metadata is selected and mapped,
missing-details presentation, safe bounded transport, source identity,
retry and concurrency. Use the owner's selected simple reliability model:
save safely, start curation, and offer Retry if interrupted. Design must choose
a supported post-response execution mechanism and state its actual limitations,
including serverless termination and stale work; no independent queue/scheduler
or guaranteed unattended recovery is in scope. It must describe any schema, restricted
grant or infrastructure changes before approval; none are assumed authorized
for execution by this intent.

The existing no-update rule receives one narrow proposed exception: controlled
curation fills the placeholder belonging to this URL-save flow, targeting the
same entry with current authorization and stale-work protection. This is not
recipe editing, refresh of existing snapshots or replacement of search saves.
No network fetch runs inside a database write lock. Late work cannot recreate a
removed entry or mutate a newly saved replacement. Technical implementation and
verification details belong in the reviewed amended specification and plan.

The owner statement authorizes this intent amendment and continued Design;
PM accepts its product scope. Specification approval and plan approval remain
separate gates before code, and operational actions retain separate authority.

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

No meal scheduling, additional menus, user-directed recipe editing, general
user-authored recipes, ingredients/instructions archive, recipe generation, shopping lists,
nutrition, new providers, paid usage, image storage, public sharing, account
changes, unrelated redesign or dependency changes are requested. No local data
import, hosted migration, hosted configuration, push, merge, deployment,
promotion or release is authorized. Preserve completed audit artifacts and the
human merge/release gates.

## Handoff

The product manager accepts the explicit save-first/async-curation amendment.
The architect revises the sibling specification, replacing synchronous import
assumptions and identifying operational requirements. Independent review and
owner specification approval precede Build planning; plan approval precedes
code. The prior owner intent approval is preserved as history, and the amended
request authorizes continued Design only. No exact unreviewed design,
implementation, migration, infrastructure purchase or release is approved here.
