---
artifact: recipe-url-menu-main-integration
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: clear
source_commit: 14fabbcb51365409bce2628000830404c98d73e3
feature_parent: c9316dce75daa7bcd4b56250b89442a3fc135e78
main_parent: 4eea4aa3496662f0e12133fd749fd193e6d4a291
---

# Recipe URL menu — current-main integration security review

**Clear for the owner-authorized local main merge. No remaining blocking security
finding.** This verdict applies to the exact combined source above. It does not
authorize hosted migration, deployment, release, native restore or an unnecessary
native migration. The native helper's apply mode must remain unused against the
already-compatible five-migration database.

## Source and integration controls

- Independently verified the merge commit and both parent IDs, and confirmed no
  application/library/migration/script/test working-tree differences from the
  assessed source. Reviewed semantic resolution against both parents and the
  approved `main-integration-plan.md`.
- Main0000..3 SQL bytes, journal entries/timestamps and runtime hashes remain
  exact against pinned main. Only the feature's unapplied curation SQL moved to
  0004; its bytes match the feature parent. Runtime metadata has exactly five
  entries and retains the complete four-entry prefix. No applied migration,
  ledger repair or historical rollback was rewritten.
- Menu listing retains server-derived family scope, bounded parameterized q title
  filtering and keyset pagination, together with curation metadata. Public page
  validation retains exact shape, typed curation enums, unique IDs/sources,
  descending order and canonical last-entry cursor constraints.
- `lib/plans/generate.ts` excludes any curation row not ready. Both suggest and
  accept branches in `lib/plans/store.ts` independently enforce the same rule
  while holding the existing common transaction lock. The picker filters to ready
  entries as a presentation measure, not as its sole authorization boundary.
  Pending/failed/interrupted links cannot become generic dinners through direct
  requests; ready completion does not silently regenerate existing drafts.
  Family isolation, unique recipe sources and revision/suggestion checks remain.
- Curation authority, after registration, min(session/JWE) expiry, current
  subject/email/admission/family rechecks, generation/lease fencing, no-upsert
  completion and removal/resave protection are unchanged from the independently
  reviewed feature. The safe native HTML transport, photo parser, Proxy and
  public auth policy remain unchanged against the feature parent. No dependency
  or provider behavior change was introduced by semantic resolution.
- The migration tool retains main's weekly-plan/suggestion/approval privileges
  and the feature's narrow metadata-column UPDATE/companion permissions. It does
  not broaden menu ownership, source, ID or saved-order updates. Runtime still
  validates history/catalog and never creates or migrates schema on requests.

## Independently checked proof

- Compared all four main SQL files and both metadata prefixes directly with Git
  source, and compared renamed0004 with the feature parent's unapplied SQL.
- Independently ran `tests/menu/validation.test.ts`: **10 passed**, no skips.
- Independently ran `tests/plans/curation-integration.test.ts`: **3 passed**, no
  skips, in owned random local test databases only. These prove exact existing
  domain/history preservation on the isolated four-to-five upgrade, exclusion
  of unready links from generation, no draft regeneration, and server-side
  suggestion/acceptance rejection of placeholders.
- Confirmed main canonical ledger/memory remain exact byte prefixes and both
  original source ledger/memory snapshots remain byte-identical to their tips.
  Historical imported approval records retain provenance; they are not new
  hosted, release or merge authority. Verified the imported feature plan ledger
  record's hash chain.
- `git diff --check` and the staged diff check passed.

Read `main-integration-verification.md` and the relevant actual tests. Its full
lint/typecheck/build, menu69/plans23/family34/auth16/deployment32/recipe82/Python7
and combined/existing Chrome results are implementation-lead proof reviewed here,
not independently repeated full-suite/browser runs. The legacy browser readiness
correction is test-only and condition-based, preserving its original assertions;
no application authentication bypass or fabricated successful API response was
introduced. No actual owner Google callback is inferred from transport fixtures.

## Native observations and archived helper

Reviewed the archived helper and matching SHA-256:
`0952712550288485eed299f15a22f221eb1b0feb5d39f7efdeac4ac67130de1f`.
Its prepare path checks native loopback/database/role pairing, other clients,
exact old history/catalog, and would create an owner-only exported-snapshot dump
with full decode verification before apply. Apply has source/prefix/full original
ledger-row/data-fingerprint guards and explicit compatible-runtime checks. The
initial path-guard concern is resolved: exact canonical audit/dump filenames under
the same owner700 generated directory, no symlinks, and owner600 regular-file
checks precede using/overwriting the derived files. The helper contains no DROP,
restore execution or ledger rewrite. This static review is not proof it applied
successfully, nor permission for a future cutover.

Actual operation differs from the original four-to-five plan: root reports that
prepare refused `native-prefix-drift` before backup creation or database writes.
The shared native database had externally become the exact five-entry candidate
schema/history; the actor is unknown. There is **no pre-cutover backup or actual
before/after native domain fingerprint evidence from this run**, and none is
claimed. The isolated data-preservation test above remains separate proof.

Root's reported read-only native checks cover exact runtime schema/history plus
required companion/menu-metadata/weekly-plan privileges and denied ownership,
source/ID/order UPDATE, forbidden deletes/truncation, schema CREATE and migration-
ledger writes. No additional grant or migration execution was needed. Scheduler
inspection found no matching installed/loaded job or cron, and none was activated
or repointed. Those native ACL/scheduler observations were reported by root and
reviewed here, not independently reprobed by this reviewer.

The archived helper must not be applied to that already-compatible native state.
The compiled local preview remains running. The owner's explicit “Sign-in works
now” is owner-reported real sign-in confirmation, distinct from fixture evidence;
no unobserved menu-data operation or callback detail is invented. The subsequent
explicit local-main merge instruction supplies the human merge authority; this
security review itself supplies no operational or release approval.
