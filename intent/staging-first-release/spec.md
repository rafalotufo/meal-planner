# Staging-first release — specification

- Author: architect
- Date: 2026-11-24
- Status: Approved
- Derived from: sibling accepted `intent.md`; existing isolated staging
  `intent/vercel-candidate-validation/spec.md`, `plan.md`, `staging-runbook.md`.
- Scope: active documentation only; no external action or release approval.

## Governing sequence

1. Select a reviewed clean **releaseSourceSha** and explicit validation/configuration
   profile. Complete existing applicable local verification and independent reviews.
2. Deploy that exact revision to the configured isolated Preview lane. Inspect
   source/Preview ID/alias/environment attribution; perform agreed functional,
   OAuth and browser validation on the stable staging origin.
3. Owner accepts the staging result and its stated gaps for that exact source,
   Preview deployment, configuration profile and validation scope.
4. Verify Production configuration/parity and obtain a fresh committed human
   release authorization naming the same releaseSourceSha and staging acceptance.
5. Build a distinct Production candidate from that revision, inspect packaging/
   readiness/configuration, manually promote that Production candidate, then
   perform minimal canonical anonymous health checks and monitor recovery.

This replaces the active first-release functional-validation placement in the
original Vercel runbook. Earlier Vercel spec/plan and completed release evidence
remain historical; their first-live OAuth/search/cancellation/WAF requirements
do not govern future releases under this amendment. No generic hook or ledger
format is changed; cross-referenced evidence carries the release-specific checks.
These are operator-verified process requirements, not a claim of new automatic
SHA/parity enforcement by existing hooks or the generic workflow runtime.

## Source and acceptance contract

Every release record must reference a sanitized staging acceptance artifact with:

- Exact releaseSourceSha, Preview deployment ID, stable staging origin and actual
  target/team/project, reviewed local verification and independent review sources.
- Validation interval and alias/source/configuration attribution, plus the
  configuration profile/version verified privately without secret values.
- Checks performed, outcomes and proof class: owner-reported behavior, observed
  Google round trip, reused real session, browser checks, local fixtures and
  provider/WAF/cancellation evidence are distinguishable. List missing checks.
- Owner acceptance and reference, including explicit acceptance of any deferred
  coverage/residual risk. Do not convert “working as expected” into invented
  per-check results. Refer to helper reports honestly, including inconclusive ones.

The existing staging check/finalize helper remains unchanged and useful for its
supported keyless checks. Its full pass requires its existing attestations.
An owner acceptance of limited/inconclusive evidence is a separate declared
release decision, not a reason to alter the helper, forge attestations or change
an inconclusive exit into a pass. Full functional validation must be sufficient
for the release scope; unresolved required checks block release until completed
or explicitly accepted as a named gap by the owner.

Compare the proposed Production source to accepted staging **by exact SHA**.
Do not replace this with equal-looking application files, a moving branch name,
or “main contains the staging commit.” Any new release SHA requires deploying/
validating/accepting that SHA on staging. In particular, the owner acceptance
of source9fc13ff is not evidence for current main or any new revision.

Acceptance/gate audit commits made afterward may reference the fixed release
source; deploy from a clean checkout/export of that pinned source, not an
implicitly changed HEAD. Record which commit is source versus later audit.
Staging alias moves, staging redeployment, changed relevant environment/schema/
runtime settings or changed validation scope invalidate readiness and require
fresh attributed staging validation and acceptance. Configuration values stay
private; a sanitized profile records revision/outcomes and intentional differences.

## Staging functional validation and paid-usage boundaries

Use the stable Preview origin and existing isolated secrets/database/admission
rules. Perform real Google allowed/denied sign-in, session/household behavior,
logout, keyboard/mobile/desktop/UI and recipe behavior needed by the agreed
release scope on staging. Session reuse does not test a new OAuth callback.
No generated candidate Google login, fake identity, wildcard trust, Host spoofing,
Production cookie copying or authentication bypass is introduced.

Provider/recipe/photo success, hosted cancellation and WAF enforcement can be
validated on staging **only** with separately authorized scoped credentials,
request counts, cost/budget, origin/IP/window and appropriate real evidence.
The process change does not copy a Production key, authorize any paid request,
change WAF policy or permit retry loops. Preserve local/provider/abort regressions
as their own proof class and retain limits/cancellation/SSRF contracts unchanged.

Current Preview has no OpenAI key. The existing optional `missing-provider`
check proves503 `SEARCH_UNAVAILABLE`, not provider success. If paid/provider
coverage is required, stop for its concrete scoped authority; otherwise record
provider success unverified and obtain explicit acceptance of that named gap.
Never move a missing staging check to Production as an automatic fallback.
A protection bypass may help reach the app but cannot certify WAF/bot/platform
rate-limit enforcement; protected/inconclusive traffic stays inconclusive.

