---
artifact: intent/family-membership/spec.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: changes-required
round: 1
---

# Independent family-membership specification review

## Verdict

Changes required before human specification review: make two identity/lifecycle
boundaries explicit. The product rules are faithfully captured; no further
product question is needed. These are bounded specification fixes, not a
request to implement or run the application during Design.

## Findings

1. **Important — Security / Bugs: identify the fresh-login email-update
   boundary.** `intent/family-membership/spec.md:164` requires updating the
   stored verified email only after fresh Google login and forbids rewriting
   identity from an encrypted session alone. The route/service contract at
   `:273` does not identify which trusted callback step performs this write.
   Provider identity checks are expressly read-only at `:35`. An implementation
   could consequently leave the old email indefinitely or update it on a
   protected read from an older cookie. Both violate the intended identity
   contract and can make the family's displayed/current recipient email stale.
   Minimal fix: name the successful verified OAuth callback phase or a specific
   trusted post-verification hook that atomically updates an existing subject's
   normalized email with uniqueness checking, before committing successful
   login. Keep provider admission checks read-only and never create membership
   or invitations there. Specify collision/failure behavior and require a
   changed-email fresh-login test plus a stale-cookie non-rewrite test.
2. **Important — Bugs / Compliance: carry the sign-out exception through all
   three existing guards.** `intent/family-membership/spec.md:239` correctly
   requires sign-out after eligibility disappears, but `:169` defines the
   shared session helper as returning an *eligible* identity and the HTTP table
   at `:279` does not state a separate sign-out guard. The actual
   `proxy.ts:20`, `app/sign-out/page.tsx:5`, and
   `app/api/auth/[...all]/route.ts:21` currently all require application
   eligibility. Thus an unlisted invitee whose invitation expires or is revoked
   would be denied before reaching the library logout unless all those layers
   change together. Minimal fix: explicitly define a cryptographic-session-only
   guard for exact GET/HEAD `/sign-out` and POST `/api/auth/sign-out`, without
   treating those routes as anonymous/public or allowing family data. Preserve
   Origin/CSRF protections; clear invitation context with session cookies so an
   invalid link does not leave a seven-day context trap. Add an HTTP test for
   revoked/expired pending eligibility followed by successful logout and cookie
   clearing. Other protected routes must continue to deny access.

## Pinned-source checks and implementation notes

- **Subject mapping is feasible with one clarification.** Installed
  `node_modules/better-auth/dist/oauth2/link-account.mjs:303` removes provider ID
  and passes additional profile fields through the parser; `:317` creates the
  local user from those parsed fields. Installed `dist/db/schema.mjs:123` skips
  `input: false` provider fields, supporting the proposed input-enabled field
  and exact public route restrictions. However `dist/cookies/index.mjs:79`
  calls `parseUserOutput` *before* encrypting the user into its session cache.
  State explicitly near spec `:134` that `googleSubject` must remain in library
  output/cache (do not use `returned: false`); application routes enforce the
  public-JSON exclusion. This is a handoff clarification rather than evidence
  the specified mapping is impossible.
- **Google issuer verification is credible.** Installed pinned core
  `dist/social-providers/google.mjs:27` uses `jwtVerify` with both accepted
  Google issuer forms, the configured audience, RS256, and maximum token age.
  Spec `:127` retains that verifier and strict verified-email and subject checks;
  no custom issuer primitive is needed.
- **Native dependency metadata is credible.** The official
  [13.2.0 manifest](https://raw.githubusercontent.com/WiseLibs/better-sqlite3/v13.2.0/package.json)
  and [registry metadata](https://registry.npmjs.org/better-sqlite3/latest)
  support the selected version, Node >=22, packaged prebuilds and absent install
  lifecycle script. Native loading, target compatibility, frozen installation
  and production build properly remain Build verification, not claimed here.
- **Eligibility and transaction design match scope.** Spec `:151` distinguishes
  pending onboarding from durable membership and retains allowlist removal for
  allowlist-only members. `:178` preserves invited access with an intentionally
  empty list while failing closed on malformed configuration. `:113`, `:224`
  and `:253` serialize membership creation, acceptance and invitation creation
  in immediate transactions; recipient plus secret token are required. No
  family switching, membership-only eligibility bypass, or recipe CRUD appears.

## Evidence and limits

Read the accepted intent, full draft specification, current auth handler,
policy, session, proxy and sign-out page; inspected the pinned library files
above and official native package metadata. Only this review record was
written. No application code, dependency, migration, plan, approval ledger or
workflow state was changed. No native installation, build, HTTP/browser suite,
database or live Google sign-in was run or claimed. No human approval or
implementation authorization is granted.
