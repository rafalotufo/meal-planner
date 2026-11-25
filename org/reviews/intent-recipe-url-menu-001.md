# Recipe URL menu — PM intent review

- Reviewer: product-manager
- Date: 2026-11-24
- Artifact: `intent/recipe-url-menu/intent.md`
- Verdict: PM scope accepted; recommend owner intent acceptance before Design

## Assessment

The request addresses a concrete gap. `app/menu/page.tsx` offers the current
family's stored menu without a URL-entry control. The save button in
`app/menu/save-recipe-button.tsx` requires a full recipe snapshot selected from
search. `lib/menu/validation.ts` requires nonempty title and summary as well as
the source URL, while `lib/menu/store.ts` persists that snapshot with family
isolation and source-URL duplicate handling.

Adding an already-known recipe without discovery fits the existing shared menu
and does not require a new ownership model, collection or schedule. The intent
preserves the established no-maximum collection policy, photos when available,
first-save duplicate behavior and confirmation before removal.

## Confirmed scope and gate

The owner answered the acquisition-versus-link question: “Read the linked page
and save its title, photo, summary and time when available.” This resolves the
material product ambiguity. The updated intent requires available metadata,
honest missing-details handling and clear failure without bogus entries for
inaccessible or non-recipe pages. It introduces a narrowly scoped acquisition
boundary requiring a reviewed SSRF-safe bounded design, without assuming paid
AI, recipe discovery, ingredient/instruction archiving or publisher HTML rendering.

The product manager accepts this product scope and recommends proceeding after
the owner accepts the written intent. Extraction strategy, minimum recipe
evidence, multiple-recipe selection, missing metadata, URL/redirect semantics
and safe transport belong in Design. They must preserve current family and
menu behavior; a technical implementation cannot silently expand the scope.

The invoked `ai-native-sdlc` skill's hard rule 1 says: “Do not advance without
approval: intent accepted → Design”. The orchestrator has determined that owner
acceptance of the written intent remains pending. This PM recommendation is
recorded separately from that owner gate; no owner acceptance is invented and
no specification or code is produced in this turn.

This review is grounded scope assessment, not specification/plan approval,
implementation permission or evidence of runtime validation. No hosted action,
paid usage, merge, deployment or release is authorized.
