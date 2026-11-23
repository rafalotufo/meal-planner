# Org memory — main context

<!-- machine:begin -->

## Goal

intent/family-membership/intent.md

## Loop

- status: in_progress
- turn: 2
- phase: plan
- stop_reason: None

## Agents

- architect: idle (unassigned)
- memory-keeper: idle (unassigned)
- orchestrator: idle (unassigned)
- product-manager: idle (unassigned)
- reviewer: idle (unassigned)
- security-researcher: idle (unassigned)
- senior-developer: idle (unassigned)

## Open messages

- architect-0001 architect -> orchestrator handoff: Draft pnpm migration specification ready for independent review
- architect-0002 architect -> ceo question: Family membership specification ready for approval
- ceo-0001 ceo -> product-manager answer: Re: Feature scope needed for intake
- ceo-0002 ceo -> product-manager answer: Re: Family membership: joining and sign-in eligibility decisions
- ceo-0003 ceo -> product-manager answer: Re: Family invitation onboarding and remaining Gmail eligibility decision
- ceo-0004 ceo -> product-manager answer: Re: Remaining family invitation sign-in eligibility decision
- product-manager-0002 product-manager -> orchestrator decision: Accepted pnpm migration intent
- product-manager-0003 product-manager -> orchestrator decision: Accepted authenticated-access intent with Google sign-in
- product-manager-0004 product-manager -> orchestrator decision: Accepted server-side Gmail allowlist amendment
- product-manager-0008 product-manager -> orchestrator decision: Accepted family membership intent
- reviewer-0001 reviewer -> orchestrator review: pnpm specification approved
- reviewer-0002 reviewer -> orchestrator review: pnpm build plan approved
- reviewer-0003 reviewer -> orchestrator review: pnpm migration implementation approved
- reviewer-0004 reviewer -> orchestrator review: Authenticated access specification approved
- reviewer-0005 reviewer -> orchestrator review: Authenticated access build plan approved
- reviewer-0006 reviewer -> orchestrator review: Server-code Gmail allowlist specification and plan approved
- reviewer-0007 reviewer -> orchestrator review: Authenticated access implementation approved
- reviewer-0008 reviewer -> orchestrator review: Family membership draft needs product clarification
- security-researcher-0001 security-researcher -> orchestrator status: pnpm migration security clear
- security-researcher-0002 security-researcher -> orchestrator status: Authenticated access security clear
- senior-developer-0001 senior-developer -> orchestrator handoff: pnpm migration draft plan ready
- senior-developer-0002 senior-developer -> orchestrator handoff: pnpm migration implemented and verified
- senior-developer-0003 senior-developer -> orchestrator handoff: Gmail allowlist authentication implemented and verified

## Recent decisions

- mem-0022 orchestrator: Authenticated-access six-turn loop solved with all five acceptance commands exit0 at final security/review checkpoints. Implementation a2f015d; independent code/security approved. Graph implementation in_review awaits fresh human code-owner merge approval; no prior approval reused. Four Gmail members configured, tests/helpers TypeScript and both rules updated. Live Google OAuth credentials/consent remain external; inherited moderate advisory due2026-12-07. (org/reviews/code-authenticated-access-001.md)
- mem-0023 orchestrator: Owner explicitly approved merge to main. Fast-forwarded main b2e3266 to d5f1583 with current human gate merge-authenticated-access-001; no conflicts/source changes. On merged main, frozen install, Python7, lint, strict typecheck, build, auth11 and Chrome320/1440 passed. Implementation graph now merged; release remains not_started. Source worktree generated change/OAuth config preserved. (org/reviews/authenticated-access-merge-verification.md)
- mem-0025 ceo: Owner clarified that anyone already in a family cannot accept a new invitation. No empty-family exemption, switching, or data transfer. Pending: new-invitee onboarding sequencing before automatic family creation, and Gmail allowlist policy. (org/messages/ceo-0002.md)
- mem-0026 ceo: Owner confirmed invitees join existing families; new family creation applies only to users without an invitation. Resolve invitation before automatic provisioning. Existing family members cannot accept. Gmail allowlist eligibility remains open. (org/messages/ceo-0003.md)
- mem-0027 product-manager: Accepted family membership scope after owner confirmed invitation-based sign-in eligibility beyond allowlist. Persist recipient-bound invitation grants, preserve Google verification and removal behavior for allowlist-only users; do not let membership imply eligibility. Architect drafting specification, no implementation yet. (org/reviews/intent-family-membership-acceptance-001.md)

## Constraints

(none)

## Artifacts

- intent/family-membership/intent.md (a7ad8dfcaff70227042622152290935ca8b7342b65daad71c8d485d6353835f4)
- intent/family-membership/spec.md (a9c2316907420d2f05390d3613e4bc8bf51515e1f1186adfbd61949ffbfcec0b)

## Next action

architect:draft_spec

## Last digest source

- mem-0028 from org/reviews/spec-family-membership-002.md

<!-- machine:end -->

## Curated notes
