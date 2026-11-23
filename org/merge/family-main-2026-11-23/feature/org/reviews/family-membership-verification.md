# Family membership implementation verification

Date: 2026-11-23. Implementation owner: senior-developer. Approved intent,
specification, plan and reviewed storage compatibility amendment are under
`intent/family-membership/`. Original human approvals and the scoped amendment
records remain in the ledger. Human merge/release authorization remains separate.

## Implemented behavior

Google-verified subject, not the ephemeral stateless user ID, keys durable
application membership. Every application user has exactly one non-null family.
Invited recipients join the existing inviting family through explicit acceptance;
existing members cannot accept a new invitation, including one-person families.
Only eligible users without invitations/context auto-provision via a guarded POST.
GET/HEAD, rendering, proxy and session reads do not create or consume membership.

Recipient-bound invitations can authorize Google accounts outside the code Gmail
allowlist. Pending access is onboarding-only; acceptance atomically creates the
member, independent durable access grant and accepted invitation state. Mere
membership cannot bypass removal from the allowlist for allowlist-only users.
Malformed policy/storage fails closed, while an intentionally empty list still
permits valid pending invitees and accepted grants. Email normalization preserves
dots/plus/aliases; fresh verified callback metadata can update an existing subject,
but older valid cookies cannot rewrite it or merge users.

Family pages and APIs derive current family context on the server. Invitation
creation/revocation rechecks that ownership transactionally, enforcing limits and
generic foreign-ID responses. Token links use fragments, HttpOnly context cookies
and SHA-256 storage; plaintext is returned only at creation. The home page still
contains only the Meal Planner heading. No recipe/meal CRUD or family switching,
production migration, deployment, merge or release was performed.

## Verification results

All commands below completed against the final application source, with the
production build regenerated after development-browser QA cleanup.

| Command | Actual result |
| --- | --- |
| `pnpm install --frozen-lockfile` | exit 0; lockfile up to date, no dependency mutation |
| `pnpm run typecheck` | route generation and strict TypeScript pass, exit 0 |
| `pnpm run lint` | 0 errors/warnings, exit 0 |
| `pnpm run build` | optimized production build complete, exit 0; `/invite` dynamically rendered |
| `pnpm run test:auth` | 11 passed, 0 failed, exit 0 |
| `pnpm run test:family` | 26 passed, 0 failed, exit 0 |
| `python3 -m unittest discover -s tests` | 7 tests, OK, exit 0 |
| `node --import tsx tests/family/browser.ts` | production family flow and dev StrictMode flow pass, exit 0 |
| `node --import tsx tests/auth/browser.ts` | preserved authentication browser checks pass at 320/1440, exit 0 |
| `pnpm audit --json` | 0 high/critical; one inherited moderate advisory, command exit 1 |

The audit is the known esbuild <=0.24.2 `serve` advisory through Drizzle Kit's
old development loader. The application does not use its serve API; no new
advisory was introduced. Keep the prior 2026-12-07 reassessment date. No forced
upgrade, lifecycle-policy relaxation, compiler exclusion, diagnostic suppression,
vendor patch, fake-user bypass or production fixture import was introduced.

Final staged secret/manifest/diff checks and committed gate verification are
recorded with the QA commit/handoff; independent final code/security verdicts
are separate records, not self-approval by the implementation owner.

## Meaningful database and HTTP proof

The permanent TypeScript suite covers real native constraints/migrations and
built Next handlers with library-issued cookies, separate cookie jars and signed
Google transport fixtures. It proves:

- No-write first-login reads and exact-one-family provisioning; repeated requests
  and two real application processes for one subject create no duplicates.
- Transactional invite creation racing provisioning yields exactly one permitted
  outcome. Separate processes cannot create duplicate active recipient invites.
- Two processes accept the same invitation once; exact completed retry is harmless.
  Recipient/token/status/expiry checks, wrong identity, forged tokens and a matching
  already-member recipient all deny without changing existing family membership.
- Actual SQLite triggers abort user insertion and roll back the preceding family
  insertion or invite consumption. A real held write lock reaches the 5-second
  busy timeout, returns generic 503 and leaves no partial family.
- Expired/revoked onboarding access cannot retrieve member data, but valid
  cryptographic sessions can still use guarded logout and clear all cookie chunks
  and invitation context. Exact POST acceptance returns a uniform unavailable
  result while still checking current admission inside its immediate transaction.
