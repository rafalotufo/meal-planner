# Verification identities — hosted cutover proposal

- Author: security-researcher; date: 2026-11-25
- Status: Concrete operational scope for root/owner review; this document executes
  nothing and records no new approval.
- Fixed release source: `19774c7cd8ae301682003838f083b9d825d5e56d`.
  Later audit main `6718c5b` and subsequent audit commits are not release sources.
- Owner request: canonical `org/messages/ceo-0069.md`; governing gates remain the
  staging-first specification and active staging/Production runbooks.

## Exact targets and migration contract

Vercel project `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, team
`team_2c0O29FMb91g7L6sUChc9v6J`, scope `rafalotufos-projects`, Hobby only.
Canonical staging is `https://meal-planner-staging-rafalotufos.vercel.app`;
Production is `https://lotufo-meals.vercel.app`.

| Target | Neon project / branch | Direct host / database |
| --- | --- | --- |
| Preview | `withered-night-50194672` / `br-dark-term-bbqhnxi5` | `ep-wandering-breeze-bbtscekj.c-15.us-east-1.aws.neon.tech` / `meal_planner` |
| Production | `plain-pond-82425009` / `br-wild-dust-bbr2mvzw` | `ep-lively-tooth-bbi1n111.c-15.us-east-1.aws.neon.tech` / `meal_planner` |

Root reports a fresh strict restricted-runtime read-only baseline on each target:
all five historical migrations, no native ledger, and aggregate domain counts.
Refresh and retain sanitized target/catalog/history/grant/count evidence directly
before each effect; unexpected drift is a stop, not authority to repair it.

Apply only these existing reviewed native descriptors, after their five historical
prerequisites, using source19774c7's `scripts/migrate-db.ts`:

| UUID | SQL SHA256 | Dependency |
| --- | --- | --- |
| `fe5c2ee0-bf7f-464e-93be-2d654b4001e8` | `0fc9a5dce9ebd7a6ee339b6e45a97fa49242c70496a1c19217bcc46016529f83` | Both current historical terminal identities |
| `557e80b6-f30b-452e-b563-12cff07158a5` | `57c3045d6e0d3a2985ae4a307d916fba3f5fb5fd4d30ef7321bc209b8a83b438` | The initial verification UUID above |

The initial migration adds explicit Google/verification family/member branches,
owned runs, digested capabilities/sessions and shared throttles; the correction
normalizes an equivalent origin constraint for stable dump/restore. Preserve all
old SQL/hashes/ledger rows and existing domain data. New identity columns default
to Google for existing rows; no real identity becomes synthetic.

Current `migrateDatabase` validates source checksums and the actual pre-profile,
then executes both SQL files, native ledger creation/rows and exact final grants
inside one READ COMMITTED advisory-locked transaction (lock73462902), with bounded
local timeouts and final catalog/privilege validation before COMMIT. This supersedes
historical instructions describing grants as a separate post-schema transaction.
The CLI's subsequent restricted-runtime credential/connectivity smoke is separate:
its failure can mean the migration already committed. Inspect actual ledgers and
profile before any retry. A lost COMMIT response is not proof of rollback.

Use distinct existing `mp_migrator` direct and `mp_runtime` pooled URLs, same target,
verified TLS `sslmode=verify-full`, private operator environment and no credentials
in arguments/output/Git/Vercel. No bootstrap, new role, TEMP grant or database
provisioning is needed. Runtime never migrates. Final profile remains the exact
committed `compatibility.json` profile: revoke broad families/app_users INSERT/
UPDATE, retain existing Google column INSERT and verified_email UPDATE; runs are
runtime SELECT-only; capabilities SELECT/consumed_at UPDATE; sessions SELECT,
reviewed INSERT columns/revoked_at UPDATE; throttles reviewed DML. Existing domain
grants otherwise retain their reviewed profile. No runtime setup-kind/run writes,
DDL, native-history writes or owner/operator privileges.

## Preview operation and bounded verification scope

