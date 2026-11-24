# Isolated staging tooling — verification evidence

Date: 2026-11-24. Scope: local implementation only; no hosted settings,
deployment, Google login, database provisioning or provider request performed.
The app/auth/proxy/dependencies/configuration remain unchanged. The helper and
tests are excluded from CLI uploads by the existing `.vercelignore`.

## Tests-first evidence

`node --import tsx --test tests/deployment/staging.test.ts` first failed with
`MODULE_NOT_FOUND: ./staging.ts` before the implementation existed (exit1).
After the implementation, focused tests passed12/12. A further strict-evidence
test first failed with an assertion `2 !== 1` for a mistyped owner boolean;
strict boolean/status checks were added, producing13/13 passing tests (exit0).

Focused coverage checks target/evidence validation before private input/network,
stale/future/incomplete inspection, anonymous-cookie segregation, exact-host
credentials/no redirect/retry, member/session/family contracts, optional-only
missing-key search, malformed/oversized/private inputs, bounded bodies,
signal-ignoring fetch/body timeouts, premature post evidence, alias/Production
drift, missing owner proof, and actual CLI invalid-target/process-lock behavior.
The child-process test uses the repository's absolute pinned tsx loader so it
exercises the helper from an isolated temporary working directory.

Read relevant installed Next16.4.6 proxy and environment-variable guides before
coding; no framework runtime API or origin behavior was changed.

## Local command results

- `pnpm exec eslint tests/deployment/staging.ts tests/deployment/staging.test.ts --max-warnings 0` — exit0.
- `pnpm run typecheck` — exit0; generated routes and strict TypeScript passed.
- Focused helper suite —13 tests passed, zero failed/skipped/cancelled.
- Orchestrator: frozen install on Node24.15.0/pnpm10.33.0 succeeded.
- Orchestrator: full lint exit0; recipe tests66/66 passed.
- Orchestrator: production build exit0, including runtime metadata and strict TS.
- Orchestrator: deployment suite31/31 passed, including the13 helper tests.
- Orchestrator: authentication suite12/12 passed after build.
- Orchestrator: family suite34/34 and Python workflow suite7/7 passed.
- Total actual application/deployment/auth/family coverage:143 Node tests and
  seven Python tests passed. Plan-sync/staged secret scan and independent final
  security/code results are appended by the orchestrator before final handoff.

Root-owned raw local verification logs stay ignored/owner-only under
`.data/staging-verification/`; no secrets, env values or personal bodies are
included in committed evidence.

## Browser evidence and limits

The orchestrator ran existing isolated real-Chrome fixture QA against the
unchanged application at320/390/768/1024/1440px: no overflow, keyboard/history,
loading/error, logout and mocked Google flow passed. Five intentional fixture
429s occurred, with zero unexpected console/network errors. Real HTTPS publisher
image loaded; zero LLM calls were made. New feature-specific screenshots preserve
390/1440 notebook/loading/error plus1440 sign-in/results views, with historical
screenshots restored unchanged. This is local UI regression evidence, not real
hosted Google, provider grounding, alias configuration or Production validation.

## Hosted prerequisites still unresolved

Actual free alias availability/non-Production classification, effective Preview
auth configuration/client/callback, shared-project paused/protection state and
approved real staging identity/provisioning effects remain operational setup
checks under the runbook. The helper consumes trusted operator snapshots and
owner attestations; it neither authenticates those inputs nor establishes a
live alias mapping by itself. No fabricated final hosted pass is recorded.
