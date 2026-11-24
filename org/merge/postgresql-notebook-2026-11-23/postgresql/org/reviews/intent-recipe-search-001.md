---
artifact: intent/recipe-search/intent.md
reviewed_at: 2026-11-23
reviewer: product-manager
verdict: approved
round: 1
---

# PM scope decision — recipe search

## Verdict

Accepted for Design under `org/protocol.md` and `org/org-chart.yaml`. This is
the PM's product scope decision, not independent peer review of PM-authored
text. Spec, plan, code, and security retain their separate review gates.

## Findings

No blocking product-scope finding. The CEO confirmed discovery of existing
web recipes, with links to their original sources. The owner
explicitly requests free-text input, LLM-agent search, and reviewable recipe
title, picture, short cooking description, and available cooking time.

The CEO requested a configurable provider, starting with OpenAI API, and the
ability to add providers such as Gemini later. This increment implements only
OpenAI behind a small provider boundary with configurable server-side
selection. Future Gemini implementation is deferred. The exact interface,
model, and search tooling belong to Design; paid account creation or service
provisioning remains outside the authorized scope.

Missing images and cook times are normal search outcomes. The intent requires
honest fallbacks and source-grounded summaries rather than fabricated metadata.
Source links make each short result actionable and reviewable. No persistence,
accounts, meal planning, or database is needed for this outcome.

## Evidence

- `org/intake/forms/recipe-search-001.md`, Details: Rafael names recipe-search
  and specifies textual descriptions, LLM agents, and the four result fields.
- CEO clarification in the active chat, relayed by the orchestrator: existing
  web recipes with source links; configurable provider starting with OpenAI API,
  supporting future additions such as Gemini.
- `org/roles/product-manager.md`: PM owns intent review, scope, and ambiguity
  escalation; `org/protocol.md`, Gates: PM accepts intent, CEO retains merge
  and release approval.
- `AGENTS.md`, Architecture and scope: current app is the title-only foundation,
  with no configured database; additional UI requires feature scope.
- `intent/recipe-search/intent.md`: records the requested outcome, observable
  acceptance criteria, missing-data behavior, design questions, and exclusions.

## Handoff and limits

Architect should define the smallest practical agent search design, retrieved
source grounding, request/cost/time bounds, and safe handling of untrusted
descriptions, sources, links, and images. Provider credentials and live testing
must be handled explicitly; mock success cannot stand in for live evidence.

No application changes, package selection, tests, browser verification, loop
advance, gate-ledger mutation, commit, merge, or release occurred in this PM
drafting turn. The orchestrator owns routing and recording the completed turn.
