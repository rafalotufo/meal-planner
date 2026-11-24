---
artifact: recipe-url-menu-main-integration
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
source_commit: 14fabbcb51365409bce2628000830404c98d73e3
feature_parent: c9316dce75daa7bcd4b56250b89442a3fc135e78
main_parent: 4eea4aa3496662f0e12133fd749fd193e6d4a291
---

# Recipe URL menu — independent combined-source code review

Verdict: **Approved for the owner-authorized local main merge.** No blocking
Bugs, Security or Compliance finding. This review assesses exact combined source
`14fabbcb51365409bce2628000830404c98d73e3` and semantic resolutions against both
parents above. It is not hosted migration, deployment, release, native restore
or authority to run an unnecessary migration against the already-compatible DB.

## Code and storage assessment

- `app/api/menu/route.ts:25`–`26` and `lib/menu/store.ts:21`–`29` preserve main's
  bounded/parameterized q search, family scoping and keyset cursor while joining
  curation status. `lib/menu/validation.ts:56`–`90` keeps the corrected string-only
  state contract and main's exact/unique/descending page and canonical boundary
  cursor validation. Neither conflict side's safeguards were discarded.
- `lib/plans/generate.ts:25` excludes every companion state other than ready;
  legacy/search rows without a task remain eligible. `lib/plans/store.ts:47` and
  `:67` enforce the same rule independently for direct suggestion and acceptance
  inside the existing common-lock transaction. Source uniqueness, revisions,
  approvals and retained-suggestion updates are otherwise unchanged from main.
  `app/plans/swap-recipe-dialog.tsx:93` filters ready choices for presentation;
  the server predicates remain the actual enforcement. Completion of curation
  does not regenerate an existing draft. Pending links retain menu Retry/removal.
- Independently compared all main0000..3 SQL bytes plus the first four journal
  entries and runtime metadata records with pinned main: exact matches. The new
  0004 SQL is byte-identical to the feature's unapplied former0002. The merged
  catalog with companion entries removed equals all139 pinned-main entries,
  including their exact definitions. No recorded migration was rewritten.
- `scripts/migrate-db.ts` retains both restricted grant sets: existing weekly
  plan/suggestion/approval access plus companion SELECT/INSERT/UPDATE and only
  explicit menu metadata-column UPDATE. Domain interfaces contain both features.
  Disposable rollback tests remove the curation dependency before menu while
  retaining main's unique-plan/plans rollback order. Native runtime migration
  behavior and exact catalog validation remain unchanged.
- Compared curation worker/guard/parser, safe photo transport/parser, Proxy and
  public policy byte-for-byte with the previously reviewed feature parent: no
  changes. Existing expiry/delegation, current-authority, generation/lease and
  removal/resave findings remain resolved. Package/lock/env template and main's
  plan API route are byte-identical to pinned main; manifest-only clarification
  does not conceal dependency or route behavior changes.

## Meaningful integration proof

Read `tests/plans/curation-integration.test.ts`: it constructs the exact four-row
main prefix in an owned DB, seeds every relevant existing domain, applies/repeats
0004 and compares old domain/history rows exactly. Its other cases prove unready
menus cannot generate dinners, ready curation becomes eligible without replacing
an existing draft, and direct pending suggestion/acceptance fails409. The real
combined Chrome helper exercises actual protected save/curation, ready q search
and suggest/accept rather than fabricating successful API replies.

The existing curation-helper readiness change waits for complete document/styles
and an exact older-page heading before physical input. It removes neither the
original assertions nor the actual protected POST. Its diagnostic evidence is
honestly distinguished from the final passing helper.

Independently ran the focused menu validation, parser and plan validation/calendar
command: **27 passed**, zero failures/cancellations/skips (197ms). Reviewed broader
reported checks in main-integration-verification.md: lint/typecheck/build,
menu69/plans23/family34/auth16/deployment32/recipe82/Python7 and combined plus
existing menu/plans/curation Chrome coverage. Those full-suite/browser runs are
lead-reported proof, not independently rerun by this reviewer.

## Audit preservation and security consultation

Independently checked all **600** manifest entries: archived bytes equal their
specified parent Git blobs and SHA-256 values. Main canonical ledger and memory
remain exact byte prefixes. The four derived feature gate imports retain their
original gate/decision/artifact/commit/approver/time/expiry values and provenance
hashes; original chains remain archived. Inspected the24 message aliases and
live-reference map; canonical messages pass validation. No historical approval
was treated as new hosted/release/merge authority.

Independent commands passed: org message check341/zero violations, loop check zero
violations, workflow check consistent7 nodes/142 ledger records, exact source
worktree check and `git diff --check`. The formal independent security report
`org/reviews/recipe-url-menu-main-integration-security-001.md` is **CLEAR for this
exact14fabbc source**. Read that report before issuing this approval; its13
independent tests include real isolated four-to-five preservation proof.

## Native observations and scope honesty

The native sequence differs from the intended cutover. The recorded guard refused
native-prefix-drift before backup creation or writes, then read-only inspection
found the shared DB already matched the five-migration candidate. The actor is
unknown. No root native apply, pre-cutover backup or actual before/after native
fingerprint proof exists from this run, and none is claimed. Isolated preservation
proof must remain separate from the provenance of that external change. The
archived helper's apply mode must stay unused against the current matching state.

Read root's reported exact current history/catalog and required/forbidden ACL
checks plus absence of a matching active local scheduler; those native probes
were not independently repeated here. The owner's “Sign-in works now” is real
owner-reported confirmation, distinct from fixture evidence; no unobserved menu
operation or callback details are inferred. The later explicit “Merge to main”
supplies the human local-merge instruction; this review supplies code clearance.
No new hosted, paid-provider, production or release action is authorized.

No code, plan, audit state, ledger or database was edited by this reviewer. Root
may now complete the separately authorized local fast-forward after recording
reviews and confirming its exact source/target checks.

## Recovery handoff fact review

Also reviewed `intent/recipe-url-menu/main-integration-local-result.md` and the
owner's local-merge decision `org/messages/ceo-0067.md`. **Approve the factual
recovery handoff** within their stated limits. It consistently distinguishes
root-reported read-only compatibility/ACL/scheduler probes, anonymous/OAuth-
initiation checks and owner-reported real Google sign-in from isolated fixture
and migration proof. It does not claim root migration execution, a pre-cutover
backup or actual native before/after domain preservation. This artifact review
is not an independent repeat of those native probes or an observation of the
owner's browser callback. Existing-data provenance limits and the prohibition
on unnecessary helper apply remain explicit. Leaving the working port3000
preview in place and completing only the authorized local-main merge fit the
recorded owner instruction; push, hosted operations and release remain excluded.
