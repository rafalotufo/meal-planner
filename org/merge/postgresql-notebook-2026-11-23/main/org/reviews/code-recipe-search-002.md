---
artifact: recipe-search-implementation
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 2
---

# Independent recipe-search code review — final corrections

## Findings (by severity)

No unresolved blocking findings or nits. Both findings in
`org/reviews/code-recipe-search-001.md` are resolved. The additional duplicate
citation-span mismatch identified during this rereview is also corrected.

## Correction evidence

- `lib/recipes/openai.ts:59` limits display cleanup to native-annotated,
  bounded, complete citation displays wholly inside JSON strings. Offsets are
  local to each output-text part; quote/escape state spans parts. Unicode and
  end-index alternatives must resolve to one distinct valid display span.
  Missing, invalid, ambiguous, or genuinely overlapping ranges are not stripped.
- Native annotation URLs remain the independent authority at
  `openai.ts:136`; no display Markdown URL becomes an authoritative source.
  Candidate parsing still requires safe exact normalized citation membership
  (`openai.ts:162`). Source-specific IDs, title/method checks, optional metadata
  evidence, response/context bounds, and tool/token limits remain intact.
- An independent fixture reproduction during review showed one annotation
  yielding a card but an identical duplicate yielding `SEARCH_FAILED`. The
  initial overlap fixture incorrectly asserted that duplicate failure. The
  final `Map` at `openai.ts:73` deduplicates identical spans before the distinct
  overlap grouping at line 103. Separate duplicate-success and genuinely
  overlapping-failure regressions now pass.
- `app/recipe-search.tsx:107` no longer places the live status under a busy
  ancestor. The orchestrator reports a browser assertion failed before the
  change and passes after it, with the full deterministic UI regression green.
  Source structure now permits the progress announcement; this review makes no
  claim of independently running a screen reader.
- Actual browser QA also exposed Next.js request-URL bind-host synthesis.
  `lib/recipes/search.ts:26` now validates direct Host authority under the
  request URL's HTTP(S) scheme, falling back to URL origin only when Host is
  absent. Malformed authorities are rejected and forwarded host/protocol
  headers do not override this application check. Foreign Origin remains 403.
  Realistic bind-host and spoofing tests cover the correction. The orchestrator's
  final actual-route eight-case check passes, including same-origin invalid
  query 400, foreign-origin 403, method/media/body validation and no-store.

## Independent verification and live evidence

- Independently ran final `npm test`: exit 0, **34 tests, 34 pass, zero failures,
  skips or cancellations**. Existing grounding/intake/usage cases remain, with
  new citation identity, Unicode/index, per-part, duplicate/overlap/ambiguity,
  direct-Host and forwarded-header regressions. `git diff --check` passed.
- The prior independent temp-copy mutation bypassing method-evidence matching
  was caught by the existing mismatch regression; tracked sources were not
  modified. The additional security authority probes and final 34-test run are
  recorded independently in `org/reviews/security-recipe-search-003.md`, verdict
  clear. Lint, typecheck, production build and seven Python regressions are the
  developer/orchestrator's recorded passing checks, not reruns by this reviewer.
- The orchestrator's fresh actual Chrome search returned HTTP 200 in **21.51 s**
  with two live recipes using the default `gpt-6.2-sol`, zero uncaught page
  errors, and no overflow at 320/768/1024/1440 pixels. Deterministic browser
  flow/geometry/accessibility regression also passed again. These runtime
  executions were performed by the orchestrator, separate from fixture tests.
- Independently inspected the actual live desktop/mobile screenshots
  `recipe-search-live-desktop.png` and `recipe-search-live-mobile.png`:
  source-linked cards are readable; one source photo loads and the other card
  uses the intentional fallback; cook and total time labels remain distinct.
- Independently opened the original [Budget Bytes recipe](https://www.budgetbytes.com/curried-chickpeas-spinach/):
  its title, skillet method, and explicitly stated total of 25 minutes support
  the displayed card. The orchestrator also matched the loaded photo URL to
  the original page's recipe image.
- Independently opened the original [Great British Chefs recipe](https://www.greatbritishchefs.com/recipes/quick-chickpea-spinach-curry-recipe):
  its title and method support the second card. The article explicitly calls
  the cooking time 15 minutes, so the displayed cook-time label is supported;
  the page's separate 20-minute headline was not mislabeled. A missing retrieved
  image remains an honest fallback. This is a sampled live acceptance result,
  not a guarantee about all future search outputs.

## Artifact amendments and verdict

Explicitly approved the bounded specification/plan amendments for native
citation representation cleanup and direct browser authority handling. They
correct observed integration behavior while retaining the accepted grounding,
provider, resource and security contract. Also approved the CEO-authorized
`.worktreeinclude` / README / plan amendment: only ignored root `/.env.local`
is listed for future local managed worktrees; no credential value is tracked.
The official worktree behavior was independently checked in round 1.

Approved for the org code-review gate. Only OpenAI is implemented behind the
configurable provider interface; future providers, public proxy/shared usage
controls, and release decisions retain their documented boundaries. No new
paid API request, secret read, app edit, status/loop/graph/ledger mutation,
commit, merge, or release occurred in this review. Human merge and release
authorization remain outstanding.
