# Agent deployment verification — specification security recheck 002

- Reviewer: security-researcher; date: 2026-11-25
- Reviewed source: revision `a7f0102`, diff against `19ddae5`
- Prior finding: `org/messages/security-researcher-0032.md`
- Verdict: Approved for independent peer and owner Design consideration.
  The blocking dispatch/deadline conflict is resolved at Design level.
- Scope: Narrow document recheck; no implementation, runtime or hosted proof.

## Resolution evidence

`spec.md:147–154` now requires the exact `/api/verification/session` API shape to
bypass Proxy for all methods, while retaining Proxy for the GET entry page,
lookalike shapes and unrelated routes. It explicitly cites the pinned Next
unfinished-body investigation and preserves existing menu exclusions.

`spec.md:156–170` replaces the removed Proxy protection with a complete direct
handler guard: target/canonical Host, private/security headers, explicit methods,
Origin/fetch metadata/nonce, shared throttles and bounded body handling. The5s
deadline starts at handler entry and bounds body/storage work. The handler must
return408 without waiting for EOF; it cannot start issuance before complete
validated input, nonce and throttle checks. Unsupported methods keep headers and
guards without consuming the body. Forwarded identity headers confer no trust.

`spec.md:229–230` adds the necessary real raw HTTP no-EOF acceptance case for
valid-looking and unknown run prefixes, including no consumed capability,
session or issuance transaction. This is the missing falsifiable proof contract;
it is not recorded as an executed pass.

The revision also addresses the adjacent review obligations: build-known manifest
inputs and runtime deployment binding are separated at lines123–133, without
placeholder/alias substitution; lines192–196 exclude verification families from
global/background work by default and require explicit live run scope for a
specific invocation.

## Remaining implementation and operational obligations

Prove the complete matcher/handler behavior on the pinned runtime, including
unfinished, oversized and trickling bodies, target/method/path variants and
slow/unavailable PostgreSQL. Cancellation must actually bound pending work and
clean up or roll back database operations; merely racing a response must not
leave detached issuance or leaked connections. Test private/security headers on
all outcomes and retain the independent raw-cookie identity checks for menu.

The earlier nonblocking obligations remain: reviewed SQL null/FK/grant contracts,
current mutation admission/revocation, Production copied-config denial, safe
operator credential transfer, scoped ingress/pinning readiness and honest
synthetic-versus-Google evidence. No migration execution, hosted credentials,
data writes, deployment or release is authorized by this security approval.
