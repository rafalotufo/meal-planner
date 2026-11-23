# Vercel deployment — configuration and release evidence

Date: 2026-11-23. **Deployed/promoted, verified working, then owner-paused.**

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
to verify the settings himself. Rafael subsequently confirmed Node24.x /
90seconds for the generated search function. This is owner-attested dashboard
evidence; cancellation remains independently confirmed by API.

## Authorized promotion and first-live window

Promoted the same Production artifact dpl_GP3AMEcqCP7A3NGemnEc1hYZQWHB without
rebuild on2026-11-23 at18:10:15UTC. Live origin:
https://meal-planner-delta-six-55.vercel.app. Required verification window ends
18:25:15UTC (13:25:15 America/Toronto). Failed or incomplete mandatory checks
require scoped pause. Model-search budget remains at most two, including one
normal search and one disconnect probe. No extra searches or billing changes.

### Deadline-evidence correction — approved by Rafael

The approved checklist combines three mutually exclusive search outcomes:
successful recipe results, a client disconnect after two seconds with prompt
server cancellation, and a naturally observed sixty-second hosted timeout.
The authorized budget permits only two searches: one normal and one disconnect.
One successful completed request cannot also time out; a promptly cancelled
request cannot run for sixty seconds. The current checklist therefore cannot
fully pass within its own request budget.

Proposed explicit amendment to spec D3a and the plan/runbook's natural-timeout
release blocker: use the deterministic local deadline/abort regressions plus
the owner-confirmed hosted90-second configuration as deadline evidence, retain
the live disconnect/cancellation probe and single successful search, and label
an unobserved real hosted504 as unverified without blocking release solely for
its absence. All other mandatory checks and failure/pause policy remain. No
automated assertion is skipped/removed, no production timeout changes and no
extra paid query is added. Rafael explicitly approved this correction after
the explanation. Source: org/messages/ceo-0009.md. Spec/plan/runbook updated
consistently; separate spec/plan approval records preserve the amendment.
All other mandatory checks and the15-minute pause policy remain unchanged.

Independent proposal review: the code reviewer confirmed the contradiction and
returned READY FOR HUMAN REVIEW — proposal only. Local deadline/abort tests
establish application behavior; owner-attested Vercel settings establish the
configured90-second ceiling. Neither proves hosted60-second504 behavior, which
would remain an explicitly accepted, unverified release risk. Local evidence:
tests/recipe-search.test.ts deadline abort/504/slot cleanup and caller abort.

### Live anonymous and WAF evidence

The static polyfill asset returns200 and application/javascript at the stable
origin, confirming actual hosted existence of the path checked on the candidate.
Root307 uses relative Location:/sign-in, resolving to the exact approved origin
and path, with private,no-store. Initial anonymous helper failed only because
its comparison incorrectly required an absolute Location string.

Local-only helper correction4197f6e resolves Location against the validated
origin before exact URL equality. A new regression failed false!=true before
the correction, then all12 helper tests passed. Foreign/protocol-relative
foreign/path/query destinations remain rejected; redirects are not followed.
Lint/typecheck passed. Independent code/security delta reviews both returned
READY FOR HUMAN REVIEW, zero findings. The deployed app artifact is unchanged.
The corrected anonymous live helper passed all four checks: root307,
sign-in200, protected session/search401, all no-store.

One authorized WAF probe sent21 sequential anonymous empty-JSON POSTs in2325ms:
twenty401 then429, helper pass. Filtered Vercel firewall events for the exact
host/path/rule show one rate-limit event under rule_recipe_search_ip_limit_7NJiND,
correlating the429 to WAF. No client IPs or sensitive runtime content printed.
This probe and anonymous checks invoked no provider search. Live calls used0/2.

### Authenticated live verification and recovery

Rafael reported the app working in his browser and confirmed Google login,
then instructed continuation. The task browser independently reached the
protected home page after real Google sign-in; no test-process provider,
fake-user bypass, token extraction or credential printing was used.

