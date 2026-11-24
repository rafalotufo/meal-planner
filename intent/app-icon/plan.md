# App icon — implementation plan

- Author: architect (proposal for senior-developer adoption)
- Status: Draft for independent peer review before implementation
- Date: 2026-11-24
- Derived from: sibling accepted `intent.md` and draft `spec.md`

## Files that change

- app/icon.svg
- app/favicon.ico
- app/layout.tsx
- lib/auth-policy.ts
- tests/auth/app-icon.test.ts
- tests/auth/browser.ts
- intent/app-icon/**
- org/loop/**
- org/messages/**
- org/reviews/**
- org/memory/**
- org/status.yaml
- workflow-graph.yaml

## Ordered work

1. Obtain independent approval of the specification and this plan through org
   review. Senior developer adopts the approved plan before coding. Read the
   installed Next app-icons guide; preserve the version-specific approach.
2. Write focused TypeScript regressions first in `tests/auth/app-icon.test.ts`:
   exact GET/HEAD public allowances, protected nonread methods/lookalikes and
   protected page/API paths; compiled HTTP sign-in metadata discovery and
   actual SVG/ICO GET/HEAD responses without a reachable database. Run the
   relevant tests against the baseline and record the meaningful failures.
3. Create the static plate/fork SVG and its 16px/32px ICO fallback. Use existing
   local tools for one-time conversion, no dependency change. Remove the blank
   icon metadata override and add only the two exact GET/HEAD auth exceptions.
4. Build and run the focused regression to confirm the failures are fixed.
   Confirm admitted-page metadata using the existing authentication/browser
   fixtures, without adding production identity shortcuts.
5. Extend existing strict TypeScript Chrome QA only as needed to capture icon
   links/loading at desktop/mobile widths and small-size asset inspection.
   Keep helper code in strict checking and use isolated test resources. If the
   existing helper already proves the required facts, reuse it and record the
   inspection instead of adding redundant tests.
6. Run all required commands below, record actual outputs and inspect real
   browser evidence. Stop owned QA servers. If Next leaves duplicate generated
   LayoutProps after dev QA, follow AGENTS.md's generated-cache recovery only.
7. Obtain independent code/security review, resolve findings within the org's
   bounded loop, and commit the verified implementation with status/evidence.
   Hand off at the human merge gate; do not push, merge or deploy.

## Verification

Use Node 24.15.0 and pinned pnpm 10.33.0. Dependencies were installed with the
frozen lockfile; no package/lockfile edit is planned.

Required commands:

```sh
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm test
node --import tsx --test tests/deployment/*.test.ts
pnpm run test:auth
pnpm run test:family
python3 -m unittest discover -s tests
python3 scripts/scan_secrets.py --staged
```

Run build before the compiled HTTP, deployment, authentication and family
regressions. The focused red/green run may use
`node --import tsx --test tests/auth/app-icon.test.ts` after the appropriate
build. Successful verification means every required command exits zero;
record pass counts and runtime evidence without attributing fixture results
to live Google/provider calls.

Real browser QA must cover desktop and mobile widths, unchanged Meal Planner
title, both local icon links and successful image decoding/loading. Record
small-size visual inspection and the limitations of tab chrome visibility.

## Risks and controls

- Blank layout metadata could override discovery: remove it and inspect built
  sign-in/admitted-page HTML, not just source file names.
- Auth could redirect images to HTML: exact read-only public exceptions plus
  compiled HTTP MIME/signature checks with an unreachable DB expose this.
- Broad exceptions could open private routes: test nonread methods and
  lookalikes; retain the existing proxy and all configuration/Host checks.
- A detailed icon could blur at 16px: use simple heavy shapes, then inspect
  rendered 16px and 32px versions on both surrounding colors.
- Browser favicon caches could hide updates: use isolated QA profiles and
  inspect the framework-generated metadata links.

## Dispatch

One senior developer owns the narrow implementation. An idle reviewer who did
not author it reviews the spec/plan and later code; security assessment may
share the independent review for this static change if it explicitly covers
the auth exception and inert SVG. Orchestrator records each bounded turn,
messages, memory and gates. No parallel code changes are needed.
