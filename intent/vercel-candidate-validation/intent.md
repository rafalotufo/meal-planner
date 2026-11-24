# Validate Vercel candidates before promotion

- Author: product-manager
- Date: 2026-11-24
- Status: Draft — solution choice pending owner discussion
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

## Scope for this turn

Research and compare solutions, recommend a practical route, and record the
product choice needed before a specification. See sibling `solutions.md` for
repository evidence, primary references, and tradeoffs. This draft does not
authorize implementation, deployment, promotion, external configuration,
credential changes, a migration, or paid-provider calls.

## Success criteria for the eventual approved solution

1. An allowed real Google user can complete a round trip at a registered stable
   validation origin before broad production exposure; denial still works.
2. Deployment validation automates readiness, anonymous denial, authenticated
   application checks and mobile/desktop browser checks where feasible, with
   sanitized evidence and clear failed/inconclusive outcomes.
3. Evidence records source SHA, deployment ID, environment and origin, avoiding
   promotion of a moving alias or a rebuilt artifact under stale evidence.
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

## Product choice before Design

Is an isolated stable staging site sufficient to catch most failures before
release, with exact-Production authentication still checked immediately after
promotion, or must the exact `--prod --skip-domain` artifact support real
authenticated validation before promotion? The latter requires a reviewed
multi-origin/authentication change or a more involved routing mechanism.

The PM considers the problem in scope, but holds acceptance of a chosen
solution pending this decision. No spec or implementation plan exists yet.
