# Searchable recipe swap picker — specification

- Author: architect
- Date: 2026-11-24
- Status: Approved
- Approval: independent reviewer, `org/reviews/searchable-swap-picker-plan-001.md`
- Inputs: accepted sibling intent; `org/reviews/intent-searchable-swap-picker-001.md`
- Approved visual reference: `intent/weekly-meal-planning/preview/swap-picker-preview.html`

## Outcome and boundaries

Replace each editable recipe card's text select with a **Suggest swap** button
opening a searchable, visual saved-recipe dialog. Choosing a card selects only;
a separate **Suggest swap** confirmation sends the existing planning action.
Use actual validated saved titles/photos, never the prototype's sample assets.

Keep one-to-seven canonical-unique planned recipes, undated cards/main header,
immutable history, stale-revision409, approval reset and retained unrelated
suggestions unchanged. No migration, dependency, provider/photo retrieval,
scheduler, auth-policy, Proxy matcher or deployment change. Existing family
admission/guard/header behavior remains mandatory.

## Protected full-menu title search

Extend existing protected `GET /api/menu` and its HEAD alias with optional `q`
alongside existing `after`. Accept each parameter at most once; reject unknown
parameters, duplicate q/after and malformed cursors with400. No q preserves the
current API response, order and pagination semantics exactly. Empty/whitespace q
means the same unfiltered listing; absent q is still accepted by all old callers.
POST save/lookup/remove query/body rules are unchanged, so q on POST is invalid.

A pure search parser accepts only well-formed strings, trims surrounding
whitespace and permits at most100 UTF-16 code units after trimming. Reject control
characters U+0000–001F/U+007F, nonstrings and overlong values; do not truncate.
Preserve literal internal spaces, punctuation, percent, underscore, quotes and
Unicode. Search is case-insensitive title substring, without accent folding or
full-text/token semantics. Use a bound query such as
`strpos(lower(title), lower($query)) > 0`, never interpolate SQL or treat `%`/`_`
as wildcard operators. App title/snapshot limits stay unchanged.

Preserve `listMenuRecipes(db, identity, allowed, after?)` callers by adding an
optional final search argument, or a separate small wrapper using the same
bounded listing implementation. Store validation is authoritative even for
direct callers. Recheck `requireMember`; derive family from that current user.
Combine family, literal-title filter and existing `(saved_at,id)` cursor predicates
in one query, ordered saved_at DESC/id DESC and LIMIT51. Return only50 entries and
existing last-entry cursor when another result exists. Search must reach entries
older than the default first50 without loading the full menu. Cursor order applies
within the current search result; clients reset after when q changes. An unrelated
well-formed cursor cannot alter family scope. No global counts or owner fields
are added to MenuPage `{ entries, nextCursor }`.

Keep the exact existing `menuApiResponse` guard and family/session calls on all
methods: canonical Host, current JWE/session-token binding, current admission,
server-derived family scope, private/security headers and protected405. Search
is a read only; GET/HEAD cause no save, suggestion, generation or other writes.
Existing statement timeouts bound query work; do not add indexes or migrations.

## New response validation

New modal GET responses must be parsed as unknown and validated before use.
Add a pure `parseMenuPage` next to existing menu validators: exact top-level keys,
array length0–50, each entry accepted by `parseSavedMenuEntry`, canonical unique
entry IDs/source URLs, descending savedAt/id order, and nextCursor null or a
valid canonical cursor equal to the final visible entry's encoded position.
A nonnull cursor requires50 entries; zero entries must have null cursor.
Reject malformed/oversized/extra-field payloads, never cast JSON to MenuPage.

Bound the new client's response read to512KiB before JSON.parse (sufficient for
50 existing maximum-sized validated snapshots), with the same cancellable request
deadline as its fetch. Invalid UTF-8/JSON, oversized data or failed shape validation
becomes a recoverable loading error; never show malformed recipes/photos. This
adds no server response-shape change and no unchecked type assertion.

