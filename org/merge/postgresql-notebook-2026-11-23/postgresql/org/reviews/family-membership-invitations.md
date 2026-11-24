# Family invitation and isolation checkpoint

Date: 2026-11-23. Approved plan tasks 9–12, with UI runtime QA still pending.

Real HTTP red evidence before implementation:

- Creation returned 404 rather than 201 (`/tmp/family-invitation-red.txt`).
- Public context returned 401 rather than 204 and verified unlisted acceptance
  returned 404 rather than 200 (`/tmp/family-acceptance-red.txt`).
- Cross-family management assertions passed but missing `/family` returned 404
  (`/tmp/family-management-red.txt`).
- Expired pending admission returned 401 instead of the approved uniform 409
  unavailable result (`/tmp/family-expired-acceptance-red.txt`). Exact POST
  acceptance now permits only a cryptographic identity to reach its transaction;
  current eligibility, recipient, secret, status and membership are all rechecked
  under the lock before effects. It is not public and grants no member access.

After implementation: `pnpm run test:family` passes 20/20 and
`pnpm run test:auth` passes 11/11. Strict typecheck, lint and production build pass.
The matrix exercises hash-only recipient-bound creation, seven-day expiry,
current-family ownership, JSON/Origin bounds, 10/hour and 20-active limits,
unlisted recipient onboarding/acceptance, independent durable grant on later
login, wrong recipient/forged token/existing-member denial, revoked/expired
eligibility with successful cookie-clearing logout, real insert rollback,
completed retry, two-process acceptance and provisioning, fresh verified-email
changes/collisions, stale-cookie non-rewrite, and foreign-list/revoke isolation.

A fourth rapid OAuth initiation in one test correctly hit Better Auth's existing
429 rate limit. The collision scenario uses a second real server against the same
DB to keep that limiter active rather than disabling it or delaying production
rules. Both the focused collision test and full unchanged limiter suite pass.

Independent security review found static-path misconfiguration exposure. Added
regressions failed first, then passed for public/.next/legacy static roots,
physical parent aliases and dangling final symlinks. Validation now walks with
lstat and rejects unresolvable links. Independent security recheck confirmed
storage5/5 and resolution. Only test-owned temporary symlinks were created; no
public database was created or exposed.

The known development StrictMode fragment replay issue is queued for real-browser
reproduction and fix in task13; do not treat this checkpoint as final feature
approval. Final browser, independent review, docs and full verification remain.
