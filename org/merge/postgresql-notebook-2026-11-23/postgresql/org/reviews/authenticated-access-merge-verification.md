# Authenticated access — main merge verification

Date: 2026-11-23. Human approval: the owner explicitly requested `merge to main` in this chat. Gate record: `merge-authenticated-access-001`, committed in `d5f1583`, approves reviewed feature tip `e2e2c56`. Independent code/security reviews and the documented moderate esbuild disposition remain in their original records.

The clean main checkout fast-forwarded from `b2e3266` to `d5f1583` without conflicts. No source changes were introduced during integration. The source worktree's development-generated next-env.d.ts change and ignored OAuth configuration were not included in the merge.

## Verification on merged main

- Node v24.15.0; pnpm 10.33.0.
- `pnpm install --frozen-lockfile`: exit 0, 393 packages; lockfile unchanged.
- `python3 -m unittest discover -s tests`: exit 0, 7 tests, OK.
- `pnpm run lint`: exit 0, no warnings.
- `pnpm run typecheck`: exit 0, route types generated and strict TypeScript passed.
- `pnpm run build`: exit 0, Next Webpack production build passed.
- `pnpm run test:auth`: exit 0, 11 tests passed, zero failures/cancelled/skipped/todo.
- `node --import tsx tests/auth/browser.ts`: exit 0. Isolated Chrome passed sign-in, authenticated heading-only home, keyboard controls and no overflow at 320 and 1440 CSS pixels. Logout and actual Google button through the mocked provider passed; console/network error collection empty. Screenshots regenerated identically to committed evidence.

The main checkout initially selected `/opt/homebrew/bin/node` (Node 22.1.0), which could not load its missing ICU74 library. Verification used the existing working `/Users/rafael/.nvm/versions/node/v24.15.0/bin` at the front of the command-local PATH. No global toolchain or project runtime requirements were changed.

The workflow implementation node was advanced to merged using the committed, feature-specific human approval with `--require-committed`. This merge does not authorize a production release. Provider transport fixtures remain test-only; these checks do not establish a live Google consent round trip.
