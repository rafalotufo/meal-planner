# Org memory — main context

<!-- machine:begin -->

## Goal

intent/recipe-search/intent.md

## Loop

- status: in_progress
- turn: 1
- phase: spec
- stop_reason: None

## Agents

- architect: busy (intent/recipe-search/spec.md)
- memory-keeper: idle (unassigned)
- orchestrator: idle (unassigned)
- product-manager: idle (unassigned)
- reviewer: busy (intent/recipe-search/spec.md)
- security-researcher: idle (unassigned)
- senior-developer: idle (unassigned)

## Open messages

- ceo-0001 ceo -> product-manager answer: Re: Feature scope needed for intake
- orchestrator-0002 orchestrator -> architect handoff: Design source-grounded recipe search

## Recent decisions

- mem-0002 product-manager: Accepted home-page scope: latest stable Next.js, Tailwind v4, Drizzle tooling, title-only page with no DB dependency. (org/reviews/intent-home-page-001.md)
- mem-0003 orchestrator: User requested all feature specifications under intent/<feature-slug>/. Moved intent/intent.md, spec.md, plan.md to intent/home-page/intent.md, spec.md, plan.md respectively. Updated active graph/work item without resetting turn budget; historical approval paths remain as originally recorded. (intent/README.md)
- mem-0008 orchestrator: CEO requested next feature recipe-search and an agent-org run. Archived home-page state/history/graph before initializing a new six-turn feature budget; prior ledger and audit records retained. (org/intake/forms/recipe-search-001.md)
- mem-0009 ceo: Recipe search discovers existing web recipes with source links. Start with OpenAI API behind configurable provider selection and a small extensible interface; future Gemini adapter is deferred. (org/messages/ceo-0002.md)

## Constraints

(none)

## Artifacts

- intent/recipe-search/intent.md (189b443857eb9a970f353134560158dc589132980e8e23dd85cab5340471de1e)

## Next action

product-manager:review_intent

## Last digest source

- mem-0009 from org/messages/ceo-0002.md

<!-- machine:end -->

## Curated notes
