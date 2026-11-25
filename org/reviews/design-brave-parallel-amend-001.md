# Brave parallel search — principal-heading corrective amendment review

- Reviewer: reviewer, independent of architect and implementation author.
- Amendment source: `53609f3`; baseline approval: `eb1deb0`.
- Verdict: **Approved for the narrow local correction and one corrective live
  smoke, subject to the verification conditions below. No blocking finding.**
- This does not approve the full implementation, merge, hosted configuration,
  deployment, provider-plan/account changes or a release.

## Scope and rationale

The original two live implementation smoke calls have actually run. The retained
`build/brave-search-benchmark/implemented-live-results.json` records the named
query returning8cards in9.701seconds and the broad picky-eater query returning
sanitized502 after15.784seconds with one Brave call and zero model calls.
Those observations must remain recorded; an offline replay or a later successful
query does not replace the original failure.

The source parser's generic header suppression also hid the principal H1 when
an article placed it inside its own header. Amendment `spec.md:119–151` separates
that identity channel from excluded header body text/links. The working source
`lib/recipes/source.ts:73–99` allows this heading only when inside main/article
and no suppressed ancestor other than header exists. It retains one principal
H1, canonical and Recipe identity checks, exact normalized Recipe-name binding,
collection rejection and parser complexity bounds. Header links and navigation,
footer/sidebar body content remain excluded. No network or paid ceiling changes.

This is a focused recall correction for legitimate source pages, not permission
to trust a Recipe object on a collection or assign a child recipe to its parent.
The existing source/test manifest paths cover it. Source/curation concurrency,
SSRF/TLS/encoding/redirect rules, parent abort and input/output limits remain
unchanged. The additional live-call allowance is explicit and bounded, rather
than silently retrying until a favorable result appears.

## Independent evidence

- `pnpm test`: exit0;106tests,106pass,0fail/skip/cancel on the corrected working
  source. The checked-in principal article/header/H1 regression passes.
- Additional read-only assertions passed for valid article/header H1, ignored
  site/nav dummy headings, conflicting principal title, multiple content H1s,
  and a collection whose suppressed header links must not be expanded.
- A temporary-copy mutation restoring the former suppressed-header condition
  rejects the valid wrapped-H1 regression; the corrected source accepts it.
  No application or test file was changed by the reviewer.
- Offline replay of24retained public-source diagnosis entries produced9recipe
  candidates,2collections,10unsupported entries and3missing HTML files. This
  independently confirms the reported recall change with zero paid calls. It
  is not live provider/model/family/browser success or a recipe quality audit.

## Precisely bounded corrective live allowance

After the actual independent amendment approval is recorded and corrected-source
lint, typecheck and build pass, perform **ONE** additional smoke of the original
broad query: `meals for picky eaters like chicken fingers and burgers`.
The implementation verification total is then at most three live searches.
Retain all current per-search bounds: one Brave request,20initial hits,24safe
source fetch attempts,12tool-free curations at1200output tokens each,12cards,
existing deadlines and process-wide source2/model12 pools. No automatic retry,
fallback, fourth verification query or broader paid work is approved here.

Record its actual status, source/model counts, omissions, source relevance,
validated yield and full elapsed time beside the original failure. Label direct
provider/handler evidence as excluding authenticated HTTP/browser admission.
Fixture servers must continue forcing paid keys empty. A failed corrective
smoke must be reported honestly and must not trigger another paid attempt.

The developer reports corrected lint/typecheck/build exit0; this reviewer
independently reran the recipe suite and targeted read-only/mutation/offline
checks, but did not rerun those three commands or perform any paid request.
The full source/security review and remaining verification gates stay pending.
