# Local main merge and adoption result

- Date:2026-11-24; operator:orchestrator.
- Authority: owner “Approved” after the proposed local main merge and subsequent
  local rebuild/restart. No hosted, migration, push or deployment authority.
- Reviewed combined application source:`49e2a64625d97adee760e44847ad445ea2b8f3d8`.
- Source review:`org/reviews/dependency-aware-migrations-main-source-001.md`.

## Completed local operation

Both checkouts were clean and main was still pinned
`d26ea59742f904f399128477bfeb369a0049ba62`. Source comparisons again confirmed
the reviewed database implementation and main's T-Rex changes were preserved.
Local main fast-forwarded to `fdd6c6b8d18e6fee58b10a7828f46b1a60835dc6`, which
contains the combined source plus its independent reviews and audit records.
There was no reset, forced update, conflict resolution or unrelated work removal.

Main's shell selected an old Node22 installation with a missing ICU library.
Commands explicitly used the installed Node24.15.0 and pnpm10.33.0; no global
Node/Homebrew configuration was changed. Main's exact frozen dependency install
and production build both exited0; the lockfile stayed unchanged. There was no
running Next.js app or Node listener at intake, so no existing process was killed.

A detached Next16.4.6 production-mode server was started from
`/Users/rafael/projects/meal-planner` using Node24.15.0, at
`http://localhost:3000`, bound only to127.0.0.1. PID98550 and its exact working
directory/listener were verified. Build ID:`6lO7uv4trz0a9tcx599Qt`.
The app uses its existing private native runtime configuration. No fixture
preload was present, migration/test credentials were blank in the launched
process, and no paid provider request was sent. Private process/log metadata
remain ignored and owner-only in this feature worktree's `.data/`.

## Observed health and database preservation

Actual anonymous requests passed:

| Path | Status/behavior |
| --- | --- |
| `/` |307 to `/sign-in` |
| `/sign-in` |200, real Google sign-in control rendered |
| `/api/session` |401, no-store and generic error |
| `/api/menu` |401, no-store and generic error |
| `/menu` |307 to `/sign-in` |

Fresh real Chrome without interception or fixture setup followed the actual
local root redirect, verified the Google sign-in control, and captured390/1440
screenshots with no overflow or console/network errors. Manual inspection
confirmed readable layouts and responsive shared navigation. No sign-in button
was clicked and no real Google login is claimed. Authenticated operations were
verified through the combined disposable browser/regression suites, separately
from this anonymous live-local health check.

The private target was checked before and after adoption using bounded read-only
transactions and the strict runtime validator: native loopback `mp_runtime`,
`meal_planner_dev`, all five legacy migrations, compatible schema/security.
The history/catalog/native-ledger snapshot matched byte-for-byte before/after,
SHA256:`86c04604798d247bef5abb4d11310f12f8239d86afdf242e2a245d86fb9ee740`.
No migration, provisioning, schema/grant change or mutation request was performed.

Two new local sign-in screenshots, a sanitized health JSON and their separate
image digest manifest are under
`org/reviews/dependency-aware-migrations-main-browser/`. The existing40-image
combined-fixture manifest and historical review images are unchanged.

## Evidence and final gate

Combined source verification remains295 Node tests,7 Python tests, lint,
typecheck, build and both Chrome suites passing; see
`main-integration-verification.md`. Main additionally passed its own locked
install, build, process/listener checks, live-local health and database
preservation checks described above. Its tracked application/test/tooling tree
matches reviewed source49e2a646 exactly.

The final independent reviewer checks this operational record. Outcome/review
and workflow-only commits will also be fast-forwarded to local main; those
audit heads remain distinct from the fixed reviewed/built application source.
The local app is left running. No push, hosted database operation, deployment
or release occurred or is authorized by this result.