## Dialog presentation and saved images

Create `app/plans/swap-recipe-dialog.tsx` as a small client component, composed
by PlanControls. Use native `<dialog>.showModal()` with aria-labelledby and
aria-describedby, a serif “Choose a replacement” heading, “From your saved menu”
eyebrow, replacing-title context, labelled search input, results/status area,
selectable cards, selection summary, Cancel and explicit Suggest swap footer.
Use static Tailwind utilities matching the approved white/stone/emerald palette,
border, rounded corners and restrained shadow. Do not paste preview HTML/script,
widget state or inline styles into the application.

At desktop use a max-width around700px and three-column result grid. At narrow
mobile widths use compact rows with a roughly96px square thumbnail and wrapping
title. The dialog fits320px and available viewport height, scrolls internally,
and keeps controls practically reachable without horizontal overflow. A small
close button has a44px target. Body/footer may be flex/scroll regions within a
viewport-bounded dialog; do not trap content outside the scrollable area.

Cards are native `type=button` with aria-pressed and a visible Selected badge;
use a simple labelled group, not a grid/radio role requiring an unimplemented
keyboard model. The title is the accessible choice name. Render saved imageUrl
only after strict response validation, via existing `next/image` pattern:
unoptimized, lazy, no-referrer, reserved aspect ratio/object-cover, onError fallback.
Use empty image alt when the adjacent title already names the button. Missing or
broken URLs show a stable “Photo unavailable” fallback; errors are scoped to the
current URL, not every future recipe. No sample CDN image, optimizer request,
server proxy, image discovery or provider effect is introduced.

Every editable recipe card has a Suggest swap trigger even when the current
server menu page is empty or all its recipes are already planned. Opening the
modal queries the newest full-menu page independently of legacy menuAfter.
Do not infer that the family has no replacements from its initial page. The
obsolete main-page Saved dinner pages/select instructions may be removed;
existing menuAfter query acceptance can remain backward-compatible. `/menu`
listing/pagination remains unchanged.

## Search, pagination and selection lifecycle

On each opening start a fresh dialog instance, clear query/selection/errors,
show the newest bounded menu page and focus search immediately. Always GET the
newest page; using a correctly identified initial newest-page snapshot while
revalidating is optional, but no initial prop may replace full-menu search.
Exclude all currently planned canonical source URLs from available choices.

Debounce typed queries about250ms. On every query change immediately clear
selection, reset cursor and stale result choices, abort the previous GET and
clear its debounce/deadline; do not leave an old query's selected recipe
confirmable while waiting. Blank search resets to newest unfiltered results.
Search input is not a suggestion-submit form; Enter there must never POST.

Use newest/older paging, replacing rather than accumulating the50-entry page.
Changing page clears selection and cancels the previous load. “Newest matches”
resets its cursor; “Older matches” uses the validated nextCursor with the same q.
An all-planned page still exposes Older matches when available. Do not stop
paging merely because local filtering left zero available cards. Changing query
never carries a prior query's cursor. A selected recipe must belong to the
currently visible validated, unplanned result page; hiding it clears selection.

Show truthful **available recipes on this page** counts, not fake full-menu totals.
Distinguish loading, empty saved menu/unfiltered results, no title matches,
results whose recipes are all already planned, and failed page loads. All-planned
results explain exclusion and offer older results/search. Empty/no-match states
can offer Clear search or Menu/search navigation as appropriate. Error states
retain a labelled Retry action for the same query/page.401 offers sign-in;
403 offers current access recovery. Loading/error responses do not look like an
empty result and cannot preserve a confirmable stale selection.

Give each GET its own AbortController and12-second deadline. Abort on query/page
change, dismissal and unmount. A monotonically increasing request/instance token
must guard success, error and finally handlers, including races after fetch
resolves but JSON validation is still pending. Superseded/aborted requests cannot
replace current results, clear a newer request's loading state or announce an
old error. Clear timer/debounce/reader resources in all paths. Do not add polling.

