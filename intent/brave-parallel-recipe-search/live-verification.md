# Implemented Brave pipeline — live verification

Actual local provider + search-handler smoke, existing keys, no provider fixtures,
no additional photo pass. Direct handler testing excludes family HTTP and browser
authentication; those paths have separate isolated regressions. Times are single
observations, not latency percentiles. Provider timings below measure response
headers, excluding body consumption; source and full curation durations were not
separately instrumented in the original harness.

| Query | HTTP | Total | Brave calls | Model calls | Cards |
| --- | --- | --- | --- | --- | --- |
| crispy chicken tenders |200 |9701ms |1 |8 |8 |
| meals for picky eaters like chicken fingers and burgers |502 SEARCH_FAILED |15784ms |1 |0 |0 |

Named-query Brave headers:762ms. Eight model requests ran in parallel, headers
3996–4751ms. All8 returned a recipe title, usable public source URL, cooking
summary, source-derived total time and image URL; no fields were omitted. Titles
all describe chicken tenders/strips. Distinct source URLs include two different
Allrecipes recipes and six other recipe sites. Results demonstrate more than six
cards for this named query, with low variety expected from the narrow dish.
Exact public cards and timings are preserved in `live-results.json`.

The broad failure is a readiness blocker, not an empty relevant result set.
Saved discovery expanded a real picky-eater collection into recipe URLs, but
article/header/H1 suppression prevented binding otherwise valid recipe pages.
The parser fix and offline replay are recorded in `verification.md`; independent
architecture consultation agrees. Source limits, exact identity matching and
model constraints were not relaxed. A corrected broad live query must wait for
actual independent approval of the one-query verification amendment. Original
failure evidence remains visible regardless of the follow-up result.

Only two Brave queries and eight OpenAI curation requests were made in these
initial implemented-pipeline smoke tests. No paid retries or hidden fallback.


## Independently approved corrective follow-up

Amendment approval185d72b / ledger985cea9 authorized exactly one additional live
query after the heading regression and build checks. This third/last query used
the actual parallel-provider factory and actual handler, default shared queues,
unchanged budgets and real safe source loader, with timing wrappers only. It
excluded the selector and family HTTP/browser. No subsequent paid calls occurred.

The same broad query returned HTTP200 in **8163ms**, with1 Brave request,24 source
attempts,4 parallel model requests and **1 accepted recipe**. Brave headers took
320ms. Full source phase was3539ms (first source start through last source end).
Model phase including body validation was4211ms (first model start through handler
completion); all4 model requests started within1ms, and headers took2599–4200ms.
This measures actual parallel curation, not four serial requests.

The accepted card was Butternut Squash Mac and Cheese from My Kids Lick The Bowl,
with a cooking summary,25-minute source-derived total time and source image;
no displayed fields were omitted. The other3 source candidates were rejected
rather than surfaced without satisfying the complete query. Source outcomes:
4 recipes,9 collections,8 unsupported,3 unfetched. Expansion counts remained
within2 collections and24 fetch attempts. Several Food Network collection links
and unsupported pages consumed attempts, leaving limited candidate variety.

The parser failure is corrected and broad requests can return a valid recipe.
**Broad-query recall remains weak in this one observation**: one accepted card
from one publisher does not demonstrate10/20 useful results or reliable broad
coverage. This limitation should remain visible in the merge/release decision;
more queries would need separately authorized paid verification. Named-query
results still demonstrate8 cards, and12-card capacity is proven by browser
fixtures rather than a live12-result claim. The changing Brave discovery set also
prevents treating before/after elapsed time as a controlled performance result.

Implementation live verification totals:3 Brave queries,12 OpenAI requests,
zero retries/fallbacks. Exact per-source outcomes, card fields and timings are
preserved under `correctiveFollowUp` in `live-results.json`.
