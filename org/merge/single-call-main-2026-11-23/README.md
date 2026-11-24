# Single-call search integration into local main

Rafael explicitly requested merging the single-call search changes into main.
The integration combines reviewed feature `7144a0f` with current local main
`68e1931`, sharing ancestor `7cbe321`. Exact full references and 190 source-file
snapshots with SHA-256 hashes/lengths are in manifest.json. Both source message,
ledger, memory, loop/status/graph namespaces and feature documents/reviews are
preserved under feature/ and main/. Original source files are never rewritten.

Application integration has no conflicts. The recipe provider, fixtures and
tests remain byte-identical to reviewed feature 7144a0f. Family/auth/PostgreSQL,
UI/routes, dependency pins/lockfile, photo protections and deployment configuration
remain byte-identical to main 68e1931. README incorporates the reviewed one-call
description into main's current family/PostgreSQL documentation.

Main's complete ledger is preserved as an exact byte prefix. Nine feature-only
historical decisions are imported under import-single-call-* IDs, retaining the
original gate/decision/approver/artifact/commit/expiry and naming the original
record/hash/time/evidence in the immutable archived ledger. ledger-imports.json
maps those prior decisions. Importing an old decision does not authorize a new
merge or release. No old release decision is repurposed for this integration.

Main's memory stream remains an exact byte prefix; feature-only events are
imported with fresh IDs and archive provenance. Eighteen differing feature
messages receive fresh role-local aliases in message-map.json; main messages
keep their original IDs and bytes. Feature-owned canonical documents use those
aliases. Both originals remain exact in the snapshots. The review queue retains
main's entries and adds the feature's unique entries.

Both completed source loop/config/history snapshots remain unchanged in their
archives. A separate one-turn integration-verification loop retains all eight
acceptance commands, including main's required post-build family regressions.
Its work item is intent/single-call-recipe-search/merge.md; it routes directly
to the independent reviewer without fabricated product/design/history turns.
Combined evidence is in org/reviews/single-call-main-integration.md.
The current human merge request receives its own message and gate record.
Release for the integrated change remains not_started. No remote push or
production operation is part of this local merge.
