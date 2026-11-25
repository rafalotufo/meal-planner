# Agent deployment verification — implementation plan

- Author: senior-developer; date: 2026-11-25
- Status: Approved
- Owner approval: Rafael, active chat on 2026-11-25; gate agent-verification-plan-2026-11-25
- Inputs: approved sibling `spec.md`, gate `agent-verification-spec-2026-11-25`, security recheck002 and specification peer review001.
- Plan reviews: `org/reviews/agent-deployment-verification-plan-security-001.md` and `org/reviews/agent-deployment-verification-plan-001.md`.
- Scope: approved local implementation only; shared/hosted execution and release remain separately gated. This checklist is the single task list for the feature.

## Delivery and authority

Build the approved staging-only synthetic-member path through ordinary form entry,
with operator-issued five-minute capabilities, revocable fifteen-minute sessions
and thirty-minute runs. Preserve Google Better Auth, current family admission,
provider safeguards and exact-source release gates. No new dependencies are planned.
The proposed form is `https://meal-planner-staging-rafalotufos.vercel.app/verification`;
it is not implemented or deployed by this plan.

After plan approval, implementation and experiments use only owned random local
`mp_test_*` databases and test-process servers with empty paid keys. No shared
local database migration/reset, remote connection, hosted migration/grant/seed,
credential issuance, platform change, paid request, deployment or promotion is
implied. Those actions require separate exact-target authority after local proof.
The local operator CLI will eventually connect to the approved remote staging DB
with verified TLS and change its data; it never deploys application code.

## Implementation refinements

- Native migration loader requires an exact UUID filename, so the implementation
  uses `fe5c2ee0-bf7f-464e-93be-2d654b4001e8.sql` instead of the descriptive suffix
  placeholder. Identity/dependencies/scope are unchanged; no validator is relaxed.

- The generic deadline transaction primitive (slice5) is proved in parallel with
  schema work because its rollback/lock tests do not depend on verification tables.
  Exchange integration still requires the schema and typed-admission checkpoints.

## Implementation order and task checklist

Write each slice's meaningful strict TypeScript regression first, record its
failing output, implement the slice, and record the passing command. Keep later
feature entry disabled until its dependencies are complete. Tests and existing
Google behavior must remain usable at each checkpoint. Slices target at most
five implementation/test files; metadata updates form their own adjacent slice.

1. [ ] **Bind the build and runtime target** (depends: none).
   Add `lib/verification/target.ts`, `scripts/build-verification-manifest.ts` and
   `tests/verification/target.test.ts`; wire package scripts and ignore the
   generated `.verification/build-manifest.json`. Generate a disabled manifest
   for normal/dev/Production builds; enabled generation requires explicit trusted
   Preview source/profile/project/origin inputs. Runtime separately checks exact
   deployment identity and DB target against the run. Missing metadata denies;
   never substitute alias, placeholder, client header or a test environment flag.
   Verify copied Preview settings on Production, absent/changed source/profile,
   wrong origin/project/DB and moved alias. Keep the generated manifest server-only
   and trace it into packaged output; generate before dev/typecheck/build so static
   imports exist without a runtime generator or secrets in builds.

2. [ ] **Prove the relational migration** (depends:1).
   Add one UUIDv4-named `drizzle/postgresql/fe5c2ee0-bf7f-464e-93be-2d654b4001e8.sql`, and strict
   `tests/verification/migration.test.ts` plus fixture support. Its descriptor
   depends on the current0003 and0004 terminal UUIDs, transitively requiring all
   five historical migrations; no new sequential identity or independence claim.
   Preserve historical SQL/journal/hashes and ledger rows. Verify upgrade from
   the current catalog with existing Google members/menu/plans, atomic rollback,
   repeat/concurrent migration, and old-artifact rejection on the new catalog.
   Run only on restricted-role owned disposable databases, never development.

3. [ ] **Review catalog and effective privileges** (depends:2).
   Update `drizzle/postgresql/compatibility.json`, its final catalog profile and
   `lib/db/security.ts` only as needed for supported column grants; add focused
   `tests/migrations/security.test.ts` cases. Do not append the native migration
   to the legacy Drizzle journal or rewrite `runtime-migrations.json` history.
   Verify native ledger metadata/prebuild checks, exact pre/final profiles and
   denied privilege drift. No new function, trigger, RLS, deferrable-FK or global
   validator exception is planned. Obtain independent SQL/security review before
   using the migration outside disposable fixtures.

