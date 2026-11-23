# Meal Planner — recipe search build plan

- Derived from: accepted `intent/recipe-search/intent.md` and approved `spec.md`
- Spec review: `org/reviews/spec-recipe-search-002.md`
- Author: senior-developer
- Status: Approved by independent reviewer (`org/reviews/plan-recipe-search-001.md`)
- Date: 2026-11-23

## Approach

Implement the approved two-call research/curation pipeline behind one small
provider interface. The existing server page composes a client search form;
the Node route owns request validation, deadline, and per-process usage guards.
OpenAI uses fixed-endpoint server fetch, with no SDK or new runtime dependency.
Only `openai` is supported now; the provider selector rejects other values.
Neither fixtures nor a production mock mode are shipped.

Work sequentially in the slices below. Each behavioral slice starts with a
focused failing test, records the failure, implements the minimum change, and
runs its focused tests and relevant checks. The orchestrator owns commits,
status/ledger changes, reviewer dispatch, and browser coordination. No code is
written before independent plan approval. Feature tasks are tracked here,
under the repository's feature-folder convention.

## Files that change

- package.json
- tsconfig.recipes-test.json
- lib/recipes/types.ts
- lib/recipes/errors.ts
- lib/recipes/validation.ts
- lib/recipes/openai.ts
- lib/recipes/search.ts
- lib/recipes/server.ts
- app/api/recipes/search/route.ts
- app/recipe-search.tsx
- app/page.tsx
- tests/recipe-validation.test.ts
- tests/recipe-openai.test.ts
- tests/recipe-search.test.ts
- tests/recipe-fixtures.ts
- README.md
- AGENTS.md
- CLAUDE.md
- org/loop/config.yaml
- org/reviews/recipe-search-verification.md
- org/reviews/recipe-search-*.png

No dependency changes are planned; `package-lock.json` changes only if an
independently reviewed plan revision establishes a necessary exact dependency.
Existing org audit records and gates remain outside application implementation;
the orchestrator records them through the org tools.

## Ordered tasks and checkpoints

### 1. Establish the public contract and test command

**Dependencies:** approved plan. **Scope:** small contract/test foundation.

- [ ] Add public `Recipe`, time, and provider interface types; keep provider
  payloads, credentials, and evidence out of client-imported modules.
- [ ] Add `npm test`: compile isolated service TypeScript with the existing
  compiler, including TypeScript test/fixture sources, to ignored
  `build/recipe-tests/`, then use Node's built-in test runner on compiled
  `build/recipe-tests/tests/recipe-*.test.js`. Use strict checking, `noEmitOnError`, no
  Next/React compilation, and no new test-framework dependency. Test imports
  target these compiled modules; fixture data stays under `tests/`.
- [ ] Write failing URL/query validation tests, then add bounds and safe HTTPS
  normalization. Cover whitespace/1,000-character queries, credentials, control
  characters, IP literals/alternate IPv4 forms, ports, localhost/local suffixes,
  single-label hosts, fragment normalization, and retained query parameters.

**Files:** package.json, tsconfig.recipes-test.json, types.ts, validation.ts,
recipe-validation.test.ts. **Verify:** `npm test`, lint, typecheck. Capture red
then green evidence for the new validation behavior.

### 2. Implement source-grounded research

**Dependencies:** task 1. **Scope:** OpenAI research boundary.

- [ ] Write transport-fixture tests first for completed researched candidates,
  citation extraction, explicit `no_results`, absent tool use/citations,
  invalid envelopes, refusals, incomplete responses, and bounded response reads.
- [ ] Add the fixed Responses transport, private error codes, research prompt,
  response reader, runtime envelope validation, candidate URL deduplication,
  citation membership, bounded fields, and server-assigned candidate IDs.
  Require completed web search; valid explicit no-results skips curation.
- [ ] Preserve the approved model, `store: false`, tool/token caps, shared abort
  signal, and no retries. Reject provider failures without exposing raw bodies.

**Files:** openai.ts, errors.ts, recipe-openai.test.ts, recipe-fixtures.ts.
**Verify:** focused provider tests, then npm test, lint, typecheck. Fixture
transport tests assert externally significant tool/storage/resource settings.

### 3. Add source-specific curation

**Dependencies:** task 2. **Scope:** second agent and validated public output.

- [ ] Write failing tests for successful source-bound cards, empty curation,
  unknown IDs, source/title mismatch, unsafe/uncited links, duplicate and excess
  results, malformed schema/refusal, and stripped internal evidence fields.
- [ ] Add the tool-free strict-schema curator call. Bind every record to the
  server candidate map; validate method evidence against that candidate only.
  Validate optional time/image equality and evidence against the same candidate;
  unsupported optional metadata becomes null, invalid methods drop the card.
- [ ] Include two cited candidates with deliberately swapped method/time/photo
  evidence as regressions. Cap public output at six and bound research context.

