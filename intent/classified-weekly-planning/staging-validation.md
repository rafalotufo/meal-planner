# Classified weekly planning — actual Preview cutover result

- Operator: senior-developer under committed owner authority `9e249a2` and ledger
  `preview_cutover_authorization-001`.
- Fixed release source: `f0b8c1e3a8dd0ae55e8a7568c53cef00637bb8b5`.
- Actual operation interval: 2026-11-27 14:39:49–14:50:21 UTC
  (09:39:49–09:50:21 America/Toronto).
- Sanitized machine-readable receipts: sibling `staging-validation.json`.
- Result: approved Preview migration and staging-only alias cutover completed;
  required bounded anonymous/schema/configuration checks passed. Exact-result
  owner staging acceptance and separate Production authority remain pending.

## Exact source and final target

Prepared Preview `dpl_5pWi2uFG3M6pMKkgrM6eB29rkz3S` is READY on the existing
Vercel project `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, team
`team_2c0O29FMb91g7L6sUChc9v6J`, scope `rafalotufos-projects`, Node24/Hobby.
Its generated Host is `meal-planner-9sutdnafh-rafalotufos-projects.vercel.app`.
The stable staging origin
`https://meal-planner-staging-rafalotufos.vercel.app` now maps to this Preview.
Final provider inspection at14:49:44.983Z retains the full fixed source in both
`gitCommitSha` and `releaseSourceSha`; ref is `classified-planning-f0b8c1e`.
This metadata binds an operator-attested upload, not platform-signed Git proof.

The earlier upload verified151 tracked Git blobs/1047842bytes. This operation
additionally exported the full pinned source for the migration library and
verified all7109 Git blobs. Its operator source and node_modules link remain
outside uploads and Git. Later audit commits were never substituted as source.
No new build, application-source edit, push or merge occurred in this operation.

## Database, backup and preservation

Only Preview Neon project `withered-night-50194672`, branch
`br-dark-term-bbqhnxi5`, database `meal_planner`, endpoint
`ep-wandering-breeze-bbtscekj.c-15.us-east-1.aws.neon.tech` was connected.
Before effects, strict read-only checks validated the exact eight-identity catalog,
full ledger checksums/descriptors, existing permissions and restricted runtime.
Exactly one migration was pending: `80fd3d65-d202-462b-883d-6adc2eb565be`, SHA256
`2b9ffeb679e365c96aa862a6e808f0b2a87f9cd97a17cdafa0bfd3226ea669b5`.
Runtime TEMP remained denied.

Connector handoff used the known pooled endpoint for both roles. Following the
approved direct-owner contract, only the exact known owner pooler hostname was
translated to the recorded direct endpoint, retaining role/password/database;
runtime stayed pooled. Known TLS options were normalized to the reviewed
`sslmode=verify-full` Node pg contract. No unknown connector options were accepted.

