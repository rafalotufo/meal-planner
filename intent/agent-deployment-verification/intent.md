# Agent deployment verification — intent

- Owner: Rafael; date: 2026-11-25
- Author: product-manager
- Status: Accepted for Design by Rafael on 2026-11-25 (active chat: “approved”)
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
The owner accepted this staging-only first scope on 2026-11-25. Keep routine
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

## Decision record and remaining Design choice

Rafael accepted the staging-only scope and synthetic identity plus short-lived,
single-use capability direction in the active chat on 2026-11-25. Production
retains anonymous health/configuration checks. Gate record:
`agent-verification-intent-2026-11-25`; source reply: `org/messages/ceo-0068.md`.

Design must propose the least-authority issuance mechanism. Owner/operator-issued
per-run access is sufficient for the first design proposal; unattended issuance
must not imply browser-agent possession of reusable control-plane credentials.
The exact issuance choice remains reviewable in the specification. Approval of
this intent does not approve implementation, hosted changes or a release.
