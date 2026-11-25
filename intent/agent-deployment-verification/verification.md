# Local verification and delivery — 2026-11-25

Application/test source verified: `5ab8906` (production correction through
`f0db7c6`). Later audit-only updates do not certify a hosted release SHA.
Node24.15.0 and pnpm10.33.0; frozen install completed434 locked packages.
No shared development or hosted migration/data change, real Google account,
paid provider request, push, merge, deployment or promotion was performed.

## Command evidence

Every command below exited0. Node suites reported no failures, skips or cancellations.

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` |434 locked packages, unchanged lockfile |
| `pnpm run lint` | zero warnings/errors |
| `pnpm run typecheck` | strict generated/application/test types pass |
| `OPENAI_API_KEY='' pnpm run build` | production compilation and metadata verification pass |
| `pnpm run test:family` |35 pass |
| `pnpm run test:menu` |69 pass |
| `pnpm run test:plans` |23 pass |
| `pnpm run test:auth` |16 pass; rerun after final logout fix |
| `pnpm test` |84 recipe/photo/runner cases pass |
| `pnpm run test:migrations` |36 pass |
| `node --import tsx --test tests/deployment/*.test.ts` |38 pass |
| `node --import tsx --test --test-concurrency=1 tests/verification/*.test.ts` |29 pass |
| `python3 -m unittest discover -s tests` |7 pass |

Total:330 Node tests plus7 Python workflow tests. Family/menu/plans/recipe/migration
checks completed on their relevant unchanged paths; the final build and auth/new
verification/deployment checks include the completed logout/parser/form changes.
All database cases used restricted-role owned random local databases and test
servers; paid keys were empty. The private PostgreSQL cluster was already running;
the sandbox initially hid its status. No restart or development migration occurred.

## Real-browser and runtime proof

- `node --import tsx tests/verification/browser.ts`: final-source real Chrome
 158.0.8127.88 at390px and1440px. Actual private handoff file, native form and
 server-set Secure cookie; home/menu/family/plans render, logout revokes the
 persisted session and protected navigation redirects. Zero Google/provider
 calls and zero console/network errors. Ten synthetic screenshots are in
 `org/reviews/agent-verification-*.png`; entry images were captured with empty inputs.
- Existing `tests/menu/browser.ts` and `tests/plans/browser.ts` both exit0. Menu
 save/remove/retry/paging/focus and weekly approve/swap/history/retained-picker
 regression assertions pass on real Chrome at mobile and desktop sizes.
 Historical screenshot records overwritten by the existing menu helper were
 restored; current captures were retained separately in an owned temporary backup.
- The real Proxy-inclusive Next transport returns408 for unfinished valid-looking
 and unknown-run request bodies without EOF, within measured tolerance, with
 no consumed capability/session left behind. Simulated Production rejects copied
 enabled Preview settings without nonce/session issuance.
- Stripped-runtime packaging removes app/lib/scripts/tests/types/drizzle and
 proxy source only from the owned build copy; real form, exchange, authenticated
 home/API and logout continue working. The historical auth-route-only red proof
 left the copied cookie200 after conflicted logout; current code returns401 and
 persists revocation. No live source or historical migration was rewritten.
- Native browser testing exposed `Origin: null` under the prior no-referrer policy.
 Only the enabled exact verification GET/HEAD entry now uses same-origin policy;
 POST still requires the exact canonical Origin and all other responses retain
 no-referrer. The actual browser now sends the canonical Origin.

Browser limits: Firefox is not installed. Safari27.0.1 (22625.1.29.11.28) is
installed, but a bounded isolated WebDriver probe returned500/session-not-created
because Allow remote automation is disabled. No Safari setting was changed and
no Safari application-flow success is claimed. These are explicit coverage gaps.

## Independent review and operational handoff

- `org/reviews/agent-deployment-verification-code-security-001.md`: approved;
 cleanup ownership and conflicted-cookie logout findings resolved.
- `org/reviews/agent-deployment-verification-code-001.md`: no blockers; independent
 focused tests and an isolated-copy guard-removal mutation probe passed.
- Original verification migration
 `fe5c2ee0-bf7f-464e-93be-2d654b4001e8` and all historical SQL/ledger bindings remain
 immutable. Additive correction `557e80b6-f30b-452e-b563-12cff07158a5` makes the
 equivalent origin check stable across actual PostgreSQL dump/restore.
- This branch requires both new native migrations and their reviewed grants even
 when verification is disabled. Existing hosted schemas were not changed and are
 not ready for this artifact. Older artifacts must not be assumed compatible
 rollback targets after a separately approved migration.
- Hosted readiness still requires exact-source staging authority, schema/grants,
 private operator issuance/transfer and optional fixed fixture scope, scoped
 platform-link/canonical-origin behavior, provider budget and cleanup approval.
 Remote transfer and hosted ingress have not been certified. Synthetic checks
 do not prove real Google OAuth, live provider success or release acceptance.
- Operator usage is documented in README. Optional `--seed-fixture` requires
 explicit inspection-record permission and creates only the reviewed v1 data in
 the new verification household. Empty setup remains the default.

Local implementation is ready for human merge review. No release authority is
implied by this result. Final staged secret/plan-sync/whitespace and org/graph
consistency checks are recorded with the delivery audit commit.
