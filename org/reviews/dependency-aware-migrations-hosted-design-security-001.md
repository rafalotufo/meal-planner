# Hosted permission correction — independent security design review

- Reviewer: security-researcher; 2026-11-24
- Reviewed plan source: `daaad23`
- Artifact: `intent/dependency-aware-migrations/hosted-permission-correction.md`
- Verdict: **Approved for the specified local correction and verification only**

## Security boundary

The existing predicate rejects a legitimate provider administration baseline.
The correction must recognize that finite baseline without expanding the runtime
principal's authority or trusting arbitrary observed memberships/default grants.
The plan achieves this by requiring independently queried database/owner and
platform-superuser context, one exact creator-administration tuple and nine exact
platform default-ACL rows. Native/development/owned-test contexts keep the empty
contract. No partial/extra/malformed/duplicate set or generic administrator-row
exception is approved.

The context is source-defined: database `meal_planner`, actual database owner
`neondb_owner`, managed object owner `mp_migrator`, and actual `cloud_admin`
SUPERUSER state. The membership row itself cannot establish that context. Every
managed object's ownership and actual ACLs must still pass existing checks.

PostgreSQL17 documents an automatic creator grant with ADMIN enabled and SET/
INHERIT disabled. ADMIN still lets that creator grant additional memberships;
the false flags prevent accidental use, not deliberate administrative access.
The accepted row therefore represents the already-trusted bootstrap principal,
not a newly harmless untrusted member. See [PostgreSQL role attributes](https://www.postgresql.org/docs/17/role-attributes.html)
and the [membership catalog fields](https://www.postgresql.org/docs/17/catalog-pg-auth-members.html).

The nine platform defaults are owned/granted by `cloud_admin` in `public`, with
only the recorded grantee, object classes, privileges and grantability. Defaults
of a different creating role do not affect objects created by `mp_migrator`.
The plan nevertheless recognizes only this complete observed platform baseline,
not a wildcard for other creators. Managed-creator non-owner defaults remain
rejected. PostgreSQL explains current-role creation semantics in
[ALTER DEFAULT PRIVILEGES](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html).
Neon's [initial-superuser setting](https://github.com/neondatabase/neon/blob/main/docs/settings.md)
and [role documentation](https://github.com/neondatabase/website/blob/main/content/docs/manage/roles.md)
corroborate the provider principal names and administrator/restricted-role split.

## Required implementation proof

Pure strict TypeScript tests must call the same policy used by real catalog
validation. Cover native and exact hosted positives; missing/wrong context;
missing platform SUPERUSER; all outward runtime memberships; wrong member or
grantor; changed ADMIN/INHERIT/SET flags; duplicate or extra membership; default
row omission/addition/duplication and each changed namespace, creator, grantor,
grantee, object class, privilege or grantability. Include managed-creator grants
and native-context attempts to reuse the hosted rows. Privileged runtime flags,
actual grants and generic HTTP error coverage must remain unchanged.

No shared role mutation, elevated test role or production authentication bypass
is necessary to test this policy. Existing disposable-database security tests
continue proving the actual managed-object boundary. Fresh read-only hosted
validation must confirm the corrected full validator, not merely a standalone
pure-policy demonstration.

## Verdict and gates

No unresolved design security finding remains in the written finite proposal.
This approval does not approve implementation not yet written, grant/schema/data
changes, paid effects, or a deployment. Exact-source independent code/security
review, rebuilt packaging and honest isolated staging evidence precede the plan's
new explicit owner source/gap/merge/Production gates. An earlier release approval
or current audit SHA cannot substitute for those gates.