The helper's `providerKeyAbsent` contract is preserved. A separately authorized
keyed staging exercise uses its own bounded operator evidence and reviewed scope;
it cannot be forced through the keyless helper or reported as that helper's pass.
After relevant staging config changes, refresh validation/acceptance for the
actual intended profile; do not reuse a report from a different key/config state.
No persistent fake data, reset, schema migration or invitation/provisioning write
is implied. Existing real staging identity/data authority remains separately scoped.

## Production configuration and parity before release

Production deliberately differs in canonical origin, OAuth client/secret, auth
secret, restricted database URL and any separately authorized provider key.
Verify those exact intentional differences privately and record only names/scopes,
profile identifiers and outcomes. Preview never receives Production secrets/data.
Other release-relevant application/provider model/build/runtime/duration/
cancellation settings must match the accepted profile or be explicitly reconciled
before readiness. Unknown/unexpected differences invalidate readiness; revalidate
staging and obtain renewed acceptance for the revised profile as necessary.

Owner intends `https://lotufo-meals.vercel.app` as canonical Production origin.
It is currently recorded as redirecting to the old Production hostname. Before
building/promoting, separately authorized configuration must ensure this hostname
serves the app directly, Production `BETTER_AUTH_URL` is that exact origin, and
the actual Production Google Web client registers exactly
`https://lotufo-meals.vercel.app/api/auth/callback/google`.
Verify consent/eligibility settings and the restricted verified-TLS Production
database target without disclosing values. Do not assume the staging OAuth client
or its registration satisfies Production. Do not weaken canonical Host rejection
or merely rely on an old-host redirect. Canonical Production domain configuration,
Google changes and credentials require concrete authority; this amendment does
not provide it. Preserve the staging branch-qualified domain and all unrelated
Production mappings; record any explicitly approved domain changes precisely.

## Production deployment and minimal health contract

Keep `deploy --prod --skip-domain` as the Production packaging/readiness step,
then manually `promote` **that Production candidate** under release authority.
Do not promote Preview, rebuild a different source, auto-assign Production domains,
or treat pre-promotion packaging checks as functional validation.
Read-only inspection verifies source/project/target/readiness/build/runtime and
approved environment/configuration inventory. Existing noncanonical candidate
smoke mode may assert421/no-store as a boundary check; it proves neither Google
login nor functional readiness. Unknown/platform-blocked observations are marked
inconclusive and cannot silently satisfy a required packaging check.

Before commands, verify the existing committed/unexpired `release_authorization`
record. It must bind exact source/project, accepted staging artifact/profile,
Production candidate/promotion scope, short post-promotion health window and
recovery authority. This policy approval is not that release authorization, a
merge approval or authority to resume a paused project. Preserve manual gates.
The owner may give staging acceptance and concrete Production release authority
in one explicit approval when exact source/project/actions/budget/recovery scope
is reviewable. Record the appropriate separate gate decisions without asking
for the same permission again. The policy change and old staging approval alone
do not authorize the present Production release.

After promotion, run the existing anonymous smoke at the canonical origin:
root307 exactly to same-origin `/sign-in`, sign-in200, protected session/search401,
no-store headers. Its anonymous empty search POST has no provider effect. Confirm
Production alias/deployment ID and configured canonical routing; inspect runtime
errors privately. Do not require a real Production login, paid normal/disconnect
search, WAF burst or full browser regression as routine release certification.
These functional checks now belong on staging, with the scope limits above.
Read-only configuration and anonymous health do not prove real Production OAuth,
provider availability or authenticated database behavior; state those residual
limits instead of claiming a full live Production functional test.

Keep a bounded15-minute post-promotion observation/recovery window, unless the
specific release record selects a stricter window. On required health failure or
incomplete canonical/configuration evidence, stop and use only the authorized
recovery: safe known-good Production rollback or scoped project pause if no safe
artifact exists. Verify resulting traffic state and record sanitized evidence.
Never roll back to revoked secrets/unsafe membership or reset/migrate data. A
shared project pause can affect Preview; require its explicit release recovery
scope, never pause all projects or revoke shared keys. Do not retry paid checks
or extend a release window without authority.

## Documentation-only acceptance

Production runbook, staging runbook, README's Vercel section and a surgical
AGENTS release-order note must agree on this sequence and cite this amendment.
Historical specs/plans/evidence/owner approvals remain unchanged; active guidance
clearly states which future release requirements supersede old first-live scope.
No code/helper/tests/CI/generic gate/dependencies/credentials change is needed.
The workflow graph may show an owner-attested `staging_acceptance` dependency
before `release`, retaining human merge and release gates. Its artifact must be
the actual future release-specific acceptance; do not close it using historical
setup verification or an old-SHA approval. Existing generic tooling remains an
audit aid, not a new automatic exact-source enforcement mechanism.
Review the documents against cases: accepted exact source, different main SHA,
changed configuration, keyless staging, platform-blocked checks, canonical
redirect still present, missing release authority and failed Production health.
Run existing Python workflow regression, workflow/ledger consistency checks,
link/path checks, diff whitespace and zero-secret scan appropriate to staged docs.
No new tests mirroring prose or application builds/browser claims for docs only.
