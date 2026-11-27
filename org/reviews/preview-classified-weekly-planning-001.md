# Classified weekly planning — independent actual Preview operation review

- Reviewer: reviewer
- Date: 2026-11-27 (America/Toronto)
- Owner authority: `9e249a2`, `preview_cutover_authorization-001`
- Actual result reviewed: `a4b22dd`, handoff `f78a4a3`
- Fixed source: `f0b8c1e3a8dd0ae55e8a7568c53cef00637bb8b5`
- Preview: `dpl_5pWi2uFG3M6pMKkgrM6eB29rkz3S`
- Artifacts: `intent/classified-weekly-planning/staging-validation.md` and `.json`
- Verdict: **Approved as a faithful bounded operations record for owner staging acceptance**
- Blocking findings: none.
- Owner staging acceptance and separate Production authority remain pending.

## Scope and attribution

The committed owner approval names this exact Preview/source/Neon target, only
native identity80fd3d65-d202-462b-883d-6adc2eb565be, backup/preservation, staging
alias, possible503 compatibility gap, finite scoped platform access/revocation,
keyless validation and limited recovery. Independently verified its committed
hash-chained gate record. It does not authorize Production migration/build or
promotion, new grants, synthetic/app data, real Google or provider effects.

Reviewed the sanitized result against original private operator receipts using
local boolean/digest comparisons. No private row contents, connection strings,
cookies or capability values were printed or committed. No new capability,
network call, application write, schema effect or provider change was performed
by this review. Live provider/database assertions remain operator observations;
independent receipt verification is distinct from fresh live corroboration.

## Database and preservation evidence

Compared `before-private.json`, `after-private.json` and
`final-database-private.json`: baseline8identities becomes9, with no pending
migration after. Every one of13preservation datasets (12application tables plus the legacy
`__drizzle_migrations` ledger) and their full aggregate
digest, exact grant digest, five legacy rows and all three preexisting native
rows remain identical. Only the approved native identity is added. Final profile,
catalog, grant/domain digests and identity count equal the committed JSON.
Restricted-runtime validation and TEMP-denied receipts are true after and at
final14:49:43.500Z. No grant reconciliation was requested.

Raw `migration-committed.json` exactly matches the committed single-identity
receipt: commit14:47:13.466Z and the reviewed SQL hash. Independently compared the
private operator export's migration, connection, validation and compatibility
modules, manifest and new SQL bytes to the fixed Git source; all match. This
supports exact reviewed tooling rather than a later audit source substitution.

Independently rehashed the retained private PostgreSQL17custom archive:57,909bytes,
SHA256 `facf4a340dcecae067cab03a467f212356fc4b9a8491a9a056c73cc10036cfed`.
Re-executed `pg_restore --list` locally and verified14public TABLE DATA entries:
12application tables plus the historical and native migration ledgers. Backup evidence equals the
committed JSON; directory modes are0700 and archive mode0600. No restore test was
performed or claimed. The initial missing-libpq-root-cert failure and successful
system-root/verify-full retry are disclosed without a weaker TLS fallback claim.

## Routing, health and cleanup

Raw routing receipts match all four committed before/after alias entries: only
stable staging changes from4oNh to5pWi. All three Production aliases stay onGHCp;
project/domain/protection fingerprints and unpaused state are preserved. The
candidate receipt confirms READY, Preview target and the full fixed source.
The alias receipt timestamp is14:47:20.434Z. Migration/alias timestamp difference
is correctly not called measured user outage.

All11raw post-cutover health observations equal the committed records and satisfy
the bounded approved contract: stable root307 to same-origin sign-in, sign-in200,
session/search401, disabled scheduler404 on both origins, ordinary generated
root/sign-in/session/static421/no-store, and exact generated menu421 with headers.
The four early Proxy421responses omit DENY/nosniff; the result explicitly records
this supplementary limitation rather than claiming universal header coverage.
Exact menu/scheduler and stable responses retain the required security headers.
A disabled404 remains disabled-scheduler evidence, not an enabled Bearer/Host pass.

One finite candidate-scoped link was created; no project-wide bypass, regenerated
link or protection-removal claim appears. The original narrow revoke probe exit2
is preserved. Separate raw fresh cookie-free observations match the committed
302redirects to `https://vercel.com/sso-api` on both origins at14:49:03–04Z and
prove bounded post-revocation application denial. This does not prove every
platform/WAF protection behavior or invalidate an already-held platform cookie.

Credential and lane-lock cleanup receipts exactly match the committed package:
owned connection/link copies deleted, two owned locks released14:50:21Z,
unrelated locks untouched, shared CLI authentication and backup preserved.
Independently inspected the private credential directory: no connection/link
bytes remain; its only remaining file is an empty log. No contingency pause was
needed, and no Production effects are reported in this operation.

## Coverage limits and next gate

The evidence is explicitly hosted keyless operator proof. Authenticated4/2/2 UI,
plan mutations, Google OAuth, provider/photo/cancellation, hosted browsers/mobile/
Firefox/Safari, synthetic runs, enabled scheduler service authority and unattended
Wednesday dispatch were not exercised. Local tests/screenshots are separate.
The ten named gaps, untested restore, inherited moderate esbuild advisory and
unresolved live runtime-trace reassessment remain visible; no clean-audit or
functional-hosted pass is invented. The existing2026-12-01 advisory review deadline
is not extended by this review.

Approve this faithful actual record for the owner's exact-source staging result
and gap decision. This reviewer does not accept those gaps on the owner's behalf
or grant Production authority. A separate Production build/migration/manual
promotion/recovery scope must follow owner acceptance under the existing runbook.
Preserve the current nine-identity Preview schema/data; the old artifact is an
unsafe rollback target and no restoration authority follows.

## Independently executed checks

- Committed Preview approval ledger verification: exit0.
- Sanitized JSON consistency assertions:11checks, single8→9 migration, exact
  source/target/Ready attribution, staging-only alias delta, one revoked link,
  freshSSOdenial, disabled Preview, ten gaps and pending human gates: pass.
- Original private receipt/preservation/backup/source-byte comparisons: pass;
  archive table counts independently confirmed14, without double-counting ledgers.
- Private archive hash/mode and fresh `pg_restore --list`: pass.
- `git diff --check`: exit0.
- Staged secret scan before review commit:0findings.
