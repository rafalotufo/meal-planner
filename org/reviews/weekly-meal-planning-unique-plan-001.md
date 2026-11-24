# Unique weekly recipes — independent specification/plan review 001

Independent reviewer; writers: architect/product-manager. Date: 2026-11-24.
Active work: weekly planning uniqueness refinement, plan-review turn3.
Inputs: ceo-0054 and PM intent acceptance; current intent/brainstorm/spec/plan;
AGENTS.md, org protocol/reviewer role, REVIEW.md and code-review-and-quality skill.

Verdict: **Approve bounded specification and implementation plan.** No unresolved
required findings. Two consultation corrections are incorporated:0003/rollback/
archive paths now appear in the parser-recognized top manifest, and the first0003
statement must acquire FAMILY_WRITE_LOCK before application-table ALTER/access.

## Review passes

**Bugs:** One-to-seven canonical-source-unique recipes and empty-menu skip match
the clarified small-menu outcome. Dynamic UI counts, actual-length bounds and
strict unique-draft parsing align generation, HTTP/store and presentation. Both
proposal creation and acceptance recheck uniqueness under the common write lock;
a retained cross-slot proposal which becomes conflicting returns409 without
consumption and remains rejectable. Approval resets, revision conflicts and
unrelated pending carry-forward remain intact. Legacy final projection dedups
only the read display and honestly reports original repetitions while preserving
raw immutable final history/recency.

The additive0003 repair preserves first snapshot/order and affects duplicate
drafts only. Original revision/cohort/index mappings are materialized before
writes. Selected deterministic same-user merged-key losers become stale before
survivors move atomically to both their compacted slot and new revision; the new
cohort prevents transient conflicts with old-slot pending keys. A revision bump
and approval reset occur once per affected plan. Unique drafts, other plans and
historical proposal/final facts stay unchanged. Missing/malformed source keys
and revision overflow must abort/roll back. The migration lock remains first,
then family lock before ALTER/validation/repair, avoiding inverted runtime table
lock ordering. Rollback must explicitly fail on incompatible compacted data and
must never pad, delete or rewrite plans. This design is coherent.

**Security:** No new API/authentication/provider/scheduler authority or runtime
grants are introduced. Current admission/family checks, parameter binding,
transaction lock and safe snapshot parsing remain mandatory. Family/plan-scoped
materialized mappings prevent cross-family remaps. Temporary SQL structures must
remain transaction-local with no persistent helper/grant. New duplicate-conflict
copy is bounded text. No security design finding remains.

**Compliance:** The amendment explicitly supersedes exact-seven/cycling behavior
and preserves no-date presentation, immutable history and retained suggestions.
The top manifest includes the new migration, rollback and archive. Genuine
0000–0002 upgrade fixtures, mixed drafts/finals, deterministic collisions,
survivor identity, cardinality1/2/6/7/8+, duplicate swap races and actual HTTP/
browser dynamic counts provide appropriate verification targets. Prior SQL/hash
bytes must remain unchanged; fourth journal/hash/catalog and unchanged grants
must be demonstrated. Local repair follows tests and independent source/security
review against a precisely verified dedicated local target; no hosted operation
or release is authorized.

## Implementation and evidence boundaries

Approval is for this design, not pending source or migration execution. Require
actual red/green tests, full required suites, strict checks/build and Chrome at
320/1440 with inspected fresh screenshots. Migration tests must demonstrate
atomic rollback on malformed keys/overflow, collision-safe cohort remapping,
idempotency, authentic upgrade history and unchanged final/foreign/unique facts.
Inspect the implemented SQL and final source independently before local repair.

Preserve the live owner dev server, its .next cache and preexisting next-env.d.ts
change. Performing implementation/verification in the root-prepared private
source copy is consistent with this isolation boundary; copy back only approved
manifest sources using baseline/hash checks and confirm the final reviewed SHA.
It adds no runtime configuration or new source scope. Root owns all source-copy,
process/ledger, commit and precise-target operations. This reviewer edits only
new review artifacts; prior reviews remain historical.
