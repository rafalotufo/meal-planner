# Classified weekly planning — independent code review

- Reviewer: reviewer
- Date: 2026-11-27
- Verdict: **Approved for human merge review**
- Baseline: `91c419e`
- Implementation: storage `fc9b12c`, backend `39fdc4a`, UI/browser `72f726b`
- Verification: `7d66352`; independent security approval `ce3fc5d`
- Reviewed HEAD: `ce3fc5d`
- Standards: `REVIEW.md`, code-review-and-quality skill, approved sibling intent/spec/plan
- Findings: none requiring changes; no nits.

## Correctness and architecture

`lib/plans/generate.ts:38–50` preserves eligibility, current-family binding,
existing-week idempotence and ready-source filtering. Ranking occurs within each
classified category before the4/2/2 limit; the query returns at most8 source-unique
snapshots. Recent finalized use still precedes deterministic weekly hashing.
Empty/unclassified-only pools do not insert a draft, and shortages do not borrow.
The unchanged scheduler execution checks retain cancellation/deadline behavior.

`lib/plans/validation.ts:12,21` uses the shared8-recipe bound for arrays and action
indices while `lib/plans/store.ts:48,66` also validates against actual array size.
`lib/plans/store.ts:52,73` compares the current ready same-family replacement to
the stored slot category before suggestion or acceptance writes. Acceptance
retains current eligibility, uniqueness, revision and approval-reset behavior.
Legacy null slots have an explicit, tested compatibility rule rather than an
invented category. The existing transaction lock serializes menu category edits
with these reads; the category-race regression asserts no partial revision or
approval write on409.

`lib/menu/store.ts:22–33` validates category input, captures the correct title
parameter before adding category and binds both filters before LIMIT51 and
keyset pagination. `app/api/menu/route.ts:20–27` rejects duplicates/unknown keys
without changing guard order. No new identity, public route, provider or dependency
scope appears. The focused optional argument retains old unfiltered callers.

## Rendering and real browser evidence

`app/plans/plan-controls.tsx:60–80` builds category groups from original
`{meal,day}` pairs, so group-local positions cannot redirect a swap. The original
day remains in article/action attributes and captured modal state. Snapshot groups
have semantic h2 headings, h3 card titles, current-target wording and honest
shortage guidance; legacy null cards remain visible. `swap-recipe-dialog.tsx`
carries category on every request and filters client choices, preserving keyed
per-open identity, retained results, cancellation, bounded response parsing and
focus recovery. Category cannot change within that captured keyed dialog lifetime.

Read actual browser test assertions at `tests/plans/browser.ts:193–215`: generated
4/2/2 categories, three section counts, veggie discoverability behind54newer mains,
category-bearing title lookup, actual slot7 suggestion/acceptance, revision2 and
approval reset/reapproval. Historical byte-preserving read and partial-count cases
remain at lines170–188. Existing modal race, body, access-loss, keyboard and focus
regressions remain active rather than being replaced with happy-path checks.

Independently viewed these committed images with the image tool:

- `classified-weekly-planning-full-1440.png` and `full-320.png`
- `classified-weekly-planning-veggies-1440.png` and `veggies-320.png`
- `classified-weekly-planning-small-1-1440.png`
- `classified-weekly-planning-history-320.png`
- `classified-weekly-planning-swap-picker-selected-320.png`

They show readable grouped cards, correct target counts, truthful partial/legacy
labels, reachable controls and no visible horizontal overflow. Long modal titles
wrap within the short mobile viewport. These are independent image observations;
real Chrome execution and its DOM/HTTP assertions are developer evidence recorded
in `intent/classified-weekly-planning/verification.md`.

## Storage, compliance and verification

The new SQL starts with the common advisory lock and changes only two CHECK bounds
to1..8 recipes and0..7 slots. It makes no row, grant, ledger or TEMP edits.
Independent JSON comparison against baseline proves all8 previous descriptors and
required-prefix entries,11prior profiles and2independence records are identical;
only the ninth descriptor/required entry and twelfth profile are appended.
Upgrade tests preserve snapshots/proposals/approvals/menu and old ledger rows and
reject both missing-new-identity and old-runtime/ahead-database combinations.
Security review independently exercised that upgrade and unchanged runtime grants.

Independently executed during this review:

- Due scheduler full quota/recent-finalized-use test: pass.
- Honest category shortage and unclassified-only-empty test: pass.
- Composition and validation suites:4/4 pass,0 skipped, exit0.
- Mutation experiment in an isolated temporary copy: changed same-category
  replacement predicate to always allow; the policy regression failed as expected
  (`true !== false`, exit1). The original repository files were never changed;
  temporary fixture removed. This proves the category-preservation test detects
  the weakened invariant.
- Plan-sync against baseline and the approved manifest: exit0.
- `git diff --check`: exit0.

Read the complete successful lint/typecheck/build,433 application regression
results,7workflow tests, migration/security checks and three real Chrome scripts
in sibling verification.md; these are developer evidence, separate from the
focused independently executed checks above. All changed application/test paths
are covered by the approved manifest. The prior snapshot compatibility fixtures
remain deliberately legacy where they test reads; generation fixtures now opt in
to actual categorized eligibility. No check suppression or removed failing test
was used. The nine-identity schema/profile requirement is explicitly documented.

## Handoff boundary

This approval closes local code review, not the human merge/release gates. No
push, merge, development/hosted migration, grant, deployment or Production release
is authorized. The future nine-identity migration and exact-source staging and
release approvals remain separate; older artifacts are unsafe rollback targets
after that separately authorized schema change.
