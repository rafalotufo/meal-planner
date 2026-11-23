---
artifact: intent/family-membership/intent.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: draft_needs_clarification
round: 2
---

# Independent review — membership clarification

## Verdict

The revision faithfully records the owner's rule: someone already in a family
cannot accept a new invitation. No empty-family or one-person-family exception
is introduced. Two product decisions remain open; this review does not accept
the intent into Design or authorize implementation.

## Resolved findings from round 1

- **Existing-member transition:** `intent/family-membership/intent.md:37`
  rejects acceptance for every existing member and requires atomic enforcement.
  `:107` attributes this rule to the owner, consistent with
  `org/messages/ceo-0002.md:16`. Existing membership and data remain unchanged;
  moving and data transfer are excluded at `:99`.
- **Deletion/cleanup ambiguity:** `intent/family-membership/intent.md:109`
  removes provisional-family deletion as a joining mechanism. No abandoned
  family needs cleanup when existing-member invitations are rejected. The
  prior review's cleanup concern is resolved for this feature's joining flow.

## Remaining blockers

1. **Bugs / Compliance — invitation onboarding must precede irrevocable
   provisioning if the owner chooses that flow.**
   `intent/family-membership/intent.md:19` automatically provisions family-less
   users, and `:37` makes them ineligible for invitations immediately afterward.
   `:113` correctly surfaces the unresolved sequencing rather than asserting an
   exception. The owner must confirm the intended opportunity to accept before
   automatic creation, including behavior on decline. Until then, an executable
   specification cannot establish how a new invitee successfully joins.
2. **Security / Compliance — invitation sign-in eligibility remains
   unanswered.** `intent/family-membership/intent.md:119` and
   `org/messages/product-manager-0006.md:16` retain the pending Gmail policy
   question. The owner's `ceo-0002` answer concerns membership only. Preserve
   `lib/auth.ts:44` and `lib/session.ts:10` allowlist enforcement until an explicit
   decision establishes whether invitation recipients receive access.

The critical improvement is to record those two owner decisions. The existing
questions are sufficient; no additional product question is required by this
review. Under `org/protocol.md`, this unresolved product ambiguity belongs with
the CEO, as already routed in `product-manager-0006`.

## Evidence and limits

Read the complete revised intent, the round-1 review, `ceo-0002`, and
`product-manager-0006`; compared their statements with the original intake and
the authentication boundaries inspected in round 1. No source code, intent,
state, or message file was changed by this review. No application tests,
database, build, browser flow, or live Google round trip was executed. This is
a bounded document review, not runtime verification or gate approval.
