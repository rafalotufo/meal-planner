# Agent deployment verification — independent specification review 001

- Reviewer: reviewer; date: 2026-11-25
- Reviewed specification: revision `a7f0102` (unchanged at audit HEAD `befa5c0`)
- Inputs: accepted sibling intent, current auth/session/menu/Proxy sources,
  pinned request-timeout note, specification security reviews001 and002
- Verdict: **Approved for owner specification consideration; no blocking findings.**
- Boundary: independent Design review only. Owner spec approval and an approved
  implementation plan remain required; no hosted or migration authority is granted.

## Evidence and assessment

Applied `REVIEW.md` bugs, security and compliance passes plus document-review
clarity, decision honesty, specificity, simplicity and architecture lenses.

- **Accepted scope and browser access:** `spec.md:10–24,28–53` implements the
  accepted staging-only direction with operator-issued per-run credentials,
  an ordinary HTML form and no Google account or injected browser cookie.
  Unattended issuance is explicitly deferred. Synthetic invitations, provisioning
  and URL curation are denied at route/store/delegation boundaries and remain
  named coverage gaps rather than silently widening the verification scope.
- **Actual identity boundary:** `spec.md:73–119` proposes a typed non-Google
  principal and independent revocable opaque cookie. This addresses the existing
  Google-only `lib/identity-access.ts:26–30` and `lib/session.ts:9–18` directly;
  it does not fabricate a verified Google subject or rely on Better Auth minting.
  The proposed relational amendment preserves Google row invariants while
  tying synthetic members to one run/family; exact SQL, nullable-check semantics,
  cyclic-FK insert ordering and grants remain legitimate plan/SQL-review work.
- **Target and family isolation:** `spec.md:123–145` separates build-known policy
  from runtime deployment identity, requires all bindings and states the trusted
  platform-administrator assumption honestly. Lines184–196 require separately
  authorized owned data/cleanup and exclude synthetic families from unrelated
  global/background jobs. Current reads and mutation-time admission checks bind
  the session to its live run rather than merely trusting a supplied family ID.
- **Timeout correction and equivalent guards:** `spec.md:147–180` closes the
  prior security blocker documented in specification-security001. Exact exchange
  dispatch bypasses Proxy for all methods and replaces it with complete direct
  guards, bounded storage/body work and no issuance before validated input.
  The no-EOF raw HTTP acceptance case at line230 is necessary because the pinned
  timeout note records Proxy's EOF wait. Menu's current independent raw JWE/token
  binding (`lib/menu/http.ts:20–29`) receives an explicit synthetic-cookie branch
  amendment, preserving the existing Google branch and every method's protection.
- **Hosted prerequisite honesty:** `spec.md:198–209` treats scoped Shareable Link
  availability, canonical-origin cookie continuity and exact-deployment pinning
  as unproven prerequisites. Blocking hosted readiness on failure is appropriate;
  the document neither claims that an alias pins a deployment nor falls back to
  project-wide credentials or public protection removal.
- **Policy and proof amendments:** `spec.md:213–243` requires active runbook/helper
  updates while preserving history, exact source/profile attribution and the
  distinction between synthetic-app, Google OAuth, local and provider evidence.
  Synthetic results cannot satisfy real-Google flags or grant owner gap acceptance.
  Browser compatibility, migration execution and live behavior are future proof
  obligations, not recorded passes.

## Handoff

No source edits or additional design blocker is needed before the owner reviews
this specification. Preserve the security002 obligations in the plan: real work
cancellation/rollback at deadlines, raw path/method/header tests, current admission
and revocation, SQL/grant isolation, copied-configuration Production denial and
safe private credential transfer. Preserve AGENTS' malformed-Google-allowlist
fail-closed rule for all admission, including the new direct exchange/shared
resolver; the specification grants no exception. Current Proxy validates that
configuration before session reads (`proxy.ts:9–10`); a new path must not silently
remove the barrier. Any intended exception needs an explicit reviewed amendment.
Hosted ingress proof is a readiness prerequisite,
not something this document review supplies. `git diff --check` passed. No code,
status, ledger, credentials, database or hosted operations were changed.
