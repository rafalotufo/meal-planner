# PM intent review — plan recipe thumbnails

- Reviewer: product-manager
- Date: 2026-11-26
- Artifact: `intent/plan-recipe-thumbnails/intent.md`
- Source: Rafael's active request in this chat
- Verdict: **Accepted for Design** under the org PM intent gate

## Assessment

The requested outcome is concrete: add recognizable photo thumbnails to planned
recipe cards. Existing recipe snapshots already carry nullable photo URLs, so
the feature can stay within local presentation and verification scope. Draft,
final and retained read-only weeks share the same card path and all need the
same presentation. No product interview or owner escalation is necessary.

The accepted intent requires stable missing/broken photo fallbacks and accepted
swap refresh, preserving title/source/control usability and accessibility.
Images reuse existing validated snapshots and established browser loading
privacy rather than introducing discovery, server fetching or storage changes.
The separate swap picker already has thumbnails and remains outside scope.

## Evidence and design obligations

- `app/plans/plan-controls.tsx:51–60`: primary plan cards render titles and
  controls but no photo; `:65` confirms final/past read-only handling.
- `lib/plans/types.ts:3`, `lib/menu/types.ts:3`,
  `lib/recipes/types.ts:6`: existing plan recipes already include nullable
  `imageUrl`; no schema or backfill is required.
- `app/plans/swap-recipe-dialog.tsx:41–49`: existing thumbnail treatment uses
  lazy unoptimized loading, no-referrer and URL-specific failure state.
- `tests/plans/browser.ts:29–47`: owned browser fixtures can exercise image
  outcomes and responsive rendering without hosted data or paid providers.

Design must specify a small stable thumbnail/fallback frame, image error-state
lifecycle when a meal changes, accessibility semantics and concrete browser
proof. Existing auth, family checks, plan mutations and scheduling stay intact.

No blocking findings. This PM scope acceptance is not spec/plan approval, code
review, human merge approval or release authorization.
