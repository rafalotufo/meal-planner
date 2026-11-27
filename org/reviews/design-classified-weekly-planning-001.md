# Classified weekly planning — independent design review

- Reviewer: reviewer (independent of PM and architect)
- Date: 2026-11-27
- Source reviewed: `737458b`; accepted PM intent `466a316`
- Artifacts: `intent/classified-weekly-planning/spec.md`, sibling `plan.md`
- Verdict: **Approved for local implementation**
- Findings: none requiring changes; no nits.

## Evidence and assessment

**Bugs / correctness:** Specification lines31–45 ranks ready saves within category
before applying4/2/2 targets, preserves existing-week idempotence and returns empty
without inserting an invalid empty plan. This directly replaces the global
LIMIT7 and rotation in `lib/plans/generate.ts:44–54`; category shortages cannot
borrow from other categories. The family/source uniqueness constraint makes
source-distinct partition results possible without an extra deduplication pass.
Specification lines75–97 covers both parser and actual-array index limits, and
current-menu category checks on suggestion and acceptance. Existing
`lib/plans/store.ts:46–78` already owns the locked admission/read/update sequence,
so those comparisons can precede any revision or approval mutation. Legacy-null
slot compatibility is explicit and does not invent a historical role.

**UI / architecture:** Specification lines108–124 extends the existing optional
query API with a validated, bound category predicate before LIMIT51. Existing
`lib/menu/store.ts:22–31` and `app/api/menu/route.ts:21–29` support this narrow
addition; unfiltered callers remain compatible. Snapshot grouping at lines128–143
preserves original array indices rather than group-local indices, explicitly
covering slot7 and accessible h2/h3 hierarchy. The pure composition module keeps
fixed policy shared between server and UI without a new service or dependency.

**Security / storage:** Specification lines49–71 names an additive dependent
native identity, acquires the common lock, changes only the two confirmed existing
constraint bounds and captures the actual PostgreSQL catalog signature. Existing
`drizzle/postgresql/0002_weekly_meal_planning.sql:7,29` supplies the original
constraint shapes, while0003 retains the named meals constraint. Historical SQL,
profiles, grants and snapshot data are preserved. The existing native migration
loader can discover the appended descriptor without altering historical public
Drizzle journal evidence. No hosted or development execution authority is implied.
Exact menu guards, current family admission and verification permissions remain
unchanged; category input is validated and bound.

**Verification / performance:** Plan lines64–116 requires red tests for8/9 arrays,
7/8 indices, eight→nine upgrade preservation, real restricted rights, quotas and
recent ranking, null/unready/foreign exclusion, reclassification races, filtered
pagination beyond50 unrelated entries and real Chrome320/1440 grouped/eighth-slot
flows. Existing scheduler deadlines and no-provider generation remain unchanged;
selection returns at most8 snapshots and lookup remains paginated. Required build,
strict checks and relevant regressions are retained. Test mutation experiments
and runtime/browser claims belong to implementation review; no application code
exists in this design-only gate and none was executed or fabricated here.

## Gate scope

Approval permits the specified local implementation and disposable owned-fixture
verification. It grants no merge, push, development/hosted migration, grant,
issuance, staging deployment or Production release authority. Separate independent
security and code review and human merge/release gates remain mandatory.
