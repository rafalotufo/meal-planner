# Concurrent audit integration

User explicitly requested `merge to main` after recipe-photo verification.
The branches independently extended the same audit prefixes. Concatenating their
hash chains or rewriting historical hashes would invalidate their evidence.

- `manifest.json` records exact source commits and SHA-256 for every archived file.
- Both original ledgers and memory streams are preserved byte for byte under `HEAD/`
  and `main/`. Verify each archived ledger independently with `gate_ledger.py --ledger`.
- The canonical ledger preserves main's complete chain unchanged and appends new
  `import-*` records citing the original recipe approvals and hashes. Imported
  records carry existing decisions into the merged chain, not new approvals.
- Canonical memory preserves main's original IDs; branch-only events are appended
  with fresh IDs and source references to their archived originals.
- Active loop remains the completed recipe-photos loop, including its historical
  npm command labels and actual captured acceptance. These are historical evidence;
  integration runs pnpm checks separately rather than relabeling old commands. Authenticated-access completed loop is also
  archived at `org/loop/archive/authenticated-access-2026-11-23/` unchanged.
- Recipe security finding messages retain IDs `security-researcher-0001/0002`
  because final recipe reviews explicitly reference their resolutions. Main's
  two status messages survive byte-exact in this archive, and copies appear as
  `security-researcher-0003/0004` (only their IDs changed). Main's original memory
  message references are interpreted in the source-main namespace in this archive.
- Human merge authority is `org/messages/ceo-0006.md` and canonical ledger record
  `merge-recipe-search-photos-001`. Its commit identifies the reviewed recipe tip;
  current main integration and verification are the necessary authorized follow-up.
- Implementation remains `in_review` until actual merge. No release approval added.


## Later main audit commit

Main subsequently advanced to `305b14aa6a31c35f22f2b428484362d93e12dbae` with five audit-only file changes.
`main-followup/manifest.json` preserves those source files byte for byte.
Its original `mem-0023` overlaps a recipe-import ID, so the new decision is
imported under a fresh ID with its exact archive source. The active recipe
queue/status remains intact. The latest authenticated-access merged graph is
also `org/loop/archive/authenticated-access-2026-11-23/workflow-graph-merged.yaml`;
the previous archived graph is intentionally unchanged.