A complete PostgreSQL17.11 custom backup finished14:45:47.314Z:57,909bytes,
SHA256 `facf4a340dcecae067cab03a467f212356fc4b9a8491a9a056c73cc10036cfed`.
`pg_restore --list` verified every domain table and both ledgers. The owner-only
archive remains privately retained; it was not uploaded, committed or restored.
The first backup attempt failed before effects because libpq's default root
certificate file was absent. The successful retry used documented
[`PGSSLROOTCERT=system`](https://www.postgresql.org/docs/17/libpq-connect.html#LIBPQ-CONNECT-SSLROOTCERT)
with `PGSSLMODE=verify-full`, preserving certificate and hostname verification.
This verifies an archive, not an executed restore.

The exact pinned `migrateDatabase` library applied only the reviewed migration;
no runtimeRole/grant reconciliation was requested. It committed14:47:13.466Z.
Final read-only validation at14:49:43.500Z confirmed nine identities (five legacy,
four native), the reviewed catalog, zero pending migrations and restricted-runtime
connectivity/permissions. New complete profile SHA256:
`0c854fcd29a0561d17e2d2effb03dcfc661aa9e192719ae1d0349bf580d9fb3e`.
The before/after exact grant digest, full-domain data digest and historical
legacy/native ledger rows match. Existing plan/suggestion/menu/approval data was
preserved. No grant expansion, TEMP grant, data backfill, fake record, synthetic
identity, runtime migration or additional DDL was performed.

## Routing and actual health

After strict post-migration/runtime preservation checks, the stable staging alias
was assigned to5pWi at14:47:20.434Z. Migration and alias timestamps are separate
receipts; their difference does not measure user-visible outage. The owner had
accepted a possible brief503 compatibility gap. No outage duration was measured.

All three Production aliases remain on
`dpl_GHCptaMFGM7gFDHJEE7zF3kJbJTM`, source
`91c419e54bbee8c92642c509e9cb4e92ee2e0426`: `lotufo-meals.vercel.app`,
`meal-planner-rafalotufos-projects.vercel.app` and
`meal-planner-delta-six-55.vercel.app`. Project settings/environment/protection
fingerprint and domain classifications are unchanged; the project is unpaused.
The two Production cron definitions still belong toGHCp and its original
`meal-planner-smlpcvad5-rafalotufos-projects.vercel.app` generated Host.
Production was not built, migrated, promoted, reconfigured or probed here.

One candidate-scoped temporary Shareable Link (1800seconds) allowed the following
actual anonymous application observations without Google or app-session cookies:

| Origin/check | Actual result |
| --- | --- |
| Stable staging `/` |307 to its own `/sign-in` |
| Stable staging `/sign-in` |200 |
| Stable staging `/api/session` |401 |
| Stable staging empty anonymous POST `/api/recipes/search` |401; no provider effect |
| Stable and generated exact `/api/plans/generate` |404; ordinary Preview scheduler disabled |
| Generated `/`, `/sign-in`, `/api/session`, `/icon.svg` |421 with private/no-store |
| Generated exact `/api/menu` |421 with private/no-store, DENY and nosniff |

Post-cutover checks ran14:47:34–37Z and passed the approved required contract.
Stable responses and exact menu/scheduler responses retained private/no-store,
DENY and nosniff headers. The early Proxy generated root/sign-in/session/static
421 responses omit DENY/nosniff; this is an observed supplementary limitation,
not a claim of full header coverage. The fixed-source candidate helper contract
requires421/no-store there; neither code nor tests were weakened.

The candidate was also checked before schema effects: generated ordinary paths
421/no-store, exact menu421 and disabled scheduler404 with their private/security
headers. Effective Preview inventory has no paid provider keys and no enabled
verification or scheduler variables. The candidate metadata retains request
cancellation support for search/scheduler; duration90 remains the pinned-source
configuration contract rather than a separately observed live provider trace.

## Capability and local cleanup

The single candidate-scoped link was revoked without regeneration. Initial narrow
revocation polling only recognized401/403 and exited2 while responses were302;
that result was not labeled a pass. Safe redirect inspection then proved fresh
cookie-free requests with the revoked capability were denied application access:
both origins redirected302 to `https://vercel.com/sso-api` at14:49:03–04Z.
The sanitized evidence retains both observations. No project-wide automation
bypass, public protection removal or additional link was created.

All19 worktrees were inspected for existing staging lane/process locks; none
existed. This run held cooperative exclusive lane locks in shared main and this
worktree, then released only those exact owned locks at14:50:21Z. Owned plaintext
connection/link handoff copies were deleted; shared CLI authentication and the
private backup were preserved. No lock was broken or unrelated file removed.

## Explicit staging gaps and next gate

This is hosted **keyless operator** evidence. Local fixture tests and Chrome
screenshots remain separate evidence and were not represented as hosted coverage.
No hosted authenticated planning page,4/2/2 UI, swap/approve/finalize effect,
Google OAuth, provider/photo success, cancellation run, invitation, URL curation,
synthetic run/data, enabled scheduler Bearer flow or unattended cron dispatch was
exercised. No hosted browser/mobile/Firefox/Safari run occurred. Application smoke
used finite scoped platform access; it does not prove comprehensive WAF/bot or
unaided platform protection behavior. Fresh post-revocation SSO denial is the
bounded observed protection evidence. Preview scheduler404 does not prove the
enabled Production service-host/Bearer contract or native Wednesday delivery.

Existing dependency audit remains one moderate esbuild advisory
GHSA-67mh-4wv8-2f99, zero high/critical findings; see `release-preflight.md` and its
2026-12-01 review deadline/reachability limits. No upgrade, suppression, deferral
extension or clean-audit claim was made. Live runtime-trace reassessment remains
unresolved, as do the named hosted functional/provider/browser gaps above.

No required health failure occurred; no contingency pause or recovery action was
needed. Current schema/data must be preserved; the old eight-identity staging
artifact is not a safe rollback target. Backup restore is not authorized.
The owner must accept these exact-source staging results and named gaps before
separate Production migration/build/manual-promotion/recovery authority. This
completed Preview operation provides no standing or Production permission.
