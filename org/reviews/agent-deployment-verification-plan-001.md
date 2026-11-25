# Agent deployment verification — independent plan review 001

- Reviewer: reviewer; date: 2026-11-25
- Reviewed plan: `3d7e5fc`, unchanged at audit HEAD `3a0da71`
- Inputs: approved sibling spec, accepted intent, plan-security001, current
  identity/session/menu/plan-generation and database/catalog tooling
- Verdict: **Approved for owner plan consideration; no blocking findings.**
- Boundary: planning review only. Owner plan approval precedes code; hosted
  migrations, credentials, data, ingress and releases remain separately gated.

## Evidence and assessment

Applied `REVIEW.md` bugs, security and compliance passes plus document-review
handoff integrity, execution shape, specificity, simplicity and evidence lenses.

- **Ordered implementation:** `plan.md:25–201` supplies fifteen dependent slices
  with three checkpoints, meaningful strict TypeScript regressions first and
  disabled entry until dependencies are ready. Schema/privileges and principal
  representation precede exchange/session integration; guarded entry precedes
  authenticated feature coverage and packaged/browser verification. Large
  route/helper changes are explicitly split into smaller commits. The scope is
  substantial but the sequence is concrete and preserves existing Google checks.
- **Relational and grant fit:** `plan.md:46–79,205–222` preserves immutable legacy
  SQL/ledger history, declares both terminal dependencies for a UUID-native
  migration, assigns catalog/security proofs and explains nondeferrable insertion
  order. Removing broad table ACLs before column grants addresses the actual
  additive grant applicator. Existing profile grammar already accepts table.column
  (`lib/db/migration-graph.ts:66`); `lib/db/security.ts` already checks column ACLs
  and effective privileges. No unlisted validator rewrite is implied by this plan.
- **Admission and deadline proof:** `plan.md:66–100,113–150` preserves malformed-
  allowlist fail-closed behavior, typed member kinds, raw credential binding,
  current mutation-time admission, revocation and existing Google menu JWE checks.
  Deadline work explicitly covers acquisition, lock, statements and commit, with
  real rollback/cancellation and delayed row/pool observations. Lines127–140 and
  184–194 require the exact handler exemption and pinned-server no-EOF/trickle
  regressions, avoiding the known Proxy dispatch conflict and response-only races.
- **Ordinary browser and credential handoff:** `plan.md:102–111,184–194,224–232`
  assigns operator lifecycle, exclusive mode0600 handoff and actual form/server-
  cookie tests. It explicitly acknowledges tool arguments/traces are not redacted
  by password masking. Private trace handling and remote-agent transfer remain
  prerequisites, not fictional capabilities or permission to expose real secrets.
- **Coverage and policy boundaries:** `plan.md:142–182` denies synthetic URL
  curation and Google-only invitation/provisioning at server/store boundaries,
  retains family summary and plan collaboration, excludes synthetic families
  from global generation and separates synthetic evidence from Google assertions.
  Active AGENTS/runbook amendments are assigned at lines175–201; no historical
  attestations are rewritten or gap acceptance inferred from synthetic success.
- **Manifest and commands:** `plan.md:240–314` names existing verification commands
  and a49-entry changed-file manifest. A read-only Python fnmatch probe confirmed
  dynamic auth/menu bracket paths, nested invitation routes, new verification
  helpers/tests and UUID migration files match the declared patterns. Referenced
  existing modules/catalog paths are present. The scoped generation adapter can
  reside in the listed verification operator module; if implementation instead
  changes an additional scheduler/tool file, add its exact manifest entry through
  the normal plan-sync process before that change.
- **Readiness honesty:** `plan.md:17–23,316–325` restricts implementation experiments
  to owned local databases/servers and leaves scoped platform ingress, cookie
  continuity, deployment pinning and private handoff unproven. Local tests cannot
  claim hosted readiness, live OAuth/provider success or deployment authority.

## Handoff and verification

No document correction is required before owner consideration. Carry the assigned
negative tests and independent SQL/code/security reviews into implementation,
especially uncertain commit outcomes, effective denied grants, all admission paths
and copied-configuration Production rejection. Stop for design correction if the
stated deadline/cancellation contract cannot be proved; do not silently weaken it.
`git diff --check` passed and the plan is unchanged from its reviewed source.
No code, SQL, configuration, status, credentials or hosted operations were changed.
