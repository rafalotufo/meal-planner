---
artifact: implementation
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
commit: 1de139d2068b22f474883ab9e95e9ad20fb3e03f
---

# Independent family-membership code review

## Verdict

Approved at `1de139d2068b22f474883ab9e95e9ad20fb3e03f`. No unresolved blocking
correctness, security or specification-compliance finding remains. The change
implements the accepted family rules and approved design/plan, including the
independently reviewed storage compatibility and exact acceptance-route guard
clarifications. This is code-review approval, not human merge, production
migration or release authorization.

## Findings resolved

- The development invitation-fragment effect replay issue from the interim
  checkpoint is fixed in `app/invite/invite-context.tsx:6`: a ref retains the
  original token across effect replay. Fragment removal preserves existing
  history state and does not invoke Next's route-restoration wrapper. The
  data-free shell is dynamically rendered for per-request nonce CSP. The
  implementation owner's real dev/prod browser proof records the original
  failure and passing regression without weakening script policy.
- Exact POST acceptance now passes cryptographic identity through proxy and
  handler while `lib/invitations.ts:32` rechecks current admission and bound
  invitation state under the immediate transaction. The expiry/revocation
  uniform-denial regression now independently passes; this exception grants
  neither membership nor access to family data by itself.
- Native database path validation rejects public, `.next`, legacy static and
  symlink aliases before opening/creating storage. The known security-review
  checkpoint concern is addressed in current code and permanent regressions;
  final security verdict remains the independent security role's record.

## Review evidence

- **Identity and eligibility:** reviewed verified Google-subject mapping and
  cached-field retention, strict provider verification, exact route/body
  allowlists, `lib/identity-access.ts:27` and shared session guards. A pending
  recipient gets onboarding only; an accepted grant is durable; membership
  alone never bypasses current allowlist eligibility. Fresh verified callbacks
  alone update existing subject metadata; older cookie reads do not write it.
- **Membership and authorization:** reviewed provisioning, family reads and
  invitation creation/acceptance/revocation. `lib/invitations.ts:18`, `:31` and
  `:45` use short immediate transactions and server-owned family context.
  External values use prepared bindings. Existing-member rejection, recipient
  plus token binding, atomic grant/consumption, exact retry, deadlines, limits
  and generic foreign-ID errors are implemented at server boundaries.
- **Persistence:** reviewed SQL constraints, native connection/schema/history
  validation and explicit migrator against the approved amendment. Runtime
  opening checks full ordered migration history and expected schema; only the
  explicit migration operation applies trusted SQL. No runtime ORM type escape,
  relaxed strict check, extra database engine or fake-user bypass was added.
- **Tests and verification:** independently reran the final built-server suites
  in the orchestrator's stable window: `pnpm run test:auth` — 11 passed, 0 failed,
  exit 0; `pnpm run test:family` — 26 passed, 0 failed, exit 0. These include real
  HTTP/JWE, independent cookie jars, temporary migrated SQLite files, two-process
  races, actual lock timeout, rollback, backup/restore/restart and cross-family
  denial. Independently ran final native/policy tests — 7 passed, exit 0.
- **Test meaningfulness:** the interim temporary-copy mutation changed member
  admission to permit membership without grant/allowlist. The existing copied
  identity test failed at `membership alone grants no eligibility`; the
  unchanged repository test passed. No production or repository test file was
  edited, removed or suppressed for that experiment.
- **UI and operations:** inspected the final UI/helper delta and recorded real
  Chrome evidence in `family-membership-verification.md`. Independently viewed
  the 320-pixel management and 1440-pixel join screenshots: readable controls,
  contained layout and visible Copy focus. The orchestrator inspected all eleven
  success screenshots; the implementation owner exercised keyboard Copy/Join,
  invitation acceptance, shared membership, revoke and logout in real Chrome.
  README documents private durable storage, explicit migration, backup/restore,
  retention and future family-owned data authorization. Home remains heading-only.
- **Scope and dependencies:** inspected exact approved native driver/types and
  lockfile delta; existing versions and narrow lifecycle policy are preserved.
  Independently used the actual plan manifest parser and `fnmatch`: 114 changed
  paths against 46 manifest entries yielded zero unlisted implementation paths.
  `git diff --check` passed. No recipe/meal implementation, family switching,
  unrelated refactor or speculative infrastructure was introduced.

## Limits and remaining human gates

The implementation verification record and orchestrator's final acceptance turn
report frozen install, strict typecheck, lint, production build and Python tests
passing. This reviewer did not repeat builds or browser sessions while other
roles owned them; independent runtime results above are stated separately.
The inherited moderate development esbuild advisory remains tracked for
2026-12-07; no new high/critical finding is reported. SQLite still requires the
approved one-host durable volume. Mocked-provider proof does not establish live
Google credentials/consent configuration, and no live round trip is claimed.

Only review records and disposable temporary mutation copies were written by
this reviewer. No application source, dependency, test, workflow state, message
or gate ledger was changed. Human merge/release approval and production
migration authorization remain outstanding and were not inferred here.
