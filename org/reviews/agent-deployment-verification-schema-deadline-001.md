# Verification schema and deadline — implementation checkpoint 001

- Reviewer: security-researcher; date: 2026-11-25
- Reviewed commits: schema `ea267bd`; deadline primitive `f3cc08f`
- Verdict: No blocking findings for the next local integration checkpoint.
- Scope: Actual migration/catalog/grants and transaction primitive only. This is
  not final feature approval or authority for hosted migration/issuance/deployment.

## Schema and privilege evidence

`drizzle/postgresql/fe5c2ee0-bf7f-464e-93be-2d654b4001e8.sql:24–37` preserves the
Google default while explicitly checking both branches: Google requires nonnull
subject/email with no run; verification requires null Google fields/grant and a
nonnull run. Nonnull identity_kind prevents a NULL branch result. Kind-composite
family FKs and run/family FKs prevent mixed households and cross-run members.
Lines39–56 bind capability/session member+run through a composite FK and bound
individual lifetimes; the live run cap still needs the planned store check.

Line67 revokes broad families/app_users INSERT/UPDATE before the explicit grant
applicator adds the final profile. The new compatibility profile grants only
existing Google setup columns, verified_email UPDATE, capability consumed_at
UPDATE, session INSERT/revoked_at UPDATE and required throttle DML. Runtime lacks
setup-kind/run-ID writes and run mutation. Exact ACL validation still rejects
unreviewed broad table privileges; no validator exception was introduced.

Independent comparison confirms all historical compatibility descriptors and
profiles remain unchanged (eight old profiles retained; one final profile added).
The new descriptor is UUID-native, depends on both terminal historical identities
and is not appended to the legacy journal. Tests preserve exact historical ledger
rows/Google data, reject old manifests against the new catalog, and demonstrate
atomic rollback and effective runtime denial rather than only inspecting grants.

## Deadline evidence and limits

`lib/db/connection.ts:57–92` owns its acquired connection, bounds the caller's pool
wait and work with an absolute timer, destroys acquired connections on expiration,
rejects late acquisitions, sets transaction-local statement/lock/idle timeouts and
checks expiration before queries and COMMIT. Failure attempts rollback; a timer
can destroy that connection rather than leave only a detached response race.
The expired flag plus absolute clock prevents delayed callback SQL after expiry.

`tests/verification/deadline.test.ts:5–20` proves a real inserted-then-sleeping
transaction times out, no rows appear beyond the sleep, and another transaction
acquires the common advisory lock. That test alone does not prove separate pool-
starvation, advisory-wait or JavaScript-delayed-callback paths; add focused cases
as integration proof before claiming the full planned deadline matrix complete.
A lost COMMIT response can still mean a committed transaction; implementation.md
correctly names that ambiguity and requires fresh capability issuance rather than
an idempotent retry claim. Connection destruction is not proof that an already
accepted COMMIT could never have completed. Do not broaden evidence wording.

## Independently executed checks

- `node --import tsx --test tests/verification/migration.test.ts tests/verification/deadline.test.ts`: exit0,6 passed.
- `node --import tsx --test tests/migrations/security.test.ts`: exit0,29 passed.
- `git diff --check`: exit0.

Tests used the existing restricted-role helper and owned random loopback databases,
with teardown. The initial sandboxed deadline attempt failed on loopback EPERM;
rerunning with approved local-network access produced the passes above. No shared
or hosted database was accessed. Existing schema-expectation fixture adjustment
is outside this checkpoint; final full migration/family suites remain required.

Public entry, actual synthetic session/store integration, operator secrecy,
Production target denial and browser flow were not reviewed or certified here.
