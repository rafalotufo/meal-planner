# Saved recipe classification — independent code review

- Reviewer: reviewer, independent of implementation authors
- Date: 2026-11-26
- Reviewed application source: `76eaafb` (cumulative feature from `a0deeb6`)
- Storage/API source: `69b2719`; auto-save amendment: `76eaafb`
- Design approvals: `d891e35` and auto-save amendment `3e69b40`
- Security approvals: `d84ac54`, followed by auto-save assessment `cd8609c`
- Verdict: **Approved for human merge review**. No unresolved findings or nits.

## Bugs, architecture and scope

Reviewed accepted intent, owner manual-correction/auto-save directions, approved
specification/manifest, changed application code and behavior tests. Search adds
category to its existing strict source-bound curation response without another
model/source pass. URL imports classify only the selected associated Recipe
node through bounded exact metadata aliases; null preserves honest uncertainty.
Invalid category alone cannot discard otherwise grounded model details.

The category-only correction uses exact existing menu POST, a bounded streaming
body, current Google identity, common locked transaction, current admission and
server-derived family ownership. The completion CASE preserves the durable
manual override; retries/duplicates retain it. Tests exercise both serial orders,
failed retries, foreign IDs, lost admission, deletion and synthetic edit denial.
The existing handler retains Host/Origin/JWE/private-header protections; no new
Proxy exemption, public route or synthetic capability was added.

Canonical parsing accepts the exact legacy five-key JSON card or its validated
category extension. Current SQL projections require category, including weekly
generation and suggestion/acceptance. Passing plan tests retain categories in
new snapshots and prove correction leaves existing persisted snapshots unchanged.
No selection, count, scheduler, historical plan or eligibility redesign appears.

The native migration is additive: two columns, two checks and null/false defaults.
Independent comparison proved every historical descriptor/profile/independence
record unchanged, SQL SHA matches, no catalog removals, and exactly two new
column UPDATE grants. Owner/source/saved-at and runtime TEMP denials remain.
Restricted fixtures and their deliberate TEMP attack test are confined to
validated owned random databases, restoring denial in finally with assertions.

## Auto-save UI and actual browser evidence

`app/menu/recipe-category-control.tsx` saves a validated changed selection
immediately, without a Save button/form. A synchronous request ref prevents
concurrent submissions, the select disables while pending, the returned entry
is validated, and persisted props control the saved label. Failures reset the
selection and retain sanitized feedback, permitting reselection to retry.
Unmount cancellation and entry/category keys prevent stale work from replacing
another card. The API remains authoritative for server-derived edit capability.

Reviewed final native keyboard browser assertions: failure injection precedes
selection, pending state is observed, failure retains the old label and resets
the select, reselection auto-saves, and reload preserves the correction. Neither
DOM value assignment nor an application test bypass supplies the result.
The complete menu script and curation script passed on the final UI source.
A prior curation run recorded a transient Invalid InterceptionId; final original-
helper confirmation passed without ignoring errors or keeping a helper change.

Independently inspected final screenshot files
`recipe-classification-url-menu-category-pending-320.png` and
`recipe-classification-url-menu-category-failed-1440.png`: native selectors and
saved labels are clear, links wrap, controls fit, no Save category button
remains, and failure/retry layout preserves card usability. Ready photo overview
screenshots were also inspected; their top viewport does not show the category
controls, so the pending/failed screenshots supply the direct control evidence.

## Verification assessed

Read actual integration logs and test diffs, rather than claiming independent
reruns of every command. Required lint, typecheck and production build passed;
recipe118, family35, menu78, plans37, auth16, verification30, deployment42 and
Python7 passed with no skipped tests. The earlier migration run passed69/70;
the sole fixture failure was corrected without removing its security assertion,
and the affected security file passed30/30. The existing upgrade/default/ledger
and runtime-metadata coverage remains present and passing.

Final browser/build logs: private `recipe-classification-checks-ewxq3z`.
Original-helper curation confirmation: `recipe-classification-checks-xISaQA`.
Other actual logs: `KxCqIF`, `2dz37o`, `Ep2ANk`, `3mhLLe`; details and installation
limits are recorded in sibling `verification.md`. No dependency/lockfile change,
paid provider success, hosted migration or production verification is claimed.

Independently inverted the new metadata conflict predicate (`!== role` to
`=== role`) and ran `tests/recipe-category.test.ts`: exit1, two tests failed
(agreement and conflicting main/side). Restored source byte-for-byte immediately;
normal run passed3/3, exit0. No mutation remains. This demonstrates the tests
catch a realistic category regression. Subsequent review used static inspection
and recorded fixture evidence without further source mutation.

`git diff --check` passed. Zero staged-secret findings are required for this
review commit. The original `tests/auth/chrome.ts` has no final diff; no checks,
assertions, compiler scope or vendor declarations were weakened.

## Remaining human gates

This is local code approval only. Human merge, exact-source staging acceptance,
explicit hosted migration/grants and release remain separate. Recorded hosted
databases have seven identities; this runtime requires eight. Older binaries
are incompatible after that future migration. The current feature neither
migrates development/hosted data nor grants standing release authority.
