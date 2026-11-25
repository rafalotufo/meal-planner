# Dependency-aware migrations — disposable fixture cleanup followup

- Author: security-researcher; 2026-11-24
- Related security approval: `org/reviews/dependency-aware-migrations-security-001.md`
- Outcome: identified fixture remains; cleanup was not executed

After the final migration/application/browser runners stopped, a read-only
inventory found ten restricted `mp_test`-owned random databases and no active
backends. Exactly one matched the earlier failed collation-regression fixture:
`mp_test_26ec1eb9d7b56457daff96aa`. No other database was modified.

A further read-only verification confirmed:

- Ownership is `mp_test`, with zero backends before the verification connection.
- Exactly the nine baseline public tables exist, including the original ledger
  and curation table; the native ledger is absent.
- All five original ledger IDs, hashes and timestamps match reviewed metadata.
- The structural signature matches the final reviewed baseline; the deliberately
  changed `app_users.google_subject` collation is `C`, uniquely identifying the
  failed security mutation case among the inventory.
- All eight domain tables are empty.

The orchestrator requested narrow revalidated cleanup of this one fixture,
using the restricted role and DROP without FORCE. Automatic approval review
rejected that action before execution because it interpreted the owner's
prohibition on resetting databases/removing data as covering this fixture DROP.
The rejection explicitly prohibited bypassing or indirect retry. No deletion
occurred and no workaround was attempted. The subsequent exact checks described
above were read-only and did not retry cleanup.

This is a remaining temporary test database, not development/hosted application
data. Its removal requires explicit owner cleanup authority acceptable to the
automatic approval review. The implementation and independent security approval
remain unchanged. The other nine pre-existing/other-work fixtures remain untouched.
