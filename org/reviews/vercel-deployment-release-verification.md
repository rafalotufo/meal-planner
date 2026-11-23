# Vercel deployment — configuration and release evidence

Date: 2026-11-23. **Not released. No deployment exists.**

## Human authority and merge

Rafael answered “yes” to merging the reviewed changes and creating/configuring
the free project under the runbook. Source: org/messages/ceo-0007.md.
Committed records: merge-vercel-deployment-human-001 (code_owner_approve) and
config-vercel-deployment-human-001 (project_configuration). No release record.

Main checkout was clean, and `git merge-base --is-ancestor main HEAD` passed.
The authorized fast-forward moved main from 5619f28 to 2157744. Reviewed runtime
code is unchanged from 55e9de7; later commits contain audit/approval documents.
No remote or PR exists. Human local merge gate is now satisfied.

## Actual Vercel setup

- Account/team: rafalotufos-projects, verified Hobby.
- Project: meal-planner, ID prj_ntxXnJAVA977jHjLNDR7xJuwSx4V.
- Assigned verified domain: meal-planner-delta-six-55.vercel.app.
- Origin: https://meal-planner-delta-six-55.vercel.app.
- Exact required Google callback:
  https://meal-planner-delta-six-55.vercel.app/api/auth/callback/google.
- Next.js preset, Node24.x, Fluid compute, root/output framework defaults,
  frozen pnpm install and pnpm build configured.
- autoAssignCustomDomains is false; no Git integration, targets or deployments.
- Default Standard Protection retained (all_except_custom_domains): candidate
  deployments protected; production-origin access still requires live validation.
- Production-only non-secret keys configured and inventory verified:
  BETTER_AUTH_URL, RECIPE_SEARCH_PROVIDER, OPENAI_RECIPE_MODEL and
  ENABLE_EXPERIMENTAL_COREPACK. No Preview/Development values created.
- One project-only WAF rule published: method POST AND exact path
  /api/recipes/search, fixed window20/60seconds per IP, exceeded action429.
  Publish preview had exactly one change; effects digest cbfb7f692c2b41a7.
  Live status shows Firewall Enabled, one active rule, no IP blocks, no paid
  OWASP/Bot/priority features. No team-wide settings or billing changed.

Used the existing pinned CLI/API for equivalent empty-project/configuration
operations instead of dashboard forms: project create starts no deployment,
and project API/environment stdin supports exact settings without UI copies.
This procedural substitution changes no approved architecture or settings.
The CLI link added an ignored local OIDC token; its value was never read or
exported. Redundant auto-added .gitignore lines were removed, preserving the
reviewed .env and .vercel exclusions and .env.example exception.

## Required owner actions and remaining gates

Automatic approval review rejected the attempted credential-copy command before
execution. Reason: project configuration approval did not explicitly identify
the particular local Google/OpenAI secrets and Vercel destination for sensitive
egress. No credential value was sent by that command. Explicit owner approval
is pending for Google client ID/secret from the authenticated-access worktree,
OpenAI key from this worktree and a new random auth secret to this project's
Production-only settings. No secret values appear in this record.

Rafael confirmed “Added callback to OAuth client” on 2026-11-23, following the
exact URI above. This is owner-confirmed configuration, not an independent
console inspection or successful live Google consent round trip. The owner
completed this externally; task-browser Google sign-in is no longer needed.

Existing OpenAI billing/limits remain unchanged; effective account limits
must be verified by the owner/read-only account access before release.
Production credentials, actual hosted Node/
duration/cancellation settings, real OAuth/provider/source/browser acceptance
and natural hosted deadline evidence remain incomplete. Application protection
and transport code have not been weakened to bypass those checks.

Deployment requires a separate committed human release authorization for the
actual project/source SHA, staging, promotion, bounded first-live checks and
recovery. No production staging, promotion, live search, WAF burst or hosted
acceptance check has run. Source/API/firewall metadata is setup evidence only.
