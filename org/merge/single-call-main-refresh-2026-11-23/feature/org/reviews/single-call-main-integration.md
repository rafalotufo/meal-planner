# Single-call search — local main integration verification

## Scope and immutable inputs

The user explicitly authorized merging the single-call changes into local main.
Reviewed feature: 7144a0f. Current main: 68e1931. Shared ancestor: 7cbe321.
Integration first brings current main into the feature branch, then advances
main only after combined verification and independent integration approval.
Release/push authority is not inferred from this local merge request.

No application code conflict occurred. The recipe adapter and its fixtures/tests
are byte-identical to reviewed feature 7144a0f. Family/session/auth, native
PostgreSQL services, protected home/search routes, UI, dependency pins/lockfile,
photo transport and deployment settings remain from main 68e1931. README's
one-call description merged into main's current operating documentation.

## Audit preservation

org/merge/single-call-main-2026-11-23/manifest.json records full input refs and
190 exact snapshots with byte lengths/SHA-256 hashes. Every snapshot hash was
recomputed and passed. Both source ledgers verified independently. Canonical
ledger verification passes with main's complete ledger as an exact prefix;
nine differing prior feature approvals are imported with fresh IDs, original
commit/expiry and archived provenance. No original chain is concatenated or
rewritten, and no old release authorization is reused for this change.

Main's full memory stream remains an exact prefix. Eighteen differing feature
messages have fresh role-local aliases; canonical feature documents update
references, while the original bytes and both completed loop histories remain
archived. The review queue preserves main's records and adds unique feature
records. Both completed source loops remain immutable snapshots. A new bounded
one-turn integration-verification run retains all eight active acceptance
commands, including main's post-build family suite, and records a real independent
review rather than rewriting either historical acceptance snapshot.

Current merge authority is org/messages/ceo-0026.md and the fresh human gate
record code_owner_approve-008. Release for the integrated feature remains
not_started. Approval here does not authorize deployment or hosted data changes.

## Combined verification

Combined-tree command results:

| Check | Result |
|---|---|
| Frozen install | passed; main's exact PostgreSQL dependencies |
| Recipe/photo tests | 66 passed |
| Workflow tests | 7 passed |
| Deployment smoke | 12 passed |
| Lint / typecheck / production build | passed |
| Authentication after build | 12 passed |
| Family/PostgreSQL after build | 34 passed on scoped-config rerun |
| Auth/recipe real Chrome | passed at five widths |
| Family production real Chrome | all flows passed at 320/1440 |
| Development invitation context | isolated unchanged dev-only rerun passed |

No application, test assertion, timeout, or skip was changed. The first family
suite had 33 passes and one ENOENT because the role-privilege assertion reads
the per-checkout development.env file directly. An ignored 0600 file containing
only the existing loopback mp_runtime and mp_test URLs supplied that prerequisite;
the unchanged suite then passed all 34 tests. No admin/migration/provider secrets
were copied, and no development or hosted data was migrated or changed.

The combined family browser harness completed its production flows, then its
development StrictMode navigation timed out while the invitation page still
displayed Opening. The server logged the sign-in navigation; no application
exception was reported. The unchanged dev-only scenario passed in fresh isolated
Chrome on retry (13.317s), including its original no-error and cleared-fragment
assertions. The failure log/capture is retained separately, rather than counted
as a pass. No application fix or weakened check was used; a specific root cause
for the non-reproducing development timeout was not established.

All pre-existing screenshots were backed up and restored by hash around each
browser run; new captures use single-call-main-* names. After the owned dev
server stopped, only inactive .next/dev/types was moved to a private temporary
backup per AGENTS.md, before fresh production type/build verification. Detailed
command logs, including failed attempts, stay in ignored build/single-call-merge.
Test-only processes receive an empty paid-provider key and the pre-existing
restricted loopback mp_test configuration from the PostgreSQL worktree. Native
tests own randomly named databases and clean up only their owned test databases;
no development or hosted database is migrated or modified.

The first verification-helper attempt stopped before tests because main's
worktree has no per-worktree PostgreSQL config file. Selecting the existing
PostgreSQL worktree's restricted TEST_DATABASE_URL resolved the setup; private
values are neither printed nor committed. No credentials are copied into source.

## Active regression guard

Independent review required preserving main's family acceptance command. The
new integration run therefore retains all eight commands and one actual
reviewer verification turn, using the existing parser's flow-array format for
colon-containing command names. Both original completed loops remain immutable
in the manifest. No historical acceptance result or loop turn is fabricated.

Final staged secret scan: zero findings. Approved-plan synchronization passed;
the manifest explicitly lists unchanged files imported from main (literal
brackets use exact fnmatch escaping). Message, memory and loop checks reported
zero violations. All 190 snapshot hashes and both canonical main prefixes were
rechecked; reviewed application boundaries remain byte-identical.

Independent review caught an evidence-wrapper labeling error: broad globs had
copied historical screenshots under new aliases even when that named run did not
produce them. Those 134 extraneous aliases were moved to ignored scratch. The
collector now selects the exact harness output names and does not restore its
own new captures over fresh results. Only the unchanged auth browser harness was
rerun to capture all 19 current outputs unambiguously; it passed in 9.612s.
Final visual evidence contains those 19 auth captures, six family-production
captures, the disclosed initial development failure, and the successful isolated
development capture. All original images remain hash-restored. Application and
test assertions were not changed to resolve this evidence-collection mistake.
