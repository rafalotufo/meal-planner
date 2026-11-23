---
artifact: recipe-search-implementation
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: changes
round: 1
---

# Independent recipe-search implementation review

## Findings (by severity)

1. **[MED — Bugs / compliance] Native citation display contaminates identity fields.**
   In reviewed implementation `796fdf8`, `lib/recipes/openai.ts:21` permits
   native citation display text inside JSON string values without restricting
   it to evidence fields. Research candidate parsing passes the resulting
   `sourceUrl` directly to the strict URL validator (`openai.ts:100`). The
   orchestrator's actual provider smoke returned HTTP 502 after 25.12 seconds:
   its sanitized diagnosis reports a completed HTTP-200 research response,
   completed web searches, parseable JSON, and native citations, but every
   source URL included a citation-display suffix and was rejected. This breaks
   the primary live-search outcome despite successful fixture tests. The
   architect/developer are preparing a bounded representation correction:
   plain identity fields, conservative cleanup of native-annotation display
   spans, retained native URL authority, and regression fixtures. That patch
   and a live recheck remain pending review; do not weaken exact citation
   membership or treat fixture success as live acceptance.

2. **[MED — Bugs / accessibility] Keep the loading announcement outside the busy subtree.**
   `app/recipe-search.tsx:107` marks the results section `aria-busy={loading}`
   while the nested live status at line 108 changes to `Searching for recipes…`.
   [WAI-ARIA's busy semantics](https://www.w3.org/TR/wai-aria-1.2/#aria-busy)
   allow assistive technology to defer owned-content changes until busy becomes
   false. Thus the markup asks it to suppress the very progress announcement
   required by the spec while the search is pending. Put the live status outside
   the busy subtree or scope busy to the result cards. Add a browser assertion
   that the loading status has no `aria-busy="true"` ancestor; retain result
   announcements, keyboard behavior, and current layout. This finding is based
   on source semantics and the standard, not a claim that a screen reader was
   executed during this review.

## Review scope and evidence

- Read active loop/work item, current intent/spec/plan, `AGENTS.md`, `REVIEW.md`,
  application modules, all new TypeScript tests/fixtures, configuration docs,
  the `0bc1b139..796fdf8` implementation diff, security rereview, and automated /
  browser verification report. Reviewed bugs, security, and scope compliance.
- Independently ran `npm test`: exit 0, **25 tests, 25 pass, no failures,
  skips, or cancellations**. Tests compile TypeScript sources/fixtures with the
  existing compiler and run Node's native runner, matching the CEO amendment.
- Independently tested a mutation in a temporary copy of the emitted modules:
  bypassing source-specific method-evidence validation made the existing
  mismatch regression fail (9 provider tests: 8 pass, 1 fail). No tracked
  application or test source was edited by this experiment.
- Source-specific candidate ID/source/title/method checks and optional evidence
  handling preserve the approved grounding boundary. Server composition keeps
  configuration private; the route retains bounded intake/provider work,
  sanitised errors, same-origin checks, usage guards, abort, and cleanup. The
  security intake fix is present with meaningful regression coverage. No
  additional concrete code/security blocker was found in this pass.
- UI source uses React text, attributed links, fixed image geometry/fallback,
  generation checks, and abort cleanup. Independently inspected saved simulated
  desktop/mobile screenshots; layout is consistent with the approved design.
  The orchestrator's real-Chrome flow/geometry/API QA and lint/typecheck/build /
  Python evidence were read, not independently replayed here.
- The CEO-authorized `.worktreeinclude` amendment contains only `/.env.local`
  and preserves Git ignores. Independently checked the linked official
  [worktree documentation](https://learn.chatgpt.com/docs/environments/git-worktrees#copy-ignored-local-files-into-managed-worktrees):
  matching ignored files copy into future local managed worktrees; existing
  targets are not overwritten. No credential contents were inspected.
- `git diff --check` passed. No paid provider call, credential access, app edit,
  status/loop/graph/ledger mutation, commit, merge, or release was performed by
  the reviewer.

## Verdict and limits

Changes required for the two bounded findings. Targeted independent rereview
must inspect the actual citation and live-status fixes and their regressions.
Live source fidelity remains outstanding until the orchestrator supplies a
successful configured smoke and original-source comparison. Human merge and
release approval remain separate.
