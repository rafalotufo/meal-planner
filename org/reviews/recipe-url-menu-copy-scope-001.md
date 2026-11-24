---
artifact: recipe-url-menu-copy-scope
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Narrow correction of stale expected search-label copy

Verdict: **Approve the bounded plan-scope amendment.** Add only
`tests/auth/oauth.test.ts` and `tests/auth/browser.ts` to the manifest and correct
their stale expected label. Correct the same expected label in the already
manifested `tests/deployment/postgres-packaging.test.ts`. No production source,
test logic, guards, coverage or other assertions change under this approval.

## Evidence

- The approved `intent/weekly-search-copy/spec.md:7` specifies the exact label
  `What would you like to eat this week?`; its plan preserves behavior and guards.
- Actual `app/recipe-search.tsx:131` renders that exact associated label. `git show
  b981231:app/recipe-search.tsx` and `git show 2513046:app/recipe-search.tsx` both
  contain the same label at line131. `git diff b981231 -- app/recipe-search.tsx`
  is empty: this feature did not cause the source-copy difference.
- Both baseline commits retain the stale cook wording in
  `tests/auth/oauth.test.ts:46`, `tests/auth/browser.ts:535`, and packaging test
  line26 (currently line28 after this feature's imports). Thus the mismatch
  predates the URL-menu implementation.
- The HTTP tests assert home200 before matching the visible form copy; the real
  browser asserts the associated `label[for=recipe-query]` text exactly. Correcting
  the expected value preserves those meaningful authenticated-page checks.

## Allowed correction and proof

Use exactly `What would you like to eat this week?` for the browser equality and
match that full label in the two HTTP regex assertions (escape the final `?` as
needed). Preserve assertion methods and all surrounding status, heading, CSP,
authentication, search and image checks. Do not accept both old/new labels,
remove assertions, broaden them to generic text, change source copy, skip tests
or lower checks. Rerun the previously failing packaging case and affected auth
HTTP/browser flows; final review still assesses the complete implementation diff.

This consultation approves only the narrow test-expectation correction and plan
manifest expansion. It is not final code approval, owner plan approval, merge or
release authorization. No code, tests, plan, workflow state or audit records were
edited during review.

## Additional stale family assertion — bounded follow-up

Approve adding only `tests/family/main-integration.test.ts` to the same manifest
amendment and correcting only its expected label at line18 to the full approved
`What would you like to eat this week?` (with regex punctuation escaped).
`git show b981231:tests/family/main-integration.test.ts` and `git show
2513046:tests/family/main-integration.test.ts` both contain the stale cook regex;
those baselines already render the approved weekly label in recipe-search.
Current full `rg` across application/tests finds this as the last stale phrase.

Preserve home200, the pending-home redirect, spoofed-header denial, pre-acceptance
403, post-membership validation400, empty-provider503 and invitation acceptance
assertions at lines12–25. This copy-only correction retains the family's real
provider-boundary/security proof. Rerun the affected case and full family suite;
no broader family/test/source edits are approved by this consultation. No code,
plan or workflow audit changes were made during this review.
