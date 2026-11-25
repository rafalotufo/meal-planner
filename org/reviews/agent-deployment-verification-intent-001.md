# Agent deployment verification — independent intent review 001

- Reviewer: reviewer; date: 2026-11-25
- Reviewed source: `dafa5ea`; intent/options authored by product-manager;
  independent security assessment by security-researcher
- Scope: intent and alternative exploration, before owner acceptance or Design
- Verdict: **Approved for owner consideration. No blocking findings.**
  This is artifact readiness, not owner intent acceptance, design approval,
  permission to change authentication or authorization for hosted actions.

## Review evidence

Applied `REVIEW.md` bugs, security and compliance passes, plus the document-review
skill's clarity, decision honesty, specificity, simplicity and brainstorm lenses.
No source edits were needed.

- **Problem and outcome:** `intent/agent-deployment-verification/intent.md:12–31`
  distinguishes the requested authenticated hosted browser access from existing
  local fixtures. `intent.md:54–57` defines ordinary-browser entry without
  extensions, injected cookies or custom headers and requires a tested support
  matrix. This directly addresses the owner's browser-portability problem.
- **Alternatives and recommendation:** `options.md:33–61` compares five approaches
  and recommends a short-lived staging capability with retained local fixtures.
  The comparison acknowledges that local fixtures alone cannot fulfill hosted
  authentication, handoff retains real-account dependence, and alternative auth
  needs a credential delivery model. It does not claim a drop-in implementation
  or transfer broad signing/database/admin credentials to the browser agent.
- **Decision honesty:** `intent.md:33–50,94–107` explicitly labels staging-first as
  an assumption and escalates Production scope, preferred option and issuance
  authority to the owner. The recommended capability is still a credential;
  `intent.md:44–48` leaves its protocol and lifecycle for Design. These open
  decisions should not be silently converted into approved requirements.
- **Authentication and authorization:** `intent.md:58–84` preserves isolation,
  admission rechecks, server-derived family ownership and paid-provider bounds.
  Current `lib/auth.ts:36,45–54` and `lib/session.ts:9–18,25–29` are Google-bound;
  `options.md:47–50,75–79` acknowledges the necessary principal/model review.
  The independent security assessment correctly leaves replay, stolen bearer,
  resulting-session revocation and Production rejection as Design obligations.
- **Evidence integrity:** `options.md:63–99` separates platform ingress, synthetic
  sessions, actual Google OAuth, local fixtures and anonymous Production health.
  Existing `intent/staging-first-release/spec.md:70–100` prohibits hosted fake
  identity/bypass and requires real-Google proof for its current contract.
  `intent.md:19–23` and `options.md:95–99` explicitly require a reviewed amendment;
  synthetic results cannot fulfill existing Google/helper attestations.
- **Scope and workflow:** `intent.md:88–107` excludes code and hosted effects and
  reserves owner acceptance before Design. The active loop points to this intent;
  the graph's spec and plan artifacts remain sibling paths with `not_started`
  status. The preceding completed loop/graph is preserved under
  `org/loop/archive/dependency-aware-migrations-before-agent-verification-2026-11-25/`.

## Owner handoff and verification limits

No critical document improvement is needed for this exploration gate. The next
useful action is an owner decision on the three questions at `intent.md:94–103`.
The recommendation can be explained concretely as short-lived entry to an
isolated synthetic staging household through a normal browser, with anonymous
Production health unchanged unless broader scope is selected.

This review inspected repository sources and documents only. It does not prove
browser compatibility, hosted ingress usability, credential isolation, live OAuth
or provider behavior. Such claims require an approved design, implementation and
separately authorized verification. `git diff --check` passed for the review.
