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

All eight required combined-source commands passed: lint, strict typecheck,
production build,66 recipe tests,32 post-build deployment regressions,14 auth
regressions (including main's icon checks),34 family regressions and7 Python
workflow tests. That is146 Node tests plus7 Python tests, with no failing test
or compiler/lint suppression. Build verification included reviewed SQL/journal/
runtime metadata and the integrated Next routes/proxy.

The first typecheck exposed automatic collection of newly archived `.ts` source
copies, whose partial snapshot namespace lacked unchanged helper imports.
Eight new executable-source snapshots now use a `.snapshot` storage suffix;
manifest `path`/source-ref/hash/bytes remain unchanged, and `storagePath` records
only the archival filename. All374 snapshot hashes still verify, older archives
remain untouched, and no tsconfig/ESLint exclusion or runtime source changed.
Independent review approved this storage-only correction.

Initial sandbox deployment/auth/family commands were blocked by concrete
`listen EPERM: operation not permitted 127.0.0.1`. Their original logs are
preserved. Only those three commands were repeated with authorization to bind
isolated localhost fixture servers; all passed unchanged. The other five passing
commands were not needlessly repeated. Private0600 logs and exact stage summaries
are under `.data/staging-merge/verification/` (`summary.json` and
`local-server-summary.json`); `typecheck-initial.log` preserves the archive issue.

No new live Google/provider check was required or performed for this local merge.
Existing feature-specific browser evidence from both reviewed inputs is preserved.
The destination main update still waits for the orchestrator's recorded gate,
independent final evidence handoff and captured-tip/clean-checkout checks.

## Concurrent-main T-Rex refresh

Before the first destination update, the expected-tip check found main had
advanced to `87482edff21fadb8445209ee6195044c48c3c52e`, including reviewed T-Rex
runtime/public-asset/test changes. That source delta was not treated as audit-only
or overwritten. The first integration and its146-Node/7-Python proof were saved
as clean checkpoint `d28448909467bf433642f7f72766c57a73996281`; it was not merged
into main. The existing owner merge instruction covers this necessary refresh.

The distinct archive
`org/merge/vercel-candidate-validation-main-refresh-2026-11-24/` contains454 new
exact snapshots with executable sources stored as `.snapshot` from the start.
It does not recursively copy old `org/merge` namespaces. All378 files in the
first374-snapshot archive remain byte-identical to the checkpoint. The refreshed
82 runtime/public/third-party-license/configuration files match latest main
exactly, and staging helper/test/ignore match the checkpoint. No application
conflict or additional runtime change was required.

The new main ledger and memory raw byte streams remain canonical exact prefixes.
All81 decoded common memory objects match the common base entirely; prior T-Rex
main serialization had changed formatting only. Six prior staging decisions and
13 prior staging memory events are imported with original archived provenance;
34 conflicting feature message IDs receive unique names and live feature links
are remapped. The current human merge request is now `org/messages/ceo-0046.md`.
No new release approval is inferred. Root-authorized inbox curation closes only
16 completed imported informational records and10 completed main informational
handoffs, with exact IDs/evidence in `message-triage.json`. Original statuses
remain in snapshots; current merge authority, unanswered questions, blocking
findings and response-required messages remain open. Memory/message/loop/graph
checks pass without changing any tool threshold.

All eight commands passed on this refreshed tree: lint, strict typecheck,
production build,82 recipe tests,32 deployment regressions,14 auth regressions,
34 family regressions and7 Python workflow tests. Total162 Node tests plus7
Python tests. The three real-HTTP/database suites used the already established
localhost-binding permission from the start; no application/test assertion was
changed or skipped. Private0600 logs and stage summaries are under
`.data/staging-merge-refresh/verification/`. This new proof is separate from the
first integration's actual results. Independent refresh review approved the
resolved source boundaries, original snapshots/chains, ID maps and inbox curation.

The active destination expected tip is now
`87482edff21fadb8445209ee6195044c48c3c52e`, not the earlier captured main tip.
Before updating main, require the exact reviewed final branch SHA, a clean
destination at this tip, recorded human merge authority and no further source
movement. No hosted or provider operation was performed by this refresh.

## Final human merge gate

The refreshed integration `4a1e5bdfb3c74dfbd7f7d24a4d94123b0868538b`
passed all eight commands (162 Node tests and7 Python tests, lint, strict types
and production build) and independent refresh review. Rafael's explicit merge
request is retained as `org/messages/ceo-0046.md`; matching ledger record
`vercel-candidate-validation-main-merge-001` authorizes the local main merge of
this reviewed source. The destination must remain clean at
`87482edff21fadb8445209ee6195044c48c3c52e` immediately before the fast-forward.
The following gate/audit-only commit changes no tested source. Actual execution
is recorded after the destination update; no Production action is included.

## Executed local main merge

The executor verified clean main at expected
`87482edff21fadb8445209ee6195044c48c3c52e`, matching committed human gate
`vercel-candidate-validation-main-merge-001` (`code_owner_approve`, evidence
`org/messages/ceo-0046.md`). Main was fast-forwarded without overwrite to
`3169dfdc15f2b0670f345ffdc47c8a4ccba9d01b`, which contains reviewed/tested
source `4a1e5bdfb3c74dfbd7f7d24a4d94123b0868538b` plus audit-only approval
changes. The immediate post-merge main checkout was clean. Icons, T-Rex runtime/
assets/licenses, staging tooling and configuration retain the exact reviewed
source bytes; no application conflict or extra runtime change was introduced.

This completion update changes audit records only: implementation is merged,
CEO merge request is fulfilled, and Production release remains `not_started`.
No push, remote action, deployment, promotion, hosted setting, migration,
provider call or other production operation was performed by the local merge.
The separate completed staging deployment/evidence remains historical and was
not redeployed as part of merging.
