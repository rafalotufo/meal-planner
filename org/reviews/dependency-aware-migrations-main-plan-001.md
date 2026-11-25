# Dependency-aware migrations — local main integration plan review

- Reviewer: reviewer, independent of plan writer
- Date: 2026-11-24
- Plan source: `08db5ea`; artifact: `intent/dependency-aware-migrations/main-integration.md`
- Pinned feature intake: `4f44838`; pinned main intake: `d26ea59`
- Verdict: **Approved for feature-side integration and combined verification**

The owner separately approved local main merge followed by local rebuild/restart.
The plan correctly makes combined source verification and independent review
prerequisites for that main update, preserves both clean tips and unrelated work,
and stops if the database compatibility check fails. It authorizes no shared
migration, hosted action, push or deployment. An absent owned application may be
started at its existing configured origin; unrelated listeners must not be killed.

Independently inspected the main delta from common base
`0c6a38b36e7652971ac95004df73b9040f878278`: T-Rex implementation and regression
changes, its existing design/review artifacts, authentication browser QA, and the
same unused historical-helper binding removal. No database implementation change
is present. The helper correction matches the feature; keep the exact historical
source snapshot and old SHA/review provenance rather than rewriting them.

The combined contract is concrete: preserve database implementation bytes from
`ef5d85e`, preserve main's T-Rex delta, run required checks and both actual Chrome
menu and authentication/T-Rex helpers, then review the exact combined commit.
The auth helper uses the shared startServer fixture, so exercising it against the
feature's restricted runtime role is necessary integration evidence. Screenshot
runs must preserve existing historical evidence. Use explicit Node24.15.0 and
pnpm10.33.0 for feature verification and main install/build/start; the reported
broken older shell Node installation is not a reason to relax repository checks.

After approval of the exact combined source, the orchestrator may perform only
the owner-authorized local fast-forward and identified application startup,
rechecking main has not advanced and private configuration targets the recorded
loopback database. Compatibility validation stays read-only. Anonymous health is
separate from disposable authenticated browser evidence; no real Google sign-in
or hosted/provider coverage may be inferred. No direct main merge is approved
before the planned combined-source review passes.
