# Hosted validation corrections — independent source review

- Reviewer:reviewer; date:2026-11-25; independent of implementation.
- Exact source:`25aaa9b0d8b948bc6f24710214c9eaefe0ee8dcb`.
- Scope:combined platform-permission and upstream attribute-version correction
  relative to requested main `e4b8c954f6e2cab63c39216cef794187a227d79e`.
- Verdict:**Source approved; full verification, packaging, staging and owner
  release gates remain separate prerequisites.**

## Findings

No blocking bugs, security or compliance findings. The source implements the
independently approved finite contracts, with focused modules and catalog-fed
integration. Runtime privilege flags, actual/effective ACLs, schema/catalog
checks, history/checksums, transactions, explicit migration boundaries and public
error sanitation remain unchanged. No app/auth/UI, historical SQL or dependency
pins changed in this correction.

The permission helper requires the exact known hosted context, single trusted
creator-administration membership and complete nine-row platform default set.
Either provider indicator forces the full contract; generic empty contexts
remain supported. It does not infer safety from false SET/INHERIT options or
ignore arbitrary default grants. The attribute helper validates only canonical
positive unsigned64 pg_attver on actual catalog row-typed relations. It bounds
input before exact BigInt parsing, handles JavaScript's final-newline regex
behavior explicitly, rejects unknown/mixed/duplicate/malformed options and
leaves the server's tuple-safety metadata untouched. Identity/generated/
collation and ordinary option rejection remain strict.

## Independent regression sensitivity

Both experiments used owned random temporary mirrors with copied source/tests
and linked dependencies, no database or credentials, no workspace source edits;
mirrors were removed and workspace bytes checked unchanged.

- Permission suite:26/26 baseline. Replacing provider-indicator OR with AND
  caused three regressions to fail, including missing-indicator/empty-set cases.
- Attribute suite:6/6 baseline. Removing only the uint64 upper-bound condition
  caused the malformed-string regression to fail specifically at
  pg_attver=18446744073709551616. Source helper SHA256 remained
  `2241b18226ab3baa97ae304683398797d9da0c74f342c0c06c5ccaa789a783a6`.

The actual n_distinct owned-table regression remains in the strict TypeScript
database suite and checks both runtime rejection and explicit-migration rejection
without repair. Pure fixtures are not represented as hosted catalog mutations.
Independent security source reviews are `77780dc` and `6c70e99`.

## Evidence boundary

Source585's broad local results are intermediate, not certification of source25.
The orchestrator reports fresh complete read-only validation of Preview at
2026-11-25T13:30:22.205Z and Production at13:30:25.226Z, each with five legacy
migrations/no native ledger and unchanged history/catalog SHA256
`86c04604798d247bef5abb4d11310f12f8239d86afdf242e2a245d86fb9ee740`.
These are operator-attributed observations; I did not access hosted credentials
or databases. Final combined full checks/Chrome and new clean-source upload
inventory/build must be recorded before staging readiness is claimed.

This review authorizes no main merge, domain/ref configuration change,
deployment, hosted mutation, paid/provider exercise or Production operation.
Preserve truthful Git/source attribution. The existing release plan still
requires concrete exact-source staging evidence and owner acceptance of its
profile/named gaps and scoped Production/recovery authority.

## Final local source-readiness verdict

Reviewed final committed evidence `155d00a6ae77bf2b768451a244a157592a89456d`
and complete hosted-preflight record `d51781ce079124225aa9ae1df143b0846e6d3f64`.
**Approved: exact source25 is ready for the human main-merge decision and,
after that approval, truthful same-source isolated staging preparation.** No
remaining source-review blocker was found. This is not staging acceptance or
Production release authorization.

The engineer records successful frozen install, lint/typecheck/build,
328 Node regressions (69 migration,34 family,69 menu,23 plans,16 auth,
84 recipe/photo,33 deployment),7 Python regressions and both existing real-Chrome
suites. The committed browser JSON distinguishes fixtures from real provider
coverage; auth/T-Rex covers five widths and records no overflow/unexpected
errors. I manually viewed the390 mobile-menu and1440 running-T-Rex PNGs: readable
layout and preserved game/menu surfaces. I independently verified all eight
new image SHA256 digests. Historical image restoration is engineer-attributed.

I independently checked all126 upload entries against the fixed Git source:
SHA1, SHA256 and byte counts match, total738556 bytes. Both new helpers are
included; private environment/operator/audit/test state is excluded. Current
workspace upload-source SHA256 values also match all126 records. The engineer's
clean upload-only locked install/build and post-build byte verification provide
separate packaging evidence; I did not repeat that build. CLI66.6.0 is pinned
with scripts disabled. Fresh audit honestly reports one moderate existing tooling
finding, zero high/critical, with the recorded bounded deferral; no clean-audit
claim or dependency override is introduced.

The preflight distinguishes read-only hosted catalog compatibility from deployed
session/menu/provider behavior. Its successful full validators preserve both
five-row histories and catalog signatures; no migrations or grants were needed.
Main and Production remain unchanged. The main-qualified stable staging lane
requires new owner main-merge approval before use; do not fabricate gitCommitRef
or replace fixed source25 with later audit HEAD. After actual staging, obtain
fresh exact-source/profile/named-gap acceptance and separate scoped Production
candidate/promotion/observation/recovery authorization. Existing approvals are
historical. No deployment, push, merge, paid request or hosted mutation was
performed by this reviewer.
