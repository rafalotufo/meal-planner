# Meal Planner — Vercel deployment

- Author: Rafael (request); Codex (intent capture)
- Source: `org/intake/forms/vercel-deployment-001.md`
- Status: Approved by Rafael — continue to Design
- Date: 2026-11-23

## Problem

The owner wants the existing application deployed using Vercel. The repository
documents local development and production preview, but has no documented,
verified Vercel release that allowed users can access remotely.

## Proposed outcome

Make the existing Meal Planner available at a stable HTTPS URL on Vercel, with
working Google sign-in and recipe search for the configured allowed users.
Provide a repeatable deployment, verification and rollback procedure.

Rafael approved this intent and confirmed production deployment using a
Vercel-provided URL. See `org/reviews/intent-vercel-deployment-001.md`.

### Acceptance criteria

- A reviewed deployment procedure identifies the Vercel project/account, source
  revision, supported runtime, reproducible pnpm installation and build settings.
- Required server-only environment variables are documented and configured in
  the intended environment without committing or exposing secret values.
- The deployed origin and Google OAuth callback agree. A real Google round trip
  succeeds for an allowed account; anonymous and disallowed access remain denied,
  and sign-out works. Preserve the server-only allowlist and session protections.
- Recipe search works on the hosted runtime, including source links, optional
  photos and existing fallbacks. Verify deadline, cancellation and pinned HTTPS
  metadata-transport compatibility without weakening network protections.
- Review multi-instance usage limits and provider spending controls before
  production release; document the approved operating limits and any necessary
  safeguards rather than treating process-local counters as global limits.
- Required lint, typecheck, build, application tests, authentication regression,
  workflow tests and secret scanning pass. Record real-browser verification at
  mobile and desktop widths and separately label live provider/OAuth evidence.
- Record the deployed revision and URL, release verification and a practical
  rollback procedure. Independent reviews and explicit human merge/release
  approval remain required before production activation.

## Affected users and systems

The owner and existing allowed Google users gain remote access. Hosting setup,
deployment documentation, authentication origin/callback configuration,
server-only environment configuration and operational usage controls are
affected. Application changes are limited to reviewed deployment requirements.

## Constraints

Use Vercel as requested. Preserve current application behavior, exact dependency
pins and pnpm lockfile, authentication, provider/source evidence and bounded
photo retrieval. No database is currently required. Keep credentials out of
Git, client code, logs and review evidence. Do not record allowed email addresses
in deployment artifacts. Follow `org/protocol.md`; preserve prior feature and
audit records. This intent capture authorizes no paid provisioning or release.

## Out of scope

New recipe features, UI redesign, database infrastructure, changes to allowed
membership, additional LLM providers, hosting-provider comparison and domain
purchase. Custom-domain setup and automatic production promotion are not assumed.

## Open questions

- Manual promotion is proposed in the spec; spec approval accepts this policy.

Resolved: the first release targets production at a Vercel-provided URL;
no custom domain is required. Rafael selected `rafalotufos-projects`, Hobby
(free hosting within included quotas), and confirmed there is no existing project.
No paid hosting upgrade is authorized.
OpenAI: Rafael chose existing project limits with no billing changes. Keep
access limited to existing allowed users; the spec documents operating limits
and residual exposure for review.

Runtime compatibility, environment separation, OAuth setup, timeout settings,
usage safeguards and rollback mechanics are Design-stage decisions. Resolve
account access and release authority before actions that depend on them.
