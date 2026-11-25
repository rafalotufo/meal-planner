# T-Rex refinement final code review

Reviewer: independent review agent, 2026-11-24.

Verdict: approve the code change, including supplemental tests and completed browser evidence. No required findings. Human merge/release gates remain unchanged.

Reviewed current diff in app/t-rex-runner.tsx, lib/t-rex-runner.ts, lib/t-rex-canvas.ts, tests/recipe-t-rex-runner.test.ts and tests/auth/browser.ts against intent/t-rex-refinements/spec.md and plan.md.

- Acceleration integrates 240px/s plus 2px/s² through 45 seconds, then 330px/s. Obstacle movement uses the difference in integrated distance, matching horizon and score. The initial threshold is correctly 729px, preserving the three-second opening. Pause/restart retain their existing active-time semantics.
- Existing 300–420px empty gaps remain mathematically safe at the cap, and tests now exercise all integer gaps at maximum speed plus seeded full acceleration runs. Jump arc, hitboxes, bounded frame/substep handling and immutable transitions are preserved.
- Canvas CSS, initial dimensions and dynamic backing dimensions agree on the shorter 5:1 presentation. The full 600×150 logical world remains visible; vertical compression is documented. Removing minimum-height padding permits the mobile container to shrink as requested. No auth, provider, storage, resource lifecycle or input ownership changes.
- Browser assertions cover displayed/backing aspect ratio, full width and absence of padding, while existing behavior/accessibility assertions remain. Screenshots now go to the owned temporary profile, preserving historical audit images.

Independent checks: executed a 44.990→45.020 second cap-crossing transition with an existing obstacle; expected integrated distance 12831.6 and obstacle movement 9.8999px both passed (exit 0). Mutated Math.min to Math.max in an isolated copy of the compiled runner, leaving repository source unchanged; native test runner failed two meaningful acceleration/delta assertions (exit 1), demonstrating regression sensitivity. Temporary mutation evidence: /var/folders/2s/y1fg2ycd7813hsy8rm46wph40000gn/T/trex-review-cs50v7cy.

Supplemental review: the cap-crossing check is now persisted as a regression asserting both distance and obstacle position, plus equivalent split-step behavior. The initial real Chrome run exposed the stale five-Tab limit in existing sign-in QA. Replacing it with a finite bound based on actual links/buttons accommodates the current shared navigation; the original focused BUTTON assertion remains and exact “Continue with Google” text is additionally required. This preserves the keyboard-accessibility check while removing a stale navigation-count assumption. No production code changed for that fixture failure.

Author reports pnpm test now 84/84, lint/typecheck rerun passed, build and seven Python tests passed, and real Chrome QA passed all five widths (320/390/768/1024/1440), with no unexpected errors or overflow. Those complete commands were not independently repeated during review. Independently inspected the 320px and 1440px running screenshots under /var/folders/2s/y1fg2ycd7813hsy8rm46wph40000gn/T/meal-planner-auth-chrome-FFaNiY: full-width shorter play areas render clearly, dinosaur sprites are visible and recognizable, controls remain readable, and no clipping/overflow is apparent. Browser evidence is fixture-based and makes no live provider claim.
