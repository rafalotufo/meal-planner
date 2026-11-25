# Hosted verification browser helper — bounded plan

- Author: senior-developer; date: 2026-11-25
- Status: Prepared; root brief-plan review and independent helper review001 found no blockers
- Fixed application release source:19774c7cd8ae301682003838f083b9d825d5e56d. The helper is excluded audit tooling and does not change that source.
- Scope: prepare a strict TypeScript browser-only operator helper; root authorizes/runs each hosted check and owns issuance, platform links and cleanup.

## Private input and isolation

Read `HOSTED_BROWSER_INPUT_FILE` from the environment; require a canonical,
owner-only regular input file with exactly `shareableUrl` and `handoffPath`.
Validate bounded HTTPS share URL without userinfo and a Vercel-hosted hostname;
read a canonical owner-only handoff file and validate one selected member's
UUID/run/capability/expiry shape without ever printing values. Width must be
390 or1440 via `HOSTED_BROWSER_WIDTH`; root issues a distinct one-use run for
each width. Create a fresh owned headless Chrome profile for every invocation.
No existing browser profile, app-cookie/header injection, custom DNS, insecure
certificate flag, server/database fixture or provider request is permitted.

## Normal browser path and bounded evidence

1. Navigate the private scoped share link to establish platform access, without
   logging URLs or taking a screenshot while its query is visible. Then navigate
   to the exact canonical HTTPS staging `/verification` page.
2. Use ordinary keyboard Tab/typing and the native form to enter the private
   run/capability. Capture entry only before typing and clear browser state by
   closing the owned profile on every exit. No CDP/log tracing of credentials.
3. Observe native exchange status and exact canonical Origin using only booleans
   and status codes. Navigate to home and `/api/session`, family/menu/plans;
   assert expected landmarks/JSON, no horizontal overflow and bounded completion.
   No provider search or Google sign-in is performed. Screenshots after login
   contain only synthetic data and are stored in a new width-specific directory.
4. Log out normally, then verify session401 and protected-page sign-in redirect.
   One helper invocation covers only its actual width and one native exchange.
   Two independently issued runs provide390/1440 evidence without cookie reuse.
5. Intercept browser requests to reject Google/provider endpoints before effects.
   Permit only the canonical origin, the exact supplied share-link origin during
   bootstrap and explicit Vercel platform assets if root approves them. Never
   follow page-provided destinations. Record blocked/platform challenges as gaps,
   not successful application checks or WAF coverage.

Each CDP command/navigation and the overall run have fixed deadlines. The report
contains only browser/version, width, check/status enums, counts and explicit
Firefox/Safari/real-Google/provider/platform proof limits. On failure emit only a
sanitized stage/status report, no arbitrary protocol error, body, URL or input.
Root retains the private capability files and revokes/cleans the run/link; the
helper neither changes hosted data directly nor claims deployment acceptance.

## Files that change and preparation checks

- `intent/agent-deployment-verification/hosted-browser-plan.md`
- `intent/agent-deployment-verification/hosted-browser.ts`
- `intent/agent-deployment-verification/hosted-browser.test.ts` (pure input/status refusal checks only)
- New screenshot/report directories only when root executes authorized checks.

Before execution: pinned TypeScript and targeted ESLint; pure validation/refusal
checks with temporary fake inputs, without opening Chrome/network. Root reviews
the final helper, exact allowed platform origins, output paths and run scope.
No Git, hosted request, database effect or release action occurs during preparation.

Preparation evidence: two strict TypeScript pure tests passed after their absent
module/function REDs (private shape/permissions/host/width refusal and native303
redirect status observation). Targeted ESLint with zero warnings and full strict
TypeScript checking passed. No browser, remote URL, database or hosted effect was
executed during preparation. Independent review:
`org/reviews/agent-verification-hosted-browser-helper-001.md`.

## Hosted-attempt keyboard diagnosis refinement

Root observed actual platform200, visible canonical form and keyboard entry but no
native exchange request. Before another private capability is used, reproduce
native Enter submission in a new owned offline Chrome/data-URL fixture with dummy
inputs and a submit-event counter. No hosted URL or real credential enters that
probe. Compare the existing key sequence with a carriage-return text/unmodifiedText
sequence, and adopt only the sequence proven to trigger native submission.

Immediately before hosted submit, record only booleans for expected field lengths,
form validity, exact action, canonical page, focus and submit-button focus. Record
actual Browser.getVersion immediately after CDP startup so failed attempts retain
version evidence. Replace one undifferentiated browser-error count with bounded
safe categories/statuses and finite path enums; never emit arbitrary text, URLs,
query values, request bodies, cookie values or protocol parameters. Distinguish
expected blocked Vercel live assets from application/transport/CSP failure without
silently suppressing unrelated errors. The root retains link/run cleanup/reissue.

Additional file: `intent/agent-deployment-verification/hosted-browser-keyboard.test.ts`
(offline owned Chrome probe only). Validation: actual offline native-submit RED/
GREEN evidence, private-input unit tests, zero-warning lint and strict TypeScript;
root reviews the helper-only correction before another authorized hosted attempt.

Actual offline outcome: the original Enter keyDown/up submitted the valid focused
dummy form zero times (RED0 versus1). The shared keyboard event now includes
carriage-return `text` and `unmodifiedText` on Enter keyDown, and the same owned
offline Chrome test submits exactly once (GREEN). Hosted form fields are inspected
only as validity/length/focus booleans before that key. Reports now bind actual
ISO start/end times and Browser.getVersion captured at startup, including failures.
Diagnostics retain only finite paths/statuses/error categories and CSP directive/
origin enums. Exact known vercel.live CSP blocks are marked platform gaps; null
Origin, arbitrary console text and unrelated application failures are not ignored.

## Hosted diagnostic refinement (owner authorized)

The corrected mobile invocation at 15:54:52–15:55:03 UTC completed every application check, but retained its actual failed report because nine platform CSP network failures and the expected post-logout session401 log were counted as errors. Preserve that report unchanged. The helper now correlates Network.requestWillBeSent request IDs with exact HTTPS vercel.live Script origins before treating a matching CSP loading failure as a platform gap. Unknown IDs, lookalike origins, document requests, non-CSP failures and canonical app CSP failures remain errors. Post-logout network logs are expected only for the canonical session path during logout and after an actual canonical session401 response is observed; pending logs without that response remain errors. Counts are reported separately. This changes excluded diagnostic tooling only; application source19774c7 is unchanged.

Pure regression RED: two existing tests passed and the new correlation test failed because HostedNetworkDiagnostics did not exist. GREEN: all three pure tests pass, including negative origins/types/reasons, actual response observation, deferred log accounting and failure without a401. No additional hosted invocation or retrospective mobile pass is claimed. Native keyboard events remain unchanged.
