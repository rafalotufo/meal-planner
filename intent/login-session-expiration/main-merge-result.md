# Login session expiration — local main merge

- Date: 2026-11-25
- Owner instruction: “merge to main”
- Approval: `login-session-expiration-main-merge-20261125` in the gate ledger; `org/messages/ceo-0071.md`
- Previous local main: `4f25732`
- Reviewed feature source: `eaa5866`; runtime implementation: `851c255`
- Initial merge result: local main fast-forwarded to `187bf43` without conflicts.

Main and feature worktrees were clean before merging. Main had no new commits,
so the merge retained the exact independently reviewed and verified application
source. The subsequent completion commit changes only this receipt, workflow
status and sourced memory; it is also included in the authorized local merge.

Verification from the unchanged source remains applicable: lint, strict typecheck,
production build, 189 Node regressions, 7 Python tests and Chrome at390/1440 passed;
see `verification.md`. Merge checks passed: plan synchronization, gate-ledger
chain, org message/loop/memory checks, diff whitespace and staged secret scan.
No runtime retest was needed for this fast-forward with audit-only additions.

New Google sessions use a fixed30day deadline without renewal; existing issued
sessions retain their original signed expiry. No push, deployment, migration,
server restart, hosted mutation or release occurred. Release remains separately
gated; merging source alone does not change the running Production deployment.
