# Hosted permission correction — red evidence

2026-11-24, before behavior changes to fixed sourcee4b8c954.
Root's bounded read-only checks of both recorded hosted databases rejected the
existing platform creator-membership/default-ACL baseline as permission-failure.
The exact sanitized diagnosis and required finite correction are in
`hosted-permission-correction.md`; no grants, roles, schemas or data were changed.

The developer wrote strict TypeScript positive/negative policy tests first in
`tests/migrations/platform-permissions.test.ts`. Initial command
`node --import tsx --test tests/migrations/platform-permissions.test.ts` exited1:
MODULE_NOT_FOUND for the proposed shared production policy module, which does
not yet exist. This API-absence red proof supplements the actual both-hosted
validator failure; it is not mislabeled as an executed hosted policy pass or
an isolated SQL-predicate reproduction. Private command output is retained in
`.data/dependency-hosted-policy-red.log`.

Cases cover exact legitimate hosted baseline, preexisting empty normal contexts,
missing/duplicate/extra sets, wrong actual context and SUPERUSER binding,
outward/extra/changed creator membership, default owner/grantor/schema/type/
grantee/privilege/grant-option drift, managed-creator defaults, malformed fields,
unknown fields and malformed arrays. Independent design review is required
before changing runtime behavior. No production fixture/context injection or
shared role mutation is added by these pure tests.
