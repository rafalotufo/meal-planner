# Plan recipe thumbnails — specification V1

- Author: architect
- Date: 2026-11-26
- Status: Proposed for independent org peer review
- Input: accepted sibling `intent.md`; `org/reviews/intent-plan-recipe-thumbnails-001.md`
- Approval policy: the explicitly requested org workflow uses PM intent and peer
  spec/plan gates (`org/protocol.md`); human merge/release gates remain separate.

## Objective and existing contract

Show the existing saved photo on each primary recipe card on `/plans`, helping
admitted family members recognize the week's recipes. This is a presentation
delta to `intent/weekly-meal-planning/spec.md`; its data, permission, approval,
swap, unique-recipe and retained-history contracts remain unchanged.

`app/plans/plan-controls.tsx` renders the same `plan.meals` grid for drafts,
final plans and retained weeks. `lib/plans/types.ts` already exposes each saved
`MenuRecipe.imageUrl`; no join, schema, backfill or snapshot mutation is needed.
`app/plans/swap-recipe-dialog.tsx` already uses a direct, lazy, no-referrer Next
Image and a visible fallback. The picker itself does not change.

## Rendering and lifecycle

1. Insert one compact thumbnail frame above each primary card's existing title.
   Use static Tailwind utilities for a full-card-width, fixed `h-32` (128px)
   frame, rounded corners, clipped overflow and a neutral stone background.
   Keep the existing grid, heading, direct source anchor and controls intact.
2. For a non-null existing snapshot URL, render `next/image` with explicit
   intrinsic dimensions (e.g.320×240), `unoptimized`, `loading="lazy"`,
   `referrerPolicy="no-referrer"`, and `object-cover` at the frame's full size.
   Cropping is acceptable; stretching is not. No preload or optimized proxy.
3. A null URL or failed load shows centered visible `Photo unavailable` text
   within the same frame dimensions. On error remove the failed image; do not
   retry, substitute URLs, log it or introduce a new network request.
4. Put the small thumbnail function in the existing client module. Its only
   local state tracks the failed URL. Key the thumbnail by recipe source
   identity, and compare failure against the current URL, so an accepted swap
   or changed URL cannot inherit the previous recipe's image/error state.
   Do not add state to the page or change mutation/refresh logic.
5. The thumbnail is decorative beside the existing recipe title: use `alt=""`
   and `aria-hidden="true"` on its frame including fallback. It is not a new
   focus stop. Existing useful link/button names and visible focus remain.
6. Apply the same rendering to all primary cards, including read-only and
   legacy deduplicated history. Proposed replacement text inside a card and
   the already-illustrated swap picker stay unchanged.

## Privacy and architectural boundaries

Read only already-validated `imageUrl` values from family-scoped plan snapshots.
The browser's direct image load follows the same policy as existing saved menu
and picker images. `unoptimized` prevents the Next image optimizer from fetching
these URLs server-side. Do not add image discovery, server image requests,
remote-pattern configuration, loaders, assets, cookies, endpoints, provider calls,
dependencies or photo persistence. Keep the current family/session guards,
security headers and all plan storage/services unchanged. A failed third-party
photo must not prevent title, source link, approval or swap use.

## Implementation and evidence conventions

Use the existing Node24, Next16.4.6, React19.3.1, Tailwind4.3.5 and strict
TypeScript stack. Source changes stay in `app/plans/plan-controls.tsx`; meaningful
behavior checks extend `tests/plans/browser.ts` using its owned Chrome, temporary
restricted PostgreSQL database/server/profile and test-process-only Google
transport. Do not introduce a production fixture bypass. Use a small local
function following the surrounding single-quote JSX style, rather than a new
shared photo abstraction or refactor of unrelated cards.

The installed Next guides were read after `pnpm install --frozen-lockfile`:
`node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`
(`alt`, dimensions, `onError`, lazy loading and `unoptimized`), and
`01-app/01-getting-started/05-server-and-client-components.md`. They confirm
error handlers need a client component, dimensions reserve intrinsic space,
empty alt avoids redundant announcements and unoptimized serves the original
URL. Keep the fixed CSS frame independent of image success or natural size.

## Acceptance and verification

- Extend the existing browser script first and observe a failure because
  primary plan thumbnails do not exist; then implement the minimal rendering.
- Compare every displayed card to the fixture's current plan snapshot: available
  URLs load actual images, null URLs show fallback, and deterministic404 images
  settle to fallback. Scroll lazy images into view before checking completion.
- Preserve a failed-image state, accept a real swap to a valid image at that
  card position, and prove the new image loads after the existing refresh.
  Also check accepted null/broken replacements produce fallback. Use the owned
  fixture's existing real HTTP swap path; do not mutate browser props or add
  runtime test hooks to simulate the result.
- Verify lazy/no-referrer/empty-alt attributes and direct src without
  `/_next/image`. Verify reserved frame bounds before/after failure, object-cover,
  no horizontal overflow, long title/source/control usability and keyboard focus.
- Exercise draft, finalized and retained read-only plans at320 and1440px,
  preserving existing approval/swap/history assertions. Ensure photo fixtures
  cover valid/null/broken primary cards deterministically, rather than relying
  on random plan selection. Save feature-specific screenshots and inspect them.
- Run the exact local verification commands in sibling `plan.md`, record actual
  results in `verification.md`, and obtain independent security/code review.

Always preserve existing tests and strict checks. Material scope/design departures
return to peer review; new hosted, migration, merge or release work needs separate
owner authority. Never weaken checks, edit vendor types or overwrite historical
audit screenshots. No open product question blocks implementation after review.
