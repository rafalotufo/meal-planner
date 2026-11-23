---
artifact: intent/postgresql-persistence/production-release.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent diagnosis and minimal correction plan — proxy PostgreSQL assets

## Confirmed defect and earlier review gap

The orchestrator reports first-live anonymous access and real Google callback succeeded, then authenticated `/onboarding` failed with proxy503. Read-only Production PostgreSQL TLS, roles, schema, catalog/history verification passed; domain tables remained empty and no paid search ran. Those live observations are attributed to the orchestrator. This reviewer did not access Production, credentials or browser state.

Independently reproduced the packaging discrepancy in local compiled artifacts: `.next/server/middleware.js.nft.json` contains **zero** `drizzle/postgresql` assets; home-page and recipe-search trace manifests contain SQL, journal, catalog and rollback proof. Prior reviews checked page/API assets and missed the separate proxy/middleware bundle. A normal `next start` runs against a complete checkout and cannot alone prove per-function artifact completeness. This is a real gap in earlier packaging verification, not an authentication or schema failure proven by green local HTTP tests.

Read `proxy.ts`, `lib/session.ts` and `lib/db.ts`: public/anonymous requests can finish without opening application storage, while admitted protected requests invoke `readSession → getDatabase → openDatabase`, which reads migration SQL/journal/catalog from the filesystem. Missing startup assets can therefore cause fail-closed503 at precisely the reported boundary without any user insert/provider effect.

## Initial localization — incomplete after real-build experiment

Installed Next16.4.6 `node_modules/next/dist/build/collect-build-traces.js:458-467` initializes `route = entryName` and normalizes only entries prefixed `app/` or `pages/`. The emitted root middleware entry remains literal `middleware`. The include/exclude pass then matches configured keys using bundled picomatch with `{dot:true, contains:true}`.

Independently executed that exact matcher configuration:

```text
key /*          matches middleware: false
key middleware  matches middleware: true
key /middleware matches middleware: false
```

The installed output-file-tracing guide describes route-glob includes and server traces; the implementation above establishes the additional emitted middleware name for this pinned release. No vendor patch, speculative framework upgrade or weakened check is needed.

## Initial minimal correction experiment — failed, do not retain

The initial approved experiment retained the existing app-route include and added a literal `middleware` key pointing to the same `./drizzle/postgresql/**` asset glob. **Actual isolated rebuild did not populate middleware assets and the compiled regression remained RED. The configuration-only experiment is rejected as an ineffective correction and must be reverted.** The orchestrator added this scope and `next.config.ts`/deployment-test paths to the existing correction appendix/manifest before implementation. Preserve SQL/history/catalog sources and all auth/Host/family/provider logic unchanged.

Static imports are a broader alternative: the public migration loader reads SQL/journal files and the runtime catalog check reads JSON; changing these to bundled imports would require a separately reviewed loader/hash/path design. The real build disproved the assumption that a matching tracing include key reaches this proxy output. A matcher discrepancy is independently proven, but it is not by itself the complete compiler-path cause. Do not claim that the configuration include pass targets this middleware artifact successfully. If the minimal experiment does not populate the real middleware artifact, do not retain an ineffective config change; diagnose supported traceable file access next.

Reviewed `tests/deployment/postgres-packaging.test.ts`: it loads **real compiled** middleware, home and search `.nft.json` files, resolves each listed path relative to its trace and requires the exact initial PostgreSQL SQL, journal and catalog paths. This checks the deployment contract rather than merely asserting a config string. The orchestrator reports RED against the untouched verified export on missing middleware SQL; independently observed the same missing assets here. The regression must be run after the real isolated build and included in documented deployment verification.

## Required proof and gates

Before final corrected-source code approval, require isolated rebuilt manifests containing the required assets for middleware/page/search, the compiled-artifact test GREEN, strict lint/typecheck/build, auth/family/deployment regressions and fixture browser checks. Record the exact corrected source SHA and preserve failed-deployment evidence. This diagnosis/plan approval is not a claim that an unbuilt config fix already works.

The runbook's pause confirmation and recovery path remain with the owner; no infrastructure action is authorized by this review. Changed source requires fresh applicable merge/release records and exact candidate verification before staging/resuming; authority scoped to the earlier SHA must not be silently reused. No auth bypass, client Host spoof, schema repair, new paid search or weaker production protection is an acceptable workaround. Only this review record was written; no application/source/main/deployment mutation or secret-content read was performed.


## Revised minimal experiment — inventory preflight failed, reject as correction

After the matching middleware key failed a real build, the orchestrator proposed a direct, statically traceable runtime migration-inventory preflight in `repositoryMigrations`: recursively enumerate `resolve(process.cwd(), 'drizzle/postgresql')` and require the actual startup SQL, journal and catalog files before invoking the unchanged public Drizzle loader. This performs a real missing-asset readiness check; it is not a no-op annotation, vendor patch or unverified generated manifest.

