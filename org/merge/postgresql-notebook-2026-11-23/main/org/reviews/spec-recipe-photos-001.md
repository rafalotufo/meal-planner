---
artifact: intent/recipe-photos/spec.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent reliable recipe photos specification review

## Findings (by severity)

No blocking design findings or nits. Approved for build planning under the org
peer-review gate; the separately assigned security review must also approve the
new network boundary before implementation.

## Evidence

- Read active loop/work item, complete accepted intent/spec/research, prior
  recipe-search grounding/network contract, org protocol and review standards.
  The new spec explicitly supersedes only the previous prohibition needed for
  bounded source-page metadata retrieval (`intent/recipe-photos/spec.md:14`),
  rather than silently weakening it. Image binaries, redirects, arbitrary URL
  endpoints, new paid calls, other providers, persistence and UI redesign remain
  excluded.
- The provider-independent enrichment seam operates only after valid recipe
  results and changes only image URLs (`spec.md:23`). It retains source identity,
  non-photo fields, order and every valid card; inaccessible or unsafe photo
  metadata returns the existing image/fallback. This matches the focused intent
  without creating a crawler or image proxy.
- Source association is explicit and testable: exact Recipe identity, or a sole
  unidentified Recipe with exact canonical/page identity plus normalized title
  agreement (`spec.md:45`). Conflicts and ambiguous related recipes do not
  contribute photos. Relative image values resolve against the original source,
  not an attacker-controlled HTML base; existing safe-image URL checks remain.
- Ranking distinguishes source-declared dimensions from unknown quality and
  never invents larger filenames (`spec.md:58`). Adequate Recipe images, unknown
  Recipe images, page-bound OpenGraph metadata, smaller usable Recipe images,
  then the current image provide deterministic precedence. The observed Love
  and Lemons first source-provided 500px variant can replace the old model 150px
  thumbnail without inferring dimensions from its filename. Browser natural-size
  inspection remains necessary to substantiate the actual improvement.
- Independently checked [Schema.org image](https://schema.org/image): URL and
  ImageObject forms are supported. Checked the [Open Graph protocol](https://ogp.me/):
  root image properties have associated secure URL/dimension properties and
  publisher order; canonical object URL is distinct from image URL. The spec's
  grouping and page binding follow those semantics rather than collecting
  unrelated body images.
- The network design validates every A/AAAA answer and pins a selected public
  address through the actual connection lookup while preserving original Host,
  TLS SNI and certificate identity (`spec.md:102`). It excludes redirects,
  alternate agents/proxies, credential forwarding and retries. Explicit address,
  header/body/encoding, total-time and cancellation boundaries cover the new
  trust boundary; detailed security assurance belongs to the parallel specialist
  review and subsequent code/transport tests.
- Global concurrency includes DNS; saturation skips work instead of queuing
  (`spec.md:139`). The photo soft deadline is subordinate to the original search
  deadline, so optional enrichment cannot restart the main budget or swallow
  parent cancellation (`spec.md:144`). Parser/script/candidate/traversal bounds
  prevent full DOM construction or unbounded metadata accumulation.
- Two focused maintained libraries are proposed for HTML events and IP range
  classification (`spec.md:163`), avoiding a DOM runtime, HTTP framework or
  handcrafted address classification. Exact version/export checks are the
  architect's recorded registry evidence, not independently reproduced here:
  this review's web tool could not access the registry version endpoints.
  Exact lockfile versions, scripts, transitive changes and native audit remain
  explicit implementation approval checks.
- The TypeScript test matrix covers source/ranking ambiguity, malformed metadata,
  mixed/unsafe DNS, rebinding, TLS identity, network limits and cleanup,
  cross-search concurrency, deadlines and fail-soft field preservation
  (`spec.md:177`). Separate real transport/browser evidence on all three intake
  sources is required without extra paid LLM calls (`spec.md:194`), with simulated
  provider results honestly labeled. Existing behavior tests and repository
  checks remain required. `git diff --check` passed.

## Verdict and limits

Approved for planning. The design is bounded, source-specific and testable;
remaining source-access/metadata quality limits are explicit. No independent
live-source fetch, dependency install/audit, application code, paid provider
request or browser run occurred in this document review. No spec/application,
status/loop/graph/ledger mutation, commit, merge or release was performed.
Independent security approval, plan/code review, actual verification and human
merge/release gates remain.
