---
artifact: recipe-photos-implementation
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: clear
round: 2
---

# Final recipe-photo security rereview

## Verdict

**Clear for the recipe-photo implementation.** Reviewed correction `76f44b4`
and its two new TypeScript regression groups against the initial security and
parallel code-review findings. The raw-control normalization gap is resolved,
and competing source-associated Recipe nodes no longer pool photographs. No
additional required security finding was identified. The orchestrator may close
`security-researcher-0002` using this report as evidence.

This is implementation security clearance, not merge or release authorization.
Publisher access/metadata and browser photo availability remain the separately
labeled limits in the source/browser verification report.

## Corrections verified

- `lib/recipes/photo-metadata.ts:9`–`:11` now rejects raw C0 controls and DEL
  before trimming or constructing a URL. The shared helper covers Recipe image,
  ImageObject, Open Graph image, canonical/OG page and Recipe identity URLs.
  URL normalization can no longer remove a tab/newline before the safety check.
  Final relative resolution and HTTPS/host/port/userinfo validation remain.
- Declared identities remain present even if invalid. The `every` check at
  `photo-metadata.ts:118` fails on an invalid declared URL rather than treating
  the node as unidentified and falling back to a matching name/canonical URL.
  Likewise, page canonical/OG identities remain in the page-bound check at
  `:110`; an invalid/conflicting declaration cannot be silently discarded.
- `photo-metadata.ts:111`–`:125` collects associated nodes first and only reads
  Recipe images when exactly one qualifies. Differently named fragment IDs
  that normalize to the same page can no longer contribute to one image pool.
  Multiple competing nodes retain only the approved, independently page-bound
  OG or previous-image fallback. Valid single-Recipe selection is unchanged.

Independent TypeScript probe
`/private/tmp/recipe-photo-fix-security.ts` exited 0 with no network calls. It
checked 12 control-bearing image/identity cases covering NUL, tab, LF, CR, U+001F
and DEL; all were rejected. It also confirmed that two source-matching
Recipe nodes with gnocchi/cake fragment identities do not select the cake photo,
that a single valid Recipe still selects its photo, and that an exact
page-bound OG fallback remains available under ambiguity.

## Whole-feature boundary and evidence

The transport, native DNS/TLS options, global two-job admission, provider/server
composition and parent-aware fail-soft logic are unchanged by this correction.
The initial whole-feature assessment and earlier transport consultation therefore
remain applicable with their two now-resolved metadata qualifications:

- All source DNS answers are checked and the chosen public address is pinned;
  original Host/SNI and TLS verification remain, with no redirects, proxy,
  credential forwarding, image binary request or second lookup/connection.
- The module-wide admission limit reserves work before DNS, skips saturation,
  bounds exact source attempts and releases capacity/timers/listeners. Optional
  photo work uses the original request deadline and parent signal, retains
  valid cards/photos on source failure, and cannot overwrite returned cards
  through late completion. Parent cancellation remains authoritative.
- Structured/head metadata parsing remains nonexecuting and byte/script/depth/
  node/candidate bounded. Only safe image URLs change; original card fields,
  order, source/citation/method/time validation, public response shape, provider
  choice and paid-call count are preserved.

Independently ran
`node --test --test-reporter=dot build/recipe-tests/tests/recipe-*.test.js`:
exit 0, **57 passing test dots**, including the original 34 regressions and
transport/metadata/enrichment/handler coverage. Targeted selector/test secret
scan exited 0 with zero findings; `git diff --check` exited 0. No failing test or
check was removed or suppressed.

The orchestrator reports post-correction lint/typecheck/build and seven Python
regressions all exit 0, plus staged secret/plan-sync/diff checks. Those commands
were not independently repeated here. The root also reran the three exact
cached publisher HTML selections and reports unchanged selected URLs; the
previous real transport and CUA natural-dimension/broken-fallback evidence is
separately labeled in `recipe-photos-verification.md`, rather than claimed as
fresh live-provider evidence by this rereview.

Dependency inputs are unchanged from the reviewed exact graph, so no audit or
installation was repeated. No application edit, secret read, paid/source/image
network request, status/loop/graph/ledger mutation, commit, merge or release
occurred in this independent rereview. Human merge/release gates and existing
public-deployment decisions remain intact.
