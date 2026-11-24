# Weekly meal planning — independent security review

- Reviewer: security-researcher
- Date: 2026-11-24
- Scope: base `17881438e3c68f0099e063e714560682c93bd0fb` through implementation `d7e3734ae69cf594ac17016931f3e92d70d0d079`; working tree clean at assessment.
- Inputs: AGENTS.md, org/protocol.md, org/roles/security-researcher.md, REVIEW.md, approved weekly intent/spec/plan, verification.md, security-and-hardening skill and its available hardening patterns.
- Verdict: **clear**. No material bug, security or compliance findings. No source changes requested. Human merge/release and scheduler activation gates remain separate.

## Threat model

Protected assets are family menu/plan confidentiality, correctness of approvals and finalized history, current admission, and database/provider credentials. Trust boundaries are browser query/body/session → protected route/page; verified identity → current family under the common database lock; persisted menu/suggestion JSON → rendered snapshots; and local account/private worker configuration → privileged scheduler operations. Abuse cases include foreign plan/menu/suggestion IDs, stale or revoked membership, cross-origin writes, forged snapshot/family fields, concurrent acceptance/finalization, unsafe recipe links, malformed storage, repeated worker runs, and credential disclosure on failure.

## Three review passes

**Bugs:** Read generation, calendar, validation, store, HTTP and UI implementation and all planning tests. The worker locks each family's eligibility/week/menu/history decision and preserves existing weeks; final recency is bounded to eight prior weeks. Store actions recheck membership within the existing locked READ COMMITTED transaction. Plan lookup binds both ID and current family; suggestion resolution binds suggestion to the authorized plan/revision and rechecks the current family's saved recipe. Concurrent acceptance cannot reapply a swap. Accepted content increments revision, deletes approvals and closes other pending suggestions. Final and past drafts reject writes; finalization closes pending input atomically. Stored snapshots survive menu deletion and are validated before rendering. No material finding.

**Security:** `/plans` and every exported API method require current session/family access. Existing Proxy coverage retains canonical Host, cryptographic session/admission checks and private/security headers, including protected405; public policy and Proxy are unchanged. POST additionally uses canonical same-origin JSON, the existing4096-byte reader, strict action keys, bounded revisions/day and UUID parsing; callers cannot supply family, user, week or recipe content. All new application SQL binds values. Secondary ID-only updates follow an authorized family-scoped selection inside the same global lock. Plan props omit family/subject/email/allowlist data. Recipe titles use React text; links reuse validated HTTPS menu URLs and opener/referrer protection; the feature performs no new server URL fetch or provider call. Worker authority is possession of the existing restricted runtime credential/local account, with validated allowlist, locked eligibility and generic failures/aggregate-only output. No public scheduler or test identity/clock bypass was introduced. No material finding.

**Compliance:** Explicit SQL0002, journal, runtime metadata, catalog and grant changes match the approved persistence design; SQL hash matches runtime metadata. Weekly DELETE/TRUNCATE/DDL and migration-history writes are not granted. Old SQL migration evidence is preserved. New dependencies, lockfile changes, auth-policy/Proxy/vercel changes, hosted migrations, job installation and release effects are absent from this diff. The template/runbook clearly retain separate activation authority, owner-only configuration, Toronto timing, missed-day limitation and immutable planned-history semantics. Existing user IDs provide feedback attribution without duplicating email or collecting a new sensitive category. No material finding.

## Independent evidence

- `node --import tsx --test tests/plans/calendar.test.ts tests/plans/validation.test.ts`: exit0,4 passed.
- `node --import tsx --test tests/plans/store.test.ts tests/plans/generate.test.ts`: initial sandbox run blocked5 database tests with localhost EPERM (2 CLI tests passed). Repeated with approved localhost access: exit0,7 passed. Owned random test databases only; cleanup completed. Covers family isolation, denied/revoked grants, malformed storage, pending cap, concurrent actions/workers, recency, snapshot retention and CLI redaction/off-day behavior.
- `shasum -a 256 drizzle/postgresql/0002_weekly_meal_planning.sql`: `f6a77d005618de16b22350df733f35674fc301ef638aa087ae5654efbfea035b`, identical to committed runtime metadata.
- `git diff --check 17881438e3c68f0099e063e714560682c93bd0fb`: exit0.
- `python3 scripts/scan_secrets.py --staged`: exit0,0 findings; staged diff was empty during this review. Source/diff assessment found no newly committed credentials.
- Reviewed developer/orchestrator evidence for lint/typecheck/build,212 Node tests,7 Python tests and real Chrome320/1440 physical interaction/screenshots in verification.md. Those full suites/browser checks were not repeated by this reviewer.

## Limits

This is a bounded feature assessment, not a fresh audit of unchanged dependencies or existing authentication infrastructure. No dependency or lockfile changed and no release was performed; a new native advisory audit was not run. The skill's separately referenced shared security-checklist.md is absent from the installed skill tree; its embedded checklist and available hardening patterns were applied. Existing Proxy request buffering remains as explicitly required by the approved design; this review does not claim a new end-to-end request deadline. No development/hosted data or schema, production service, scheduler or deployment was changed.
