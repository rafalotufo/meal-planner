# Brave parallel recipe search — independent code review, round 2

- Reviewer: reviewer, independent of implementation author and security reviewer.
- Application source: `e14feec6e8a1cb20a56a23c85524e61623110022`.
- Reviewed against baseline `ce07559`, prior reviewed source `2989467`, approved
  intent/spec/plan, heading amendment and owner timeout amendment `348baf0`
  independently approved in `03cb9fc`.
- Verdict: **Approved. No remaining blocking code findings.**
- This resolves round 1's required P2 on the corrected source only. The original
  `code-brave-parallel-001.md` report and its changes-requested history remain
  evidence about `2989467`; that old source is not retroactively approved.

## Bugs

The instruction-ItemList correction `dc1c778` resolves the required finding.
Bounded JSON-LD traversal tracks whether a node belongs to a Recipe's
`recipeInstructions` subtree. Instruction ItemLists therefore reach the existing
method extractor; separate page ItemLists, CollectionPage nodes, collection URL
and title cues remain collection signals. The regression verifies both exact
method extraction and successful curation of the standalone recipe, and genuine
page-list expansion with an embedded Recipe. Identity, canonical, title and
source-evidence checks are unchanged.

The timeout implementation starts an absolute 8000ms per-item deadline before
shared-model-pool acquisition. It checks that deadline immediately before paid
work starts and immediately after complete curation returns, preventing late
queued starts and late accepted output even before timer dispatch. The child
signal covers headers, body reading and validation. Valid completed siblings
survive local expiration; no cards plus any expiry returns SEARCH_TIMEOUT before
explicit rejection can produce an empty success. Parent abort is rechecked
before partial results and in the outer error path.

The deterministic tests cover valid sibling preservation, all-expired and mixed
rejection/expiry behavior, parent abort overriding a completed sibling, queue
expiration without late model work, scheduling-delayed timer boundaries, and
pending body cancellation. They assert actual outcomes, paid-call counts and
whether subsequent pool work starts, rather than merely checking the timeout
constant.

## Security and resource control

The model pool still owns the underlying operation until it settles, including
abort-ignoring transport and response-body cancellation cleanup. Caller timeout
removes queued work or stops waiting for active work; it does not release an
active lease prematurely. Shared source/model caps, bounded queues, per-search
request/call/byte/output budgets, source SSRF protections and source-associated
quote requirements are unchanged. No retries, replacements, provider fallback,
extra source/photo pass or additional paid validation was introduced.

## Compliance and verification

Only two application modules and their focused tests changed since round 1:
source extraction and parallel orchestration. The previously reviewed twelve-card
notebook chunk checks, per-source partial lookup states, stale-selection guards,
save-version reconciliation, six-source server bound and family guards are
unchanged. This review carries forward round 1's conclusions on that unchanged
implementation and resolves its one required correction.

I independently reran `pnpm test` on final source: **112 passed, 0 failed,
0 skipped**, exit 0; local output is
`/private/tmp/brave-reviewer-final-tests.log`. No application/test file was edited,
no paid call or database action occurred. The developer's recorded final
verification reports 264 Node tests and 7 Python tests, lint, typecheck, build and
real Chrome at 390/1440 widths passing; those broader checks were read rather
than independently repeated here. Formal security approval remains separate.

Historical live results describe source `2989467`, preceding both final fixes:
named query eight cards in 9.701s; corrected broad query one card in 8.163s.
They do not prove final-source live latency or ten/twelve useful live cards.
The weak broad recall is explicitly retained as a limitation and separately
accepted for local functional scope by PM report
`brave-parallel-product-acceptance-001.md`; it remains material to human release
acceptance. This code verdict authorizes no further paid requests, main merge,
hosted operation, deployment or release.
