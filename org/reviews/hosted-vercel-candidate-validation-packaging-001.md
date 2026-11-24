---
artifact: intent/vercel-candidate-validation/hosted-setup.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Operational packaging amendment review

## Verdict

Approved. The `.vercelignore` tightening is necessary packaging preparation
within `ceo-0040` Preview-only authority and does not require repeated owner
permission. This review does not authorize a Production operation or expand the
one Preview deployment and prerequisite domain/OAuth scope.

## Reviewed delta

- `.data/` becomes `.data`, excluding the private root entry as well as contents.
  Existing environment, Git/Vercel, dependencies/build outputs, tests/scripts,
  org/intent and SQLite/backup exclusions remain intact.
- New exclusions cover only generated `*.tsbuildinfo` cache and operator audit/
  workflow/eval/instruction artifacts: gates, workflow-graph.yaml, bands.yaml,
  evals, AGENTS.md, CLAUDE.md and REVIEW.md. No application/runtime/package/
  stylesheet/build configuration or SQL/runtime metadata pattern is removed.
- The approved plan manifest now names `.vercelignore`; its note and hosted setup
  record explicitly supersede the earlier no-upload-change assumption with the
  actual dry-run observation. This is a transparent scope amendment, not a silent
  weakening of runtime verification.

`package.json` still executes the mandatory runtime metadata verifier before
Next build. `lib/db/repository-migrations.ts` requires PostgreSQL catalog,
SQL/journal and bundled runtime metadata; the new patterns do not match these
inputs. `next.config.ts` still traces `drizzle/postgresql/**`. Dependency,
strict compiler and application source files are unchanged.

The orchestrator attributes the fresh pinned-CLI Preview dry inventory as76 files,
358474bytes,23 ignored, zero forbidden private/env/operator/cache entries and
22/22 mandatory runtime/package/config/SQL/metadata inputs present. Those counts
are supplied operational evidence, not an independent deployment by this reviewer.
The author is additionally verifying a clean export build; record its actual
result before using the payload. Never substitute a local full-tree build for
that packaging evidence if required inputs change.

## Verification and limits

Inspected the exact three-file delta, current ignore rules, package build command,
Next tracing, strict TypeScript configuration and repository migration loader.
`git diff --check` passed. No code/test behavior changed; no new tests were needed
for these narrow exclusion patterns. Existing application/deployment checks remain
required and are not relaxed by this amendment.

No external API/browser/account, deployment, Google policy, database or provider
action was performed by this reviewer. The orchestrator owns actual payload/build
results, clean source attribution and scoped deployment gates.
