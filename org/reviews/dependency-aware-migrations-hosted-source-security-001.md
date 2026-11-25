# Hosted permission correction — independent source security review

- Reviewer: security-researcher; 2026-11-24
- Reviewed exact source: `58534f5`
- Approved design: `daaad23`, clarified by `6df9cc2`; security design review `a630fa8`
- Verdict: **Source correction approved; no unresolved security finding**

## Source assessment

`lib/db/security.ts` obtains database identity/owner, actual platform SUPERUSER
state, runtime memberships and non-owner default ACLs from catalog queries in
the existing validation transaction. It constructs the typed context itself;
no request input, environment switch or database approval record is accepted.
The same `validatePlatformPermissions` function exercised by the pure tests is
called by this real catalog-backed path.

`lib/db/platform-permissions.ts` validates exact record shapes, scalar types
and array types before selecting a policy. Actual `neondb_owner` database
ownership or actual `cloud_admin` SUPERUSER presence requires the complete
source-bound hosted context. Missing or partial bindings cannot fall through to
an empty native policy. Ordinary/native contexts retain their previous empty
membership/non-owner-default contract without a global database-name whitelist.

The hosted branch requires exactly one creator-administration membership and
nine unique default privilege keys with exact owner, grantor, schema, grantee,
object class, privilege and grantability. Extra, duplicated, partial, malformed
or changed sets are rejected with the fixed permission diagnostic. All outward
runtime membership and managed-creator non-owner defaults remain prohibited.

This recognizes already-trusted provider administration; it does not treat ADMIN
as harmless because SET/INHERIT are false. Runtime privileged-role flags remain
independently rejected. Existing actual table/column/schema ACLs, required
effective access, ownership, ledgers, schema objects, constraints, indexes,
functions/triggers/rules/RLS, TLS and read-only validation are unchanged. No grant,
role mutation, SQL migration, ledger write or credential change is introduced.

The policy deliberately rejects future platform baseline drift rather than
ignoring other roles' defaults. Source review and a new exact baseline would be
needed for another legitimate provider configuration. The trusted administrator
boundary and PostgreSQL creator/default semantics are documented with primary
sources in the independent security design review.

## Independent executed evidence

Against the exact candidate:

- `node --import tsx --test tests/migrations/platform-permissions.test.ts`:
  **26 passed,0 failed**, exit0.
- Additional independent pure-policy probes: **87 changed-field, omitted-row,
  duplicate-row and changed-membership candidates rejected** with sanitized
  permission reasons; reordered exact baseline accepted. Every default row and
  every field was exercised. The helper bytes are unchanged in the frozen source.
- Existing owned-database integration regressions selected for PUBLIC grants,
  grant options, managed default grants, older compatible runtime operations,
  database CREATE and collation drift: **5 passed,0 failed**, exit0. These invoke
  the real validator; all owned fixtures cleaned up without elevated roles.

The developer separately records62migration regressions passing; that is not
misrepresented here as my independent complete-suite run. I made no hosted call,
changed no shared cluster role, and used no elevated or fake-user fixture.

## Remaining release proof and authority

This is a code/security verdict, not a claim that hosted revalidation, refreshed
packaging, broad checks or staging has completed. Those results must be recorded
by the orchestrator against this exact source; positive pure tests cannot replace
the full read-only validator on recorded hosted targets. Changed source requires
fresh packaging/staging and the new owner source/gap/merge/Production decisions
specified in `hosted-permission-correction.md`. Earlier release approvals and
older audit HEADs do not authorize this candidate's Production deployment.
