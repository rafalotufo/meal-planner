---
artifact: intent/recipe-search/spec.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: changes
round: 1
---

# Independent recipe-search specification review

## Findings (by severity)

1. **[MED — Bugs / compliance] Bind evidence to the selected recipe source.**
   `intent/recipe-search/spec.md:146` requires only that `methodEvidence` occur
   somewhere in the entire research text; the optional time/photo checks have
   the same global scope. Together with URL membership at line 139, this admits
   a card for cited recipe A with the cooking method or time of cited recipe B.
   Both checks pass although the summary is unsupported by the linked source,
   contrary to `intent/recipe-search/intent.md:42`. Define source-specific
   research candidate records or citation-associated evidence sections, and
   validate each curator record against the evidence belonging to its exact
   normalized source URL. Drop mismatches and test two cited recipes with
   deliberately swapped method/time/image evidence. This cannot prove the
   researcher's original reading, but it prevents the curator from mixing
   otherwise valid candidates.

2. **[MED — Bugs] Distinguish an empty search from missing grounding.**
   `intent/recipe-search/spec.md:143` makes missing citations an unconditional
   upstream failure, while line 154 and the UX at line 43 permit a successful
   no-matches result. A completed search that finds no suitable recipe may
   legitimately have nothing to cite, and this design turns that ordinary
   empty state into an error. Specify an explicit empty research outcome after
   a completed web-search call that can return `recipes: []` without recipe
   citations. Continue to reject every nonempty candidate lacking its cited
   source. Add separate fixtures for legitimate no matches, missing tool use,
   and nonempty uncited output so an upstream failure cannot silently become
   a success.

## Evidence and positive checks

- Read the accepted intent, complete specification, CEO provider clarification
  in `org/messages/ceo-0002.md`, current `app/page.tsx`, `package.json`, org
  reviewer/protocol cards, and `REVIEW.md`; reviewed bugs, security, and
  compliance separately.
- The small provider boundary and explicit unsupported-provider behavior match
  the CEO's OpenAI-first / future-Gemini requirement without a speculative
  adapter framework (`spec.md:77`). The new UI is authorized by the accepted
  feature scope despite the previous title-only increment.
- Credentials and transport remain server-side, server recipe/image fetching
  is excluded, model strings render as text, usage and response sizes are
  bounded, and missing media/configuration have honest outcomes. No additional
  blocking security finding at this specification stage.
- Independently checked official [model documentation](https://developers.openai.com/api/docs/models/gpt-6.2-sol.md):
  `gpt-6.2-sol` is an API model ID with Responses, web-search, and structured
  output support. Its documented rejection of reasoning effort `none` does
  not conflict with the chosen `low` effort.
- Checked [web-search documentation](https://developers.openai.com/api/docs/guides/tools-web-search):
  responses expose completed search items and URL citation annotations;
  reasoning models support page opening; source attribution must remain
  visible and clickable. The spec preserves attribution in each recipe card.
- Checked [Responses create reference](https://developers.openai.com/api/reference/resources/responses/methods/create):
  `max_tool_calls` bounds total built-in calls and `max_output_tokens` includes
  reasoning tokens, consistent with the proposed two-call limits.

## Verdict and limits

Changes required before plan approval. Both findings are bounded contract and
verification clarifications, not requests for an additional service or agent.
No code, live provider request, browser execution, or credential access was
performed in this document review. No merge or release approval is implied.
