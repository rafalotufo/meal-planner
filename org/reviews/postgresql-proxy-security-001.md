---
artifact: intent/postgresql-persistence/production-release.md
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: approved
round: 1
---

# Independent security review — PostgreSQL proxy packaging correction

Approved the **fs-free runtime metadata correction** for the security peer gate after actual compiled-package GREEN evidence. No Important security finding remains. This is source-review clearance, not authority to unpause, deploy, promote, migrate hosted data, use a paid provider or reuse release permission for the previous source SHA.

## Incident and rejected experiments

The operator reports that the first live PostgreSQL promotion failed closed at authenticated onboarding with503, before any paid search or domain insert, and that the owner-confirmed pause now returns DEPLOYMENT_PAUSED. Read-only database/TLS/catalog/role verification passed. Those live observations are attributed to the operator; this reviewer did not access Production or private browser/credential state.

The original route-only packaging review missed the separate proxy artifact. Ordinary local `next start` in a full checkout and page/API NFT manifests were insufficient deployment evidence. The new regression corrects that verification gap by exercising the actual compiled proxy without source/migration files.

Both the explicit middleware include and literal directory-inventory experiment failed actual Next builds/packaging regression. Neither is approved as a working correction. The second experiment initially also exposed a strict readdir overload error; explicit utf8 passed isolated strict compilation, but its actual proxy packaging still remained RED. All of that evidence is preserved in the diagnosis/plan record. The final source removes the ineffective inventory read and retains no speculative middleware config key.

## Corrected trust boundaries

- **Runtime remains fail-closed:** `lib/db/connection.ts` statically imports the exact committed catalog and validated runtime migration metadata. It no longer imports node:fs, node:path or the public Drizzle filesystem loader. `openDatabase` still checks the complete ordered database hash/timestamp history and exact catalog before returning a usable database. Catalog queries still cover columns/defaults/nullability, constraints, indexes, relations/RLS, policies, functions and noninternal triggers. No DDL, schema repair, relaxed TLS or admission-policy change is introduced.
- **Reviewed SQL remains the authority:** `runtime-metadata.ts` accepts only a nonempty list of exactly hash/folderMillis records, lowercase64-character SHA256 hashes and safe strictly increasing nonnegative timestamps. The committed manifest matches the existing unchanged initial SQL hash and journal timestamp. It contains no SQL text, identity, database URL or credential.
- **Source freshness is mandatory before effects:** `repository-migrations.ts` uses the existing public Drizzle loader to obtain fresh SQL hashes/timestamps, validates them and compares the complete ordered list with the committed manifest. `migrateDatabase` calls it before `connectDatabase` and before its transaction/ledger/DDL writes. `verify-runtime-metadata.ts` performs that same no-repair check before Next in `pnpm run build`. `vercel.json` explicitly invokes pnpm run build, and the verifier lives under upload-included lib/db rather than excluded scripts. No manifest regeneration occurs on build/start/request; schema changes require reviewed matching metadata.
- **Authorization and paid-effect boundaries are untouched:** the correction has no implementation diff in proxy, session, verified identity/admission, family/invitation transactions, home, recipe/provider handlers, photo SSRF transport, allowlist values or Vercel policy. Missing or mismatched metadata/schema still denies access; no fallback identity, Host spoof, fixture production user, privileged runtime role or provider call was added.
- **Test isolation is explicit:** the only server-helper API change accepts a working directory for an owned test process. The regression copies real .next output and package metadata to a private temporary directory, links dependencies and asserts lib/drizzle are absent. Existing test-process-only Google transport and a generated local PostgreSQL database then exercise callback, protected onboarding, explicit provision, home and session through the real compiled proxy. Fixtures do not replace storage/auth logic. Test servers still force empty paid credentials, remove migration/test-admin URLs and stop/clean only owned processes/databases/directories.

## Independent GREEN validation

Ran the following against the operator's freshly built isolated export, with the pinned Node24.15.0 binary and only owned local PostgreSQL test databases:

```text
node --import tsx --test tests/deployment/postgres-metadata.test.ts tests/deployment/postgres-packaging.test.ts
5 passed, 0 failed, 0 skipped; exit0
```

The four metadata cases prove fresh-loader agreement, changed SQL denial, changed journal-timestamp denial, and empty/malformed/reordered/stale manifest denial using disposable source copies. The fifth case proves actual compiled callback/onboarding/provision/home/session operation without runtime source/migration directories. The package regression passed in approximately1.35s. An initial command selected an unrelated broken system Node22 installation in the temporary working directory; reran with the required absolute Node24 binary. This was tooling selection, not application verification failure.