Independently created an isolated temporary JavaScript probe outside the repository containing `readdirSync(resolve(process.cwd(), 'drizzle/postgresql'), {recursive:true})` and presence checks for `0000_family.sql`, `meta/_journal.json` and `catalog.json`. Ran the installed `next/dist/compiled/@vercel/nft` with the actual checkout as processCwd: **all four PostgreSQL assets emitted**, and required SQL/journal/catalog assertions passed. No database/network action or tracked source edit was made. This is isolated NFT evidence, not yet proof of the final compiled proxy bundle.

Approve this revised small experiment: revert the ineffective config key; add the legitimate literal-path inventory preflight; retain public loader, ordered hashes, catalog validation, SQL schema, typed pg transactions, auth/family guards and credential boundaries. Keep the new compiled-artifact regression and require it to turn GREEN for middleware, home and search after a real isolated build. If that build still fails, preserve evidence and continue diagnosis rather than accepting the isolated probe as sufficient.

The orchestrator reports the owner confirmed pausing and the stable origin now returns503 with `DEPLOYMENT_PAUSED`; domain tables remain empty. These recovery observations are attributed to the orchestrator. This review has not operated the live project. Final corrected-source implementation approval and renewed release authority still require the built artifact/test evidence and current scoped records; no paid call or resume permission is inferred.


## Static runtime metadata design amendment — approved before implementation

The second actual isolated Next build still omitted all proxy startup assets and the compiled regression remained RED, even with the literal UTF8 recursive inventory preflight. The standalone NFT probe succeeded but did not reproduce the real compiler pipeline. **Reject the inventory read as a correction and remove it.** Neither rejected experiment may be described as a successful production fix. The narrower proven diagnosis is that this runtime's dynamic migration/catalog filesystem dependency is absent from its proxy artifact; the attempted configuration/source-NFT techniques did not repair the actual output.

Independently read the new detailed correction appendix in `intent/postgresql-persistence/production-release.md`. Approve this revised design/plan under the repo peer gate before implementation:

1. Runtime statically imports the committed exact catalog plus a committed ordered metadata array containing each migration's hash and folderMillis. It still checks complete PostgreSQL history and catalog fail-closed, with no DDL, schema repair, request-time migration or eligibility-policy change. Existing strict TS configuration already supports JSON module imports.
2. Move filesystem/public Drizzle loader behavior into a separate explicit-migration/build module outside the runtime connection dependency graph. Before any migration write, fresh loader metadata must match the committed runtime list. Keep reviewed SQL/journal and existing public loader as schema/hash authority.
3. A mandatory prebuild verifier, located under upload-included `lib/db`, compares the complete nonempty ordered manifest to fresh public-loader hashes/timestamps, rejects malformed/stale/reordered metadata or changed SQL/journal, and never regenerates/repairs the manifest automatically. `pnpm build` runs it before Next; the migration command performs the same check before opening/changing a DB. Manifest changes remain reviewed source changes.
4. Write RED before replacing runtime behavior: launch the real compiled app in an isolated package containing only `.next`, package metadata and dependency access, with **no source/drizzle/env directory**. Use the existing fixture Google transport and an owned already-migrated local test DB to exercise actual callback, protected onboarding, provision, session and home through proxy. This is stronger than searching minified strings or checking an isolated NFT probe. After bundling the static metadata it must pass. Separate disposable SQL/journal copies prove fresh-loader agreement and stale-data rejection.
5. Replace the previous runtime-file-presence assertion with this changed package contract; do not keep demanding files that the new runtime intentionally no longer reads. Re-run strict lint/typecheck/build, auth/family/deployment/browser checks and independent code/security review. Preserve failed artifacts, first-live evidence and both rejected experiments.

