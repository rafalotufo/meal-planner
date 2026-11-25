# Recipe URL menu — authorized local main merge result

Date: 2026-11-24

Owner explicitly requested “Merge to main” after confirming real Google sign-in
works at localhost. Independent combined code/security reviews approve exact
runtime source `14fabbcb51365409bce2628000830404c98d73e3`.

Performed a clean-worktree expected-tip local fast-forward:

- Previous main: `4eea4aa3496662f0e12133fd749fd193e6d4a291`.
- Reviewed runtime merge: `14fabbcb51365409bce2628000830404c98d73e3`
  with parents URL curation `c9316dc` and previous main `4eea4aa`.
- Actual initial fast-forward destination:
  `b843b10232f5a7f189cf8d8dd6665a1bc63c66a5` (review/authorization audit).
- Matching owner approval:
  `recipe-url-menu-local-main-merge-2026-11-24` in the committed gate ledger.

This result and final graph/memory bookkeeping are later audit-only changes;
final main HEAD may include them. Reviewed runtime source remains the exact
commit above; application/lib/schema/scripts/tests/config bytes do not drift.
A final expected-tip fast-forward will include this outcome record itself.

All required combined checks and real Chrome helpers pass; see
`main-integration-verification.md`. Exact migration prefixes, q/strict-page
contracts and ready-only planning are retained. Both original audit histories
are preserved with verifiable imports in the merge archive.

Localhost3000 remains running from the verified combined build. Native catalog,
ledger and required/forbidden runtime privileges were verified read-only;
the owner confirmed actual Google sign-in works. The native fifth migration
was observed externally during QA. Root's guarded preflight refused before
backup/write, so this run claims no native migration, pre-cutover backup or
native before/after row fingerprint proof. No additional native apply is needed.

No push, hosted migration/configuration, deployment, promotion, provider search,
job activation or release was performed or authorized. Main integration does not
supply a future exact-source staging/Production release approval.
