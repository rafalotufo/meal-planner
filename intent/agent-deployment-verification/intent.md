# Agent deployment verification — intent

- Owner: Rafael; date: 2026-11-25
- Author: product-manager
- Status: Draft; pending owner acceptance of scope and preferred direction
- Source: owner's request in the active chat to explore deployment verification
  from any browser without giving agents access to a real Google account
- Alternatives and evidence: [options.md](options.md)

## Problem

Agents need to inspect authenticated application behavior on deployed revisions,
including responsive UI and family-scoped reads and effects. Today hosted access
depends on a real Google identity and session. Sharing a personal account,
password, MFA access or copied real-user browser profile gives an agent broader
authority than a verification run needs. It also makes a fresh browser dependent
on an owner's manual sign-in or session handoff.

Local regression fixtures already avoid real Google credentials, but they are
test-process-only and do not make a hosted deployment accessible. The existing
staging contract deliberately requires real identities and prohibits hosted fake
identities and auth bypasses. This intent proposes investigating a reviewed
replacement for the verification use case; it does not override that contract.

## Desired outcome

An authorized agent can start in a fresh ordinary browser, obtain narrowly scoped
verification access without a Google account or browser-specific cookie
injection, and exercise the deployed application's agreed UI and server flows.
The path should be repeatable across browser tools and should not expose real
family data or credentials for a human account.

Start with an isolated staging deployment and synthetic verification household.
This is an explicit working assumption: the owner said “deployments” without
choosing whether authenticated Production verification is required. Keep routine
Production verification at the existing anonymous health/configuration scope
unless the owner separately requests and approves a broader intent.

## Product recommendation for consideration

Investigate a staging-only synthetic verification identity entered through a
short-lived, single-use capability that the browser exchanges for an app session.
The agent would receive only the authority required for one verification run.
This removes the Google-account dependency, not authentication or secret handling:
the capability and resulting session remain sensitive credentials.

The exchange protocol, issuance authority, storage, revocation, browser entry UX
and integration with Better Auth are Design decisions after intent acceptance.
Compare this direction with staging-only alternative authentication, retaining
local fixtures, and owner-assisted session handoff before fixing an architecture.

## Constraints and success criteria for Design

- Support a documented fresh-browser entry flow without extensions, DevTools,
  custom request headers, preinstalled profiles or possession of Google credentials.
  “Any browser” means ordinary supported browsers; enumerate and verify the actual
  browser support matrix rather than promise every browser/version.
- Confine synthetic identities, sessions, data and effects to an explicitly
  approved non-Production target. Production must fail closed if test settings or
  credentials are accidentally copied; a lone environment toggle is insufficient
  evidence. Define enforceable origin/target/issuer/audience separation and test
  misconfiguration cases during Design.
- Preserve server-verified sessions, canonical Host enforcement, current admission
  rechecks, server-derived family context, CSRF/session binding and all existing
  cross-family denial behavior. Define synthetic identity admission explicitly;
  do not pretend it is a Google-verified subject or widen the Google allowlist.
- Bound capability lifetime, use count, recipient/run/target scope and issuance
  authority. Prevent replay and uncontrolled account selection; define session
  expiry, revocation and leakage controls. Do not place durable credentials in
  public URLs, chat, committed evidence, screenshots or logs.
- Use only an isolated synthetic household and approved test data. Define setup,
  reset/cleanup ownership, concurrency and write scope before any hosted effects;
  no data copying, automatic shared-data cleanup or provisioning on reads.
- Separate reaching Vercel-protected deployments from logging into the app.
  Resolve normal-browser access without asking agents for a real platform account
  or granting unreviewed project-wide protection credentials. Existing platform
  protection remains in force until a concrete change is separately authorized.
- Report evidence separately: synthetic authenticated application checks, actual
  Google OAuth checks, provider success, platform/WAF behavior and anonymous
  Production health. Synthetic sign-in cannot prove a real Google callback or
  justify existing real-Google attestations. Define revised release evidence and
  any owner-accepted OAuth gaps explicitly.
- Preserve exact-source staging validation, human merge/release gates, database
  isolation, strict checking, paid-provider bounds and provider/photo protections.

## Out of scope for this intake

No implementation, new login endpoint, session minting, authentication/configuration
change, hosted identity/data creation, database migration, paid request, deployment,
promotion, merge or release. No anonymous access to private application behavior,
public demo of real households, permanent shared password, Production test bypass,
or handing agents personal Google/Vercel accounts.

## Owner decisions needed before Design

1. Accept staging-only authenticated verification as the first scope, with
   Production retaining anonymous health checks, or state the required Production
   use case so its risks can be designed separately.
2. Select the synthetic identity plus short-lived capability direction for Design,
   or choose another option in [options.md](options.md).
3. Confirm whether automatic per-run access issuance is required, or an owner-issued
   run credential is sufficient initially. Both avoid Google-account access; they
   differ in unattended operation and control-plane scope.

The PM finds the problem coherent and the staging-first direction appropriate for
Design, but escalates these scope/authority choices to the owner. This draft does
not record acceptance or approval on the owner's behalf.