**Files:** openai.ts, recipe-openai.test.ts, recipe-fixtures.ts.
**Checkpoint:** npm test, lint, typecheck, production build. Report source
accuracy as requiring live evaluation; fixture grounding is not live evidence.

### 4. Expose a bounded server endpoint

**Dependencies:** tasks 1–3. **Scope:** provider factory, handler, thin route.

- [ ] Write failing Request/Response tests with an injected provider/clock for
  invalid JSON/unknown fields/content type/body sizes, absent/unsupported
  configuration, Origin mismatch, empty/success output, safe errors, timeout,
  request abort, and concurrency/minute limits with slot cleanup on all exits.
- [ ] Implement a testable handler factory and per-process guard: streamed 8-KiB
  request limit, no-store responses, two active/twenty accepted per rolling
  minute, and one 60-second deadline covering both calls. Propagate abort to
  transport; release slots in `finally`. Provider selection/key validation runs
  before billable work. Do not log queries or provider bodies.
- [ ] Add a server-only composition root with the environment-reading provider
  factory and module-scoped guard. The Next route declares Node runtime and
  exports only POST via this root. Tests import pure service modules, not the
  server-only root; no test override or fixture endpoint enters production.

**Files:** search.ts, server.ts, route.ts, recipe-search.test.ts, errors.ts.
**Verify:** npm test, lint, typecheck, build; HTTP checks for invalid input,
missing configuration, method rejection, and no-store behavior.

### 5. Build the responsive recipe review flow

**Dependencies:** task 4. **Scope:** page plus one focused client component.

- [ ] Compose the form under the existing heading, using warm-neutral static
  Tailwind utilities, visible textarea label/example, useful idle/loading/error
  states, disabled duplicate submission, and polite live status text.
- [ ] Track request generation and abort on cleanup, preserving query/retry
  behavior. Render recipe strings as React text. Show one-to-three-column cards,
  fixed image areas, source hostname/link, method preview, and correctly labeled
  optional cook/total time. Use unoptimized Next Image with no-referrer/lazy load
  and missing/broken-image fallback, with no server-side image fetch.
- [ ] Verify keyboard/focus/error association and overflow/long content at 320,
  768, 1024, and 1440 pixels. Real-browser tests must exercise successful cards,
  no-results, failure/retry, loading, image fallback, and stale-response cleanup;
  browser-intercepted responses are explicitly simulated and test-only.

**Files:** app/page.tsx, app/recipe-search.tsx, verification report/screenshots.
**Checkpoint:** npm test, lint, typecheck, build; production browser console,
network, DOM/accessibility, and visual evidence reviewed by the orchestrator.
Chrome DevTools MCP is unavailable; use available CUA or temporary Playwright
with installed Chrome. Keep optional QA tooling outside runtime dependencies.

### 6. Document configuration and complete verification

**Dependencies:** tasks 1–5. **Scope:** docs/workflow acceptance and evidence.

- [ ] Document `.env.local` setup for `OPENAI_API_KEY`, optional
  `RECIPE_SEARCH_PROVIDER=openai` and `OPENAI_RECIPE_MODEL=gpt-6.2-sol`, supported
  provider behavior, test commands, no persistence, and live-verification limits.
  Update title-only/current-feature guidance to the approved recipe-search scope.
  Keep credentials ignored; no example secret or paid provisioning.
- [ ] Add `npm test` to org acceptance, preserve existing commands/budgets/gates,
  and use `review_artifact: recipe-search-implementation` so a historical generic
  implementation approval cannot satisfy this feature's independent code review.
- [ ] Run Python regressions, npm test, lint, typecheck, build, org consistency,
  diff, plan-sync and staged zero-finding secret checks. Record actual commands,
  red/green evidence, browser simulation, and a separately labeled live smoke.

**Files:** README.md, AGENTS.md, CLAUDE.md, org/loop/config.yaml, verification
report/screenshots. **Verify:** all required commands exit zero; independent
code/security review follows. The orchestrator commits the approved artifacts.

## Live evaluation, limits, and handoff

A configured key is not currently available. Once the CEO configures an
authorized key locally, run one representative recipe query through the actual
endpoint, record model/outcome/count/elapsed time, and compare returned titles,
methods, links, time and photos against the original pages. Never print keys or
full private queries. No successful live result may be claimed from fixtures.
If the key is unavailable or retrieval cannot yield grounded recipes, record
the acceptance gap explicitly and escalate; do not label the full feature done.

Provider tool output may lack image URLs or usable methods. Honest fallbacks or
omission preserve trust; live quality remains a required check. Per-process
guards bound this increment, with distributed traffic/spend decisions retained
for the human release gate. No database, additional provider, streaming,
deployment, or unrelated dependency/advisory fixes enter this plan.

Workflow graph tooling currently checks historical gate names across features;
historical approvals must never substitute for this feature's evidence. Preserve
the hash-chained ledger and prior loop archive; do not alter audit history or
weaken gates to silence warnings. Human merge and release approval remain.
