---
artifact: recipe-photos-implementation
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: changes
round: 1
---

# Independent recipe-photo implementation review

## Findings (by severity)

1. **[MED — Bugs / source attribution] Resolve matching Recipe-node ambiguity before pooling photos.**
   `lib/recipes/photo-metadata.ts:113` accepts every Recipe node whose explicit
   identity normalizes to the source URL. Fragment removal makes differently
   named recipes with IDs such as `source#gnocchi` and `source#cake` both qualify.
   Their images are then pooled at line 132, and the smallest adequate image
   wins at line 140, even when it belongs to the other named recipe. This
   violates `intent/recipe-photos/intent.md:39` and the spec's ambiguity fallback
   requirement (`intent/recipe-photos/spec.md:55`).

   Independently reproduced against the actual compiled selector with source
   `https://recipes.example.com/menu`, card title `Potato Gnocchi`, and two
   JSON-LD root Recipes: `#gnocchi` / `Potato Gnocchi` / gnocchi.jpg 1200×800,
   and `#cake` / `Chocolate Cake` / cake.jpg 480×270. The result was cake.jpg,
   reason `recipe-sized`. Existing page/source checks do not rule this out:
   both explicit IDs pass the same normalization. Resolve eligible Recipe-node
   ambiguity before collecting/ranking their images; conservatively ignore
   conflicting Recipe photos and retain the approved page-bound OG/current
   fallback. Add a failing TypeScript regression for the two-fragment/two-name
   case. Preserve the valid single-Recipe intake cases and existing identity
   conflict checks.

## Review scope and evidence

- Read active loop, photo intent/spec/plan/research, the stable implementation
  at `5cb9410` relative to `1433402`, all new transport/metadata/enrichment tests,
  handler/server composition diff, dependency record, verification report, and
  early independent transport-security consultation. Reviewed bugs, security
  boundaries and approved-plan compliance separately.
- Independently ran the emitted native suite:
  `node --test build/recipe-tests/tests/recipe-*.test.js` exited 0, **55 tests,
  55 pass, zero failures/skips/cancellations**. The new adversarial selector
  reproduction above exposes an association gap not covered by that suite.
  Lint/typecheck/build and seven Python results are the developer/orchestrator's
  recorded evidence, not rerun by this review.
- The transport pins a public all-family-validated address while keeping native
  TLS/Host identity and bounded native resources. The enricher's module-wide
  admission, parent signal/original deadline, soft timeout, no-queue saturation,
  and image-only immutable output match the focused design on inspection.
  Server-only composition installs the shared decorator after provider search;
  client code, public API shape, method/time/citation checks and paid-call count
  are unchanged. Final specialist security review remains separately pending.
- Exact dependency versions and matching reviewed lock graph are recorded in
  the dependency/transport evidence; no unrelated dependency change is present.
  The current plan and stable HEAD already list `.jpg` screenshot evidence,
  matching the recorded browser artifacts; there is no manifest-format finding.
- The orchestrator's report separately labels three real source transports,
  real selected/loaded photos and CUA mobile/desktop checks, using simulated
  captured provider cards with zero LLM calls. Those observations establish
  the target cases, but do not rule out the malicious/multi-recipe ambiguity.
- `git diff --check` passed. This reviewer made no application edits, dependency
  installation, paid call, source/photo network request, secret read, org-state /
  ledger mutation, commit, merge or release.

## Verdict and limits

Changes required for the source-association finding. The final targeted review
must verify the regression/fix, any separately required security correction,
and that the three real-source selections remain intact. Independent security
clearance and human merge/release gates remain separate.
