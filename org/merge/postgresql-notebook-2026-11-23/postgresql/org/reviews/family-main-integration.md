# Family feature — local main integration

Date: 2026-11-23. User requested updating this feature from local main and moving
PostgreSQL work into a separate chat/worktree. No PostgreSQL implementation,
installation/service start, cloud provisioning, live provider call or deployment
occurred here.

## Sources and resolutions

- Feature parent: `5eaff43d0aa8d652ee505b9bae1012799060169e`.
- Imported main: `766a7925b9489ea9bfda97355f3c2f9c7d99ca67` (still local main at final check).
- Common base: `305b14aa6a31c35f22f2b428484362d93e12dbae`.
- Direction: main into `codex/family-membership-intent`, not feature into main.

Kept main's recipe/photo UI, provider and safe metadata transport, Node24.x,
Vercel duration/cancellation/manual-release configuration, exact dependencies and
worktree inclusion. Kept all family identity/membership/invitation/storage rules.
Home and search handler now independently require current family context before
render/provider effects. Pending onboarding cannot search. Approved main UI
supersedes the old blank-heading display criterion; strict auth assertions remain.

Resolved documentation/env/home, package/lock, browser and audit conflicts.
Generated the combined lockfile with pinned pnpm, preserving narrow script policy.
Added private SQLite/WAL/SHM/backup exclusions to `.vercelignore` after independent
review. Test server provider keys are explicitly empty; browser recipe/photo and
Google responses are isolated fixtures, never paid/live calls.

Audit provenance: `org/merge/family-main-2026-11-23/README.md` and manifest preserve
129 exact source files/hashes, both original ledgers/memory/loop namespaces and
message collisions. Main's canonical ledger/memory byte prefixes remain intact;
five sourced family-approval imports and fresh memory/message IDs carry actual
prior decisions, never invented approvals. Both archived ledgers and canonical
chain verify. Completed family loop config/history/state remain byte-exact;
combined integration checks are separate, with no reset/fabricated turn. Active
family implementation remains in_review, release not_started. Imported production
release records do not authorize deploying this feature.

## Actual verification

| Command | Result |
| --- | --- |
| `pnpm install --lockfile-only --ignore-scripts` | exit 0, pnpm-generated combined graph |
| `pnpm install --frozen-lockfile` | exit 0 |
| `pnpm run typecheck` | strict compile/typegen exit 0 |
| `pnpm run lint` | zero warnings/errors, exit 0 |
| `pnpm run build` | optimized production build exit 0 |
| `pnpm test` | recipe/photo 57 passed, 0 failed |
| `pnpm run test:auth` | 12 passed, 0 failed |
| `pnpm run test:family` | 27 passed, 0 failed |
| `node --import tsx --test tests/deployment/smoke.test.ts` | 12 passed, 0 failed |
| `python3 -m unittest discover -s tests` | 7 tests OK |
| `node --import tsx tests/auth/browser.ts` | isolated Chrome 320/1440 recipe/image/auth/focus/logout pass |
| `node --import tsx tests/family/browser.ts` | isolated Chrome family flow 320/1440 and dev StrictMode pass |
| `pnpm audit --json` | no high/critical; one inherited moderate esbuild advisory (exit 1) |

108 Node tests and 7 Python tests pass. The new integration test covers provision-
pending and invited-pending recipe denial, spoofed middleware headers, retained
recipe UI after provisioning, member-only real input validation and controlled
unconfigured-provider response. A test-only URL assertion initially omitted the
base for a valid relative Location; corrected it without changing the destination
or guard. No production behavior/test bar was weakened.

New `family-main-integration-*` screenshots preserve all historical images. Root
visually inspected integrated recipe/photo results at 320/1440: approved cards,
contained layout, no visible overflow. All fixture browser runs reported zero
application errors. After stopping only the owned QA dev server, moved inactive
generated `.next/dev/types` to a task temporary backup and regenerated production
types; no tracked next-env or compiler-configuration change remains.

Independent approval: `family-main-integration-review.md`, limited to this local
main-to-feature merge. Final staging runs secret/manifest/diff/org checks; source
archives and prior approvals remain independently verifiable.

## Remaining release blocker

Family persistence is still the native local SQLite adapter requiring a durable
private file. Vercel Functions cannot provide that storage by setting DATABASE_PATH
or using /tmp. This integration is not Vercel-ready. Hosted PostgreSQL and local
setup belong to the explicitly requested separate chat/worktree, based on this
committed integrated branch. Existing Vercel production is unchanged. Human
family-to-main, production migration and release gates remain closed.
