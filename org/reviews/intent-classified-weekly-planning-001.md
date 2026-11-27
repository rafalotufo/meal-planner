# PM review — classified weekly planning intent

- Role: product-manager
- Date: 2026-11-27
- Artifact: `intent/classified-weekly-planning/intent.md`
- Verdict: Accepted for Design

The owner explicitly requested the4/2/2 composition and separate display.
Current generation (`lib/plans/generate.ts`) and validation
(`lib/plans/validation.ts`) cap the plan at seven; the current grid and slot-based
swap protocol make this a coherent planning feature rather than a category-label
change. It remains within saved-menu and weekly-plan scope.

PM decisions bound predictable edge cases: partial category pools never borrow
from other groups or repeat recipes; unclassified recipes stay available in Menu
but do not fill new drafts; historical snapshots stay intact and visibly
unclassified where needed. Categorized swaps retain the slot's stored category,
with server checks at suggestion and acceptance. Existing legacy unclassified
draft slots retain a compatibility path. Partial plans keep existing confirmation
rules. These explicit choices need no new product subsystem and do not claim an
owner answer beyond the supplied request.

No blocking ambiguity remains for architect design. The architect must resolve
eight-slot storage/index compatibility, same-category paginated picker behavior,
and schema constraints before independent spec/plan review. No application code
or release action is approved by this PM review.
