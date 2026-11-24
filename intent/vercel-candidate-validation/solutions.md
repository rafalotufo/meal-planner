# Options for authenticated Vercel candidate validation

- Author: product-manager
- Date: 2026-11-24
- Status: Research for discussion; no configuration or implementation approved

## Selected approach — 2026-11-24

Rafael approved isolated staging (`org/messages/ceo-0028.md`): use the existing
Vercel project's Preview environment, a manually controlled stable staging
alias, independent staging auth secret and Google OAuth client/callback, and the
recorded Preview database. Keep distinct Production builds and smoke checks.
This resolves the product choice and permits Design; it does not authorize
external configuration, production changes, deployment or paid calls. The
comparison below is preserved as research history. Staging evidence does not
prove that the exact Production artifact was validated before promotion.

## What is blocking us

There are three independent layers. Vercel Deployment Protection may intercept
a generated URL before the application. The application then rejects every
noncanonical Host. Only after those layers does Google callback validation
matter. Registering another Google callback alone cannot make this app usable
on another host. The owner's reported OAuth issue is credible, but this intake
did not capture a fresh failing `redirect_uri` or inspect live Google settings.

Repository evidence:

- `proxy.ts:9–14` loads one configured origin and rejects another Host with 421
  before checking public routes. `lib/auth.ts:15–24,33–35` validates one origin,
  using it for Better Auth baseURL and trustedOrigins.
- `app/api/auth/[...all]/route.ts:14,19,43,50–52` exposes only social sign-in,
  Google callback and logout; enforces exact Origin; writes absolute canonical
  callbacks; and clamps callback redirects to canonical `/onboarding`.
- `lib/http.ts:6` independently requires that same exact Origin for effects.
  `lib/auth.ts:59–65` uses cookie-backed OAuth state and one-hour stateless
  sessions without refresh. Host-only cookies cannot bridge origins.
- `intent/vercel-deployment/deployment-runbook.md:125–164` stages a Production
  build, expects candidate 421, promotes that same artifact, then tests Google.
  Its current prohibition on production app cookies for candidate checks must
  remain until an approved design deliberately replaces that workflow.
- `intent/vercel-deployment/spec.md:90–95` explicitly deferred authenticated
  staging with its own stable origin/secrets/callback. Separate hosted database
  targets now exist in `intent/postgresql-persistence/hosted-resources.json`;
  this does not imply auth configuration is ready or authorize their mutation.
- `package.json:25` pins Better Auth 1.7.27. No `plugins` configuration appears
  in `lib/auth.ts`; OAuth Proxy is not enabled. Dependencies are absent in this
  checkout during intake; pinned plugin implementation was not inspected.

