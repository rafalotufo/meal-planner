# Staging-first release — documentation implementation plan

- Author: architect
- Date: 2026-11-24
- Status: Approved
- Inputs: sibling accepted intent and draft specification; owner requested a
  release-process change, not a deployment or credential/configuration action.

## Files that change

Active guidance:

- `intent/vercel-deployment/deployment-runbook.md`
- `intent/vercel-candidate-validation/staging-runbook.md`
- `README.md` — Vercel deployment section only
- `AGENTS.md` — small future release-order/cross-reference paragraph only

New amendment artifacts:

- `intent/staging-first-release/intent.md`
- `intent/staging-first-release/spec.md`
- `intent/staging-first-release/plan.md`

Orchestrator-owned audit, separate from writer changes:

- `org/loop/{config.yaml,state.yaml,history.jsonl}` and a new archive of the
  completed previous run, including its graph/config/history/state
- `workflow-graph.yaml`, `org/status.yaml`, `org/messages/*.md`,
  `org/reviews/*staging-first-release*.md`, `org/memory/{context.md,events.jsonl}`
- `gates/ledger.jsonl` — only real role/owner approvals with actual evidence

No other files change. Do not rewrite original approved Vercel specs/plans,
historical release/setup/results evidence, README's historical pause/database
checkpoint sections, CLAUDE's unrelated stale branch text, application source,
helpers/tests, generic hooks/tooling, manifests/lockfile or Vercel configuration.
No new CI, environment, code path, fixture, test bypass or acceptance flag.

## Ordered slices

1. Independent review of this intent/spec/plan before applying active guidance.
   Owner policy direction is accepted; no extra preference question is required.
   Record any concrete blocking conflict rather than silently weaken a gate.
2. Rewrite the active Production runbook around exact-source staging acceptance.
   Add the acceptance/parity contract and canonical lotufo-meals prerequisite;
   keep pinned CLI, configuration/secrets isolation, manual release verification,
   Production packaging candidate then promotion and scoped health/recovery.
   Replace routine Production OAuth/search/disconnect/WAF/browser certification
   with staging functional scope and remove those mandatory calls from future
   release-record requirements. Keep existing helper modes available without
   calling the dormant paid/burst modes. Explicitly supersede old first-live
   functional scope for future releases while preserving historical evidence.
3. Update the active staging runbook's release handoff with exact SHA/Preview ID,
   owner scope/gap acceptance, configuration profile and freshness rules. Clearly
   preserve the helper's keyless contract: provider success/cancellation/WAF
   require separate authority/evidence; no Production-key copying or blanket
   credentials. Keep source restaging, browser/Google proof labels, privacy,
   platform-bypass limits, local locks and inspected pre/post alias attribution.
   Include a short Markdown acceptance example with source SHA, Preview ID/origin,
   configuration profile, performed checks/gaps, evidence references and actual
   owner decision. This is a sanitized repository artifact, not a new JSON parser
   or a pre-filled pass.
4. Align README's Vercel section and AGENTS's release-order note, linking the
   amendment and both runbooks. State staging functional validation precedes
   Production, still requiring manual merge/release authority and minimal
   Production configuration/health checks. Preserve unrelated historical text.
5. Review final exact diff independently against the scenario matrix below;
   correct only document issues. Orchestrator serializes graph/gates/messages,
   records actual checks, commits reviewed documents and reports readiness.
   If the active graph is amended, insert an operator-attested staging acceptance
   dependency before release, referencing an actual future exact-source artifact;
   leave it unapproved until genuine evidence/owner acceptance exists. Preserve
   human merge/release gates; do not change hooks or claim automatic SHA checks.
   Perform no deployment, external configuration, real login, search or migration.

## Verification and scenario matrix

Run `python3 -m unittest discover -s tests`, `git diff --check`, applicable org
loop/message/memory/workflow checks, and staged secret scan with zero findings.
Check every new Markdown file link/reference resolves. No application/runtime
code changed, so do not claim fresh app tests/build/browser verification or add
prose-mirroring tests. Preserve prior144Node/7Python implementation evidence as
historical, not rerun proof for these new documents.

Independent review must establish:

| Case | Required instruction |
| --- | --- |
| Accepted staging source equals proposed release SHA | Separate Production build is eligible only after parity and release authority |
| Main includes staging commit but has a different SHA | Stage/validate/accept the new exact SHA; no ancestry/content-equivalence shortcut |
| Audit/gate commits after acceptance | Keep releaseSourceSha pinned; do not accidentally deploy latest audit HEAD |
| Staging alias/configuration/profile changes | Invalidate readiness; refresh attributed validation/acceptance |
| Preview has no provider key | No provider-success claim; explicit named gap acceptance or separately authorized staging coverage |
| Protected/inconclusive helper or missing specific attestation | Preserve result; owner scope decision cannot fabricate helper success |
| lotufo-meals still redirects or auth/callback/database unknown | Block Production until separately authorized configuration is verified |
| Missing/expired human release authority | No Production candidate creation or promotion |
| Production canonical anonymous health fails | Use only scoped authorized rollback/pause, verify traffic, no paid retry |

## Risks and limits

Staging uses different database, OAuth client and deployment configuration.
Staging confidence does not prove actual Production OAuth/provider behavior;
minimal Production health intentionally leaves that residual risk visible.
Owner acceptance must name the scope and known gaps for the release. This
amendment cannot reuse ceo-0044's source9fc13ff acceptance for a different main
revision, grant provider budget/credential changes, approve Production domain
configuration, or count as merge/release approval. Those remain concrete future
operations under the preserved gates.
