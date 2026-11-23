# Single-call recipe search — specification

- Author: architect
- Status: Approved
- Approval: org/reviews/spec-single-call-recipe-search-001.md (independent peer review)
- Derived from: sibling `intent.md`; PM decision in
  `org/reviews/intent-single-call-recipe-search-001.md`
- Date: 2026-11-23
- Delta from: `intent/recipe-search/spec.md` and the current provider adapter;
  all photo, authentication, notebook, and public interface contracts remain.

## Behavior and request contract

The existing configured OpenAI model researches existing web recipes and writes
the final short card summaries in one Responses API request. There is no second
curator request, automatic retry, repair call, or fallback model path on any
outcome. Hosted search/open/find actions inside that request remain permitted.
Invalid intake and unavailable configuration retain their zero-provider-call
behavior. Public results remain `{ recipes: Recipe[] }` with no internal
evidence fields, and existing sanitized error codes remain unchanged.

Keep the fixed Responses endpoint, server-only key, current default and
`OPENAI_RECIPE_MODEL` override. Preserve `store: false`, low reasoning,
`web_search` with `external_web_access: true`, required tool use, at most eight
hosted tool calls, and the existing 5,000 output-token ceiling. The old separate
3,000-token curator allowance disappears rather than being added to that
ceiling. Preserve the 1 MiB provider response-body limit, cumulative 20,000
character raw/cleaned output-text bound, 60-second shared search deadline,
parent abort propagation, and handler concurrency/rate/request limits.

## Combined response envelope

Request plain JSON from the search-capable model, as the research stage already
does. Do not introduce a new hosted-search/strict-schema compatibility
assumption. The old tool-free curator request and its `text.format` schema
generation mode are removed; explicit runtime validation remains authoritative.
The envelope is:

```typescript
{
  outcome: "recipes" | "no_results";
  candidates: Array<{
    sourceUrl: string;
    title: string;
    methodText: string;
    summary: string;
    methodEvidence: string;
    imageUrl: string | null;
    imageEvidence: string | null;
    imageEvidenceExcerpt: string | null;
    time: { kind: "cook" | "total"; text: string } | null;
    timeEvidence: string | null;
    timeEvidenceExcerpt: string | null;
  }>;
}
```

Each record represents one observed source and its finished card. `methodText`
contains enough source-observed cooking steps for the summary. `summary` is a
faithful 1–3 sentence preview using only those steps, and `methodEvidence` is
a nonempty exact excerpt from that same record's `methodText`. Keep summaries
below 600 characters, observed method/evidence below 4,000 characters, titles
below 160 characters, each optional evidence string below 1,000 characters,
and time text below 80 characters, using the existing inclusive bounds.

`imageEvidence` and `timeEvidence` are the respective source-observed evidence;
their `...Excerpt` fields are exact nonempty excerpts supporting the selected
optional values. Missing/unobserved values and their evidence should be null.
The server copies the title, normalized source URL, time, and image from this
validated record; there is no independent card identity or metadata to join.
Request at most six relevant records and omit recipes that fail explicit user
constraints. Do not infer total time from cook time or step arithmetic, photos,
ingredients, dietary claims, or missing cooking instructions.

User text and retrieved pages remain untrusted data, never instructions. Native
URL citations are required for each included source. Keep source/title/image
and time scalars plain. Put citation display only within observed `methodText`,
`imageEvidence`, or `timeEvidence` strings, not summaries or excerpt fields.
Require `sourceUrl` to match the native citation URL exactly, including query
parameters; do not strip tracking parameters or broaden URL identity.

## Validation and failure semantics

Parse the single completed response directly, once, into its envelope. Reuse
the current native annotation collection and narrowly scoped citation-display
cleanup, including its Unicode/index/overlap safeguards. Do not manufacture
Responses objects, replay an experiment snapshot, or run the old two-call
pipeline internally.

1. Non-completed/refused responses, absent completed `web_search_call`, provider
   HTTP/transport/body errors, oversized text, malformed JSON/root, missing
   candidates array, unknown outcome, and contradictory envelopes fail with
   `SEARCH_FAILED` (or the existing parent timeout/abort behavior). None invokes
   a repair or second model call.
2. Only explicit `outcome: "no_results"` with `candidates: []` is a grounded
   no-results envelope. It still requires completed web search, but no source
   citation is necessary for an empty result. `outcome: "recipes"` with an empty
   array and `no_results` with a nonempty array fail.
3. For each candidate, first validate the research core: safe exact native-cited
   source URL, bounded nonempty original title, and bounded nonempty observed
   method text. No URL authority comes from model prose or citation-looking
   unannotated text. Keep no global method/metadata evidence pool. All nonempty
   research records being unusable/uncited is `SEARCH_FAILED`, not no-results.
