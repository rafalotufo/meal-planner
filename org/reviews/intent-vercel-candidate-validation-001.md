---
artifact: intent/vercel-candidate-validation/intent.md
reviewed_at: 2026-11-24
reviewer: product-manager
verdict: approved
round: 1
---

# PM scope decision — isolated Vercel staging validation

Accepted for Design under `org/protocol.md`. Rafael explicitly selected the
isolated staging approach in `org/messages/ceo-0028.md`, resolving the assurance
choice from the initial research. This is a PM scope acceptance, not independent
peer review of PM-authored text or implementation approval.

Use the existing Vercel project's Preview environment and a manually controlled
stable staging alias, an independent staging auth secret and Google OAuth
client/callback, and the recorded Preview PostgreSQL database. Preserve one
canonical origin per environment. Production uses a distinct build and its
existing separately attributed candidate/post-promotion smoke checks. Staging
success is not proof of the exact Production artifact before promotion.

The architect should specify deterministic alias/deployment attribution,
validation serialization, protected access, approved staging identities and
data cleanup, server-only credential isolation, and genuine Google round-trip
evidence separately from checks reusing a valid one-hour session. Preserve
cryptographic subject/admission/family checks and the distinction between
platform protection bypass and app authentication. Do not claim WAF or bot
protection enforcement from protection-bypassed automation.

The accepted intent and sibling `solutions.md` retain the repository finding
that noncanonical hosts are intentionally rejected before Google login; no
new live Google root cause is asserted. No multi-origin production change,
OAuth Proxy, new project, paid hosting feature, migration or provider usage is
part of this choice. No external configuration or deployment is authorized
until a concrete reviewed scope exists. Spec/plan/code/security reviews and
human merge/release gates remain. The orchestrator serializes global org audit
updates and commits; this PM amendment changed only its assigned artifacts.
