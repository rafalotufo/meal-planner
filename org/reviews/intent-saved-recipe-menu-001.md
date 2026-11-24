# Saved recipe menu — PM intent review

- Reviewer: product-manager
- Date: 2026-11-24
- Artifact: `intent/saved-recipe-menu/intent.md`
- Verdict: Accepted for Design
- Owner clarification, reported by orchestrator: “One shared menu per family.”

## Evidence and assessment

The requested add/list/remove collection addresses a concrete gap:
`app/search-notebook.tsx` explicitly says searches are kept only until refresh,
and `lib/recipes/notebook.ts` stores them in client memory. Existing
`app/recipe-card.tsx` offers source navigation but no save action.

The clarified family-shared ownership matches
`intent/family-membership/intent.md`'s required family ownership for future shared
recipes. `lib/session.ts` supplies current server-side membership checks rather
than trusting a request family ID. All current family members share add/remove
rights; no role or private-menu model is added.

The intent is narrow: durable saved result snapshots, one discoverable menu
page, and removal. It explicitly scopes the proposed exception to the earlier
no-recipe-CRUD rule and preserves separate specification/plan approval before
implementation. Scheduling, editing, importing recipes, and new provider calls
are excluded. Technical choices about identity, deduplication, snapshot updates,
photo lifetime/safety, limits, and transaction boundaries are appropriately
assigned to Design rather than silently asserted as existing behavior.

No remaining critical product ambiguity requires CEO escalation. This PM
acceptance is permission to enter Design under `org/protocol.md`; it does not
claim human specification/plan approval or authorize hosted migration, merge,
deployment, paid usage, or release.
