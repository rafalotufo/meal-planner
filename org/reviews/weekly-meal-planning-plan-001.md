# Independent specification/plan review — weekly meal planning

- Reviewer: reviewer (independent of architect and product-manager)
- Date: 2026-11-24
- Artifacts: `intent/weekly-meal-planning/spec.md`, `intent/weekly-meal-planning/plan.md`
- Verdict: Approved for local implementation under the org peer gate

## Assessment

No blocking Bugs, Security or Compliance findings. The specification gives an
implementable first increment matching the accepted intent: seven Sunday–Saturday
dinners from the family menu, Thursday by default with an environment-configurable
day, approvals and concrete swaps, no attendance option, and retained planned
history that favors variety while permitting repetition.

Calendar and operational decisions are explicit (`spec.md:26–75`): Toronto
09:00, the first strictly subsequent Sunday, idempotent due-day retries and a
real scheduled CLI rather than writes on a read. The uninstalled launchd template
and no-off-day-catch-up limitation preserve the existing deployment contract.
This is approval to build/test the worker and template, not to claim unattended
Production scheduling or activate a service.

Family isolation and concurrency have sufficient implementation direction
(`spec.md:140–190`): page/session context, transactional membership recheck before
decision reads, plan/family-bound queries, exact action unions, stale revision
conflicts, approval invalidation on accepted swaps and atomic confirmation.
The existing `lib/identity-access.ts` and `lib/db/connection.ts` provide the
specified admission and shared-lock transaction primitives. The CLI has no
HTTP exception and rechecks persisted eligible members under the same lock.

Source-URL recency and standalone validated snapshots (`spec.md:79–138`) avoid
resetting history on menu removal/re-addition or deleting history with menu rows.
Bounded eight-week history, seven selected candidates, pending-suggestion caps
and paged menu/history reads prevent unbounded application payloads. Finalization
is deliberately immutable, disclosed before confirmation, and does not claim
actual consumption.

The plan names the migration, journal, runtime metadata, exact catalog, explicit
grants and rollback updates (`plan.md:69–83`), with catalog generation restricted
to owned disposable databases. Existing SQL bytes and test assertions are
preserved except for legitimate new-schema expectations. No dependencies,
provider calls, Proxy exceptions or Vercel configuration changes are required.

## Implementation notes within the approved scope

- `tests/family/storage.test.ts:11` enumerates the entire current schema. Along
  with the explicitly planned new rollback, add the three new table names to
  that assertion; preserve exact enumeration and all existing integrity checks.
  This file is already in the approved manifest.
- `lib/http.ts:5–17` supplies the existing same-origin, byte-bounded reader but
  accepts a permitted-key superset. The new action validator must enforce the
  exact required action-specific keys and required values specified at
  `spec.md:158–168`; reusing the reader alone is not sufficient validation.
- Preserve the stated activation limitation in the final delivery: no scheduler
  is installed and no hosted schema/environment has been changed. Deployment
  integration and activation need separate release authority.

## Verification contract and limits

Reviewed the linked intent, full spec/plan, org protocol/role and REVIEW.md;
inspected admission, menu validation/body/store patterns, explicit migration
privileges and existing family/menu/header regressions. The required test-first
TypeScript suite, full repository commands, real Chrome320/1440px interactions,
visual screenshot inspection and independent security/final reviews are concrete
and appropriate (`plan.md:65–123`). `git diff --check` passed for this review
artifact. This is a document/design gate; no application code or runtime test
result is asserted. Human merge/release gates remain closed.
