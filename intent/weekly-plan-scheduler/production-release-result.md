# Wednesday scheduler — failed release and compatible recovery

- Date:2026-11-26; operator:senior-developer under org orchestration
- Result:**rolled back; scheduler activation failed its registered-target contract**
- Owner authority:`weekly-scheduler-production-20261126`, committed41a7ef0
- Fixed releaseSourceSha:`7fe1531d07f2fb6028c98e4f38b73d20f805e5fa`
- Candidate:`dpl_Ed9cFJnmhMyUPc5QK1NhxzxkfESJ`
- Final Production:`dpl_GL3gRCVHKknoJjBacFhwNbm2d1oo`,source4fe9097
- Staging retained:`dpl_773UDFo49UGV7yyzG4d5QdF49tRb`
- Sanitized evidence:[production-evidence-20261126](production-evidence-20261126/)

## Authorized preparation and candidate checks

The clean main checkout fast-forwarded from4fe9097to the reviewed feature and
approval audit41a7ef0. Production upload remained the fixed146Git-blob export
of7fe1531,935029bytes, independently verified against its committed manifest.
Later audit HEAD was not substituted for the staged release source.

Read-only inspection of the exact recorded Production database matched all
seven migration identities, hashes/descriptors and247profile catalog entries.
The connector's initial100-row cap was detected and resolved using a single
JSON aggregate; the incomplete result was not accepted as schema evidence.
No migration, grant or database write was performed.

Only four approved Production project variables were added: fresh independent
sensitiveCRON_SECRET, enabledtrue, explicitWednesday and the fixed automatic
service origin. The secret was32randombytes/64hex, passed privately via stdin,
never in argv/evidence. Targeted private reads confirmed the three non-secret
values and unchanged canonical browser BETTER_AUTH_URL. Other credentials and
settings were retained; no paid provider request or feature/plan change occurred.

A distinct --prod --skip-domain build became Ready asEd9c. Source, project,
Production target and accepted773U/profile attribution matched. Actual scheduler
and search functions were nodejs24.x/90seconds with cancellation enabled.
The candidate carried the expected Wednesday13/14UTC path/schedule definitions.
All three Production aliases remainedGL3g and staging remained773U before promotion.

The first anonymous candidate check was platform-inconclusive. A candidate-only
30-minute platform link then allowed the required421/no-store checks for root,
sign-in, session and icon.svg. It conferred no app session or scheduler authority.
The link was revoked before promotion: remaining0 and fresh old-link access302
to Vercel authentication. Independent reviewer approved these exact projections,
including the fresh Production-only sensitive secret and revocation proof.

## Promotion and newly exposed configuration failure

The exact same candidate was manually promoted once. Command interval:
17:36:01.738–17:36:05.870UTC,exit0. Provider aliasAssigned was
17:36:04.941UTC; the planned15-minute observation deadline was17:51:04.941UTC.
Initial canonical anonymous health passed: root307to same-origin sign-in,
sign-in200, protected session/search401,no-store (985ms total).

Post-promotion project inspection exposed the actual registered cron target:

```
host: meal-planner-8judu2h75-rafalotufos-projects.vercel.app
path: /api/plans/generate
schedules: 0 13 * * 3; 0 14 * * 3
```

Source7fe1531 accepts only the distinct fixed machine Host
`meal-planner-rafalotufos-projects.vercel.app`. The registered generated hostname
therefore contradicts the reviewed service-host contract. This is a **known
target mismatch**, not simply the previously accepted lack of an actual native
delivery observation. Canonical anonymous health cannot waive that failure.
No native scheduled invocation was forced or observed; today was Thursday.

Root and independent reviewer confirmed the mismatch immediately. The approved
runbook requires stopping activation on a known mismatch; no Host rule was
broadened and no second build/release attempt was made under this authority.

## Authorized recovery and final state

The explicit compatible rollback toGL3g succeeded. At17:38:18.196UTC project
inspection confirmed ProductionGL3g/source4fe9097, unpaused, and active cron
definitions empty. At17:38:57.906UTC all three Production aliases were verified
restored and staging still773U. Recovery canonical anonymous health passed the
same expected statuses/no-store contract (2226ms total).

The15-minute candidate observation was terminated by required recovery; this is
not a completed15-minute healthy release claim. The bounded candidate-interval
runtime/HTTP aggregate observation returned0runtime error/fatal records and0HTTP5xx
records through17:40:03.160UTC; both CLI queries exited0. Scheduler activation
remains uncompleted. No Production login, paid call, synthetic fixture,
authenticated plan generation, schema/grant/data change or history reset was
performed. Existing database state was not reverted or restored.

All owned local secret/capability copies were deleted after revocation and
evidence capture. The failed candidate remains available for audit. The four
new Production project variables remain configured but are not captured by the
restored old artifact; active cron definitions are empty. No broader secret
rotation or project setting cleanup was inferred from rollback-only authority.

## Consumed scope and correction boundary

The approved one-attempt7fe1531 release scope is consumed by this failed attempt
and its verified recovery. It grants no second Production attempt, migration,
grant, future recovery or unreviewed Host relaxation. Main retains the approved
merged history, while actual Production runs the compatible previous artifact.

A secure corrective design must account for the observed generated cron target,
pass independent design/security/code review and exact-source staging validation,
then receive fresh owner authorization before another Production release.
Actual unattended Wednesday delivery and hosted disconnect behavior remain
unobserved; none is fabricated from this failed configuration attempt.
