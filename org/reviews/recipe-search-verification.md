# Recipe-search implementation verification

Date: 2026-11-23. Implementation owner: senior-developer. Independent review,
browser verification, and human merge/release gates remain separate.

## Automated checks

| Command | Actual result |
| --- | --- |
| `npm test` | Exit 0; 34 tests, 34 pass, 0 fail, 0 skipped, 0 cancelled. TypeScript services/tests compile before Node's native runner. |
| `npm run lint` | Exit 0; ESLint with `--max-warnings 0`, no findings. |
| `npm run typecheck` | Exit 0; Next route types generated and TypeScript completed. |
| `npm run build` | Exit 0; compiled successfully, TypeScript passed, static `/`, dynamic `/api/recipes/search`. |
| `python3 -m unittest discover -s tests` | Exit 0; `Ran 7 tests in 2.400s`, `OK`. |
| `git diff --check` | Exit 0; no whitespace findings. |
| `python3 scripts/scan_secrets.py --path lib/recipes --path app --path tests/recipe-search.test.ts` | Exit 0; `scan_secrets: 0 finding(s)`. Staged scan remains the orchestrator's checkpoint check. |

No credentials were needed for these checks. No new dependency, test framework,
fixture route, provider bypass, or check suppression was introduced.
The orchestrator replayed all five automated acceptance commands when advancing
implementation turn 4; each exited 0, recorded in `org/loop/history.jsonl`.

## Test-first evidence

1. Validation tests were written before the implementation. The first `npm test`
   failed because `validation.js` did not exist. After implementation, all three
   query/URL tests passed; lint and typecheck passed.
2. Research/curation tests were written before the provider implementation. The
   first run failed because `openai.js` did not exist. After implementation,
   twelve total tests passed, followed by lint/typecheck/build exit 0.
3. The CEO requested TypeScript test scripts during implementation. All new
   tests and fixtures were converted to `.ts`; compiler/package paths and the
   plan manifest were updated. The twelve typed tests passed. The independent
   plan amendment is `org/reviews/plan-recipe-search-002.md`.
4. HTTP boundary tests were written before `search.ts`. The first run failed
   with TS2307 for the absent module and resulting callback inference errors.
   After the endpoint implementation, twenty-one total tests passed. Typecheck
   found a `ProcessEnv` weak-type mismatch in the composition root; an explicit
   configuration object fixed the cause, and typecheck/build passed.

Tests exercise actual service and Request/Response code with injected external
transport/provider/time boundaries. They cover safe URL identity, native
citations/completed search, explicit empty outcome, refusal/incomplete/size
errors, source-specific candidate IDs/title/method evidence, swapped photo/time
evidence, deduplication/six-card limit, sanitized errors, streamed request limit,
invalid inputs/configuration/origin, per-process limits, timeout/abort, and slot
cleanup. Fixtures remain under `tests/` and are never imported by application
routes or client components.

## Security revision: request-body lifecycle

Independent security finding `org/reviews/security-recipe-search-001.md` exposed
that the deadline began after body intake. Three new TypeScript regressions
first produced 24 tests / 21 pass / 3 fail: a never-closing body outlived its
10-ms deadline, caller abort during intake remained unresolved after 100 ms,
and rejected media did not cancel its body. No provider calls occurred.

The request deadline/abort listener now starts before intake. Active capacity
is reserved before awaiting the body; only valid configured searches spend the
twenty-per-minute accepted-search allowance. Abort and rejected/oversized input
cancel readers without awaiting untrusted cancellation hooks, and final cleanup
releases admission/listeners/timers on every exit.

After the fix, all three regressions pass, including an intentionally unresolved
underlying cancellation hook. An additional regression confirms that twenty-five
invalid and twenty-five unconfigured requests still leave the full twenty valid
searches available. Final `npm test`: 25 tests, 25 pass, no failures/skips. This
records implementation evidence; independent security rereview remains required.

## Live-discovered citation representation revision

The first configured endpoint smoke returned controlled `502 SEARCH_FAILED`.
One bounded diagnostic used injected transport around the actual adapter and
printed only sanitized status/type/count metadata, never credentials, headers,
or raw provider error messages. Research returned HTTP 200 / completed, three
completed web-search calls, valid 2,201-character JSON, and eight native URL
citations. Citation display text had been appended inside `sourceUrl` strings;
strict URL validation correctly rejected every contaminated candidate.

