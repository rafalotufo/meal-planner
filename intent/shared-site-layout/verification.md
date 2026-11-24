# Shared site layout — implementation verification

- Author: senior-developer
- Date: 2026-11-24
- Scope: approved sibling spec/plan; local fixtures only, no merge/release.

## Change and reproduction

Root layout now owns the stone background, responsive site frame and shared
Meal Planner / Recipes / Family header. Each existing page retains its own
main/h1 and auth guards. Family/account/invite surfaces and existing controls
use the home emerald/stone presentation. Shared links disable prefetch. No
authentication, session, data/store/provider/photo logic or dependencies changed.

Before source edits, a baseline production build passed. The new semantic HTTP
regression then failed on public sign-in with actual header count0 vs expected1
(main/h1 counts remained1). An initial sandbox run could not bind loopback;
the actual reproduction used the approved isolated-server fixture outside that
network restriction. After implementation both new HTTP cases pass, including
public sign-in/invite with an unreachable database and authenticated home/family.

## Command outcomes

| Command | Actual outcome |
| --- | --- |
| `pnpm run lint` | Passed, zero warnings |
| `pnpm run typecheck` | Passed, strict TypeScript and generated route types |
| `pnpm run build` | Passed, optimized Next.js16.4.6 webpack build and runtime metadata validation |
| `pnpm test` | 82 passed, zero failures/skips |
| `pnpm run test:family` | 33 passed initially; existing roles test required missing private runtime configuration. Exact unchanged `node --import tsx --test tests/family/roles.test.ts` then passed1/1; all34 family cases passed across these runs |
| `pnpm run test:auth` | 16 passed, zero failures/skips, including the2 new layout cases |
| `node --import tsx --test tests/deployment/*.test.ts` | 32 passed, zero failures/skips; no deployment |
| `node --import tsx tests/auth/browser.ts` | Passed all320/390/768/1024/1440 widths, auth/search/history/filters/error/empty/T-Rex/logout/mock-Google scenarios; zero unexpected errors |
| `node --import tsx tests/family/browser.ts` | Passed production automatic setup, copy/invite/mock-Google acceptance, shared family, revoke/logout at320/1440; dev StrictMode fragment capture/sign-in passed |
| `node --import tsx tests/auth/shared-layout-browser.ts` | Passed six visible routes at320/1440; header/main/h1, shared background, keyboard focus, guarded navigation, no eager protected prefetch, long invitation address/URL and create/revoke |
| `python3 -m unittest discover -s tests` | Orchestrator reported7 passed in1.522s during this task |
| `git diff --check` | Passed |

Final org/plan-sync/staged-secret checks are orchestrator-owned and recorded
in the completion audit.

## Browser evidence and proof limits

Feature screenshots: `org/reviews/shared-site-layout-{sign-in,home,family,sign-out,invite,onboarding}-{320,1440}.png`.
Developer visually inspected family at both widths, sign-in320, home1440 and
onboarding320: common header, readable spacing, coherent surfaces, wrapped long
family invitation address and contained selectable URL input. Orchestrator also
visually inspected family320/1440. Header wraps naturally on narrow screens;
all six page types passed the no-horizontal-overflow assertion.

The invite fallback deliberately submits missing context and receives400 from
`/api/invitation-context`. The new helper requires exactly that expected console
error, observes the exact response pathname/status with test-only diagnostic
fetch instrumentation returning every original response unchanged, and rejects
all additional errors. Its initial empty-console expectation was corrected for
this explicitly tested negative state. Chrome resourceTiming responseStatus was
unavailable, so it is not used as proof. All other new-helper flows have zero
unexpected errors. Existing auth Chrome separately expects its ten fixture429s.

All sign-in identities are from the existing test-process-only Google transport;
no live Google verification or paid provider behavior is claimed. Search Chrome
uses browser response fixtures and a real HTTPS publisher image; paid keys are
forced empty. Data writes/provisioning/invitations belong only to owned random
local fixture databases. The unchanged native roles test privately uses existing
runtime credentials for catalog/hash reads and denial assertions, and confirms
the test role cannot access development data. No migrator/bootstrap URL is used,
no development/hosted migration or successful data/schema mutation is performed.
Private test configuration stays ignored and owner-only; no values are recorded.

295 historical screenshots were privately backed up before existing browser
helpers ran, then restored and byte-verified exactly; feature screenshots remain.
No production bypass, configuration change, push, merge, deployment or release.

## Existing browser helper diagnosis

The existing family Chrome helper initially timed out waiting for its first
created invitation. A minimal diagnostic reproduced the exact real fixture
Google/provision/family/input/click sequence: input remained valid, there was no
alert or browser error, and no invitation API request occurred. At default
headless viewport height469, the new styled page placed submit at top478,
bottom528. Existing `openChrome.click()` sent mouse coordinates without
scrolling, so the real mouse event fell below the viewport. The same isolated
flow succeeded after scrolling the target into view before the identical click.
This is a browser helper viewport assumption, not a form/auth/hydration failure.
Evidence: `org/reviews/shared-site-layout-family-debug.png`. Independent reviewer approved the narrow test-only
scroll-before-bounds helper amendment before application; no application
workaround or assertion suppression is used.

## Completion addendum

After the approved scroll helper correction, the full existing family Chrome
helper passed production and owned development StrictMode flows; the new focused
Chrome helper also passed again using the changed physical click helper.
The existing auth/browser helper implements independent CDP mouse events and
does not import the amended shared helper, so its prior successful run remains
applicable. Existing keyboard control/focus/Enter assertions remain present.

The family helper stopped its owned dev server. Both generated directories then
contained LayoutProps; only inactive `.next/dev/types` was moved to a private
temporary backup as prescribed in AGENTS. Production types were retained and
final production type generation/build regenerated. No compiler, includes,
tests or checks were weakened. The default-viewport diagnostic screenshot stays
as evidence; all historical browser screenshots have original bytes restored.
