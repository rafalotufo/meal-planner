# Recipe search notebook — specification

- Status: Approved
- Approval: independent review org/reviews/design-recipe-search-notebook-001.md.
- Based on: sibling intent.md and the two design decisions in this chat.
- Delta from: intent/recipe-search/spec.md and intent/recipe-photos/spec.md.

## Behavior and visual contract

1. A compact Meal Planner header, warm stone background, serif search heading,
   accessible description field and prominent Find recipes action introduce the
   page. Retain the existing query ID, 1–1,000-character validation, abort/stale
   response guards, one pending submission, source links and image safeguards.
2. A successful response creates a newest-first search group labeled with its
   submitted description and recipe count, including zero-result searches.
   Distinct submissions have distinct IDs, even for identical queries. The
   newest group opens; selecting an earlier group opens it and collapses the
   previous group. Selecting the open group collapses it. Query text is rendered
   as text, wraps fully, and is never used in a URL, persisted, or logged.
3. Existing groups remain available during loading, validation/network/provider
   errors. Failed searches do not create a group. A successful search clears the
   previous error and opens its own results. Reload/navigation discards history;
   the page explicitly says searches are kept here until refresh. No arbitrary
   history truncation or cross-user storage is introduced.
4. All recipes restores every result in that selected search. Chickpeas/Pasta
   pills are available only when a title matches a whole-word singular/plural
   ingredient label. Do not infer ingredients from a search query, image,
   summary or source. Copy states that these pills match titles.
5. The “25 min or less” pill is available when at least one recipe has a clearly
   parsed total time <=25 minutes. Cook-only, missing, ranged, approximate,
   comparative and ambiguous time strings do not qualify. Accept plain numeric
   minutes/hours and exact hour+minute combinations, including standard English
   unit abbreviations. Never reinterpret cook time as total time.
6. Pills are mutually exclusive, expose aria-pressed and a visible checkmark,
   and filter only the selected group's cards. Each group remembers its filter
   and sort selection when reopened. A count announces the visible/total result
   count. Sorting supports original best-match order and quickest known total
   time first, with unknown totals last and stable ties. No pill, sort or group
   action makes a network request.
7. Cards show the original photo or Photo unavailable, full title, publisher
   hostname, summary, the original cook/total time distinction and View recipe
   source action opening a new tab with the existing rel/referrer protection.
   Do not invent nutrition, dietary claims, ingredients or recipe previews.
8. Use one card column on mobile, two on tablet, three on desktop; search action
   stacks on narrow screens. Controls wrap with >=44px touch targets, >=16px
   editable text, visible keyboard focus, no horizontal page overflow at
   320/390/768/1024/1440px, and no clipped long descriptions/titles. Announce
   loading, search outcomes and filtered counts; show useful initial, loading,
   validation/error and zero-result states without erasing previous searches.

## Architecture and scope

Keep authentication in the server page before effects and preserve all auth,
provider, photo transport and server-only identity boundaries. Use strict TS,
small React components and static Tailwind v4 utilities; no dependencies or
network assets. Keep the existing client-side fetch event handler. A pure,
client-safe notebook module owns history transitions, evidence-based filters,
conservative time parsing and immutable sorting for direct native-runner tests.

Example style: `const visible = filterRecipes(entry.recipes, entry.filter);`.
Tests are TypeScript under tests/recipe-*.test.ts, compiled with the existing
compiler for Node's native runner. Extend the isolated Chrome/auth browser
helper for the integrated history/filter flow, labeling intercepted search
responses separately from live evidence; no paid provider requests.

## Acceptance and boundaries

Run frozen installation, pnpm test, pnpm run lint, pnpm run typecheck,
pnpm run build, pnpm run test:auth, Python unittest discovery, deployment smoke
unit tests, staged secret scan and plan-sync checks. Verify actual browser
rendering and keyboard behavior at the widths above, with two successful
searches, pill and sorting interactions, error/loading retention, zero results,
long text, image fallback and reload clearing. Independently review design,
implementation and security; keep human merge/release gates.

Always preserve published source evidence and checks. Do not change allowed
identities, cookies, auth policy, provider schemas, transport bounds, dependency
pins, lockfile or production configuration. Saved history, ingredient-list
verification, nutrition, favorites, meal calendars and real recipe previews are
out of scope. No open product questions remain for this agreed design.

## Primary documentation

- https://react.dev/learn/updating-arrays-in-state
- https://react.dev/reference/react/useEffect
- https://tailwindcss.com/docs/responsive-design
