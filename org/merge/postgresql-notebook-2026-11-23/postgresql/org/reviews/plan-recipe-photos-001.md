---
artifact: intent/recipe-photos/plan.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent recipe-photo build-plan review

## Findings

No blocking findings or nits. Approved for implementation under the org plan
peer-review gate, retaining the plan's dependency and verification checkpoints.

## Concrete coverage and sequencing

- Read active loop/work item, accepted photo intent, approved spec/research,
  complete plan and independent security-design verdict. The manifest at
  `intent/recipe-photos/plan.md:23` covers exactly the transport, pure selector,
  shared enricher, handler/composition changes, TypeScript tests, exact dependency
  files and required documentation/evidence. Existing test glob/compiler already
  include the new sources, so no runner/config/gate expansion is needed.
- The network boundary is the first behavioral slice (`plan.md:68`). It tests
  all-address A/AAAA validation, selected-address pinning and lookup callback
  shape, original TLS/Host identity, credential-free requests and resource
  cleanup before metadata selection or integration. Its classifier check
  explicitly retains the approved IPv6 global/range restriction instead of
  assuming a library's generic unicast classification is sufficient.
- The independent pure selection slice (`plan.md:92`) tests exact source/page
  identity before ranking, all approved Recipe image shapes, unknown versus
  declared dimensions, grouped OpenGraph metadata, and rejection of related
  recipes/unsafe URLs. Base tags, remote contexts and arbitrary body images
  cannot contribute evidence. This directly addresses the three intake cases
  rather than introducing general crawling or guessed image variants.
- Integration starts only after both boundaries (`plan.md:113`). Its fixtures
  cover cross-search two-job admission including DNS, six-source deduplication,
  saturation without queuing, original-deadline propagation, soft timeout before
  the hard deadline, parent cancellation, cleanup and immutable returned cards.
  No non-photo field, order, card count, API shape or provider boundary changes.
- Every behavioral slice requires failing TypeScript tests before its minimum
  implementation (`plan.md:17`); existing 34 app and seven Python regressions
  remain. The real-source/CUA handoff (`plan.md:144`) verifies selected metadata,
  natural image sizes, loaded photos and fallback on the exact three publishers
  without another paid LLM call. Simulated-provider and actual metadata/photo
  evidence are distinguished, so this does not mislabel a fixture as live
  recipe discovery or weaken access rules to claim universal coverage.

## Dependency evidence

The repository dependency report was still being written at review start.
Independently inspected the prospective files under
`/private/tmp/meal-planner-recipe-photos-dependency-review/` and compared its
generated lockfile directly with the unchanged application lockfile:

- Eight added package entries, zero existing version changes, zero removals;
  every addition has integrity and none has an npm install-script flag.
- Direct versions are exact `htmlparser2@10.1.0` and `ipaddr.js@2.5.0`.
  Inspected published script/export/type metadata: the parser has CommonJS and
  ESM exports plus types, and the IP classifier has types and a compatible Node
  engine. Build/prepare/developer scripts were read as data, not executed.
- Prospective full audit metadata reports four moderate findings, no high or
  critical; production audit reports zero findings, consistent with the prior
  dev-only baseline. These are the orchestrator's actual audit outputs read by
  this reviewer, not an independently invoked network audit.
- The temporary directory has no `node_modules`. Application dependency/lock
  files were not changed by this review. Task 1 correctly requires scripts-off
  installation after approval, comparison of the actual delta with this reviewed
  graph, recorded native audits, and return to review for unexpected packages,
  scripts or new reachable high/critical issues (`plan.md:52`). Before finalizing
  this verdict, read the now-persisted
  `org/reviews/recipe-photos-dependencies.md`: its exact versions, graph delta,
  script observations and audit results agree with the inspected temporary files.

## Verdict and limits

Approved. The plan concretely implements the approved source-binding, pinned
network, parser, shared-admission and fail-soft contracts without unrelated UI
or infrastructure scope. `git diff --check` passed. This document review made
no application/dependency changes, installs, network/provider calls, secret
reads, status/loop/graph/ledger mutations, commits, merge or release. Actual
implementation checks, independent code/security reviews and human merge/release
gates remain required.