A regression reproducing this payload failed before the fix. Following the
architect's representation clarification, the research prompt now restricts
display citations to method/evidence strings. Before parsing JSON, cleanup
removes only bounded native-annotated citation display spans proven to lie
inside JSON strings. It resolves a unique character-index interpretation,
preserves quotes/escapes and underlying URLs, and skips invalid/ambiguous or
overlapping spans. Native annotation URLs remain the sole source authority;
unannotated display text cannot recover a URL or bypass exact citation checks.

Six additional tests cover contamination, astral Unicode and index conventions,
multiple output-text parts, and invalid/overlapping/missing/ambiguous offsets.
After implementation, `npm test` passed all 31 tests. The diagnostic itself did
not establish success; the final end-to-end result is recorded below.

The independent code reviewer also found the live loading status inside an
`aria-busy` ancestor. Root's browser assertion failed before the one-line fix;
the busy ancestor was removed so the status announcement is not deferred.
The final browser rerun passed the assertion that the searching status has no
`aria-busy=true` ancestor while the request is pending.

## Real-browser evidence

Later real-browser live smoke exposed a pre-provider `403`: Next.js constructs
the route Request URL from its bind hostname, which can differ from the direct
Host used by the browser. An invalid-query wire repro confirmed the rejection
without paid provider work. Three additional regressions failed first (31 pass,
3 fail): realistic bind-host/direct-Host matching, malformed/forwarded-host
handling, and duplicate citation spans incorrectly treated as overlaps.

The route now uses the URL's HTTP(S) scheme with strictly validated direct Host,
falling back to the URL origin only when Host is absent. Forwarded headers are
not trusted. Identical native ranges deduplicate before distinct-overlap checks;
separate fixtures cover both outcomes. All 34 tests pass. The final production
wire rerun passed eight cases, including same-origin invalid input returning
400 and foreign Origin returning 403, without provider invocation.

Orchestrator ran the production build at `http://127.0.0.1:3100` with isolated
Google Chrome `157.0.8103.79` and temporary Playwright `1.65.1`. The TypeScript
QA script `/private/tmp/meal-planner-recipe-qa/browser-qa.ts` exited 0. Test tooling
stays outside the application dependencies. Browser response interception was
used for deterministic recipes and failures; these are **simulated**, not live
provider results. No fixture endpoint or application bypass exists.

Passed at 320, 768, 1024, and 1440 CSS pixels: readable layout without horizontal
overflow; labeled form and blank-input error without a request; keyboard focus
and keyboard-only submission;
loading and disabled duplicate submission; three source-linked cards; distinct
cook/total labels; missing/broken-photo fallbacks; empty result; failure/query
retention/retry; recovered photo URL; pending-request cleanup after reload; and
literal rendering/wrapping of long, HTML-like recipe text. The accessibility
snapshot includes main, heading levels 1/2/3, labeled textbox/button, results
region, polite status, articles, and source-specific link names.

Screenshot inspection found loaded-photo geometry at 366×366 while fallbacks
were 366×274.5. The added geometry assertion failed before the fix (exit 1).
After a positioned wrapper/absolute image fix and rebuild, it passed (exit 0):
all three photo areas were 366×274.5. Geometry assertions also passed at every
required width. Updated desktop/mobile screenshots were
visually inspected. Zero uncaught page errors; the only console error was the
expected HTTP 503 resource message from the deliberately simulated failure.

Evidence: `recipe-search-simulated-desktop.png`,
`recipe-search-simulated-mobile.png`, `recipe-search-loading-desktop.png`,
`recipe-search-error-desktop.png`, and `recipe-search-validation-desktop.png`.

The separate TypeScript `api-qa.ts --configuration-absent` exited 0 against the
actual production route: GET 405; blank/unknown-field/malformed JSON 400;
unsupported media 415; over-limit body 413; foreign Origin 403; and missing
provider configuration 503. Every POST response had `Cache-Control: no-store`.
These checks invoked no provider. An initial QA assertion incorrectly expected
400 for Origin; it was corrected to the approved `FORBIDDEN_ORIGIN` 403 contract
without changing application behavior.

## Live-provider evidence

Passed with the authorized local OpenAI configuration. The final TypeScript
`live-browser-qa.ts` submitted a generic vegetarian chickpea/spinach query
through the actual production UI and endpoint: HTTP 200, **21.51 seconds**, two
recipes, default model `gpt-6.2-sol`. This run used no browser interception.
Zero uncaught page errors; no horizontal overflow at 320, 768, 1024, and 1440
CSS pixels. Actual desktop/mobile screenshots were saved and visually inspected
as `recipe-search-live-desktop.png` and `recipe-search-live-mobile.png`.

