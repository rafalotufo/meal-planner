# Weekly family meal planning — brainstorm

- Date: 2026-11-24
- Source: Rafael's active chat, using `ai-native-sdlc:old-eg-brainstorm`
- Stage: Feature ideation for the existing app
- Breadth: Five deeper concepts
- Research: Off
- Status: Direction selected; saved at the owner's request

## Seed

Build a weekly meal plan from the saved menu, with family members helping shape
it. Share the work of deciding what to eat and give everyone a voice. Use saved
recipes as the starting pool, keep participation within the existing family,
and make contributing quick and easy. Success means a useful weekly plan with
less coordination work for one person. Implementation, grocery ordering,
nutrition optimization and new recipe discovery were outside the brainstorm.
The owner confirmed this seed before the independent rounds.

## Independent rounds

Three fresh thinkers produced nine proposals through these lenses:

- Family experience: Everyone Gets a Pick; A Draft to React To; Claim a Dinner
  Night.
- First principles and practical coordination: The Weekly Shortlist; Claim a
  Night; A Draft with Easy Swaps.
- Contrarian and participation pre-mortem: Silence Means “Plan for Me”; Own One
  Dinner; One Objection, One Alternative.

## Five synthesized concepts

| Concept | Interaction and bet | Main risk |
| --- | --- | --- |
| Everyone gets a pick | Each member requests one saved recipe; a coordinator schedules the choices and fills gaps. Small contributions give everyone a voice. | Scheduling still falls to one person; requests can feel like promises. |
| Claim a night | Members own a dinner decision for a day; choosing and cooking are separate commitments. | Unclaimed nights may repeatedly fall to one person. |
| React to a draft | Start with a proposed week; family members approve or suggest a replacement from the saved menu. Concrete proposals make participation easy. | Creating the draft still takes work, and silence can be ambiguous. |
| Family shortlist | Members nominate a few recipes before scheduling. Shared preferences guide the plan. | A coordinator must reconcile the input; popular choices can dominate. |
| An input window | Contributions close at a cutoff and a coordinator settles the week. Planning can finish without chasing everyone. | Deadlines can feel formal and quiet members can feel overlooked. |

## Original ranked picks

1. Everyone gets a pick: easiest contribution to validate for one week.
2. Claim a night: strongest when sharing decision responsibility is the goal.
3. React to a draft: strongest when family members respond more readily than
   they initiate.

The owner selected **React to a draft**, superseding the original ranking.

## Agreement and disagreement

Recurring signals were to keep contributions small and specific, separate
choosing from cooking, finish planning without requiring everyone to participate,
and distinguish requests from confirmed meals. The thinkers differed on whether
participation should express preferences, own a dinner, or review someone else's
work, and whether silence should count as delegation.

## Selected direction and owner refinements

- Automatically create a draft every Thursday. The draft day is configurable
  through an environment variable, defaulting to Thursday.
- Each draft covers the **upcoming Sunday through Saturday**.
- Choose from the family's saved recipe menu.
- Family members approve the draft or suggest recipe swaps.
- **Do not offer “I'll be away.”** That brainstorm option was explicitly rejected.
- Preserve weekly meal history and use it when creating future drafts so the
  exact same meals do not recur every week. Repeating a meal is allowed.
- The owner then asked to save this brainstorm and implement through the SDLC
  org workflow, beginning with an intent.

## Design decisions still to make

The owner did not explicitly settle meal types, the generation time/timezone,
who resolves swaps and confirms a plan, or whether history records plans or
actual consumption. The intent identifies bounded proposed defaults for these;
they are not represented as additional owner-approved requirements.