- Empty-list pending/granted policy, malformed configuration, allowlist-only
  removal, fresh verified email changes/collisions and stale-cookie non-rewrite.
- Two-family list/revoke isolation, forged ownership-field rejection, JSON size,
  Origin/CSRF and method boundaries, 10/hour and 20-active family limits.
- A consistent native backup restores accepted invitation grants into a fresh
  private path across complete server shutdown and new verified Google login.
- Migration history tampering, dropped schema indexes, absent/unmigrated storage,
  failed DDL+ledger rollback and rejection of Next-served/aliased database paths.

Native and actual Better Auth encrypted-field compatibility were independently
prototyped before integrating them. See `family-membership-foundation.md` and the
reviewed `storage-compatibility.md`: the shipped full ORM declarations fail strict
checking, so the approved implementation uses native typed bound queries and only
the public Drizzle migration-file loader. SQL/journal/snapshot remain reviewed;
no unchecked executable schema duplicate or generation command remains.

## Browser evidence and fixes

The isolated Chrome helper uses a new temporary profile and localhost-only test
servers. It never reads authentication cookies/localStorage through page JS or
uses the user's logged-in browser. Provider interception exists only in the test
process/browser transport; it is not production authentication bypass code.

The family browser test exercises real Google buttons, automatic POST setup,
actual form creation and keyboard Copy feedback, copied fragment handling,
unlisted verified recipient onboarding, visible keyboard Join focus and Enter,
shared-family membership, creation/revocation and logout. Production console and
network errors are empty, and document width fits at both 320 and 1440 pixels.
Auth QA independently checks title/lang, sign-in keyboard focus, exactly one
home heading, logout and the Google-button flow.

Success screenshots, all visually inspected by the orchestrator:

- `family-membership-management-320.png`, `family-membership-management-1440.png`
- `family-membership-join-320.png`, `family-membership-join-1440.png`
- `family-membership-joined-320.png`, `family-membership-joined-1440.png`
- `family-membership-dev-context.png`
- `family-membership-auth-sign-in-320.png`, `family-membership-auth-sign-in-1440.png`
- `family-membership-auth-home-320.png`, `family-membership-auth-home-1440.png`

Historical authenticated-access screenshots were preserved. Screenshots contain
only isolated test-flow data; the one-time link belongs to a removed temporary DB.

The initial dev regression timed out with the invitation shell still opening
(`/tmp/family-dev-context-red.txt`, failure screenshot retained separately).
A captured-token ref preserves the fragment across React's setup/cleanup replay.
Further real diagnostics showed two successful context 204s and a fetched sign-in
page but a stalled client navigation: Next patches `history.replaceState` to
restore its router state. The fragment-only cleanup now calls the public native
History prototype with existing state, avoiding an unnecessary framework restore;
no SDK private keys are touched. The identical real dev test subsequently passes.
The public shell is also forced dynamic as required by Next's per-request nonce
CSP guide; no script policy was weakened. See official
[React effects](https://react.dev/reference/react/useEffect),
[refs](https://react.dev/reference/react/useRef), and
[Next CSP](https://nextjs.org/docs/app/guides/content-security-policy), cross-checked
with the installed Next 16.4.6 guides and app-router history implementation.

Development QA exposed a generated-output issue: Next retains both `.next/types`
and `.next/dev/types`, whose duplicate global LayoutProps conflicts under the
unchanged strict include rules. After stopping only the owned QA dev server, moved
only its inactive generated `.next/dev/types` to a temporary backup; `next typegen`
restored normal production next-env imports. Source/tests/compiler checks were
unchanged, no generated next-env diff remains, and all final production checks
pass after cleanup. Do this mode cleanup before later production checks following
an isolated dev QA run; never delete or edit application/test declarations.

## Scope and external checks

SQLite needs one durable local host and private storage/backup permissions; no
serverless/shared-network database deployment was configured. Credentials and the
real Google consent screen remain environment-owned. Mocked-provider success does
not prove a live Google credential/consent round trip, and none is claimed.
Sessions retain the approved one-hour no-refresh limit; logout cannot revoke a
previously copied cookie before expiry. README describes explicit migration,
consistent backup/restore, retention and required future family-owned data guards.