4. [ ] **Represent actual member kinds** (depends:2–3).
   Update `lib/db/schema.ts`, `lib/identity-access.ts` and add
   `tests/verification/identity.test.ts`. Use strict Google/verification row and
   principal discriminants, not a generally nullable Google identity. Existing
   Google lookup/admission remains Google-only; the central member resolver
   derives verification family/member from current live run records. Validate
   the Google allowlist before **all** admission, including synthetic direct
   exchange and resolver paths: malformed configuration fails closed, even when
   a grant/run exists. Test null/check/FK failures, forged member IDs, cross-run
   access, expired scope and unchanged pending-invite/Google admission behavior.

- [ ] **Checkpoint A:** migration/security/identity focused tests pass; existing
  family storage/admission tests pass and typecheck remains strict. Review the
  schema/grant artifacts before building the exchange on them.

5. [ ] **Bound verification database work** (depends:3–4).
   Add a narrowly named deadline-aware transaction entry in
   `lib/db/connection.ts` and tests in `tests/verification/deadline.test.ts`.
   Preserve existing transaction callers/defaults. Bound pool acquisition,
   advisory-lock wait, statement execution and commit using one absolute deadline;
   use transaction-local server timeouts shorter than remaining request time.
   Cancellation must destroy/release the owned connection and roll back pending
   work; a response-only Promise.race is insufficient. Observe after timeout that
   capability/session rows never appear later, pools recover and no lock remains.
   If the pinned driver cannot prove this contract, stop for design correction.

6. [ ] **Exchange capabilities and read revocable sessions** (depends:4–5).
   Add `lib/verification/store.ts`, `lib/verification/cookies.ts` and
   `tests/verification/session.test.ts`. Use CSPRNG256-bit secrets and SHA256
   digests, five-minute capability/nonce limits, fixed fifteen-minute session
   lifetime capped by thirty-minute run. One advisory-locked READ COMMITTED
   exchange consumes one digest and inserts one session atomically. Shared
   deployment/run throttle buckets enforce100/10 attempts per five minutes.
   Test simultaneous redemption, digest collision handling, expiry, replay,
   revoked member/run, storage failures, cookie conflicts and actual rollback.

7. [ ] **Deliver operator issue/revoke/cleanup CLI** (depends:1–6).
   Add `scripts/verification-access.ts`, `lib/verification/operator.ts` and
   `tests/verification/operator.test.ts`. Read operator connection credentials
   only from private environment/config, validate recorded Preview target and
   independently inspected deployment/source/profile, and refuse Production.
   Use explicit subcommands and scope input; never auto-migrate, grant or deploy.
   Issue one family/run/member set atomically; support two members only when
   collaboration scope requests it. Revoke the run before ownership-checked
   cleanup in FK order; reject mixed-family records or unexpected row counts.
   Preserve sanitized counts/evidence and no secret-bearing stdout/errors.

8. [ ] **Integrate typed shared sessions and logout** (depends:4,6).
   Update `lib/session.ts`, `lib/family.ts`, auth logout route and
   `tests/verification/admission.test.ts`. Retain current Google cryptographic
   identity and callback-only email update; add independent raw verification
   credential proof with current target/run/member admission on every read.
   Reject duplicate/conflicting Google+verification credentials. Derive family
   context server-side and recheck current run within mutation transactions.
   Logout revokes the current verification session before clearing cookies;
   invalid/expired cookies may be cleared without restoring lost admission.

- [ ] **Checkpoint B:** operator lifecycle/session/deadline tests pass against
  owned local fixtures; existing Google HTTP/session tests pass. No public entry
  is enabled yet. Independently review deadline cancellation and issuer secrecy.

9. [ ] **Expose the guarded browser entry** (depends:1,5–8).
   Add `app/verification/page.tsx`, exact session API route,
   `lib/verification/http.ts`, `tests/verification/http.test.ts`, and the exact
   Proxy matcher/entry amendment. If five-file sizing is exceeded, split matcher
   tests/patch into a follow-up commit before enabling the entry.
   GET/HEAD entry uses Proxy and makes no provisioning/consumption effect; render
   a native accessible form with password input, runId and hidden nonce.
   Exact API shape bypasses Proxy for all methods and supplies equivalent
   Host/target/private/security headers; lookalikes retain Proxy protection.
   POST enforces exact Origin/fetch metadata/content type, strict2KiB form,
   duplicate/unknown-field rejection, nonce and shared throttles. Handler-entry
   five-second deadline includes body/storage work and produces408 without EOF.
   Assert401/400/403/404/405/408/421/429/503 behavior, Allow and headers; no trust
   in forwarded identity. Success303 goes only to canonical `/`.

