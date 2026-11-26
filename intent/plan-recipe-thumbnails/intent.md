# Plan recipe thumbnails — intent

- Author: product-manager, from Rafael's request in this chat
- Date: 2026-11-26
- Status: Accepted for Design under the org PM intent gate
- Source request: “modify the plan page so that it displays image thumbnails for each recipe in the plan.”
- PM review: `org/reviews/intent-plan-recipe-thumbnails-001.md`

## Problem and outcome

The weekly plan renders a recipe title, source link and available controls for
each planned meal, but no photo. Show a compact image thumbnail on every planned
recipe card so family members can recognize their planned meals at a glance.
Reuse the photo URL already carried by each plan recipe snapshot.

## Affected users and systems

Admitted family members viewing `/plans`, including editable drafts, finalized
plans and retained read-only weeks. This is a focused change to recipe-card
presentation, with browser verification through owned local fixtures.

## Current evidence

- `app/plans/plan-controls.tsx:51–60` renders the planned recipe grid without
  images. Draft and read-only views share this rendering path.
- `lib/plans/types.ts:3` defines each plan's meals as `MenuRecipe[]`;
  `lib/menu/types.ts:3` aliases that to the existing `Recipe` shape, whose
  `imageUrl` is nullable (`lib/recipes/types.ts:6`).
- `app/plans/swap-recipe-dialog.tsx:41–49` already displays saved recipe
  thumbnails with lazy direct image loading, no referrer and a missing/failed
  photo fallback. The plan can preserve that established privacy behavior.
- `tests/plans/browser.ts:29–47` provides an owned real-Chrome, server and
  temporary-database fixture with valid, broken and missing photo cases and
  mobile/desktop plan coverage.

## Acceptance criteria

1. Every planned recipe card displays its existing snapshot image as a compact,
   consistently sized thumbnail when available. This applies to draft, final
   and historical read-only plans; existing records need no backfill.
2. Recipes with no image or a failed image load retain an intentional, stable
   fallback. Recipe titles, source links and controls remain usable. Accepting
   a swap shows the accepted recipe's image or fallback after refresh rather
   than retaining the previous recipe's image/failure state.
3. The image and fallback fit the existing responsive grid at mobile and
   desktop widths without horizontal overflow, distorted images or hidden
   controls. Preserve keyboard access, visible focus and useful accessible
   names; avoid redundant photo announcements beside a recipe title.
4. Read only the existing validated `imageUrl` snapshot. Preserve lazy loading
   and no-referrer behavior, with no new server image fetch/proxy, discovery,
   provider call, image persistence, public endpoint or authentication change.
5. Preserve plan contents, ordering, unique-recipe rules, approval/finalization,
   swap interactions, family scope and retained history. The existing swap
   picker is outside this presentation change.
6. Verify available, missing and broken thumbnails and accepted-swap refresh
   with meaningful strict TypeScript/browser coverage. Run required lint,
   typecheck, build and relevant regressions; inspect actual plan UI in real
   Chrome at mobile and desktop widths and record evidence. Workflow checks
   and staged secret scanning must pass.

## Scope and handoff

Proceed through org design/plan peer review, local implementation, verification
and independent security/code review. No new photos/assets, dependencies,
database/schema changes, recipe editing, scheduling change, hosted mutation,
push, merge or deployment is authorized. Human merge and release gates remain
separate.

No product ambiguity blocks Design. The architect and peer reviewer may choose
thumbnail dimensions and placement consistent with the existing plan styling;
material expansion beyond displaying existing planned-recipe photos returns
to the owner.
