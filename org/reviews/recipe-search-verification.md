# Recipe-search implementation verification

Date: 2026-11-23. Implementation owner: senior-developer. Independent review,
browser verification, and human merge/release gates remain separate.

## Automated checks

| Command | Actual result |
| --- | --- |
| `npm test` | Exit 0; 25 tests, 25 pass, 0 fail, 0 skipped, 0 cancelled. TypeScript services/tests compile before Node's native runner. |
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

## Real-browser evidence

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

Pending configured `OPENAI_API_KEY` and explicit readiness from the CEO/root.
No live provider requests have been made by the implementation agent. A live
smoke must record model/outcome/count/elapsed time and compare actual returned
titles/methods/time/photos/links with the original recipe pages. The completed
fixture tests do not establish live recipe accuracy or photo availability.
This gap prevents claiming full live-search acceptance.

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

Independent code review and live source sampling remain pending. Staged
plan-sync/secret checks and real-browser QA passed at the implementation
checkpoint; they will be checked again for the final handoff. No merge/release
is performed or authorized by this report.