1. Root reports READY Preview `dpl_8saVzK5Pyerj3jbbEVhFerLpdLkt`, generated host
   `https://meal-planner-6vuznk2ei-rafalotufos-projects.vercel.app`, source19774c7.
   Reconcile its inspection immediately before effects; READY alone is not app
   readiness. Bind the observed enabled
   build policy and runtime to actual project/deployment/source/origin/DB and
   reviewed profile `4f2b6f52e2779c30c8a93ae0c59f81dee197d17ef6ed9c20203d4af702acdaf1`.
   Keep operator-supplied truthful CLI source attribution distinct from provider-
   signed Git metadata. Retain failed build attempts and their actual outcome.
   A disabled build policy needs a fresh same-SHA build; runtime variables alone
   cannot enable it. Do not move any alias or change Production configuration.
2. Obtain/record exact Preview scope covering these two migrations/final grants,
   possible staging interruption, operator seed/issue/revoke/cleanup, private
   handoff and scoped link creation/revocation. General local implementation
   approval or this proposal is not that scope. Verify the planned build/profile
   and keyless provider status before DB effects.
3. Before DDL, take a complete private PostgreSQL17 custom-format Preview backup
   using child-process private connection environment and verified TLS. Keep the
   directory0700/file0600 outside uploads/Git; check nonempty archive, archive
   listing and SHA256. Archive inspection is not a demonstrated restore. No backup
   restore, data export to agents or data reset is authorized by keeping a backup.
4. Run the pinned migration CLI with only the Preview owner/runtime pair. Verify
   seven required identities, exact final catalog/column grants, restricted-role
   open and unchanged old ledger/domain values/counts. Do not import local data.
   Stop on rollback/failure; do not apply ad hoc DDL/grants or rewrite history.
5. Move only the existing staging alias to the READY exact candidate if covered
   by the recorded scope. Serialize alias moves during verification. Old five-
   migration Preview artifacts cannot be relied on after the new catalog commits.
   Verify actual alias/project/Preview/deployment/source/profile before and after.
6. If platform protection blocks entry, create/use one scoped Shareable Link for
   this candidate under the recorded authority. Keep it private; prove normal
   browser navigation reaches the canonical staging Host with cookies intact and
   exact deployment binding. No Vercel account, project-wide bypass secret,
   protection removal, paid feature or Production mapping change is a fallback.
   If the link/canonical-origin path fails, readiness remains blocked.
7. Issue at most one initial `collaboration` run with the fixed reviewed v1 seed
   (two members, two synthetic menu snapshots, one current-week draft, no images).
   Require a fresh independently inspected private CLI record with
   `allowFixtureSeed: true`, explicit `--seed-fixture` and the target/profile above.
   No arbitrary recipe input or real data copying. Write capabilities exclusively
   to a new0600 file under a canonical owner-only directory. One-use credentials
   expire in5 minutes, sessions in at most15, run in at most30. Establish private
   automation/trace handling first; raw values never enter chat or tool arguments
   emitted into shared transcripts. Remote-agent transfer is not yet approved.
8. Use native form/server-cookie entry, then real home/session/family/menu/plan
   checks at390/1440 with actual supported browser/version evidence. Within this
   owned run allow snapshot list/save/lookup/remove, plan read/approve/suggest and
   the reviewed collaboration; no invitation/provision/curation/finalize/background
   effects. Use no paid provider call. At most one separately recorded keyless
   search503 observation is permitted only after verified missing provider key;
   skip it if keyless status is unknown. Never set real-Google helper flags.
   A second run needs its own recorded reason/scope; do not retry spent credentials
   or fabricate a complete browser matrix. Missing Firefox/Safari remain gaps.
9. Logout and prove the copied opaque token no longer admits; operator-revoke the
   run, revoke the scoped link, then execute exact-run ownership-checked cleanup.
   Verify no foreign data changed and delete the private handoff. Cleanup refuses
   mixed ownership and is not broad DELETE/TRUNCATE authority. Retain only sanitized
   outcomes/counts/IDs/profile/interval, not credentials, user data or request bodies.

