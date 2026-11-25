# T-Rex refinement plan

1. Extend TypeScript simulation tests for accelerating distance, cap, pause/restart, initial grace period and maximum-speed jumpability; observe failures first.
2. Integrate capped acceleration in lib/t-rex-runner.ts. Change aspect ratio/minimum height in app/t-rex-runner.tsx and make lib/t-rex-canvas.ts backing dimensions follow the displayed height.
3. Add real Chrome aspect-ratio assertions to tests/auth/browser.ts. Run pnpm test, lint, typecheck, build, Python workflow tests and isolated Chrome QA at desktop/mobile widths. Record actual evidence and limitations in verification.md.
4. Independent review with corrections as needed. Preserve previous audit records and human merge/release gates.

Changed-file manifest: the three application files and two test files above, this feature's artifacts, and org/reviews/t-rex-refinements-*.md. Existing historical screenshot paths must not be overwritten by QA; direct refinement screenshots to temporary paths.

## Authorized main integration

On 2026-11-24 Rafael instructed “merge to main”. Integrate current local main0c6a38b, preserving all newer recipe URL curation code and audit records. Verify in a clean private source snapshot so the user's dev cache and unstaged next-env.d.ts remain untouched. Two narrow verification corrections are included: remove only an unused assignment in main's native-cutover-helper.mjs (do not execute that helper), and wait a bounded interval for Chrome's intercepted request event after the game paints, retaining the existing request assertion. These corrections require independent review and affected checks. Merge locally only; no push/deployment or development/hosted migration.