## Submission and interaction safety

Capture the opened **plan id, revision and slot index**; never silently retarget
a modal choice after new props or another plan appear. A choice only updates
local selection. Explicit confirmation sends exactly the existing body
`{ action:'suggest', revision:openedRevision, day:openedSlot, menuRecipeId }` to
`/api/plans/{openedPlanId}` through PlanControls' single global mutation guard.
No extra endpoint or action union is introduced. The server's current family,
uniqueness/menu-existence and stale-revision checks remain authoritative.

Refactor the existing parent submit path only enough to report bounded outcome
status/message to the dialog and refresh after success. The same inFlight guard
covers approve/accept/reject/finalize and modal confirmation; quick repeated
confirmation cannot send another POST. Disable confirmation when no selected
visible recipe, a GET is outstanding/failed, another mutation/refresh is pending,
or that dialog instance has an outstanding submission.

Keep the dialog open on a failed suggestion with an accessible error and recovery:
409 explains stale/duplicate/existing-suggestion conflict and offers refresh or
choose another;401/403 offers existing access links;503/timeout allows a retry
without claiming the request had no effect. Reuse safe bounded server error text
handling; no SQL/configuration/internal detail is exposed. A response may arrive
after the user closes/reopens or changes plans: bind completion to the original
dialog instance so it cannot close, reset or show errors in a later dialog.
Parent feedback/refresh can still report the real operation's outcome.

Native dialog makes the background inert and contains Tab/Shift+Tab focus.
Initial focus is the labelled search field; native choice buttons support
Enter/Space. Escape, Cancel, close button and deliberate backdrop click dismiss
without a suggestion POST before confirmation. Use the existing removal dialog's
pointer-down + outside-bounds click pattern, not any click whose target happens
to be dialog padding. Close native dialog before focus return. Return to the
opening trigger if still connected, otherwise the plan heading or a suitable
visible plan control. No new keyboard trap implementation or autofocus on the
whole plan page.

Dismissal is allowed even during a request. It cancels GET work and clears modal
state; it does not imply that an already-sent mutation was rolled back. The parent
keeps its mutation guard until completion/deadline and reports the result. On
success dismiss only that original instance, announce the saved suggestion and
refresh the plan, preserving normal approval/swap/finalization behavior.

## Verification and source grounding

Architect read installed Next16.4.6 Image reference and Server/Client Components
guide, inspected existing RecipeCard and native removal dialog, and reviewed the
approved preview plus existing guarded menu route/store. Keep server reads/native
bound pg SQL and browser-only dialog effects in their current boundaries. No
new dependency, asset policy or framework configuration is needed.

Tests-first strict TypeScript covers q validation, literal `%`/`_`/quotes,
Unicode bounds, omitted/blank q compatibility, >50 matching/nonmatching menu
entries, descending cursor pages, isolation/admission/security headers, malformed
response pages and no GET writes. Real Chrome uses only owned server/profile/test
database and existing test-only Google/CDP fixtures. Exercise both320/1440:
opening/search focus, compact rows/desktop grid, saved thumbnail/null/broken
fallback, search beyond first50, page changes, real keyboard selection, no POST
from selection/Enter-in-search/cancel/backdrop/Escape, focus containment/return,
explicit one POST, stale409 recovery, retry/401/403, delayed response cancellation
and reopening races. Preserve all prior planning uniqueness, carry-forward,
approval reset, revision, no-dates and final/history checks. Record screenshots
and visually inspect representative mobile/desktop modal states.

Preserve the live owner dev server and preexisting `next-env.d.ts` diff. Build/
verify in a private source-equivalent copy with pinned dependencies and owner-only
fixture configuration; do not overwrite the owner's `.next`. No development or
hosted data/schema writes, paid calls, scheduler activation, push/merge/deployment.

