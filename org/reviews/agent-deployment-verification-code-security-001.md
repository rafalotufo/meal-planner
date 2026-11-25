# Agent deployment verification — independent code/security review 001

- Reviewer: security-researcher; date: 2026-11-25
- Source: `e7f1d08..f0db7c6`, including seed/cleanup `d71806a` and logout correction `f0db7c6`.
- Verdict: Approved for local delivery and human merge consideration; no unresolved security findings.
- Scope: approved spec/plan, actual application/operator/SQL/evidence changes.
  No hosted, paid-provider or real-Google operations were performed.

## Findings and resolution

**[P2, Security/Bugs] Conflicting Google cookies must not defeat opaque-session
logout revocation.** At reviewed `d71806a`,
`app/api/auth/[...all]/route.ts:50–54` used the strict admission parser during
logout. Its intentional Google-cookie conflict rejection lost the otherwise
unambiguous verification token, skipped DB revocation and returned successful
cookie clearing. A copied opaque cookie could remain usable. Recorded as
`org/messages/security-researcher-0035.md`.

Correction `f0db7c6` adds `verificationLogoutCookie`, which extracts exactly
one well-formed opaque credential solely for targeted logout revocation. The
strict admission parser still rejects Google/verification conflicts and duplicate
opaque cookies. Unit proof passes. The implementer ran `tests/verification/logout.test.ts`
against a fresh compiled Preview fixture: session200, conflicted session401,
logout200, copied-cookie session401 and one persistent revocation row; exit0,
one test passed. I reviewed that regression and the exact committed correction.
This resolves the finding without granting admission through logout.

**[P2, Compliance/Bugs] Cleanup must reject cross-family plan rows in both
directions.** Earlier operator code rejected synthetic-member actions on foreign
plans but could delete a foreign member's approval/suggestion on a synthetic plan.
`d71806a` fixes the ownership predicate in `lib/verification/operator.ts:52` to
check both directions before destructive work. The regression at
`tests/verification/operator.test.ts:29–35` rejects the corrupt cross-family row,
then proves targeted cleanup preserves the unrelated run. Independently passed.
No unresolved issue remains for that correction.

## Reviewed security boundaries

- `target.ts:18–30` requires enabled immutable Preview policy plus current trusted
  target/project/source/profile/origin/database metadata. Production target or
  missing/drifted values deny. No hosted-selectable TEST flag or application import
  of provider/platform fixtures was added. CLI records remain operator attestations
  of independent inspection, not platform signatures; trusted administrators are
  explicitly outside the stolen-run-credential/config-mistake threat boundary.
- `proxy.ts:23–25,44–58` generates a signed nonce only for exact enabled GET/HEAD
  entry, overwrites inbound nonce headers, sets the matching HttpOnly cookie and
  narrowly selects same-origin Referrer-Policy. POST still requires exact Origin;
  Origin:null is not accepted. Entry form carries no capability in URL or props.
- `http.ts:26–44` independently guards the exact Proxy-exempt API's target, Host,
  method, Origin/nonce, input bounds, shared throttles and security headers.
  Request-owned read-only catalog validation, pool acquisition, body parsing and
  exchange use the same absolute deadline. Deadline work destroys expired clients,
  prevents delayed queries and bounds storage; no response-only race or retry
  guarantee is inferred. A lost COMMIT response remains explicitly ambiguous.
- `store.ts:10–25,36–49`, shared session and menu readers independently bind the
  raw opaque digest to current session/run/member/family and target. Malformed
  global Google lists deny synthetic admission too. Google keeps its JWE/current
  token/subject/email checks, including conflict detection for chunked cookies.
  Store mutation decisions recheck membership under the common transaction lock.
- Family/invitation/menu/plan stores deny synthetic provisioning, invitations,
  URL-curation delegation and plan finalize/resolve. Snapshot and approve/suggest
  effects derive family IDs server-side. Global generation explicitly excludes
  verification families. Live run scopes are the reviewed app/collaboration modes;
  paid-provider budgets and authorization remain separately scoped.
- Initial SQL and additive `557e80b6` preserve immutable initial migration identity,
  historical rows and Google branch rules. Runtime setup grants are restricted;
  exact catalog/ACL validation remains intact. The additive predicate correction
  has a real dump/restore preservation regression. The rollback helper is test-only,
  requires the owned random database/test role, empty verification tables and exact
  native descriptors, and is not application or operator rollback authority.
- Issuer refuses Production/unrecorded DB targets and enforces remote verified TLS.
  Capabilities use private exclusive owner-only files; outputs/errors are sanitized.
  Optional seed is fixed reviewed data, separately opted-in before DB connection,
  no images/provider work. Cleanup revokes before proving destructive ownership.
  Browser-tool trace privacy and remote-agent transfer remain operational gates.
- Synthetic evidence has its own strict target/run/member/browser proof class and
  never sets Google flags or release acceptance; the old Google checker rejects
  opaque verification cookies. Missing browsers/providers/ingress remain gaps.

## Independently executed evidence

- Cookie/deadline/HTTP/identity/store-integration/session/target focused command:
  15 passed, exit0 (before the additional logout helper unit was added).
- Operator/CLI/migration focused command:9 passed, exit0, including fixed seed,
  both-direction cleanup rejection and additive migration dump/restore.
- Staging evidence plus current cookie helper command:22 passed, exit0.
- `git diff --check`: exit0.
- Implementer-reported compiled conflicted-logout regression:1 passed, exit0;
  source/test independently inspected as described above.

Database tests used owned restricted-role random local fixtures and cleaned up.
Full compiled application suites and browser evidence remain the root delivery
verification record; hosted readiness is not inferred from these focused runs.
Code/security approval does not authorize merge,
hosted migration/configuration/data, deployment, paid requests or release.
