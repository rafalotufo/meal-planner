# Authenticated access — verification evidence

## Baseline (before authentication implementation)

Date: 2026-11-23. Node v24.15.0; pnpm 10.33.0.

- `pnpm install --frozen-lockfile --store-dir /private/tmp/meal-planner-pnpm-store`: exit 0, 372 packages installed. Initial sandbox attempt failed DNS; approved network retry succeeded. Lockfile unchanged.
- `python3 -m unittest discover -s tests`: exit 0, 7 tests passed.
- Intent-turn `scripts/org_loop.py advance` executed all configured checks: Python tests, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`; each exit 0. Machine-readable results are in `org/loop/history.jsonl`.
- `git diff --check`: exit 0.
- `python3 scripts/org_message.py check`: 11 messages, 0 violations at capture.
- `python3 scripts/org_memory.py check` and `python3 scripts/org_loop.py check`: 0 violations.
- Intent capture staged secret scan: 0 findings.

These results establish the original application baseline only. Authentication runtime tests and browser evidence remain pending implementation.

## Workflow limits

The graph checker reports consistency. Its status display also warns about older approvals for reused gate names while new feature nodes are not started. Historical gate records are preserved; none is reused to approve this feature. New intent approval uses `intent-authenticated-access-001`.