Requested adding the chosen new `drizzle/postgresql` runtime-metadata JSON path to the release file manifest before creating it (the original PostgreSQL plan already covers drizzle/**). No compiler weakening, ORM import, vendor patch, embedded secret, hosted schema write or fake production identity is implied. The application runtime may compare compiled trusted metadata; source/build/migration verification is responsible for proving it matches the actual reviewed SQL, exactly as catalog/schema source changes already require review.

This is approval of the corrected design/implementation plan, not final unverified source or resume permission. The current project remains paused according to the orchestrator; a verified new SHA still needs current applicable merge/release/resume authority. This reviewer made no source/main/production mutation and wrote only this report.

## Corrected source review — code peer gate approved

Inspected implemented `lib/db/connection.ts`, new `runtime-metadata.ts`, `repository-migrations.ts`, `verify-runtime-metadata.ts`, committed runtime JSON, migration ordering, mandatory build command, documentation/manifest and both deployment regressions. The corrected runtime imports static catalog and validated metadata; it imports neither filesystem/path nor the public Drizzle loader. Database history/catalog checks, pg transaction/pool/eligibility behavior remain intact. Manifest validation requires nonempty arrays, exactly hash/folderMillis fields, lowercase SHA256 hashes, safe strictly increasing timestamps; public-loader metadata must match the complete manifest. Explicit migration evaluates this before `connectDatabase`, and build verification runs before Next. No automatic regeneration or failed tracing workaround remains.

The committed migration metadata hash/timestamp matches the unchanged reviewed SQL/journal; no hosted schema migration is part of this correction. Static metadata is code-reviewed source, while SQL/journal hash authority remains the public loader at build and explicit migration time. The new JSON path is present in the release manifest. The verifier lives under upload-included `lib/db`; this avoids the known .vercelignore scripts exclusion. No compiler, vendor declaration or auth-policy weakening was introduced.

Independently executed:

```text
node --import tsx --test tests/deployment/postgres-metadata.test.ts
4 passed, 0 failed, exit0
node --import tsx lib/db/verify-runtime-metadata.ts
Reviewed runtime migration metadata matches SQL and journal. exit0
git diff --check
exit0
```

The isolated compiled-runtime regression copies actual `.next` output and package metadata, links dependencies, asserts source/drizzle directories absent, then uses existing fixture-only Google sign-in against an owned real PostgreSQL database. It asserts protected onboarding200, provisioning200, home200 with recipe interface and session200. It runs the real proxy; the fixture module only handles Google transport and does not replace storage/authorization. The orchestrator's preserved actual clean-export log `.data/neon/proxy-bundled-verification.log` shows this test **PASS** after the static-metadata build, along with lint0, strict typecheck0, auth12/12, family34/34 and deployment smoke12/12. These full-run outputs are attributed to the orchestrator; this reviewer inspected the log without accessing credential/config values. The original RED and both failed experiments remain recorded.

**Approve corrected source under the independent code peer gate.** No unresolved Important finding in this source correction. The new real packaged-runtime contract supersedes the earlier SQL-file-presence requirement; demanding those runtime files would now test obsolete architecture. Recovery browser evidence, final evidence/source hash, independent security clearance and renewed applicable merge/release/resume records remain execution prerequisites owned by the orchestrator. This review does not unpause, deploy, migrate hosted data or authorize a paid call. Real live recovery verification remains required after a newly authorized corrected artifact is active.


## Blocking development regression found after initial corrected-source review

Subsequent cold-development browser checks failed twice: invitation context POSTs returned204 and sign-in GET returned200, but the UI stayed on the pending invitation screen during webpack HMR and a CSS preload warning. Those warnings are not independently a root cause. The orchestrator then performed a controlled fresh-cache dev-only comparison in the isolated export: the old7c651c2 connection/migration pair passed and the corrected static-metadata pair failed. Application invitation, sign-in and layout source is unchanged.

This comparison disproves the tentative inherited/cache-only explanation. **The earlier corrected-source approval is withdrawn pending diagnosis and correction of this reproduced delta. Current verdict: changes.** Do not prewarm routes, increase timeouts or suppress warnings to bypass a regression introduced by the correction. Production remains paused under the owner-confirmed recovery path.

Approve continued isolated bisection of catalog-only versus migration-metadata-only JSON imports, with exact source restoration and fresh owned cache between variants. If a JSON module dependency isolates the behavior, a further comparison with equivalent inline static TypeScript constants can distinguish webpack JSON/HMR handling from metadata validation/content while preserving runtime filesystem independence. Any retained static-code alternative must have mandatory build/explicit-migration verification against the reviewed SQL/journal and catalog so it cannot become a second unchecked schema source. No application router/authorization change is justified by the current evidence. Final code clearance requires both compiled no-source package success and the original cold development StrictMode browser scenario passing without weakened assertions.

## Catalog-import bisection and checked TypeScript metadata experiment

The orchestrator's next controlled catalog-only static JSON variant also failed cold development, narrowing the current regression to the catalog JSON import path; migration-metadata-only comparison remains pending at this checkpoint. Do not generalize this into an all-JSON or framework bug claim without evidence.

Approve an equivalent static TypeScript representation experiment: a single reviewed runtime module exports catalog and ordered migration metadata as literal trusted data, without runtime JSON/filesystem imports. The mandatory build and explicit-migration verifier must compare the **full catalog** to committed catalog JSON and the complete ordered migration metadata to the public SQL/journal loader before database connection/writes. This avoids a second unchecked schema source. A stale-catalog regression is required alongside the existing malformed/stale SQL/journal/metadata tests. Remove the redundant uncommitted runtime JSON representation, while preserving rejected-attempt evidence; no existing SQL, schema, production data or historical audit record is removed.

The plan/file manifest must reflect the chosen checked-code module before retention. This is experiment/design approval only. Both the original cold-development browser scenario and real compiled no-source/no-migration-file package test must pass, followed by strict/regression/browser evidence and independent source review, before restoring a code approval. Production remains paused; no live action or test weakening is conferred.

## Representation probes rejected; invitation handoff amendment approved

The orchestrator reports migration-metadata-only JSON and equivalent checked TypeScript constants also failed the same cold development transition. These results do **not** establish JSON format as the cause. Reject the TypeScript representation as an unsupported fix and restore the simpler reviewed static JSON design whose production build and isolated packaged-runtime behavior already passed. Preserve all probe outcomes; no “known Next JSON bug” claim is warranted.

Read the new invitation-handoff correction appendix. Approve a narrowly scoped deliberate document navigation **after** a successful cookie-setting POST: replace `router.replace('/sign-in')` with `window.location.replace('/sign-in')`. The destination is a hardcoded same-origin path and replaces the current history entry. This starts a fresh document/current authorization read at an authentication/onboarding-cookie boundary, rather than depending on the pending client route/cache transition. It is a real minimal behavior change with a clear purpose, not prewarming or an assertion bypass.

Preserve captured fragment ref and initial stripping **before** POST/navigation, the active cleanup guard, response.ok requirement, generic failure UI, and StrictMode effect replay. Remove the unused Next router import and dependency only. Do not add credentials to URLs/referrers or change cookie scope, recipient binding, invitation acceptance, Google verification, provider authority, timeout/warning handling or tests. Full same-origin navigation carries the new HttpOnly cookie through the existing server boundary without exposing it to JavaScript.

Requested restoring `drizzle/postgresql/runtime-migrations.json` and adding `app/invite/invite-context.tsx` in the release manifest before implementation. The existing reproducible cold browser failure is RED; retain its exact route/hash/zero-error assertions and require GREEN after this behavior fix, plus production copied-link invitation flow, fragment-secret absence from request URLs, packaged runtime, strict checks and regressions. Design/plan amendment is approved; corrected-source code gate remains **changes** until actual implementation and evidence are reviewed. The precise framework scheduling cause remains unknown; no release/resume/live action is conferred.


## Final re-review — approval restored after complete GREEN

The final retained source is the filesystem-free static JSON runtime/catalog plus mandatory SQL/journal/manifest verification, with the small same-origin invitation-cookie document handoff in `app/invite/invite-context.tsx`. Independently rechecked that the handoff calls hardcoded `window.location.replace('/sign-in')` only for the active successful POST, preserves fragment stripping/ref capture, StrictMode cleanup and generic failure UI, and removes only the unused router import/dependency. Rejected literal-inventory/config experiments and the checked-TypeScript representation are absent. No application source change is pending beyond this reviewed correction according to the orchestrator.

Inspected the completed actual clean-export log `.data/neon/proxy-final-verification.log` and the separate fresh-cold log `.data/neon/proxy-handoff-cold-dev.log` without accessing secret/config values. Final results are attributed to the orchestrator's executions:

- Frozen install, mandatory metadata-verifying production build, lint and unchanged strict typecheck: exit0.
- Recipe/notebook63, auth12, family34 and deployment18: **127 Node tests passed, 0 failed**. Deployment18 includes five metadata cases, the real compiled no-source/no-migration-file HTTP regression, and twelve smoke-helper cases.
- Python workflow regressions: **7 tests OK**.
- Auth/notebook Chrome at320/390/768/1024/1440: all recorded interactions passed, no overflow or unexpected console/network errors; the five intentional fixture429 responses remain explicitly counted.
- Combined family browser: Production320/1440 copied-link unlisted onboarding/acceptance/shared-family/revoke/logout passed, followed by Development StrictMode fragment/sign-in pass with no application errors.
- Fresh cold-development-only handoff reproduction also passed with the original assertions. No prewarming, wait increase, warning suppression, auth bypass or assertion weakening was retained.

This reviewer separately ran the final metadata suite: **5 passed, 0 failed, exit0**, and `git diff --check` passed. Full build/browser/database suites above were inspected in the orchestrator's log, not redundantly rerun by this reviewer.

**Restore approved verdict for the corrected-source independent code gate. No unresolved Important finding remains.** The withdrawn interim approval and every failed experiment above remain part of the audit trail; their later supersession is explicit. Local packaged-runtime and cold-development evidence now both satisfy the amended acceptance contract. This does not claim the paused live deployment has been repaired: final source commit/hash, independent security clearance, fresh applicable merge/release/resume authority and real live recovery checks remain separate prerequisites. No production action or paid call was performed or authorized by this review.
