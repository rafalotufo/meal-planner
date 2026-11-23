# Vercel deployment — Design verification

Date: 2026-11-23. Documentation/workflow changes only; no application code,
dependency pins, lockfile, hosting configuration or credentials changed.

## Actual command results

| Command | Result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Exit 0; lockfile unchanged, pnpm 10.33.0, Node v24.15.0 |
| `python3 -m unittest discover -s tests` | Exit 0; 7 passed |
| `pnpm test` | Exit 0, captured by architect turn in org/loop/history.jsonl |
| `pnpm run lint` | Exit 0, same turn |
| `pnpm run typecheck` | Exit 0, same turn |
| `pnpm run build` | Exit 0, same turn |
| `pnpm run test:auth` | Exit 0; 12 passed, 0 failed |
| `python3 scripts/org_loop.py check` | 0 violations |
| `python3 scripts/workflow_state.py check` | Consistent, 6 nodes / 36 ledger records |
| `python3 scripts/gate_ledger.py verify --record intent-vercel-deployment-001` | Exit 0; human intent decision verified |
| Targeted secret scan of new intent/spec/reviews | 0 findings |
| `git diff --check` | Exit 0 |

Initial loop acceptance lacked node_modules, so application commands failed as
recorded in turn 1. Reproducible installation resolved this, and all configured
acceptance commands passed in turn 2. Sandbox registry DNS and local HTTP listen
restrictions required approved escalated execution for install/auth tests.
No checks were suppressed. Auth tests used their existing test-process fixture;
they are not evidence of live Google consent.

## Design review and gate

Independent reviewer found two Majors in round 1: missing Vercel cancellation
opt-in and incorrect candidate-origin smoke expectations. Both were fixed;
round 2 reports zero findings, READY FOR HUMAN REVIEW. The reviewer also
confirmed the subsequent existing-OpenAI-limits owner decision adds no finding.

Archived prior recipe-photo loop state/history/config/graph before selecting
the new feature. Human intent acceptance was appended to the hash-chained
ledger; the active graph points to vercel-deployment artifacts. No spec approval
was recorded. `org_loop.py next --json` stops with `gate_required` and
`spec requires product_owner_approve`.

No UI changed, so no new browser evidence is claimed for Design. Hosted OAuth,
provider/source transport, cancellation/deadline and mobile/desktop UI checks
are specified for Build/release. No Vercel account/project was inspected or
created, no environment was configured and nothing was deployed.
