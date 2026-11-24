---
artifact: intent/authenticated-access/spec.md + intent/authenticated-access/plan.md
reviewer: reviewer
verdict: approved
round: 1
---

# Independent Gmail eligibility specification and plan amendment review

## Verdict

Approved both amendments under `org/protocol.md`, following PM acceptance in
`org/reviews/intent-authenticated-access-allowlist-001.md`. The server-code list
supersedes unrestricted Google eligibility. No implementation approval,
application security clearance, or human merge/release decision is issued here.

## Evidence and review passes

- Bugs: the specification's `Server-code Gmail eligibility amendment` defines
  exact normalized membership, strict verified-email claims, intentional
  empty-list denial, and malformed-configuration failure. Both artifacts
  require the check before session issuance and after cryptographic session
  validation on every protected request. Removing a member and activating the
  rebuilt configuration therefore denies existing cookies before their expiry.
- Security: only server-only authentication/session modules import
  `lib/allowed-google-emails.json`; the list cannot appear in client props,
  bundles, logs or public responses. Matching trims/lowercases complete
  verified Gmail addresses without dot, plus, domain-alias, substring or
  domain-only expansion. Google signature/issuer/audience/expiry verification
  and existing state/PKCE/CSRF checks remain intact. Unsupported direct-ID-token
  requests cannot bypass the issuance boundary. Denials remain generic.
- Compliance: the exact four configured accounts match the amended accepted
  intent and PM decision. The plan manifest adds only the configuration and
  pure JSDoc matcher modules; no dependency, database, role model, invitation
  flow or admin UI is added. Changes take effect through normal code
  rebuild/restart/redeployment, with no claim of live configuration editing.

## Test and implementation requirements reviewed

The revised plan and specification require production matcher tests for
membership, unverified/malformed claims, trim/case handling, aliases, empty or
malformed configuration and removal. Real HTTP regressions must also exercise
signed Google callbacks for allowed/unlisted/unverified accounts and valid
cryptographic session cookies carrying currently ineligible claims, rather
than relying only on a pure matcher test.

The test network fixture reads an actual configured account for local success;
there is no fake production member, environment-controlled allowlist bypass,
or client-supplied identity trust. Current session checks apply at proxy and
resource boundaries. The stateless copied-cookie limitation remains accurate
for eligible accounts, while list removal overrides existing-session access.

Reviewed both complete artifact amendments against the accepted intent.
`git diff --check` passed. Build evidence, Chrome inspection, independent final
code/security reviews and human merge/release gates remain required. No live
Google account round trip or completed allowlist behavior is claimed here.

## Narrow browser-verification plan addition

Also approved the manifest addition of `app/layout.tsx` solely for
`metadata.icons.icon: 'data:,'`. The reported Chrome 404 was the browser's
automatic `/favicon.ico` request. An empty inline icon prevents that unnecessary
request without an external asset, product UI, or new public route exception;
retain the existing title and language. Verify the next Chrome run is clean.
