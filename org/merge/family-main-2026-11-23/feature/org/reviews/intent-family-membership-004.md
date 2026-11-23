---
artifact: intent/family-membership/intent.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 4
---

# Independent final intent review — invitation access

## Verdict

Approved for Design. The remaining product ambiguity is resolved by the owner's
choice recorded in `org/messages/ceo-0004.md`: a valid invitation grants access.
The PM acceptance separately records its scope authority in
`org/reviews/intent-family-membership-acceptance-001.md`. This independent review
finds no blocking mismatch between the confirmed requests and accepted intent.

## Evidence

- **Invitation access:** `intent/family-membership/intent.md:58` permits the
  intended recipient to sign in beyond the Gmail allowlist. `:60` requires a
  Google-verified identity and rejects request-supplied email or invitation
  possession alone. This reflects the owner decision without making Google
  sign-in unrestricted.
- **Durable eligibility:** `intent/family-membership/intent.md:61` requires
  accepted invitation-based access to persist after redemption, and `:63`
  requires enforcement both at session issuance and on protected reads.
- **Legacy eligibility:** `intent/family-membership/intent.md:64` retains the
  allowlist for users lacking invitation-based access; `:66` explicitly rejects
  membership alone as an eligibility bypass. `:110` delegates durable grant
  design while retaining that restriction. Automatically provisioning a family
  therefore cannot immunize an allowlist-only user from later allowlist removal.
- **Membership rules preserved:** `intent/family-membership/intent.md:40`
  resolves invitations before automatic creation; `:48` rejects acceptance by
  existing members, including empty and one-person families. `:136` does not
  invent automatic provisioning after decline.
- **Scope boundary:** `intent/family-membership/intent.md:143` leaves storage,
  identity mapping, transport and lifecycle to Design. `:122` excludes recipe
  and meal implementation, switching and data transfer. No new product blocker
  arises from those appropriately delegated technical choices.

## Review limits

Read the complete current intent, owner access answer, PM acceptance, and prior
independent review results. Only this review record was written. No application
source, approval ledger, message, or workflow state was changed by the reviewer.
No tests, build, browser, database, live Google sign-in, or production migration
was executed or verified. Approval covers the intent document only;
specification, plan, code/security review, human merge and release gates remain.
