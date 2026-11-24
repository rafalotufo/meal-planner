# App icon — specification

- Author: architect
- Status: Approved
- Approval: Independent reviewer; see `org/reviews/app-icon-design-001.md`
- Date: 2026-11-24
- Derived from: sibling `intent.md`, accepted by PM in
  `org/reviews/intent-app-icon-001.md`

## Outcome and scope

Give Meal Planner a recognizable browser tab icon on public and protected
pages. Use an original, simple plate-and-fork food motif: a deep green square
with modest rounded corners and a warm white plate/fork silhouette. Favor
thick strokes and large negative space; omit text, fine details, gradients,
external resources and scripts. Inspect the actual result at 16px and 32px
against light and dark surroundings. Exact path geometry is an implementation
choice within this design.

## Static assets and metadata

1. Add `app/icon.svg`, a self-contained square SVG with a square viewBox.
   Use only static SVG shapes, explicit fills/strokes and no embedded fonts,
   links, scripts, event attributes, animation or foreign content.
2. Add `app/favicon.ico` as a small raster fallback for clients that request
   the conventional favicon URL or cannot use SVG favicons. Its 16px and 32px
   images depict the same motif; generate it locally from the SVG and inspect
   both sizes. No new package or runtime generation is required. Record the
   generation method in implementation evidence.
3. Remove the empty `icons: { icon: "data:," }` override in `app/layout.tsx`.
   Retain the Meal Planner title and use Next.js file-based metadata to emit
   the icon links from these root App Router files on all app pages.
4. Do not add page UI, a manifest, apple-touch icons, PWA behavior, dynamic
   icon routes, client state, dependencies, or external image services.

The installed Next.js 16.4.6 guide at
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md`
documents root `app/favicon.ico`, `app/icon.svg`, automatic icon links and
`sizes="any"` for SVG. This local versioned guide is the implementation source.
File-based metadata avoids manually duplicating framework-generated URLs.

## Routing and security

Extend `isPublicRequest` in `lib/auth-policy.ts` for **only** the exact
`/favicon.ico` and `/icon.svg` pathnames and **only** GET/HEAD. Query strings
remain supported because the proxy passes `request.nextUrl.pathname`.
Do not introduce extension-based, prefix-based or directory-wide exemptions.

Keep the proxy's origin configuration, canonical Host check, security headers
and existing public exceptions. Public icon requests must skip session reads
and therefore have no database, membership, provider or paid-service effects.
They still require the existing valid application authentication configuration;
this change does not bypass the proxy's configuration/Host safeguards.

Unauthenticated sign-in HTML must advertise both valid local icon links.
Requests for emitted icon URLs, including their framework query strings,
must return the correct image MIME type and non-empty valid assets with 200
for GET and empty-body successful HEAD. POST/PUT/DELETE remain protected.
Nested/lookalike paths remain protected. Existing protected page/API behavior
and all session/family/search controls remain unchanged.

## Acceptance and evidence

- Strict TypeScript tests cover the exact public path/method matrix, rejected
  lookalikes and unchanged protection for representative family/search paths.
- Real HTTP tests against the compiled app fetch sign-in HTML, discover the
  emitted icon URLs and verify image responses/HEAD. Use existing test server
  infrastructure with a deliberately unreachable local runtime DB URL to show
  these public reads do not need a database. Do not provision fake production
  identity or contact external providers. Check SVG and ICO content signatures.
- Existing authenticated HTTP or browser coverage confirms a protected page
  inherits the same root metadata once its test identity is admitted.
- Real Chrome checks at desktop and mobile viewport widths verify document
  title, emitted links and successful icon loading without console errors.
  Inspect screenshots of both assets at 16px/32px on light/dark surroundings.
  Report accurately when a headless/mobile viewport cannot expose browser tab
  chrome; successful metadata/loading is separate from a visible tab assertion.
- All required repository regression commands pass; preserve strict checking,
  tests, migration evidence and security controls. Record actual output in
  `org/reviews/` and obtain independent implementation review.

## Boundaries

No migration, database data/configuration change, hosted access, provider call,
credential change, merge, push, deployment or release is authorized. The change
remains local and reviewable until the human merge/release gates are granted.
