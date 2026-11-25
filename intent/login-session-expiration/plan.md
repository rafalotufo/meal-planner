# Login session expiration — implementation plan

- Author: architect; date: 2026-11-25
- Status: Draft for independent org peer review before code
- Inputs: accepted sibling intent and sibling specification
- Scope: local implementation/verification only; human merge/release gates remain

## Ordered work and checkpoints

1. **Lock the session contract with HTTP regressions.** Extend the existing
   fixture OAuth test to require exactly 30 days for the token/cache cookies,
   outer session JWE and bounded inner expiry. Independently assert account
   cookie/JWE still last one hour. Preserve security assertions and test-only
   short expiry fixtures. Add meaningful no-renewal/legacy-expiry and expired
   outer-versus-inner cases using existing signed-fixture utilities. Verify
   session access without account-data. Record the focused test's failure
   against the existing one-hour implementation before changing production code.
   Files: `tests/auth/oauth.test.ts` (and focused helper only if necessary).
2. **Change the narrow configuration and current documentation.** Define the
   30-day duration in `lib/auth.ts`, apply it to expiresIn/cache maxAge, retain
   both refresh disablements, and explicitly cap account_data maxAge at3600 in
   advanced cookie attributes. Update README and AGENTS current lifetime text,
   including existing-session compatibility and copied-cookie exposure.
   Verification checkpoint: rebuild, rerun the focused test and full auth suite;
   fix failures without relaxing independent expiry/security assertions.
3. **Verify and review.** Complete commands below, inspect desktop/mobile Chrome
   sign-in/authenticated/logout behavior using owned fixtures, and record exact
   output/counts/screenshots/limitations in sibling `verification.md`. Request
   independent security and final code review. Resolve any finding and rerun
   affected checks. Commit verified implementation and review evidence; stop
   before merge, push, staging, hosted operations or release.

The dependency order is tests → minimal runtime change → documentation and
verification → independent reviews. No parallel shared-state edits are needed.
The checklist in this feature folder is the task target per repository artifact
convention; do not create a separate tasks directory.

## Files that change

- `lib/auth.ts`
- `tests/auth/oauth.test.ts`
- `tests/auth/login-expiration-browser.ts`
- `README.md`
- `AGENTS.md`
- `intent/login-session-expiration/**`
- `org/**`
- `workflow-graph.yaml`

The optional focused browser helper is allowed only if the existing broad auth
helper is impractical or would overwrite historical screenshots. It must use
strict TypeScript, owned server/database/profile, empty paid keys and existing
test-process Google transport. No runtime/test bypass or dependency is added.
All workflow graph, bounded-loop and audit mutations use existing scripts and
preserve prior history. Any additional implementation path or design departure
requires a reviewed plan amendment first.

## Verification commands

Use pinned Node24.15.0 and pnpm10.33.0. Run dependency setup only if needed:
`pnpm install --frozen-lockfile`. Before code changes read relevant installed
Next16 documentation for request/cookie behavior; do not assume old APIs.

```text
pnpm run lint
pnpm run typecheck
pnpm run build
node --import tsx --test --test-name-pattern="Google OAuth completes" tests/auth/oauth.test.ts
pnpm run test:auth
pnpm run test:family
pnpm run test:menu
node --import tsx --test --test-concurrency=1 tests/verification/*.test.ts
node --import tsx --test tests/deployment/*.test.ts
python3 -m unittest discover -s tests
node --import tsx tests/auth/browser.ts
python3 scripts/check_plan_sync.py --help
python3 scripts/org_message.py check
python3 scripts/org_loop.py check
python3 scripts/org_memory.py check
python3 scripts/scan_secrets.py --staged
git diff --check
```

Use the plan-sync command's supported hook/PR options with this approved plan;
help alone is not a synchronization check. If the focused browser helper is
needed, substitute its invocation for the broad legacy helper and record why.
Use only restricted-role owned random PostgreSQL test databases. Do not run
development/hosted migrations or touch existing data. Existing tests of provider
tokens and staging15-minute sessions retain their original independent values.

## Risks and completion evidence

The principal risk is retaining copied stateless credentials for up to30days;
current admission rechecks and documented emergency secret rotation remain the
existing mitigations. Other risks are a shorter cache truncating login,
unintentionally extending account/provider data, weak upper-bound-only tests,
and silently renewing older cookies. Exact cookie/JWE/inner expiry checks,
explicit account override, and no-cookie-rewrite assertions address those risks.

Browser QA proves local fixture behavior and unchanged layout, not live Google,
real elapsed30days, Safari/Firefox or hosted operation. The evidence record must
state those limits and distinguish actual passed checks from blocked checks.
Independent review approval plus passing verification completes local scope;
human approval is still required for merge and any later release.
