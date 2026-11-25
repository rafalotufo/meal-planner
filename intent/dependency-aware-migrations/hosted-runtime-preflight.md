# Hosted runtime preflight — corrected candidate

- Date:2026-11-25; operator:orchestrator.
- Requested main at intake:e4b8c954; main remains unchanged at that revision.
- Fixed corrected application candidate:`25aaa9b` (not yet merged or deployed).
- Security approval:`6c70e99`; code-only approval:`2ba20b0`.

## Actual read-only hosted compatibility

The complete validator, not just the new pure policy, passed both recorded
targets using their existing restricted runtime credentials and verified TLS:

| Environment | Actual completed UTC | Result |
| --- | --- | --- |
| Preview |2026-11-25T13:30:22.205Z | strict runtime compatibility passed;5legacy migrations;no native ledger |
| Production |2026-11-25T13:30:25.226Z | strict runtime compatibility passed;5legacy migrations;no native ledger |

Both history/catalog/native-ledger snapshots have SHA256
`86c04604798d247bef5abb4d11310f12f8239d86afdf242e2a245d86fb9ee740`.
These are operator-observed bounded read-only transactions, not the security
reviewer's independently executed hosted tests and not deployed application
session/menu behavior. No hosted role, default privilege, column option, schema,
ledger or application row was changed. No fake business data was created.

## Blockers found and corrected before deployment

Original main e4 failed the new role/default-ACL checks against both hosted
targets. Actual application grants, role flags, namespace ownership and required
effective access were intact. The narrowly reviewed finite platform contract
recognizes only the real catalog-bound administrator tuple and exact9-row
platform default baseline; all unknown shapes still reject.

Intermediate source585 then reached a separate incompatible-schema check.
Full application catalog and ledger matched exactly, every identity/generated/
collation field was expected, and all other security predicates were false.
The only unexpected field was singleton pg_attver on61 ordinary table columns.
Primary PostgreSQL security-backpatch documentation and source establish it as
internal tuple-version metadata, not an application schema option. Source25
validates only its exact canonical positive uint64 marker with real row-type
binding; it does not clear metadata or ignore ordinary/unknown options.
See `attribute-options-amendment.md` and the independent source reviews.

The browser-native control attempt stalled; it made no hosting/database change.
After it returned, all account/alias/environment and hosted database observations
were refreshed. The in-app browser is now available for eventual staging UI
inspection. No stale gate, alias readback or old release authorization is reused.

## Existing Production and configuration observations

Read-only Vercel inspection at2026-11-25T13:09:39.314Z confirmed the recorded
Hobby meal-planner project/team, unpaused state, Node24.x, Fluid iad1, no Git
integration and automatic Production assignment disabled. Production remained
READY `dpl_AeQVDaT7ZCC99oLfjunTyiD1vA3a`, source
`d26ea59742f904f399128477bfeb369a0049ba62`. All three Production aliases pointed
there; isolated staging remained EHXQ with its main-qualified domain. Canonical
lotufo-meals routing was direct with no domain redirect. No setting changed.
These observations will be refreshed immediately before staging/release effects.

Environment metadata digest was unchanged:
`90ad795dfc14c4915b4f9a2ae8b67d624194b6fbc79fd5db5bb0ef76bebee59e`.
At13:18:58.468Z/13:19:01.735Z, individual non-secret origin/provider/Corepack/model
values were verified privately for Preview/Production. Preview remained keyless;
Production retained its existing sealed provider entry. The Google/auth/database
sensitive entries were not retrieved or copied. No credential/domain/protection/
billing/provider/WAF change or paid request is authorized or performed.

Current canonical Production anonymous smoke exited0, status401/pass=true,
elapsed2299ms. The helper verified root307 to same-origin sign-in, sign-in200,
protected session/search401 and no-store. Its unauthenticated empty search has
no provider effect. This is existing deployment health, not certification of the
new candidate or a real Production Google/member/provider test.

## Truthful staging and remaining gates

The stable isolated Preview domain is explicitly qualified to main. The
correction is still on the feature branch. Do not label its unmerged Git ref
as main or change domain configuration to avoid a gate. Independent review
requires a concrete new human main-merge approval before using that stable
main lane. Full candidate verification and fresh exact-source packaging are
prepared before requesting that narrow approval.

After approval, preserve the fixed source25 SHA separately from later audit
commits, merge it into main, and deploy that same reviewed revision to the
existing keyless staging lane with truthful main-ref attribution. Obtain actual
Preview ID/source/profile/alias/configuration/runtime/HTTP/browser evidence.
Then obtain owner acceptance of the observed staging result and remaining named
gaps, plus concrete Production candidate/promotion/15-minute health/recovery
scope, under the staging-first policy. No old accepted source or gap decision
certifies this new source. No Production candidate or promotion has occurred.

Proposed compatible recovery remains current AeQV/d26 only, subject to fresh
configuration/schema/readiness verification and explicit release authority.
No old two-migration artifact, database rollback/reset/restore or project pause
is implied. Main merge and release authorizations remain separate human gates.

## Final reviewable handoff

Final evidence155d00a records328 passing Node tests,7 Python tests, clean lint,
typecheck/build and both real-Chrome suites. Exact-source packaging verifies
126 files/738556 bytes and an upload-only frozen install/build with every source
hash unchanged. Independent final readiness54f7481 approves source25 for the
new human main-merge decision, followed by truthful same-SHA staging. The fresh
dependency audit retains one reviewed moderate tooling advisory and zero high/
critical findings; it is not a zero-finding audit.

Final workflow checking initially found three missing ledger entries for existing
PM/peer approvals. Independent reconciliation75b2762 appends their documented
decisions at the current transcription time, without backdating or adding human
authority. Strict workflow consistency now passes (6 nodes,151 records); loop,
message and memory checks report zero violations and seven Python tests pass.
`org_loop.py next` stops at `gate_required` for the new main-merge decision.
Main remains e4b8c954; Production remains AeQV/d26. No staging deployment,
Production candidate, promotion, database mutation or Git push has occurred.
