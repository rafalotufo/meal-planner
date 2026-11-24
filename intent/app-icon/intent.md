# App icon — intent

- Author: product-manager, from Rafael's active chat request
- Status: Accepted for Design under the org PM intent gate
- Decision: `org/reviews/intent-app-icon-001.md`
- Source: Active chat: “USE SDLS org workflow to work on this intent: lets add an icon to the app so it is displayed in browsers tab”
- Date: 2026-11-24

## Problem

Meal Planner has no recognizable browser tab icon. The root layout currently
sets `icons: { icon: "data:," }`, which explicitly advertises an empty icon.
Users cannot readily distinguish Meal Planner among their browser tabs.

## Proposed outcome

Display a recognizable Meal Planner icon in browser tabs across the app's
pages. Use a simple original food motif with strong contrast that remains
legible at normal small favicon sizes. The precise shape and colors are a
routine design choice for this focused change, grounded in the existing simple
app presentation; no additional product decision blocks Design.

## Acceptance criteria

- The browser receives a valid locally served app icon instead of the current
  empty data URL, using supported Next.js App Router metadata conventions.
- The icon depicts a simple food-related motif and is visually legible at
  16px and 32px on common light and dark browser chrome.
- The icon is available on public sign-in and authenticated app pages without
  requiring a session, database access, provider calls, or paid services.
- The root layout continues to own metadata and retain the Meal Planner title.
  No visible page layout, authentication, family, search, provider, or database
  behavior changes are included.
- Required repository verification passes, and real-browser desktop and mobile
  checks confirm the emitted icon metadata and successful icon loading. Record
  visual inspection at small sizes; do not claim mobile browser tabs are shown
  when the available browser UI does not expose them.
- Independent spec/plan and implementation reviews follow the org protocol.

## Constraints and scope

Keep the asset local and static, with no new dependencies, external assets,
client state, image-generation requirement, database infrastructure, or runtime
icon generation service. The architect selects the smallest supported icon
format and routing approach after reading the installed Next.js documentation.
Account for the existing blank icon metadata and public/static auth policy.
New application test helpers, if needed, must use strict TypeScript.

No redesign, brand system, manifest/PWA installation, home-screen icon suite,
recipe/meal CRUD, migrations, credential changes, paid requests, merge, push,
or production deployment is included. Human merge and release authority remain
separate. Preserve existing feature artifacts and audit history.

## Handoff

Architect: specify the static asset, metadata integration, public access
behavior, and focused verification. Senior developer: plan a small change
manifest and implement only after independent spec/plan approval. This user
request authorizes proceeding through the org's local design/build/test gates;
it does not authorize merge or release.
