# Main notebook into PostgreSQL release candidate

Sources: PostgreSQL f5953303ac2bcfddf6d776e651cdddc2d4393d48 and already-merged main7cbe321c432532316dd23d94598ee5e75f3ce309, shared ancestor766a7925b9489ea9bfda97355f3c2f9c7d99ca67. manifest.json preserves381 exact artifacts (377 text and four historical image versions) from both tips, including complete independent ledgers/memory/loop/message/review namespaces. Both source worktrees remain unchanged. No old hash chain was concatenated or rewritten.

Canonical ledger/memory retain the complete PostgreSQL prefix and append sourced imports only for main's actual Notebook decisions/events. ledger-imports.json maps four imported existing decisions, never new PostgreSQL main-merge/release approval. message-map.json maps six main message collisions to fresh aliases; imported Notebook artifact references use these aliases while originals remain byte-exact in the archive.

The active PostgreSQL graph and completed six-turn loop remain unchanged. Notebook loop/graph are preserved separately. Main's UI/browser/notebook tests are combined with current family context before home/provider work. This local main-into-release-branch integration is not the separate human PG/family-to-main merge gate or production release.
