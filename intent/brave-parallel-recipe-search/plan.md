# Brave parallel recipe search — implementation plan

Author: architect, planning draft delegated by orchestrator.
Status: Draft for independent peer review; no application implementation yet.
Inputs: accepted `intent.md`, sibling `spec.md`, recorded live benchmark evidence.
Senior developer owns execution and verification after peer approval.

## Files that change

Application/config/documentation:
- `lib/recipes/brave.ts` — bounded single Brave Web Search request and results.
- `lib/recipes/concurrency.ts` — shared source/model abort-aware bounded pools.
- `lib/recipes/source.ts` — bounded source evidence and deterministic collection
  links/identity/metadata, reusing htmlparser2 and existing safe/photo helpers.
- `lib/recipes/curation.ts` — strict tool-free per-source Responses call and
  exact source/title evidence validation; no model-generated URL/time/image.
- `lib/recipes/parallel-search.ts` — budgets, source waves/expansion, twelve-way
  curation, deadline/error semantics, stable results and metadata projection.
- `lib/recipes/search.ts` — Brave config dispatch, optional deadline propagation.
- `lib/recipes/server.ts` — canonical Brave key and new provider wiring, removal
  of duplicate photo-fetch enrichment on new runtime path.
- `lib/recipes/types.ts` — optional provider deadline option if needed.
- `app/search-notebook.tsx` —≤12sources split into two≤6lookup chunks, safe races.
- `lib/recipes/notebook.ts` — small pure lookup-source/chunk helper if useful.
- `.env.example` — brave selector/canonical key placeholder.
- `README.md` — selected flow, configuration/migration, limits, data disclosure.
- `AGENTS.md` — targeted replacement of superseded single-call research bounds
  with reviewed Brave/source/curation contract; preserve all unrelated guidance.

Tests/helpers:
- `tests/recipe-brave.test.ts`
- `tests/recipe-concurrency.test.ts`
- `tests/recipe-source.test.ts`
- `tests/recipe-curation.test.ts`
- `tests/recipe-parallel-search.test.ts`
- `tests/recipe-search.test.ts`
- `tests/recipe-notebook.test.ts`
- `tests/recipe-fixtures.ts` or a new strict `tests/recipe-brave-fixtures.ts`.
- `tests/auth/server.ts` — force both Brave aliases/OpenAI keys empty in every
  owned server; select `brave`, preserve Google fixture/DB/session behavior.
- `tests/menu/brave-search-browser.ts` — real Chrome twelve-card notebook/menu QA.
- `tests/auth/chrome.ts` — only minimal reusable fixture/browser support if
  existing `recipes(origin,results)` is insufficient; no production imports.
- `tests/deployment/*.test.ts` only where explicit config contract expectations
  require new missing-key/selector assertions (no schema or auth weakening).

Feature evidence: `verification.md`, `live-verification.md` and screenshot PNGs
under `org/reviews/`, plus independent design/code/security reports and normal
org messages/state. No dependency/lockfile, database or deployment file changes.
If another application/test path is necessary, amend manifest and review before
editing it. `.env.local` is ignored local activation only; never stage its values.

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

After fixture checks, at most two live smoke queries (one named dish, one broad
family/picky-eater request) through actual implemented provider/handler, existing
keys and current bounds. Record count, source relevance, source/curation/total
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
