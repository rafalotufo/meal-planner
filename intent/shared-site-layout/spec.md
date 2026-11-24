# Shared site layout — specification

- Author: architect
- Date: 2026-11-24
- Status: Approved
- Input: accepted sibling intent; `org/reviews/intent-shared-site-layout-001.md`

## Shared layout

Keep `app/layout.tsx` a server component owning metadata, global CSS, html/lang
and body. Move the home stone-50 background, responsive horizontal padding,
bottom spacing and centered max-w-6xl container into it. Set viewport min-height
only on the outer shell. Render one site header before children: wrapping flex
row, stone border, emerald serif “Meal Planner” brand link to `/`, and labelled
primary navigation with “Recipes” (`/`) and “Family” (`/family`) links. Use
visible focus, hover feedback, adequate padding and natural wrapping at 320px.
Set shared navigation `prefetch={false}` to avoid eager protected-route reads.
Use no active-route/client state or session-aware navigation; existing guards
own eligibility and account actions remain in their pages.

Root presentation performs no request/session/database/admission/provider read
or effect and receives no private configuration, identities or invitation tokens.
Retain every existing page guard and call order. Each page keeps its main and
h1; root adds neither. Home removes duplicate shell/header, retains its family
guard, RecipeSearch composition and h1 “Meal Planner” (sr-only acceptable), and
keeps the recipe-search label as visible page context. Recipe components stay
unchanged.

## Page presentation

Family uses a centered reading width, serif emerald h1 and consistently spaced
white sections with stone borders and modest rounding. Apply matching treatment
to member lists, invitation form/rows, inputs and existing account/invite screens.
Use emerald primary buttons, distinct secondary/revoke controls, visible focus,
hover and disabled states. Emails wrap and inputs shrink within parents;
invitation URLs remain selectable in the existing read-only input. Preserve
IDs, labels, live status/alert roles, button types, text, handlers, request bodies
and all copy/revoke/accept/provision/sign-in/logout behavior.

Sign-in, sign-out, onboarding and `/invite` replace independent viewport/padding
wrappers with matching centered content surfaces in the root shell. Keep invite
dynamic rendering, fragment capture and invalid/missing-context state unchanged.
Use existing static Tailwind utilities; no global selectors, styling framework,
new dependencies, assets, infrastructure or additional client state.

## Verification contract

A focused strict TypeScript HTTP regression checks one common header/navigation,
main and h1 on public sign-in/invite with an unreachable database; protected
home/family remain redirects. Reuse existing isolated fixtures for authenticated
home/family semantics, avoiding exact class/Flight-payload assertions. Write/run
the failing header regression before source edits.

A focused TypeScript browser helper uses existing isolated test Google transport
and real Chrome. Inspect sign-in, home, family, sign-out, invite fallback and
invitee onboarding at 320px/1440px. Check landmarks/navigation, no document
horizontal overflow, computed background and visible keyboard focus; include
long family emails/URLs and verify existing family control operation. Check no
eager protected prefetch from public/pending routes. Save representative
screenshots and inspect them visually. Test-owned databases only, empty paid
keys; no live Google/provider claim or production bypass.

Run the full required commands in plan.md and independent code/security reviews.
Record actual outcomes and limitations. Human merge/release remain separate.
Architecture read exact installed Next16.4.6 layout/layouts-and-pages guides in
the main checkout while this worktree had no dependencies. Frozen install has
now completed; developer rereads worktree `node_modules/next/dist/docs/01-app/`
`01-getting-started/03-layouts-and-pages.md` and
`03-api-reference/03-file-conventions/layout.md` before source edits.
