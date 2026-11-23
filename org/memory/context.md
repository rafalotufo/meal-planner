# Org memory — main context

<!-- machine:begin -->

## Goal

intent/recipe-search/intent.md

## Loop

- status: in_progress
- turn: 5
- phase: review
- stop_reason: None

## Agents

- architect: idle (unassigned)
- memory-keeper: idle (unassigned)
- orchestrator: busy (intent/recipe-search/intent.md)
- product-manager: idle (unassigned)
- reviewer: idle (unassigned)
- security-researcher: idle (unassigned)
- senior-developer: idle (unassigned)

## Open messages

- ceo-0001 ceo -> product-manager answer: Re: Feature scope needed for intake

## Recent decisions

- mem-0003 orchestrator: User requested all feature specifications under intent/<feature-slug>/. Moved intent/intent.md, spec.md, plan.md to intent/home-page/intent.md, spec.md, plan.md respectively. Updated active graph/work item without resetting turn budget; historical approval paths remain as originally recorded. (intent/README.md)
- mem-0008 orchestrator: CEO requested next feature recipe-search and an agent-org run. Archived home-page state/history/graph before initializing a new six-turn feature budget; prior ledger and audit records retained. (org/intake/forms/recipe-search-001.md)
- mem-0009 ceo: Recipe search discovers existing web recipes with source links. Start with OpenAI API behind configurable provider selection and a small extensible interface; future Gemini adapter is deferred. (org/messages/ceo-0002.md)
- mem-0010 ceo: New recipe test scripts and fixtures must be TypeScript; compile with existing TypeScript then use Node native test runner. Update plan manifest to match; retain Python workflow regressions. (org/messages/ceo-0003.md)
- mem-0011 security-researcher: Recipe-search security clear after correcting stalled-body deadline/abort cancellation and preserving per-process admission/accounting; live source fidelity and release decisions remain pending. (org/reviews/security-recipe-search-002.md)

## Constraints

(none)

## Artifacts

- intent/recipe-search/intent.md (189b443857eb9a970f353134560158dc589132980e8e23dd85cab5340471de1e)
- intent/recipe-search/spec.md (22bfac988b8c532d69b1ac26e54730a3c58ee152d5ba13b1a6f2984b2ea331eb)
- intent/recipe-search/plan.md (2970c430b0bab5b18653ec89e9203cc978056ef42afe4997e97a5e4a4e69a6ac)
- app/recipe-search.tsx (b38bf0bf221dd2bf83224b0ff765e1e93e487a57d97a6456fe632950cf4482f0)
- org/reviews/security-recipe-search-002.md (e65d515dce254910c400cb0feb72cbf147aee94147508e0f390b25a247daf6ff)

## Next action

security-researcher:assess_security

## Last digest source

- mem-0011 from org/reviews/security-recipe-search-002.md

<!-- machine:end -->

## Curated notes
