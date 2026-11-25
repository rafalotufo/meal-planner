# Verification/main release-preparation plan — independent review 001

- Reviewer: reviewer; date: 2026-11-25
- Inputs: draft `main-release-plan.md`, feature `a8867b4`, main `cd60db4`,
  actual Vercel exclusions, package scripts and main validator/test changes
- Verdict: **Changes requested: one narrow manifest/proof refinement before code.**
- No code, status, ledger, commit or hosted effects performed.

## Required refinement

**[P2, Compliance] Name the combined security test reconciliation explicitly.**
`main-release-plan.md:40–43` requires retaining main's security tests, but the
changed-file manifest at lines54–63 omits `tests/migrations/security.test.ts`.
Both histories modify that file: main adds the real PostgreSQL ordinary-column-
option rejection (`ALTER ... SET (n_distinct=42)`), while the feature adapts native
ledger/counter assertions. Preserve their union rather than selecting either
branch's whole file. Add that exact path to the manifest, narrowly for merge
preservation and any combined-fixture regression needed before implementation.
Explicitly require the focused `tests/migrations/platform-permissions.test.ts`
and `tests/migrations/attribute-options.test.ts` checks plus the real security
fixture on the combined verification catalog. Preserve main's `lib/db/security.ts`,
`platform-permissions.ts` and `attribute-options.ts` behavior without broadening
its finite policy; any additional edits need their exact manifest refinement.

## Assessment of the remaining plan

The packaging defect is concrete: current `.vercelignore` excludes `scripts`,
while package build/dev/typecheck invoke the manifest generator there. Moving
only that generator into uploaded `lib/verification`, excluding `.verification`
and building a fresh tracked-file export is a scoped correction. The RED must
come from the actual missing generator, and GREEN must create the disabled
ordinary/Production manifest rather than copying stale local state. Existing
operator/test/audit/credential exclusions stay intact.

The plan appropriately rejects unsupported ignore grammar, uses only owned local
exports/databases, preserves pinned dependencies, requires the complete combined
checks and independent source/security review before the owner-authorized main
merge. Source packaging alone does not supply exact staging acceptance or hosted
schema/data/ingress authority. Root-owned audit reconciliation must archive both
original chains/messages and transcribe only actual feature decisions onto the
unchanged main canonical ledger, preserving source references and no fabricated
approval. No new intent/spec cycle is needed for this routine integration.

After the narrow refinement above, the plan is suitable for integration work.
`git diff --check` passed. No application/build/browser/hosted success is claimed
by this document review.