4. For a usable research record, require bounded nonempty summary and method
   excerpt, with `methodText.includes(methodEvidence)` on that same record.
   Omit cards failing this check without borrowing another candidate's method.
   As in the prior curator validation, usable source records whose cards all
   fail curation may yield an empty public array; this does not excuse a
   malformed root or entirely unusable research response.
5. A safe image URL is exposed only with bounded nonempty image evidence and
   excerpt, where the same record's evidence includes its excerpt. A valid
   cook/total time is exposed only with bounded nonempty time evidence and
   excerpt satisfying that same containment check. Missing, unsafe, malformed,
   unsupported, or mismatched optional metadata becomes null; retain a card
   with valid source and method evidence. Do not fetch arbitrary metadata URLs.
6. Deduplicate by normalized source identity, preserving model order, and return
   at most six validated cards. Mark a source as emitted only after its card
   passes required validation, so an invalid card cannot suppress a later valid
   duplicate. Project only the existing public Recipe fields.

No second-call `candidateId` mapping is needed: the source and card are one
record and the server performs the projection. This removes the boundary at
which a curator could independently substitute a different source/title/time.
It does not authorize weakening exact citation membership or local evidence
containment.

## Architecture choices and evidence limits

Use a small direct combined parser in `lib/recipes/openai.ts`, retaining the
existing transport and citation-cleanup helpers. Remove dead two-agent prompt,
schema, ID/join, and second-call code. Keep the provider interface, factory,
handler, photo enrichment, client code, dependencies, and configuration stable.
Update README's two-call and 5,000/3,000-token descriptions to the new contract.

Rejected: separate candidates and recipes arrays in the same response. Repeating
IDs, titles, URLs, image/time values, and then joining them recreates a boundary
that no longer exists and increases output and parser complexity. The flattened
record keeps one source identity and independently checks method excerpts. Two
small optional evidence-excerpt fields preserve the same-record optional
containment checks without duplicating source identity or values.

The prototype in `research.md` used flattened records without those two explicit
optional excerpt fields. Its 28.0-second median is design context, not proof of
this wire shape or implementation. Measure the implemented prompt/parser in
bounded live verification. Source evidence and summaries now come from the
same model response: native citation membership and exact excerpts bind records
structurally, but cannot independently prove the model faithfully observed a
page, verify every dietary constraint, or prove a summary contains no invented
detail. A second tool-free curator did not independently retrieve those pages
either. Preserve source links and honest null metadata; do not promise a search
duration or a universal speedup. Changed web work and card counts may dominate.

## Verification and handoff

Write meaningful TypeScript red tests before implementation, adapting existing
fixtures to the combined envelope rather than weakening checks. Prove one
request and the unchanged payload/bounds/signal on success and explicit empty
results; no second request on malformed, incomplete, refused, HTTP/transport,
oversize, ungrounded, or aborted outcomes; exact native URL membership and all
existing citation-cleanup edge cases; local method/metadata evidence isolation;
metadata null fallbacks; mixed valid/invalid records; source deduplication and
six-card limit; safe public projection and configured model override. Preserve
the existing handler, photo, auth, notebook, and workflow suites.

Run frozen installation, application tests, lint, strict typecheck, production
build, authentication regressions after build, deployment smoke tests, Python
workflow tests, plan-sync and staged zero-secret checks. Run the existing real
isolated Chrome QA at mobile and desktop widths, with browser fixture results
clearly separated from live provider grounding. Preserve historical screenshots
and review evidence: the existing browser helper writes notebook/integration
filenames, so planning must isolate new output or back up/restore old files and
save this feature's screenshots under distinct single-call names. A bounded live check of the
implemented provider on the three prior synthetic queries must record model,
request count, elapsed time, validated cards, and obvious relevance/evidence
limitations without secrets, prompts containing private data, or raw source
bodies in committed evidence. Existing authorization covers these bounded
tests; no account, budget, model-limit, or production changes are included.

Independent spec/plan, code, and security reviews remain required. Human merge
and release gates remain separate; no production deployment is in scope.

## Primary API references

Checked 2026-11-23 against official OpenAI documentation:

- [Web search](https://developers.openai.com/api/docs/guides/tools-web-search):
  Responses hosted search returns search-call output and native `url_citation`
  annotations containing source URL and citation locations. Existing visible
  source links retain the product's source-attribution behavior.
- [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs):
  schema generation does not remove the need to handle refusal and incomplete
  responses. This design retains explicit completion/refusal checks and does
  not depend on a new structured-output/search compatibility claim.
