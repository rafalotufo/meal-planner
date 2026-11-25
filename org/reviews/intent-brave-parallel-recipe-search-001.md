# Brave parallel recipe search — PM intent review

- Date: 2026-11-25.
- Reviewer: product-manager, independent of the orchestrator's original draft.
- Artifact: `intent/brave-parallel-recipe-search/intent.md`.
- Verdict: **Accepted for Design. No owner escalation required.**

## Scope decision

Rafael explicitly selected Brave Web Search and concurrent per-result model
curation after inspecting both the latency and the failed evidence checks.
This authorizes the local delegated org design/build/test loop. The existing
human merge/release gates remain separate; no prior release approval is reused.

A maximum of twelve validated cards is a reasonable product default within the
selected experiment and original desire for more choices. It is not a promised
result count. Keep explicit user constraints, deduplicate original sources,
reject required-evidence failures and omit unsupported optional metadata.
Named-dish recipe precision is insufficient proof for broad-query quality.
Broad searches must still discover individual recipes through a bounded,
deterministic treatment of useful collections; neither collections-as-cards nor
silent guessed dish substitutions meet this intent. A single-publisher global
restriction would unnecessarily reduce coverage and is not selected.

## Clarifications applied before acceptance

- One Brave request, at most twenty initial hits, twenty-four source-page fetch
  attempts including expansion, twelve tool-free curation calls and twelve
  returned cards per admitted request. No retry/fallback/research calls.
- Curation output cap of 1,200 tokens per call; at most twelve active model
  calls process-wide. Architecture must add bounded queueing, aggregate input
  limits and abort cleanup under the existing sixty-second deadline. Lower
  operational bounds are permitted; higher ceilings need a reviewed amendment.
- Missing provider credentials fail closed through sanitized unavailable
  behavior rather than silently returning to the former agent-search path.
- Preserve family protection, no-store/private headers, source transport safety,
  narrow menu ownership guards and larger-result save-status integration.

These are product/paid-usage ceilings for the architect to refine, not a final
technical algorithm. Per-process limits do not establish distributed spending
control; provider project controls and the existing deployment gate still apply.

## Evidence and limits

The cited live benchmark found 4.23 seconds for twelve concurrent curation calls,
with 11/12 required-evidence passes and three optional-time mismatches. It used
93.4% cached input and omitted the full application pipeline. Acceptance does
not claim guaranteed latency, production load reliability, complete preference
fidelity, or permission to weaken evidence checks. The durable research summary
and verified live implementation evidence remain required handoff artifacts.

No code, paid calls, database, deployment, merge or hosted configuration change
was performed during this review. The prior unfinished migration release work
remains archived for restoration; it was not accepted or completed by this gate.
