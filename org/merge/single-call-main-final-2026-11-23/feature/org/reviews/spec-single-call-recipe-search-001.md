---
artifact: intent/single-call-recipe-search/spec.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent specification review — single-call recipe search

## Verdict

Approved for implementation planning under the org peer-review gate. No
blocking or required findings. This approval is limited to the specification;
it does not approve an unwritten plan, implementation, merge, or release.

## Evidence and review passes

Read AGENTS.md, REVIEW.md, org/protocol.md, the reviewer role card, the active
feature's intent/research/specification, lib/recipes/openai.ts,
lib/recipes/validation.ts, tests/recipe-fixtures.ts, and the existing provider
regression cases. Applied the code-review-and-quality skill to correctness,
architecture/simplicity, security, performance, and scope. No application code
was changed or executed in this specification-only review.

- **Bugs/correctness:** spec.md:13–28 defines exactly one Responses request and
  retains model configuration, abort/deadline, tool/token/body/text bounds.
  spec.md:89–108 distinguishes malformed or unusable research from explicit
  grounded no-results and from omission of invalid cards. That corresponds to
  the current parseResearch/curate split without preserving a second call.
  spec.md:115–118 deliberately marks a duplicate source only after a valid card
  is emitted, avoiding suppression of a later valid record by an invalid card.
- **Architecture/simplicity:** spec.md:38–79 and 120–139 use one record for each
  observed source and finished card, with no redundant ID join or duplicated
  source/title/time fields. Removing candidateId and the second generation
  schema is coherent because there is no independently generated second card
  identity. The direct parser must still enforce evidence containment and
  project only the existing public fields; the spec expressly requires this.
- **Security:** spec.md:74–114 retains untrusted-input handling, exact native
  URL membership, the existing narrow citation-display cleanup, local method
  excerpts, and local optional evidence excerpts. Unsupported metadata becomes
  null while valid cards survive, consistent with AGENTS.md. Photo transport,
  auth, error sanitization and credential boundaries remain unchanged.
- **Performance/compliance:** spec.md:21–28 preserves the 5,000-token ceiling
  rather than combining it with the removed 3,000-token allowance. The selected
  one-call approach matches the owner's explicit request even though the prior
  experiment did not prove a consistent speed win. spec.md:141–150 accurately
  distinguishes the changed wire shape from the prototype and acknowledges
  that native citations/excerpts do not independently verify all model facts.

## Required evidence at later gates

The verification contract at spec.md:154–176 is sufficient for planning:
meaningful red/green TypeScript regressions for single-request outcomes,
grounding and citation edge cases, optional metadata/null handling, dedupe and
bounds, plus the unchanged application/auth/workflow suites. Actual production
adapter live results must be labeled separately from browser fixtures. Preserve
historical screenshots and save new mobile/desktop evidence under distinct
feature names. Code/security review must assess actual tests and implementation;
this design review does not substitute for them.

No merge, push, production configuration change, or release was authorized or
performed by this reviewer.
