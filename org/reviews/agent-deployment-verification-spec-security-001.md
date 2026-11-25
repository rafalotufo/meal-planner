# Agent deployment verification — specification security review 001

- Reviewer: security-researcher; date: 2026-11-25
- Reviewed source: spec commit `19ddae5`
- Verdict: Changes requested — one blocking deadline/dispatch conflict.
- Scope: Design review only; no code, runtime, hosted or credential operations.

## Blocking finding

**[P1] Put the exchange deadline ahead of Next Proxy's unfinished-body wait.**
`intent/agent-deployment-verification/spec.md:50–53` promises rejection of requests
exceeding5s, while lines141–145 propose a public POST exception through Proxy.
The existing pinned-source investigation in
`intent/saved-recipe-menu/request-timeout-note.md:12–22` records that Next16.4.6
Proxy awaits original body EOF before dispatch; even a Proxy-returned timeout
crosses that finalization wait. `proxy.ts:52–54` currently exempts only exact menu
shapes. An attacker can therefore send a partial chunked exchange body and prevent
the proposed handler deadline from starting, occupying ingress resources before
the PostgreSQL limiter/transaction runs. Route-level parser code cannot enforce
the stated contract with that dispatch model.

Specify an exact verification-session handler exemption and an equivalent direct
handler guard, preserving target/canonical Host, private/security headers, method,
Origin/nonce, bounded parser and shared throttle checks without forwarding trusted
identity headers. Keep the GET entry page behind Proxy. Include a real raw HTTP
unfinished-body regression which receives the bounded response without sending
EOF and leaves no consumed capability/session. Alternatively identify and prove
an earlier supported deadline that actually satisfies the requirement; do not
silently weaken the5s contract.

## Assessment of remaining design

- Lines73–101 explicitly model synthetic principals and SQL branch constraints;
  they do not fabricate Google claims. Current `lib/identity-access.ts:26–30`
  requires verified Google identity, and `lib/session.ts:9–18` uses that identity
  for current admission. The proposed central resolver and deliberate migration
  therefore address the real model boundary. Verify SQL null semantics, kind/run
  composite FKs, preserved Google uniqueness and runtime/issuer grant separation
  in the later plan/SQL review.
- Lines103–119 define an independent opaque-session transport, current DB reads,
  conflicting-cookie rejection and revocation, including mutation decision-time
  rechecks. Lines147–155 expressly amend the menu guard instead of skipping its
  raw-token binding (`lib/menu/http.ts:22–29`). These are suitable Design choices;
  implementation must carry them through every store/delegation path. Global
  operator/background plan-generation scans must explicitly exclude synthetic
  families unless a live, approved run scope authorizes that exact work; expiry
  must not leave households eligible for unrelated provider jobs.
- Lines123–139 bind source/profile/target and describe trusted-administrator
  assumptions rather than claiming cryptographic platform attestation. Preview
  settings alone must not override the Production denial. Clarify in the plan
  which metadata is known at build versus runtime: do not require an unavailable
  deployment ID in an immutable build manifest or substitute a missing value.
  Bind build-known source/profile to trusted runtime deployment identity and the
  issuer's checked deployment record; missing evidence must remain fail-closed.
- Lines28–69 correctly keep operator database authority out of the browser, bound
  bearer-secret expiry/use and require Origin/nonce plus strict form parsing.
  The spec honestly states theft-before-redemption risk. The private handoff
  channel remains an operational prerequisite, not permission to put credentials
  in chat, command arguments or public browser transcripts.
- Lines159–180 gate hosted data/grants/ingress separately and explicitly leave
  Shareable Link compatibility, cookie scope and exact deployment pinning
  unproven. Blocking hosted readiness on those checks is appropriate; lack of
  present platform proof is not a second Design blocker.
- Lines184–204 preserve synthetic/Google/provider/platform proof distinctions,
  deny excluded synthetic flows server-side and name supported browser gaps.
  Synthetic success must not satisfy the existing real-Google finalize flags.

This review does not approve migration execution, hosted configuration or a
release. After the dispatch/deadline correction, independent peer and owner
Design consideration can proceed with the listed implementation/operational
proof obligations preserved.
