# Local implementation evidence

## Target binding (2026-11-25)

Strict TypeScript target regressions were written before the target module.
The initial test command failed because `lib/verification/target.ts` did not exist.
After implementation, the two tests passed using the matching pinned reference
checkout's tsx loader and NODE_PATH while this checkout's frozen install completed.
The tests cover copied Preview settings on Production, absent trusted metadata,
wrong source/profile/origin/database and valid Preview deployment binding.
The disabled manifest generator also exited zero. No database or remote target
was contacted by these tests. Full repository checks remain outstanding.
