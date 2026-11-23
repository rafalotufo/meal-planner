---
artifact: intent/family-membership/plan.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved-for-human-review
round: 1
---

# Independent family-membership build-plan review

## Verdict

Approved for human plan review. No blocking bugs, security gaps or scope
mismatches were found in the plan. Human plan approval remains outstanding;
this peer verdict does not authorize implementation or any production action.

## Evidence

- **Dependency and identity feasibility first:**
  `intent/family-membership/plan.md:91` pins the approved SQLite driver/types and
  requires inspecting package contents and reproducible installation. `:92`
  prototypes native transactions/backup and the actual Better Auth HTTP/JWE
  subject mapping before application integration. `:93` stops for reviewed
  amendment on incompatibility rather than substituting unsafe identity or
  suppressing strict checks. This addresses the material pinned-library risk.
- **Meaningful test-first slices:** `intent/family-membership/plan.md:81`
  requires retaining focused failures before behavior changes. Tasks 2–3 group
  schema/migration checks into a green persistence checkpoint; tasks 6–8
  explicitly complete the dependent auth/route/onboarding flow before its green
  checkpoint. Tests target real SQLite constraints and built HTTP boundaries,
  not production bypasses or implementation-mirroring mocks.
- **Database isolation and stable provider identities:**
  `intent/family-membership/plan.md:115` adapts the existing
  `tests/auth/server.ts` harness to own a migrated temporary file per server,
  explicit missing/unmigrated cases, cleanup, and restart using the same
  test-owned file. `:117` separates OAuth from onboarding completion and keeps
  destinations server-controlled. Existing `tests/auth/google-network.ts`
  remains transport-only; `:124` and `:125` cover signed subjects, fresh-email
  updates, stale-cookie non-writes, collisions and expanded eligibility.
- **All guard layers are included:** `intent/family-membership/plan.md:122`
  changes auth/session admission; `:129` covers proxy, protected page/API and
  sign-out page; `:136` covers auth-handler forwarding, callback validation and
  sign-out cookie clearing. The cryptographic-only logout exception at `:131`
  applies at proxy/page/handler and does not permit family data. The final
  implementation is checked through real HTTP at `:132` and `:178`.
- **Invitation ownership and races:** `intent/family-membership/plan.md:155`
  derives family ownership from server context and persists hashes only;
  `:162` keeps the public shell/context POST data-free and recipient-bound;
  `:169` inserts membership, grant and consumption atomically. Separate
  connections/processes exercise acceptance/provisioning/creation races at
  `:145`, `:157` and `:171`. Two-family isolation at `:177` and lifecycle checks
  preserve the accepted no-switching rule and durable invitation eligibility.
- **Manifest and strict TypeScript coverage:**
  `intent/family-membership/plan.md:36` and `:50` correctly escape literal opening
  brackets for the checker's `fnmatch` patterns. The manifest covers described
  schema/meta files, handlers, existing and new TypeScript helpers, scripts,
  docs and runtime adapters. `tests/auth/*.ts` and `tests/family/*.ts` encompass
  the named test/probe helpers. Existing `tsconfig.json` includes repository
  TypeScript files, so the plan does not need to weaken or replace its strict
  settings. No missing implementation file was identified.
- **Verification and gates:** `intent/family-membership/plan.md:187` requires
  real mobile/desktop browser proof; `:199` retains lint, strict typecheck,
  build, auth/family/Python tests, dependency audit and secret scanning. `:206`
  handles the known legacy gate lookup with explicit current-record committed
  verification. `:195` preserves independent code/security review and bounded
  workflow accounting; `:218` excludes production migration, merge, push and
  release authorization.

## Limits

Read the complete plan against the accepted intent, approved specification,
current package/TypeScript setup, plan-sync manifest parser, and existing HTTP
and OAuth helper contracts. Only this review record was written. No application
code, dependencies, migration, plan, messages, workflow state or human gate
records were modified. No install, prototype, build, application tests, browser,
database or live Google flow was run for this document review. Feasibility
proofs remain explicit Build tasks, not passing results claimed here.
