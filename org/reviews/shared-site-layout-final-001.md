# Shared site layout — independent final review

- Reviewer: reviewer, independent of implementation
- Date: 2026-11-24
- Baseline: `d1b11652abb5cf59d2b0ddce2b2b01d02480b8fc`
- Artifacts: full baseline source/test diff, accepted intent, approved spec/plan,
  verification.md and `org/reviews/shared-site-layout-security-001.md`
- Verdict: Approved for local implementation handoff; no blocking findings

## Correctness and architecture

`app/layout.tsx:11`–`27` owns the background, responsive shell, one shared
header and children. Brand and labelled primary navigation link only to fixed
existing routes and all disable prefetch. Root remains a server component with
metadata/html/body/global CSS ownership and no request/session/database read.
This matches installed Next16.4.6 shared-layout/root html/body guidance.

Home preserves requireFamilyContext and RecipeSearch, removes the duplicate
shell/header and retains its page h1. Family retains the exact family guard,
session and summary call order (`app/family/page.tsx:8`–`10`). Sign-in, sign-out,
onboarding and invite changes are presentation only; dynamic invite rendering,
fragment handling, session eligibility, logout recovery and effects stay intact.
The baseline diff is empty for lib/, app/api/, proxy.ts, manifest/lockfile,
TypeScript and Vercel configuration. No new dependency or data/provider scope.

## Presentation and accessibility

Independently viewed feature screenshots: family320/1440, sign-in320, home1440
and onboarding320. They show a consistent stone shell and emerald serif header,
responsive wrapping navigation, coherent white surfaces/controls and readable
spacing. Long invitation email wraps within its card and URL stays contained
in the selectable input. Mobile screenshots are viewport captures; content
continues by normal vertical scrolling, not a clipping claim.

Each route retains one main and h1; root branding is a link. Existing form IDs,
labels, disabled states, status/alert roles and keyboard operation remain. The
recorded six-route320/1440 Chrome checks verify no horizontal overflow, visible
focus, header Tab/Enter navigation, guarded anonymous/pending destinations and
no eager protected prefetch. No unnecessary abstraction or client state added.

## Tests and verification assessment

New semantic HTTP tests check public shells with an unreachable database,
anonymous protected redirects and authenticated home/family. Independently
exercised their actual assertSharedPage function in memory: valid shell passes;
mutating header to div or Family href to a wrong route throws AssertionError.
This focused assertion experiment did not alter source/build or rerun broad
suites. Developer's recorded baseline HTTP failure also detects the original
missing shared header before implementation.

Approved existing-helper changes remain narrow: bounded real Tab traversal
retains original button/focus/Enter assertions; shared Chrome click scrolls the
target before unchanged bounds and physical mouse events. New focused QA checks
header link order separately. The invite fallback helper requires the exact
expected400 console diagnostic and /api/invitation-context response; observation
returns original fetch responses, rejects additional errors and is test-only.
It does not suppress failures or fabricate successful application behavior.

Reviewed actual recorded outcomes:164 Node cases across recipe/family/auth/
deployment checks,7 Python tests, lint/typecheck/build and all three Chrome
helpers passed. The family roles check initially lacked private runtime config;
the unchanged isolated case subsequently passed as explicitly recorded. The
owned dev server stopped and inactive generated dev/types cleanup followed the
repository procedure. Historical screenshot bytes were restored. Independent
git diff --check passed; orchestrator reported full baseline plan-sync and zero
staged secrets. Security review is clear. No broad rerun was warranted.

No unresolved Bugs, Security or Compliance findings. Evidence is local fixture
and real Chrome proof with empty paid keys, not live Google/provider or hosted
release validation. Human merge, staging acceptance and release gates remain
separate and unapproved by this review.
