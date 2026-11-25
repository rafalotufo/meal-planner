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


## Corrective live follow-up and handoff

After independent amendment approval185d72b/ledger985cea9 and explicit
orchestrator GO, exactly one corrective broad query ran. It returned200 in8163ms,
with24source attempts,4parallel curations and1accepted recipe. See
`live-verification.md` and durable `live-results.json` for measurements, original
failure and limited broad recall. No further paid calls are authorized or made.
The heading defect is fixed; the low broad yield remains a quality limitation.

Integration/source implementation commit2989467 passed staged
`git diff --cached --check` and `python3 scripts/scan_secrets.py --staged`
(0findings). Formal independent reviews are running against that stable source.
The corrective run changed evidence only, not application or test code.

## Formal review correction: instruction ItemList

Code review adb3145 reproduced valid Recipe.recipeInstructions ItemList being
misclassified as a page collection. Schema.org explicitly permits ItemList:
https://schema.org/recipeInstructions . The new regression first failed with
actual collection versus expected recipe (`/private/tmp/brave-itemlist-red.log`).
Bounded traversal now distinguishes the Recipe instruction subtree from page
ItemList signals, retaining all node/depth limits and genuine collection cues.
The regression checks exact extracted method, successful fixture curation and
an actual page ItemList with embedded Recipe that still expands as a collection.
`pnpm test` passed107/107 (`/private/tmp/brave-itemlist-green.log`). No paid calls
were made. Live measurements above describe source2989467, preceding this fix;
this correction is verified offline rather than represented as a new live run.

## Owner-requested eight-second per-item budget

The owner requested skipping slow curators while returning valid siblings.
Architecture348baf0 and independent approval03cb9fc/ledger5c0382b authorize an
8000ms absolute per-item budget including shared-model-queue wait, headers,
complete body consumption and validation. The request/route budgets stay60/90s.
The existing25s code failed all5 added mocked-clock regression cases in
`/private/tmp/brave-eight-second-red-final.log`; the minimal deadline and expiry
precedence correction passed112/112 tests in
`/private/tmp/brave-eight-second-green.log`, without real8second sleeps.

Coverage checks a valid sibling returning at8s while an abort-ignoring candidate
is skipped and retains its lease; queued expiry never starting model work;
explicit rejection plus expiry reporting504; parent abort returning504 despite a
completed sibling; absolute clock checks preventing late slot acquisition/output
acceptance even before timer dispatch; and pending response-body cancellation
holding its lease until cleanup settles. No retries/fallbacks or paid calls.
The initial red harness had one pending fake-clock await, which was stopped as
an owned test process; the final red harness asserts settlement before awaiting
so the expected25s/8s mismatch fails promptly without hanging.

Final corrected-source verification reran every required command:

| Command | Actual result | Local evidence |
| --- | --- | --- |
| `pnpm test` |112passed,0failed | `/private/tmp/brave-eight-second-green.log` |
| `pnpm run lint` | exit0 | `/private/tmp/brave-final-lint.log` |
| `pnpm run typecheck` | exit0 | `/private/tmp/brave-final-typecheck.log` |
| `pnpm run build` | exit0 | `/private/tmp/brave-final-build.log` |
| `pnpm run test:family` |34passed,0failed | `/private/tmp/brave-final-family.log` |
| `pnpm run test:menu` |69passed,0failed | `/private/tmp/brave-final-menu.log` |
| `pnpm run test:auth` |16passed,0failed | `/private/tmp/brave-final-auth.log` |
| `node --import tsx --test tests/deployment/*.test.ts` |33passed,0failed | `/private/tmp/brave-final-deployment.log` |
| `python3 -m unittest discover -s tests` |7passed | `/private/tmp/brave-final-python.log` |
| `node --import tsx tests/menu/brave-search-browser.ts` | Chrome390/1440passed | `/private/tmp/brave-final-browser.log` |

264 Node tests and7 Python tests pass. Fixture-based final Chrome run regenerated
identical screenshots; no product UI code changed in these corrections. Initial
sandbox network/listener attempts returned EPERM; reruns with approval used the
same owned test databases/fixture servers and passed. These were environment
restrictions, not hidden application/test failures. All provider keys remained
empty in fixture servers. Final diff check and staged secret scan must remain
zero at the correction commit; independent final code/security decisions are
still required from the orchestrator.
