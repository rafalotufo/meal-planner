# Recipe result count — independent Production review

- Date: 2026-11-24
- Reviewer: independent `review_result_count` agent
- Final verdict: completed release handoff approved; no blocking discrepancy found

## Attribution and authority

The committed staging-acceptance and release-authorization gates independently
verify with `--require-committed`; both bind exact source
`4e66fb7bf1e9887c6c88e89fae984005ff02f118`, accepted Preview/profile/gaps,
existing project and bounded Production/health/recovery scope. The audit gate
commit is7a13cc3, distinct from uploaded source. Sanitized submit, packaging,
promotion and readback consistently identify separate Production candidate
`dpl_3SxzdzyhmxP1sgodCvzTdUnsPAUw`, correct project/owner, READY, Node24.x and
manual promotion21:23:31.564273Z. Production aliases point to that candidate;
stable staging remains on its accepted Preview. No blocker found in this scope.

## Duration proof limitation

The exact source route declares Node runtime and `maxDuration = 90`; unchanged
`vercel.json` retains search cancellation. Deployed functions metadata confirms
`supportsCancellation: true`. Source/config/dependencies match the previously
released saved-menu application except for the single recipe prompt line. The
project-wide Fluid300-second default is not a route-specific90-second readback
and is not evidence that the route override was removed.

Vercel's [duration documentation](https://vercel.com/docs/functions/configuring-functions/duration)
documents the in-function `maxDuration` export for modern Next.js. This supports
the configuration mechanism, not an empirical timeout observation. The
[CLI inspection documentation](https://vercel.com/docs/cli/inspect) describes
deployment information/build-log inspection; its
[debugging guide](https://vercel.com/docs/functions/debug-slow-functions) suggests
`vercel inspect` for configuration. I ran read-only inspect with pinned
scripts-disabled CLI66.6.0 against this exact Production ID: exit0, no
max-duration/timeout/90s/300s output lines. Raw output/log content was not printed.
The initial sandbox attempt exited1; the network-enabled retry succeeded.

The official [deployment GET reference](https://vercel.com/docs/rest-api/deployments/get-a-deployment-by-id-or-url)
does not establish a documented route-specific effective-timeout inspection
contract. The already inspected owner deployment/file inventories did not expose
that value either. I found no additional documented CLI/API read that would
prove the effective search-lambda timeout with the available evidence. This is
not a claim that no such platform interface exists.

Consequently retain the exact statement: the uploaded configuration declares90
seconds, cancellation metadata is confirmed, unchanged-source/config parity
supports preserving the intended configuration, but hosted effective90-second
timeout was not directly read back or measured. Do not equate Fluid300 with the
route setting or mark a timeout test passed. No function invocation, mutation,
paid request, secret inspection or further approval is needed merely to repeat
the existing documented configuration evidence. No new discrepancy suggests a
configuration correction; leave the accepted functional gaps explicit.

## Completed health review

Independently checked sanitized `observation.json`, `final-reconciliation.json`,
Production/Preview readbacks, accepted/current inspection and `error-counts.json`.
The final receipt is named `final-reconciliation.json`, not `final.json`.
Additional read-only local assertions passed: all16samples have `pass: true`,
observation is complete, the final21:38:32.019Z sample follows required
21:38:31.564Z, exact source/deployment/owner/project attribution agrees, both
deployments are READY in their intended targets, accepted/current project/domain/
environment metadata match, and deployed search cancellation remains true.

Final reconciliation at21:38:57.292873Z confirms Production3Sxz/source4e66fb7,
all intended Production aliases, and unchanged accepted stagingGWbc/source4e66fb7.
Scoped runtime error/fatal and request5xx queries return zero records, no
continuation and no excluded intervals. The query request ends at the final
sample; the requests summary expresses times at whole-second precision, unlike
the millisecond runtime range. This is scoped reporting evidence, not a claim
of exhaustive event detection or finer platform timestamp precision.

The smoke implementation verifies root307 to the canonical same-origin sign-in,
sign-in200, session/search401 and no-store with an empty anonymous search POST.
These checks do not incur provider usage. Their16passes establish the approved
minimal health contract and bounded observation; no recovery was needed.

Completed handoff retains accepted missing real OAuth/member/provider/photo/
cancellation/WAF functional coverage and the route-timeout readback limitation.
The local paid six-result samples are not Production functional evidence. No
missing check or inconclusive helper has become a fabricated pass. No recovery,
mutation or new function invocation was performed by this reviewer; the earlier
read-only CLI inspection is documented above.

The operator subsequently reports concurrent local main201a496 carrying a
separate weekly-search copy change. That newer main is not this accepted or
deployed release source and is not certified by this review. Any audit-only
integration must preserve that concurrent work and the fixed deployed4e66fb7
record; it must not imply deployment or staging validation of moving main.
