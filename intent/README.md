# Feature artifact convention

Every feature or change gets one folder under `intent/`, named with a short,
lowercase kebab-case slug. Keep its intent and all specifications together:

```text
intent/
  home-page/
    intent.md
    spec.md
    plan.md
```

Use `intent/<feature-slug>/intent.md` for the problem, outcome, scope, and
acceptance criteria; `spec.md` for requirements and design; and `plan.md` for
implementation order, changed-file manifest, risks, and verification. Put
additional feature-specific specifications and design notes in the same folder.
Create each artifact when its SDLC stage is reached. Keep existing feature
folders when starting another feature.

The orchestrator selects the feature's intent as the loop work item and points
the workflow graph's intent/spec/plan artifacts at that folder. Roles read the
active feature's sibling artifacts rather than assuming root-level files.
Plan-sync checks use the active plan path from the workflow graph, or an
explicit `--plan intent/<feature-slug>/plan.md` when checking another feature.

Intake source records remain in `org/intake/`; peer reviews and verification
evidence remain in `org/reviews/`. The specification folder links to these
records instead of duplicating them. Preserve historical messages, loop
history, and hash-chained gate records when moving artifacts; record the path
mapping as a sourced memory event.
