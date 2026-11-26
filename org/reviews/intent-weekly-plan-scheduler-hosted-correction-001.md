# PM scope acceptance — scheduler generated-Host correction

- Reviewer: product-manager
- Date: 2026-11-26
- Artifact: `intent/weekly-plan-scheduler/hosted-target-correction.md`
- Design source: `3a3767b`; independent security design review: `65e504f`
- Verdict: **Accepted within the existing intent for a new bounded correction cycle**

The concrete hosted evidence justifies continuing the owner's original request
to fix weekly scheduling, validate staging and prepare Production approval.
The first attempt registered cron against candidate Ed9c's generated hostname,
while source7fe1531 accepted only the fixed automatic alias. That mismatch would
reject genuine scheduler traffic421. Anonymous browser health did not prove the
machine service boundary. The recorded compatible rollback restored GL3g,
empty active cron definitions and canonical health; see committed
`3c2825e` and `intent/weekly-plan-scheduler/production-release-result.md`.

Accept the proposed narrow correction: the exact service route may admit its
validated, trusted server-side `VERCEL_URL` in addition to its existing fixed
service Host, under unchanged project/environment, independent Bearer and
configuration requirements. Incoming requests never gain suffix/wildcard trust;
another deployment, browser canonical Host or forwarding header cannot select
an allowed machine Host. Ordinary browser/menu/auth canonical rules remain
unchanged. Preserve the Wednesday Hobby timing choice, deadline/cleanup,
eligibility, synthetic exclusion, existing plans and schema/data contract.

Required proof now includes both stable and exact own-generated Preview
origins, real application responses distinguished from platform interception,
ordinary generated-origin browser/menu421, and fresh exact-source reviews and
staging evidence. Keep due-storage rollback proof, off-day HTTP behavior and
unobserved native delivery as separate proof classes.

This accepts technical correction scope, not a new Production permission.
The original one-attempt release authority was consumed. A corrected source,
new staging/profile evidence and gaps require owner acceptance and fresh
Production authorization before any new Production configuration/build,
promotion or activation. No paid feature, migration/grant, persistent fixture,
new user identity or broad authentication change is in scope.

No product ambiguity blocks this bounded corrective Design/Build cycle.
Independent design/plan and final code/security reviews remain real gates;
the prior completed loop and historical approvals must remain preserved.
