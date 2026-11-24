# App icon — implementation verification

- Role: senior-developer
- Date: 2026-11-24
- Plan: `intent/app-icon/plan.md`, independently approved at `c51518a` and
  adopted before application changes.
- Runtime: Node v24.15.0 / pnpm 10.33.0; frozen dependency install, no dependency edits.

## Change and generation

Added original static plate-and-fork `app/icon.svg` and matching
`app/favicon.ico`, removed the root layout's empty data icon override and
allowed only GET/HEAD of the two exact asset pathnames through the public
policy. The existing proxy canonical Host/configuration/security checks and
all session/family/provider logic remain intact.

Generated the ICO once using the already installed transitive `sharp@0.35.5`
resolved relative to Next: render SVG to PNG buffers with `.resize(16,16)` and
`.resize(32,32)`, then write an ICO header (reserved0/type1/count2) and two
16-byte image directory entries followed by those PNG buffers. No new package,
build step, runtime image generator, font, script or remote asset is required.
The SVG source remains the editable artwork. ICO contains native16px and32px
images and the same green/warm-white design.

## Red/green evidence

Before source edits, a baseline production build succeeded. The focused
TypeScript regression failed2/2 against that build: `GET /icon.svg` was not
public, and compiled sign-in HTML advertised one empty icon rather than the
two local formats. `app-icon-logs/red.log` preserves the actual failures.

After implementation/build, the same focused regression passes2/2. It checks
exact path/method allowances, rejected neighboring names/nonread methods,
compiled sign-in icon discovery, image MIME/signatures, ICO16/32 entries,
GET200/HEAD200 empty body, POST401 and protected page/API behavior. HTTP uses
a deliberately unreachable loopback runtime database, proving these public
reads do not require a live DB. `app-icon-logs/green.log` preserves the output.

The first sandboxed HTTP invocation encountered loopback-listen EPERM; the
unsandboxed baseline rerun produced the meaningful failures above. One new
redirect assertion initially assumed an absolute Location; it was corrected
to resolve either framework relative or absolute locations to the configured
origin. Application redirect behavior was unchanged.

## Required commands and actual results

Full output for each final command is in the corresponding `app-icon-logs/`
file, including the production route table and browser JSON.

| Command | Exit | Result |
| --- | --- | --- |
| `pnpm run lint` |0| No warnings/errors |
| `pnpm run typecheck` |0| Types generated; strict TypeScript passed |
| `pnpm run build` |0| Production build succeeded; static `/favicon.ico` and `/icon.svg` routes |
| `pnpm test` |0|66 tests passed;0 failed/skipped |
| `node --import tsx --test tests/deployment/*.test.ts` |0|18 tests passed;0 failed/skipped |
| `pnpm run test:auth` |0|14 tests passed;0 failed/skipped |
| `pnpm run test:family` |0|34 tests passed;0 failed/skipped |
| `python3 -m unittest discover -s tests` |0|7 tests; OK |
| `node --import tsx --test tests/auth/app-icon.test.ts` |0|2 tests passed;0 failed/skipped |
| `node --import tsx tests/auth/app-icon-browser.ts` |0| All four page/viewport checks passed |

The first family run passed33/34 because this worktree's private ignored fixture
configuration initially contained only TEST_DATABASE_URL, while the existing
roles regression requires DATABASE_URL too. Added the existing dedicated local
runtime/migration/test role URLs to the private0600 configuration, without
schema/data/grant changes, then reran family successfully34/34. No test or
application behavior was weakened. Auth/family resources used owned random
local test databases and were cleaned by their existing helpers.

## Browser and visual evidence

Used an isolated headless installed Google Chrome profile through CDP and the
existing test-process-only Google transport fixture. No live Google login,
recipe provider call, paid search or hosted resource was used. The narrow
strict-TypeScript QA helper is `tests/auth/app-icon-browser.ts`.

At mobile390px and desktop1440px, public sign-in and admitted home pages kept
the document title Meal Planner, advertised both same-origin icon URLs and
decoded both assets successfully. Actual image network responses were200;
console warnings/errors were empty and no horizontal overflow was observed.
All owned browser/server processes stopped; browser profile was removed.
Headless Chrome does not expose tab chrome: this proves emitted metadata,
network/loading/decoding and small artwork appearance, not a visible native
mobile tab assertion.

- `app-icon-sign-in-390.png` / `app-icon-sign-in-1440.png`
- `app-icon-home-390.png` / `app-icon-home-1440.png`
- `app-icon-preview.png`: SVG and ICO rendered at16px and32px on light/dark
  surrounds, with enlarged previews. Visually inspected: fork and plate remain
  recognizable, high contrast and unclipped. Raster enlargement is naturally
  softer than the scalable SVG; native16/32 appearance is sound.

The first browser attempt incorrectly expected the home heading on sign-in;
corrected the QA assertion to the existing `Sign in to Meal Planner` heading.
Both pages' document title remains Meal Planner. The contact sheet's first
local inspection lacked charset metadata; regenerated it with UTF-8 labels and
a tall enough viewport to include both surrounds. Lint/typecheck reran after
helper edits and pass. No application correction was needed for these QA issues.

## Handoff

Independent security and implementation reviews are separate org artifacts.
No merge, push, migration, deployment or release was performed. Human merge
and release gates remain in effect.
