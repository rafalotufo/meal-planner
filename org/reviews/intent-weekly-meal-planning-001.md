# PM intent review — weekly family meal planning

- Reviewer: product-manager
- Date: 2026-11-24
- Artifact: `intent/weekly-meal-planning/intent.md`
- Verdict: Accepted for Design under `org/protocol.md`

## Evidence and scope

The owner's chat selects React to a draft, requests automatic Thursday drafts
with an environment-configurable day, specifies upcoming Sunday–Saturday,
rejects attendance input, and requests history-backed variety while allowing
repetition. The saved brainstorm preserves these refinements separately from
the initial concept ranking.

`lib/menu/store.ts` already lists and mutates family-scoped saved recipe
snapshots using verified member identity. `lib/menu/types.ts` exposes the saved
entry and recipe types. `app/menu/page.tsx` requires family context and renders
the shared menu. There is no existing weekly scheduling/history operation in
these reviewed interfaces. The proposed feature therefore solves a distinct
gap while reusing the existing recipe pool and family model.

## Decisions and limitations

The intent faithfully captures the selected interaction and removes “I'll be
away.” It treats history as finalized plans and recency as a preference rather
than a repeat ban. Dinner-only scope, the known Toronto timezone, shared member
confirmation and deterministic drafting are explicitly proposed PM defaults;
the owner did not expressly settle them. They permit a coherent bounded Design
without claiming further owner approval.

Automatic generation needs a trusted scheduler; read-triggered provisioning is
not an acceptable substitute. Design must preserve `vercel.json` and hosted
authority boundaries or escalate a concrete conflict. This review does not
authorize deployment, scheduler activation, hosted credentials/migrations,
paid services, merge or release.

No ambiguity blocks **Design**. Before code, the architect must resolve the
precise time/calendar rule, empty-menu behavior, snapshot/history lifecycle,
approval invalidation, swap/confirmation permissions and concurrency in an
independently reviewed spec/plan. A materially different outcome or deployment
contract exception requires owner escalation. PM acceptance opens Design only.
