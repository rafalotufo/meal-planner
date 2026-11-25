---
artifact: recipe-url-menu-implementation
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: clear
source_commit: 7a7668dc16d877164ae3798b0b0382fd746d3cc8
previous_source_commit: 742ce99492868f1e3ec9bb223c6afc4532fc6ea8
---

# Recipe URL menu — final security reconfirmation

**Clear for local implementation/merge review. No blocking security findings.**
This assessment applies to exact corrected source
`7a7668dc16d877164ae3798b0b0382fd746d3cc8` and supplements
`security-recipe-url-menu-001.md`. It does not authorize merge, hosted migration,
deployment or release.

## Corrected boundary

The independent code reviewer identified a P2 strict-validation defect in the
previous source: enum membership used `String(state)`, permitting arrays such as
`["ready"]` to pass while returning their original non-string value. The prior
security clearance is historical for its stated source; it is not evidence that
this missing negative case was tested then.

The exact correction at `lib/menu/validation.ts:61` and `:69` now requires a string
before comparing allowed enum values. Public wrong types return null; malformed
persisted row types fail closed with the existing generic storage error. Existing
exact keys, status/retryability pairing, recipe/ID/timestamp rules remain unchanged.
An absent LEFT JOIN companion still deliberately maps existing/search snapshots
to ready, as required by the approved design; public null remains invalid.

The new regression at `tests/menu/validation.test.ts:73` exercises arrays,
numbers, booleans and objects at both public and row boundaries, plus public null
and the intentional absent-task legacy case. It preserves the existing tests and
does not substitute coercion, alternatives or skipped checks.

## Final evidence and scope

- Independently verified HEAD is the exact source above and inspected the complete
  `742ce99..7a7668d` source/test/verification delta. Only the two type checks,
  negative regression and developer verification appendix changed.
- Independently ran `node --import tsx --test tests/menu/validation.test.ts`:
  **8 passed**, zero failures, cancellations or skips.
- `git diff --exit-code HEAD -- app lib drizzle scripts tests` confirmed the
  assessed application/test source was committed and unchanged in the worktree.
- `git diff --check` passed.

No guard, credential/delegation, store/lease/generation, SQL/migration/grants,
worker/registration, native transport, parser, public policy or UI behavior was
changed by this correction. The initial review's independently examined controls
and focused authority/race tests remain applicable to those unchanged files.

Read the final verification appendix reporting focused28, lint/typecheck/build,
menu65 and deployment32 passes plus a genuine rebuilt Chrome save-to-ready smoke
with one source acquisition and no console errors. Those broader runs are
implementation-lead proof reviewed here, not claimed as independently repeated
by this reviewer. Prior real browser/HTTP evidence remains explicitly scoped in
that record. No live provider, hosted operation or unattended-execution result is
claimed. The approved best-effort curation and explicit Retry limits remain.
