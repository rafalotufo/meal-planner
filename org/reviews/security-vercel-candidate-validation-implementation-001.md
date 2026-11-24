---
artifact: intent/vercel-candidate-validation/verification.md
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: approved
round: 1
source_commit: d61d3a0
---

# Security review — isolated staging implementation

## Verdict

Approved for local implementation handoff, with no blocking security findings.
This reviews the actual helper and operator runbook, not only the earlier
Design. It does not authorize merge, hosted configuration, deployment, real
Google login, provisioning, bypass-secret creation or a Production action.

## Security boundaries checked

- **Target before secrets/effects:** `tests/deployment/staging.ts:44–68` validates
  exact keys, approved team/project, canonical HTTPS origins, separate
  Production targets, source/run identity, completeness and fresh Preview
  evidence. Lines182–194 perform those checks before private input; wrong
  target errors cannot reach fetch or the private callback. Timeouts and mode
  overrides exposed only in the exported test API are validated before effects.
- **Credential confinement:** lines195–218 construct only fixed paths under
  the validated origin, set `redirect: "manual"`, omit member cookies from
  anonymous checks and use the platform bypass only in its dedicated header.
  No redirect is followed, retry or arbitrary-host CLI option exists. Response
  content and exception text do not enter reports. Lines70–75 reject unknown
  private fields, controls and oversized credentials.
- **Bounded transport/input:** lines82–109 and186–229 race fetch, body reads
  and private-input callbacks against aborts even if an injected operation
  ignores AbortSignal. Request/run limits are10s/60s; bodies are1MiB HTML or
  64KiB JSON. CLI stdin has its own10s/24KiB bound at lines273–293. Timers and
  readers are released/cancelled on the normal and error paths.
- **Finalization cannot upgrade contradictory successful evidence:**
  lines232–247 require the exact known check sequence, expected HTTP statuses,
  strict pass/reason fields, a provisional check outcome and sane timestamps.
  Lines249–269 bind same-target pre/post evidence, require post capture after
  HTTP completion, reject drift and require real boolean same-run owner
  assertions. Anonymous-only checks cannot become a full member-validation
  pass. Failed or incomplete reports do not satisfy these requirements.
- **Local serialization and cleanup:** lines295–313 require a private nonsymlink
  `.data` directory, acquire a process lock exclusively and only enter its
  removal `finally` after acquisition. Existing-lock errors do not delete the
  foreign lock. The separate lane lock/run-ID procedure in
  `staging-runbook.md:75–104` covers deploy/alias/login through finalization and
  explicitly requires manual reconciliation rather than stale-lock breaking.
- **Application and operational scope:** no application import or served
  authentication bypass was added. Existing `.vercelignore` excludes the helper,
  tests and documents from uploads. The runbook confines future configuration to
  Preview, excludes Production and migration/reset effects, requires safe alias
  classification and owner-controlled identity/provisioning authority, and
  preserves separate Production deployment checks.

## Adversarial verification

Independently ran:

```text
node --import tsx --test tests/deployment/staging.test.ts
13 passed; 0 failed, skipped or cancelled; exit0
git diff --check
exit0
```

The focused tests exercise wrong-target rejection before private/network calls,
credential segregation, redirects/challenges, bounded response stalls, stale
and contradictory evidence, strict owner boolean/status validation and actual
CLI lock contention. An additional local exported-API probe supplied a
never-resolving private-input callback and20ms run deadline: it returned
inconclusive within one second, made zero fetch calls, and emitted no supplied
private/error content. No application or test source was changed by this review.

The active org state records fresh successful full lint/typecheck/build,
recipe/deployment/auth/family and Python checks; `verification.md` attributes
143 Node tests, seven Python tests and real-Chrome fixture QA to the
orchestrator. This security pass does not mislabel those fixtures as live
hosted Google, provider or alias validation.

## Accepted trust limits

Public inspection files and owner assertions are deliberately trusted operator
input (`staging-runbook.md:69–73`), not signatures from Vercel or Google.
Validation prevents type/target/time contradictions; it cannot establish that
an operator fabricated no evidence or detect remote move-and-restore between
snapshots. Local locks assume the documented cooperative operator workflow.
Raw Cookie content cannot establish its original hostname; separate staging
secrets, target verification and owner provenance remain required.

Actual alias availability/non-Production classification, effective Preview
credentials, project pause/protection behavior and approved real identity/data
effects still require separately authorized operational verification. The
implementation issues no fabricated hosted pass and performs no deployment,
alias mutation, config write, DB cleanup or paid provider request itself.
