---
artifact: intent/authenticated-access/intent.md
reviewed_at: 2026-11-23T15:50:24Z
reviewer: product-manager
verdict: approved
round: 1
---

# PM scope amendment — Gmail allowlist

## Verdict

Accepted for Design amendment. The owner's explicit server-code Gmail allowlist
request supersedes the prior any-verified-Google-account assumption. The same
active intent now requires both a valid Google-authenticated session and
current eligibility in the configured list. No administration UI or role
system is requested or implied.

The owner confirmed the malformed initial `thomasnlotufo@gmail` entry as
`thomasnlotufo@gmail.com`. The confirmed list is `thomasnlotufo@gmail.com`,
`erikafn@gmail.com`, `aclotufo4@gmail.com`, and the owner's subsequent addition
`rafalotufo@gmail.com`. No product clarification remains.

This is a PM scope decision, not independent peer review of the PM's amendment.
Architect and implementation artifacts must be amended and independently
reviewed before changed behavior is implemented.

## Findings

No blocking product-scope findings. The accepted intent specifies a server-only
code configuration, Google-verified Gmail identity, trim/lowercase exact
matching without Gmail dot/plus normalization, empty-list denial, checks before
session issuance and on each protected request, and generic denial responses.
Removing a member through a deployed configuration change must block existing
sessions on later protected requests; copied-cookie expiry limits do not
override the current eligibility check.

The architect must select the code configuration location, library hooks,
denial contract, and regression implementation without adding a database,
client-exposed list, role model, or administrative interface.

## Evidence

- `org/intake/forms/authenticated-access-allowlist-001.md` records the owner's
  requested policy, original supplied list, and confirmed first-email correction.
- `intent/authenticated-access/intent.md` replaces the previous unrestricted
  Google assumption and defines the account-list acceptance criteria.
- `intent/authenticated-access/spec.md`, Objective and scope, currently permits
  any verified Google account and therefore requires amendment.
- `intent/authenticated-access/plan.md` currently lacks allowlist configuration,
  issuance checks, and removal/eligibility regression tasks; it needs a matching
  amendment before implementation.
- `org/protocol.md` assigns product-scope acceptance to the PM, spec/plan peer
  reviews to independent reviewers, and merge/release gates to the human owner.

## Limits

This decision approves the product scope only. It does not claim changed
runtime behavior, passing allowlist tests, design approval, security clearance,
merge, or release. Historical intake and review records remain preserved.
