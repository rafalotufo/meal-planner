# Weekly family meal planning — intent

- Author: product-manager, from Rafael's active chat
- Date: 2026-11-24
- Status: Accepted for Design under the org PM intent gate
- Source: `brainstorm.md` and the owner's request to save it and implement using
  the SDLC org workflow
- Decision: `org/reviews/intent-weekly-meal-planning-001.md`

## Problem

The family can save recipes to a shared menu but cannot turn that menu into a
shared weekly plan. Starting from a blank week leaves one person doing the
decision work. Without weekly history, repeated drafts can select the same
meals too often.

## Proposed outcome

Automatically propose a family meal plan from saved menu recipes every Thursday
for the upcoming Sunday–Saturday. Family members react to that concrete draft
by approving it or suggesting a saved-recipe swap. A final plan remains visible
in weekly history; future drafts favor meals used less recently without banning
repeats. Keep the interaction small enough that participation saves effort.

## Owner-confirmed requirements

- Saved recipes in the existing family's menu are the draft's recipe pool.
- Draft creation is automatic; its day is configurable by an environment
  variable whose default is Thursday.
- The draft covers the upcoming Sunday through Saturday.
- Family participation includes approval and suggested recipe swaps.
- There is no “I'll be away” option.
- Preserve weekly history and use it to discourage repetitive weekly menus.
  Repeats remain valid, including when the saved menu is small.

## Acceptance criteria

- A protected weekly-planning screen presents the seven dated days, draft/final
  status, saved recipe choices, family feedback and actionable empty/error states.
  Existing shared navigation makes the screen discoverable.
- An explicit trusted scheduler operation creates at most one draft per family
  and target week, using the configured day and a documented timezone/time.
  Duplicate/concurrent invocations do not overwrite an existing draft or family
  edits. GET, HEAD, Proxy, render and session reads never create drafts.
- Automatic selection is bounded, uses only that family's saved menu, requires
  no new paid provider calls, and meaningfully favors recipes not planned
  recently. A small or empty menu is handled honestly and repeatably; repetition
  is allowed rather than blocking planning.
- Current eligible family members can approve a draft or suggest a concrete
  saved-recipe replacement for a dated meal. The screen distinguishes suggestions
  from accepted changes, and accepted changes cannot silently retain misleading
  approvals of an older draft.
- A clear confirmation action settles the plan without needing every family
  member to respond. Swap resolution, confirmation and concurrency behavior are
  explicit and verified. No attendance response or away state is added.
- Past finalized weekly plans remain readable and supply recency information to
  later generation. Recipe snapshots preserve readable history if a menu recipe
  is later removed. Ordinary reads do not rewrite history.
- Every page, read and user mutation retains current admission and family-context
  enforcement; family IDs are server-derived. Scheduler authority is separate,
  narrowly scoped and authenticated, with no public authentication bypass.
- PostgreSQL persistence uses reviewed explicit migrations, bound queries and
  the repository's transaction/lock/time-limit rules. Runtime does not migrate.
  Tests use owned isolated local databases and empty paid keys.
- Strict TypeScript tests cover calendar/configuration, variety, idempotency,
  history, family isolation, admission, feedback and concurrent mutations.
  Required repository checks and real-browser mobile/desktop flows pass with
  actual evidence and independent spec/plan, security and final reviews.

## Bounded PM defaults for Design

These are proposed product defaults, not claims of additional owner approval.
The architect and independent reviewer may refine them within the outcome above:

- Start with **one dinner per day**, seven dinners per week. Other meal types
  and multiple courses are outside this first increment.
- Use the owner's known **America/Toronto** timezone as the proposed application
  default and choose/document a precise generation time. Calendar dates must
  remain correct across daylight-saving transitions. Avoid per-family timezone
  settings in this increment unless necessary for correctness.
- Allow any current eligible family member to resolve a swap and confirm the
  week, consistent with existing shared-menu permissions. Do not introduce new
  family roles, unanimity requirements or cooking assignments.
- History means **final planned meals**, not a claim that a meal was actually
  eaten. Actual-consumption tracking is deferred. Drafts should not pollute
  recency history before they are finalized.
- Finalized past weeks are history, not an invitation to general historical
  meal CRUD. Design must explain the allowed correction boundary for a current
  or upcoming week without silently erasing prior evidence.
- Prefer deterministic, explainable recency-based selection over AI generation;
  avoid unnecessary new dependencies or notification services.

## Constraints and authority

This feature explicitly expands the saved-menu-only application scope to the
weekly planning operations described above. General recipe editing, arbitrary
meal CRUD, groceries, nutrition optimization, attendance, cooking assignments,
notifications and new recipe discovery remain out of scope.

The owner authorizes the local org design/build/test cycle. The architect must
respect the existing deployment configuration and manual release gates. Prepare
the scheduler integration and runbook for review; do not deploy, activate hosted
scheduling, change hosted environment variables, run hosted migrations, import
data, enable paid features, push or merge. If a viable scheduler requires an
exception to the existing committed deployment-config constraint, present the
concrete conflict to the owner rather than silently changing that contract.

## Handoff

Architect: specify the calendar, scheduler trust boundary, draft algorithm,
history lifecycle, feedback/confirmation model, persistence and UI; produce a
bounded manifest plan. Independent peer review approves spec/plan before source
implementation. Escalate material product or deployment-constraint conflicts.
Senior developer then implements and verifies locally. Human merge and release
gates remain separate.
