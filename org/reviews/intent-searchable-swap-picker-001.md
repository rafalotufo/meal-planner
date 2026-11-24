# PM intent review — searchable recipe swap picker

- Reviewer: product-manager
- Date: 2026-11-24
- Artifact: `intent/searchable-swap-picker/intent.md`
- Source: owner active-chat request, recorded by the orchestrator in
  `org/messages/ceo-0055.md`
- Verdict: Accepted for Design under `org/protocol.md`

## Evidence and assessment

The owner requested a visual modal for recipe swaps, added title search, approved
`intent/weekly-meal-planning/preview/swap-picker-preview.html`, and requested
implementation through the SDLC org workflow. The preview shows a labelled search,
recipe cards, visible selection and a separate Suggest swap action. The intent
captures that interaction while treating the prototype's sample images as
non-production reference content.

`lib/menu/store.ts` already lists family-scoped saved snapshots with bounded
pagination. `lib/menu/http.ts` applies the protected exact menu-handler guard.
Extending this read interface for title search is a bounded reuse; it does not
require a new public route, migration, provider call or authentication policy.
Searching the full menu rather than only the first 50 entries is essential to
the owner's stated findability goal.

## Scope and decision

The intent separates visual selection from submission, excludes already-planned
recipes and preserves server-authoritative weekly uniqueness, stale revisions,
approval reset, unrelated suggestions and read-only history. It requires native
accessible dialog behavior, responsive QA and existing validated images with
browser-only unoptimized/no-referrer loading and fallback. These are bounded
implementation criteria for the approved interaction, not new planning features.

No product ambiguity blocks Design. Exact query validation, pagination and
async selection/focus mechanics are delegated to architect and independent
review. Acceptance opens Design only; it does not authorize hosted actions,
deployment, scheduler activation, merge or release. Preserve the user's existing
generated-type diff and running development server throughout local work.
