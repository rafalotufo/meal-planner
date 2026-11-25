# Hosted permission correction — independent plan review

- Reviewer:reviewer; date:2026-11-24; independent of plan writer.
- Plan: `intent/dependency-aware-migrations/hosted-permission-correction.md` at `daaad23a5a10910e70832ad903a1870c604f14fc`.
- Verdict: **Approved for the precise local correction, verification and isolated staging preparation; Production remains gated**.

## Cause and finite trust contract

Fresh read-only checks correctly stopped release source `e4b8c954` before any
hosted changes. Its two broad predicates assume an empty local role/default-ACL
baseline. The recorded Neon state instead has the known creator-administration
membership and platform-owned default privileges. This is a source compatibility
blocker; packaging success cannot justify deploying the failing source.

The [PostgreSQL17 role-attribute documentation](https://www.postgresql.org/docs/17/role-attributes.html)
confirms that role creation by a non-superuser administrator creates an automatic
bootstrap-granted administrative membership. Its false SET/INHERIT options do
not contain an administrator able to grant membership again. The proposal
correctly relies on the existing trusted administrator boundary rather than
claiming those options prevent administrative access.

The exception is narrowly attributable: actual database `meal_planner`, owner
`neondb_owner`, managed owner `mp_migrator`, and actual SUPERUSER `cloud_admin`.
It requires the single recorded runtime creator tuple and the full exact nine
non-owner default rows, including namespace/type/creator/grantor/grantee/
privilege/grantability. Native/test contexts remain empty. Unknown, partial,
duplicate, additional, outward or differently scoped records remain rejected;
there is no hosted-empty fallback, role-name-only switch or caller/env bypass.

[PostgreSQL17 default-privilege rules](https://www.postgresql.org/docs/17/sql-alterdefaultprivileges.html)
distinguish the creating role's defaults from other roles' defaults. Nevertheless,
the chosen exact platform baseline deliberately preserves the stronger finite
unknown-metadata contract. Actual application/schema/object grants, unsafe role
flags, ownership, effective access and all existing catalog/security checks stay
strict. No role, default privilege, grant, schema, ledger or data mutation is
needed or authorized by this correction.

## Implementation proof and gates

The plan requires failing strict TypeScript policy regressions before the
exception, the same pure policy applied to actual catalog rows, negative tuple/
context/default-set cases, existing owned-database security/HTTP coverage and
fresh both-Neon read-only success. It forbids changing shared roles or elevating
mp_test to manufacture test memberships. Update the feature specification's
membership/default-ACL wording with this exact approved amendment; do not leave
a contradictory blanket rule or erase the original failure evidence.

New code requires a new independently reviewed source SHA, full applicable
checks, and regenerated exact upload inventory/build. Preserve the moderate
tooling audit finding as recorded. Staging uses the existing isolated keyless
lane, source/alias/configuration attribution and honest proof labels; no paid,
protection/domain or identity/business-data effect follows from this approval.

The original request to deploy main is not acceptance of the newly discovered
correction or absent staging evidence. After concrete staging results, the owner
must accept its exact source/Preview/profile/named gaps, approve the local main
fast-forward and authorize the distinct same-source Production candidate,
manual promotion and bounded anonymous observation/recovery. Recovery may use
only freshly verified compatible AeQV/d26 under that later explicit scope.
No previous release gate, e4 packaging pass or moving audit HEAD substitutes for
those decisions. This plan review permits no Production build or promotion.

## Approved provider-selection clarification

Clarification `6df9cc2` retains the existing generic empty-set policy without a
new database-name whitelist. After strict context-shape checking, actual database
owner neondb_owner OR actual cloud_admin SUPERUSER=true forces full exact Neon
context and both nonempty expected sets. Every single-field hosted-binding
mutation must reject even with empty sets. A generic database named meal_planner
with ordinary ownership and no provider indicator remains under the old empty
contract and all other existing checks. I independently approved this wording;
it prevents partial hosted bindings from selecting a permissive fallback.
