---
artifact: recipe-url-menu-implementation
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 2
source_commit: 7a7668dc16d877164ae3798b0b0382fd746d3cc8
previous_source_commit: 742ce99492868f1e3ec9bb223c6afc4532fc6ea8
base_commit: 2513046
---

# Recipe URL menu — final independent code re-review

Verdict: **Approved for the human merge gate.** The sole P2 finding from round1
is resolved at exact source `7a7668dc16d877164ae3798b0b0382fd746d3cc8`; no remaining
blocking Bugs, Security or Compliance finding was identified. This is independent
code approval, not human merge approval, hosted migration/grant authority or
staging/deployment/release authorization.

## Correction verified

`lib/menu/validation.ts:61` now requires public curation state to be a string
before enum membership and returns only a validated string. Line69 applies the
same rule to persisted state. Both former `String(state)` coercions are gone.
Exact-key, enum/retryability, recipe, ID and timestamp validation remain intact.
The absent LEFT JOIN companion still intentionally maps an existing/search
snapshot to ready; a public null state remains invalid.

`tests/menu/validation.test.ts:73` adds meaningful negative arrays, numbers,
booleans and objects at both boundaries, public null rejection and the explicit
legacy absent-task case. All original tests and assertions remain.

Independently ran the current regression with the old `742ce99` validator in a
private temporary copy, without altering the workspace: **7 passed, 1 failed**.
The new case failed specifically because `["ready"]` returned an entry instead
of null. This confirms that the regression detects the actual original defect,
rather than merely mirroring the corrected implementation.

## Exact source and security consultation

- Verified HEAD equals `7a7668dc16d877164ae3798b0b0382fd746d3cc8` and
  `git diff --exit-code HEAD -- app lib drizzle scripts tests` passes.
- Inspected the full `742ce99..7a7668d` delta: only two type checks, the negative
  regression and a verification appendix changed. No hidden source, SQL/grant,
  guard, fixture or UI changes were introduced during correction.
- Required independent security consultation completed **CLEAR** for this exact
  corrected source in `org/reviews/security-recipe-url-menu-002.md`. Read that
  assessment before this verdict. It independently checked the narrow delta and
  ran all8 validation tests. Round1 security evidence remains historical for its
  own source; the new addendum supplies corrected-source confirmation.
- The initial full-source review in `code-recipe-url-menu-001.md` remains
  applicable to unchanged task authority/fencing, schema/grants, parser/transport,
  request guards, after scheduling, UI polling/focus and test-scope boundaries.
  The round1 P2 is closed by the checked correction, not waived due to loop budget.

## Verification and limits

Independently ran `node --import tsx --test tests/menu/validation.test.ts
 tests/menu/recipe-metadata.test.ts tests/menu/body.test.ts`: **28 passed**,
zero failures/cancellations/skips (143ms). `git diff --check` passed. No
application/test/plan/workflow/ledger edits were made by this reviewer.

Read the implementation lead's corrected-source verification: lint/typecheck/
build passed, menu65, deployment32, and genuine rebuilt Chrome protected
save-to-ready with one acquisition/no console errors. Prior unchanged-source
recipe/photo82, family34, auth16, Python7 and full mobile/desktop/menu/auth/
curation/polling/focus evidence remain explicitly scoped in verification.md.
Those broader runs were reviewed as reported evidence, not independently rerun
here. The narrow stricter-type correction has valid-state coverage in the
independent28 tests and rebuilt browser smoke; it does not warrant claiming new
full visual coverage.

No hosted data, live provider, paid usage, development migration or deployment
was accessed or claimed. Supported static Recipe pages, bounded best-effort
background execution and explicit Retry remain the approved product limits.
Human approval and separately authorized migration/staging/release gates remain
intact.
