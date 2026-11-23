# Single-call recipe search — progress

## Local completion

The six-turn org loop completed as solved after all configured acceptance
commands passed and independent security/code reviews approved without required
findings. Implementation commit: 3bdc763 on codex/single-call-recipe-search.
Staged secret scan found zero findings and approved-plan synchronization passed.
The implementation is ready for human merge review; release remains not started.

## Implementation and TDD

- Scope: approved spec/plan on local branch codex/single-call-recipe-search.
  One direct flattened-response parser replaces the research/curator join and
  second model request. Native citation cleanup and transport body bounds are
  retained. Optional metadata has separate exact same-record excerpt checks;
  malformed optional metadata becomes null without losing valid cards.
- Node v24.15.0, pnpm 10.33.0. Frozen install passed with
  `CI=true pnpm install --frozen-lockfile` (lockfile up to date). The first
  non-interactive install attempt stopped at pnpm's no-TTY confirmation; no
  dependency version or lockfile change was made.
- RED before provider edits: `pnpm test`, exit 1, 66 tests, 56 passed,
  10 failed. The success fixture supplies an unused legacy curator response,
  demonstrating the old adapter's request-count failure `2 !== 1`; combined
  card, local evidence, optional-null, duplicate and configured-model paths
  also fail against the old two-call adapter. A fixture inference compile
  error was corrected before this meaningful behavioral red run.
- GREEN after minimal provider implementation: `pnpm test`, exit 0,
  66 passed, 0 failed, 0 skipped. Retained existing native citation offset,
  Unicode, overlap, body/response failure, handler, photo, notebook and URL
  safety cases; adapted obsolete second-call cases to the one-record contract.
- README now documents the single request, 5,000-token ceiling, no repair
  fallback, same-response evidence limits, and unchanged optional photos.

Full verification, actual-provider live evidence, and real Chrome evidence are
recorded in org/reviews/single-call-recipe-search-verification.md as completed.
Independent security/code review and human merge/release remain separate.

## Metadata diagnostic scope

The three actual-adapter live samples all returned null time/image metadata
on their nine valid cards. Nullable values are permitted, but availability
could regress versus the earlier prototype. A one-query diagnostic plan
addendum authorizes inspection of unchanged actual wire fields under existing
bounds, after peer acknowledgement. No further model/settings sweep or runtime
retry is introduced; source changes require an established cause and review.

The peer-approved diagnostic completed in 26.475 seconds with one request and
four valid cards. All expected optional fields were present, including nonnull
time values and image URLs, but evidence fields contained commentary that the
source had metadata while excerpt fields contained different quoted metadata.
Every optional containment check failed, so the unchanged parser correctly
returned null metadata. A prompt-only clarification was proposed to the
orchestrator; parser/validation weakening is not proposed. Raw body remains in
ignored build storage, with only these sanitized observations persisted.

The peer-approved remediation adds one prompt instruction requiring observed
metadata text in evidence and the identical literal excerpt without citation
display. Parser, bounds, default/configured model, and no-retry behavior remain
unchanged. Final verification is bounded to the same three synthetic queries,
for seven paid verification requests total (initial three + diagnostic + final
three). The unchanged photo enricher separately recovered 8/9 images from the
saved initial cards without an additional model call; those are later stage
timings, not end-to-end latency.

## Final verification

- Final prompt live queries: chickpea 19.774s / 1 request / 3 cards / 3 times /
  2 model images; pasta 26.652s / 1 request / 4 cards / 4 times / 2 images;
  chicken 17.739s / 1 request / 3 cards / 3 times / 0 model images. All HTTP200.
  All ten reported time pairs and four reported image pairs matched literal
  same-record evidence/excerpt containment. Other model image values were
  explicit nulls. Final median 19.774s is provider-only, not a speed guarantee.
- After the prompt-only correction: pnpm test66/66, lint zero warnings,
  strict typecheck, production build and post-build auth12/12 all passed.
  Earlier workflow7/7, deployment smoke12/12, and real Chrome QA at
  320/390/768/1024/1440 passed. The Chrome evidence is fixture-based and remains
  separately labeled from actual provider proof; no UI code changed afterward.
- New mobile320/desktop1440 result and full notebook captures were visually
  inspected. Nineteen historical PNGs were restored with matching hashes.
- Full actual command results, initial metadata failure, diagnostic cause,
  unchanged photo-enrichment recovery and final source-prompt proof are in
  org/reviews/single-call-recipe-search-verification.md. Final staged secret,
  plan-sync, org audit and independent approval records are orchestrator-owned.
