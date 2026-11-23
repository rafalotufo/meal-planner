# Family membership — design baseline

Date: 2026-11-23. No application source or dependency pins changed.

The first `org_loop.py advance` acceptance snapshot failed application checks
because this checkout had no `node_modules`. Reproduction: `pnpm run lint`
reported `sh: eslint: command not found` and `node_modules missing`. Restored
only the committed dependency graph using `pnpm install --frozen-lockfile`
with pnpm 10.33.0: 393 packages, exit 0; manifest and lockfile unchanged.
Sandbox DNS initially prevented downloads; the permitted retry succeeded.

Actual baseline rerun results:

| Command | Result |
| --- | --- |
| `python3 -m unittest discover -s tests` | 7 tests, OK, exit 0 |
| `pnpm run lint` | no warnings/errors, exit 0 |
| `pnpm run typecheck` | route types generated; strict compiler exit 0 |
| `pnpm run build` | optimized production build completed, exit 0 |
| `pnpm run test:auth` | 11 tests, 11 passed, 0 failed, exit 0 |

The auth suite initially failed with `listen EPERM` because the sandbox blocked
its isolated loopback servers. Re-running the unchanged suite with loopback
permission produced all 11 passing tests. No test or configuration weakened.

These results verify the existing application baseline, not the proposed family
feature. New UI/browser, database, invitation, and live Google behavior have not
been implemented or tested. Prior turn acceptance snapshots remain unchanged
as historical evidence; the next normal loop advance re-evaluates commands.
