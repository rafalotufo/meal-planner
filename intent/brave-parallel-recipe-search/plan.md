# Brave parallel recipe search — implementation plan

Author: architect, planning draft delegated by orchestrator.
- Status: Approved
Inputs: accepted `intent.md`, sibling `spec.md`, recorded live benchmark evidence.
Senior developer owns execution and verification after peer approval.

## Files that change

- `lib/recipes/brave.ts`
- `lib/recipes/concurrency.ts`
- `lib/recipes/source.ts`
- `lib/recipes/curation.ts`
- `lib/recipes/parallel-search.ts`
- `lib/recipes/search.ts`
- `lib/recipes/server.ts`
- `lib/recipes/types.ts`
- `lib/recipes/notebook.ts`
- `app/search-notebook.tsx`
- `.env.example`
- `README.md`
- `AGENTS.md`
- `tests/recipe-brave.test.ts`
- `tests/recipe-concurrency.test.ts`
- `tests/recipe-source.test.ts`
- `tests/recipe-curation.test.ts`
- `tests/recipe-parallel-search.test.ts`
- `tests/recipe-search.test.ts`
- `tests/recipe-notebook.test.ts`
- `tests/recipe-fixtures.ts`
- `tests/recipe-brave-fixtures.ts`
- `tests/auth/server.ts`
- `tests/auth/chrome.ts`
- `tests/menu/brave-search-browser.ts`
- `tests/deployment/*.test.ts`

## File responsibilities and evidence

The five new recipe modules separate Brave discovery, shared bounded pools,
safe source/collection parsing, per-item curation, and pipeline orchestration.
Search/server/types wire the selected provider and optional deadline. Notebook
changes handle twelve sources through two existing six-URL lookup requests;
a small pure helper may live in the existing notebook module.

Configuration and documentation update the Brave selector/canonical key,
limits and data disclosure. AGENTS changes only the superseded search contract.
Test helpers clear every paid key and retain current isolated Google/DB/session
behavior. Existing Chrome support changes only if needed for twelve-card QA;
deployment tests change only for explicit provider/missing-key expectations.

Feature evidence includes `verification.md`, `live-verification.md`, screenshots
under `org/reviews/`, independent design/code/security reports and normal org
messages/state. These are workflow artifacts. No dependency/lockfile, database
or deployment file changes. If another application/test path is necessary,
amend manifest and review before editing it. `.env.local` is ignored local
activation only; never stage its values. Paths listed are permitted changes,
not a requirement to touch files whose existing support proves sufficient.

## Ordered implementation slices

1. **Queue and discovery red → green.** Prove source2/model12 global ceilings
   across provider instances, FIFO bounded queues, overflow, abort while queued,
   parent/local timeout and retained lease for abort-ignoring active transports.
   Prove Brave max1request/20hits, key validation before effects, body/timeout/
   redirect/errors, URL dedup and long-query full-constraint preservation.
2. **Safe evidence and broad recall red → green.** Build deterministic bounded
   parsing, singular source/heading/title association and optional metadata.
   Add malicious Recipe/ItemList, mixed identities, embedded example recipe,
   deep/oversize/invalid JSON-LD, navigation/unsafe/foreign links, Unicode and
   failed-fetch fixtures. Demonstrate two relevant collections expand to real
   recipe candidates before the remaining list exhausts24fetch attempts.
3. **Per-item curation and orchestration red → green.** Reuse prototype schema
   shape but omit model-generated optional metadata. Prove exact quote/title
   failures, refusals/incomplete/oversize responses, constraint rejection, no
   tools/retries/fallback and aggregate request-byte/output-call bounds.
   Exercise all12calls concurrently, reversed completion order, successful
   partials, all-reject vs all-technical-error, aborted pending bodies and source
   phase expiry. Preserve parent abort as timeout, never success/empty fallback.
4. **Runtime and twelve-card integration.** Switch only the provider boundary;
   leave family/proxy/route timing contracts intact. Remove duplicate network
   enrichment for new path; photos derive from already fetched source HTML.
   Chunk menu lookup safely, including a failed second chunk, selection switch,
   save-during-lookup race, retry, out-of-chunk response and twelve real cards.
   Change test-server paid-key clearing before any browser/HTTP fixture run.
