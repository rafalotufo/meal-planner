# Shared site layout — independent security review

- Reviewer: security-researcher
- Date: 2026-11-24
- Verdict: Approved / security clear; no blocking findings
- Scope: working tree and new helpers against baseline `d1b11652abb5cf59d2b0ddce2b2b01d02480b8fc`; approved feature intent/spec/plan and verification evidence.

## Boundaries and evidence

Assets are existing verified identity, family data, invitation tokens and provider
credentials/budget. Relevant abuse cases are anonymous or pending users gaining
family access through the common shell, public rendering causing protected reads,
or private data/configuration leaking into a shared client boundary.

- `app/layout.tsx:1`–`29` remains a server component with static metadata,
  presentation and children. It imports no identity/session/database/configuration
  code and performs no request read or effect. All three fixed same-origin header
  destinations explicitly use `prefetch={false}` (`17`, `19`, `20`), with no
  external URL, token, identity or user-controlled HTML in the shared header.
- `app/family/page.tsx:8`–`10` retains family/session validation before summary
  reads. Home retains its family guard; onboarding session/context decisions,
  sign-out cryptographic-session recovery and public invite dynamic rendering
  are unchanged. Family and account client diffs change only presentation;
  request methods/bodies/handlers, disabled controls and feedback roles remain.
- Exact diff for `lib/`, `app/api/`, `proxy.ts`, manifests/lockfile and deployment
  configuration is empty. This change introduces no auth bypass, endpoint,
  schema/query, new data collection, secret source, provider effect or dependency.
  Existing React text rendering continues to escape family/recipient strings.
- `tests/auth/shared-layout.test.ts:27`–`55` checks public rendering with an
  unreachable database, anonymous protected redirects and authenticated shells.
  The browser helper checks anonymous/pending guarded navigation and absence of
  eager protected requests, without claiming the layout itself authorizes access.
- New helpers reuse test-only Google transport and the existing isolated-server
  infrastructure: `tests/auth/server.ts` forces empty paid keys, while
  `tests/family/database.ts` restricts test connections to loopback `mp_test` and
  random owned databases. Application code does not import the new helpers.
- `tests/auth/shared-layout-browser.ts:84`–`100` installs diagnostic fetch
  observation only in the isolated browser, returns every original response,
  requires exactly the expected missing-context400 at `/api/invitation-context`,
  and removes future-document instrumentation. It neither fabricates success nor
  suppresses additional console/network errors. Scroll and keyboard helper edits
  retain real browser events and original assertions.

## Verification and limits

Independently ran `git diff --check` successfully and the repository secret scanner
against application code, both new helpers and the feature artifacts: zero findings.
Reviewed the recorded164 Node case outcomes,7 Python tests, lint/typecheck/build and
three Chrome helper results without rerunning unchanged full suites. Browser and
Google proof remains local fixture evidence; this review authorizes no live login,
paid request, deployment, migration, merge or release. No dependency change or
release is present, so no new dependency-audit claim is made.

The skill's referenced shared `security-checklist.md` is absent from its prescribed
location and local skill roots; the available skill's threat model/control checklist
was applied directly to this bounded presentation diff. No unresolved security
finding or new privilege/secret requirement remains. Human merge/release gates
remain separate.
