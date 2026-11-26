# Hosted weekly scheduler — local implementation verification

- Author: senior-developer
- Date: 2026-11-26
- Scope: approved Wednesday Hobby scheduler implementation and local proof
- Implementation: `6920b94`; later documentation/audit source is separately pinned
- Design approval: `org/reviews/design-weekly-plan-scheduler-001.md`
- Probe implementation: `8cc2760` (architect); no hosted probe invocation by developer
- Release source and hosted results are bound separately by the orchestrator;
  this local record is not owner staging acceptance or Production authority.

## Implemented behavior

The exact machine GET route has independent environment/project/service-origin,
64hex Bearer and all-method security guards. Disabled is404; invalid enabled
configuration is503; browser cookies do not confer authority. Hosted day must
be explicitWednesday. Dual Wednesday13/14UTC cron entries retain the accepted
Hobby09:00–09:59 first-delivery window with a later summer recovery opportunity.
Proxy and public auth policy remain intact for neighboring paths; browser/menu
canonical Host rules are unchanged.

The existing per-family generator core is shared with the rollback-only probe.
Deadline-aware request-owned admission, page reads and family transactions use
the existing60second deadline/connection-destruction facility. Abort stops new
family work after the active transaction settles. The response follows pool
closure. Existing/final plans, ready-menu filtering, uniqueness, current
eligibility and synthetic exclusion remain covered. No schema,
provider or user-authentication flow changed. A reviewed exact dev-only
`@types/ws@8.18.1` addition supplies the installed Vercel SDK public barrel's
optional type exports; no runtime WebSocket feature is added.

## Test-first evidence

`tests/plans/scheduler.test.ts` was written first and failed with
`ERR_MODULE_NOT_FOUND` for the absent scheduler adapter. After implementation,
its hostile-boundary, offday/calendar, Production machine-Host and real due
storage tests passed. The positive path uses restricted disposable PostgreSQL,
concurrent requests, final-plan preservation and attempts a query on each
request-owned pool after response to prove closure. Events contain only fixed
fields and aggregate counts.

The compiled HTTP regression initially failed421 instead of401 against the
missing route/boundary. After the route/matcher implementation it passes
all-method auth/405, neighboring Proxy coverage, exact Host/query rejection,
security headers and anonymous unfinished-body rejection before EOF. Its native
HTTP client deliberately preserves Host; Node fetch in this environment did
not preserve the explicit test Host. No runtime Host workaround was introduced.

Real database tests hold the common advisory lock beyond a short deadline,
release it after failure and verify no late plan write. An abort after the first
settled family transaction preserves that plan and never advances to the next
family. Existing concurrency/final history tests also pass. The independent
reviewer separately reported that inverting the Bearer check made the boundary
test fail; the reviewer restored exact original bytes afterward.

## Actual commands and results

Node24.15.0 and pinned pnpm10.33.0/dependencies were present. Baseline lint,
typecheck, build and23plan tests passed before implementation. The first
sandboxed database-suite attempt failed with loopback `connect EPERM`; rerunning
with local fixture access passed. No tests or compiler checks were weakened.

| Command | Actual result |
| --- | --- |
| `pnpm install --frozen-lockfile` | exit0; exact type-only dependency and generated lockfile accepted |
| `pnpm run lint` | exit0, no warnings |
| `pnpm run typecheck` | exit0; repeated after final probe/test additions |
| `pnpm run build` | exit0; Next16.4.6 webpack, scheduler dynamic route present, reviewed migration metadata matches |
| `pnpm test` | exit0,112/112 |
| `pnpm run test:plans` | exit0,32/32 on final lifecycle implementation |
| `pnpm run test:family` | exit0,35/35 |
| `pnpm run test:menu` | exit0,69/69 |
| `pnpm run test:auth` | exit0,16/16 |
| `node --import tsx --test tests/deployment/*.test.ts` | exit0,41/41 on final lifecycle/type implementation; compiled scheduler without source/migrations and clean upload build included |
| `node --import tsx --test tests/verification/*.test.ts` | exit0,29/29; synthetic global-generation exclusion included |
| `python3 -m unittest discover -s tests` | exit0,7tests,OK |
| `node --import tsx tests/plans/browser.ts` | exit0; real Chrome owned DB/server/profile |
| `pnpm audit --prod --audit-level=high` | exit0;0high/critical,1existingmoderate |
| `git diff --check` | exit0 |

Security review identified that hosted `Request.signal` support requires the
platform's explicit `supportsCancellation:true` setting. A new deployment
configuration regression first failed (`undefined !== true`), then passed after
adding the scheduler function entry while retaining search cancellation. This
extra focused check is in `tests/deployment/upload-build.test.ts`; the final
full deployment rerun passed41/41 including that additional test. Local abort/deadline
tests and explicit packaging configuration do not prove actual hosted disconnect
delivery. That observation remains a named staging/release coverage gap.
The narrow Fluid-lifetime regression then failed0registrations instead of1;
after registering/returning the same once-created response promise through the
installed `waitUntil`, it passed. This retains only the existing bounded work
through cleanup. Independent security/reviewer consultation approved the change.
The public SDK barrel initially caused strictTS2307 for its optional `ws`
declarations. The independently approved exact dev-only `@types/ws@8.18.1`
addition resolved strict typecheck/build without vendor edits or suppressions.
Frozen install and final lint/typecheck/build passed; fresh high-threshold audit
retained the same single moderate advisory and zero high/critical findings.

The source-upload build proves deployment does not rely on excluded scripts or
private/generated local files. Fixture servers explicitly clear inherited
scheduler enablement/credentials by default; opt-in route tests supply their own
nonproduction constants. Paid provider keys remain empty in fixtures.

The existing moderate dependency finding is
[GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99),
esbuild0.18.20 through BetterAuth→drizzle-kit→esm-loader. It concerns esbuild's
development serve CORS behavior; this application builds/serves with Next
webpack and introduces no esbuild serve usage. This is a scoped reachability
assessment, not a claim that the dependency advisory is fixed.

## Real-browser evidence

The existing full weekly-plan Chrome flow now supplies Wednesday configuration
and asserts visible Wednesday09:00 America/Toronto copy. It passed320/1440px
recipe layouts, unique1/2/6/7 counts, real approval/suggestion/acceptance/reset,
stale/duplicate conflicts, paged full-menu picker, keyboard/focus, confirmation
and immutable history. Modal geometry had0px drift at320/768/1024/1440 and short
mobile heights. Developer visually inspected the new320/1440 draft screenshots.

New evidence is under `org/reviews/weekly-plan-scheduler-*.png`, including draft,
swap, history, small menus and picker states. Existing historical screenshots
are preserved. All browser fixture resources were cleaned up. This is local
real-browser proof with the established Google transport fixture, not a hosted
Google callback or Production observation.

## Remaining release evidence

Final staged plan-sync against the approved manifest passed; staged secret scan
reported0findings. Independent final code/security approval and org/ledger
checks are recorded by their actual reviews/commits. Hosted Preview HTTP
is expected to skip on the actual Thursday; rollback-only Preview storage proof
must be labeled separately. Preview never runs native cron. Actual Production
cron target/Host and first unattended Wednesday delivery remain unobserved until
separate owner release/activation authority. No Production change is claimed.
