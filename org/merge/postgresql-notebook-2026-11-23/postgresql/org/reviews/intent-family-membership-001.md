---
artifact: intent/family-membership/intent.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: draft_needs_clarification
round: 1
---

# Independent family-membership intent review

## Verdict

The draft faithfully captures single-family membership, invitations, automatic
family creation, and family ownership for future entities. It is suitable for
product clarification, not acceptance into Design. No implementation or human
gate approval is granted.

## Findings

1. **Blocking — Bugs / Compliance: resolve invitation acceptance for an existing
   member.** `intent/family-membership/intent.md:18` creates an automatic family,
   while `:34` requires one-family membership and `:100` leaves the transition
   policy open. Every new invitee can therefore already have a family by the
   time they accept. Moving, restricting, or transferring data has materially
   different consequences. Record the owner's answer, including disposition of
   the previous family's data, before accepting the intent. This is already
   correctly surfaced by the draft; the reviewer does not choose a policy.
2. **Blocking — Security / Compliance: resolve invitation eligibility.**
   `intent/family-membership/intent.md:105` correctly identifies that invitation
   access could change the current Gmail allowlist. `lib/auth.ts:44` checks
   eligibility before session issuance and `lib/session.ts:10` checks it on
   protected reads. An unlisted recipient cannot authenticate to redeem an
   invitation under today's policy. Record whether invitations preserve or
   replace that eligibility requirement; do not weaken either boundary by
   inference.
3. **Important — Clarity: reconcile automatic cleanup with the deletion
   exclusion.** `intent/family-membership/intent.md:94` excludes family deletion,
   but `:103` delegates empty-family cleanup to Design. If leaving an automatic
   family should delete it, explicitly distinguish system cleanup of an empty
   abandoned family from a user-facing family-deletion feature. Otherwise Design
   can interpret the scope fence inconsistently. Resolve this with finding 1.

## Evidence and scope

Compared the draft with the owner's request recorded at
`org/intake/forms/family-membership-001.md:15`; read `org/protocol.md`,
`org/roles/reviewer.md`, `REVIEW.md`, `lib/auth.ts`, and `lib/session.ts`.
Inspected the application file inventory: no recipe or meal implementation is
present under `app/` or `lib/`, consistent with the future-entity contract at
`intent/family-membership/intent.md:22`. The persistence and server authorization
requirements are appropriate consequences of durable, shared membership.

No source code was changed. No application tests, build, browser flow, database,
or live Google sign-in was executed; this review assesses the intent document
only. The two product questions are already pending in the parent chat. The
critical improvement is to record their answers without inventing approval.
