# Single-call recipe search — implementation verification

- Date: 2026-11-23
- Role: senior-developer (implementation evidence, not independent approval)
- Scope: approved intent/single-call-recipe-search/spec.md and plan.md
- Local branch: codex/single-call-recipe-search; human merge/release remain gated.

## Behavioral proof

Before changing lib/recipes/openai.ts, the adapted combined-response fixture
and regressions ran through `pnpm test`: exit 1, 66 tests, 56 passed and
10 failed. The success fixture retained a spare legacy curator response, so
the original adapter completed but failed the exact request-count assertion
`2 !== 1`. Other red cases covered flattened output, local evidence, optional
metadata fallbacks, invalid/valid duplicate order, and configured-model paths.
This was a behavioral red run, after correcting a fixture literal-type inference
compile error; compiler failure was not counted as the red proof.

After the implementation, `pnpm test` passed all 66 tests with zero skipped.
The one-call success fixture still contains that unused spare response and
asserts exactly one request and the unchanged public Recipe projection. Failure,
empty, source-citation, Unicode/offset/overlap cleanup, local method evidence,
optional-null and mixed duplicate/limit cases retain their safety assertions.
Pre-abort makes no request; mid-request abort preserves the parent reason and
does not retry. The explicit metadata-isolation test has two valid sources:
the first borrows excerpts matching the second's evidence and must expose null
metadata, while the second retains its own supported image/time.

The current model/default, low reasoning, fixed endpoint, store:false, required
hosted search, eight-tool and 5,000-token limits remain. The direct parser
requires completed research, exact native source citations and same-record
method evidence; it projects only public fields. No second request, schema
curator, repair retry, synthetic Responses objects, or experiment imports remain.
Optional invalid metadata does not discard an otherwise supported card.

## Required commands

| Check | Actual result |
|---|---|
| Node / pnpm | v24.15.0 / 10.33.0 |
| CI=true pnpm install --frozen-lockfile | exit 0; lockfile up to date, already installed |
| pnpm test, final strengthened fixtures | exit 0; 66 passed, 0 failed/skipped |
| pnpm run lint | exit 0; zero warnings |
| pnpm run typecheck | exit 0; route type generation and strict tsc passed |
| pnpm run build | exit 0; production webpack build passed |
| pnpm run test:auth, after build | exit 0; 12 passed, 0 failed/skipped |
| python3 -m unittest discover -s tests | exit 0; 7 tests passed |
| node --import tsx --test tests/deployment/smoke.test.ts | exit 0; 12 passed, 0 failed/skipped |
| Existing real Chrome browser harness | exit 0; all five widths passed |
| git diff --check | exit 0 |

The initial install attempt stopped on pnpm's no-TTY confirmation; CI=true
resolved that without dependency/lockfile edits. The initial lint run found an
unused test variable; removing it fixed the warning without a suppression.
The first deployment smoke run was blocked from binding its real localhost
fixture listener (`listen EPERM`); rerunning with localhost permission passed
all 12 tests. These environment/check failures were not hidden as passes.

The orchestrator records final staged secret scan, approved-plan synchronization,
and org loop/message/memory checks after the evidence and audit files are ready.
Detailed command logs stay in ignored build/search-latency/single-call-*.log.

## Live provider evidence — actual implemented adapter

### Initial prompt — superseded sample

The temporary strict TypeScript helper invokes the actual createOpenAIProvider
with an unchanged forwarding transport. It counts calls and observes the sent
model without changing prompts, payloads, validation, or response bodies. These
are provider-only wall-clock measurements, with a 60-second abort signal;
photos, browser, authentication and Vercel latency are not included.

| Synthetic query | Model | HTTP | Requests | Seconds | Valid cards |
|---|---|---:|---:|---:|---:|
| Quick vegetarian chickpea dinner with spinach, <=25 minutes | gpt-6.2-sol | 200 | 1 | 18.166 | 2 |
| Creamy mushroom pasta without cream | gpt-6.2-sol | 200 | 1 | 25.570 | 4 |
| One-pan chicken and rice dinner with lemon | gpt-6.2-sol | 200 | 1 | 19.167 | 3 |

All three succeeded with one request. The 19.167-second median is a small,
variable sample, not a promised latency or a controlled speedup claim against
the earlier experiment. Final titles and summaries were inspected: chickpea
cards describe chickpeas/spinach, pasta cards disclose their cream-free sauce
approach (including explicitly disclosed cream cheese in one), and chicken
cards describe chicken/rice cooked together with lemon. This is not an
independent audit of every page, ingredient, or dietary claim.

All nine projected cards had null time and image metadata in these provider
samples. Null is an honest permitted fallback, but this availability loss is
material and must not be presented as equal metadata quality to the prototype.
The first live wrapper retained public cards/counts only, so it did not establish
whether those nulls were model omissions or rejected excerpt support. A single
peer-approved bounded diagnostic on the same mushroom query is recorded below
after completion; no application edit or extra model sweep is authorized by
that diagnostic alone. Raw wire/source bodies remain only in ignored scratch.

### Diagnostic finding

