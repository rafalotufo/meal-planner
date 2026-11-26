# Wednesday scheduler — independent implementation review

- Reviewer: reviewer, independent of implementers
- Date: 2026-11-26
- Fixed reviewed source: 7fe1531d07f2fb6028c98e4f38b73d20f805e5fa
- Includes core 6920b94, probe 8cc2760 and local evidence 7fe1531
- Verdict: **Approved for authorized exact-source isolated staging validation and human merge review**
- Unresolved blocking code findings: none

## Bugs and architecture

The adapter guards exact machine Host/project/environment, explicit Wednesday,
dedicated bearer, target/body/method and all-method security headers before DB
admission. Policy validation also precedes off-day skips. Browser cookies and
forwarding/cron headers confer no authority. Production accepts only its reviewed
machine origin; browser/menu canonical policy and neighboring Proxy coverage
remain unchanged.

The extracted per-family core preserves original SQL selection, eligibility,
ready snapshots, synthetic exclusion and existing/final-week protection inside
the caller-owned common locked transaction. Deadline reads/writes reuse existing
connection ownership; abort stops new families and waits for started work.
The response follows pool closure. Restricted disposable DB tests cover real
concurrent creation and final-plan preservation.

The route creates one response promise, registers the same bounded promise with
public waitUntil, and returns it. There is no duplicate or unbounded detached
generator. Scheduler cancellation opt-in is present in vercel.json, preserving
search's existing setting. This resolves security's concrete lifecycle finding.
Dual Wednesday13/14UTC entries implement the accepted Hobby/DST contract; later
summer recovery is disclosed. Existing CLI weekday/default behavior is preserved.

## Security and operator probe

The64hex secret is independently scoped, compared with constant-time equal-size
bytes and never returned/logged. Responses/events expose only generic errors or
aggregate counters. The exact Proxy exclusion adds no public-policy or identity
bypass. No schema, grant, paid provider or runtime migration is introduced.

The probe checks exact recorded Preview hosts/database/mp_runtime/verified TLS
before opening storage. One common-locked transaction inserts a transient
snapshot, invokes the same core, checks creation/draft/final repeat behavior,
and throws its owned rollback sentinel. It has no commit mode, Production
fallback or HTTP clock override. Bounded seven-table count/hash projections
must match after rollback; errors remain generic and nonzero.

The only dependency addition is exact dev-only @types/ws8.18.1, matching the
installed SDK's own declaration dependency. The generated lock adds only that
package and existing Node types. It resolves public-barrel type exports without
a runtime WebSocket feature, vendor edit, unsupported import or suppression.
The known moderate esbuild advisory remains disclosed and separately assessed
by security; this review does not claim a clean audit.

## Independent evidence

- Read the adapter, route, probe, generator diff, config, tests, fixture
  isolation, compiled packaging coverage, plan amendments and verification.
- Ran four pure boundary/target/DST/Production-origin tests:4/4pass.
- Ran same-promise Fluid lifecycle regression:1/1pass.
- Early review inverted bearer rejection; the machine-boundary test failed
  unauthorized200 instead of401. Restored exact bytes immediately; no mutation
  remains. No subsequent shared-tree mutation was performed.
- Missing URL, loopback, recorded Production host and migrator-role probe
  attempts all exited1 before DB work with only the generic error, no rows or
  credential/URL output.
- Visually inspected320/1440 draft screenshots: Wednesday schedule is visible,
  navigation/cards are readable and fit the captured widths. This is local
  browser evidence, not a hosted authenticated session.
- Checked the developer's final recorded frozen install/lint/typecheck/build,
  32plan/41deployment tests, unaffected112recipe/35family/69menu/16auth/
  29verification/7Python regressions and real Chrome proof. Full suite runs
  belong to that developer record; this reviewer does not claim rerunning all.

The early AGENTS section is now outside Next's generated block. Historical
screenshots are preserved; new evidence uses the feature prefix. The final
diff follows the approved manifest and peer-approved lifecycle/type amendments.

## Remaining gates and proof limits

This opens only authorized Preview validation and human merge review. It is not
owner staging acceptance, merge approval, Production configuration/build/
promotion/activation or paid-plan authority. Staging results and final release
package require separate review against this fixed source/profile.

Today's Thursday HTTP call should skip before DB. Rollback-only storage,
local fixtures and deployed HTTP must remain separate proof classes. Native
Production cron target/Host, first unattended Wednesday delivery and actual
cloud disconnect behavior remain unobserved; config/manual success cannot
certify them. Preserve explicit gaps and the owner release/recovery gate.
