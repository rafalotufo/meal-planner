---
artifact: intent/family-membership/intent.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: draft_needs_clarification
round: 3
---

# Independent review — invitation-first onboarding

## Verdict and resolved findings

The onboarding revision matches the owner's answer at
`org/messages/ceo-0019.md:16`. The round-2 sequencing blocker is resolved:
`intent/family-membership/intent.md:38` requires resolving the new user's
invitation before automatic family creation, and `:41` limits automatic creation
to users without an invitation.

The existing-member prohibition remains intact at
`intent/family-membership/intent.md:46`, including one-person or empty families;
no switching or provisional-family exception was introduced. The revision does
not silently approve family creation after declining an invitation: `:42`
delegates lifecycle handling to Design, and `:122` explicitly records the limit
of the owner's answer. Those lifecycle details are specification work, not a
new product blocker for this intent review.

## Remaining blocker

**Security / Compliance — invitation sign-in eligibility is still pending.**
`intent/family-membership/intent.md:126` and
`org/messages/product-manager-0007.md:16` correctly retain one unanswered
decision: whether invitees must already be allowlisted or a valid invitation
grants sign-in access. The owner's onboarding answer does not answer that
question. Current issuance and protected-read eligibility checks must remain
until the policy is explicitly decided. This is the only remaining product
blocker found; it is already routed to the CEO, not a new review disagreement.

## Evidence and limits

Read the complete revised intent, `ceo-0019`, and `product-manager-0007` and
compared the delta with the two preceding independent reviews. No intent,
message, state, or application source was modified by this review. No runtime
tests, build, browser, database, or live authentication checks were run for this
document-only delta. No intent acceptance, Design approval, implementation,
merge, or release is granted.
