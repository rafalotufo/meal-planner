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
