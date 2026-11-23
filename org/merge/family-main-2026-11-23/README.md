# Local main into family feature — audit integration

The user requested updating the current family feature from local main. This is
main **into the feature branch**, not authorization to merge the family feature
into main or deploy it. Sources are immutable snapshots:

- Feature: `5eaff43` (full SHA in manifest.json).
- Local main: `766a7925b9489ea9bfda97355f3c2f9c7d99ca67`.
- Common ancestor: `305b14aa6a31c35f22f2b428484362d93e12dbae`.

`manifest.json` records 129 exact source files and SHA-256/byte lengths. Both
original ledger/memory/loop/status/graph namespaces and all source messages are
preserved under `feature/` and `main/`; family source specifications and review
records are preserved too. Never concatenate the divergent hash chains or
rewrite original hashes. Verify each archived ledger independently.

Canonical ledger preserves main's complete chain unchanged as a prefix, then
appends five `import-family-*` records naming the original existing approvals,
record IDs, hashes, timestamps and archived source. These carry actual prior
family decisions into the merged namespace; they are not new approvals or
production authority. `ledger-imports.json` maps their IDs.

Canonical memory preserves main's stream and imports branch-only family events
under fresh IDs with exact archive sources. `message-map.json` resolves thirteen
same-ID/different-content message collisions with fresh feature aliases. Main
messages retain their IDs; canonical family message copies update ID/reply/file
references, with provenance footers. Original bytes remain in the manifest.
Active family documents/reviews use those unambiguous aliases; archived originals
retain their historical source namespace. No user decision was invented.

The active graph remains the family feature with implementation **in_review**,
release **not_started**, and no reused human merge/release gate. The completed
family loop config/state/history remains unchanged, preserving its actual prior
acceptance snapshot. The completed Vercel loop is independently archived under
`main/org/loop/` with its graph under `main/workflow-graph.yaml`. Combined recipe,
photo, smoke and family integration checks are recorded separately in
`org/reviews/family-main-integration.md`; no loop reset or fabricated turn occurs.

Main's recipe/photo UI and Node24/Vercel configuration are retained, with current
family guards on home and recipe search before provider work. This checkout still
uses local SQLite and is NOT ready for Vercel Functions; hosted PostgreSQL work
belongs to the separately requested chat/worktree. No provider, credentials,
local database service, cloud configuration or production deployment is changed.
