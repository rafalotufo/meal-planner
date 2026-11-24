# Shared site layout — intent

- Author: product-manager, from Rafael's active chat request
- Date: 2026-11-24
- Status: Accepted for Design under the org PM intent gate
- Decision: `org/reviews/intent-shared-site-layout-001.md`
- Source: Active chat: “I see that the /family page has no styling. Lets use next js layout so that we can have the same style applied to the whole site. It should have a cmmon header for all pages. Use sdlc org for this intent”

## Problem

The home page owns the stone background, constrained content width, emerald
Meal Planner heading and header border. The root Next.js layout supplies only
global CSS, metadata and a white body. Family, onboarding, sign-in and sign-out
therefore look disconnected from recipe search and lack a common site header.

## Proposed outcome

Use the Next.js App Router layout to provide a consistent site shell and common
Meal Planner header across existing pages. Carry the home page's restrained
stone and emerald visual style into the family and account/invitation screens.
Keep page content legible, responsive and accessible while preserving each
screen's existing purpose and behavior.

## Acceptance criteria

- The root server layout owns the shared site background, responsive outer
  spacing, content width and a single common Meal Planner header. Existing
  home, family, sign-in, onboarding and sign-out pages receive this shell.
- The home page no longer duplicates the shared header. Each page has a clear
  content heading and semantic main region without duplicate main landmarks.
- Family members, invitation form, pending invitations, buttons and links use
  coherent typography, spacing, borders, surfaces and interaction states that
  fit the current home page. Account/invitation screens follow the same style.
- The header provides a clear route back to the home page. Any ordinary
  navigation links use existing routes and remain usable with a keyboard;
  authentication and family guards continue to decide route eligibility.
- At mobile and desktop widths, the header and content fit without horizontal
  overflow, including long family emails and invitation URLs. Visible focus,
  labels, status/alert semantics and disabled controls remain accessible.
- Shared presentation performs no identity, database, provisioning or provider
  effects. Existing page/session/family checks, public-route rules, invitation
  acceptance and logout behavior remain intact.
- Required repository checks pass. Real-browser mobile and desktop inspection
  covers the shared header and representative authenticated family/home and
  public account pages using the existing isolated test fixture infrastructure.
  Record actual observed coverage and limitations, with no paid provider calls.
- Independent specification/plan and implementation reviews follow the org
  protocol before handoff to the human merge gate.

## Constraints and scope

Reuse Next.js layout/server component patterns and existing static Tailwind
utilities. Read the installed Next.js documentation before implementation.
Keep root metadata and global CSS ownership intact. Avoid new client state,
dependencies, external assets, infrastructure, migrations, auth/session logic,
new features, recipe/meal CRUD or changes to search/provider/photo behavior.
New application tests and helpers use strict TypeScript. Tests own isolated
local databases and force empty paid keys; do not change development or hosted
data or create a production authentication bypass.

The architect may choose the exact header composition, existing-route links,
page widths and modest visual treatment within these criteria. These routine
choices need no further owner decision. No redesign of recipe interactions,
push, merge, deployment, hosted configuration or release is authorized.

## Handoff

Architect: define the shared shell, header semantics, page-level presentation,
auth-preserving boundaries and focused verification; prepare an implementation
plan for independent review. Senior developer: implement only after the org's
specification/plan gate is approved. The owner's request authorizes the local
org design/build/test loop; merge and release remain separate human gates.
