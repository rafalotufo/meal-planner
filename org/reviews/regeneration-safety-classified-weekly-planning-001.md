# Classified plan regeneration — independent helper safety review

- Reviewer: reviewer
- Date: 2026-11-27
- Verdict: **Approved exact helper and rollback rehearsal for the authorized commit phase**
- Blocking findings: none.
- Preparation: `e266512`, handoff `65d3629`.
- Owner scope: `e14dfbb`, ledger `classified-plan-regeneration-20261127`,
  expires2026-11-27T19:21:44Z.
- Fixed deployed source: `f0b8c1e3a8dd0ae55e8a7568c53cef00637bb8b5`.
- Exact helper SHA256:
  `c38fad8f4b03000580a22c31184d599f1cefa0725c39ef1aad6c4b5aacef5190`.
- Reviewed original target digest:
  `9fc99914632884d904316dd06cae21a8ab837211fb0163822b06a97385cb3661`.

Read the exact private TypeScript helper, pinned deployed generator/transaction
implementation, original rehearsal/backup receipts, sanitized preparation and
committed authority. No helper mode or database operation was executed by this
reviewer. No connection values, allowlist, recipes, emails or subjects were
printed or added to Git.

## Scope and atomicity

The helper accepts only fixed rehearse/commit modes, exact authorized Production
owner/endpoint/database and verified TLS. It validates finite authority and fresh
fixed-source Production attribution. The private directory/credential/receipt
checks and exclusive started marker prevent accidental reuse; commit additionally
requires matching helper/source/old-target/content-digest/reviewer-commit evidence.
Root must bind that private receipt to this committed review, not a different
helper or rehearsal. Future drift fails closed and grants no replay authority.

The pinned transaction implementation takes common advisory lock73462901 before
all callback decision reads on one READ COMMITTED connection with bounded local
timeouts. Under that lock, exact old ID/family/week, latest plan, draft/revision1,
seven validated recipes and zero approvals/suggestions are required. Deployed
`generateFamilyPlan` must first return existing, after its current family-admission
check. Exact ready-pool17/3/3 and minimum4/2/2 checks precede effects. Wrong/newly
finalized/content-changed targets or insufficient/unexpected pools stop.

An exclusive owner-only narrow plan/dependent backup is written before deletion.
Dependent DELETEs bind only the authorized old plan; old draft deletion also binds
ID/family/week/status/revision. The existing deployed generator then creates the
same family/week using actual current time, without faking Wednesday or invoking
the global scheduler. Before COMMIT, assertions require one new UUID draft,
revision1, actual timestamp, eight distinct sources, exact4/2/2 categories and no
dependents. Unrelated-table/other-week data, schema/profile, history, grants and
roles are compared inside the transaction. Failure before commit rolls back;
postcommit readback failure is sanitized and explicitly requires inspecting actual
state rather than blind replay or automatic restore.

## Independently verified rehearsal

Rehashed the helper to the exact SHA above. All11pinned file hashes and bytes match
fixed Gitf0, including the private allowlist without exposing its contents.
Independently ran strict TypeScript compilation with the unchanged repository
bar: exit0; no emit or application compiler changes.

Original18:29:00.889Z rehearsal receipt confirms all proposal assertions reached,
then explicit rollback sentinel, committed=false and exact original/dependent/full
state restoration. Original/readback full-state digest is identical:
`c5a9ef7556f094a8d1ea95e20130f81539af3bc0044bef7a4651686acf0fc7df`.
Proposal has8unique recipes and4/2/2; its UUID is transaction-local, not an actual
replacement. Unrelated/schema9/security/history equality holds. Independently
rehashed the3980byte private backup to its recorded hash and verified0600file/
0700directory modes. Committed preparation accurately distinguishes rehearsal
from pending persistent execution.

## Execution boundary

This approval covers only the exact reviewed temporary helper under the existing
one-operation owner scope. Before commit root must create the matching private
review binding and refresh deployment/expiry; the helper rechecks target/content,
current admission/pools and safety invariants under lock. No broader schema,
grant, deployment, provider, identity, other-plan or restoration authority follows.
Actual commit result, independent read-only verification and cleanup still need
separate evidence and final review; no replacement is declared complete here.

Committed authority verification and `git diff --check` passed. Staged secret scan
before this review commit:0findings. This review performed no persistent or
rollback-only database effect and did not create the private commit receipt.