Google's server-side authorization flow requires an exact registered
`redirect_uri`; its client-management rules reject wildcard redirects. The
JavaScript-origin setting is a separate setting, relevant when using Google's
browser SDK. This app uses Better Auth's server redirect flow, so the first
OAuth diagnostic is the emitted callback URI, rather than assuming that adding
an Authorized JavaScript Origin resolves it. Sources: [Google web-server
OAuth](https://developers.google.com/identity/protocols/oauth2/web-server) and
[Google OAuth client settings](https://support.google.com/cloud/answer/15549257?hl=en).

## Options and proof limits

| Approach | Benefit | Cost and limits | Fit |
| --- | --- | --- | --- |
| Stable isolated staging origin | Register once; preserve the app's single-origin contract; exercise Google and authenticated pages against separate data and secrets | Staging and Production builds/configuration differ; staging success cannot certify the exact Production artifact. Requires an approved stable domain/project or Preview routing/configuration setup | Smallest authentication change; recommended if isolated pre-release confidence is sufficient |
| Stable validation alias on the exact Production candidate | One registered callback, reusable automation URL, and the same deployment ID can later be promoted | Current single-origin assumptions must change deliberately across proxy, Better Auth, route callback handling and all effects. A Production-target candidate has Production database/secrets, so this is not isolated staging | Preferred direction if exact-artifact authenticated pre-promotion proof is a hard requirement |
| Better Auth OAuth Proxy through a fixed callback server | Avoid registering every ephemeral Preview callback; potentially keep Preview databases separate | Additional trusted callback server, shared authentication authority and endpoint/redirect-policy changes. Current wrappers do not support it by adding a plugin alone; pinned-version compatibility requires investigation | Useful for many trusted previews, disproportionate for one validation lane |
| Register every generated deployment callback | Direct callback can name a particular immutable deployment | Registration churn/propagation, cleanup, runtime baseURL/Host changes and Google client management. A deployment URL is known only after staging; another build may change it again | Poor automation default |
| Promote, run checks, recover if necessary | Keeps today's exact-origin and artifact model; simplest immediate mechanics | Authenticated failures still reach Production and recovery may be needed; does not meet pre-promotion authentication goal | Baseline/temporary fallback |

Vercel documents assigning aliases to deployments. An alias is routing, not an
environment-variable update: attaching a stable QA host to today's candidate
will still encounter 421. A QA-only `BETTER_AUTH_URL` also does not solve exact
artifact promotion: that immutable candidate would retain the QA configuration
when serving the production host. Sources: [Vercel
alias](https://vercel.com/docs/cli/alias) and [Vercel staged
deployments](https://vercel.com/docs/cli/deploying-from-cli).

Vercel distinguishes staged Production promotion without rebuild from Preview
promotion using Production variables. Keep these proof types separate; verify
deployment identity rather than assuming source equality means artifact
equality. Source: [Promoting
deployments](https://vercel.com/docs/deployments/promoting-a-deployment).

### Stable staging: minimum viable proposal

Use one fixed HTTPS staging origin, its own server-side auth secret and OAuth
client/callback, and the recorded Preview database. Keep canonical-origin
checks unchanged and ensure only staging env is exposed there. Use trusted
reviewed code and test identities. Do not assume that a new Vercel project,
custom environment, paid feature or domain is necessary or already authorized;
Design must select a free/available routing option and verify account limits.
Deployments must be serialized or pinned so an alias cannot move while checks
run. Staging DB writes need approved test-data ownership/cleanup rules.

This is the lowest-complexity recommendation for automating most hosted
validation. It leaves a necessary bounded real-production sign-in/session
check after promotion and cannot promise exact-artifact pre-promotion proof.

### Exact Production candidate: stable alias proposal

If the exact-artifact requirement wins, reserve one stable validation host and
register its exact Google callback alongside the production callback. Design a
finite server-owned origin set with per-request canonical selection from those
exact hosts; unknown hosts still fail with 421. This is a proposed architecture, not
a configuration recipe or permission to trust arbitrary forwarded headers.
BaseURL, OAuth state/callback, redirect destinations, POST Origin, session
cookies, invitation links and all other consumers need consistent selection.
No shared cookie Domain or production-cookie copying is necessary: establish
a separate real Google session at the validation host, then sign in again at
the production host after promotion.

The candidate must already contain both origin behaviors before it is built.
Bind the validation alias to the recorded candidate ID, serialize validation,
check the alias/deployment mapping before and after tests, and promote that
exact ID under fresh release authority. Define whether the alias stays attached
to the promoted deployment, is detached, or is moved to the next candidate;
retained host cookies/sessions may span such movements. Never quietly disable
authentication checks for a QA host. Test denials at both hosts and cross-origin
POST rejection as well as allowed flows. These are Design topics, not approved
changes.

The Production-target candidate has live Production database connectivity and
credentials regardless of its alias. Prefer read-only page/API checks with a
separately authorized existing test household. This does not make login
read-only: the existing verified Google callback can update a member's stored
verified email (`lib/auth.ts:53`). Select an approved test identity and explicitly
account for callback writes in validation authority and evidence. Do not add
synthetic invitation or provisioning changes; any other synthetic writes,
schema migration or paid search needs its own explicit scope. A stable alias
does not make unsafe schema rollout safe. Post-promotion smoke checks remain
necessary for the actual production hostname/callback/routing.

### OAuth Proxy feasibility

Current official Better Auth documentation describes a fixed callback server
that exchanges the provider code and relays encrypted identity data to trusted
previews. It requires installation on both sides and a shared proxy secret;
holders of that secret have authentication authority across participating
deployments. This is not an isolation-free shortcut. Source: [Better Auth OAuth
Proxy](https://better-auth.com/docs/plugins/oauth-proxy).

Our app also has custom Google-ID-token/subject admission and stateless cookies.
Before considering this route, inspect the pinned 1.7.27 plugin source and prove
compatibility with that verifier and returned `googleSubject`, cookie-backed
state, proxy endpoints, replay defenses and callback clamping. Current moving
documentation is insufficient evidence of those details. A dedicated trusted
callback service would avoid coupling Preview availability to current
Production app code, but adds operational scope. No proxy is recommended now.

## What we can automate

Regardless of the chosen host strategy, automate deployment readiness and
sanitized configuration-presence checks; origin/redirect checks; anonymous
denial; a real session's protected home/session/family reads; UI layout and
keyboard checks; and an evidence report bound to deployment/environment IDs.
Unknown protected responses are inconclusive, not passing checks. Existing
compiled-artifact tests with test-process Google fixtures remain valuable
offline evidence and are not live Google validation.

Real Google sign-in may still need the owner for consent, MFA, account selection
or security challenges. A controlled browser can reuse a privately held valid
real session for repeated app checks; this app's one-hour, nonrefreshing expiry
limits that window. Reuse does not exercise the OAuth round trip or current
callback implementation. Do not promise unattended Google login or replace it
with hosted fake-user code.

Deployment Protection is a separate control. Vercel offers an automation bypass
on all plans; if deliberately authorized, it can pass the platform barrier
while preserving application auth. The token must remain private and scoped
to application-host requests, including browser callback requests, and must
not be sent to Google or external sites. A protection-bypassed request must
not be used as WAF, bot protection or rate-limit enforcement evidence, because that access path
can skip security checks. It neither fixes Google callback
registration nor application 421. Source: [Vercel protection bypass
methods](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection).

## Original decision framing — resolved above

Choose isolated staging with simpler authentication and explicit artifact
limits, or exact-Production-candidate validation with a stable alias and a
reviewed finite-origin change. The goal is accepted as a useful product
problem; selecting the assurance level is the unresolved product decision.
Once chosen, architect/security review should produce a specification covering
credential/data boundaries, callback/session behavior, deterministic evidence,
cleanup/recovery, and the existing human release gate. No external actions were
taken and no live deployment/OAuth validation was performed for this research.
