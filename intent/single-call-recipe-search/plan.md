# Single-call recipe search — implementation plan

- Author: senior-developer
- Status: Approved
- Approval: org/reviews/plan-single-call-recipe-search-001.md (independent peer review)
- Based on: sibling intent.md and approved spec.md; independent specification
  review org/reviews/spec-single-call-recipe-search-001.md.
- Scope authority: Rafael explicitly selected single-call research and curation
  and requested the SDLC org workflow. Human merge/release remain separate.

## Files that change

- lib/recipes/openai.ts
- tests/recipe-fixtures.ts
- tests/recipe-openai.test.ts
- README.md
- intent/single-call-recipe-search/intent.md
- intent/single-call-recipe-search/research.md
- intent/single-call-recipe-search/spec.md
- intent/single-call-recipe-search/plan.md
- intent/single-call-recipe-search/progress.md
- org/loop/config.yaml
- org/loop/state.yaml
- org/loop/history.jsonl
- org/loop/archive/recipe-search-notebook-2026-11-23/state.yaml
- org/loop/archive/recipe-search-notebook-2026-11-23/history.jsonl
- org/status.yaml
- org/messages/
- org/memory/context.md
- org/memory/events.jsonl
- org/reviews/intent-single-call-recipe-search-001.md
- org/reviews/spec-single-call-recipe-search-001.md
- org/reviews/plan-single-call-recipe-search-001.md
- org/reviews/code-single-call-recipe-search-*.md
- org/reviews/security-single-call-recipe-search-*.md
- org/reviews/single-call-recipe-search-verification.md
- org/reviews/single-call-recipe-search-*.png
- gates/ledger.jsonl
- workflow-graph.yaml

Only the provider adapter, its existing TypeScript fixtures/tests, and README
are application-facing changes. No client, handler, authentication, photo
transport, public types, dependencies, lockfile, model configuration, or
deployment changes are planned. Ignored build/search-latency experiments are
not production dependencies and are not committed.

## Ordered slices and proof

1. Record the approved plan, independent review, and matching org gate/graph
   records before code. Orchestrator owns serialized commits and loop/status/
   ledger updates in this shared worktree. Record Node/pnpm versions and run
   pnpm install --frozen-lockfile. Preserve the archived notebook loop and all
   historical messages, reviews, and gate records.
2. RED: adapt the existing fixture candidate to the flattened combined record:
   observed fields plus summary, methodEvidence, imageEvidenceExcerpt, and
   timeEvidenceExcerpt. Adapt existing two-call tests to one response while
   retaining their underlying safety assertions. Add meaningful tests that a
   grounded success makes exactly one request and projects only public fields;
   cross-record method/optional excerpts cannot be borrowed; malformed optional
   metadata becomes null; invalid cards do not suppress later valid duplicate
   sources; and pre-/mid-call abort preserves the parent reason without retry.
   Exercise configured model, signal, store:false, hosted search settings,
   eight-tool/5,000-token bounds and no second call on every outcome. Run
   pnpm test before production edits and record the expected behavioral failures.
3. GREEN: replace the research-plus-curator orchestration with one direct
   combined parser and one hosted-search request. Update the research prompt to
   request final summaries and exact same-record excerpts. Remove dead curator
   prompt/schema and Candidate ID/join code. Retain the existing response-body
   reader and native citation collection/cleanup code, including Unicode,
   per-part offsets, overlap and unannotated-marker protections. Parse once;
   distinguish explicit empty, malformed root, entirely unusable research, and
   individually rejected cards exactly as spec.md defines. Gate optional
   metadata on safe values and same-record evidence/excerpt containment, then
   project the unchanged Recipe shape. Mark a source emitted only after its
   required card evidence passes; cap validated cards at six. No fake Responses
   objects, snapshots, second call, retry, or repair fallback. Run pnpm test;
   keep all handler/photo/notebook suites passing.
