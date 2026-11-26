# Corrected scheduler — exact-source both-origin staging proof

- Date:2026-11-26; operator:orchestrator
- Status: validation complete; fresh owner acceptance/merge/Production approval pending
- Fixed source:`f8383f3dbfc14b4ab3b2cfdd3c648d6abc3d06a9`
- Ready Preview:`dpl_12CQHFyWKb3HTPTUqAJWY9HRig1P`
- Stable origin:`https://meal-planner-staging-rafalotufos.vercel.app`
- Own generated origin:`https://meal-planner-o3lc8uo2z-rafalotufos-projects.vercel.app`
- Profile SHA256:`2da8d5aa298bb44d9f3a6b5666c1800936ed23e5f299840b3a1cc0e4ebc71935`
- Profile encoding: sorted-key compact JSON; evidence is pretty-printed for reading
- Project:`prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`,team:`rafalotufos-projects`
- Evidence:[hosted-target-correction-evidence-20261126](hosted-target-correction-evidence-20261126/)

## Source, independent review and configuration

The [corrective design](hosted-target-correction.md) is independently approved.
[Code review](../../org/reviews/code-weekly-plan-scheduler-hosted-correction-001.md)
and [security review](../../org/reviews/security-weekly-plan-scheduler-hosted-correction-code-001.md)
approve this exact source. Local [verification](hosted-target-correction-verification.md)
records fresh lint/typecheck/build,337Node tests,7Python workflow tests and real
Chrome320/1440. Independent tests also detected incoming-wildcard and missing-
metadata mutations in an isolated temporary copy; shared source stayed intact.

The sole runtime correction is the11-line service guard delta: require valid
trusted server VERCEL_URL and compare incoming Host exactly to that value or the
fixed service origin. No Proxy/browser/menu/generator/cron/lifecycle/dependency
change was made. Source7fe and its failed Production attempt remain historical;
this correction does not reuse its consumed release authorization.

Upload used146fixed Git blobs,936435bytes, with existing exclusions. The manifest
binds every file/hash directly to f8383f3. Ready API metadata binds exact source,
profile, project and staging ref; independent deployment inspection identifies
target Preview and scheduler/search nodejs24.x/90seconds. Both cancellation
flags are true; provider keys absent. No private/generated/test/audit material
was uploaded, and later audit HEAD is not this release source.

The retained Preview has deployment-only enablement, explicitWednesday, fixed
stable service origin, fresh separate CRON_SECRET and the recorded restricted
Preview DATABASE_URL over verify-full TLS. Values were supplied privately with
name-only CLI flags, not secret argv. No VERCEL_URL override was supplied;
project inspection confirms none exists. The platform-owned generated URL is
the actual inspected12CQ hostname. No shared Preview environment or Production
configuration was changed during this correction validation.

## Actual HTTPS results —30/30 passed

Each origin established its own platform-cookie jar, then used no-query service
requests and an independent service Bearer credential. The same narrow12CQ-only
deployment capability covered the two verified origins; it was not a global
project bypass or an application session.

| Check | Stable origin | Exact own generated origin |
| --- | --- | --- |
| Missing/wrong/coalesced service Bearer |401each |401each |
| HEAD,POST,OPTIONS,PUT,PATCH,DELETE with valid Bearer |405each;Allow:GET |405each;Allow:GET |
| Query/date override |400 |400 |
| Valid GET and repeat on actualThursday |200skip/allcounts0 |200skip/allcounts0 |
| Ordinary session endpoint without app session |401 |421 |
| Ordinary root/menu/api-menu/sign-in |separate existing local UI proof |421each |

All24machine-route responses passed the full private/security-header assertions.
The ordinary generated-host checks preserved the existing421/no-store contract;
actual header presence is recorded. Generated ordinary Proxy responses do not
gain new headers or relaxed host behavior. The generated200service proof beside
ordinary421 directly exercises the machine-only boundary missed by source7fe.

The first alias-only platform capability did not clear Vercel authentication;
it never reached the application and its targeted cleanup returned404/already
absent. Security consultation approved a deployment12CQ-only capability with
separate cookie exchanges on both inspected origins. A separate initial checker
mistakenly demanded machine-route headers on unchanged early Proxy421; reviewer
confirmed the correct existing no-store contract. That operator assertion alone
was corrected; initial results are retained, and source f8383f3 never changed.

After the final30checks, Preview capability revocation reported remaining0.
Fresh requests with the old alias capability and Preview capability on BOTH
origins all returned302to Vercel authentication. Seven local secret/capability
copies were removed and this run's owned staging lane was released. No
project-wide protection setting or app session was altered.

## Separate storage proof and preservation

The exact-source reviewed Preview probe again passed creation, repeated draft
preservation, final-plan preservation and mandatory rollback. It used the
recorded Preview database, mp_runtime, verified TLS, bounded owned transaction
and existing eligible Google family, with an internal test-only Wednesday clock.
All seven domain-table counts/hashes matched before/after. No runtime HTTP clock
override or persistent fixture was introduced. Fresh post-HTTP aggregate counts
remain1Google family,0Google menu entries and0plans.

All three Production aliases remain on recoveredGL3g/source4fe, unpaused, with
empty active cron definitions. The four settings retained from the failed
attempt remain unused by that restored deployment. Only staging moved773U→12CQ;
the old Preview and failed Production artifacts were retained. No new Production
build/promotion/configuration change, schema/grant/data change, identity issuance
or paid/provider request occurred during corrective preparation.

## Owner acceptance limits and fresh release gate

This evidence proves both actual Preview service origins, runtime URL binding,
unchanged ordinary Host rejection and separate rollback-only storage behavior.
It does not prove due-Wednesday deployed HTTP writes, automatic native delivery,
hosted cancellation cleanup, new hosted Google/member UI or paid provider success.
Those remain named limits; local Chrome and storage fixtures retain their own
proof classes. The inherited moderate esbuild advisory remains with zero high/
critical findings and its existing2026-12-01 reassessment.

The first attempt's registered-host defect is no longer treated as an acceptable
unknown. A future approved Production candidate MUST show generated service401
without credentials while ordinary paths remain421. After promotion BOTH actual
registered cron hosts MUST equal that inspected candidate's own generated URL.
Any known mismatch fails release even if ordinary anonymous health passes.

The [fresh package](hosted-target-correction-release.md) binds f8383f3/12CQ/profile
and these exact results/gaps. Owner staging acceptance and human merge/release
approval for this new source remain pending. No unexpired timestamp on the
consumed7fe authorization permits another Production attempt.
