# Current-main refresh under the existing merge request

Rafael's original instruction remains “Merge the single-call search changes into
main” (org/messages/ceo-0026.md). No second owner instruction is attributed.
Before advancing main, the expected-tip check found concurrent reviewed main
commit a38740c, containing bundled PostgreSQL runtime metadata and a document
handoff fix for invitation navigation. The previously verified 68e1931 integration
is preserved as 9aadd83; it was not merged into main.

Integrate a38740c without changing its application/configuration bytes or reviewed
single-call recipe bytes from 7144a0f. Preserve both refreshed audit namespaces
under org/merge/single-call-main-refresh-2026-11-23, including the completed first
integration run. Use a new one-turn independent verification run; do not extend
or rewrite the completed source runs. Require all eight current commands,
including all deployment tests after build, family/auth tests and real browsers.
Update only a clean destination at its captured expected tip after final review.
Main later advanced to feb6d39 with only a gate-ledger append and an authorization
document, not application/configuration/test changes. Such late audit-only
updates may be preserved in an additional exact snapshot and canonical-main
prefix import without rerunning unchanged application checks. Before commit,
compare the application/configuration tree with the verified a38740c plus the
reviewed recipe files. Any later source/build/test/guard change requires renewed
integration verification; do not overwrite it or reuse stale proof. The original
local merge authority covers necessary current-main integration; no push,
deployment, migration, billing or credential action is authorized.
