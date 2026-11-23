---
artifact: recipe-search-notebook-implementation
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: approved
round: 1
---

# Independent security review — recipe search notebook

Approved for local implementation review. No blocking or required security
findings in the inspected delta. This is not human merge or release approval;
final integrated verification remains the implementing agent's responsibility.

## Trust boundaries and threat model

The new data retained is the authenticated user's submitted query and already
returned public recipe data. It is held in this page's React state until refresh
or navigation. Untrusted query, model/source-derived title/summary/time and URLs
remain the relevant inputs. Assets are session/identity isolation, provider
usage, source integrity and the absence of query/credential leakage.

Considered abuse cases: query/model text containing markup; a title or query
being used to construct navigation or network targets; pill/history interactions
triggering new paid requests; state leaking across users or persistence; cook
or ambiguous times being asserted as verified total time; and extraction of the
card accidentally dropping image/link protections.

## Review passes and evidence

- **Security — authorization and isolation:** `app/page.tsx` still awaits
  `requirePageSession()` before rendering. The search route, session reader,
  identity policy and proxy have no implementation diff. Client-safe notebook
  imports include only recipe types and pure logic; no server-only identity
  data or credentials are imported or passed to clients. `initialNotebook` is
  shared only as an immutable empty value; reducer changes return new arrays
  and objects, with no shared mutable result state.
- **Security — injection and disclosure:** `app/recipe-search.tsx` and
  `app/search-notebook.tsx` render the query and result strings through React
  text/attribute escaping. Queries are not URL/path fragments, raw HTML, stored
  browser data or logs. No `dangerouslySetInnerHTML`, browser persistence,
  telemetry or new external service appears in the production delta. Group IDs
  come from local numeric submission identities rather than query contents.
- **Security — requests and source URLs:** the only production fetch remains
  the existing same-origin POST `/api/recipes/search`, with existing query
  bounds and an AbortController. The pending-ref guard additionally prevents
  duplicate requests before a state update renders. Pills, selection and sorts
  only dispatch local reducer actions. The source URL normalization, citation
  grounding and bounded provider paths have no diff. Extracted `RecipeCard`
  preserves source links' `target="_blank"` and `rel="noopener noreferrer"`;
  images remain unoptimized/lazy with `referrerPolicy="no-referrer"`, original
  source URL, and failure fallback. No image proxy or new server fetch exists.
- **Security — SSRF and infrastructure:** the approved all-address-checked,
  pinned HTTPS photo transport, redirect/byte/time/concurrency limits, auth
  exceptions, headers/CSP and production configuration are unchanged. There is
  no new endpoint, server action, dependency, package/lockfile change, database,
  cookie setting or privilege grant.
- **Bugs — evidence integrity:** `lib/recipes/notebook.ts` applies whole-word
  ingredient checks to titles, not query text or summaries. The UI discloses the
  title-matching limitation. `totalMinutes` requires `kind === "total"`, an
  anchored numeric English duration and a positive safe-integer minute value;
  ranges, modifiers, absent data and cook-only times remain unknown. This
  conservatively omits uncertain claims without changing original card data.
- **Compliance — fixtures and scope:** new browser data/interception lives
  only in `tests/auth/browser.ts`, uses the existing isolated Chrome and
  test-process authentication setup, and is not imported into application code.
  The original client response-array cast is retained from the base, not a new
  replacement for server validation. No new trust-boundary relaxation was found.

## Checks performed by this reviewer

- Read the feature intent/spec/plan, `REVIEW.md`, production/client deltas,
  notebook tests, extended browser helper and server-side query/URL/provider
  validation call sites. Did not read secret files or allowed identity values.
- Compared protected/auth/provider/transport/config/dependency paths against
  HEAD: no diff in the inspected security boundary paths.
- Ran `node --test build/recipe-tests/tests/recipe-notebook.test.js`:
  **6 tests passed, 0 failed, 0 skipped**.

The full application/auth/browser/secret/plan-sync command results are to be
recorded in `org/reviews/recipe-search-notebook-verification.md`. No live provider
or hosted security verification was performed for this review; none is claimed.
