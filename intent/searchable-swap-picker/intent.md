# Searchable recipe swap picker — intent

- Author: product-manager, from Rafael's active chat
- Date: 2026-11-24
- Status: Accepted for Design under the org PM intent gate
- Decision: `org/reviews/intent-searchable-swap-picker-001.md`
- Source: owner request recorded in `org/messages/ceo-0055.md`
- Approved visual reference:
  `intent/weekly-meal-planning/preview/swap-picker-preview.html`

## Problem

The weekly plan's text dropdown makes saved recipes difficult to recognize and
find when suggesting a swap. The family needs a visual, searchable choice that
works across its full saved menu, including recipes beyond the first result page.

## Proposed outcome

Replace the swap dropdown with a modal displaying saved recipe titles and
thumbnails, a search field and a clear selected state. Let a member browse or
search, select a replacement, then explicitly submit **Suggest swap**. Match the
approved preview's restrained emerald, stone and serif visual treatment within
the existing application.

## Owner-confirmed direction

The owner requested a nicer modal with recipe titles and thumbnails, then a
search box to filter and find recipes easily. After reviewing the preview, the
owner said: “Looks good. Lets implement this searchable modal...using SDLC org
workflow.” This authorizes the local org design/build/test cycle; merge and
release remain separate human gates.

## Acceptance criteria

- The weekly plan opens a clearly labelled recipe-swap modal from the existing
  swap interaction. The modal shows selectable saved recipe titles and thumbnails,
  current selection, Cancel and an explicit **Suggest swap** action. Selecting a
  recipe alone never creates a suggestion or changes the plan.
- A labelled search field filters by recipe title without case sensitivity.
  Search covers the **full current family's saved menu**, including recipes
  beyond the first 50 entries. Results are bounded and paginated rather than
  loading the entire menu into the client. Loading, empty, no-match and failure
  states remain understandable and recoverable.
- Recipes already present in the weekly plan are excluded from available swap
  choices. Existing server-side uniqueness checks remain authoritative; a stale
  or crafted request cannot introduce a duplicate or cross-family recipe.
- The modal follows the approved visual reference using existing application
  styling. At 320px and 1440px it fits the viewport, allows practical scrolling,
  wraps long titles and exposes selection and actions without horizontal overflow.
- Use native accessible dialog behavior: a meaningful name, focus within the
  modal, initial search focus, keyboard selection, Escape/Cancel dismissal and
  focus return to the opening control. Selection, pending and error states are
  communicated accessibly. Submission requires a valid selected replacement.
- Display only existing validated saved image URLs with unoptimized browser
  loads and no-referrer behavior. Missing or failed images have an intelligible
  fallback. Do not copy the preview's sample CDN images into the application or
  add image discovery, optimization/proxying, provider calls or photo-fetch effects.
- Search reads retain the existing exact menu-handler guard, admission/family
  checks, server-derived family scope, private/security headers and bounded input
  validation. Extending protected `GET /api/menu` with a bounded title query is
  permitted; no public route or authentication exception is authorized.
- Existing planning behavior remains intact: one to seven unique recipes,
  duplicate guards, retained unrelated pending suggestions after a swap, approval
  reset on accepted change, stale-client revision checks and read-only history.
  Scheduling, generation and persistence semantics are unchanged.
- Strict TypeScript regressions verify full-menu search, pagination, family
  isolation and preserved guards. Real-browser tests at mobile and desktop widths
  verify searching, selection, explicit submission, cancellation, focus, missing
  images and existing swap behavior. Required repository checks and independent
  spec/plan, security and final reviews produce actual evidence.

## Constraints and scope

Reuse existing recipe snapshots, menu APIs and planning mutations. No database
migration, new dependency, attendance feature, recipe editing, new provider/photo
effect, notification system or general search redesign is needed. Use bounded
native PostgreSQL reads and preserve existing pagination semantics for callers
that do not request a search. The architect specifies precise query validation,
pagination, selection lifecycle and async response handling before implementation.

Preserve the owner's pre-existing `next-env.d.ts` diff and live development
server. Implementation and QA may use a private copy and owned isolated local
fixtures; do not stop the user's server or alter development/hosted data. Do not
deploy, merge, push, change hosted configuration, activate jobs or run hosted
migrations. The approved prototype is a reference artifact, not production code
or permission to load its sample assets.

## Handoff

Architect: define the modal component, bounded full-menu title search contract,
pagination/selection/focus behavior and verification plan. Independent reviewer:
approve spec/plan before source changes. Senior developer: implement the approved
scope and verify through real protected interactions. Any material change to
planning semantics or security boundaries requires explicit review/escalation.