The orchestrator opened both original pages and checked every returned recipe:

| Original source | Observed agreement |
| --- | --- |
| [Budget Bytes](https://www.budgetbytes.com/curried-chickpeas-spinach/) | Title and short method match; source recipe card explicitly gives total 25 mins. Returned photo URL is the original page's image link and loaded correctly. |
| [Great British Chefs](https://www.greatbritishchefs.com/recipes/quick-chickpea-spinach-curry-recipe) | Title and method match; article and covered-pan step explicitly give cooking time 15 minutes. The page's 20-minute heading was not mislabeled as cooking time. No photo URL was retrieved, so the UI used its honest fallback. |

The independent code reviewer separately opened both pages and inspected the
actual screenshots. This is a successful sampled live evaluation, rather than
a guarantee that every future model response is accurate.

Credential configuration remained ignored: the CEO's `env.local` was removed
after copying its value to root `.env.local` with the expected
`OPENAI_API_KEY` name. No credential values were displayed or committed.
Tracked `.worktreeinclude` contains only `/.env.local`; it applies to future
local Codex-managed worktrees created from a revision containing that file.

## Documentation sources

Implementation follows the approved source references in the specification.
Additional official references checked during implementation:

- [Responses create](https://developers.openai.com/api/reference/resources/responses/methods/create)
  and [hosted web search](https://developers.openai.com/api/docs/guides/tools-web-search)
  for bounded REST requests, tool output and native citation fields.
- [Next Image](https://nextjs.org/docs/app/api-reference/components/image#unoptimized)
  for direct unoptimized images, fixed dimensions and error callbacks.
- [React effect cleanup](https://react.dev/reference/react/useEffect#fetching-data-with-effects)
  for ignoring stale request results and unmount cleanup.
- [Tailwind responsive variants](https://tailwindcss.com/docs/responsive-design)
  and [grid columns](https://tailwindcss.com/docs/grid-template-columns) for the
  static mobile-first layout. The local snapshot skill could not write its
  missing licensed snapshot outside writable roots; its documented engineering
  playbook/gotchas fallback and these official pages were used, without license
  acceptance or snapshot initialization.

## Limits and handoff

Only OpenAI is implemented, behind configurable provider selection. Guards are
per-process; distributed traffic and provider spending settings remain a release
decision. Retrieved methods/photos may be absent; cards omit unsupported values
or use the designed fallback. Grounding validation prevents cross-candidate
mixing but cannot prove the researcher read the original source accurately.

Security initially requested the body-read correction in
`security-recipe-search-001.md`. Independent rereview
`security-recipe-search-002.md` is clear, with 25 tests passing plus an additional
stalled-body/admission cleanup reproduction. The production dependency audit
found zero vulnerabilities. The recorded medium finding was closed with that
rereview as evidence. Actual endpoint validation was rerun against the corrected
production build and passed without provider calls.

Targeted security review `security-recipe-search-003.md` is clear after the
native-citation and direct-Host fixes, independently passing all 34 tests and
additional source-authority/origin probes. Final code review
`code-recipe-search-002.md` is approved, including the bounded spec/plan and
worktree-include amendments. All required automated checks and browser/live
acceptance have passed; final staged plan-sync and diff checks exited 0, and
the staged secret scan reported `0 finding(s)`. Human merge and release
approval remain outstanding. The six-turn agent loop recorded `solved`; the
workflow graph holds implementation at `in_review` for human code-owner merge.
No Git remote is configured, so the reviewable deliverable is the local
`codex/recipe-search` branch; no push, PR, merge, or release was performed.

The endpoint is public: Origin filtering is not authentication and non-browser
clients can replay requests. Existing limits are per process (two active,
twenty accepted searches per minute). Authentication, anonymous bot controls,
shared quotas and global spending policy require a product/release decision;
this feature does not claim to prove a request came from the website UI.

A post-checkpoint fresh-Chrome startup smoke confirmed HTTP 200 and the visible
labeled form. Its stricter zero-console assertion failed on Chrome's automatic
`/favicon.ico` request (404); no favicon exists in the pre-feature foundation.
No application asset failure or uncaught page exception was observed. This
existing icon omission is recorded as public-release polish, without adding an
unrequested asset or changing the reviewed application behavior.
