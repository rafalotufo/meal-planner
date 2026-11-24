# Validate Vercel candidates before promotion

- Author: product-manager
- Date: 2026-11-24
- Status: Accepted — isolated staging selected; local tooling implementation approved
- Decision: `org/messages/ceo-0038.md`; PM acceptance in
  `org/reviews/intent-vercel-candidate-validation-001.md`
- Source: Rafael requested the SDLC org workflow and exploration of solutions
  for Google OAuth preventing validation after a `--skip-domain` deployment.

## Problem

We cannot exercise authenticated application behavior on a staged Vercel
deployment using its generated URL with the current production configuration.
The owner reports Google origin/redirect restrictions. Repository inspection
also identifies an earlier, intentional barrier: `proxy.ts` rejects every Host
other than the exact `BETTER_AUTH_URL` host with 421. Current candidate smoke
checks assert this denial, then defer actual Google and authenticated checks
until after promotion. No fresh failed OAuth request or live Google settings
were inspected during this intake, so a specific Google error is not confirmed.

## Intended outcome

Make hosted validation repeatable before broad production exposure. Provide a
stable, explicitly registered sign-in origin and an automation path that can
exercise authenticated pages, session eligibility and family checks, detect
failures, and tie evidence to a source revision and Vercel deployment ID.
Clearly distinguish isolated staging evidence from checks of the exact
Production artifact that will be promoted.

## Selected scope

Use the existing Vercel project's Preview environment with a manually controlled
stable staging alias, an independent staging auth secret and Google OAuth
client/callback, and the recorded Preview PostgreSQL database. Keep the app's
single canonical origin per environment. Production remains a distinct build
and deployment with its own candidate and post-promotion smoke checks.

The owner selected this approach on 2026-11-24 and directed continuation in
`org/messages/ceo-0039.md`. The reviewed specification and independently approved
implementation plan authorize the local helper/tests and runbook. See sibling
`solutions.md` for comparison and proof limits. Deployment, promotion, external
configuration, credential changes, migrations and paid-provider calls remain
outside that local implementation authority.

## Success criteria for the eventual approved solution

1. An allowed real Google user can complete a round trip at a registered stable
   validation origin before broad production exposure; denial still works.
2. Deployment validation automates readiness, anonymous denial, authenticated
   application checks and mobile/desktop browser checks where feasible, with
   sanitized evidence and clear failed/inconclusive outcomes.
3. Staging evidence records source SHA, Preview deployment ID, environment and
   stable origin; alias movement cannot silently change the target during a
   validation run. This evidence concerns the attributed staging deployment,
   not the distinct Production artifact. Production retains separate source/
   deployment attribution and candidate/post-promotion smoke checks.
4. Environment/data/secret isolation is explicit. Production data is not used
   for synthetic writes without separate authority. Existing session,
   cryptographic Google identity, admission and family boundaries remain.
5. No wildcard Google callbacks or trusted origins, request-controlled origin
   trust, fake-user production bypass, copied production cookies, weakened
   deployment protection, or automated human merge/release approval.
6. Real Google verification remains distinguishable from local fixture tests
   and from automation using a still-valid real session. Session reuse cannot
   prove that Google sign-in works on a new deployment and expires after one
   hour in this app.

## Affected users and systems

The owner/release operator and allowed household users; Vercel deployment and
promotion workflow; Google Web OAuth client configuration; Better Auth origin,
callback and cookie handling; isolated Preview/Production PostgreSQL targets;
deployment/browser helpers and org release evidence.

## Constraints and exclusions

Preserve Hobby-only hosting, exact pinned dependencies, PostgreSQL-only runtime,
the existing private credential workflow, paid-usage bounds, and all human
merge/release gates. Existing separate Neon Preview and Production databases
do not by themselves create a working authenticated staging environment.
No new website UI or recipe/meal CRUD is requested. Do not put test fixtures,
synthetic identity endpoints or transport interception into hosted production.

## Resolved product choice and Design handoff

The owner approved isolated staging in `org/messages/ceo-0038.md`. It catches
hosted failures before release while retaining actual Production authentication
checks after promotion. Exact `--prod --skip-domain` artifact authentication
before promotion is not a requirement of this approach. Do not implement the
finite-multiple-origin or OAuth Proxy alternatives as part of this selection.

Design must specify manual alias targeting and validation serialization,
environment/secret/database isolation, approved staging identities and data
lifecycle, real Google login versus short-lived session reuse, platform
protection handling, evidence binding and production proof limits. The
[specification](spec.md) and [implementation plan](plan.md) have passed independent
review. Local tooling follows that plan; hosted setup and human merge/release
gates remain separate.
