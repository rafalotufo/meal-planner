---
artifact: intent/postgresql-persistence/production-release.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent PostgreSQL production release-plan review

Approved the preparation and gated release plan under `org/protocol.md`. This approves the plan, not the eventual application/source merge or an unverified deployment. Reviewed the active completed PostgreSQL loop and sibling intent/spec/plan, the hosted plan/helper/final evidence, current production-release plan, org protocol/REVIEW, the existing deployment runbook, both Git tips and the prior audited family/main integration pattern. No application/main/remote mutation, build, browser, credential-content read or deployment was performed by this reviewer.

## Assessment and gates

- **Scope and authorization:** production-release.md:4-7 accurately records Rafael’s new request to deploy Production using PostgreSQL and narrowly supersedes the older stop-before-deploy condition. It retains the existing project/team/origin, separate Preview and already-migrated Production database. It does not invent a paid provider budget, destructive migration, local-data import, broader admission policy, or new provider authority.
- **Preparation before questions:** steps1-5 prepare a concrete candidate, source integration, recovery proof, full tests and independent review before any remaining human question. Main/source family worktrees and the user's generated next-env.d.ts change remain untouched during this preparation. This is appropriate autonomous progress within the deploy request.
- **Distinct merge/release requirements:** org/protocol.md names the human merge gate separately; deployment-runbook.md:17-34 explicitly separates human merge, configuration and release and forbids deployment from an unmerged/dirty checkout. Main’s existing notebook merge approval covers notebook source6b94405, not the pending family/PostgreSQL implementation. The new deploy message is fresh release intent, but must not be recorded as a fictitious source-to-main approval or as approval of a different old source SHA. Once the integrated candidate is concrete, resolve the remaining merge gate and record the release with the actual reviewed SHA/project/scope/expiry/recovery before staging.
- **Paid-call boundary:** production-release.md:17 correctly retains the earlier explicit no-paid-call limit. The old Vercel release’s two-search allowance is not reusable. The runbook’s one normal search and at most one disconnect search are mandatory first-live checks, so an applicable bounded paid-search authorization (or an explicit owner-approved change to that requirement) must be settled before promotion. Do not promote into a known-incomplete15-minute mandatory-check window and then discover that verification cannot be authorized.
- **Recovery:** steps1 and7 correctly identify that the old deployment lacks family enforcement. Preserve PostgreSQL data; do not treat rollback to that old app as equivalent recovery after memberships or durable invitation grants exist. The final scoped recovery decision must identify whether traffic is paused or a reviewed family-capable artifact is restored. Do not silently reuse the old runbook’s pre-family statement that no database rollback is involved.

## Integration and audit evidence

Observed tips: PostgreSQL f595330 and already-human-merged main7cbe321, with common base766a792. Read-only inventory found:

| Stream | Shared base | PostgreSQL tip | Main tip | Shared prefix |
| --- | --- | --- | --- | --- |
| gates/ledger.jsonl |45rows |55rows |49rows |unchanged in both |
| org/memory/events.jsonl |50rows |68rows |52rows |unchanged in both |
| org/loop/history.jsonl |6rows |6rows |6rows |divergent completed runs |

There are six same-path/different-content message collisions: ceo-0018, orchestrator-0015, orchestrator-0016, orchestrator-0017, reviewer-0009, and security-researcher-0005. The prior `org/merge/family-main-2026-11-23/README.md` establishes the applicable pattern: preserve both exact source namespaces with a hash/byte manifest, never concatenate divergent hash chains, retain the chosen canonical chain prefix, add explicitly sourced imports for actual prior decisions, alias colliding messages and fix canonical references while retaining originals. For this integration, preserving the PostgreSQL canonical prefix and importing only main’s branch-only notebook approvals/events avoids disturbing completed hosted authorization records. Do not turn imported notebook merge approval into approval of the PostgreSQL implementation. Keep the completed loop snapshots separate rather than resetting/extending either run to obtain a passing status.

**Guard to preserve:** main’s new app/page.tsx calls requirePageSession, while the integrated PostgreSQL home must await requireFamilyContext before rendering the recipe interface/provider effects. Resolve the new notebook/grid UI with the stronger family guard, and preserve the independent search-route guard. The existing pending-identity recipe-boundary regression is a useful direct check of this merge resolution.

Notebook history is in page-lifetime React state, explicitly discarded on reload/navigation, with no localStorage or cross-user persistence. Importing it does not by itself introduce a persistent family-data leak. Its filter/sort/group actions remain local and must not cause extra paid provider calls. Existing notebook browser assertions should be adapted to provision the fixture family before protected home access, preserving the new UI checks and the family pending-denial tests.

## Pool, packaging and verification

Step3 appropriately requires official Fluid pool lifecycle guidance, a pinned stable @vercel/functions version, unchanged strict library checking, and a real PostgreSQL regression. The upcoming implementation review must assess that attachDatabasePool registration does not alter transaction connection ownership/release, migration behavior, bounded timeouts or local/native test isolation. This plan review does not claim an unimplemented attachment or published declaration graph already passes.

Step4 covers the complete combined regression set, clean-export install/build instead of disturbing active development, new merged UI in real Chrome mobile/desktop, preserved historical screenshots, audit/secret/plan checks and explicit migration/catalog asset tracing. Use fake/empty provider credentials and the existing test-process-only Google transport. A new package install and a green older candidate are not substitutes for final combined-source verification.

Steps6-7 correctly use a Production-target staging artifact with --prod --skip-domain, preserve canonical-Host rejection and platform protection, inspect the exact artifact, then promote that same artifact only under current gate authority. Do not make candidate smoke tests pass by spoofing Host or weakening auth/protection. Real Google/family persistence and hosted provider/cancellation evidence remain separate from local fixture browser success; use no production fake users or copied auth cookies. No new production schema migration is planned.

## Verdict

No Important defect in the preparation plan. Approved to integrate, implement the scoped pool support, verify and independently review a concrete candidate. The remaining human merge/release/paid-check gates and actual hosted readiness are explicit execution prerequisites, not permissions conferred by this peer review.
