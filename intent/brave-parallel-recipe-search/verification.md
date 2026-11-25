# Brave parallel search — implementation verification

Implementation in progress; this is actual command evidence, not final readiness.

- Queue/Brave slice red: `pnpm test` failed with missing new modules in
  `/private/tmp/brave-slice1-red.log` before implementation.
- Queue/Brave slice green: `pnpm test` passed88 tests,0 failures (compiled strict
  TypeScript + native runner), `/private/tmp/brave-slice1-green.log`.
- Focused regressions cover retained active leases for abort-ignoring transports,
  FIFO/global concurrency, bounded queued work/removal, one exact Brave request,
  safe URL filtering/dedup, Unicode/word query bound and malformed/oversized
  provider responses. Full source/body pipeline checks follow in next slices.

- Source extraction/collection slice red: missing source module in
  `/private/tmp/brave-slice2-red.log` before implementation.
- Source extraction/collection slice green: `pnpm test` passed92 tests,0 failures
  before the additional provider-error-body regression. Tests cover canonical/
  recipe/title association, embedded collection recipes, safe bounded content
  links, ignored HTML base/navigation, malformed/oversized/deep source data and
  missing cooking evidence. Existing photo transport/metadata tests remain.
- Early security consultation identified non-2xx body cleanup. Discovery now
  cancels an error response body before returning failure; shared curator reader
  will reuse that behavior. No private provider body is surfaced.
- Final source/discovery suite after cleanup regression:93/93 pass,
  `/private/tmp/brave-slice2-final.log`.

- Curator/orchestration slice red: missing curation/parallel-search modules in
  `/private/tmp/brave-slice3-red.log` before implementation.
- Body-cancellation lease regression reproduced early release against an
  abort-ignoring ReadableStream cancel hook (`/private/tmp/brave-body-red.log`).
  Fixed shared reader to retain the cancellation promise before releasing its
  active pool lease, including oversize and already-aborted bodies.
- Curator/orchestration suite green: strict schema, full original query, no
  tools/retries, deterministic metadata, required excerpt/title failures,
  twelve concurrent calls, source/model ceilings, collection expansion,
  technical/rejection distinction, parent abort and shared-instance pools.
  Final recipe suite103/103 pass in `/private/tmp/brave-slice3-final.log`.


## Runtime/UI integration and final source checks

Runtime now selects Brave by default, requires both server-only provider keys,
and passes the existing handler deadline. The former provider selector fails
unavailable rather than silently falling back. Source HTML supplies photo/time
metadata without a second source fetch. Test servers forcibly clear both Brave
key aliases and OpenAI even when local .env files contain credentials.

The notebook splits twelve URLs into two validated six-URL requests. Each
response is checked against its own chunk; a failed chunk stays unknown while
successful/saved state remains usable. Generation/abort and save-version checks
prevent late lookup replies from changing a newer selection or completed save.

Actual completed checks (exit0 unless stated):

| Command | Result | Local command evidence |
| --- | --- | --- |
| `pnpm test` |106 passed,0 failed after principal-heading correction | `/private/tmp/brave-article-heading-final.log` |
| `pnpm run lint` | pass after correction | `/private/tmp/brave-lint-correction.log` |
| `pnpm run typecheck` | pass after correction | `/private/tmp/brave-typecheck-correction.log` |
| `pnpm run build` | pass after correction | `/private/tmp/brave-build-correction.log` |
| `pnpm run test:family` |34 passed,0 failed | `/private/tmp/brave-family.log` |
| `pnpm run test:menu` |69 passed,0 failed | `/private/tmp/brave-menu.log` |
| `pnpm run test:auth` |16 passed,0 failed | `/private/tmp/brave-auth.log` |
| `node --import tsx --test tests/deployment/*.test.ts` |33 passed,0 failed | `/private/tmp/brave-deployment.log` |
| `python3 -m unittest discover -s tests` |7 passed | `/private/tmp/brave-python.log` |
| `node --import tsx tests/menu/brave-search-browser.ts` | actual Chrome390/1440 passed | `/private/tmp/brave-browser.log` |

Family/menu/auth/deployment and browser runs preceded the isolated source parser
correction; its affected recipe tests, lint, types and production build were
rerun. All database-backed helpers used owned random migrated test databases
with the restricted local test role, owned servers and Chrome profiles. No
development/hosted data was changed. Browser provider responses were fixtures,
with paid keys empty; this proves UI/storage behavior, not live provider quality.

Chrome verified cards7/12, real saves beyond six, failed second chunk/retry,
out-of-chunk response rejection, save-during-lookup reconciliation, close/reopen
pending request cancellation, quick filters, keyboard focus, and no unexpected
console errors. Screenshots: `org/reviews/brave-parallel-search-390.png` and
`org/reviews/brave-parallel-search-1440.png`, independently viewed by orchestrator.
The original browser assertion expected a checking label after reopening a known
entry. It failed because existing known availability remains ready during its
fresh check. The corrected assertion observes the actual delayed request and
its abort; stale selection/save-version and source/chunk validations remain.

## Live-discovered principal-heading defect

The initial named smoke returned8 cards; the broad smoke failed502 with zero
model calls. Both are preserved in `live-verification.md`. Saved public-source
HTML replay isolated a principal recipe H1 inside article/header, discarded by
generic header suppression. The new regression failed expected recipe versus
actual unsupported (`/private/tmp/brave-article-heading-red.log`). The minimal
fix captures only the content-region header H1 as identity, retaining suppressed
header text/links and all exact canonical/title, singular-H1 and data budgets.
Tests also reject conflicting/multiple content H1 and embedded collection
recipes; site/nav headings and navigation links remain untrusted.

Offline replay of saved broad discovery pages after correction yielded9 bound
recipes,2 collections,10 unsupported and3 unfetched out of24 diagnostic entries,
versus zero recipes before correction. This is parser evidence, not model/live
quality. Architecture consultation53609f3 independently identified the same
cause. No third paid call occurred while the follow-up amendment awaited review.

Final staged secret scan and diff-check results are recorded with the commit
handoff. Org graph/ledger/loop and independent final reviews remain owned by the
orchestrator; this document does not grant merge/release approval.
