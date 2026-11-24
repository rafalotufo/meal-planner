# Isolated staging — current-main integration

Rafael explicitly requested merging this work into local main. This integration
prepares the staging branch for that authorized merge; the destination is not
updated until combined verification, independent review and the recorded human
merge gate are complete. No remote, deployment, promotion, credential, provider
call, data effect or Production release action is included.

## Captured clean inputs

- Staging branch: `7bbd3c84ce5cbea0f383a652884adada98c117dd`.
- Current main: `37b608372505ee852b116cb8870581fabf4243aa`.
- Common base: `2ee77aa24d09f84e01e2f4f168efff71ccb77492`.
- Integration uses the existing staging worktree, then advances only the clean
  existing main checkout at its captured expected tip. Reinspect any later main
  movement; never overwrite another change or reuse verification for new code.

## Reconciliation and preserved evidence

`org/merge/vercel-candidate-validation-main-2026-11-24/manifest.json` records374
exact file snapshots and SHA256 hashes from both original namespaces. Source
loop/config/history/graph, message, status, memory and ledger bytes remain
archived separately under `main/` and `feature/`, alongside changed artifacts.
Older archives remain unchanged.

The canonical main ledger and memory streams remain exact byte prefixes.
Six branch-only prior decisions are appended with the existing gate tool under
their original unique IDs, preserving gate/decision/approver/artifact/commit/
expiry and embedding original source ledger path, hash, decision timestamp and
evidence. These are imports of existing decisions, not new approvals. Both
original chains remain independently verifiable; no archived record is rehashed
or silently rewritten. Twelve branch-only memory events are imported under fresh
IDs with original event/source provenance.

Eight colliding feature messages are imported under unused IDs; original main
message identities stay fixed. `message-map.json` and `event-map.json` record
the mapping, and live feature references are rewritten consistently. Exact
original messages remain in the snapshots. Independent review queues are merged
without dropping records. The canonical active loop/graph stays on staging;
the app-icon workflow and both historical source runs remain archived. Historical
artifact hashes retain their original meaning, rather than claiming a new test
run against rewritten documents.

## Runtime boundaries

All73 application/lib/SQL/runtime/dependency/build-configuration files match the
captured current main bytes exactly, including its reviewed tab icons, layout
metadata and exact public icon-route exceptions. Staging helper/test and
`.vercelignore` bytes match the reviewed staging input exactly. No application
conflict or additional runtime/authentication change was necessary.

Snapshot hashes, canonical stream prefixes and these source boundaries are
asserted in `reconciliation.json`. Message/memory/workflow/loop checks and
`git diff --check` passed on the resolved unstaged tree. The staged import also
reports pre-existing whitespace in main's unchanged app-icon build/lint/red logs
and their exact archival copies; those historical evidence bytes are deliberately
not trimmed. No new source/document whitespace issue or unresolved merge marker
was found. Both original source ledger chains independently verify. They are
retained for independent verification, not used to infer a new release grant.

## Combined verification

Pending actual commands on the integrated source: lint, strict typecheck,
production build, recipe tests, post-build deployment regressions, auth and
family regressions, Python workflow tests. Logs remain private under
`.data/staging-merge/`; actual results and independent integration review follow.
No new live Google/provider check is required for this local merge. Existing
feature-specific browser evidence from both reviewed inputs is preserved.
