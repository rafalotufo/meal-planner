# Recipe search integration verification

Date: 2026-11-23. User authority: `org/messages/ceo-0006.md` ("merge to main").
Sources: recipe tip `1b71017daeb9fd31a8f2482820e0f49588bd0ed4`,
main `d5f158310e1d91e3a51c97c5887ca3906e9f773d`.

## Integration

Main independently acquired allowed-Google authentication and pinned pnpm.
Resolved the home-page conflict by composing `requirePageSession()` with the
existing recipe form. Recipe POST independently checks `readSession` before
body/provider effects, returning private/no-store401/503 on denial/failure.
The middleware's image CSP permits HTTPS publisher photos; all other directives
and direct-source no-referrer rendering remain unchanged. Provider/photo logic
is unchanged from the independently reviewed recipe tip.

Keep exact pnpm10.33.0 and all main dependency versions. Generated pnpm lock adds
only the eight previously approved photo packages, without existing pin changes.
Retained strict lifecycle allow/deny rules; removed the superseded npm lock.
Merged both test commands and root guidance. Historical evidence is unchanged.
Both original audit histories are archived byte-for-byte with verified hashes at
`org/merge/recipe-search-main-2026-11-23/`; main's canonical ledger is preserved
and extended with provenance-backed imported approvals.

## Actual checks

Runtime: Node24.15.0, pnpm10.33.0.

| Command | Exit | Output |
| --- | --- | --- |
| `pnpm install --frozen-lockfile` |0| Lockfile up to date; clean dependency directory recreated,401 packages installed under existing reviewed lifecycle policy. |
| `pnpm test` |0| tests57, pass57, fail0, skipped0 |
| `python3 -m unittest discover -s tests` |0| Ran7 tests; OK |
| `pnpm run lint` |0| eslint . --max-warnings0 |
| `pnpm run typecheck` |0| Next route types generated; tsc --noEmit passed |
| `pnpm run build` |0| Production webpack build compiled; TypeScript passed; dynamic home/auth/session/recipe routes and proxy emitted |
| `pnpm run test:auth` |0| tests12, pass12, fail0, skipped0 |
| `node --import tsx tests/auth/browser.ts` |0| real isolated Chrome,320/1440, form/photo/keyboard/logout/OAuth-button checks; no overflow, console or network errors |
| `python3 scripts/scan_secrets.py --staged` |0| 0 findings |
| `python3 scripts/check_plan_sync.py --hook` |0| no violations |
| `git diff --check` |0| no whitespace errors |

Regression sensitivity: first combined production build retained main's restrictive
image CSP. New auth test failed at the expected `img-src` HTTPS assertion
(11pass/1fail). Adding only HTTPS to img-src and rebuilding produced12/12pass.
Authentication tests verify anonymous direct/spoofed recipe requests401, eligible
sessions reach input validation400 without paid LLM calls, and forged/expired/
removed-member/unverified sessions cannot search. Independent route mutation
probe and review: `recipe-merge-review-001.md`.

One initial sandbox dependency installation could not resolve the registry;
installation completed with approved network access. A concurrent lint invocation
then encountered missing eslint during dependency-directory recreation; final
frozen installation and lint both completed successfully. No checks suppressed.

## Browser evidence and limits

Google token/JWKS responses use the existing test-process-only transport fixture.
Recipe response is intercepted in the browser; no production fixture or LLM call.
Photo is a real500x500 HTTPS publisher image. Inspected screenshots at320/1440
confirm loaded food photograph, readable form/cards and no horizontal overflow.
Sign-in, keyboard button, logout and subsequent anonymous redirect also pass.

- `recipe-integration-results-320.png`
- `recipe-integration-results-1440.png`
- `recipe-integration-sign-in-320.png`
- `recipe-integration-sign-in-1440.png`

These checks do not claim a live Google consent or paid LLM round trip. Prior
recipe-search live provider evidence and three-publisher photo evidence remain
in their original reports. Existing auth advisory deferral remains documented
in its security review. This operation authorizes local merge only; production
release remains not_started with no release-authorization record.


## Concurrent main audit follow-up

After integration verification, main advanced from `d5f1583` to `305b14aa6a31c35f22f2b428484362d93e12dbae`.
The exact delta contains only five audit files: memory context/events,
authenticated-access merge-verification, org status, and workflow graph.
No application, configuration, dependency, or test source changed.
The follow-up source files are preserved byte-exact with SHA-256 manifest at
`org/merge/recipe-search-main-2026-11-23/main-followup/`. Its new auth merge decision is imported under a fresh canonical
memory ID, preserving both originals. The authenticated-access merged graph
is archived separately; the active recipe-photo graph remains `in_review`
until the requested main merge actually succeeds. Existing code validation
and independent integration review therefore cover the unchanged source.
