# Reliable recipe photos — implementation verification

Date: 2026-11-23. Implementation owner: senior-developer. Browser/source checks
are coordinated by the orchestrator; independent security/code and human
merge/release gates remain separate.

## Required automated checks

| Command | Actual result |
| --- | --- |
| `npm test` | Exit 0; 57 TypeScript application tests, 57 pass, no failures/skips/cancellations; original 34 remain. |
| `npm run lint` | Exit 0; ESLint `--max-warnings 0`. |
| `npm run typecheck` | Exit 0; Next route generation and TypeScript checking. |
| `npm run build` | Exit 0; webpack compiled, TypeScript passed, static `/`, dynamic `/api/recipes/search`. |
| `python3 -m unittest discover -s tests` | Exit 0; `Ran 7 tests in 1.797s`, `OK`. |
| `git diff --check` | Exit 0; no whitespace findings. |
| Targeted `scripts/scan_secrets.py --path …` for changed app/service/tests/docs | Exit 0; zero findings. Staged scan/plan-sync remain the orchestrator's checkpoint checks. |

No application fixture endpoint, environment bypass, new model call, or check
suppression was introduced. Tests/fixtures are TypeScript compiled with the
existing compiler for Node's native runner; no runner/config change was needed.

## Test-first and checkpoint evidence

1. Added transport tests before `photo-transport.ts`; the initial compile failed
   for the absent module. Fixture typing was corrected rather than suppressed.
   After implementation, 40 total tests passed. The full Next typecheck exposed
   that its augmented ProcessEnv requires NODE_ENV in the Agent proxy environment;
   a static object containing only that non-proxy field fixed the cause. Tests,
   lint, types and build passed. Checkpoint: `e22a8ee`.
2. Added metadata tests before `photo-metadata.ts`; compilation failed for the
   absent selector. After implementation, 48 tests passed. An additional failing
   adversarial assertion exposed conflicting nested mainEntityOfPage identities;
   checking every declared identity, and rejecting empty image URLs, preserved
   exact source binding. Required checks passed. Checkpoint: `d46c5f1`.
3. Added enrichment/handler tests before the new factory/seam; compilation failed
   for the absent module and unrecognized `enrichPhotos` option. After integration,
   all 55 tests passed. The original hard deadline is computed once and passed
   through the same signal, rather than restarted after the provider returns.
4. Final lint found an unused old-image fixture binding. The test now asserts
   that the original image remains unchanged, strengthening input-mutation
   coverage; lint/tests/build pass without suppression.

Transport tests exercise actual IP classification, both-family/all-answer DNS
checks, pinning/lookup callback shapes despite changed DNS, native TLS/Host and
credential-free request options, no redirects, byte/header/type/encoding bounds,
slow body/deadline and DNS cancellation. They never connect to private networks.
The independent early transport security consultation is recorded in
`security-transport-recipe-photos-001.md`; it is not the final feature verdict.

Metadata tests cover Recipe string/array/ImageObject/@graph forms, exact and
narrow sole-Recipe identities, canonical/title conflicts, related recipes,
OG grouping, declared/unknown/tiny dimensions and deterministic ranking,
relative/escaped/unsafe URLs, malformed/deep/oversized scripts, candidate/script
limits, and absence of script execution/body-image scanning.

Enrichment tests prove the module-wide two-job cap across factory instances,
immediate saturation skip, bounded/deduplicated exact sources, unchanged non-photo
fields/order/count and previous images on failure, near-deadline skip, retained
completed photos at soft timeout, parent abort authority and released capacity.
An intentionally uncooperative loader resolves late after soft cancellation;
its callback cannot change already returned cards. No network is used in tests.

## Final review corrections

Two independent review findings were reproduced before the final correction:
57 tests / 55 pass / 2 fail. Multiple explicit Recipe fragment identities could
normalize to one source and pool images, selecting a cake photo for a gnocchi
card. Separately, `new URL` stripped raw newline controls before URL validation.

The selector now resolves Recipe-node association before image collection; when
more than one node qualifies, Recipe imagery is ignored and the existing
page-bound OG/provider fallback policy remains. The shared metadata URL helper
rejects raw C0/DEL characters before normalization. Invalid declared identities
remain present for conflict checks, so a valid canonical/title cannot turn them
into an accepted anonymous Recipe. New fixtures cover the exact cross-recipe
case, fallback, image controls, explicit/nested identities, canonical and og:url.

