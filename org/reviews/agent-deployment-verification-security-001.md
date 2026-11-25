# Agent deployment verification — security assessment 001

- Reviewer: security-researcher; date: 2026-11-25
- Scope: intent exploration at commit `7b27429`; no implementation or hosted inspection
- Verdict: No blocking findings for exploration. Recommended option A is suitable
  for further Design only after the owner resolves the stated scope/issuer choices.
  This is not approval of an authentication flow, hosted setup or deployment.

## Evidence and assessment

The proposal keeps the principal trust boundaries explicit: credential issuer to
browser; browser to staging ingress/application; verified session to current
admission/family context; staging to Production. Assets include real family data,
session/signing credentials, provider spend and release-evidence integrity.

- **Production isolation:** `intent.md:58–66` requires enforceable target/origin/
  issuer/audience separation and rejection of copied test configuration, rather
  than a single test-mode toggle. `intent.md:88–92` excludes a Production bypass.
  This addresses the largest elevation-of-privilege risk without claiming that
  the design already exists.
- **Principal and family authority:** `options.md:43–61` forbids impersonating a
  verified Google subject and giving the browser signing/admin credentials.
  Current `lib/session.ts:9–18,25–29` rechecks admission and derives family context;
  `lib/identity-access.ts:26–30,41–43` binds that path to a Google subject today.
  A synthetic principal therefore needs an explicit reviewed model amendment,
  not an injected fake Google identity or a skipped authorization check.
- **Credential lifecycle and browser compatibility:** `intent.md:54–70` requires
  ordinary browser navigation, replay prevention and bounded authority;
  `options.md:105–110` identifies history/referrer/log/prefetch leakage and session
  revocation as unresolved Design work. These credentials remain sensitive even
  if single-use. Existing `lib/auth.ts:59–65` issues one-hour stateless sessions;
  one-time entry alone cannot revoke a copied resulting cookie.
- **Ingress and evidence integrity:** `options.md:63–99` separates platform access,
  app authentication, real OAuth and provider proof. Current staging policy
  (`intent/staging-first-release/spec.md:70–100`) expressly disallows hosted fake
  identities and preserves real-Google/helper assertions. The intake acknowledges
  this conflict and requires a reviewed amendment; no old assertion can be marked
  passed using synthetic evidence.
- **Data and resource scope:** `intent.md:71–84` requires owned isolated data,
  setup/cleanup/write scope and preserved paid-provider bounds. A new login does
  not authorize writes, migrations, test-data resets or paid search requests.

## Obligations for a later design

Specify the trusted issuer and its authorization, maximum credential/session
lifetimes, atomic one-use exchange under concurrency, safe bootstrap and session
transport, replay/rate limits, logout/revocation semantics and sanitized audit
attribution. Treat the session as a second credential with its own theft window.
Define what recipient/run binding can actually enforce for a transferable bearer
credential rather than implying that single-use prevents theft before redemption.

Demonstrate synthetic-principal rejection on Production and unintended origins,
including copied config/keys and alias/source/profile drift; preserve canonical
Host checks and all authorization paths, including the equivalent menu-handler
guard and session-token binding. Demonstrate cross-household denial and approved
write/cleanup ownership. Verify the declared browser matrix through normal entry,
not cookie injection. Resolve platform protection separately without assuming
project-wide bypass secrets are appropriately scoped. Each result must retain
its actual proof class and exact deployment/source/profile attribution.

No code changes, live requests, credentials, data writes or runtime verification
were part of this assessment. Evidence is repository source and the draft's
explicit boundaries; operational security remains unproven until implementation
and authorized verification.
