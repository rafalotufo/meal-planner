# Independent code review checkpoint — family membership

Date: 2026-11-23. Feature and verification matrix are still in progress.
This checkpoint is not final code approval.

## Scope inspected

Applied the code-review-and-quality workflow and repository reviewer role.
Read current TypeScript tests first, then native connection/migration code,
identity admission, provisioning and invitation transactions, session/auth
helpers, proxy, handlers and family/onboarding/invitation UI against the accepted
intent, approved specification/plan and independently approved storage amendment.
The native/first-login foundation is committed at `e2d09f3`; invitation/UI and
attack-matrix changes were still being written during this checkpoint.

## Observations communicated to the developer

- **Required — development invitation capture must survive effect replay.**
  At inspection time, `app/invite/invite-context.tsx:8` captured the fragment
  inside an effect and `:9` immediately removed it; cleanup at `:14` suppressed
  the first response's navigation. Development StrictMode's setup/cleanup/setup
  replay therefore makes the second request use an empty token and display an
  unavailable error. The developer acknowledged this and is preparing dev-browser
  reproduction and an idempotent capture fix. Final review must verify the fix;
  this checkpoint does not claim a browser reproduction already occurred.
- **New red lifecycle test caught the expected acceptance boundary issue.**
  `tests/family/acceptance.test.ts:39` expected generic `409` for expiry after
  login but observed `401` from the existing admission-aware proxy. The developer
  independently confirmed the result and is changing only exact POST acceptance
  to a cryptographic-session guard, retaining current admission and bound-token
  checks within its immediate transaction. Final review must inspect and rerun
  that fix; no acceptance authority is inferred from cookie possession alone.

The security reviewer owns the independently reported database public-path
finding and its regression proof; it is not duplicated as a new finding here.
The remaining attack/race/browser matrix and operating docs are acknowledged
unfinished work, not presumed passing evidence.

## Actual independent checks

- Initial sandboxed HTTP run failed to bind loopback (`listen EPERM`); this was
  an environment restriction, not an application result. The authorized rerun
  used the developer's coordinated stable build window.
- `pnpm run test:auth`: 11 passed, 0 failed.
- `pnpm run test:family`: 13 passed, 1 failed (the new expired-acceptance
  `401 !== 409` assertion above). Tests added during this window explain why
  this count exceeds the developer's earlier family-11 checkpoint.
- Test meaningfulness mutation: made temporary copies of
  `lib/identity-access.ts` and the existing identity test under
  `/tmp/family-review-mutation-5eopwqge/`; changed only the member eligibility
  expression to permit membership without grant/allowlist. Running that copied
  test exited 1 at `membership alone grants no eligibility`. The unchanged
  repository test then passed with exit 0. No application or repository test
  file was mutated, deleted or suppressed for this experiment.
- `git diff --check`: exit 0.

No application edits, builds, dependency mutations, workflow state, messages or
approval records were made by this reviewer. HTTP suite runs are paused pending
the developer's next coordinated rebuilt snapshot. Full final command/browser
evidence, fixed-delta review and a final independently reviewed commit are still
required before final code approval. Human merge/release gates remain intact.