4. Update README to describe a single request, the 5,000-token ceiling, runtime
   evidence checks and their same-response limitations. Remove obsolete claims
   about two calls, a strict-schema curator, and 5,000/3,000 token budgets.
   Record implementation and red/green command evidence in progress.md.
5. Verify the implemented adapter with bounded live calls on the three prior
   synthetic queries (chickpea spinach <=25 minutes, mushroom pasta without
   cream, one-pan lemon chicken and rice). Use a temporary TypeScript wrapper
   around the actual createOpenAIProvider, counting transport requests without
   changing payloads or validation. Record model, one-request count, elapsed
   provider time, validated card count, and obvious relevance/evidence limits.
   Optional photo timings are separate if measured. Persist only sanitized
   aggregate/card observations; do not commit credentials or raw source bodies.
   Existing authorization covers these three calls; do not change account or
   provider limits. Do not promise a latency improvement from the small sample.
6. Run application/workflow/deployment smoke tests, lint, strict typecheck,
   production build, then auth regression and real isolated Chrome QA. The
   existing tests/auth/browser.ts harness covers mobile/desktop plus tablet,
   history/filter/sort, loading/error/empty states, source links, images, and
   auth with test-process-only Google fixtures. Its search results are browser
   response fixtures, not live provider proof. Before invoking it, back up its
   historical recipe-search-notebook*.png and recipe-integration*.png outputs
   into ignored build storage; copy newly generated captures to the feature's
   single-call-recipe-search-*.png names, then restore the exact historical
   files. Do not overwrite old audit evidence or modify the browser harness.
   Inspect at least the new 320px and 1440px result captures. Record actual
   command outputs, staged zero-secret and plan-sync checks.
7. Hand the verified diff and evidence to independent security and code
   reviewers. Address required findings without suppressing checks; update this
   plan in the same change if any file/scope departs from the manifest. Respect
   the six-turn org budget and at most two review rounds; unresolved issues
   escalate rather than expanding the budget. Save reviewable local commits;
   no push, merge, production configuration, or release.

## Regression coverage and risk controls

Keep native citation cleanup cases intact while adapting their envelopes.
Retain body/text bounds, refusal/incomplete/malformed/contradictory outcomes,
unsafe source rejection, exact citation URL identity including query parameters,
source deduplication and six-card limit. Verify mixed valid/invalid records,
bounded summaries/method excerpts, optional null/fallback behavior, and no
internal evidence/IDs leaking into public results. Existing second-call identity
substitution tests become same-record source/evidence isolation cases because
there is no separate card identity to substitute.

The combined model supplies both evidence and summary. Exact excerpts and
native citations prove structural binding, not independent factual or dietary
verification. Prompt instructions preserve untrusted-data treatment and explicit
query constraints; live review labels uncertainty. Metadata is optional and
cannot discard an otherwise valid card. The fixed one-call budget may produce
fewer cards or hit output limits; fail safely without a repair request. Web
actions, result counts, and publisher latency remain variable.

## Verification commands

`pnpm install --frozen-lockfile`; `pnpm test`; `pnpm run lint`;
`pnpm run typecheck`; `pnpm run build`; `pnpm run test:auth` after build;
`node --import tsx --test tests/deployment/smoke.test.ts`;
`python3 -m unittest discover -s tests`;
`node --import tsx tests/auth/browser.ts` with screenshot preservation above;
`python3 scripts/scan_secrets.py --staged`;
`python3 scripts/check_plan_sync.py --hook --plan intent/single-call-recipe-search/plan.md`;
`python3 scripts/org_message.py check`; `python3 scripts/org_loop.py check`;
`python3 scripts/org_memory.py check`; `git diff --check`.

Red/green tests run at their respective slice boundaries. Full checks run after
implementation changes; do not repeat unchanged checks merely for reassurance.
The org loop's required acceptance invocations remain authoritative governance
evidence. Report real failures and fix their cause without exclusions or skips.
