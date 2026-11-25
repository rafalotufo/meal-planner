# Independent review: Brave search and current main integration

- Artifact: `brave-parallel-recipe-search-main-integration`.
- Reviewer: reviewer, independent of integration and feature authors.
- Exact source: `73bb7f3763fd3a9428d31548345d2f66b54c09ec`.
- Merge parents: feature `c0c8858` and main `1f7cf8b`.
- Verdict: **Approved for the authorized local main integration. No blocking
  correctness, security or scope findings.**
- Combined verification and final handoff remain orchestrator gates. This code
  review does not claim unfinished checks passed or authorize remote/hosted work.

## Bugs and compatibility

The complete application/runtime diff against main contains only the previously
reviewed Brave source modules, notebook changes and their tests. Main's auth,
shared session, family/identity/invitation/menu/plan stores, Proxy, seven-identity
migration catalog/compatibility/SQL, verification runtime/routes and build scripts
are unchanged. Their thirty-day fixed Google-session lifetime, one-hour account
cookie and distinct Preview verification behavior are preserved byte-for-byte.
No main feature is dropped to restore the feature branch's older database or
session contract.

Conversely, all Brave application changes and recipe tests are byte-identical to
feature `c0c8858`, whose application source was approved at `e14feec`. The source
instruction-ItemList correction and 8000ms absolute curation deadline therefore
remain intact, including no late queued start/output, parent abort precedence,
valid partial results, mixed-rejection timeout and retained active leases.
The twelve-card notebook's six-source chunk checks and save/lookup race guards
are unchanged. There are no additional runtime merge resolutions to review.

## Narrow manifest amendment and security

I explicitly approve the main-integration.md amendment allowing
`tests/verification/server.ts`. Its sole diff empties OPENAI_API_KEY,
BRAVE_SEARCH_API_KEY and BRAVE_API_KEY after inherited process environment, and
selects Brave. No later option restores those keys. This brings the main-added
verification fixture under the same paid-provider isolation as the feature's
auth fixture. It changes no production authentication path, target, provider
budget, endpoint permission or database behavior.

## Audit preservation and compliance

Independent inspection verified every archived audit file against its source
Git blob and manifest SHA256: 409 feature files at `c0c8858` and 393 main files
at `1f7cf8b`, with zero mismatches. Both original chains and colliding message
histories remain recoverable. Main's ledger is an unchanged byte prefix of the
integrated canonical ledger. All seven transcribed Brave decisions preserve
the original gate, artifact, commit, approver and decision, and cite their
original hashes rather than manufacture new approvals. The committed canonical
chain verifies. Canonical message validation reports 399 messages, 0 violations.
The solved nine-of-ten feature loop is retained; integration grants no loop
extension or further paid call.

## Verification and limits

I independently reran `pnpm test` after integration: **112 passed, 0 failed,
0 skipped**, exit 0, output `/private/tmp/brave-integration-review-tests.log`.
The integration author records frozen install, lint, typecheck, production build
and seven Python tests passing. Broader combined database suites and actual
Chrome verification were still running when this report was written; final
main fast-forward/handoff must use their actual results. I performed no paid
provider call, database action or application/test edit.

Prior named eight-card and broad one-card live observations belong to historical
source `2989467`, not a new live test of this integrated SHA. Weak broad recall
remains disclosed and the prior PM acceptance stays limited to local functional
scope. This approval supplies no push, deployment, migration, staging issuance,
hosted key change or Production release authority.
