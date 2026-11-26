# Wednesday weekly scheduler — exact-source staging validation

- Date:2026-11-26; operator:orchestrator
- Status: completed; owner accepted the exact source/profile and listed coverage limits on2026-11-26. See `production-authorization.md`.
- releaseSourceSha:`7fe1531d07f2fb6028c98e4f38b73d20f805e5fa`
- Preview:`dpl_773UDFo49UGV7yyzG4d5QdF49tRb` (Ready, actual target Preview)
- Origin:[isolated staging](https://meal-planner-staging-rafalotufos.vercel.app)
- Project:`prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, team:`rafalotufos-projects`
- Profile SHA256:`0e9720bd59672d42d883cd024fc227e3643ebe88bfff42039ce899e0027cf7a6`
- Profile hash encoding: sorted-key compact JSON; the evidence file is pretty-printed for reading.
- Sanitized evidence:[staging-evidence-20261126](staging-evidence-20261126/)

## Source and configuration attribution

Independent [code review](../../org/reviews/code-weekly-plan-scheduler-001.md)
and [security review](../../org/reviews/security-weekly-plan-scheduler-code-001.md)
approve this exact source. Local results are in [verification.md](verification.md):
334Node tests,7Python workflow tests, required lint/typecheck/build and real
Chrome at320/1440 passed. The one inherited moderate esbuild advisory remains;
zero high/critical findings. No vendor patch or weakened check was used.

The upload was exported directly from146Git blobs of the pinned source,935029
bytes, with the existing upload exclusions applied. The committed manifest
records each uploaded path/hash. No working-tree/private environment, local
generated manifest, credentials, operator script, test or audit directory was
uploaded. API inspection bound source/profile/staging-ref/project to the Ready
Preview; the deployment inspector independently identified target Preview.
Later audit commits are not the release source.

The single deployment received Wednesday enablement, its fixed staging service
origin, a fresh independent CRON_SECRET and the exact recorded Preview restricted
DATABASE_URL via name-only CLI flags with values in the private child environment.
No secret appeared in argv, output or evidence. The known URL was attributed to
the existing Preview database/role over verify-full TLS and used by the probe.
The deployed HTTP skip alone is not evidence of database admission.

Branch-scoped variables were rejected by Vercel because this project has no Git
connection. Automatic approval review rejected a shared Preview-environment
fallback; that action was not performed. The independently reviewed narrower
deployment-only configuration succeeded. Final inspection confirms no scheduler
keys were added to shared Preview settings and Production inventory is unchanged.

Runtime inspection observed Node24 and90-second scheduler/search functions.
Both function-specific cancellation flags are true. The uploaded configuration
contains Wednesday13:00/14:00UTC definitions. Preview does not execute native
cron. Provider keys are absent; no paid request, beta feature or plan change.
The verification build manifest is disabled in this validation profile; no new
synthetic principal/session was issued. Previous Preview artifacts are retained.

## Actual hosted HTTPS proof

All13checks passed on the canonical staging origin, with private/security
headers checked on every response:

| Checks | Observed |
| --- | --- |
| Missing, wrong and coalesced service credentials |401each |
| HEAD,POST,OPTIONS,PUT,PATCH,DELETE with valid service credential |405each;Allow:GET |
| Query/date override with valid credential |400 |
| Authorized GET on actual Thursday; repeated GET |200each;skipped:true;allcounts0 |
| Ordinary session endpoint without app session |401 |

The platform capability was a staging-alias-only30-minute Shareable Link.
Its platform cookie was established privately on sign-in; the service request
had no query and still required its separate Bearer credential. The link was
revoked immediately after checks; remaining links0 and a fresh old-link request
returned302to Vercel authentication at16:34:51.680UTC. No global protection
setting or browser session was changed. Private capability/credential copies
were removed after evidence capture.

## Rollback-only staging storage proof

The separately reviewed operator probe used the same committed per-family core,
the exact recorded Preview endpoint/database, existing mp_runtime role, verified
TLS, reviewed catalog and60-second owned deadline. It selected the one existing
eligible Google family. An internal operator-only2026-11-25Wednesday clock is
test evidence; it is not a runtime HTTP clock override or unattended run.

Inside one common-locked transaction the probe inserted one temporary saved
snapshot, created a draft, proved a repeated call preserved that draft, finalized
the temporary draft and proved another call preserved it. The mandatory owned
sentinel rolled back the whole transaction. Counts/hashes across all seven
checked domain tables matched before/after. Fresh post-HTTP read-only counts
remain1Google family,0Google menu entries and0plans. No fake record persists.

The first operator attempt rejected Neon's extra channel_binding URI parameter
before database admission. Only the private connection URI was normalized to
the existing verify-full-only contract; no application guard/TLS rule changed.
The subsequent probe passed creation, draft preservation, final preservation
and rollback/hash assertions.

## Preservation, gaps and owner decision

All three Production aliases still point to
`dpl_GL3gRCVHKknoJjBacFhwNbm2d1oo`; Production source/configuration inventory,
unpaused state and empty cron definitions are unchanged. Only the existing
staging alias moved from6mx5to773U. No schema, grant, persistent test data,
Production write, provider request or Production deployment occurred.

The following are explicit limits for owner acceptance of this scheduler scope:

- Actual deployed due-Wednesday HTTP database admission/write was not observed:
  today is Thursday. Due behavior is proved locally with restricted real storage
  and separately by the Preview rollback-only shared-core probe.
- Native cron runs Production only. Its actual request Host and first unattended
  Wednesday delivery remain post-activation observations, not a pre-release pass.
- Cancellation configuration and local SQL settlement tests passed; actual hosted
  disconnect delivery/cleanup was not exercised on a due request.
- Responsive authenticated UI was tested in local real Chrome using established
  fixtures. A new hosted Google callback/member UI/browser session and paid
  provider success were not exercised in this keyless scheduler validation.

Owner accepted these exact results and named limits on2026-11-26 in
[production-authorization.md](production-authorization.md), approving merge and
the bounded Production release. The [release package](release-preparation.md)
binds the source/profile/results and approved action scope; actual execution
is recorded separately, without changing these observed proof classes.
