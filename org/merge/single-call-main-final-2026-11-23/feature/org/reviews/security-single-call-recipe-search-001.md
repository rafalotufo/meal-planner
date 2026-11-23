---
artifact: single-call-recipe-search-implementation
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: approved
round: 1
---

# Independent security review — single-call recipe search

## Verdict

Security clear for the inspected local implementation. No blocking or required
security finding remains after the final prompt clarification and verification
handoff. This independent assessment does not approve merge or release. No
application code was changed by this reviewer.

## Trust boundaries and checks

- User descriptions and retrieved content cross the OpenAI prompt boundary.
  The combined prompt still treats both as untrusted data and requests only
  existing recipes, source-observed methods, exact excerpts, and supported
  metadata (`lib/recipes/openai.ts:6`). Model output remains untrusted on return.
- Provider output crosses into public cards through completion/refusal checks,
  cumulative raw/cleaned text bounds, safe native URL annotation collection,
  exact source membership, and a direct per-record parser
  (`lib/recipes/openai.ts:83`, `lib/recipes/openai.ts:122`). Unannotated
  citation-looking strings do not create URL authority. Existing narrowly
  scoped citation cleanup and its Unicode/offset/overlap safeguards remain.
- Each emitted card requires a nonempty bounded summary and an exact method
  excerpt contained in that record's observed method. Optional image/time
  values require bounded local evidence and a contained local excerpt; unsafe,
  malformed, missing, or unsupported optional values become null
  (`lib/recipes/openai.ts:118`, `lib/recipes/openai.ts:134`). No global evidence
  pool or second-record join remains. Deduplication occurs after required card
  checks and only the public Recipe fields are projected.
- Malformed roots, missing completed web search, unusable/uncited research,
  contradictory outcomes, and provider failures remain sanitized failures.
  Explicit completed no-results is distinguished from those failures; usable
  source records whose cards fail the required summary/excerpt checks may yield
  an empty public array as specified (`lib/recipes/openai.ts:126`).
- The credential is sent only to the fixed HTTPS Responses endpoint; there is
  one call with the original configured model, low reasoning, store:false,
  required hosted search, eight-tool and 5,000-output-token bounds
  (`lib/recipes/openai.ts:168`). No retry/repair/second curator path exists.
  Pre-aborted calls issue no request, and mid-call abort preserves the parent
  reason. The unchanged reader caps the complete provider body at 1 MiB.
- Session/allowlist authorization before provider effects, request validation,
  the shared deadline and admission limits, source URL safety, optional photo
  enrichment and its all-address-checked pinned HTTPS transport, client text
  rendering, dependencies, and configuration have no implementation diff.
  Removing a model phase adds no new fetch target or client-exposed field.

## Evidence and limits

Read AGENTS.md, REVIEW.md, org/protocol.md, the committed role card, active
intent/spec/plan, current provider/validation/server/route code, fixtures and
test diff, README diff, and feature progress. Applied the security-and-hardening
skill's trust-boundary and input/output/data-flow review.

Independent command: `node --test build/recipe-tests/tests/recipe-openai.test.js`
passed 19 tests, 0 failed, 0 skipped. Cases cover the one-request path, malformed
and ungrounded output, native citation cleanup, exact URL identity including
query parameters, cross-record method excerpts, optional metadata fallbacks,
deduplication/six cards, and pre-/mid-call abort. `git diff --check` passed.
An explicit diff check found no changes in validation, handler, photo transport,
session/auth policy, app UI/routes, package.json, or pnpm-lock.yaml.

The model supplies observed text and summary in the same response. Exact native
citations and local excerpts establish structural binding, not independent
proof of every source observation, dietary constraint, or summary statement.
This limitation is explicit in the approved specification and README; the
removed tool-free curator did not independently retrieve source pages either.
No stronger factual or latency guarantee is inferred from passing fixtures.

## Final prompt and verification handoff

Re-read the final staged provider/test diff, final prompt, approved plan-review
addenda, feature progress, and
`org/reviews/single-call-recipe-search-verification.md` at the orchestrator's
formal handoff. The production-source delta since the preliminary inspection
is the additional metadata instruction at `lib/recipes/openai.ts:17`: evidence
must contain actual observed source text, with the same literal text copied to
the excerpt and citation display following only in evidence. It explicitly
forbids invented metadata. The runtime containment parser, native citation
handling, optional-null behavior, model, caps, transport and cancellation have
not been relaxed. This addresses observed prompt noncompliance rather than
turning missing support into an accepted value.

The final live evidence records three calls through the actual implemented
provider, with unmodified forwarding payloads and exactly one request each:
19.774s, 26.652s, and 17.739s. Ten reported time pairs and four reported image
pairs satisfied literal same-record containment and survived the unchanged
parser; other model image values were explicitly null. These are sanitized
small-sample provider observations, not independent factual proof or a latency
guarantee. The earlier all-null observation, one-query diagnostic, and bounded
seven-call verification total remain disclosed rather than hidden.

The developer's final verification record reports 66 application tests, 12 auth
tests after build, 7 workflow tests, 12 deployment smoke tests, lint, strict
typecheck, production build, and existing real Chrome QA at
320/390/768/1024/1440 widths passing. Browser fixtures and live provider proof
are separately labeled. All 19 historical screenshots were restored with
matching hashes, and new feature captures were inspected. The orchestrator's
handoff records a staged secret scan with zero findings, approved-plan sync
passing, and message/loop/memory checks with zero violations. This reviewer
confirmed `git diff --check` remains clean. No extra paid calls or unrelated
test reruns were needed for this final prompt-only reassessment.

Human merge and release authority remains separate from this security clear.
