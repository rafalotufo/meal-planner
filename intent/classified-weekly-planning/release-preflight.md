# Classified weekly planning — release preparation result

- Fixed release source: `f0b8c1e3a8dd0ae55e8a7568c53cef00637bb8b5` (requested main).
- Later audit HEAD is not a replacement upload source.
- Cutover proposal: sibling `hosted-cutover-plan.md`, independently reviewed in
  `org/reviews/release-classified-weekly-planning-preflight-001.md` (`a4d6986`).
- Sanitized actual results: sibling `release-preflight.json`.

## Completed preparation

Verified a clean main baseline and exported151 tracked Git blobs,1047842bytes.
Every exported blob matches the exact fixed source; operator/private files are
excluded by the reviewed upload rules. Existing local application tests and
independent security/code reviews remain applicable to this unchanged source.

The pinned CLI66.6.0 rejected Preview `--skip-domain` before creating a deployment;
that flag is Production-only. The corrected ordinary Preview build used isolated
preparation ref `classified-planning-f0b8c1e`, explicit exact-source attribution,
and existing Preview configuration, without `--verify` or a protection bypass.
Provider inspection, rather than misleading `--no-wait` CLI readiness text,
confirmed Ready at2026-11-27T14:05:18.197Z:
`dpl_5pWi2uFG3M6pMKkgrM6eB29rkz3S`, generated origin
`https://meal-planner-9sutdnafh-rafalotufos-projects.vercel.app`.
Project attribution matches the existing project, Preview target and Node24.

Before/after complete alias inspection confirmed stable staging remains
`dpl_4oNhN5c8HvSwBZ1HcDEWLsWFM7kA` and all three Production aliases remain
`dpl_GHCptaMFGM7gFDHJEE7zF3kJbJTM` (source91c419e). Production is unpaused.
No stable alias or existing deployment was replaced. No staging-lane lock or
canonical alias cutover was attempted; obtain the owned lock before those effects.

The anonymous candidate helper returned exit2, pass=null, status=null,202ms:
**inconclusive**, not an application boundary/functional success. No platform
capability was created to bypass it. The existing canonical Production anonymous
baseline passed, exit0, last status401,2064ms; the helper asserted root307 to the
same-origin sign-in, sign-in200, protected session/search401 and no-store.
Its empty anonymous search request has no provider effect.

Read-only connector inspection of both exact recorded Neon targets confirmed
five historical rows and three native rows, including the applied classification
migration. Only `80fd3d65-d202-462b-883d-6adc2eb565be` is missing; the current meal
array maximum is7 and suggestion maximum index6. Runtime TEMP remains denied on
both. This limited inspection is not a claim that complete catalog/grant parity
or preservation backups have already passed. Those checks are required afresh
before any authorized migration. No database write was performed.

## Dependency audit and limits

`pnpm audit --json` exited1 with one moderate esbuild advisory and zero high,
critical, low or informational findings. `pnpm why esbuild --json` confirms
vulnerable0.18.20 through the Drizzle Kit/@esbuild-kit tooling chain, including
Better Auth's dependency path; dev-only placement is not proof of runtime exclusion.
This is the existing GHSA-67mh-4wv8-2f99 finding, whose development-serving
reachability assessment and2026-12-01 review deadline are recorded in
`intent/agent-deployment-verification/hosted-cutover-plan.md`. No dependency upgrade,
audit suppression or extended deferral was made. Exact deployed runtime trace
reassessment remains part of release review; no clean-audit claim is made.

Ordinary Preview retains disabled verification and scheduler configuration.
Its scheduler404 is expected but does not prove an enabled service Host/Bearer
boundary. No hosted Google login, authenticated member UI, synthetic run/data,
provider/photo success, cancellation/WAF exercise or unattended scheduler run was
performed. Local fixture success remains a separate proof class. This preparation
is **not** accepted staging evidence or Production release authorization.

## Required owner decision

Before any Preview schema effect, approve only the reviewed migration on the
recorded Preview target, private backup/preservation checks, same-source stable
staging alias cutover, a possible brief503 compatibility gap, and bounded keyless
anonymous/schema validation. An alias-scoped temporary platform link may be
created/revoked only if explicitly included in that approval; no project-wide
bypass, synthetic principal/data or paid provider usage follows.

After schema commit the old staging artifact is incompatible. The proposed safe
failure disposition is an explicitly authorized project-only pause if required
health cannot be established, acknowledging Preview/Production shared-project
impact and owner-operated interactive confirmation. There is no safe established
old-artifact rollback; preserve new schema/data and never restore/reset history.

Actual exact-source staging results and named gaps must then be presented for
owner acceptance before the separate Production migration/build/manual-promotion
scope. See the independently reviewed cutover proposal for exact project/targets,
migration hash, health window and recovery boundaries. No Production candidate,
migration, alias promotion, pause/resume or remote push has been performed here.
