# Recipe URL menu — local implementation handoff

Date: 2026-11-24

Reviewed implementation source: `7a7668dc16d877164ae3798b0b0382fd746d3cc8`.
Later process/audit HEAD is distinct; no merge or release source is authorized.

Implemented immediate durable URL saves, one bounded best-effort post-response
curation attempt, honest status and explicit Retry, same-entry metadata updates,
strict source/metadata validation and stale/removal fencing. Supported static
Recipe JSON-LD and final HTTPS links remain the approved compatibility scope.
No unattended queue/recovery service or paid provider is introduced.

Final proof is in `verification.md`:

- Lint, strict typecheck and production build pass.
- Menu65, deployment32, recipe/photo82, family34, authentication16 tests pass.
- Python workflow7 pass; root final rerun passed in1.579s.
- Real Chrome new curation, existing menu and authentication flows pass at their
  recorded widths. Final strict-state correction also passes a rebuilt genuine
  save-to-ready Chrome smoke. Poll cap coverage and intentional failure injection
  are explicitly scoped; no successful API response is fabricated.
- Independent security clear: `org/reviews/security-recipe-url-menu-002.md`.
- Independent final code approval: `org/reviews/code-recipe-url-menu-002.md`.
  One P2 coercion defect was reproduced, fixed and independently re-tested against
  both old and corrected validators; no tests or checks were weakened.
- Full source diff manifest passes. The feature-specific plan approval record
  `recipe-url-menu-plan-2026-11-24` was separately verified as committed, in
  addition to the generic plan-sync tool's gate-record output.
- Loop/message/memory/workflow checks have zero violations; diff/secret checks
  are required on the final staged audit commit as on each implementation slice.

The user-authorized bounded Build cycle solved at turn8, retaining max8 and
max2 review rounds. Final review required an independent security consultation
for the narrowly corrected source, preserving security/code review without
extending the turn budget. Earlier source reviews remain historical.

The graph leaves implementation at human code-owner review; no merge approval
was invented. Source-specific staging acceptance, development/hosted migration,
hosted grants/configuration, push, deployment and release remain separate scopes.
Only owned random local test databases were migrated, exercised and cleaned;
owned test servers/profiles were stopped. Existing photo transport/parser, Proxy,
auth policy and dependency versions remain unchanged. Historical browser images
were restored byte-for-byte; new feature images use separate filenames.

The migration is included, reviewed and tested, but has not been applied to
development or hosted databases. After any separately authorized migration,
older catalog artifacts are incompatible rollback targets; preserve data and
follow a reviewed compatible correction and staging-first release procedure.
