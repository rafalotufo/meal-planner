---
artifact: intent/family-membership/intent.md
reviewed_at: 2026-11-23
reviewer: product-manager
verdict: approved
round: 1
---

# PM intent decision — family membership

Accepted for Design under the PM scope authority in `org/protocol.md` and
`org/org-chart.yaml`. This is a scope decision, not independent self-review.

The owner resolved all three product questions: existing members cannot accept
new invitations (`org/messages/ceo-0002.md`); invitees join existing families,
and only users without invitations receive a new family (`ceo-0003.md`);
a valid invitation grants sign-in access beyond the Gmail allowlist
(`ceo-0004.md`). Prior draft reviews remain unchanged as historical evidence.

The accepted intent establishes single-family membership, durable provisioning,
recipient-bound invitations and shared family ownership for future entities.
No recipe/meal implementation, family switching, or data transfer is included.
Google identity verification remains mandatory. Invitation-based access must
persist beyond redemption; allowlist-only family provisioning must not itself
create an enduring eligibility bypass. These are explicit Design requirements.

Independent specification/plan review and the human merge/release gates remain.
No application code or infrastructure is changed by this acceptance. No runtime
or live Google validation is claimed.
