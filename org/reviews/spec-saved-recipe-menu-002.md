---
artifact: intent/saved-recipe-menu/spec.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 2
---

# Shared menu — no-cap and retained-photo amendment review

Approved for human specification review. No required findings. This focused
independent review covers the owner-directed differences from review 001,
including a fresh security reassessment of retained image URLs and cursors.
The earlier reviews' 200-entry limit and all-fallback photo assumptions are
superseded; their security conclusions do not certify this photo amendment.

## Bugs and scope

- Spec.md:20–29 removes the collection maximum while bounding each read/render
  through 50-entry replacement pages. The save transaction no longer counts or
  rejects entries at a quota (268–277), consistent with ceo-0048 and the amended
  intent. No full-state response, eviction or hidden result cap remains.
- Spec.md:281–306 defines deterministic keyset traversal using the existing
  family/saved-time/ID index, LIMIT 51, a cursor from the last returned row, and
  matching tuple comparison/order. Unchanged collections remain wholly
  traversable, including equal timestamps. Boundary-row deletion does not
  invalidate a cursor. Deletion refreshes the current slice and next link;
  an empty older page remains distinguishable from an empty collection and
  navigable to newest (136–148, 300–304). Concurrent traversal is explicitly
  not presented as a frozen snapshot.
- The owner-selected available-photo behavior is now explicit (104–124): save
  the selected nullable publisher URL, retain it across reloads, use the existing
  fallback only for absent/failed loads. First-save-wins still covers the photo.
  This does not promise image-byte archival or perpetual publisher availability.

## Focused security reassessment

Trust boundaries newly assessed are caller-controlled cursor → SQL position,
caller-controlled photo URL → stored row, and stored photo URL → browser image.
Assets remain family isolation, server network safety and bounded request work.

- The cursor is not an authorization token. Spec.md:185–189 and 281–306 require
  a single bounded canonical base64url value, exact tuple types, safe integer
  time and canonical UUID, bound SQL values and current server-derived family
  predicates. Forging a position changes only the caller's own slice; it neither
  selects another family nor requires a foreign-row existence lookup. No client
  page size, count-all, offset scan or full-menu materialization is introduced.
- Image input is a required nullable field with safeRecipeUrl normalization,
  canonical ASCII/byte bounds and rejection of invalid nonnull values (63–70).
  Stored rows, including image URLs, are validated before response/rendering
  (251–258). The existing helper in lib/recipes/validation.ts rejects non-HTTPS,
  credentials, nondefault ports, literal IP/local targets and control characters.
- Spec.md:104–124 preserves the actual app/recipe-card.tsx boundary: unoptimized
  browser image rendering, no-referrer and load-failure fallback. Current search
  images are publisher URLs selected via the same URL helper in
  lib/recipes/photo-metadata.ts. Save/list/remove add no server fetch or Next
  image proxy, so the persisted URL cannot direct a new server request to an
  internal address. The specification correctly does not claim its server
  pinned-DNS/redirect protections apply to later browser loads. Forged valid
  publisher-style URLs and publisher changes remain explicit trust limitations.
- Body size/deadline, admission rechecks, common write lock, family-scoped
  mutations, fixed errors and least-privilege grants remain intact. Removing
  the total quota does not remove input, query or render bounds.

## Verification and limits

Spec.md:349–357 adds retained/invalid/failed image tests, no server photo fetch,
more-than-200 saves, multi-page traversal with no lost/duplicate unchanged rows,
malformed/foreign cursor isolation, boundary deletion and bounded DOM/browser
checks. These are meaningful future implementation obligations.

Read amended intent/spec, owner records ceo-0048/0049, prior reports and actual
URL/photo/card interfaces; git diff --check passed. Applied the review and
security-and-hardening skill lenses. The latter's linked supplementary security
checklist was absent from installed skill roots; review used its inline threat
model/controls and repository evidence above. No application edits, live DB,
network, browser or implementation mutation tests occurred. This approves only
the amended Design for human consideration; human spec/plan approval, runtime
verification, hosted migration, merge and release gates remain separate.
