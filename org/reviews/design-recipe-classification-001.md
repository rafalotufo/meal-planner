# Recipe classification — independent design and plan review

- Reviewer: reviewer (independent of architect)
- Date: 2026-11-26
- Reviewed source: `05613de`
- Artifacts: `intent/recipe-classification/spec.md`, `intent/recipe-classification/plan.md`
- Verdict: **Changes requested** before application implementation
- Lenses: Bugs, Security, Compliance under `REVIEW.md`; code-review-and-quality skill

## Required corrections

1. **High — Security/Correctness: new category columns need narrow runtime UPDATE grants.**
   `spec.md:50–52` says existing table-level UPDATE covers new columns and no
   grant is needed. The current final `compatibility.json` profile actually has
   only SELECT/INSERT/DELETE on `menu_recipes`, with UPDATE on its five existing
   metadata columns. `tests/menu/migration.test.ts:110–111` explicitly proves
   metadata updates succeed while ownership updates are denied. Following this
   design makes correction and automatic completion fail under `mp_runtime`.
   Append exactly `menu_recipes.category: [UPDATE]` and
   `menu_recipes.category_overridden: [UPDATE]` to the new profile; use the existing
   `applyRuntimeGrants` path (`lib/db/security.ts:72–81`) during explicit migration.
   Keep old profiles unchanged and table-level UPDATE/ownership-field mutation
   denied. Require restricted-runtime category-write and negative ownership-grant
   tests. This is local migration-design scope, not hosted grant authorization.

2. **Medium — Bugs/Compliance: include every stored-row category consumer.**
   The changed-file manifest omits `lib/plans/generate.ts` and
   `lib/plans/store.ts`, but their SELECT lists at `generate.ts:45`,
   `store.ts:48,68` feed `menuEntryFromRow` without category. The proposed row
   validator must distinguish current stored rows from legacy five-key JSON
   snapshots. Requiring category in rows without updating these SELECTs would
   break weekly generation/suggestion/acceptance; treating absence as null would
   silently discard a current saved category from new snapshots. Add both files
   to the manifest and select the persisted category without changing eligibility,
   counts or selection. Cover generation and suggestion/acceptance with classified
   rows, retaining historical snapshot bytes unchanged.

## Reviewed design that can stand

The exclusive meal-role enum and null uncertainty match the accepted intent.
Search adds a field to its existing bounded model response; URL import uses only
selected source-associated metadata and adds no network or provider pass. The
manual override marker and completion CASE serialize under the common advisory
lock; duplicate/retry behavior preserves corrections. The exact existing menu
POST route avoids a new Proxy exemption while retaining bounded streaming body,
canonical Host/Origin, JWE identity and family checks. Explicit Google-only edits
preserve existing synthetic snapshot authority. UI labels/control, legacy shape
normalization and local-only migration/release boundaries are appropriately
bounded. The planned tests target observable behavior and security boundaries.

No application implementation or runtime test result is claimed by this design
review. No style nits. Re-review the two corrections before code proceeds.
