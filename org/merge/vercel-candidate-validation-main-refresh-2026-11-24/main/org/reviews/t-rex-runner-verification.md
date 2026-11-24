# T-Rex Runner — final local verification

- Date: 2026-11-24
- Candidate: 0febee7; asset slice cbfc8c4, simulation/session slice c538ab7, UI/removal slice 1017d39.
- Verdict: implementation verified and independently approved; human merge/release remain pending.

## Delivered behavior

T-Rex replaces Word Snack. A valid search automatically opens the game and
starts eligible play without delaying the recipe request. Space on the game
surface or the native Jump button jumps/restarts. The game fills available
content width, including desktop; its 600×150 logical world and collision
timing stay fixed across visual scaling and DPR changes.

Success and zero results immediately discard the game in every mode, including
mid-jump, paused, crashed, hidden and loading images. Focus goes to the completed
search only when a removed game/control held it. Query/outside/old-panel focus
is preserved. Pause, Hide/Show, background-tab and reduced-motion behavior keep
motion controllable. Late images cannot restart play or steal focus.

Deleted the five obsolete runtime/test files: app/word-snack.tsx,
lib/word-snack.ts, lib/word-snack-puzzles.ts, tests/recipe-word-snack.test.ts and
tests/recipe-word-snack-catalogue.test.ts. Historical Word Snack artifacts,
vocabulary notes, reviews and screenshots remain. The remaining browser
reference to its title asserts the old game is absent.

## Reuse and source integrity

Pinned wayou revision: 5455bfa408ec6b707c7300ff194b7390733a766d. Both original
sprites (5,889 bytes combined) match the verified historical Chromium v55
sprites byte-for-byte. Complete wayou and historical Chromium notices, source
copyright/extraction credit and the local visible notices link are shipped.
Actual hashes, dimensions and adapted-source mapping are in provenance.md.
Local images/notices retain authentication; no new public-policy exception.

Final clean snapshot: /private/tmp/trex-implementation-m16a0ihf. All 68 recorded
implementation/config/test/asset hashes match the checkout, and all five
removed paths are absent in both trees. Aggregate source SHA-256:
b49253690e2e63b755871599bf2782d14fa00ff25db490fad444a61a196bea59.
Root and both independent reviewers recomputed the source checks. No package,
lockfile, auth, provider, photo transport or persistence change was introduced.

## Passing command and browser evidence

Node 24.15.0 / pnpm 10.33.0; pinned dependencies unchanged from the frozen
installation. These commands exited 0 in the matching clean-source candidate:

| Command | Result |
| --- | --- |
| pnpm test | 79 pass, no failures/skips |
| pnpm run lint | Passed, zero warnings |
| pnpm run typecheck | Strict types passed |
| pnpm run build | Production build passed |
| pnpm run test:auth | 12 pass |
| python3 -m unittest discover -s tests | 7 pass |
| node --import tsx --test tests/deployment/smoke.test.ts | 12 pass, local smoke fixtures |
| node --import tsx tests/auth/browser.ts | Passed at 320/390/768/1024/1440px |

Browser proof includes real pointer/touch/keyboard Find activation, full-width
canvas assertions, scoped Space/no scroll/native activation, jumps/collision/
restart, pause/Hide/Show, zero/success/error cleanup across modes, delayed assets,
context failure, repeated mounts, owned-frame/listener cleanup, navigation abort,
retina/resize, actual background tab at desktop, reduced-motion transitions,
request counts and protected local notices/images. Prior notebook/auth/photo
regressions remain. Ten intentional fixture HTTP 429s; no unexpected console
or network errors. Mobile/desktop captures under t-rex-* were inspected; old
feature captures were not overwritten.

Google transport and recipe responses are fixtures, not live LLM grounding;
no paid provider calls occurred. The existing photo check uses a real publisher
image. Accessibility evidence is DOM/AX/keyboard/contrast inspection, not actual
screen-reader listening. No production smoke probe or release advisory audit
is claimed.

## Independent review and regression strength

Plan/provenance review independently fetched the pinned source/licenses/sprites
and verified their lineage before reuse. Final security review 001 was clear;
focused security review 002 is clear at 0febee7 and reverified all 68 hashes.

Code review 001 found a real revoked-initial-focus autostart race. A new Chrome
test failed on the old build (running instead of paused). The fix captures a
shared first-commit eligibility decision and defaults the controller to denied;
later focus/image completion cannot bypass explicit Resume. Normal actual
pointer/touch starts still work. Added successful old-panel exact-node/focus/
selection/sort/history retention. Code review 002 approved the correction.

The reviewer also inverted the session terminal-discard condition: two tests
failed. Source was restored byte-for-byte; all 15 focused T-Rex tests passed.
Both initial finding and resolved review records are preserved.

## Checkout verification and gates

The known duplicate generated dev/production type conflict was not hidden by
config changes. Approved runtime windows hold only verified generated dev types,
run unchanged strict commands in the checkout, and restore exact original env
bytes and held types in finally. Clean-source QA is separate and hash matched.
Actual runtime outcomes and restoration evidence are recorded in progress.md.

Human merge/release gates remain. No push, merge, deployment, new production
fixture endpoint or loop-budget extension is authorized by local completion.

Final outcome: org loop solved at turn 6/6 with every configured acceptance
command passing. Corrected candidate checkout checks passed at turns 5 and 6;
both approved generated-type windows restored original env/types without
conflict. Staged secret scan, plan-sync and org consistency checks accompany
the final audit commit; no source changes followed the reviewed correction.