Agent search1: fixed nonpersonal query “potato gnocchi”. Observed disabled
Searching button/status, then five real recipe cards with source-specific
summaries/times and HTTPS source links. Three visible publisher photos loaded
at1250x833,1280x720 and1248x832. Two below-fold lazy images were not loaded at
measurement; do not characterize them as broken or claim every photo was
verified. All five cards remained usable. Owner's earlier independent test is
separate from the two agent-initiated calls.

Saved CUA screenshots as JPEG (native tool format) under vercel-deployment-390.jpg
and -1440.jpg. Browser's actual CSS/screenshot widths were354 and1309 despite
requested390/1440; both had no horizontal overflow. Record actual geometry,
not a false exact-width claim. Image loading and cards were inspected at both
mobile/desktop layouts. Additional error-state screenshot is preserved as
vercel-deployment-error-mobile.jpg; no personal account data appears.

Agent search2: same query, then browser navigation after the bounded disconnect
probe (two-second explicit wait plus UI/tool overhead). Navigation cancelled
the active client request. Vercel CDN logs show POST/search200 at18:20:35.097UTC
and499 at18:23:35UTC. The499 confirms client disconnect; the API confirms
supportsCancellation, and local tests confirm propagation. No independent
function execution-duration measurement was available, so prompt server-side
termination remains unverified. No session cookie was extracted to run the
stdin helper; browser navigation was used instead. Two agent-initiated live
searches used, no retries or extra paid probes.

Real sign-out completed and returned the browser to /sign-in. A second already-
loaded form submitted after logout displayed the generic error and restored
controls; authorization failure prevents a model call. This is a real logout/
authorization error-state check, not a fabricated provider error or offline test.
Public sign-in headers verified no-store, nonce CSP, HSTS, no-referrer, nosniff
and DENY framing. Exact normal OAuth-start request returned200, the configured
Google callback matched, and state-cookie security booleans were Secure,
HttpOnly, SameSite=Lax and host-only. No cookie values were read/logged. A
noncanonical absolute-callback payload was correctly rejected400 by existing
strict auth policy; it was not an application failure.

Remaining release-blocking verification at the window's end includes a real
Google identity outside the allowlist and independent cancellation execution
timing. The owner pause question highlighted those two gaps; it was not a
complete acceptance checklist. Exact390/1440 CSS-width checks, hosted keyboard
checks, the planned offline-submit error check and broken-photo fallback were
not independently exercised. Results screenshots were354/1309; the real logout
error check is useful additional evidence, not a substitute claimed as an
offline check. Publisher images loading also does not independently prove every
native metadata-transport branch. These remaining checks retain their approved
requirements. The unobserved hosted60s/504 alone is separately accepted as
nonblocking under ceo-0009; it is not a newly claimed pass.

At18:25:16UTC the agent attempted the approved scoped pause. Vercel refused
noninteractive confirmation and required a person to type the project name.
No API workaround or automated confirmation was used. Rafael chose “I’ll pause
it in my terminal”; source org/messages/ceo-0010.md. Subsequent project metadata
reported paused:true for meal-planner, and the live browser returned503 with
DEPLOYMENT_PAUSED. The owner completed recovery; no other project or key changed.

Final state: deployment dpl_GP3AMEcqCP7A3NGemnEc1hYZQWHB is retained, Production
domain assigned, traffic paused, live acceptance incomplete. Resume requires
explicit owner authorization and completion or explicit acceptance of remaining
gaps. No further model call, billing change or automatic resume is authorized.

### Subsequent authorized verification

The state above describes the first window. Rafael subsequently authorized a
bounded second verification run in ceo-0011. See
org/reviews/vercel-deployment-remaining-verification.md for the independent
cancellation timing, exact-width/keyboard results, three owner-attested checks,
one additional live search and independently verified pause at18:48UTC.
The earlier listed browser/cancellation evidence gaps are resolved; hosted60s/
504 remains unobserved under the approved nonblocking amendment. Final review
also identified that the existing OpenAI controls inventory required above is
still pending owner verification. The deployment remains paused pending that
inventory and final production-resume authorization.
