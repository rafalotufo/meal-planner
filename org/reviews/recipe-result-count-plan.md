# Recipe result count — independent intent/spec/plan review

- Date: 2026-11-24
- Reviewer: independent `review_result_count` agent
- Verdict: Approved for the bounded local prompt correction

Reviewed the three artifacts in `intent/recipe-result-count/` and the current
provider instructions in `lib/recipes/openai.ts`. The existing instruction asks
for “up to six”, so a stronger six-result target fits the existing capacity and
the user's expectation for common searches. It does not require raising output,
tool, request, concurrency or deadline limits.

No blocking findings. Preserve the stated qualifications: explicit query
constraints and cited, same-source method evidence take priority over count;
fewer cards remain legitimate when the existing budget or usable sources prevent
six. Seeking alternatives must stay inside the current single provider request.

Existing fixtures meaningfully protect six-card projection, deduplication,
invalid-record filtering, grounding and request bounds. An assertion copying
the new prompt wording would not establish improved retrieval. Final evidence
must distinguish those fixture checks from live outcome validation: the user's
specific three-result cause is unconfirmed, and this correction cannot yet be
reported as a verified live pizza/chilli fix. No paid QA, merge or deployment is
approved by this review.
