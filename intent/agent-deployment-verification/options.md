# Google-free deployment verification — alternatives

- Author: product-manager; date: 2026-11-25
- Status: Exploratory recommendation; no architecture selected or change authorized
- Parent: [intent.md](intent.md)

The useful target is a fresh browser that can inspect the actual deployed app
using an isolated verification identity. Giving the agent a smaller credential is
still giving it authority; the design should make that authority explicit and
bounded.

## Existing constraints found in the repository

- [lib/auth.ts](../../lib/auth.ts) requires Google configuration, verifies ID-token
  claims before admission, and issues one-hour non-refreshing JWE session cookies
  (lines 10–24, 39–65).
- [lib/session.ts](../../lib/session.ts) reads a cryptographic session and rechecks
  database eligibility before returning server-derived family context (lines 9–29).
  A new verification entry point cannot safely skip these authorization layers.
- [tests/auth/server.ts](../../tests/auth/server.ts) starts an owned local server
  with a test-process Google-network preload and empty paid-provider keys
  (lines 22–32). This is existing local fixture evidence, not hosted access.
- [The staging-first specification](../staging-first-release/spec.md) requires
  exact-source attribution and separate proof classes (lines 35–68), real Google
  allowed/denied checks and no hosted fake identity/bypass (lines 70–100).
  A synthetic hosted verification feature needs an explicit reviewed amendment.
- [The staging runbook](../vercel-candidate-validation/staging-runbook.md) also
  separates Vercel protection from app sessions, and its finalize helper requires
  actual real-Google assertions. Do not fill those assertions with synthetic results.

## Options

| Option | Fresh ordinary browser without Google account? | Useful proof | Costs and limits |
| --- | --- | --- | --- |
| **A. Isolated staging synthetic identity, short-lived capability exchange** | Yes, if both app entry and platform access are designed for ordinary navigation | Deployed UI, session handling after entry, family-scoped reads/writes and logout using synthetic data | New staging auth entry and issuance lifecycle; must prove Production rejection, replay prevention, safe browser secret handling and data isolation. Does not test Google OAuth. |
| **B. Staging-only alternative auth, such as magic link or passkey** | Yes for app auth; a mailbox/passkey still needs a usable agent access model | Similar application coverage through a conventional auth mechanism | Wider auth integration, identity/admission model change, credential distribution/recovery and possibly email infrastructure. A magic link is a bearer credential; a passkey may be tied to a browser/device. Does not test Google OAuth. |
| **C. Keep local Google/provider fixtures plus anonymous deployed smoke checks** | Yes locally; authenticated hosted pages remain inaccessible | Strong deterministic local behavior plus deployed anonymous routing/health | Least new attack surface, already supported; cannot satisfy the requested authenticated hosted verification by itself. |
| **D. Owner signs in to staging and hands over a current session/browser** | No Google password needs to be shared, but a real Google account and owner action remain required | Actual application behavior under that existing staging session | Session remains a bearer credential and accesses the real staging household; browser/profile portability and one-hour expiry impede repeatability. Reusing it does not prove a new OAuth callback. Transitional fallback only. |
| **E. Public synthetic demo with no login** | Yes | Mostly visual/demo interaction | Anonymous mutating access invites abuse and provider spend; isolated demo behavior may diverge from authenticated app/session behavior. Poor fit for release certification of private family flows. |

## Recommended direction

Take **A** into Design, with **C** retained as the deterministic regression layer.
Use a disposable verification identity/household on an explicitly approved isolated
staging target. An authorized issuer would grant one run a narrowly scoped,
short-lived capability; the browser would use a normal entry flow and receive
the normal supported session transport. This is a product direction, not a claim
that the current Better Auth/session model already supports synthetic identities.
The architect must decide whether a separate typed verification principal can be
integrated safely without impersonating a verified Google subject.

Prefer an issuer that does not give the browser agent the staging auth signing
secret, database owner credentials or a reusable administrator credential. First
decide whether owner-issued per-run access is sufficient or unattended issuance
is required. Do not solve unattended access by quietly transferring broader
control-plane authority to the agent.

Avoid an “agent=true” URL, user-selected email/family ID, permanent shared staging
password, globally disabled auth, or a Production test toggle. The important proof
is that a stolen run credential cannot escape its approved target, identity, data
and time scope, including accidental Production configuration.

## Two independent access barriers

Vercel Deployment Protection gates the deployment before application authentication.
Solving only the Google sign-in path can leave a fresh browser stuck at Vercel.
Conversely, bypassing Vercel does not grant an application session.

[Vercel's official automation-bypass documentation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation)
describes project-wide bypass secrets and a browser-cookie handoff. That is
potential supporting infrastructure, not the recommended app identity credential:
its broader scope and skipped security checks need separate review and authority.
Do not inject a global browser header or call bypassed traffic WAF coverage.

For option B, [Better Auth's official plugin catalog](https://better-auth.com/docs/plugins)
lists magic-link authentication. The pinned library's actual compatibility with
this app's stateless sessions, verified Google-subject identity model and schema
must be checked during Design. Library availability alone does not make it a safe
drop-in replacement here.

Official sources were consulted on 2026-11-25. These references establish product
capabilities only; no account or hosted configuration was inspected or changed.

## What this would and would not certify

| Evidence | Meaning |
| --- | --- |
| Synthetic staging browser checks | Observed app behavior for the exact deployed source/profile under the approved synthetic principal |
| Real Google allowed/denied round trip | Google consent, callback, token verification and live provider admission integration |
| Local Google-network fixture | Deterministic application handling of simulated provider outcomes |
| Paid provider/recipe/photo observation | Only the specifically authorized live-provider behavior actually exercised |
| Platform-bypassed traffic | Application observation with platform protections skipped; no general WAF/bot proof |
| Anonymous canonical Production health | Routing, sign-in availability and protected-route denial within existing release scope |

Google integration should retain its local regression tests and, where the release
scope requires live OAuth evidence, separately performed real checks or explicit
owner acceptance of that named gap. This feature cannot make a synthetic callback
equivalent to Google. The current staging helper and release policy remain
unchanged until a reviewed spec defines their new evidence contracts.

## Design questions after intent acceptance

- Exact staging target/origin, principal representation and family isolation;
  no broadening of live allowlist or accidental cross-target identity acceptance.
- Trusted capability issuer and authorization to request access; run/target binding,
  lifetime, one-time exchange, replay/concurrency behavior and rate limits.
- Safe ordinary-browser bootstrap that limits history, referrer, log, screenshot,
  prefetch/link-scanner and automation-transcript exposure of secrets.
- Session expiry/revocation and failure behavior on target/source/configuration
  drift; whether present stateless sessions meet the desired revocation contract.
- Explicit data/provisioning/write/cleanup scope, permitted paid effects and
  ownership for concurrent verification runs.
- Preview platform protection access without an account dependency or unreviewed
  project-wide credential, and a realistic supported browser QA matrix.
- Required Google proof versus synthetic proof in release acceptance, preserving
  exact SHA/profile attribution and human merge/release decisions.
