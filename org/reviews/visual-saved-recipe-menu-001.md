---
artifact: intent/saved-recipe-menu/visual-design.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Saved menu — independent visual Design review

Approved for owner visual review. No required findings. Reviewed the stable
visual-design.md and mockups/menu-preview.html against the approved sibling
specification, using REVIEW.md and the code-review-and-quality review lenses.
This is review of an illustrative Design proposal, not production acceptance.

- **Scope and fidelity:** visual-design.md explicitly preserves the existing
  search/notebook/card vocabulary and limits home additions to menu navigation
  and save actions. Preview lines 88–100 show both requested screens, shared
  family explanation, source/time cards and menu discovery. The no-maximum
  collection rule is preserved; three sample cards per page is clearly labeled
  as a preview simplification of the approved 50-entry keyset page size.
- **Actions and states:** lines 113–130 wire local save, duplicate-save success,
  removal, pending labels, retry feedback, filtering/sorting, accordion and
  Older/Newest navigation. Page rendering replaces cards rather than accumulating
  them; first-page empty, older-page empty and load failure are distinct (123).
  Save/removal failures retain the card and permit retry. Removal selects a
  remaining action or the empty-state link for focus after rendering (125).
- **Accessibility and responsive contract:** visible focus (11), descriptive
  action names/busy state and live feedback (99, 121), labeled form/sort controls,
  44px primary/product controls, minmax card columns, wrapping card content and
  scoped container queries (51–86) are appropriate for this proposal. Device
  width controls use pressed states. Root's separate real-browser 390/1440
  inspection remains the runtime layout evidence; this reviewer did not
  independently run a browser or measure overflow/contrast.
- **Photo boundary and isolation:** sample images are local CSS illustrations
  labeled Sample image (54–62, 120). Missing-photo mode visibly substitutes the
  fallback. The proposal explains that product cards retain available publisher
  URLs and fall back only for absent/failed photos. No fetch/XHR/WebSocket,
  external script/style/font/image reference or CSS remote URL is present.
  The one HTTPS reference is the deliberately user-activated sample source
  link (121), disclosed as a publisher homepage rather than recipe evidence.
  Optional conversation-host state controls are guarded and sample persistence
  is explicitly labeled as local preview state, not saved application data.

Verification: Node vm.Script successfully parsed the extracted inline script;
reviewed selectors and handler branches against the declared DOM; static network
pattern inspection found only the intentional source-link construction;
git diff --check passed. No application source, global workflow state, database,
network or deployment was changed. No menu implementation, production storage,
real-photo delivery, complete keyboard/browser behavior or family authorization
has been proved by this mockup. Owner visual approval, approved implementation
plan, implementation verification and human merge/release remain separate.

## Focused final width recheck

Rechecked preview lines 16–17 after the final width amendment: the desktop
window now has width 100% and max-width 1200px; the more specific mobile rule
retains max-width 390px. This preserves the existing centered application
proportions while keeping container breakpoints and narrow rendering intact.
No new required finding; approval for owner visual review stands.

Root separately reports real-browser 1440/390 checks: three/one card columns,
no narrow horizontal overflow (client/scroll width both 358px), save pending and
success, menu, Older/Newest navigation, removal/refill, and no console warnings
or errors. These are root's observed preview checks, not this reviewer's own
browser run or production implementation proof. git diff --check passed after
the CSS amendment.
