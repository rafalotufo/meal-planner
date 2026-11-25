# Agent deployment verification — implementation-plan security review 001

- Reviewer: security-researcher; date: 2026-11-25
- Reviewed source: plan commit `3d7e5fc` (including refinements from `9ce5ca7`)
- Verdict: No blocking findings; approved for owner plan consideration.
- Scope: Plan against approved spec and security recheck002. No code, SQL,
  runtime, remote connection or hosted-readiness approval is implied.

## Evidence-backed assessment

- **Real deadline and rollback:** `plan.md:81–90` explicitly covers pool acquisition,
  advisory lock, statements and commit with one deadline, server-side timeouts,
  actual cancellation/connection cleanup, delayed row observations and pool/lock
  recovery. It rejects response-only races and stops for design correction if the
  driver cannot satisfy the contract. This addresses current transaction defaults
  (`lib/db/connection.ts:51–66`), which alone do not provide that request deadline.
  Lines127–140 and184–194 retain the exact direct-handler exemption, equivalent
  guards and real unfinished-body/trickle tests from the approved correction.
- **Relational and privilege preservation:** lines46–79,205–222 assign reviewed
  UUID migration/dependencies, immutable history, catalog profiles, explicit NULL
  branch checks, nondeferrable kind/run/member FKs and Google uniqueness proof.
  Broad runtime table grants are explicitly removed before column grants, since
  the existing grant applicator adds privileges (`lib/db/security.ts:67–73`).
  Runtime cannot choose synthetic setup columns or retag rows; issuer setup,
  run mutation and cleanup remain operator-owned. Effective denied-grant tests
  and independent SQL review are assigned before broader use.
- **Admission and credential identity:** lines66–75 preserve typed Google-only
  identity and validate malformed allowlists on every new admission path. This
  retains the current validation-even-with-grant behavior in
  `lib/identity-access.ts:41–45`. Lines113–121,142–160 require current raw synthetic
  credential proof, cookie-conflict rejection, transaction-time admission and
  Google-only effects. Existing menu JWE/token/subject/email checks
  (`lib/menu/http.ts:20–30`) are expressly retained for Google, with independent
  verification binding rather than a shared-reader shortcut.
- **Target and fixture separation:** lines33–44,184–194 require disabled normal/
  Production manifests, independently checked runtime target/run binding and
  test-process-only Preview-like fixtures, with no hosted-selectable TEST flag,
  imported production fixture or spoofed-header substitute. Packaged runtime
  proof is assigned independently of source/issuer/migration tooling.
- **Operator and secret handoff:** lines17–23,102–111,224–232 specify remote staging
  TLS and target refusal, no implicit migration/deploy, atomic owned issuance,
  scoped revoke/cleanup and secret-free output. Exclusive mode0600 handoff under
  an owner-only directory rejects symlinks/overwrite. The plan acknowledges that
  password fields do not redact tool arguments/traces; private transfer/trace
  handling must be established before real issuance, including a separate
  unresolved mechanism for remote agents. It does not disguise that gap as proof.
- **Background/evidence authority:** lines162–182 exclude synthetic families from
  global generation and require current dedicated scope; synthetic results cannot
  populate real-Google flags. Lines196–201,316–325 retain independent reviews,
  local-only delivery, ingress/pinning readiness and exact hosted/release authority.

## Required follow-through

The assigned negative tests must demonstrate the stated properties, especially
no detached issuance after deadlines, denied effective grants, cross-run/family
rejection, copied-config Production denial and malformed-list fail-closed behavior.
Do not replace those tests with prose or weaken the deadline if a commit outcome
is uncertain; use the planned design-correction stop. Private browser trace and
platform ingress prerequisites remain prerequisites, not performed verification.
Actual source/SQL security review and owner plan approval still precede the
corresponding implementation/hosted actions; this review grants neither release
nor database execution authority.