The one-query diagnostic completed with HTTP 200, exactly one request,
26.475 seconds and four valid cards. All eleven expected record fields were
present. All four records contained valid-looking time objects, and three had
image URLs; all optional evidence/excerpt pairs were strings where present.
However, every optional containment check failed. Inspection showed the model
used evidence fields for commentary that metadata existed on the page, while
excerpt fields contained different quoted source metadata. Citation cleanup
does not make those different strings match. The parser correctly rejected
unsupported pairs. This establishes prompt/wire noncompliance rather than a
missing-field or metadata-validator defect. A prompt-only clarification was
independently approved: evidence must contain observed source text, and the
excerpt copies that exact text without citation display; native citations may
follow the copied text in evidence. No parser relaxation was made. The final
three same-query samples below verify the final prompt, with total paid
verification bounded to seven requests including the initial three and diagnostic.

### Separate unchanged photo enrichment

Without another OpenAI request, the unchanged createPhotoEnricher was applied
later to the saved initial public cards through the approved pinned transport.
It recovered 2/2 chickpea photos in 258 ms, 3/4 pasta photos in 951 ms, and 3/3
chicken photos in 504 ms. These later photo-stage timings are separate evidence,
not complete end-to-end searches or added to the earlier provider durations.
They show that null model image metadata does not necessarily mean missing UI
photos. Time metadata has no such enrichment, so the prompt issue still mattered.

### Final prompt — authoritative implementation sample

After the peer-approved prompt clarification, the same three synthetic queries
were run once more through the actual final adapter. The forwarding wrapper
cloned responses for optional field-shape/containment metrics without changing
the payload or validation. Only the approved source prompt changed; parser,
model, caps, cancellation and the single-call behavior remained unchanged.

| Synthetic query | HTTP | Requests | Provider seconds | Valid cards | Times retained | Model images retained |
|---|---:|---:|---:|---:|---:|---:|
| Chickpea spinach <=25 minutes | 200 | 1 | 19.774 | 3 | 3 | 2 |
| Mushroom pasta without cream | 200 | 1 | 26.652 | 4 | 4 | 2 |
| One-pan lemon chicken and rice | 200 | 1 | 17.739 | 3 | 3 | 0 |

The model was gpt-6.2-sol in all three. The final provider-only median was
19.774 seconds (range 17.739–26.652); this small sample does not establish a
general latency guarantee or a controlled comparison against the prototype.
All ten model-reported time pairs and all four model-reported image pairs had
literal evidence/excerpt containment and survived the unchanged parser. The
remaining six image values were explicitly null in the model response rather
than nonmatching evidence. This confirms the observed commentary/excerpt issue
was corrected in this sample without weakening validation. Photos may still be
added by the unchanged optional enrichment stage, measured separately above.

Final titles, summaries and times were inspected. No obvious cream-containing
sauce appears in the pasta cards; one explicitly uses cream cheese, which is
not a claim of dairy-free suitability. Chicken cards describe chicken/rice in
the same pan with lemon. One chickpea card reports only 15-minute cooking time;
that does not independently establish <=25-minute total time, and the unchanged
notebook filter conservatively excludes cook-only times. Source links, native
citations and exact excerpts do not independently verify every source fact.
Raw wire/source bodies are not committed. Total paid verification: seven
requests, exactly the approved initial three + diagnostic one + final three.

Final prompt re-verification: pnpm test (66/66), lint (zero warnings), strict
typecheck, production build, and post-build authentication regression (12/12)
all passed. The previously passed Chrome captures remain applicable because
the remediation changed one provider instruction line and no UI/browser code;
historical evidence was not overwritten or needlessly reshot.

## Real browser evidence — fixtures, not live provider proof

Ran the existing tests/auth/browser.ts against the built app in isolated
headless Google Chrome. Google transport uses the test-process-only fixture;
search responses are browser fixtures, while the publisher recipe image is
real HTTPS. No production bypass or runtime fixture endpoint was added.

At 320, 390, 768, 1024 and 1440 pixels: sign-in, authenticated form, publisher
image, keyboard action, search history, local filters/sort, loading/error
retention, empty/long content, and reload clearing all passed. No horizontal
overflow, unexpected console errors, or unexpected network errors occurred.
Five expected fixture HTTP 429s were explicitly excluded by the existing
harness. Logout and the Google button flow also passed.

New captures use org/reviews/single-call-recipe-search-*.png. The historical
recipe-search-notebook*.png and recipe-integration*.png files were backed up,
new captures copied under feature names, and all 19 originals restored with
matching SHA-256 hashes. There is no historical screenshot diff. The new 320px
and 1440px result captures were visually inspected: responsive form, query
history, count/sort controls and source image render without page overflow.
The full notebook captures preserve card/evidence views beyond the viewport.

## Limits and review handoff

Source evidence and summaries now originate in one model response. Exact native
citations and excerpt containment bind records structurally, not factually;
summary fidelity, reported times and dietary constraints still need sampling.
No package, lockfile, handler, auth, client, photo transport or production
configuration changes were made. Independent security/code review is separate
from this author's verification, and merge/release remain human decisions.

## Orchestrator handoff checks

After staging the verified implementation and feature evidence, the orchestrator
ran `python3 scripts/scan_secrets.py --staged`: exit 0, zero findings.
`python3 scripts/check_plan_sync.py --hook --plan intent/single-call-recipe-search/plan.md`
passed (exit 0). Message check reported 69 messages and zero violations; loop
and memory checks each reported zero violations. `git diff --check` passed.
Final independent approvals and subsequent audit-state commits remain separate.
