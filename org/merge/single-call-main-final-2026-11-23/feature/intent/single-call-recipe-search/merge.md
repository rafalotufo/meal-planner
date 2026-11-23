# Authorized local main integration

- Source: Rafael's explicit request, “Merge the single-call search changes into main.”
- Authority: org/messages/ceo-0026.md and code_owner_approve-008.
- Inputs: reviewed single-call feature 7144a0f and current main 68e1931.
- Approved design/build: sibling spec.md and plan.md; application source is unchanged.

Integrate the reviewed adapter with main's existing family and PostgreSQL code.
Preserve both immutable audit namespaces, reviewed application bytes, current
family/auth guards, dependency pins, photo protections and deployment boundaries.
Resolve audit/documentation conflicts. Update local main only after combined
verification and independent review, checking its expected clean input tip.

Both completed source loops are preserved under
org/merge/single-call-main-2026-11-23/. This separate run contains one real
reviewer verification turn with all eight acceptance commands, including family
tests after build. It does not rewrite historical acceptance, invent product/
design turns or extend the completed implementation loop.

Recipe/workflow/deployment tests, lint/typecheck/build, auth/family tests, real
mobile/desktop browser checks, audit hash/chain/prefix checks, secret/plan checks
and independent integration approval must pass. Restore historical screenshots
and save fresh captures separately. No remote push, production release, hosted
migration, billing or credential update is authorized by this local merge.
