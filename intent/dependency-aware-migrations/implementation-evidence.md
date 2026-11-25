# Developer implementation evidence

2026-11-24, Node24.15.0/pnpm10.33.0; restricted-role owned random disposable
PostgreSQL databases only. See `red-test-evidence.md` for preimplementation failure.

- Pure graph initial green:4/4 dependency/identity/cycle/independence tests.
- First full migration/security/prototype suite:25/25, exit0.
- Existing storage/menu/plans migration regressions:17/17, exit0.
- Expanded migration suite after rewrite-rule/native-DDL/operator CLI cases:
  31/31, exit0. A final safe-temp-path regression subsequently passed with the
  native-DDL and missing-prerequisite cases (3/3 targeted, exit0); full final
  suite is32 tests and is included in root final verification.
- Protected HTTP checksum-fault non-disclosure and disposable runtime privilege
  proof:2/2, exit0. Actual server restart uses unchanged cryptographic secret;
  session/home/menu/API return503 generic private errors without reason codes,
  raw driver text or ledger repair.
- `pnpm run lint` and `pnpm run typecheck`:exit0 after source implementation.
  Root owns final exact-source build and broad regression/browser evidence.

Native successful DDL test deliberately reverses manifest order: parent CREATE
TABLE and child INSERT execute by explicit dependency, produce the reviewed
catalog, record two native identities, and rerun without duplicate rows. Failed
native DDL proves new schema and side ledger rollback together. Existing legacy
rows/data survive both approved independent orders and concurrent reruns.
Operator CLI tests actually exercise refused connection, missing runtime SELECT,
and changed ledger checksum while exposing only closed sanitized reason codes.

Review-driven corrections include hosted object-owner versus bootstrap-owner
bindings, Neon pooled-safe SET LOCAL behavior, explicit owner tooling fixtures,
ledger-view rejection before a nextval side effect, exact native-ledger exclusions,
column collation and rewrite-rule drift rejection, default/schema/database ACL
checks and both directions of runtime-role membership. Unsupported security
object classes fail closed. No existing domain SQL, journal, runtime hash array,
SQLite evidence, application auth logic or T-Rex source was changed.

The first expanded semantic-profile test failed because its fixture used a
non-Gmail allowlist entry; changing only that fixture identity to the existing
supported Gmail format resolved it. Family suite initially exposed app fixtures
passing owner credentials during process reuse; they now preserve a restricted
runtime URL and separately hold explicit owner setup URLs. No production bypass
was added. A transient fixture cleanup race with an exiting runtime backend uses
bounded retries without elevating the test role; safety owner/random-name guards
remain intact. Final root verification records the resulting family/browser runs.

Independent review requested a CLI-only postcommit distinction. The corrected
migration tool uses the internal read-only validator for its credential smoke,
retaining closed connection/permission reasons, and explicitly states when the
migration transaction already committed. The wrong-runtime-password regression
passed1/1 (exit0): child tool exits1 with committed-stage/permission-failure,
no credentials/raw driver detail, while all5 executed legacy ledger rows persist.
This is not a claim that a postcommit credential error rolled migration back.
