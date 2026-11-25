# Recipe URL menu — PM save-first amendment review

- Reviewer: product-manager
- Date: 2026-11-24
- Artifact: `intent/recipe-url-menu/intent.md`
- Verdict: Owner-directed amended scope accepted; revised architecture review pending
- Owner source: “Lets save the recipe immediately, but start a process that will curate the recipe, find image, summary etc, then update the saved entry”

## Product decision and assessment

The owner explicitly replaces fetch-before-save with immediate durable URL save
followed by asynchronous curation and updating the same entry. This preserves
the original goal of avoiding search while removing publisher latency from the
save response. The earlier owner acceptance of the original intent remains
historical; it does not approve the exact amended specification or authorize code.

The owner further selected: “Keep it simple: save safely, start curation, and
offer Retry if interrupted.” Adopt this reliability scope without a redundant
intent-acceptance gate. The saved link persists; interrupted curation offers
explicit Retry. No independent queue/scheduler or unattended recovery guarantee
is requested.

The amended intent separates three truthful outcomes: a save has committed;
curation is pending; and metadata is completed or unavailable. Invalid input or
failed persistence cannot produce a success claim. Inaccessible/non-recipe pages
leave an honestly labelled saved link with failure and retry feedback, rather
than fabricated recipe details. Available fields should be retained without
guessing; no paid AI or discovery provider is assumed.

## Grounding and scope boundary

Current `lib/menu/validation.ts` requires a complete snapshot with nonempty
title and summary, and `lib/menu/store.ts` exposes only insert/list/remove,
retaining the first committed snapshot. Therefore a placeholder/status/update
contract is a genuine design change. The original draft specification's
“No database schema, dependency or infrastructure change is needed” and
“No replacement/update operation is introduced” cannot be carried forward as
established facts. The architect must assess actual storage/grant/execution
requirements without implying permission to apply hosted changes.

The update exception is narrow: controlled curation fills the pending record
created by this URL flow. Preserve existing search snapshots, family isolation,
normalized URL uniqueness, original entry identity/order, no collection maximum,
bounded list pages and confirmed removal. A pending duplicate returns the same
entry; it does not create redundant uncontrolled jobs. Retry targets that entry
with explicit bounded feedback. A removed entry stays removed, and stale work
cannot overwrite a replacement saved later under the same URL.

Current admission/family checks must govern external curation effects and final
updates, including eligibility changes during work. Background execution must
have an explicit supported post-response lifecycle, interruption/Retry handling
and bounded resource usage; a detached promise is not evidence of durable
execution. The owner's simple reliability choice permits request-lifetime limits
and manual Retry, provided the UI and documentation state those limits honestly. Client
cancellation does not retroactively erase a committed save. Require SSRF-safe
bounded source acquisition, untrusted metadata handling, no lock-held network
fetch and no source-triggered external secondary fetches unless separately
reviewed within the approved metadata scope.

The architect chooses implementation and operational mechanisms and submits the
amended specification for independent review and owner approval. This PM review
does not choose worker infrastructure, approve a migration/grant change, claim
runtime validation or authorize paid usage, push, merge, deployment or release.
