# PM intent review — unique weekly recipe choices

- Reviewer: product-manager
- Date: 2026-11-24
- Artifact: `intent/weekly-meal-planning/intent.md`
- Source: owner active-chat correction, recorded by the orchestrator in
  `org/messages/ceo-0054.md`
- Verdict: Accepted for Design under `org/protocol.md`

## Owner decision

The owner requires no repeated recipes within a week. When explicitly asked
about a small menu, the owner selected “Draft the available unique recipes.”
The intent now requires up to seven unique recipe choices: one to six when
that is all the menu offers, seven when enough are available, and no draft
for an empty menu. This applies to automatic generation and swaps. Repetition
across different weeks remains valid and subject to existing recency guidance.

## Scope and continuity

This corrects the earlier small-menu repetition allowance without changing the
selected React to a draft interaction. The weekly Sunday–Saturday calendar,
Thursday default generation day, configurable schedule, family approval/swap
actions, history and undated main/card presentation remain. Unrelated swap
suggestions must survive accepted replacements, while approval reset and
stale-client revision conflicts remain enforced.

Design must define recipe identity and concurrency-safe uniqueness. Routine
legacy handling is delegated to architect and independent review: repairing an
existing duplicated draft requires an explicit local migration that preserves
choices and proposals where possible. Finalized raw history remains immutable,
and ordinary reads never repair data. This is not authority for hosted migration,
deployment, merge or release.

The owner resolved the only material small-menu ambiguity. No further product
question blocks Design. Acceptance opens the specification/plan correction;
implementation still requires independent review and actual verification.
