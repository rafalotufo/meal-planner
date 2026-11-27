# Classified weekly planning — intent

- Author: product-manager, from Rafael's request in this chat
- Date: 2026-11-27
- Status: Accepted for Design under the org PM intent gate
- Source request: “Now that we have meal classification (main, side, veggie), lets modify the planning. Planning should select 4 main meals, 2 sides and 2 veggies and display them separately as well. Implement this intent with the ai sdlc org workflow.”
- PM review: `org/reviews/intent-classified-weekly-planning-001.md`

## Problem and outcome

Weekly generation currently chooses up to seven saved recipes without using their
meal classification, and the plan displays one undifferentiated grid. Families
need a useful weekly mix: four main dishes, two sides and two vegetable
accompaniments, shown in separate sections.

## Accepted scope and product interpretation

1. New scheduled drafts select up to **4 Main dishes, 2 Sides and 2 Veggies**
   from the family's ready saved recipes, with eight distinct recipes when
   all category pools meet their quotas. Categories retain the existing exclusive
   meal-role meanings, including vegetarian main dishes as mains.
2. A category shortage produces an honestly partial plan: select the available
   recipes in that category without duplicates or another category filling its
   places. Show actual counts against the category targets and concise guidance
   to save or classify more recipes. If no eligible categorized recipe exists,
   retain the existing no-draft outcome. Unclassified recipes do not qualify for
   the new generation mix; existing manual classification in Menu provides the
   recovery path. No new backfill or inference is required.
3. Display plan recipes separately under **Main dishes**, **Sides**, and
   **Veggies**, with a stable, accessible group order. Eight choices are weekly
   recipes rather than eight calendar days; preserve the existing weekly-plan
   scheduling window and do not invent daily assignments.
4. Swaps for categorized planned recipes must preserve the planned recipe's
   category. Both suggestion creation and acceptance enforce this on the server,
   including a menu category changed after suggestion. The picker should make
   valid replacements understandable and retain search/pagination, duplicate
   exclusion and existing conflict/revision behavior. Architect decides the
   minimal compatible lookup contract and index handling.
5. Existing drafts and finalized history remain readable without regenerating,
   reclassifying or rewriting their snapshots. Display their stored categories;
   show legacy unclassified snapshots in a clearly labeled additional group.
   Existing unclassified draft slots may retain legacy swap behavior rather than
   gaining an invented historical category. Do not assert that older plans met
   the new targets. Existing pending suggestions that would violate a categorized
   slot must be rejected safely at acceptance, not silently applied.
6. Approval, finalization, recipe uniqueness, retained suggestions for other
   slots, family isolation, admission rechecks and verification-identity limits
   remain intact. Partial plans remain approvable/finalizable under the existing
   confirmation rules; there is no new completeness gate.

These shortage and compatibility rules are bounded PM decisions that make the
requested mix honest without creating recipes or modifying historical records.
They are not fabricated owner answers. Material scope disagreement escalates
under `org/protocol.md`.

## Current evidence

- `lib/plans/generate.ts` ranks ready family menu recipes using recent finalized
  usage, limits selection to seven, and snapshots their current recipe values.
- `lib/plans/validation.ts` limits meal arrays to seven and suggestion indices
  to0–6; eight-item support must include strict validation and storage checks.
- `lib/plans/store.ts` already checks current menu eligibility on suggestion and
  acceptance and preserves category in snapshots, but does not compare categories.
- `app/plans/plan-controls.tsx` renders a single recipe grid with original array
  indices driving suggestions; grouping must not reinterpret those indices.
- `app/plans/swap-recipe-dialog.tsx` excludes existing planned sources and searches
  paginated saved menu recipes without category filtering.
- `app/plans/page.tsx` currently advertises up to seven distinct choices.

## Acceptance criteria

- With sufficient ready classified saves, real local generation yields exactly
  four main, two side and two veggie snapshots, all distinct and family-scoped.
- Category pools below quota, unclassified-only menus, pending/failed curation,
  recent-use ranking, idempotent generation and scheduler abort/deadline behavior
  have meaningful regression coverage. No extra provider calls are introduced.
- Eight-item arrays and slot7 work through validation, read, suggestion,
  acceptance, approval and finalization; oversized arrays/indices remain invalid.
- Categorized swaps cannot change the group composition or duplicate another
  source, including stale/reclassified/foreign recipe cases. Legacy snapshots
  remain readable and unchanged on read.
- Real Chrome at mobile and desktop widths verifies separate sections, partial
  counts/guidance, historical unclassified display, searchable swaps and the
  eighth slot without overflow or broken keyboard/focus behavior.
- Strict TypeScript tests, lint, typecheck, build, relevant plan/menu/auth/family/
  deployment regressions, workflow checks, plan-sync and staged secret scanning
  pass with actual evidence; independent design, security and code reviews clear.

## Boundaries and handoff

Proceed through architect specification and plan, independent peer approval,
local implementation and verification, security review and code review under
`org/protocol.md`. Native migration artifacts and disposable owned test databases
may be changed if storage constraints require eight items; exact storage design
must be reviewed before code. Development/hosted migrations, grants, configuration,
issuance, staging deployment, Production release, push and merge are outside this
request's authority. Human merge and release gates remain separate.

No category editor changes, automatic reclassification/backfill, meal CRUD,
user-configurable quotas, daily calendar allocation, shopping list, dietary
claims, scheduling changes, new providers/dependencies or unrelated UI are included.
