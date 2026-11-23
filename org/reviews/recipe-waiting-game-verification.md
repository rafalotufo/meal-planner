# Word Snack — final local verification

- Date: 2026-11-23
- Feature: intent/recipe-waiting-game/
- Implementation: 5816cb2 (rules/notebook), 48829e1 (catalogue), 47a5878 (UI/browser/docs)
- Verdict: implementation verified and independently approved; human merge/release remain pending.

## Delivered

Optional inline Word Snack offers 128 distinct six-letter puzzles, typing and
tile input, and local transient progress. Successful recipe searches preserve
the open game, draft, found words and focus; recipes are available immediately
with a ready notice and explicit close/view-results navigation. Zero-result
searches remain playable. Existing search history, session protection and
provider/photo boundaries remain intact.

Catalogue: 128 unique letter multisets, 1,392 supported answers, 971 distinct
words, 20 repeated-letter racks, 17,028 serialized UTF-8 bytes. The authored
vocabulary is deliberately limited and disclosed in the UI. No dependency,
lockfile, backend, persistence or game-network change.

## Command evidence

Frozen installation succeeded with Node 24.15.0 / pnpm 10.33.0. Completed feature
checks below exited 0, as recorded in intent/recipe-waiting-game/progress.md;
the org runtime also reran its configured acceptance suite successfully after
implementation and during final review turns.

| Command | Result |
| --- | --- |
| pnpm test | 74 passed; no failures/skips |
| pnpm run lint | Passed, zero warnings |
| pnpm run typecheck | Passed, strict TypeScript |
| pnpm run build | Passed, production build |
| pnpm run test:auth | 12 passed with isolated local servers |
| python3 -m unittest discover -s tests | 7 passed |
| node --import tsx --test tests/deployment/smoke.test.ts | 12 passed; local smoke tests |
| node --import tsx tests/auth/browser.ts | Passed at 320/390/768/1024/1440px |

Browser checks include real touch at 320/390px, held response mid-word,
continued play after success, explicit associated-search dismissal, old-panel
focus, pending close/reopen, closed-launcher continuity, zero results,
invalid/new queries, malformed/focused/unfocused errors, request-body isolation,
reload, existing auth/notebook/photo behavior, accessible names, contrast and
tile focus. Ten intentional fixture HTTP 429s; no unexpected console/network
errors. Mobile/desktop screenshots were inspected; see word-snack-ready-320.png
and word-snack-ready-1440.png and companion pending/playing/dismissed captures.
Historical screenshots were preserved; new captures use feature-specific paths.

## Independent review and regression strength

- catalogue-recipe-waiting-game-001.md: all 128 racks and 1,392 answers audited,
  approved without required corrections.
- security-recipe-waiting-game-001.md: clear, no findings or required fixes.
- code-recipe-waiting-game-001.md: approved, no required findings.
- Code reviewer inverted the ready/open retention condition: success and
  zero-result persistence tests failed. Restored source byte-for-byte; all 17
  focused rules/catalogue/notebook tests then passed. The browser launcher-focus
  regression also failed before its implementation fix.

## Limits and handoff

Google transport and search responses are isolated test fixtures, not live
provider grounding. No paid LLM calls occurred. The existing photo check uses
a real publisher image. Accessibility evidence includes DOM/AX/keyboard and
contrast checks; actual screen-reader listening was not performed. No release
dependency audit or production smoke probe is claimed.

Plan-sync, staged secret scan and org consistency checks are recorded at final
audit commit. The preserved design cycle and fresh bounded cycle retain all
decisions; reused approval turns are not new independent reviews. Local
completion does not authorize push, merge or production release.
