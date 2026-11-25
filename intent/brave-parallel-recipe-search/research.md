# Live experiment evidence informing this feature

Source: Rafael's 2026-11-25 chat and sanitized local experiment records copied
into `benchmark-evidence.json`. This is historical design evidence, not an
implemented-app or Production verification result. No new paid calls in intake.

- Existing full research + curation searches at target six: 30.2–45.7 s,
  median36.4 s. Target ten:43.2–56.0 s, returned10/8/5 recipes. Target twenty:
  two60-second timeouts and one54.8-second response returning8. Three queries,
  one trial/count, not a statistical reliability or latency guarantee.
- Brave Web Search (`/res/v1/web/search`) returned ordinary discovery results
  in approximately0.4–1.0 s. Broad family/picky-eater descriptions primarily
  returned collections, advice and discussions. Named dishes and recipe-path
  publisher filters improved standalone-page discovery. Path operators are
  experimental; neither path nor Recipe JSON-LD proves a standalone original
  recipe or dietary/intent fidelity. One collection embedded an example recipe.
- LLM Context (`/res/v1/llm/context`) returned richer excerpts in about one
  second, but broad collection discovery remained. It is not selected here.
- Brave Answers rejected the current key with OPTION_NOT_IN_PLAN. No plan or
  key permissions changed; this feature does not require Answers access.
- Per-result model prototype: GPT-6.2 Sol, low reasoning, no web tools,
  strict JSON output, at most1200 output tokens. Input was safe-fetched original
  page text plus selected Recipe JSON-LD, each bounded. Recipe URLs assigned
  server-side. Required exact source cooking/ingredient excerpts reject on
  mismatch; optional time mismatch must omit that metadata.
- Twelve source-fetchable frozen pages (four chicken tender, four beef burger,
  four macaroni/cheese) took40.0/21.9/10.5 s model-only at concurrency1/2/4.
  Order2/1/4 with rotated items. 18publisher attempts yielded15fetches; source
  phase4.0 s, three Brave requests1.6 s in total. Selected query/source sample
  does not establish broad-request quality or dietary/meal suitability.
- The same twelve URLs refetched for the all-concurrent trial yielded matching
  evidence character counts. Baseline bytes were not retained, so exact equality
  is unproved. Twelve model calls started within25ms, total4.23 s, first six
  required-evidence successes3.63 s.11/12required-evidence passes; threeoptional
  time mismatches. Source-fetch phase1.86 s; no new Brave call in that trial.
- Sequential, four-way and twelve-way trials had93.4%cached input. Two-way had
 16.1%. Unique instruction UUIDs did not disable source caching. No uncached,
  p95, cross-process or production-load guarantee is supported.

The prototype has no family admission, application routing, photo enrichment,
UI delivery, production queue fairness or globally bounded paid usage contract.
The implementation must design and verify those before any readiness claim.
