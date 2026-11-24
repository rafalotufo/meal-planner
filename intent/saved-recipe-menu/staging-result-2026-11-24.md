# Saved menu — exact-source staging result

Status: staged; owner accepted this exact source/profile and named gaps in
`org/messages/ceo-0052.md`. Production execution is separately recorded in the
release record; no missing check is converted into a pass by that acceptance.

## Attribution and profile

- releaseSourceSha:17881438e3c68f0099e063e714560682c93bd0fb (merged main).
- Preview: dpl_CMzDGtabqA4Z8eWPqv9WmHce6HUG, READY, actual target null/Preview.
- Origin: https://meal-planner-staging-rafalotufos.vercel.app
- Project/team: prj_ntxXnJAVA977jHjLNDR7xJuwSx4V /
  team_2c0O29FMb91g7L6sUChc9v6J, scope rafalotufos-projects, Hobby.
- Profile: saved-menu-keyless-20261124-v1; exact stable-staging auth origin
  privately matched, existing isolated Google/auth/database configuration retained,
  no branch-specific Preview overrides, OPENAI_API_KEY absent in Preview.
- Source/export/inventory attribution: release-2026-11-24.md and private receipts.

## Authorized Preview cutover

Committed owner cutover approval/gate verified before effects. Refreshed full
private backup completed19:03:55Z,13825bytes, mode0600, readable custom archive,
SHA256 bd34c5c99aadfb9a1c1d218218cc9374537329496b47482b2b248334e53d69be.
Existing explicit migrator applied reviewed0001 plus restricted grants only to
recorded Preview withered-night-50194672 / br-dark-term-bbqhnxi5 / meal_planner.
Operation started19:05:16.095Z and completed19:05:17.025Z; commit occurred within
that interval, not an individually measured timestamp. Alias assignment completed
19:05:19.084Z and all-mapping reconciliation completed19:05:23.609Z. These bounds
are not a measured end-user outage duration or a zero-downtime guarantee.

Actual restricted runtime openDatabase passed complete2-migration history/exact
catalog; initial history preserved, family/user/invitation counts remained1/1/0,
new menu table empty. Runtime menu SELECT/INSERT/DELETE allowed; UPDATE/TRUNCATE,
history writes and public-schema CREATE denied. No fake records, SQL write test,
local-data import or business-record mutation was performed. Alias readback binds
only stable staging to exact PreviewCMzD/source1788143; all three Production
mappings remain onJ2oX, unchanged.

## Observed browser and HTTP checks

In the real in-app browser, stable staging rendered the new shared header with
Recipes/Menu/Family and the application sign-in heading/Google button. Actual DOM
viewport measurements were390x844/scrollWidth390 and1440x1000/scrollWidth1440:
no horizontal overflow. Screenshots are
org/reviews/saved-menu-hosted-staging-sign-in-{390,1440}.jpg. Clicking Menu as an
unauthenticated user returned the application sign-in page; no Google button was
submitted, callback followed or identity metadata written. Temporary viewport
override was reset. The staging tab is retained as an owner handoff.

Candidate-host HTTP smoke returned exit2/statusnull/passnull; direct anonymous
inspection observed302 to vercel.com. A diagnostic use of Production anonymous
smoke against protected stable staging returned exit1/status302/passfalse. This
is a non-pass and is preserved; that helper expects public Production redirects.
Staging CLI traffic is intercepted by existing Vercel protection, while the
existing Vercel browser session reached the app. No protection bypass, Host spoof,
forged helper attestation or successful protected-HTTP certification is claimed.
The protection-limited HTTP scope remains an explicit coverage gap.

## Scope and named missing coverage

Fresh combined local199Node/7Python/build/lint/typecheck and actual Chrome
menu/auth/family/shared-layout flows are fixture/local evidence, described in
verification.md. Hosted runtime catalog/permissions and public sign-in/navigation
checks above are separate proof classes. No fresh real Google round trip, denied
identity, authenticated hosted menu/status/save/remove, live provider search/
photo discovery, cancellation or WAF certification occurred. Preview is keyless;
provider success is unverified. Hosted member/menu keyboard/mobile flows were
not exercised; public sign-in responsive checks are not a substitute.

Owner may verify staging personally or explicitly accept this exact source,
Preview/profile and named gaps before a separate Production build/cutover. Such
acceptance is a scope decision, not retroactive proof of missing checks. Any
source/profile/schema/alias drift requires renewed attribution/acceptance.

## Final independent handoff and freshness

`org/reviews/saved-recipe-menu-staging-handoff-001.md` independently crosschecks
source/Preview/project, committed cutover gate, backup bytes/hash/0700+0600 and
actual screenshot dimensions/layout. It is clear for owner acceptance, not an
acceptance or Production release decision. A later read-only Production runtime
transaction at19:09:28Z confirms verified TLS, initial1-migration catalog/menu
absent,1family/1user/0invitations unchanged. Production anonymous smoke again
passed exit0/status401/pass true,2175ms. All environment metadata remains exactly
unchanged; private non-secret Production provider/model/Corepack comparisons
match openai/gpt-6.2-sol/1. Production profile is
saved-menu-production-20261124-v1, with original sealed credentials preserved;
no credential value was retrieved. These configuration checks are not fresh live
provider/OAuth proof.