5. **Configuration/docs and complete verification.** Document local activation
   (`RECIPE_SEARCH_PROVIDER=brave`), canonical key, no old-path fallback, bounded
   process concurrency and limits, third-party disclosure and deployment needs.
   Update only ignored local selector if authorized work needs local preview;
   do not touch credentials/provider billing/hosted selectors.
6. **Independent security and final review.** Fix blocking findings with tests,
   update spec/plan on departures, rerun affected checks, and hand reviewed exact
   source to the owner for merge decision. No push/merge/release is implicit.

## Verification commands and evidence

Record actual command exit/results and focused red→green evidence in
`verification.md`; commands must run on the final source where applicable:

- `pnpm test`
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run test:family`
- `pnpm run test:menu`
- `pnpm run test:auth`
- `node --import tsx --test tests/deployment/*.test.ts`
- `python3 -m unittest discover -s tests`
- `node --import tsx tests/menu/brave-search-browser.ts` at390/1440 with owned
  migrated random database/server/profile and empty paid keys.
- `git diff --check`; staged `python3 scripts/scan_secrets.py --staged`.
- Org message/loop/memory checks, workflow graph/ledger and plan-sync checks.

Use existing test DB role/native private cluster; never development/hosted data.
If inactive `.next/dev/types` conflicts, follow AGENTS's backup procedure only.
Do not suppress compiler/lint/test failures or change checks merely for green.
Use existing local Chrome/CDP helper when no Chrome MCP is configured; capture
screenshots and inspect actual visible layout, network behavior and errors.

Baseline verification allowed two live smoke queries (one named dish, one broad
family/picky-eater request) through the actual implemented provider/handler,
existing keys and current bounds. Both ran; retain the broad query's502 and
zero-model-call result as original evidence. Following the documented
principal-H1 parser correction and fixture/build checks, a peer-approved
corrective amendment permits ONE more live smoke of the same broad query:
three total live searches for this implementation verification. The third call
must wait for actual independent amendment approval, and does not raise any
per-search paid, source, byte, timeout or concurrency ceiling. Record count, source relevance, source/curation/total
timings and complete field omissions/errors. Direct handler smoke excludes
family HTTP/browser and must say so; fixtures cannot establish live quality.

## Risks and decision checkpoints

- Broad collection expansion can fetch irrelevant/navigation URLs: candidate
  filtering, source association, same request budget and adversarial fixtures
  gate release readiness, not a promise of twelve matches.
- Model output remains untrusted; exact excerpts/title choices and optional
  metadata isolation are mandatory even when they reduce yield.
-12model calls per admitted request amplify paid work compared with one agent
  call. Global12limit, queue bounds, input/output ceilings and no retries bound
  one process. Hosted multi-instance spend needs a later release decision.
- Third-party pages can fail safe identity-only fetch; do not relax SSRF,
  encoding, redirect or TLS checks to match a benchmark result.
- Selection/chunk races can mark saved recipes incorrectly: actual menu browser
  integration and save-version reconciliation must pass before final approval.


## Corrective amendment — principal heading and bounded live follow-up

Status: Proposed; requires independent approval before the additional paid call.
Architecture consultation found that suppressing header body text/ordinary links
also discarded principal H1 identity inside main/article headers. Capture only
that content heading as an identity channel, keeping siteheader/navigation/
footer/sidebar text and links excluded and every source identity/title/complexity
check intact. This is an in-scope source parser defect, not a broader discovery
or source-trust redesign. Existing manifest paths `lib/recipes/source.ts` and
`tests/recipe-source.test.ts` cover the correction.

First add the failing article/header/H1 regression and adversarial dummy site/
nav headers, conflicting/multiple content headings and embedded collection
recipe cases. Apply minimal correction, run source/pipeline/recipe tests and
lint/typecheck/build as affected, and replay saved broad-search public HTML
without Brave/OpenAI calls. Obtain independent amendment approval. Only then
run the one corrective broad-query smoke with the actual provider/handler and
unchanged budgets, recording source/model call counts, omissions, valid yield
and elapsed time. Preserve initial failure, offline replay and live follow-up
as separate evidence. Human merge/release and hosted configuration stay gated.