Independently inspected the preserved clean-export log: mandatory verifier succeeded before the real Next build, strict build/lint/typecheck passed, auth12/12, family34/34 and deployment smoke12/12 passed. These full-run outcomes are attributed to the operator's recorded commands, while the five cases above were independently executed. Recovery browser log records the fixture notebook/auth flows across mobile/desktop widths with no console/network errors and the production-mode family flow at320/1440; development browser/final evidence remain the operator's responsibility. No private credential or dump contents were read. Diff whitespace check passed.

## Workflow and recovery boundary

README, AGENTS and the deployment runbook now require the compiled-package regression after production builds and document the mandatory SQL/journal/manifest verification split. This records the earlier route-only check failure as a durable workflow lesson. The changed package contract intentionally supersedes the obsolete requirement to ship raw SQL files for runtime reads; it does not weaken database history/catalog checks.

The inspected correction is an uncommitted delta above68e1931. The orchestrator must record the final corrected source SHA and obtain the applicable renewed merge/release/resume records before staging or resuming. Authority for the previous7c651c2 application candidate does not silently cover this source. Preserve the first failed release and both rejected experiments. A successful isolated package is meaningful local recovery proof, not a claim that the paused live deployment is repaired; mandatory live verification remains necessary for a newly authorized corrected artifact.

Only this new security review record was written. No source/user-development file, hosted state, pause setting, credential, paid provider or existing review was changed by this reviewer.

## Final addendum — invitation-cookie document handoff

**Approved the final corrected source, including the invitation handoff amendment.** No new Important security finding. The earlier static-JSON review remains applicable; the following additional source and evidence were checked before restoring final clearance.

Cold-development probes of catalog JSON, migration-only JSON and equivalent checked TypeScript data all reproduced the pending client transition. These results do not establish JSON representation as the root cause. The rejected TypeScript representation is removed and the simpler static JSON runtime design is retained. No framework/JSON-causation claim or unsupported representation workaround is approved.

Inspected `app/invite/invite-context.tsx`: after the existing successful same-origin invitation-cookie POST, `window.location.replace('/sign-in')` replaces the old Next client-router transition. The destination is a constant same-origin path, with no token, query or request-controlled redirect. The captured-fragment ref and history stripping still run before POST/navigation. The response.ok requirement, active-effect cleanup guard, StrictMode replay behavior and generic failure UI are unchanged; only the now-unused router import/dependency is removed. A deliberate fresh document carries the already-set HttpOnly cookie through existing server admission instead of relying on retained client route/cache state. It does not read that cookie in JavaScript, broaden cookie scope, bypass recipient/membership checks, consume an invitation, alter Google verification or trigger a paid provider request.

The invitation-context endpoint and cookie helper are unchanged: bounded same-origin JSON intake, token shape checks, no-store204, HttpOnly/SameSite cookie and Secure/__Host behavior on HTTPS remain. Fragment data is still sent only in the existing POST body, then excluded from navigation and request URLs. The production copied-link test retains the explicit assertion that the fragment secret never appears in server URLs; no browser assertion, timeout, warning check or provider fixture was weakened.

Also inspected the additional catalog freshness comparison in the explicit repository-loader verifier. Fresh catalog JSON is compared with the statically imported reviewed catalog before loader metadata validation and before database connection/write. The runtime remains fs-free; this new read belongs only to explicit migration/build tooling. The stale-catalog disposable-copy case adds fail-closed evidence and introduces no runtime/schema repair.

Independently reran:

```text
node --import tsx --test tests/deployment/postgres-metadata.test.ts
5 passed, 0 failed, 0 skipped; exit0
git diff --check
exit0
```

Read the final completed operator logs: fresh-cache dev-only StrictMode passes unchanged route/hash/error assertions, and final combined family browser passes Production320/1440 plus Development StrictMode without application errors. The final source's frozen install, mandatory verifier/build, lint, strict typecheck, compiled no-source package, all127 Node tests and7 Python tests are GREEN in the recorded final verification. Those full-suite and browser results are attributed to the operator's actual log; this reviewer did not run another browser/build concurrently. Production remains paused and Preview/environment IDs were reported unchanged.

This addendum supplies independent security clearance for the final source correction and document handoff. It does not authorize renewed release/resume or claim live repair. Bind the final reviewed SHA to the applicable fresh merge/release/resume records and complete mandatory live verification under that authority. No hosted mutation, secret-content read, provider call, deployment or user-development edit was performed by this reviewer; only this review addendum was written.