After correction all 57 tests, lint/typecheck and seven Python tests pass.
The implementation agent independently reran the cached-real-HTML selector
script on all three publisher snapshots; selections match the pre-fix JSON
exactly. No repeated publisher fetch or paid model call was needed. The refreshed
production build passed; final independent rereview remains a handoff check.

## Exact dependency graph

`recipe-photos-dependencies.md` records the prospective registry/script/audit
inspection and authorized script-disabled installation. The actual application
lock is byte-identical to the reviewed prospective graph: eight additions,
no existing version changes/removals, no install hooks, zero production audit
findings and four unchanged moderate development-tool findings. Runtime pins:
htmlparser2 10.1.0 and ipaddr.js 2.5.0. No dependency script ran.

## Separately labeled real-source evidence

The orchestrator reported the following real pinned-transport results, without
an LLM call. These results were read by the implementation agent, not independently
re-fetched; public HTML snapshots were saved in private temporary QA storage.

| Exact research source | HTML fetch | Cached actual HTML selection |
| --- | --- | --- |
| Love and Lemons gnocchi | 618,767 bytes; 162 ms | Source-provided `gnocchi-500x500.jpg`; Recipe unknown-dimensions tier. |
| Inspired Taste potato gnocchi | 411,446 bytes; 445 ms | Source-provided `Gnocchi-Recipe-1.jpg`; Open Graph, declared 1250×833. |
| King Arthur potato gnocchi | 340,557 bytes; 145 ms | Exact source ImageObject; Recipe unknown-dimensions tier. |

The exact URLs are in `intent/recipe-photos/research.md`. Both parser versions
before/after the stricter nested-identity check retained these three selections
in the orchestrator's cached-real-HTML QA. Unknown dimensions were not inferred
from filenames; the browser measurements below establish their actual sizes.

The complete compiled enrichment pipeline then fetched publisher metadata live
for all three captured cards in 342 ms. All three image URLs improved, and a
deep comparison confirmed every non-photo field was unchanged. No provider or
paid model call occurred.

## Browser and final acceptance handoff

Passed using CUA in the in-app browser at 1440×1000 and 320×1000. The temporary
TypeScript QA server on localhost:3101 served the actual production frontend
from localhost:3100 and called the actual compiled search handler with a
**simulated provider of the captured three result cards** and **real pinned
publisher HTML retrieval, selection, and browser photo requests**. Its complete
POST returned HTTP 200 in 304 ms with zero model calls. The harness lives only
under `/private/tmp`; no production fixture endpoint or environment mode exists.

| Original result | Before | Verified loaded natural size |
| --- | --- | --- |
| Love and Lemons | 150×150 thumbnail | 500×500, source Recipe.image |
| Inspired Taste | No photo | 1250×833, source og:image |
| King Arthur | No photo | 1248×832, source ImageObject |

CUA DOM measurements confirmed all three images complete, zero photo fallbacks,
`referrerPolicy=no-referrer`, and no horizontal overflow at both widths. Image
areas remained 366×274.5 on desktop and 278×208.5 on mobile (4:3). Original JPEG
screenshots `recipe-photos-desktop.jpg` and `recipe-photos-mobile.jpg` were saved;
the desktop screenshot was visually inspected and all three recipe photographs
were visible and correctly associated with their cards.

A separate, explicitly simulated broken-photo response produced one readable
card with `Photo unavailable` and unchanged recipe details; evidence is
`recipe-photos-broken-fallback.jpg`. Available CUA error/warning logs were empty.
The temporary viewport override was reset. This verifies image rendering and
fallback, not fresh LLM discovery or a screen reader execution.

Independent final code review `code-recipe-photos-002.md` is approved and security
review `security-recipe-photos-002.md` is clear. Both metadata edge cases have
failing-then-passing regressions; the independent reviewers passed all 57 tests
and additional mutation/control/association probes. After the final correction,
the three cached publisher pages selected exactly the same image URLs. The UI,
transport and enrichment lifecycle were unchanged by those parser-only fixes.

Final staged plan-sync and diff checks exited 0; the staged secret scan reported
zero findings. The bounded org loop completed all six turns with `solved`; the
workflow graph holds implementation at `in_review` for human merge approval.
No merge, release or deployment was performed. Source blocking, ambiguous
metadata, unsafe DNS/URLs and browser image failure still
retain the prior image or designed fallback; these observed improvements do not
promise universal photo coverage. No extra paid model call was used for this
investigation, implementation or verification.
