# T-Rex and local main integration verification

Candidate merges main `37b6083` into approved T-Rex `d9245f9`, on the feature branch only. The sole code conflict was `tests/auth/browser.ts`: retain current family `provision()` after verified sign-in, all T-Rex scenarios, and fresh `t-rex-main-*` captures. Game app/lib and main server/auth/database/provider/icon/config files remain byte-identical to their respective reviewed sources. No behavior implementation was changed, so no new failing behavior test was necessary.

Divergent governance conflicts were resolved using `org/merge/t-rex-main-2026-11-24/`: 254 immutable archived files, both original ledger chains, main's exact 86-record ledger prefix, 13 imported prior decisions, and 55 fresh feature message aliases. Canonical ledger has 99 valid records. Original solved T-Rex loop files remain exact; no cycle reset/extension or new approval is claimed. Current feature artifact message references resolve to canonical aliases. Memory digest was refreshed.

Frozen install succeeded with Node24.15.0/pnpm10.33.0. Initial sandbox DNS failed; authorized network execution reused exact pinned packages. Verification ran against matching clean source `/private/tmp/trex-implementation-fftcqt79`, preserving root dev cache and exact preexisting `next-env.d.ts`. Source evidence lists 142 implementation/config/test files and all five absent Word Snack paths: aggregate SHA256 `c735a65a02af8da256f116b6b3d67c8092a1e407be10d4d91f9653faff0e9fbe` (`t-rex-main-source-evidence.json`). Generated Next declarations, runtime private test configuration and screenshots are excluded from implementation hashing.

Actual results (all final exits 0):

- `pnpm test`: 82 passed; `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`: passed.
- `pnpm run test:auth`: 14 passed.
- `pnpm run test:family`: 34 passed. Initial run was 33/34 because roles.test reads private `.data/postgres/development.env` independently of `TEST_DATABASE_URL`. Generated minimal mode0600 loopback runtime configuration from existing private cluster credentials in the snapshot; reran unchanged suite. No assertion, config or source weakening. Roles check reads permissions and verifies attempted writes are denied; other family/auth suites own disposable migrated `mp_test_*` databases.
- `node --import tsx --test tests/deployment/*.test.ts`: 18 passed.
- `python3 -m unittest discover -s tests`: 7 passed.
- `node --import tsx tests/auth/browser.ts`: real isolated Chrome passed 320/390/768/1024/1440px; native touch320/390, DPR2 sprites, background tab/visibility, reduced motion, delayed assets, initial-focus revocation/Resume, old-panel success focus/selection, complete end/cleanup matrix and full available canvas width. Authentication/logout, recipe/notebook/photo behavior retained. Console/network unexpected errors `[]`; ten intentional HTTP429 fixture responses. Search responses/Google transport are test-process fixtures; real publisher photo HTTPS loaded. No paid LLM call or live-provider grounding.
- `node --import tsx tests/family/browser.ts`: production320/1440 automatic setup, keyboard copy, unlisted Google invitation acceptance, shared family, revocation/logout; development StrictMode fragment capture/sign-in. No application errors or overflow.
- Staged secret scan: zero findings; all three ledger chains and archived hashes verified; workflow/message/loop checks passed independently.

Fresh screenshots use `t-rex-main-*`; historical images are unchanged. Visually inspected running game320/1440 (full content width, responsive controls), family management320 and joined family1440 (visible keyboard focus and readable responsive fields). Live-region assertions inspect DOM behavior; no screen-reader listening is claimed. No hosted change, migration, deployment, push or main merge occurred. User `next-env.d.ts`, untracked notes and work/ remain preserved.