10. [ ] **Preserve menu authority for both principal kinds** (depends:8–9).
    Update `lib/menu/http.ts`, `lib/menu/store.ts`, menu API route and
    `tests/verification/menu.test.ts`. Google retains raw JWE expiry/current
    token/subject/email binding. Verification independently matches raw cookie
    digest/current token/principal with the shared reader before family checks.
    Permit only approved snapshot save/list/lookup/remove; deny synthetic URL
    import/retry/delegation before task creation or paid work, including stores.
    Test direct methods/405, cross-family IDs, removed session/run and unfinished
    menu bodies. Preserve existing exact-menu exemption and all Google assertions.

11. [ ] **Cover family summary and explicit denied flows** (depends:8).
    Update `lib/family-store.ts`, family page/controls and
    `tests/verification/family.test.ts`. Display derived synthetic member labels,
    never a fake verified email; retain strict Google displays. Narrow Google-only
    provisioning/invitation helpers and their call sites so direct API calls with
    synthetic sessions receive403 without membership/invitation effects.
    Keep `lib/invitations.ts` explicitly Google-only. Split route/helper call-site
    changes into small commits if necessary; enumerate
    them in evidence. UI controls may reflect denied scope but cannot enforce it.

12. [ ] **Support plans without broadening background eligibility** (depends:10).
    Update `lib/plans/store.ts`, `lib/plans/generate.ts`, operator scoped generation
    adapter and `tests/verification/plans.test.ts`. Use the central typed resolver
    for read/approve/suggest actions and current transaction admission. Seed a
    reviewed plan/menu fixture or run explicitly scoped generation for that live
    synthetic family. Global scheduler always excludes synthetic families; only
    dedicated scope may include one current run. Test expired/revoked runs,
    unrelated-family scans, two-member collaboration and unchanged Google plans.

- [ ] **Checkpoint C:** Google plus synthetic admission/menu/family/plans suites,
  lint/typecheck/build pass. Prove malformed allowlists deny all new entry/read
  paths. Independent security review covers every route/store/delegation path.

13. [ ] **Make staging evidence truthful** (depends:9–12).
    Update `tests/deployment/staging.ts`, its tests and active staging/release
    runbooks. Introduce explicit synthetic-app proof separately from real Google
    allowed/denied callbacks, local fixtures, providers and platform bypass.
    Preserve existing real-Google evidence/assertions; synthetic runs cannot fill
    those flags or silently pass the old finalize contract. Each new result binds
    run/member labels, exact source/deployment/profile, versions and actual gaps.
    Keep Google evidence or explicit owner release-gap acceptance separately gated.

14. [ ] **Exercise ordinary-browser and packaged behavior** (depends:13).
    Add strict `tests/verification/server.ts`, `browser.ts` and packaged tests.
    Fixtures own random DB/server/profile and force empty paid keys. Use test-
    process-only platform/build fixtures with isolated Preview-like builds and
    loopback HTTPS; no runtime TEST flag, auth bypass or fixture production import.
    Browser uses the actual issuer handoff/form and server-set cookie, never cookie
    injection. Record stable Chrome/Firefox/Safari versions at390/1440, keyboard
    flow/logout/fresh entry, console/network evidence; unavailable tools are gaps.
    Raw HTTP no-EOF/trickle/oversize tests must reach the real pinned server and
    verify deadline response plus delayed DB/pool observations. Packaged runtime
    works without issuer, tests, migration SQL or source tooling.

15. [ ] **Finalize local delivery** (depends:14).
    Update README, active AGENTS policy amendment and feature evidence/runbook;
    complete commands below and independent code/security review. Fix findings,
    repeat affected checks and record exact source/command exits. Stop at reviewed
    local implementation and human merge/release gates; hosted readiness is not
    claimed from local tests.

## Schema, grants and credential handoff decisions

Migration ordering avoids a cyclic FK: create verification-kind family, then run
with unique family ownership, then members bound by(runId,familyId), then
capability/session records bound to member/run. Composite family-kind FK prevents
mixed Google/verification households. SQL checks must explicitly distinguish NULL
from FALSE: Google rows preserve nonempty subject/normalized email and no run;
verification rows have NULL Google fields/grant and a nonnull valid run. Preserve
Google unique indexes; use nondeferrable FKs and prove invalid permutations fail.

Replace broad runtime INSERT on families/app_users with explicit existing Google
column INSERT grants; withhold identity_kind and verification_run_id, retaining
Google defaults. Restrict app_users UPDATE to verified_email only; remove broad
table INSERT/UPDATE ACLs inside the explicit migration before applying the final
column-grant profile (the existing grant applicator only adds grants). Runtime
cannot create or retag synthetic setup rows. Restrict capability
UPDATE to consumed_at and session UPDATE to revoked_at, permit required SELECT,
session INSERT and bounded throttle DML; run mutation/setup/cleanup remains owner-
operator only. Verify table-level grants do not accidentally override column
restrictions. No runtime owner/CREATE/TEMP/role-membership grants are added.

