# T-Rex local main integration — 2026-11-24

Authority: Rafael's direct instruction “merge to main” in this chat. Scope is the implemented T-Rex height/acceleration refinements, tests, documentation and evidence. Migration ordering and Drizzle changes were discussion only and are not implemented here. No deployment, push, hosted action or development-data migration is authorized.

- Original reviewed feature commit:8596b86.
- Expected local main tip:0c6a38b36e7652971ac95004df73b9040f878278.
- Clean main integration candidate:9046e9af9bec01320e0240bc4b5918fe938163d6.
- Newer main app/security/migration/audit changes merged without conflicts. Independent integration review:org/reviews/t-rex-refinements-integration.md.
- User's unstaged next-env.d.ts remains uncommitted and untouched.

Combined source verification uses a private git-archive snapshot at /var/folders/2s/y1fg2ycd7813hsy8rm46wph40000gn/T/trex-main-verification-_s40awtq, with the two later verification-only corrections synchronized. Existing pinned dependencies are linked. Private configuration supplies only restricted loopback test/runtime URLs; paid API keys are empty.

Initial temp-directory package invocations selected an unrelated broken Homebrew Node22 binary; reruns explicitly selected the repository-required Node24.15.0. No package or system changes were made.

Initial lint found main's unused `const child` assignment in the historical local cutover helper. Removed the assignment while preserving its awaited subprocess operation, options and guards. The helper was syntax-checked and reviewed, never executed.

Initial Chrome run exposed a fixture race at holdQuery: game DOM could precede the intercepted request event. Added a bounded wait for that event before the original assertion; no request retries or skipped checks.

Passing checks so far: pnpm test84/84, Python7/7, lint, typecheck, build, family34/34, menu69/69, authentication16/16 and deployment32/32. Final browser and latest lint/typecheck results will be recorded before main is updated.

## Final verification

Latest lint/typecheck both exit0. Chrome QA rerun exit0 at320,390,768,1024,1440, including T-Rex lifecycle, full-width shorter canvas/backing ratio, keyboard and touch controls, pause/restart, request association and resource cleanup. No overflow or unexpected console/network errors; ten intentional fixture429s accounted for. Screenshots reside in the isolated profile /var/folders/2s/y1fg2ycd7813hsy8rm46wph40000gn/T/meal-planner-auth-chrome-mbEKiu. Final source comparison verified199 tracked source/config/asset files byte-identical between the working candidate and tested snapshot, including both verification corrections.

Independent integration review approved the original integration and both narrow corrections. Staged secret scan and diff checks are required before the final integration evidence commit. Local main will be updated only by fast-forward from the expected tip after checking it is still clean and unchanged. No remote operation or deployment is included.
