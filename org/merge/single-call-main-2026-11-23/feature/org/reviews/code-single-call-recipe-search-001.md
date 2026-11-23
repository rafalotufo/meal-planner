---
artifact: single-call-recipe-search-implementation
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent code review — single-call recipe search

## Verdict

Approved for local code-owner handoff under the org independent review gate.
No blocking or required findings remain. The cross-record metadata test was
strengthened, and the diagnosed prompt mismatch was corrected without relaxing
the parser. Final verification evidence and independent security clearance have
been reviewed. This is not human merge or release approval.

## Scope and evidence inspected

Reviewed the approved intent/spec/plan, REVIEW.md, AGENTS.md, and the source/test
diff against the pre-implementation revision. Application-facing changes are
limited to lib/recipes/openai.ts, tests/recipe-fixtures.ts,
tests/recipe-openai.test.ts and README.md. Read recorded red/green outputs and
the unchanged-payload implemented-provider live wrapper and results, the final
prompt-only delta, complete verification record and independent approved
security report. No application source, org state or Git mutation was performed
by this reviewer.

- **Bugs:** openai.ts:122–148 directly validates one combined envelope. It
  distinguishes malformed/ungrounded input from explicit empty results and
  individually omitted invalid cards. Source identity is checked against native
  citations; summaries and exact method excerpts are bounded and stay local to
  the same record. Optional values are checked independently and become null
  without discarding valid cards. Emitted-source deduplication follows card
  validation, and the six-card cap follows emission.
- **Security:** openai.ts:26–80 retains the original narrow citation-display
  cleanup; responseText keeps completion/refusal, cumulative raw text bound,
  native citation membership and completed-search checks. The original 1 MiB
  reader remains. openai.ts:168–190 makes one request with the same endpoint,
  model override, store:false, low reasoning, required hosted search, eight-tool
  and 5,000-token limits. Pre-/post-request abort checks preserve parent reason;
  no retry, repair, snapshot replay, second call or exposed evidence path exists.
  Auth, handler, photo transport, client and public types have no source diff.
- **Compliance/simplicity:** removal of Candidate IDs, the source/card join,
  curator prompt/schema and the second generation path implements the approved
  flattened design. README accurately describes one call and same-response
  evidence limits. The lost second generation schema is not presented as
  independent verification. Tests adapt obsolete two-call assertions while
  retaining citation offset/Unicode/overlap cases, source safety and failure
  paths; the red run recorded ten behavioral failures before provider edits,
  then the green application suite recorded 66 passes and zero skips.

## Test challenge

Copied compiled tests into ignored build/reviewer-single-call-mutation, leaving
application source and shared build/recipe-tests artifacts untouched. Changed
only supportedEvidence's `evidence.includes(excerpt)` check to `true` in the
isolated copy. `node --test` on that copy's provider test suite exited 1:
18 passed, one failed. The optional-excerpts test rejected the mutation because
an unsupported image was exposed instead of null. Restored the copied compiled
provider afterward. This demonstrates that the evidence-containment assertion
is exercised rather than merely mirrored by an always-green test.

The preliminary optional-excerpt test used a mismatching string in one record.
The developer strengthened it at the reviewer's request: a second valid record
now contains the first record's swapped excerpt strings; the first card must
have null metadata while the second retains its own image/time. This fulfills
the plan's explicit cross-record isolation proof. No global evidence pooling
exists in the inspected production code; the change strengthens regression
coverage rather than repairing a demonstrated production leak.

## Initial live quality observation and resolution

The three implemented-provider live results used one request each and returned
2/4/3 cards in 18.166/25.570/19.167 seconds, respectively. All nine cards exposed
null time and image values. Nullable metadata is allowed, but this was a material
availability limitation, not evidence of equal metadata quality to prior trials.
The first unchanged-payload live wrapper saved projected results only; it could not
distinguish model omission from rejected optional excerpts without raw-response
inspection. Separate photo enrichment and fixture-based browser checks do not
establish that the model returned source times. No universal latency or factual
accuracy claim follows from these three calls.

The independently accepted bounded diagnostic then established the cause:
the model supplied all expected fields and nonnull metadata but used evidence
fields for commentary while excerpt fields contained different source text.
The unchanged parser correctly rejected containment. Inspection of the ignored
summary and one raw record confirmed that mismatch independently. The plan
review approved a prompt-only clarification, with exactly three final live
queries after recording the remediation limit in the plan. No parser relaxation
was made. The final source's additional instruction at openai.ts:17 requires
actual observed metadata in evidence and identical literal text in the excerpt,
with citation display appended only to evidence; it explicitly forbids invention.

The actual final provider then returned 3/4/3 valid cards in
19.774/26.652/17.739 seconds, using exactly one request per search. All ten
reported times and all four reported model images had contained same-record
excerpts and survived validation. The remaining six model images were explicit
nulls. This corrects the observed wire-shape mismatch in the final sample;
it does not guarantee metadata completeness, every recipe fact, or a general
latency improvement. These are provider-only timings, separate from optional
photo enrichment and fixture-based browser checks. Total implementation live
verification remained bounded to seven requests as independently approved.

## Final verification and clearance

Reviewed org/reviews/single-call-recipe-search-verification.md and feature
progress against the available command logs and final live records:

- Application tests: 66 passed, zero failed/skipped after the final prompt and
  strengthened fixtures; the earlier ten-failure red run remains documented.
- Lint, strict typecheck and production build passed after the final prompt;
  post-build authentication regressions passed all 12 tests.
- Workflow tests passed 7/7 and deployment smoke tests passed 12/12. The
  environment's initial localhost permission failure is disclosed rather than
  counted as a passing run.
- Existing isolated real Chrome QA passed at 320/390/768/1024/1440 pixels,
  covering auth, keyboard action, publisher image, history/filter/sort, loading/
  error retention, empty/long content and reload clearing. Its intercepted
  search responses are explicitly fixtures, not live provider evidence.
- Independently viewed the new 320px and 1440px result screenshots: responsive
  layout and controls fit the viewport without horizontal clipping. Independently
  recomputed all 19 historical screenshot hashes against the backup manifest;
  every original matched. The final prompt-only edit changed no UI/browser code.
- The orchestrator's handoff records staged secret scan zero findings,
  approved-plan synchronization passed, and zero message/loop/memory violations.
  This reviewer confirmed the final staged diff has no whitespace errors.
- Read the finalized independent security report
  org/reviews/security-single-call-recipe-search-001.md: approved/clear, no
  required findings. Auth, photo transport, public interfaces, dependencies,
  configured model and production configuration remain outside the source diff.

The final change implements the user-selected single-call approach with a
smaller provider path and preserved runtime evidence/usage boundaries. Human
merge, push and production release remain separate decisions.
