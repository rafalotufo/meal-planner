# Brave parallel recipe search — local implementation handoff

Status: locally implemented and independently reviewed; human merge/release
remain pending. Application source: `e14feec` (including parser correction
`dc1c778`). Later commits are audit/review evidence, not new application changes.

## Delivered behavior

Brave Web Search discovers candidates; safe source fetching and bounded
collection expansion obtain original recipe evidence. Up to twelve per-result
OpenAI curation requests run concurrently through a shared process-wide pool.
Each has one eight-second absolute budget covering queue wait, response reading
and validation. An expired candidate is cancelled/skipped without discarding
valid siblings; no-card expiry is a timeout, and parent cancellation wins.
Required source/title/ingredient/method checks reject unsupported cards. Time
and photos derive from source metadata. The notebook handles up to twelve cards
through existing six-URL menu lookup chunks, preserving save/selection races.

The ignored local selector is `brave`; existing key values were preserved and
remain private. No hosted provider configuration, database schema/data, merge,
push, deployment or release was performed.

## Verification and independent gates

- Final source:112 recipe/photo tests,34 family,69 menu,16 auth and33 deployment
  tests:264 Node tests total, all passing. Python workflow:7 passing.
- Lint, strict typecheck, production build, actual Chrome390/1440, staged secret
  scan and diff check passed. Screenshots are in `org/reviews/`.
- Final security: `org/reviews/security-brave-parallel-002.md`, commit482dc2a.
- Final code: `org/reviews/code-brave-parallel-002.md`, commit6a27144. The first
  round's instruction-ItemList P2 is corrected and recorded as resolved.
- Org loop solved on turn9/10 without extension. All feature-specific review
  queues are approved; human graph gates are still unapproved.

See `verification.md`, `live-verification.md`, `live-results.json` and the
accepted/amended intent/spec/plan for actual evidence and bounded-call rules.

## Material limits for human review

Paid live checks were against earlier application2989467: named chicken-tender
query returned8 cards in9.701s; corrected broad picky-eater query returned1card
in8.163s, after an original502 was preserved. Subsequent ItemList/eight-second
changes are covered by deterministic regressions and independent review, not
another paid smoke. Verification's three-query cap is exhausted.

Broad recall is materially weak, especially when discovery finds collections.
Twelve is a maximum, not a guaranteed yield; no uncached/p95/load or personalized
picky-eater-quality guarantee is made. PM's scoped acceptance note explicitly
retains this limitation for the owner's merge/release decision. Per-process
limits are not distributed spend control. Any release needs fresh exact-source
isolated staging, owner scope/gap acceptance, separately configured Brave
credentials and a separate manual Production gate under existing runbooks.

Legacy unrelated review entries with `changes_requested` cause the org status
tool to retain busy labels for architect/developer even though this feature's
queues are approved. Those historical records were preserved, not re-approved
or rewritten to clear cosmetic status. Current loop state is the feature's
completed local-work evidence. The prior migration release workflow remains
archived without any new acceptance or release authority.
