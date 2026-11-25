# T-Rex refinements — independent integration review

Reviewer: independent review agent, 2026-11-24.

Verdict: approve integration candidate 9046e9af9bec01320e0240bc4b5918fe938163d6 against main 0c6a38b, conditional on root's combined-candidate verification passing before the authorized local main update. No required findings. This review does not authorize release, deployment or migration.

The candidate merges feature 8596b86 with current main. Independently confirmed main 0c6a38b is an ancestor (exit 0). The main-to-candidate delta contains only the 13 reviewed T-Rex implementation/test/artifact files. All three runtime T-Rex files and both test files are byte-identical to reviewed feature 8596b86 (git diff --quiet, exit 0); the previous final review and cap-crossing/mutation checks therefore apply to their implementation.

Current main's recipe-URL curation and migration work is inherited without T-Rex edits. Explicit byte-comparison against main passed for AGENTS.md, gates/ledger.jsonl, session/auth policy/auth, lib/db, lib/menu, drizzle catalog/journal/SQL, migration script, vercel.json, org memory/loop/messages and workflow graph (exit 0). No security boundary, hosted configuration, ledger chain, migration catalog or prior audit stream is altered by this feature delta. The T-Rex implementation remains client-only and has no new dependency or interaction with curation, persistence or admission.

Reviewed the main-to-candidate source/test diff again: height/backing size stay consistent, capped integrated distance synchronizes movement and score, accelerated grace remains three seconds, maximum-speed gap proofs and exact cap-crossing regression remain intact. Browser helper changes retain the Google keyboard target assertions and preserve historical screenshot evidence. git diff --check main...HEAD passed (exit 0).

The unstaged next-env.d.ts change points to the user's generated .next/dev types. It is outside the commit and feature delta and was left untouched. Combined verification is being run by root in an isolated matching snapshot to avoid disturbing the user's dev cache; this reviewer has not claimed those in-progress checks passed. Local main update must use the verified candidate and recheck its expected tip. No push or hosted action is implied.

## Integration lint correction

Independently reviewed the supplemental one-line change in org/merge/recipe-url-menu-main-local-2026-11-24/native-cutover-helper.mjs:54. Removing the unused `const child=` binding leaves the exact awaited migration subprocess call, arguments, environment and buffer options intact. No later reference consumes the discarded result, so execution order, rejection propagation and migration behavior are unchanged. This resolves an inherited main lint warning without weakening a check or altering a guard. `node --check` passed (exit 0); the helper was not executed and no migration was run by this review.

Verdict for this additional integration-only diff: approve, no required findings. The earlier 13-file statement describes candidate 9046e9a; the final candidate additionally contains this lint correction and review/verification records. Root reports combined test 84/84, typecheck, build and Python 7/7 passed; lint rerun, HTTP suites and browser checks remain in progress at this supplemental review. Final local-main update remains conditional on the complete matching-candidate verification passing. No migration/deployment authority is granted.

## Browser interception synchronization

Reviewed the later four-line addition to tests/auth/browser.ts `holdQuery`. It waits at most 220×50ms for the Node-side CDP intercepted-request handle after React has painted the game, then executes the same required `assert.ok(heldRequest)`. These are independent asynchronous signals, so immediate DOM availability cannot guarantee delivery of Fetch.requestPaused to the test process. The bounded wait yields the event loop; it neither resubmits the search, retries a failed scenario, bypasses an assertion nor changes application code. Existing finish/navigation helpers clear the held handle between scenarios. This is appropriate fixture synchronization rather than a production workaround or relaxed acceptance check.

Verdict: approve this supplemental browser-helper diff, no required findings. Root reports recipe84, family34, menu69, auth16, deployment32, typecheck, build and Python7 passing for the combined work; browser rerun and final lint/types confirmation remain root-owned evidence before local main update.
