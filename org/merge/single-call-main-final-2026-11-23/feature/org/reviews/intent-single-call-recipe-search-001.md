---
artifact: intent/single-call-recipe-search/intent.md
reviewed_at: 2026-11-23
reviewer: product-manager
verdict: approved
round: 1
---

# PM scope decision — single-call recipe search

## Verdict

Accepted for Design under `org/protocol.md` and `org/org-chart.yaml`. Rafael
explicitly selected research and curation in one call after the live comparison
and requested the SDLC org workflow. No product clarification is required before
design. This is the PM's scope decision, not independent peer review of
PM-authored text or implementation approval.

## Scope and evidence

- `org/messages/ceo-0025.md` records the user's implementation selection and
  local authorization, with merge/push/production actions excluded.
- `intent/single-call-recipe-search/research.md` preserves the measured tradeoff:
  the single-call prototype passed structural validation in 6/6 trials but did
  not consistently outperform mini curation. The new intent promises one
  combined provider request, not a fixed search time or proven universal win.
- `intent/recipe-search/spec.md`, “Two bounded recipe agents” and “Grounding and
  validation,” establishes the current arrangement and evidence rules. This
  intent expressly authorizes replacing the arrangement while retaining native
  citations, exact source identity, source-specific evidence and resource bounds.
- `intent/recipe-photos/spec.md`, “Integration contract” and “SSRF-safe HTML
  transport,” requires optional enrichment after validated provider results,
  preserving parent abort/deadline and valid cards. These are unchanged scope
  constraints, not another provider call.
- `intent/recipe-search-notebook/spec.md` defines the current public behavior and
  transient history/filter/sort contract. No UI/API or authentication change is
  needed for this focused provider improvement.

## Handoff

Architect must specify the smallest combined response and its validation,
including exact citation membership, recipe-specific evidence, optional metadata,
no-results versus upstream failure, bounds, and abort semantics. The server must
not invoke a second model to repair, retry, or curate a response. Retain the
current configured/default model and provider boundary. Keep meaningful strict
TypeScript regression coverage, separately labeled live evidence and actual
mobile/desktop verification. Preserve original feature artifacts and audit history.

Independent design/plan/code/security gates remain; human merge and release
gates remain closed. No application code, status/loop/graph/ledger mutation,
commit, merge, or production operation occurred in this PM drafting turn.
The orchestrator serializes role-state updates, turn recording, and commits.
