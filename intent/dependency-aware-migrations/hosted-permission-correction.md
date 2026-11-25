# Hosted permission validation correction and release plan

- Date:2026-11-24; author:orchestrator, from owner request “Deploy main to production”.
- Status:approved by independent plan review `f7d5e1c` and security design
  review `a630fa8`; provider-indicator clarification below agreed by both reviewers.
- Requested main at intake:`e4b8c954f6e2cab63c39216cef794187a227d79e`.
- Existing live Production:`dpl_AeQVDaT7ZCC99oLfjunTyiD1vA3a`, source`d26ea59`.
- Governing release policy:`intent/staging-first-release/spec.md` and Vercel runbooks.

## Observed blocker, without hosted changes

Current main's application/test/config trees equal the reviewed combined source
49e2a646;295 Node tests,7 Python tests and both Chrome suites are attributable.
Its fresh124-file upload-only packaging/build passes; `release-packaging.md`
records the exact e4 inventory, known moderate-only audit and limitations.

Fresh bounded read-only validation with current main against both recorded Neon
targets fails `permission-failure`. No deployment or grant/schema/data change
was attempted. Both have five expected legacy migrations, unchanged application
grants, all required access, restricted runtime flags, no runtime schema/database
CREATE, and expected namespace ownership. The two failing predicates are:

1. PostgreSQL17 creator administration: the sole membership involving mp_runtime
   is role=mp_runtime/member=neondb_owner (the actual database owner),
   grantor=cloud_admin, ADMIN=true/INHERIT=false/SET=false. There is no outward
   runtime membership. The actual cloud_admin role is SUPERUSER. PostgreSQL's
   documented creator grant is administrative; its false SET/INHERIT flags are
   accident safeguards, not containment of the trusted administrator's power.
2. Exactly nine non-owner default-ACL entries owned and granted by cloud_admin,
   schema public, grantee neon_superuser, all grantable=true: sequence object S
   privileges SELECT/UPDATE/USAGE, table object r privileges
   DELETE/INSERT/MAINTAIN/SELECT/TRUNCATE/UPDATE. These apply to objects created
   by cloud_admin, not mp_migrator. No managed-creator non-owner default grant
   was observed. The broad all-role check incorrectly rejects this known
   platform baseline.

These are compatibility observations, not permission to modify the database.
Do not revoke creator memberships or change hosted default privileges.

## Exact finite correction

Derive a typed permission context from real catalog queries inside the existing
bounded validation transaction: actual database name/owner, actual cloud_admin
SUPERUSER state and the already-bound managed object owner. No environment
override, caller-supplied production fixture, remote metadata fetch or role-name
match alone can activate an exception.

Recognize the hosted baseline only when database=meal_planner,
database owner=neondb_owner, managed owner=mp_migrator and cloud_admin actually
has SUPERUSER. This uses the existing trusted administrator boundary; a database
administrator capable of changing roles/schema/data remains trusted, not an
attacker made harmless by SET=false.

For that context, require exactly the single inbound creator row described
above and the exact nine normalized non-owner default rows. Reject duplicates,
partial sets, additions, wrong role/member/grantor/namespace/object type/grantee/
privilege/grant option, malformed fields and all outward runtime memberships.
Native/local/owned-test contexts retain the empty-membership/empty-non-owner-
defaults contract. An empty hosted default set is not a silent drift fallback.
No general ignored-role/default-ACL wildcard is added.

Validate context field types before choosing a policy. Actual database owner
neondb_owner OR actual cloud_admin SUPERUSER=true indicates a hosted-like
context and requires the full exact Neon binding plus1+9, even if both row sets
are empty. Partial/missing hosted bindings therefore cannot fall through to an
empty native policy. A generic database named meal_planner with an ordinary
owner and no platform SUPERUSER indicator retains the pre-existing empty-set
contract, subject to every existing identity/flag/object/schema/access check;
the database name alone introduces no unrelated generic-PostgreSQL restriction.

Keep runtime privileged-role flags, exact current table/column/schema ACLs,
required effective permissions, object owners, ledgers, constraints, indexes,
functions/triggers/rules/RLS and schema checks unchanged. Public errors remain
generic; operator reasons remain sanitized. No SQL migration, new applied ID,
ledger write, grant execution, data import or hosted configuration is required.

## Test-first implementation and review

The actual both-hosted failure is red behavioral evidence. Before changing the
predicate, add strict TypeScript policy regression tests from the sanitized
catalog shapes, initially demonstrating rejection of the legitimate baseline.
Cover exact positive hosted/native cases and every negative tuple/default-set
variant above, including managed-creator defaults, unexpected actual grants,
runtime flags, native context spoofing and missing platform SUPERUSER binding.
Pure tests must use the same policy called by the real catalog-backed validator;
do not change shared cluster roles or elevate mp_test to manufacture fixtures.
Keep existing owned-database malicious default-ACL, role/access and generic HTTP
tests, and rerun both hosted validators strictly read-only after the correction.

Changed-file manifest: focused `lib/db/security.ts` integration and a small typed
platform-permission policy module if useful; `tests/migrations/**` strict TS
regressions; this feature's specs/plans/release evidence and setup/troubleshooting
notes; org/graph audit only. Historical SQL, journals, descriptors/checksums,
dependencies/independence, actual grants, app/auth/UI and package pins stay intact.

Run lint/typecheck/build, all migration/family/menu/plans/auth/deployment/recipe
and workflow checks, applicable existing Chrome regressions, staged secret scan
and diff check. Obtain independent code and security approvals of the corrected
exact source. Recreate the upload inventory/export/build for its new SHA; e4's
packaging cannot certify a changed source. No critical/high dependency advisory
may be hidden; the existing single moderate tooling finding stays explicit.

## Staging and Production gates

The owner request authorizes release preparation, existing-lane staging deployment
and inspection. Pin the reviewed corrected source before any upload; no later
audit HEAD substitution. Verify actual Hobby account/project/team, unpaused
state, manual Production assignment, stable Preview branch classification,
canonical direct Production routing, existing sealed environment metadata and
intentional Preview/Production differences privately. Do not print/pull secrets.
Use pinned scripts-disabled Vercel66.6.0 and an exclusive owned staging lane.

Deploy the corrected source to isolated keyless Preview, inspect READY/source/
target and safe alias assignment, preserve Production mappings, and obtain
honest HTTP/browser/configuration/runtime evidence. No paid request, key copying,
protection/domain change, real-user mutation or new provider scope is implied.
Mark protected/unknown checks inconclusive; do not forge helper attestations.

Prepare concrete staging results and remaining gaps before asking the owner for
one combined decision: accept exact source/Preview/profile/gaps, approve local
main fast-forward to the correction, and authorize separate Production candidate
creation/manual promotion plus bounded15-minute anonymous observation/recovery.
The original deploy-main request is not acceptance of newly discovered source
changes or unobserved named staging gaps. No Production build/promotion precedes
those exact committed/unexpired gates. No old release gate is reused.

If approved, keep the Production source exactly equal to accepted staging SHA;
create with `--prod --skip-domain`, inspect packaging/readiness, manually promote
that Production candidate, run canonical anonymous smoke and observe15minutes.
Proposed recovery is rollback only to freshly verified compatible AeQV/d26,
preserving current five-migration data and credentials; no old two-migration
artifact, reset/restore/pause/grant is authorized by this plan. If that recovery
cannot be established, obtain a concrete separate scope before release.

Archive the prior solved org loop and use a new bounded correction/release
workflow. Main/local app remain at the already-approved source until the owner
accepts the reviewed correction. No hosted migration or paid effect is authorized.