Produce the separate `synthetic-app` evidence artifact and validator output.
Exit2 for incomplete browser coverage remains inconclusive, even if its actual
Chrome checks passed. Report Google OAuth, paid providers/photos/cancellation,
platform/WAF/bot behavior and excluded flows as unverified/excluded. Owner must
accept those exact gaps for this source/deployment/profile before Production.

## Production preparation, cutover and recovery gate

Only after exact-source staging acceptance, obtain a committed unexpired release
record naming source19774c7, the actual accepted Preview artifact/profile, both
Production native migrations/final grants, the bounded interruption decision,
separate Production candidate creation/promotion,15-minute anonymous health window
and exact recovery authority. Existing generic request and historical releases do
not silently supply the missing interruption/pause/recovery scope.

Prepare a separate READY Production candidate from19774c7 with
`--prod --skip-domain`, disabled verification manifest and independently inspected
Production variables/target/canonical routing. Preview is never promoted. Candidate
packaging/noncanonical421 checks do not prove functional DB/OAuth behavior. Before
Production DDL, prepare/inspect the private Production backup as above and ensure
this compatible candidate is ready to promote; no new canonical/auth/Google setup
change is implied.

**Five-to-seven schema cutover has no guaranteed healthy overlap.** Existing
five-migration Production artifacts reject the new catalog on new DB admission;
the new application rejects the old catalog. Owner must explicitly accept a short
possible503 gap between migration COMMIT and promotion, or separately authorize a
project maintenance pause/resume, including its Preview impact. Never promise
atomic/zero-downtime alias-plus-DB cutover. Under that authority migrate only the
Production pair, verify exact final profile/preserved data, then promote the
prepared same-source candidate and perform canonical anonymous smoke/configuration
checks for at most15 minutes. No synthetic principal/data/credential is created
on Production; its verification entry remains disabled.

No currently recorded old artifact is a safe rollback after successful schema
commit. If required health/configuration evidence fails, preserve new schema/data
and use only the explicitly authorized project-scoped pause, or a separately
reviewed compatible correction. A pause may require the owner's interactive
confirmation; never bypass it. Do not drop new tables/columns, rewrite either
ledger, restore a backup, revoke shared keys or promote an incompatible old build.
If transaction failure left the exact old profile intact, inspect it and its
unchanged traffic state rather than claiming a new-schema rollback was performed.
Further correction, resume, retries outside the approved window or a changed
source/profile require their corresponding reviewed authority and staging proof.

## Existing moderate esbuild advisory — current reachability reassessment

Root's current `pnpm audit --json` reports one moderate finding and zero high/
critical/low; it is not a clean audit. The existing
[maintainer advisory GHSA-67mh-4wv8-2f99](https://github.com/evanw/esbuild/security/advisories/GHSA-67mh-4wv8-2f99)
concerns cross-origin reads from affected esbuild development serving, versions
through0.24.2; fixed versions start0.25.0. Consulted2026-11-25.

Independent current `pnpm why esbuild` confirms vulnerable0.18.20 through Drizzle
Kit's @esbuild-kit tooling chain, including Better Auth's optional dependency
path; manifest dev-only placement does not prove runtime exclusion. Current app/
script search finds no esbuild serving invocation, and all29 generated Next trace
manifests contain no esbuild/Drizzle Kit dependency entry. The application uses
Next, native pg and Drizzle's public loader; migrations/operator/build commands do
not start the affected serve process. This supports retaining the existing
nonblocking reachability disposition for this release; dependency presence and
build-time tooling remain real, and traces alone are not a universal guarantee.

Keep the latest existing deferral from
`org/reviews/security-saved-recipe-menu-release-audit-001.md`: reassess by
**2026-12-01**, earlier on tooling/serve exposure changes, and at release review.
This document performs the present source/trace/advisory reassessment; root owns
final exact-source audit evidence. Do not force an unreviewed transitive upgrade,
change pins, suppress audit findings or extend the deadline during cutover.
