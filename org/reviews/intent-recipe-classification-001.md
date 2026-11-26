# PM intent review — saved recipe classification

- Reviewer: product-manager
- Date: 2026-11-26
- Artifact: `intent/recipe-classification/intent.md`
- Source: Rafael's active request in this chat
- Verdict: **Accepted for Design** under the org PM intent gate

The request adds a useful meal-role distinction to saved recipes. The accepted
intent captures one category per recipe, uses vegetable-accompaniment semantics
for Veggie, and preserves vegetarian entrées as Main dish. These semantics and
the recommended manual-correction option were surfaced in the orchestrator's
optional question. After the reply window, the orchestrator directed proceeding
with the stated default. This is a disclosed assumption; no owner answer is
fabricated.

Include a category-only control on saved recipes. This makes ambiguous and
legacy recipes useful without recurring provider work. Design must protect the
choice against in-flight automatic curation and keep the write family-scoped.
The owner may steer the stated interpretation before implementation.

## Evidence and design obligations

- `lib/recipes/types.ts:3–9` and `lib/menu/validation.ts:22–37`: recipe shapes
  currently have no category and require explicit validation/compatibility work.
- `lib/recipes/curation.ts:7–15,41–50`: search already has a strict, bounded
  model response that can include classification without an extra model call.
- `lib/menu/curation.ts:9–29` and
  `lib/menu/recipe-metadata.ts:126–135`: saved URLs have a separate deterministic
  three-second metadata path, so “on curation” must cover both paths explicitly.
- `lib/menu/store.ts:129–136`: curation writes already check delegation,
  current admission and lease; preserve these checks and ownership boundaries.
- `lib/plans/types.ts:3–4`: plan snapshots reuse recipe types. Old plans must
  remain readable and immutable; category alone must not change generation,
  counts, approval or swap eligibility.
- `app/menu/menu-controls.tsx:129–136`: ready and unprepared links have distinct
  UI states that need honest category/unclassified treatment.

Classification should not turn into a broader recipe editor, bulk legacy
backfill or scheduler redesign. If persistence requires migration artifacts,
design may propose them locally; no hosted migration or release is authorized.

The bounded intent has no unresolved product blocker. Proceed to architect
design and independent plan/spec review under the requested org workflow. This
record is not spec/plan approval, code review, human merge approval or release
authority.
