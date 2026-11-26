# Plan recipe thumbnails — local verification

- Date: 2026-11-26
- Implementer: senior-developer
- Approved design/plan: `f06b361`; independent review `277aa47`
- Runtime: Node24.15.0, pnpm10.33.0, pinned Next16.4.6
- Scope: `app/plans/plan-controls.tsx`, `tests/plans/browser.ts`, this evidence
  and new feature screenshots. No schema, dependency, auth or hosted change.

## Red → green

Added primary-card assertions to the existing real Chrome harness before
application code. Built the unchanged application, then ran:

```text
node --import tsx tests/plans/browser.ts
AssertionError [ERR_ASSERTION]: every planned recipe reserves a thumbnail frame
0 !== 7
at primaryThumbnails (tests/plans/browser.ts:40:10)
exit 1
```

Added the small inline thumbnail component and rebuilt. The same full command
then exited0, including all existing picker/approval/swap/history assertions:

```text
Primary plan thumbnails: valid/null/404 snapshots,128px frames,
lazy/no-referrer/decorative images, accepted broken-to-valid and404 replacements,
draft/final/history320/1440 passed.
Chrome320/1440: seven dinners, labels/focus/no overflow, unique1/2/6/7 counts,
real approve/two-card suggest/accept/retain/duplicate409/reject/distinct/reset,
stale conflict refresh, paged menu, confirmation, immutable retained history passed.
```

The fixture replaces only its owned temporary plan snapshot with deterministic
saved-recipe identities/photo outcomes, independent of weekly selection hashing.
Real protected HTTP suggestions/acceptance prove broken→valid image recovery
at the same card slot and accepted404 fallback. The retained deduplicated history
still shows its persisted snapshot photos after corresponding menu rows are
deleted, with its raw legacy snapshot unchanged by rendering. All fixture DBs,
server and isolated browser/profile were cleaned up by the harness. Test servers
force paid provider keys empty. No production user or hosted session is involved.

## Command results

All commands exited0 on the final application source. No skips or failures in
the counted suites;308 Node tests and7 Python tests passed.

| Command | Actual result |
| --- | --- |
| `pnpm run lint` | `eslint . --max-warnings 0`, exit0 |
| `pnpm run typecheck` | route types generated; strict `tsc --noEmit`, exit0 |
| `pnpm run build` | production webpack build completed, exit0 |
| `pnpm test` | tests112, pass112, fail0, skipped0 |
| `pnpm run test:plans` | tests35, pass35, fail0, skipped0 |
| `pnpm run test:family` | tests35, pass35, fail0, skipped0 |
| `pnpm run test:menu` | tests69, pass69, fail0, skipped0 |
| `pnpm run test:auth` | tests16, pass16, fail0, skipped0 |
| `node --import tsx --test tests/deployment/*.test.ts` | tests41, pass41, fail0, skipped0 |
| `node --import tsx tests/plans/browser.ts` | full real Chrome harness passed |
| `python3 -m unittest discover -s tests` | Ran7 tests; OK |
| `git diff --check` | exit0 |

The architect already completed `pnpm install --frozen-lockfile` with435 exact
packages and unchanged lockfile. This worktree received only an owner-only
ignored local fixture configuration derived from the existing dedicated native
cluster credentials. The already-running cluster was reused; no development
schema/data or hosted resource was modified. The sandbox's process visibility
made an initial status check misleading; an attempted start refused the existing
postmaster lock and did not start a duplicate server.

## Visible UI evidence

Opened and visually inspected all six primary screenshots with `view_image`:

- `org/reviews/plan-recipe-thumbnails-draft-320.png`
- `org/reviews/plan-recipe-thumbnails-draft-1440.png`
- `org/reviews/plan-recipe-thumbnails-final-320.png`
- `org/reviews/plan-recipe-thumbnails-final-1440.png`
- `org/reviews/plan-recipe-thumbnails-history-320.png`
- `org/reviews/plan-recipe-thumbnails-history-1440.png`

The existing stone/emerald styling, card grid, heading and controls remain clear.
128px frames stay equal for valid, absent and404 photos. Cropped fixture art
uses `object-cover`; long titles wrap without overflow. Mobile single-column and
desktop four-column cards retain source links and applicable swap controls.
Images/fallback are decorative, with no focus stop; existing keyboard/focus
checks pass. The harness also emits new feature-prefixed picker, accepted-swap
and small-menu screenshots, preserving earlier scheduler evidence. Its existing
768/1024px picker geometry checks continue to pass with0px frame delta.

Only expected controlled401/403/404/409/503 resource errors are filtered by the
existing console assertion; no unexpected browser errors remained. Browser
assertions verify each current snapshot's direct image source, successful load
or fallback, lazy/no-referrer/empty-alt attributes, object-cover and128px frame.

This proves owned local UI/HTTP/storage behavior with intercepted image fixtures;
it does not certify external photo-host availability or hosted authentication.
Independent security/code reviews and human merge/release gates follow separately.

Staged secret scanning found0 findings. Plan-sync initially rejected the architect's
proposed status and unrecognized manifest heading. Corrected only spec/plan approval
metadata to cite the actual prior independent review and renamed the unchanged
manifest section to `Files that change`; no design or approved file scope changed.
