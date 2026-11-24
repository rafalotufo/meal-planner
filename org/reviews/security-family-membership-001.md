---
artifact: implementation
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: clear
round: 1
commit: 1de139d2068b22f474883ab9e95e9ad20fb3e03f
---

# Independent security review — family membership

## Verdict

Clear for the existing human merge gate at the reviewed implementation commit.
No unresolved blocking security finding was identified. This is an independent
security assessment, not merge, production migration, deployment or release
authorization. The inherited moderate dependency advisory remains documented
below; no high or critical dependency advisory was reported.

## Findings and resolved issue

The early storage-path finding is resolved. The initial validator could allow
the full multi-family database into a Next-served directory; its first fix also
missed a dangling final-file symlink and legacy `static/`. The final
`lib/db/connection.ts:7` uses `lstatSync` to preserve symlink presence and
`realpathSync` to fail closed on dangling links. `:25` rejects lexical and
physical paths under `public/`, all of `.next/`, and legacy `static/` before
opening/creating a database. Regression tests and independent rechecks cover
direct paths, parent aliases and the dangling-final-file case. The original
finding, reproduction and resolution remain in
`org/reviews/family-membership-security-checkpoint.md`.

No additional concrete blocking finding remained after the final source and
focused runtime assessment.

## Security boundaries reviewed

- **Verified identity and session admission:** `lib/auth.ts:45` retains the
  pinned Google token verifier before accepting subject, email and strict
  verified-email claims. The required additional subject survives encrypted
  library caching; caller identity/family fields and generic auth mutation
  endpoints are rejected by the exact handler policy. `lib/identity-access.ts:27`
  rechecks current storage and code policy, keeping invitation grants distinct
  from mere family membership. Empty policy does not erase valid invitation
  access; malformed policy fails closed. Fresh callback metadata updates are
  transactional; session reads cannot rewrite identity.
- **Family and invitation authorization:** `lib/invitations.ts:18` and `:31`
  recheck current membership/admission in immediate transactions. Creation
  derives its family from the current member; acceptance verifies token hash,
  recipient, status and expiry before inserting one membership/grant and
  consuming the invitation together. Existing membership is rejected except
  an exact previously completed acceptance for that same user/family.
  `lib/invitations.ts:47` scopes management IDs by family, and family-summary
  queries filter members/invitations by the server-derived family.
- **Authenticated denial and logout:** only exact POST acceptance and exact
  sign-out routes use cryptographic identity independently of admission in
  `proxy.ts`. The acceptance handler still enforces Origin/JSON controls and
  current admission inside its transaction; it is not a public exception or a
  family-data read bypass. Expired/revoked pending sessions receive the generic
  unavailable result and can clear their own session/context cookies. All
  member pages/APIs retain current admission and family guards.
- **Untrusted HTTP/browser inputs:** `lib/http.ts:5` validates canonical Origin,
  cross-site metadata, JSON shape and streamed 4096-byte limits. External SQL
  values use bound statements. Invitation secrets are 32 random bytes, stored
  only as SHA-256 hashes and shared in URL fragments; public context setting
  performs no invitation lookup. The fragment is stripped before navigation,
  its development replay ref does not log/expose it, and host-only HttpOnly
  context cookies are Secure on HTTPS. Application response allowlists exclude
  the Google subject, eligibility list and stored token hashes. The public shell
  is dynamic so per-request nonce CSP is preserved.
- **Persistence and operational safety:** explicit native migrations require
  ordered hash/timestamp history and roll back DDL/history together. Runtime
  opening verifies complete migration history and exact schema without
  persistent repair or provisioning on reads. Private-host storage/permissions,
  consistent backup/restore, retention and one-hour copied-cookie limits are
  documented. No external delivery service, new role hierarchy or production
  database operation was introduced.

Production source inspection found no test fixture import, fake-user switch,
new check suppression, relaxed strict compiler option or lifecycle-script policy.
The reviewed native-SQL compatibility amendment preserves stable dependencies,
schema/transaction behavior and the public Drizzle migration-file loader.

## Independent commands and actual results

After the orchestrator declared a stable production-build window:

```text
node --import tsx --test --test-name-pattern='verified unlisted invitee|expired pending admission|wrong recipient|revoked onboarding|matching recipient|two real families|creation limits|public invitation context' tests/family/acceptance.test.ts tests/family/isolation.test.ts tests/family/invitations.test.ts tests/family/context.test.ts
8 passed, 0 failed; exit 0

node --import tsx --test --test-name-pattern='provider, request-shape|Google signature/audience' tests/auth/oauth.test.ts
2 passed, 0 failed; exit 0

node --import tsx --test tests/family/storage.test.ts tests/family/identity.test.ts
7 passed, 0 failed; exit 0

python3 scripts/scan_secrets.py --base 305b14aa6a31c35f22f2b428484362d93e12dbae --head 1de139d
0 findings; exit 0

git diff --check
exit 0
```

The HTTP cases use built Next handlers, library-issued cookies, signed provider
transport fixtures, isolated servers and owned temporary databases. They cover
unlisted acceptance and later access, uniform expired/revoked denial with logout,
wrong identity/forged secret/existing-family rejection, cross-family isolation,
creation limits and mutation controls. The Google tests additionally reject
caller subject/family injection, invalid state, signatures, issuer, audience and
expired tokens. The pure native cases cover schema/history/path integrity and
the empty-list/grant distinction. No development or production database was used.

## Dependency audit

Independent `pnpm audit --json` returned exit 1 for one inherited moderate
[esbuild serve advisory](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99),
with **0 high and 0 critical** findings. `pnpm why esbuild` locates vulnerable
0.18.20 under Drizzle Kit's old ESM-loader dependency; Drizzle Kit is also
resolvable through Better Auth's peer graph. The relevant unsafe `serve` API
is not invoked by this application's selected runtime, tests or build commands.
No dependency changed after that audit. Retain the established **2026-12-07**
reassessment date; no forced upgrade or audit suppression was applied.

## Limits

The orchestrator separately recorded full frozen install, lint, strict
typecheck, build, auth11, family26, Python7 and browser results in
`family-membership-verification.md`; this reviewer ran the bounded independent
checks above rather than duplicating the full build/browser cycle. Browser
screenshots were visually checked by the orchestrator, not re-rendered here.
Provider fixtures do not prove a live Google credential/consent round trip;
none is claimed. Host permissions, durable deployment and backup operations
remain deployment-owned. Only this final review record was written in this
final assessment; no application, tests, dependencies, org state or gate changed.
