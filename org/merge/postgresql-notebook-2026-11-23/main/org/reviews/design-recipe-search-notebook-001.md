---
artifact: intent/recipe-search-notebook/spec.md
plan: intent/recipe-search-notebook/plan.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent design review — recipe search notebook

Approved for local implementation within the stated manifest. No blocking or
required findings. Human merge and release approval remain separate.

## Scope and handoff

Reviewed the sibling intent, specification and implementation plan against
Rafael's selected Everyday grid + Search notebook design and explicit request
to implement it, with pills filtering the selected search's results. Also read
AGENTS.md, org/protocol.md, the current recipe-search/photo specifications,
public Recipe types, current server page/client form and active loop state.
The explicit implementation request supplies the scope authority; this review
does not introduce a redundant human approval gate.

The design translates that request into concrete, testable behavior: newest-first
expandable search groups, local mutually exclusive filters, choices retained
per search, source-preserving responsive cards and transient page-scoped
history. Sorting already appears in the selected grid concept. No new backend,
identity policy, provider call, database or persistence system is proposed.

## Correctness and evidence

- Existing public data has titles, summaries, source URLs, optional photos and
  cook/total time text; it has no ingredient list. Matching ingredient pills
  only against whole words in titles, and stating this limitation, avoids
  presenting inferred ingredient verification as fact.
- The unambiguous “25 min or less” label matches the <=25-minute criterion.
  Excluding cook-only, missing and ambiguous times preserves the original
  distinction between source-supported total and cooking time.
- Separate submission identities, immutable state transitions, per-group
  choices, stable sorting and unknown totals last have explicit unit-test
  coverage planned. Keeping old groups during loading/error and adding only
  successful responses addresses the primary history regression risks.
- The plan requires TypeScript red/green tests before the logic change and
  real isolated Chrome verification at 320/390/768/1024/1440 widths. Integrated
  checks include request counts for local controls, keyboard behavior,
  long text, image fallback, loading/error retention, zero results and reload
  clearing. Intercepted responses are distinguished from live provider proof.
- Query/model text remains React text; all authentication, source evidence,
  link/photo protection and server transport limits remain intact. No runtime
  fixture endpoint, credential change, dependency change or deployment is
  included.

## Execution boundaries

The manifest covers the proposed source, tests, documentation and workflow
records. Archiving the completed deployment loop preserves historical evidence;
new graph paths target this feature. Implementation and verification have not
been performed by this reviewer, and this design approval is not code/security
clearance or merge/release authorization.
