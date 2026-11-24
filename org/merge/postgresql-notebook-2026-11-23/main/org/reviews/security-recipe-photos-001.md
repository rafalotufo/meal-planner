---
artifact: recipe-photos-implementation
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: changes
round: 1
---

# Final recipe-photo security review — initial pass

## Finding

**[MED — input validation / source binding] Reject raw URL controls before URL
resolution normalizes them away.** In snapshot `5cb9410`,
`lib/recipes/photo-metadata.ts:9`–`:11` passes `value.trim()` into `new URL()`
before calling the unchanged safe-URL validator. WHATWG URL parsing removes
embedded tab/newline characters. The validator therefore sees a different,
normalized value and cannot enforce the approved rejection of control-bearing
metadata URLs. The same helper processes image and declared identity URLs.

Independent TypeScript reproduction
`/private/tmp/recipe-photo-control-character-repro.ts` exited 0 and demonstrated
both cases without network requests. The existing `safeRecipeUrl` rejected
`https://images.exa\nmple.com/gnocchi.jpg` and a tab-containing recipe identity,
but `selectRecipePhoto` accepted them after normalization: it selected
`https://images.example.com/gnocchi.jpg` and accepted the malformed identity as
matching the source. Existing tests still passed, so they did not lock this
boundary against normalization.

Check the original metadata string for disallowed controls before trimming or
constructing a URL; preserve the established policy for absolute/relative image,
canonical/OG page and Recipe identity values. Add failing TypeScript fixtures
for raw controls in both image and identity metadata, then verify ordinary safe
relative/escaped URLs still work. This is a narrow fail-closed contract
correction. Final URL host/scheme validation remains present: this finding is
**not** a demonstrated private-address fetch, credential leak or SSRF bypass.

Correction and independent rereview are required before security clearance.
The parallel code review's multiple-Recipe image-pooling ambiguity also needs
its own resolution; this report does not duplicate that review's finding.

## Whole-feature security assessment

Assets and boundaries remain the server's network/credentials, process
availability, visitor query handling, and recipe/photo attribution. Native
recipe citations do not authorize internal network access; publisher HTML and
metadata remain untrusted even after transport validation.

- **Transport:** the earlier independent
  `security-transport-recipe-photos-001.md` assessment applies to the unchanged
  pinned HTTPS/DNS implementation. All A/AAAA answers are checked before
  connection, the selected public address is pinned, original Host/SNI and
  certificate verification remain, and redirects/proxies/credentials/binary
  fetches are excluded. Byte/header/encoding/total-time limits and late native
  cleanup remain intact. No independent metadata URL endpoint was introduced.
- **Composition:** `server.ts:1`–`:10` composes the native enricher only in the
  server-only root. `search.ts:103` computes the original deadline once;
  `:134`–`:139` awaits validated provider results, then passes the same signal
  and deadline to enrichment under the existing hard-deadline race. No new
  model call, public Recipe field, persistence or browser credential path exists.
- **Admission and failure isolation:** `photos.ts:8` is module-wide across
  factory instances. `:35`–`:59` caps/deduplicates source jobs, reserves one of
  two slots before loading/DNS, skips saturation rather than queuing, and
  releases slots in finally. `:26`–`:32` skips near-expiry work and sets a
  six-second/parent-minus-250-ms soft budget. `:13`–`:23` races loading with
  cancellation and removes listeners. Late loader completion cannot populate
  the per-call image map after cancellation; `:61` preserves parent abort;
  `:62`–`:67` returns new image fields without mutating other fields/order and
  always clears the timer/aborts the stage.
- **Parsing:** `photo-metadata.ts:25`–`:100` bounds HTML, scripts, head metadata,
  HTML depth, JSON traversal depth/nodes and candidate collection. htmlparser2
  event callbacks build no DOM or script runtime; JSON-LD contexts are not
  resolved, HTML base/body images are ignored, and malformed scripts fail
  locally. Recipe/OG identities and declared dimensions are checked before
  ranking. The raw-control gap above and separately reviewed ambiguity prevent
  treating these association checks as fully cleared yet.
- **Output:** only a validated HTTPS image URL is added to a valid existing
  card. Original source/method/time validation and frontend text rendering,
  no-referrer/direct image loading, fixed image geometry and broken-image
  fallback remain in place. Publisher metadata and declared dimensions still
  require separately labeled live/browser quality evidence.

## Independently run checks and limits

`node --test --test-reporter=dot build/recipe-tests/tests/recipe-*.test.js` exited
0 with **55 passing test dots** against the frozen compiled snapshot. This
includes the original 34 regressions, transport/metadata cases, global admission,
near-deadline skip, soft timeout retaining completed photos, late-callback
isolation, parent abort and handler deadline composition. The independent raw-
control probe above demonstrates a missing adversarial case despite that green
suite. Targeted source secret scan exited 0 with zero findings; `git diff
--check` exited 0. No private network or paid provider request was used.

Read approved intent/spec/plan, active loop, all changed source/tests, dependency
record, early transport report and final verification/browser-source evidence.
The orchestrator's three-publisher real retrieval and CUA natural-dimension /
fallback results were read rather than independently replayed. Lint/typecheck/
build/Python results remain separately recorded by developer/orchestrator.

Exact dependencies/lock remain the reviewed graph, so no redundant audit or
installation was run. No code edit, secret read, live source/model request,
status/loop/graph/ledger mutation, commit, merge or release occurred in this
review. Public release decisions and human gates remain unchanged.