V1 handoff is a mode0600 file created exclusively at an explicit path under an
owner-only temporary directory, refusing symlinks/overwrite and removing partial
output on failure. Give the local agent the file path and runId, not raw secret
in chat. It reads privately and types the credential into the password field;
remove the file after use/expiry. Password masking does not redact browser-tool
arguments or traces: establish private tool-session/trace handling before real
issuance, and exclude credentials from screenshots/shared transcripts/evidence.
Remote-agent transfer has no approved mechanism yet and remains a separate
readiness prerequisite; do not invent one or expose operator credentials.

## Verification commands and evidence

Use Node24.15.0/pnpm10.33.0 and frozen install; read this worktree's pinned bundled
Next route-handler/cookie/Proxy guides before code. No dependency upgrade or
compiler suppression is authorized. Every application helper/test is TypeScript.

```text
pnpm install --frozen-lockfile
node --import tsx --test tests/verification/*.test.ts
pnpm run test:migrations
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run test:family
pnpm run test:menu
pnpm run test:plans
pnpm run test:auth
pnpm test
node --import tsx --test tests/deployment/*.test.ts
python3 -m unittest discover -s tests
node --import tsx tests/verification/browser.ts
node --import tsx tests/menu/browser.ts
node --import tsx tests/plans/browser.ts
python3 scripts/scan_secrets.py --staged
git diff --check
```

Document any generated inactive dev/types workaround exactly as AGENTS permits.
No browser/application/build passes are claimed by this docs-only plan.

## Files that change

- `intent/agent-deployment-verification/**`
- `lib/verification/**`
- `scripts/build-verification-manifest.ts`
- `scripts/verification-access.ts`
- `lib/db/connection.ts`
- `lib/db/schema.ts`
- `lib/db/security.ts`
- `drizzle/postgresql/fe5c2ee0-bf7f-464e-93be-2d654b4001e8.sql`
- `drizzle/postgresql/compatibility.json`
- `drizzle/postgresql/catalog.json`
- `lib/identity-access.ts`
- `lib/session.ts`
- `lib/family.ts`
- `lib/family-store.ts`
- `lib/invitations.ts`
- `lib/menu/http.ts`
- `lib/menu/store.ts`
- `lib/plans/store.ts`
- `lib/plans/generate.ts`
- `proxy.ts`
- `lib/auth-policy.ts`
- `app/verification/**`
- `app/api/verification/session/route.ts`
- `app/api/auth/[[]...all]/route.ts`
- `app/api/menu/route.ts`
- `app/api/menu/[[]id]/remove/route.ts`
- `app/api/family/**`
- `app/api/invitations/accept/route.ts`
- `app/api/onboarding/provision/route.ts`
- `app/family/**`
- `app/menu/page.tsx`
- `app/menu/menu-controls.tsx`
- `app/plans/page.tsx`
- `app/onboarding/page.tsx`
- `app/sign-out/page.tsx`
- `tests/verification/**`
- `tests/migrations/security.test.ts`
- `tests/migrations/dependency.test.ts`
- `tests/family/**`
- `tests/auth/**`
- `tests/menu/**`
- `tests/plans/**`
- `tests/deployment/**`
- `package.json`
- `.gitignore`
- `README.md`
- `AGENTS.md`
- `intent/vercel-candidate-validation/staging-runbook.md`
- `intent/vercel-deployment/deployment-runbook.md`
- `org/**`
- `workflow-graph.yaml`

## Remaining release prerequisites

Scoped Vercel Shareable Link availability, canonical-origin cookie continuity,
revocation and exact-deployment pinning remain unproven. Under separate hosted
scope, inspect the actual project/plan, serialize alias movement and prove fresh
browser access; block readiness on failure. No project-wide bypass credential or
public protection-removal fallback. Separate release authority must bind exact
SHA/profile, schema/grants, issuer run/data/write/cleanup scope, private credential
handoff and provider budget. Synthetic success does not prove Google OAuth or
live provider success and does not replace Production anonymous health gates.

Implementation refinement: the dependency regression retains its exact preserved-family assertion and adds the new default Google identity_kind column to the expected row. No existing assertion is removed.

Pinned Next refinement: Proxy generates the signed preflight nonce for exact staging GET/HEAD /verification, overwrites the forwarded nonce header and sets its matching HttpOnly cookie; the Server Component only reads the nonce. The sign-out page may render for an expired verification cookie solely to permit clearing/revocation. Neither nonce nor cookie presence grants application admission.