## Implementation clarification — explicit Unicode lowercase locale

Approved by orchestrator during implementation, pending independent final source
review. An owned native PostgreSQL17 fixture uses a default C locale: plain
`lower('CRÈME')` returned `crÈme`, so default-locale lower() does not satisfy the
intended accented-title case behavior. The same fixture exposes the predefined
ICU root collation and `lower(... COLLATE "und-x-icu")` returned `crème`.

Use a static schema-qualified existing collation on **both** lowercase operands:

```sql
strpos(
  lower(title COLLATE pg_catalog."und-x-icu"),
  lower($query COLLATE pg_catalog."und-x-icu")
) > 0
```

The query remains a bound literal substring search using ICU root lowercase
mapping, without accent folding, Unicode normalization or full Unicode casefold
claims. This clarifies the illustrative plain lower() predicate above; q limits,
family ownership, cursor bounds and response shape stay unchanged. Keep existing
saved_at/id ordering and cursor semantics; do not apply the search collation to
those comparisons. No CREATE COLLATION, extension, migration or runtime schema
change is authorized. Do not fall back silently to default/ASCII matching or
post-filter a bounded result page in JavaScript, which could miss older matches.

The observed native fixture supports this exact collation. Hosted Neon availability
has not been checked here: an exact schema-qualified collation/lowercase smoke
query is a required **read-only pre-release compatibility check** on each approved
hosted release target. No hosted access or deployment is authorized by this note.
Absent support must be reported before release for a reviewed compatibility
choice; it must not trigger automatic hosted/schema configuration changes.

PostgreSQL17 documents collation-sensitive case conversion and the predefined
ICU root collation in its official [collation support reference](https://www.postgresql.org/docs/17/collation.html).


## Follow-up bug amendment — stable dialog frame during search

Status: Pending independent approval before source edits. Source: owner's report
that the modal size flickers while typing a search. This changes presentation
geometry only; all search/network/selection/mutation/access behavior stays intact.

Code-grounded diagnosis: `reset()` correctly removes stale page choices and
selection immediately on query changes. The dialog and its flex wrapper currently
have only maximum-height constraints, so their intrinsic height collapses to the
short loading/no-match/error content and expands when result cards return. Native
centering also moves the top edge when that height changes. The response lifecycle
must continue clearing stale choices; retaining old results to mask resizing would
violate the existing correctness contract. Real-browser red geometry measurements
must confirm this diagnosis before the CSS correction is applied.

Use a stable, explicitly viewport-bounded dialog frame for the current viewport,
with the existing capped width and a concrete height such as
`min(52rem, calc(100dvh - 2rem))`. Make the inner flex wrapper fill that frame so
the min-height-zero, flexing result region owns remaining space and scrolls.
Preserve the existing outer vertical-scroll escape for very short viewports or
long header/footer content; search, close, Cancel and confirmation remain reachable.
Do not add JavaScript height measurement/state, delay stale-data clearing, keep
old results confirmable, or add an animation that hides intrinsic resizing.

At a fixed viewport, the dialog's x/y/width/height remain stable (within1 CSS pixel)
while typing, debouncing, loading, showing populated/empty/no-match/error pages,
and selecting a recipe. Viewport changes may resize the frame normally. Retain
320px compact rows, desktop grid,44px close target, long-title wrapping, internal
scrolling and all native focus/dismissal behavior. Main-page/history semantics,
protected API, response bounds, request guards and explicit one-POST confirmation
remain unchanged.

Regression proof uses actual dialog bounding rectangles at widths320/768/1024/
1440 with ordinary height1000, plus320×568. Start with populated results, type a
query with a controlled delayed GET, sample successive typing/loading frames,
then no matches and populated matches; also compare error and selected states.
Old intrinsic-height CSS must fail this regression. After the CSS correction,
geometry remains stable without horizontal overflow and all modal actions remain
reachable. Preserve existing search/race/mutation/planning browser assertions.
