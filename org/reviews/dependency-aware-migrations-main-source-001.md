# Dependency-aware migrations — combined main source review

- Reviewer: reviewer, independent of integration/verification writer
- Date:2026-11-24
- Combined implementation: `49e2a64625d97adee760e44847ad445ea2b8f3d8`
- Pinned main: `d26ea59742f904f399128477bfeb369a0049ba62`
- Verification artifact commit: `39403ee`
- Verdict: **Approved for the separately owner-authorized local main fast-forward and local adoption**

No unresolved integration findings remain. The approved plan's combined-source
review prerequisite is satisfied. The orchestrator must still recheck clean tips,
unchanged main, native target compatibility and process ownership before updating
main or starting the app. This is no authority for migration, hosted access,
push or deployment.

## Source and audit preservation

Independently compared the merged tree: `lib/db`, `drizzle/postgresql`,
`scripts/migrate-db.ts` and `scripts/check-db.ts` match reviewed source `ef5d85e`
exactly. T-Rex application/library/test code and `tests/auth/browser.ts` match
pinned main `d26ea59` exactly. The normal merge had no conflicts or post-merge
behavior fixes. The shared historical-helper lint correction is identical on
both sides; its original reviewed-source snapshot still hashes to
`0952712550288485eed299f15a22f221eb1b0feb5d39f7efdeac4ac67130de1f`.
Historical review/hash records and T-Rex artifacts remain preserved.

The auth browser harness uses the feature's restricted default server fixture,
while its newly imported assertions retain the shorter5:1 canvas, request-race
wait and real keyboard focus checks. No owner-credential runtime bypass or fake
user path was introduced by integration.

## Verification assessed

Reviewed `intent/dependency-aware-migrations/main-integration-verification.md`,
private sequential suite-result JSON and browser result/manifest. Frozen install,
lint, strict typecheck and production build passed. The merged source reports
**295 Node tests and7 Python tests passed**, no failed/skipped tests: migrations36,
family34, menu69, plans23, authentication16, deployment33 and recipe/photo84.
Both real Chrome menu and authentication/T-Rex helpers passed against the built
combined source using owned disposable databases and empty paid-provider keys.

The auth browser result records successful checks at320/390/768/1024/1440,
no horizontal overflow, successful logout/mock Google callback, exactly10
intentional fixture429 messages and no unexpected console/network errors.
I independently inspected the running-game screenshots at320/1440: controls and
navigation remain readable, the shorter canvas is visible, and the responsive
page/card layouts remain intact. Verified all40 new screenshot hashes
(11menu,29auth/T-Rex). Existing screenshot files have no worktree changes;
the new evidence is separate. No actual user Google sign-in is inferred.

## Local adoption boundary

The previous migration/security review and finite-profile/older-application
semantic-backport limitations still apply unchanged. Root's native compatibility
check is read-only; the compatible five-migration state requires no migration.
Use explicit Node24.15.0/pnpm10.33.0 for main rebuild/start, preserve private
runtime configuration, and start only the identified local app at its configured
origin. Verify anonymous routing/health separately from authenticated disposable
browser proof. Record the actual outcome and retain exact combined source
identity despite later audit-only commits. If main/source/target drifts, stop and
perform the affected verification rather than silently extending this approval.
