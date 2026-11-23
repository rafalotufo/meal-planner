# Single-call recipe search — prior live evidence

- Date: 2026-11-23
- Source: live experiment reported in this chat; local evidence at
  `build/search-latency/followup/report.md` and sibling `results.jsonl`
- Purpose: preserve the decision context without committing raw source bodies,
  credentials, or ignored benchmark output

Three synthetic recipe descriptions (quick chickpea/spinach dinner, mushroom
pasta without cream, and one-pan lemon chicken/rice) were each tested twice.
Current and mini curators received identical research per trial. A separate
GPT-6.2 Sol request performed research and curation together. Each variant used
the existing photo enricher. Two trials at most ran concurrently.

| Variant | Structural validation | Median including photos | Observed range |
|---|---:|---:|---:|
| Current research and current curator | 6/6 | 31.5 s | 22.9–52.4 s |
| Current research and mini curator | 6/6 | 25.5 s | 19.1–43.9 s |
| Single-call research and curation | 6/6 | 28.0 s | 19.3–38.7 s |

The single-call prototype used the current GPT-6.2 Sol model with low reasoning,
required live web search, up to eight hosted tool actions and 5,000 output
tokens. It returned observed candidate evidence, a summary, and an exact
method-evidence excerpt together. Existing application checks were reused from
a local snapshot; the experiment did not modify production code or settings.

Single-call was faster than the current arrangement in four of six trials and
slower on both chickpea trials, where it returned more cards. It beat mini in
three of six trials. Thus these measurements do not establish a consistent
speed advantage, tail-latency guarantee, or equal-output comparison. Native
citations and excerpt checks do not independently establish factual accuracy
or every dietary constraint. No browser, authentication, or deployed-app
latency was measured.

Rafael nevertheless explicitly selected single-call implementation after seeing
these tradeoffs. Implementation verification must assess the implemented version
and report its actual latency and quality, rather than inherit prototype success.
