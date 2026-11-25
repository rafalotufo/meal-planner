# Corrected migration runtime — actual staging result

- Date:2026-11-25; operator:orchestrator; owner acceptance: **pending**.
- Fixed releaseSourceSha: `25aaa9b0d8b948bc6f24710214c9eaefe0ee8dcb`.
- Preview: `dpl_3XbAs9EpUCmiu4QU6D1oX6He4fcH`, READY.
- Stable origin: https://meal-planner-staging-rafalotufos.vercel.app
- Generated origin: https://meal-planner-387imkotd-rafalotufos-projects.vercel.app
- Project:`prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`;
  team:`team_2c0O29FMb91g7L6sUChc9v6J`; target:Preview.
- Configuration profile: `dependency-aware-keyless-20261125-v1`.

## Approved main merge and exact source

Owner's active-chat “yes” approved the concrete new-fix main merge and isolated
staging request, recorded in ceo-0068 and committed gate8bcbf00
`dependency-hosted-correction-main-20261125`. Clean local main fast-forwarded
from e4b8c954 to8bcbf00. Fixed25 is an ancestor of main; application, library,
SQL/metadata, assets, dependency pins and deployment settings match it exactly.
Later audit commits are not replacement release sources. No Git push occurred.

The generic workflow updater could not edit the graph's inline node syntax;
implementation status was updated directly only after verifying the committed
human gate and actual merge. No generic tool or approval check was weakened.

The private clean Git export's126 files/738556 bytes were rechecked against the
reviewed SHA256 upload inventory before deployment. Exact scripts-disabled
CLI66.6.0 deployed those bytes, with source25 and truthful main-ref metadata,
to Preview only; no build/runtime environment override or Production flag.
API inspection confirms actual project/owner/source/READY/Node24.x/iad1 and
the Preview classification is independently reported by CLI inspect. API's
target field is null for this Preview; this is not inferred from URL shape.

Local evidence155d00a, independent source/readiness54f7481 and security6c70e99
remain applicable:328 Node tests,7 Python tests, lint/typecheck/build, both
Chrome suites and clean upload-only install/build. Audit retains one reviewed
moderate tooling advisory, zero high/critical; its deferral is due for review by2026-12-01.

## Actual attribution and checks

Read-only inspection before effects at13:44:42.307Z confirmed the existing
Hobby/unpaused/manual project, main-qualified staging domain and old EHXQ alias,
with Production AeQV/d26. The Preview deployment became READY. It did not
automatically move the stable alias; only that staging alias was explicitly
assigned to the inspected new Preview. All three Production aliases stayed
AeQV. Browser observations before this assignment are excluded from candidate
certification. The browser was reloaded and checks repeated after assignment.

Fresh pre13:48:10.094Z and post13:49:20.880Z inspections bind the stable alias
to3XbA/25 with unchanged complete Production assignments, domain classifications
and environment metadata digest
`90ad795dfc14c4915b4f9a2ae8b67d624194b6fbc79fd5db5bb0ef76bebee59e`.
The cooperative owned lane lock covered deploy, alias work and validation.

| Proof class | Actual result |
| --- | --- |
| Operator non-secret configuration | Preview13:45:00.462Z and Production13:45:03.824Z privately verified canonical origins, provider, Corepack and model/default; Preview key absent, Production existing key retained |
| Strict restricted-role hosted read-only validation | Preview13:44:50.378Z and Production13:44:53.984Z passed; each5 legacy rows/no native ledger, unchanged history/catalog digest86c04604798d247bef5abb4d11310f12f8239d86afdf242e2a245d86fb9ee740 |
| Anonymous staging HTTP helper |13:48:28.387Z–13:48:28.599Z; first home request302 platform redirect; pass=null, REQUEST_UNAVAILABLE, exit2; remaining HTTP assertions not executed |
| Post-alias real in-app browser | Stable sign-in reached;390/1440 widths match document widths with no horizontal overflow; readable heading/nav/Google button; keyboard reaches Google button with visible focus; zero captured warning/error logs |
| Final helper |13:49:39.238Z; OWNER_EVIDENCE_REQUIRED, pass=null, exit2; false real-Google/session/logout attestations retained |
| Existing Production anonymous smoke | Exit0, status401/pass=true,2358ms; unchanged AeQV/d26 health only |

The browser used its existing platform access; no protection bypass token was
created, read or injected, and no protection setting changed. It remained
anonymous to the application. Screenshots were emitted in the active chat;
no screenshot file or authenticated/member browser result is claimed here.
The browser viewport override was reset afterward.

Sanitized actual receipts are under `staging-evidence-20261125/`. They are
operator-attested projections; source metadata alone is not cryptographic upload
proof. The separate fixed-export hash inventory and local build provide that
source provenance. No raw API body, env value, personal identity or cookie is
included. Private API/build receipts remain ignored locally.

## Named gaps and residual risk

The helper did not pass: protection prevented its anonymous app assertions.
Browser access proves sign-in rendering and keyboard/layout behavior only.
No new real allowed/denied Google round trip, fresh sign-in/logout, current
authenticated session/household/menu/plan path or deployed authenticated database
operation was established. Direct hosted read-only catalog validation and local
fixture regressions are separate evidence, not substitutes for those paths.
No staging provisioning, invitation or verified-email write occurred.

Preview is keyless: real provider/recipe/photo success, hosted cancellation and
WAF/bot/rate-limit enforcement remain unverified. No missing-key member search
was attempted. No paid request, copied Production secret, fake identity, forced
attestation or automatic retry was used. Google consent/client callback state
was not freshly inspected at Google; unchanged Vercel configuration metadata
does not prove OAuth success. Current Production health also does not prove
real OAuth, provider availability or authenticated database behavior.

No migration, grant, column-option/catalog alteration, ledger or business-data
mutation, Production build, promotion, domain configuration change or project
pause/resume occurred. Production remains
`dpl_AeQVDaT7ZCC99oLfjunTyiD1vA3a`, source
`d26ea59742f904f399128477bfeb369a0049ba62`.

## Concrete pending Production decision

Owner acceptance must name this exact25/3XbA/profile and explicitly accept the
gaps above, or request additional authorized staging coverage. Under
`intent/staging-first-release/spec.md`, no old acceptance covers this source.
The proposed combined approval would authorize, for this existing project only:

1. Accept the actual staging result and named gaps for25/3XbA/profilev1.
2. After fresh unchanged source/configuration/schema/alias inspection, build
   a distinct Production candidate from the same clean fixed25 export using
   `deploy --prod --skip-domain`, inspect READY and manually promote that exact
   Production candidate. Preserve existing credentials, domain classification,
   Node/runtime/build/provider settings and every database object/record.
3. Run minimal canonical anonymous health at https://lotufo-meals.vercel.app and
   a bounded15-minute sampled health/runtime-error observation. No real
   Production login, paid request or full live functional exercise is included.
4. On required health failure, restore only the current known-good Production
   AeQV/d26 if fresh schema/configuration/readiness checks still establish its
   safety; verify restored traffic. No older two-migration artifact, database
   rollback/reset/restore or shared-project pause is authorized by this scope.

Proposed authority expires two hours after the actual recorded owner decision;
commit a fresh exact-source release ledger record before Production commands.
Changed source, alias, schema or relevant configuration invalidates this evidence
and requires revalidation. No new billing/plan, key, WAF/protection/OAuth change,
Git push or database effect is included. This paragraph is a proposal, not an
approval or permission inferred from the earlier main/staging “yes”.
