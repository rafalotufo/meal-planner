# Recipe classification — independent design re-review

- Reviewer: reviewer (independent of architect)
- Date: 2026-11-26
- Reviewed source: `6c0933e` (correction to `05613de`)
- Artifacts: `intent/recipe-classification/spec.md`, `intent/recipe-classification/plan.md`
- Verdict: **Approved** for local implementation under the delegated org spec/plan gate
- Prior review: `org/reviews/design-recipe-classification-001.md` (`1881f95`)

Both required findings are resolved. The specification now adds exactly the
category and category_overridden column UPDATE privileges in the new profile
through the existing explicit migrator; old profiles, table-level UPDATE denial,
owner/source/saved-at protection and hosted grant boundary remain intact. The
plan requires restricted-runtime positive/negative permission tests.

The manifest now includes `lib/plans/generate.ts` and `lib/plans/store.ts`.
Their current stored-menu projections must carry category, while only historical
JSON parsing may accept its absence. Classified generation, suggestion and
acceptance tests must prove new snapshots retain category and existing snapshot
bytes remain unchanged. This directly addresses the three concrete callers in
the original review.

The remaining design stands as reviewed: exclusive enum/null uncertainty,
existing bounded per-source model response, conservative associated-node URL
metadata classification, durable serialized manual override, exact existing
menu route/body guard and Google-only category edits. No additional provider
pass, Proxy exception, synthetic permission, scheduler composition change or
legacy backfill is introduced. The plan covers behavior, trust boundaries,
races, legacy compatibility, migration reproducibility and real mobile/desktop
browser verification before independent implementation reviews.

Evidence: inspected `git diff 05613de 6c0933e` for both artifacts against the
current final compatibility grants, `lib/db/security.ts:72–81`,
`lib/plans/generate.ts:42–49`, `lib/plans/store.ts:48,68` and the existing
restricted-runtime migration tests. `git diff --check` passed. No unresolved
findings or nits. Application tests/build/browser results are future work and
are not claimed by this design approval.

This approval authorizes the planned local implementation only. Human merge,
staging acceptance, hosted migration/grants and release remain separate gates.
