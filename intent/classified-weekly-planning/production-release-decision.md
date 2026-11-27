# Classified weekly planning — Production decision package

- Status: Proposed; owner exact-result staging acceptance and Production
  authorization are pending. This document performs no release action.
- Fixed release source: `f0b8c1e3a8dd0ae55e8a7568c53cef00637bb8b5`.
- Reviewed operational plan: sibling `hosted-cutover-plan.md`, review `a4d6986`.
- Actual staging evidence: sibling `staging-validation.md` and JSON (`a4b22dd`).

## Staging result to accept

Ready Preview `dpl_5pWi2uFG3M6pMKkgrM6eB29rkz3S` serves the stable staging
origin for the exact fixed source. Native migration80fd committed14:47:13.466Z
on2026-11-27; staging alias assignment followed14:47:20.434Z. No user outage
duration was measured. Nine-identity profile SHA256 is
`0c854fcd29a0561d17e2d2effb03dcfc661aa9e192719ae1d0349bf580d9fb3e`.
Strict schema/runtime/grant checks, application data and old-ledger preservation,
private backup archive checks and required anonymous health passed. The one scoped
link was revoked and fresh SSO denial proven on both origins. Owned credentials
and locks were removed. Production remains source91c419e/GHCp and unpaused.

The precise evidence class is keyless hosted operator checks, not a full hosted
functional/browser pass. Accept these named limitations explicitly: no hosted
Google OAuth, authenticated planning UI/4-2-2/swap/approval/finalization, paid
provider/photo/cancellation, hosted mobile/Firefox/Safari, enabled Preview
scheduler Bearer flow or unattended cron observation. Finite scoped platform
access enabled application smoke; it is not comprehensive WAF/bot proof. The
backup was archive-inspected, not restore-tested. The existing moderate esbuild
advisory and outstanding live-runtime-trace reassessment remain, with zero
high/critical audit findings and the existing2026-12-01 reassessment deadline.
Generated early Proxy421 has no-store but lacks supplementary DENY/nosniff;
exact menu/scheduler and canonical responses retain those checked headers.
See the actual staging artifact for every observed status and proof boundary.

## Concrete one-attempt Production scope proposed

Use only the existing Vercel project `prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, team
`team_2c0O29FMb91g7L6sUChc9v6J`, scope `rafalotufos-projects`, Hobby resources.
Production database is only Neon `plain-pond-82425009`, branch
`br-wild-dust-bbr2mvzw`, database `meal_planner`, direct endpoint
`ep-lively-tooth-bbi1n111.c-15.us-east-1.aws.neon.tech`; retain distinct existing
mp_migrator/direct and mp_runtime/pooled verified-TLS credentials.

1. Reverify exact fixed source, accepted staging profile/alias, current Production
   schema8/only80fd pending, private configuration/parity and current routing.
   Sibling `production-parity-read.json` records a14:55:07.253Z read-only check:
   canonical auth origins, corepack, Production scheduler enabled/Wednesday/fixed
   service origin matched; Node24, unpaused GHCp/source91c419e remained. No sensitive
   values were read. Refresh before effects; unexpected drift is a stop.
2. Build ONE distinct Production candidate from the verified151-blob fixed-source
   export using pinned CLI66.6.0 `deploy --prod --skip-domain` with explicit
   project/scope/source attribution. Do not promote Preview or deploy audit HEAD.
   Inspect Ready, exact project/target/source/generated hostname, runtime/build,
   duration/cancellation and retained configuration. Any required evidence that
   cannot be established remains a blocker or an explicit owner gap decision.
3. If necessary create at most one candidate-scoped private Shareable Link for
   at most30minutes. No project-wide bypass, protection removal or app cookie.
   Verify candidate ordinary/static/session421/no-store, exact menu421/private
   headers and its own generated scheduler GET401/private headers with NO Bearer.
   Revoke the link and establish fresh denial before promotion.
4. Take a complete private PostgreSQL17 custom-format Production backup, verify
   archive/table/ledger listing and hash; this confers no restore authority.
   Recheck strict schema/history/grants and preserve baseline data/ledger digests.
   Apply ONLY `80fd3d65-d202-462b-883d-6adc2eb565be`, SQL SHA256
   `2b9ffeb679e365c96aa862a6e808f0b2a87f9cd97a17cdafa0bfd3226ea669b5`,
   via pinned reviewed tooling with no runtime-grant reconciliation. Verify nine
   identities, exact catalog, restricted runtime and unchanged grants/data/history.
5. The owner accepts a possible brief503 compatibility gap between schema commit
   and manually promoting THAT inspected Production candidate. Record timestamps
   without claiming a measured outage. Preserve all three existing Production
   mappings and the accepted staging mapping, auth origins, secrets and settings.
6. Verify canonical `https://lotufo-meals.vercel.app` anonymous health: root307 to
   its own sign-in, sign-in200, session/search401, no-store. Inspect all intended
   aliases/source/config and BOTH registered cron definitions: owner deployment
   equals the new artifact, exact own generated Host/system VERCEL_URL, exact
   `/api/plans/generate`, unchanged Wednesday13/14UTC schedules.
7. Observe sanitized runtime/configuration errors and HTTP5xx for15minutes after
   promotion, with bounded updates and closing health/routing checks. Record actual
   coverage and failures honestly. No Production Google login, app-session/data
   effect, paid provider request, WAF burst or manual valid-token generation.
8. After schema commit old eight-identity artifacts are unsafe rollback targets.
   On required health/configuration failure or incomplete required evidence,
   preserve schema/data and use ONLY an explicitly authorized emergency pause of
   this shared meal-planner project (which can also affect Preview). Any interactive
   project-name confirmation remains owner-operated. No automatic resume, second
   release attempt, incompatible rollback, table deletion, ledger rewrite, backup
   restore, credential rotation, paid plan or unrelated config change follows.

Record separate committed staging_acceptance and release_authorization decisions
only after the owner accepts this actual staging result/gap list and concrete
Production scope. Source remains fixed despite later approval/audit commits.
This completed Preview operation and this proposed package grant no standing
permission for another release, migration or recovery action.
