# Staging-first Production release

- Author: architect, recording the owner's accepted process direction
- Date: 2026-11-24
- Status: Accepted direction — specifications/plan pending independent review
- Source: `org/messages/ceo-0047.md`; Rafael: “Lets modify deployment to production process so validation
  occurs on staging. Once validate staging working expected, deployproduction.”

## Problem and outcome

The active Vercel runbook still requires full OAuth, browser, paid search,
cancellation and WAF validation after Production promotion. Isolated staging is
now configured, but its acceptance is not yet the prerequisite for Production.
This leaves functional validation late and duplicates risky traffic in Production.

Make the release sequence explicit: validate the intended release revision on
staging, obtain owner acceptance for that exact Preview/source/configuration and
validation scope, then deploy that revision with Production configuration under
fresh human release authority. Production retains configuration/readiness,
canonical-host anonymous health and recovery checks; it is not the functional
validation environment. Staging and Production remain separate builds.

## Scope

A documentation-only amendment to active release guidance. Preserve the existing
operator helper, native/Python tests, generic gate scripts, Vercel configuration,
application authentication, schema, credentials and all historical evidence.
No new CI or automatic deployment, no staging Preview promotion, no migrations,
paid calls or external configuration/deployment is authorized by this change.

## Success criteria

- Release instructions require staging evidence and owner acceptance for the
  exact release source SHA, Preview deployment and explicit validation scope.
- Source or relevant configuration drift invalidates old release readiness;
  mismatched accepted staging/main revisions cannot silently pass.
- Functional/OAuth/browser/provider checks occur on staging. Paid/provider,
  cancellation and WAF checks need separate bounded authority and real evidence;
  absent keys or protected responses never become fabricated passes.
- Production receives a separate build with intentional environment differences
  reviewed, manual release authorization, minimal readiness/anonymous canonical
  health checks and an authorized recovery path.
- The intended Production origin `https://lotufo-meals.vercel.app`, currently
  recorded as a redirect, must have correct routing/auth configuration before
  release; this document does not authorize changing those settings.
- Active README/repository/runbook guidance agrees. Historical releases and their
  recorded approvals/results are preserved without reinterpreting them.

## Current evidence boundary

Owner acceptance in `org/messages/ceo-0044.md` covers Preview
`dpl_ALHqB6jCB6emyBNHTTbBzmfsV5Hi`, source
`9fc13ff27a636483fdf3503d5c8bf9f149550e45`. It is owner-reported functional
acceptance, not proof of unspecified individual checks. It cannot certify a
different main/release SHA, and no paid-provider pass was established by the
keyless staging setup. A future release must meet the new exact-source contract.
