---
artifact: intent/authenticated-access/spec.md + intent/authenticated-access/plan.md
reviewer: reviewer
verdict: approved
round: 1
---

# Independent TypeScript consistency amendment review

## Verdict

Approved the narrow specification/plan amendment implementing the owner's
TypeScript requirement for the eligibility matcher and all new application
tests/helpers. This is design/plan approval; final runtime/browser evidence
and independent code/security verdicts remain pending.

## Evidence

- `lib/google-access.ts` retains exact membership and malformed-policy behavior
  with explicit `unknown` inputs, `string[]` validation output and boolean
  eligibility output. No policy normalization or authorization semantics change.
- The manifest covers `tests/auth/*.ts` and `tests/auth/package.json`. All auth
  tests, server/flow helpers, provider-network fixture and Chrome harness use
  TypeScript. The nested package declares only `type: module`; application
  package module mode is unchanged.
- Exact stable `tsx@4.23.15`, already permitted by the approved specification,
  is now a direct development dependency. `test:auth` uses
  `node --import tsx --test tests/auth/*.test.ts`. The isolated child server
  loads tsx before its TypeScript provider-network fixture. The optional Chrome
  command uses the same loader; production does not import either fixture.
- Existing `tsconfig.json` inclusion `**/*.ts` covers the tests and helpers.
  `allowImportingTsExtensions: true` permits their explicit `.ts` imports while
  `noEmit: true`, `strict: true` and `skipLibCheck: false` remain unchanged.
  Node/React and narrowly selected `bun-types/sqlite` ambient declarations remain.
- AGENTS.md and CLAUDE.md now record the user's requirement: new application
  tests and helpers use TypeScript and remain in strict typechecking. Existing
  Python workflow regression tests are preserved.
- Reviewed source uses concrete types/unknown at test transport boundaries;
  no explicit `any`, diagnostic suppression, ESLint suppression or test
  exclusion was introduced. `git diff --check` passed.

## Limits

The existing isolated proxy-guard mutation experiment remains applicable
because this amendment changes language/type loading, not that guard's policy.
The delivered TypeScript suite and Chrome harness still require their normal
final passing runs. This approval does not waive those checks or authorize
merge, deployment, release, production test hooks, or weaker compiler settings.
