---
artifact: intent/vercel-candidate-validation/spec.md
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: approved
round: 1
---

# Security assessment — isolated staging design

## Verdict

Approved for the Design handoff, with no blocking security findings. This is
not implementation verification or authorization to configure Google/Vercel,
deploy, provision a household, enable a bypass secret, or change Production.
The actual staging hostname, safe alias classification and private operational
values remain required setup preflights, not facts established by this review.

## Threat model and evidence

Assets are Production data/availability, OAuth credentials, staging session and
platform-bypass credentials, and the integrity of validation evidence. Trust
boundaries are operator/control-plane metadata to the helper; helper to hosted
HTTP; browser to Google and callback; and Preview configuration to PostgreSQL.

| Threat | Required control and evidence |
| --- | --- |
| Wrong deployment or origin receives credentials | Spec lines125–143 reject wrong project/target/origin/source before private input or requests, constrain HTTP to the staging origin, forbid redirects, and keep credentials out of arguments/reports. Account ownership and alias classification are preconditions, not inferred from a hostname. |
| Staging alters Production routing or data | Spec lines28–46 and81–104 restrict recorded Preview resources, exclude Production, require complete domain/alias enumeration and unchanged Production assignments, and explicitly stop if free alias behavior is unsafe or unknown. |
| Platform access is confused with app identity | Spec lines172–178 treats the bypass secret as project-wide platform authority, confines injection to exact staging-origin requests, and disclaims WAF/bot/rate-limit evidence. It does not bypass Google, admission or family checks. |
| Reused sessions or moving aliases create false validation claims | Spec lines97–104,113–123 and166–170 bind evidence to source/deployment/run metadata, require pre/post snapshots and cooperative serialization, and distinguish owner-attested OAuth from session reuse. Snapshot limitations are stated honestly. |
| Provisioning or recovery destroys unrelated data | Spec lines180–197 requires separate identity/callback/provisioning authority, retains a named owner-controlled staging household, forbids automatic deletion/reset, and excludes shared-project pause/resume or Production rollback. |
| Unbounded requests, disclosure or paid usage | Spec lines125–144 bounds input, response size and deadlines and allows only sanitized fixed-code reporting. Lines54–55 and158–161 keep the paid provider key absent and do not claim live recipe/provider proof. |

Existing controls remain intact: `lib/auth.ts:33–35` owns the single origin;
lines45–54 verify Google identity/admission and identify the callback's possible
verified-email write; lines59–65 define one-hour nonrefreshing secure sessions.
`proxy.ts:12–14` rejects other hosts, and `lib/http.ts:6` enforces effect origin.
`lib/session.ts:14–27` rechecks admission and family context. The design adds no
synthetic identity endpoint, cookie-domain sharing, wildcard trust or provider
transport interception to hosted application code.

## Three review passes and verification limits

- Bugs: required session/family responses match the existing route contracts;
  missing-key behavior matches `lib/recipes/search.ts:90–94`. Unknown platform
  or deployment evidence is inconclusive, not a passing application assertion.
- Security: no new authentication mechanism or broader origin trust is proposed.
  Private session input and platform tokens remain separate, ephemeral inputs.
- Compliance: the design implements the accepted isolated staging choice and
  preserves separate Production builds, existing candidate checks and human
  release gates. No plan or implementation is claimed at this stage.

Read the accepted intent, historical options, active loop, org protocol,
REVIEW.md, current auth/session/proxy/routes/helper, deployment runbook and
recorded hosted targets. Applied the security-and-hardening threat-model and
review controls; its referenced standalone `security-checklist.md` is absent
from the installed skill roots, so no completion claim is made for that file.
`git diff --check` passed. No live account, Google login, hosted HTTP, database
or application-build check was performed for this document-only assessment.

Official sources checked 2026-11-24:

- [Vercel aliases](https://vercel.com/docs/cli/alias): manual aliases, default
  Production-domain assignment behavior, ownership conflicts and pagination.
- [Vercel automation bypass](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation):
  project-wide credential reach and platform controls skipped by bypassed access.

These sources support the stated controls; they do not verify this account's
free-alias availability, pinned CLI output or effective Preview configuration.
