# Brave parallel recipe search — independent code review, round1

- Reviewer: reviewer, independent of implementation author and security reviewer.
- Application source: `2989467`, compared with baseline `ce07559` and approved
  intent/spec/plan plus the principal-heading amendment `53609f3`/`185d72b`.
- Verdict: **Changes requested: one required P2 correctness correction.**
- No additional paid call, merge, release or hosted action is requested.

## Required finding

### [P2, Bugs] Instruction ItemLists are misclassified as recipe collections

`lib/recipes/source.ts:116` marks the entire page as a collection whenever any
recursively visited JSON-LD node has type ItemList. A valid standalone Recipe
may use ItemList for its `recipeInstructions`; that representation is explicitly
supported by [Schema.org](https://schema.org/recipeInstructions). The extractor's
own `instructions()` helper already supports `itemListElement`, but the earlier
collection branch prevents reaching it.

Independent read-only reproduction using the valid `sourceHtml()` fixture:
replace only `recipeInstructions:[same HowToStep]` with
`recipeInstructions:{"@type":"ItemList","itemListElement":[same HowToStep]}`.
The original parses as `recipe`; the equivalent structured recipe parses as
`collection`. It therefore never reaches curation, may consume expansion budget
on step links, and can produce no usable cards despite observed recipe evidence.

Distinguish instruction/step ItemLists from page-level recipe collections.
Write the failing standalone-instruction-list regression first, preserve actual
page ItemList/CollectionPage/collection-title detection and the embedded-example
rejection, then rerun affected source/pipeline/recipe checks and final lint,
typecheck and build. Do not loosen canonical/title/graph/quote/SSRF checks or
use a paid retry to verify this deterministic defect.

## Other review conclusions

**Security and resource control.** New queues are shared module-scoped defaults
across provider instances; per-search limits are independent of those pools.
Slots cover the owned source or complete model operation. Queued aborts are
removed; active aborts do not release a slot before underlying work settles.
The bounded reader awaits response-body cancellation before release, including
error and oversized responses. Parent abort is checked again after phase work
and before partial success. Source/model endpoints, redirect policy, credentials,
no-tools curations, request/encoded-input/output budgets and sanitized public
errors match the reviewed contract. Formal security review remains independent.

**Source/curation behavior.** Server-owned source URLs/title choices and separate
method/ingredient containment checks prevent model-written source substitution.
Optional time/photos derive from the same fetched source; a second photo-fetch
pass is absent. Broad collection expansion remains bounded/nonrecursive and
never emits a parent collection as a meal. Completed cards retain discovery
order. Candidate technical failures remain distinct from explicit rejection;
valid siblings survive local errors while parent cancellation takes precedence.

**Notebook integration.** Up to twelve validated sources become two at-most-six
POST lookups. Each response is checked against its own chunk. Per-source lookup
states keep failed chunks unknown rather than available, with generation/abort
checks and save-version reconciliation. The server's existing six-source bound
and family-owned menu effects are unchanged. Existing test servers explicitly
clear both Brave key names and the OpenAI key after overrides.

**Evidence and limitations.** I read the implementation tests, verification and
live records, and independently reran `pnpm test`:106passed,0failed. I also ran
read-only adversarial heading assertions and an offline24-entry source replay
for the narrow amendment. A temporary-copy mutation removing required method
containment wrongly accepted an invented excerpt that current source rejects,
confirming that the existing negative fixture exercises a meaningful guard.
No application/test file was edited; no paid request or database action occurred
in this review. Remaining full regression/Chrome results are developer/orchestrator
reports, not independently rerun here.

The retained initial broad502/zero-model result and corrected broad200/one-card
result are described honestly in live verification. One accepted card is weak
broad-query recall and does not establish useful varied coverage or ten/twelve
live cards. Under the approved fewer-results maximum, that single observation
alone is not a new deterministic code defect. PM/owner quality acceptance remains
necessary; neither fixtures nor an exact excerpt proves all preference/dietary
claims. The ItemList defect above is independently reproducible and must be
corrected regardless of that quality decision.
