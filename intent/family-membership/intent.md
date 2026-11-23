# Meal Planner — family membership

- Author: Rafael (request); product-manager (intent capture)
- Source: `org/intake/forms/family-membership-001.md`
- Membership clarification: owner reply recorded in `org/messages/ceo-0002.md`
- Onboarding clarification: owner reply recorded in `org/messages/ceo-0003.md`
- Invitation access clarification: owner reply recorded in `org/messages/ceo-0004.md`
- Status: Accepted — product-manager under the org intent gate
- PM decision: `org/reviews/intent-family-membership-acceptance-001.md`
- Date: 2026-11-23

## Problem

Meal Planner authenticates individual Google users but has no persistent user
or family model. People cannot share a household's recipes or meals, invite
household members, or rely on a family boundary for future application data.

## Proposed outcome

Introduce a family as the shared ownership and access boundary. Every user
belongs to exactly one family. Users can invite others to their own family.
An eligible authenticated user without a family joins the existing family
through their invitation. Only users without an invitation receive a newly
created family automatically, including existing users on their first visit
after this feature is activated. Returning users retain their family across
sessions and devices.

Recipes, meals, and future shared entities belong to a family. Neither recipes
nor meals currently exist, so this feature establishes their ownership contract;
it does not introduce recipe or meal functionality.

## Acceptance criteria

- An authenticated application user has exactly one current family before
  accessing family-owned data or performing family-owned operations.
- First-login provisioning persists a stable application identity and family
  membership. Repeated or concurrent login/request attempts cannot produce
  duplicate memberships or orphan families. Logout and later login preserve
  membership; browser cookies alone are not the membership source of truth.
- Resolve the authenticated new user's invitation before automatic family
  creation. Invited users join the inviting member's existing family through
  invitation acceptance; do not create a separate family for them. Automatic
  family creation applies only to users without an invitation. Design must
  define invalid, expired, revoked, or declined invitation handling without
  silently treating an outstanding invitation as absent.
- A family can contain multiple users; accepting an invitation never gives a
  user simultaneous membership in two families.
- A user who already belongs to any family cannot accept a new invitation,
  even if their current family contains only themselves or has no data.
  Enforce this on the server atomically with invitation acceptance; concurrent
  provisioning or another acceptance cannot bypass the rule. Rejecting the
  invitation leaves existing membership and family data unchanged.
- A member can create an invitation to their own family. The invited person
  explicitly accepts while authenticated; another identity cannot redeem an
  invitation intended for someone else. The specification must define invite
  delivery, recipient verification, lifetime, revocation, and repeat acceptance.
- An invitation cannot move an existing member or transfer family data.
- A valid invitation grants its intended recipient sign-in access even when
  that recipient is absent from the server-side Gmail allowlist. Require a
  Google-verified recipient identity; a request-supplied email or possession
  of an invitation alone is insufficient. Persist the accepted user's access
  so later sessions do not depend on an already-consumed invitation. Design
  must enforce this eligibility at session issuance and every protected read.
  Users without a valid invitation or established invitation-based access
  continue to require the existing allowlist. Never make Google sign-in open
  to all users or let family membership alone bypass eligibility.
- Family authorization is checked on the server before reading or changing
  family data. Client-supplied family IDs, cached session claims, and invitation
  possession alone cannot grant access to another family's resources.
- Family authorization uses current server-owned membership on every protected
  request, including requests with an existing session; stale session claims
  cannot grant family access.
- Future recipes, meals, and shared entities must have a required family owner
  and enforce that same family boundary for reads and writes. Document this
  contract without creating placeholder recipe or meal tables or interfaces.
- Persistence/provisioning failures fail closed without exposing protected data
  or partially applying membership changes.
- TypeScript regression tests cover provisioning, persistence across sessions,
  concurrent attempts, invitation authorization and lifecycle, rejection for
  users already in a family (including empty or one-person families), single-family
  membership, and cross-family denial through real server boundaries.
- Preserve existing authentication and workflow regression coverage. Lint,
  strict typecheck, production build, auth tests, Python workflow tests, and
  staged secret scan pass. Verify any new UI in a real browser at mobile and
  desktop widths; record actual evidence and independent reviews.

## Affected users and systems

All current and future application users; Google identity/session integration;
durable application persistence; protected pages, endpoints and actions;
invitation and family-management flows; future family-owned data access;
contributor setup, migrations and verification instructions.

## Constraints and design work

Use the existing Next.js App Router, TypeScript, pnpm and Drizzle foundation.
There is currently no configured database engine, schema, or migration.
Design must select durable storage, stable identity mapping, constraints,
transactional provisioning/membership updates, invitation delivery, and local
setup before implementation. Production database provisioning or migration
execution still requires the applicable human authorization.

Preserve Google verification, server-only eligibility configuration, fail-closed session checks,
and the existing one-hour session policy unless a reviewed specification
explicitly identifies a required change. Never log invitation credentials or
expose another family's membership or content.

The owner explicitly expands eligibility beyond the Gmail allowlist for valid
invitation recipients. This supersedes the prior feature's allowlist-only
policy for those recipients. Design must specify durable invitation-based
eligibility and how removal from the allowlist affects existing allowlist-only
users; it must not grant eligibility merely by provisioning a family.

Keep the home page's `Meal Planner` heading. Propose the smallest separate
family/invitation interface needed for this feature; additional home-page UI
requires explicit scope in the specification. Follow `org/protocol.md`, keep
feature artifacts together, preserve audit history, and retain human merge
and release gates.

## Out of scope

Recipe or meal CRUD, meal planning, multi-family membership, family switching
(including switching through an invitation), bulk data transfer, billing, public family discovery,
custom roles/administrator hierarchies, member removal, user-facing family deletion, and
unrelated authentication or dependency changes. These are not implied by
adding a family boundary.

## Confirmed product decisions

- Owner: "Someone already in a family should not be able to accept a new
  invitation." This supersedes all previously proposed move/empty-family/data
  transfer options. No provisional-family deletion is needed to permit joining.
- Owner: "Yes, invitees will join existing families, new family creation
  happens only for users without invitation." Invitation handling precedes
  automatic provisioning; a new family is not created for an invited user.
  This does not authorize a new family on invitation decline.
- Owner selected: "Let a valid invitation grant access." Invitees need not
  already appear in the Gmail allowlist. Google identity verification and
  recipient binding remain required.

## Open product decisions

No blocking product question remains. Storage, stable identity mapping,
invitation transport/lifecycle, and durable eligibility are Design decisions
within the confirmed rules above. This accepts scope only; specification,
plan, implementation, merge, and release retain their respective gates.
