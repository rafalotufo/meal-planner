# Own-deployment scheduler Host correction — local verification

- Author: senior-developer; date:2026-11-26
- Scope: approved local correction only; no new Production release authority
- Design:[hosted-target-correction.md](hosted-target-correction.md),architect3a3767b
- Independent design:[review](../../org/reviews/design-weekly-plan-scheduler-hosted-correction-001.md),1ebdab3
- Independent security design:[review](../../org/reviews/security-weekly-plan-scheduler-hosted-correction-design-001.md),65e504f
- PM scope:[acceptance](../../org/reviews/intent-weekly-plan-scheduler-hosted-correction-001.md),42c92ff

## Reproduction, correction and preserved boundaries

The old7fe1531 service guard rejected its own generated cron hostname before
authentication. New regressions were written before the guard change. The
own-generated-Host request without a token failed421instead of expected401;
missing system metadata on the stable Host failed200instead of expected503.
These concrete failures reproduced the registered-target integration defect
and missing fail-closed metadata contract. Both tests passed after the correction.

The runtime change is confined to `lib/plans/scheduler.ts`: validate trusted
server-side VERCEL_URL as a lowercase ASCII DNS hostname ending in.vercel.app,
with1–63character labels/alphanumeric ends and total length at most253. Schemes,
ports, paths, credentials, query/fragment, whitespace, Unicode, uppercase,
wildcards and empty/oversized labels fail503. Missing metadata fails503 even
for the stable service Host. Incoming Host acceptance is exact equality with
the configured stable machine Host or this one validated own generated string.
It is never a suffix test on incoming requests and ignores forwarding metadata.

The fixed project/environment/service-origin/browser-origin requirements,
independent64hex Bearer comparison, every-method security headers, exact target,
Wednesday clock,60second deadline, bounded Fluid cleanup and storage core are
unchanged. Proxy, browser/menu/Better Auth policies, schema, grants, dependencies,
provider behavior and recipe selection are unchanged. No runtime clock override
or Production operation was added.

## Actual local verification

| Command | Actual result |
| --- | --- |
| Focused new Host/metadata regression command before guard change | exit1;2tests failed with421!=401 and200!=503 |
| Same focused command after correction | exit0;2/2passed |
| `node --import tsx --test tests/plans/scheduler.test.ts` | exit0;7/7passed, including restricted real due storage/concurrent preservation |
| `pnpm run lint` | exit0; repeated after final test/document edits |
| `pnpm run typecheck` | exit0; final correction and strict fixtures included |
| `pnpm run build` | exit0; Next16.4.6 webpack,18static pages, scheduler dynamic route; reviewed migration metadata matches |
| `pnpm test` | exit0;112/112passed |
| `pnpm run test:plans` | exit0;35/35passed |
| `pnpm run test:auth` | exit0;16/16passed |
| `pnpm run test:family` | exit0;35/35passed |
| `pnpm run test:menu` | exit0;69/69passed |
| `node --import tsx --test tests/deployment/*.test.ts` | exit0;41/41passed, including source-less compiled scheduler and clean upload build |
| `node --import tsx --test tests/verification/*.test.ts` | exit0;29/29passed, including synthetic global-generation exclusion |
| `python3 -m unittest discover -s tests` | exit0;7tests,OK |
| `node --import tsx tests/plans/browser.ts` | exit0; real Chrome320/1440 complete plan/picker workflow |
| `pnpm audit --prod --audit-level=high` | exit0;1existingmoderate,0high/critical; no dependency change |
| `git diff --check` | exit0 |

Total complete Node suites:337tests; Python workflow:7tests. No test/check was
skipped, suppressed or weakened. Local DB/server/browser resources were owned
temporary fixtures with empty paid keys, using the approved loopback test role.

Unit tests exercise Preview and Production stable/own Hosts across all methods,
no/wrong Bearer401, valid offday200, protected405/Allow, query400, foreign/sibling
generated Hosts421 even with a valid credential, forwarding-header non-authority,
and malformed/missing system metadata503 before storage. Due concurrent requests
now span one own-generated and one stable Host and still create only one draft,
preserve final plans and close each request-owned pool before response.

Real built HTTP tests use the actual compiled Next route with strict owned server
metadata. Both service Hosts pass their guards; a different generated Host421
and malformed metadata503 are distinct. Ordinary page/menu/session/sign-in paths
on the own generated Host remain421. Compiled packaging repeats authorized
service checks on both Hosts without application/migration/operator source files.
The same-promise Fluid lifetime/cancellation tests remain green.

## Browser and evidence provenance

Real Chrome passed mobile/desktop cards, Wednesday copy, focus/keyboard, saved-menu
search/paging, approval/suggestion/acceptance/conflict/rejection/confirmation and
immutable history. Modal geometry drift remained0px at320/768/1024/1440 and
short mobile heights. The developer visually inspected new320/1440 draft images.
Correction screenshots use `org/reviews/weekly-plan-scheduler-host-correction-*.png`;
all original7fe screenshots and failed-release evidence are preserved.

This is local real-browser evidence with the existing test-process Google
transport fixture, not a fresh hosted Google callback or native cron delivery.
Final independent code/security review, corrected exact-source both-origin
Preview HTTPS/rollback-only validation and a new approval package are still
separate requirements. The first7fe Production authority is consumed; since
corrective GO this developer performed no hosted or Production action.
