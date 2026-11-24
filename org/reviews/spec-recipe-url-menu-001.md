---
artifact: intent/recipe-url-menu/spec.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Recipe URL menu — independent specification review

Verdict: **Approved for owner specification review.** No blocking findings in
the Bugs, Security or Compliance passes. This is design approval, not owner
approval, implementation permission or evidence that runtime tests passed.

## Evidence and assessment

- **Bugs:** `spec.md:151`–`169` defines a deliberately supported static JSON-LD
  subset, submitted-source association and unique selection. Matching fragment
  IDs normalize through existing `safeRecipeUrl` (`lib/recipes/validation.ts:7`–
  `24`); a sole unbound Recipe is an explicit import-specific rule. Competing
  nodes cannot contribute mixed fields. The current photo selector already
  demonstrates bounded JSON-LD/root-array/@graph traversal and strict identity
  matching (`lib/recipes/photo-metadata.ts:90`–`122`). The import parser is
  appropriately separate rather than pretending that photo selection imports
  title/summary/time. Unsupported forms fail instead of being guessed.
- **Bugs:** `spec.md:175`–`186` maps to the exact existing snapshot contract.
  Title/summary bounds, nullable photo/time and final `parseMenuRecipe` validation
  match `lib/menu/validation.ts:21`–`33`. `Summary unavailable.` is an honest,
  valid absence label without schema changes. The duration subset and image
  ordering are sufficiently defined for deterministic tests. Existing cards
  receive the same shape; no legacy snapshot rewrite is required.
- **Security:** `spec.md:31`–`58` preserves the exact guarded menu endpoint and
  adds a strict query/body mode. Actual `app/api/menu/route.ts:25`–`45` and
  `lib/menu/http.ts:21`–`42` support this extension without changing Proxy/public
  exceptions. The specification retains Host/JWE/token/identity/family checks,
  Origin validation, actual-byte limits, body deadline and protected failures.
  `lib/menu/body.ts:5`–`34` provides the existing bounded reader to extend.
- **Security:** `spec.md:77`–`118` authorizes external effects only after current
  access checks, keeps network work outside transactions and rechecks identity
  before the save. `saveMenuRecipe` actually rechecks current membership inside
  its transaction and retains the first snapshot for duplicate normalized sources
  (`lib/menu/store.ts:29`–`38`). The specification states duplicate-read/removal
  races and uncertain commit outcomes honestly. Parent-abort checks compensate
  for the existing low-level loader returning null on cancellation.
- **Security:** `spec.md:122`–`139` accurately preserves the existing native safe
  loader's public all-address DNS checks, pinned TLS transport, no redirects/proxy,
  bounded HTML/headers/encoding/deadline and resource cleanup
  (`lib/recipes/photo-transport.ts:13`–`126`). Two non-waiting import slots are
  explicitly per process and released on every outcome; no global rate-limit
  guarantee is invented. Publisher scripts, remote contexts and image bytes are
  never fetched/executed by import.
- **Compliance:** `spec.md:198`–`232` covers labelled, keyboard-accessible menu
  entry and honest pending/success/duplicate/error feedback without adding
  unrelated navigation or editing. Refresh/pagination and removal focus are
  compatible with existing `app/menu/menu-controls.tsx:21`–`75`.
- **Compliance:** `spec.md:236`–`280` requires strict TypeScript unit, real guarded
  HTTP, database, browser and compiled packaging evidence. Test-only preload
  injection is feasible within the existing owned child-server pattern in
  `tests/auth/server.ts:8`–`35` and `tests/auth/google-network.ts`; the new native
  HTTPS/DNS fixture must be implemented during Build. Success cannot be faked by
  intercepting the menu API. No production bypass, hosted effects, paid provider,
  dependency change or database migration is implied.

## Owner-visible limits and next gate

The first version supports static Schema.org Recipe JSON-LD, with a final direct
HTTPS URL. It deliberately excludes redirects, publisher JavaScript, bot/login
bypass and arbitrary-prose scraping. A Recipe identity different from the
submitted URL (including a tracking query difference) is rejected; that limit is
explicit in `spec.md:163`–`164`. Missing summary uses `Summary unavailable.`;
photo/time remain unavailable when unsupported. One submission reads and saves.
These choices are clearly reviewable in the specification rather than hidden
implementation assumptions.

Owner specification approval is the next gate. The sibling implementation plan
is intentionally absent until then. No application code was changed or tested.
Read the accepted intent, specification and relevant source/test files above;
`git diff --check` passed. Worktree dependency installation and installed Next
re-reading remain explicit pre-code obligations.
