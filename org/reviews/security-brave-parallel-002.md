# Brave parallel recipe search — final security refresh

- Reviewer: security-researcher, independent of implementation author.
- Final application source: `e14feec`; dispatch audit: `5eab2fb`.
- Prior full security assessment: `security-brave-parallel-001.md`, application
  source `2989467`, approval commit `8f38bb8`. That source-specific approval
  remains historical; this report assesses the intervening final changes.
- Scope: instruction-ItemList correction `dc1c778` and owner-directed eight-second
  per-item deadline `e14feec`, against approved amendments and current AGENTS.
- Verdict: **Approved for the final local implementation security gate. No open
  blocking security findings identified.** Merge/release, hosted changes,
  distributed-spend controls and live quality remain separate decisions.

## Delta assessment

1. **Eight-second lifetime includes queued work and validation.**
   `lib/recipes/parallel-search.ts:66–82` computes one fixed8000ms deadline before
   model-pool enqueue, bounded by the parent request. It does not restart the
   timer when a slot opens. The callback checks the absolute deadline before
   starting paid work; the caller checks it again after complete curation/
   validation, so delayed timer dispatch cannot admit a late start or result.
   Job expiry is caught per item; already validated sibling cards survive.
2. **Timeout outcome and parent precedence.**
   `parallel-search.ts:83–96` rechecks parent abort before emitting any results.
   With no valid card, elapsed work reports SEARCH_TIMEOUT before an explicit
   rejection can become successful no-results. The existing handler maps this
   to sanitized504. No retry, replacement curation, larger paid budget or
   fallback was added. Source/handler/route budgets remain unchanged.
3. **Underlying work retains its lease.**
   `lib/recipes/concurrency.ts` and bounded body reader are unchanged from the
   full assessment. The caller may stop waiting at the local deadline, but
   active transport/cancellation still owns its slot until actual settlement;
   expired queued work is removed and never starts later. Thus skipping a slow
   curator does not admit replacement work beyond global model12/source2 caps.
4. **Instruction ItemList is not a page collection.**
   `lib/recipes/source.ts:106–129` tracks whether traversal is inside a Recipe's
   `recipeInstructions` subtree. Only ItemLists outside it contribute page
   collection identity and follow-up URLs. Nested instructions remain traversed
   under the same node/depth limits; genuine page ItemLists and CollectionPage/
   URL/heading signals still classify collections. Recipe identity/canonical/
   principal-title and ingredient/method checks remain intact. This fixes
   legitimate structured cooking evidence without expanding a model-controlled
   URL surface or trusting a collection's embedded example as its parent card.

No other runtime/UI security boundary changed since the prior full review:
shared pools, provider body cleanup, strict source transport, exact title/quote
curation, configuration/key ownership, family guards, twelve-card menu chunks,
late-response save versions and fixture paid-key clearing remain as assessed.
Confirmed the boundary diff is empty for those paths. README changes document
the new timeout behavior rather than introduce a public timeout setting.

## Independent verification

Independently ran `pnpm test` on final source: exit0,112passed,0failed/skipped/
cancelled (`/private/tmp/brave-security-refresh-tests.log`). This strictly
compiles and reruns existing recipe/photo/security tests plus:

- Eight-second valid-sibling survival with an abort-ignoring active transport retaining
  its lease until it actually settles;
- expiry while queued with no later model start;
- explicit rejection plus expiry yielding504, and parent abort overriding
  completed siblings;
- absolute clock checks for late output and late slot acquisition before timer
  dispatch;
- pending body cancellation retaining its lease until cleanup settles;
- valid instruction ItemList extraction and fixture curation, while a separate
  page ItemList with an embedded Recipe still expands as a collection.

Also checked `git diff --check`. Developer-reported final verification inspected:
112recipe,34family,69menu,16auth,33deployment (264Node total),7Python, lint,
typecheck, production build and actual isolated Chrome390/1440 passed. Those
additional commands were not independently rerun in this focused refresh.
The new tests use mocked clock timing, no paid providers or real8second sleeps.
This reviewer made no paid call, app edit, database change or hosted action.

## Evidence limitations and remaining gates

Historical live measurements use source `2989467`, before both corrections.
Named-query8cards and corrective broad-query1card remain historical results;
the original broad502 remains preserved. Broad-query recall was weak and is
not upgraded by a parser fixture or this security approval. No corrected-source
live latency,8second paid-provider proof, dietary-fidelity guarantee, production
load percentile or distributed-spending assurance is claimed. The existing
three-query paid-verification allowance is exhausted; no additional live work
was performed or authorized here. Final code/quality review and explicit human
merge/release approvals remain separate.
