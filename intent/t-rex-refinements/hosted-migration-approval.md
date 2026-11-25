# Hosted cutover approval — 2026-11-24

Rafael answered “approved” to the concrete proposal in this chat: apply migrations0002–0004 on Preview first, then Production after exact-source staging acceptance; use verified backups, preserve all existing records including seven Production menu recipes, and pause only the meal-planner project if cutover/required health fails. Source is pinned d26ea59742f904f399128477bfeb369a0049ba62; target/scope/effects and execution safeguards are in release-preflight.md and its independent review.

Preview migration and staging deployment/validation may proceed now. Production schema authority is conditional on later actual exact-source staging acceptance; this approval does not fabricate that acceptance. Production candidate creation/manual promotion remains subject to the staging-first runbook's concrete release gate. No paid requests, persistent fake data, planning-job activation, schema resets/drops, ledger rewriting, backup restore, domain/credential/protection/billing change or unrelated project action is included.

Use one bounded cutover run, with a two-hour operational approval expiry recorded in the gate ledger. New source, changed target, unexpected schema/data/permissions or a different action requires re-evaluation. Preserve the existing Production deployment and data until the authorized later cutover boundary.
