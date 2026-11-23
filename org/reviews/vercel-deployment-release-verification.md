# Vercel deployment — configuration and release evidence

Date: 2026-11-23. **Production-target candidate staged; not promoted.**

## Human authority and merge

Rafael answered “yes” to merging the reviewed changes and creating/configuring
the free project under the runbook. Source: org/messages/ceo-0007.md.
Committed records: merge-vercel-deployment-human-001 (code_owner_approve) and
config-vercel-deployment-human-001 (project_configuration). Release was still
unapproved during setup; the later authorization/staging evidence is below.

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
egress. No credential value was sent by that command. The owner subsequently
entered credentials directly in Vercel; agent credential transfer is no longer
requested. No secret values appear in this record.

Metadata-only verification after “Credentials saved to vercel environment”:
GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET exist as sensitive Production-only
variables. OPEN_API_KEY also exists as sensitive Production-only, but the app
expects OPENAI_API_KEY, which is absent. BETTER_AUTH_SECRET is absent. The owner
must add those two exact required names before release. The other four approved
non-secret keys remain Production-only. No values were read or displayed.
Project metadata still shows no deployments and automatic assignment disabled.

After Rafael's “Done” confirmation, a second metadata-only check verified all
eight required keys present and Production-only. BETTER_AUTH_SECRET,
GOOGLE_CLIENT_SECRET and OPENAI_API_KEY are sensitive; GOOGLE_CLIENT_ID is also
sensitive. OPEN_API_KEY is no longer in the inventory. No values were read;
secret validity/length and successful OAuth/provider calls remain runtime checks.
Configuration step 5 is complete at the metadata level. No deployment exists.

Rafael confirmed “Added callback to OAuth client” on 2026-11-23, following the
exact URI above. This is owner-confirmed configuration, not an independent
console inspection or successful live Google consent round trip. The owner
completed this externally; task-browser Google sign-in is no longer needed.

Existing OpenAI billing/limits remain unchanged; effective account limits
must be verified by the owner/read-only account access before release.
Actual hosted Node/duration/cancellation settings, real OAuth/provider/source/browser acceptance
and natural hosted deadline evidence remain incomplete. Application protection
and transport code have not been weakened to bypass those checks.

Deployment requires a separate committed human release authorization for the
actual project/source SHA, staging, promotion, bounded first-live checks and
recovery. This setup snapshot predates staging; later staging evidence below
supersedes it. No promotion, live search, WAF burst or hosted acceptance has run.

## Authorized staging — 2026-11-23

Rafael approved production release of d682c1b, including staging/promotion,
up to two live searches, a 15-minute first-live window and pause on failed or
incomplete required checks. Source: org/messages/ceo-0008.md. Committed ledger:
release-vercel-deployment-human-001, expires 2026-11-23T19:00:00Z. Gate hook and
ledger verification both allowed this staging. The authorization record was
committed in aa80d19; main includes it.

Exported exactly approved source d682c1b83b9625adee539d9a81d69f1f6700e2ec from
Git: 50 tracked files under .vercelignore exclusions. No .env*, Git/operator
state, build outputs, org/intent/test/script folders were sent. Non-runtime
root workflow documentation and gates/evals files remain in the reviewed
source payload; previous shorthand “no audit files” referred to org/intent
exclusions and must not be read as a complete workflow-file exclusion.
Production secret values stayed in Vercel; none were pulled or printed.

Pinned CLI66.6.0 staged with --prod --skip-domain in the approved Hobby project:

- Deployment ID: dpl_GP3AMEcqCP7A3NGemnEc1hYZQWHB.
- Candidate URL: https://meal-planner-1igkzsbnl-rafalotufos-projects.vercel.app.
- Status READY, target production; productionUrl null, aliases empty.
- Metadata sourceCommit matches the exact approved SHA above.
- Hosted build compiled/completed; extracted pnpm version10.33.0.
- Deployment/project metadata reports Node24.x. Exact hosted Node patch has
  not been established; a dependency version in logs is not runtime evidence.
- functions[app/api/recipes/search/route.ts].supportsCancellation is true.
- After Vercel CLI access propagated, candidate /, /sign-in and /api/session
  returned421 with private,no-store. An initial302 was Vercel's access gate,
  not application success/failure. No Host spoofing or redirects followed.
- The pinned Next.js polyfill path /_next/static/chunks/polyfills-42372ed130431b0a.js
  also returned421/no-store. Path came from the equivalent local build; actual
  hosted asset existence must be confirmed by200 at the stable origin later.

Public API/build-output summaries did not expose the generated function's
effective maximum duration. Task browser requires Vercel sign-in; Rafael chose
to verify the settings himself. Confirmation of Node24.x /90seconds is pending
before promotion. No first-live window has started, live model calls used:0/2.
The required hosted OAuth/provider/source/deadline/UI checks have not run.
