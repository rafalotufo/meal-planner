# Meal Planner — pnpm migration build plan

- Derived from: approved `intent/pnpm-migration/spec.md`; accepted sibling intent
- Author: senior-developer
- Status: Approved by independent reviewer (`org/reviews/plan-pnpm-migration-001.md`)
- Date: 2026-11-23

## Files that change

- package.json
- package-lock.json
- pnpm-lock.yaml
- pnpm-workspace.yaml
- README.md
- AGENTS.md
- CLAUDE.md
- org/loop/config.yaml
- org/reviews/pnpm-migration*.md
- org/reviews/pnpm-migration*.jpg
- org/reviews/pnpm-migration*.png

## Design and scope

Use the approved stable pnpm `10.33.0` with the existing Node.js `>=22.0.0`
requirement. Keep every existing application/development dependency version,
script, application source file, framework configuration, and UI unchanged.
The file manifest includes deletion of `package-lock.json`, pnpm-generated
`pnpm-lock.yaml`, and a small lifecycle policy in `pnpm-workspace.yaml`.
Do not add packages, a JavaScript test runner, CI infrastructure, or global
machine configuration. Historical specifications and org audit records remain
unchanged; new process records are appended by the responsible roles.

## Ordered tasks and checkpoints

### 1. Convert and verify the dependency installation

Dependency: independent approval of this plan.

- [ ] Record Node.js/pnpm versions and save the pre-migration manifest and npm
  lockfile for comparison. Set only `packageManager: pnpm@10.33.0` in the manifest.
- [ ] Run `pnpm import` while `package-lock.json` is present. Inspect imported
  versions, integrity data, peer resolutions, and packages with install scripts.
  Record any unavoidable transitive-resolution differences; do not upgrade
  direct dependencies or hand-edit the generated lockfile.
- [ ] Add `strictDepBuilds: true` and explicit narrow `allowBuilds` decisions in
  `pnpm-workspace.yaml`. Prefer exact-version selectors for permitted scripts.
  Inspect the actual imported esbuild/fsevents script set and document each
  allow/deny rationale. Never enable all dependency scripts.
- [ ] Remove `package-lock.json` only after import succeeds. From a dependency
  directory with no prior installation, run `pnpm install --frozen-lockfile`.
  Repeat the frozen install and compare lockfile digests before/after both.

Acceptance: one generated lockfile; unchanged direct dependency maps, engines,
and scripts; clean and repeat frozen installs succeed without lockfile changes.
If esbuild scripts are allowed, run `pnpm exec drizzle-kit --version` to exercise
that dependency path without configuring or accessing a database.

### 2. Align contributor and org commands

Dependency: task 1 establishes a working pinned install.

- [ ] Replace current npm application commands in README, AGENTS, CLAUDE, and
  `org/loop/config.yaml` with pnpm equivalents. Document exact-version bootstrap
  (`npm install --global pnpm@10.33.0`) for machines missing pnpm, version check,
  `pnpm install --frozen-lockfile`, dev, lint, typecheck, build, and start.
- [ ] Document tested Node.js/pnpm versions and generated pnpm lockfile policy;
  identify `intent/pnpm-migration/` as the current feature in live guidance.
  Retain Python tests, strict app checks, org budgets/phases/gates, and existing
  historical text. No CI files exist to migrate.

Acceptance: contributor and agent instructions agree with the manifest pin and
org acceptance commands; only the documented one-time bootstrap uses npm.
Checkpoint: run `python3 -m unittest discover -s tests`, `pnpm run lint`,
`pnpm run typecheck`, and `pnpm run build`; all must exit zero. Fix failures
within scope without suppressions, unchecked flags, or dependency upgrades.

### 3. Verify production behavior and hand off for review

Dependency: successful task 2 production build; do not rebuild during preview.

- [ ] Start the production server with `pnpm run start`, using an available
  loopback port. Verify HTTP 200. Coordinate real-browser QA with orchestrator
  at 320 and 1440 CSS-pixel widths: English document language, exact document
  title and sole visible heading `Meal Planner`, title-only content, no overflow,
  and no application console/network errors. Save mobile/desktop screenshots.
- [ ] Record actual command results, lifecycle decisions, resolution comparisons,
  lockfile stability, and browser evidence in
  `org/reviews/pnpm-migration-verification.md`. Clearly identify limitations.
- [ ] Run diff, active plan-sync, org loop/message/memory, ledger, and staged
  secret checks. Refresh memory through its script where needed. Commit the
  verified scoped change and hand off to independent security/code reviewers.

Acceptance: all application/workflow checks pass; browser evidence confirms the
unchanged page; independent reviews precede the human merge and release gates.
No implementation self-approval, merge, push, deployment, or release is included.

## Risks and recovery

pnpm's isolated linker and blocked lifecycle scripts may expose tooling
assumptions. The clean install, narrow script decisions, Drizzle version probe,
and complete verification establish compatibility. If compatibility needs a
new dependency version or linker change, update the spec/plan and obtain review
before proceeding. Network/cache and shared Git metadata may require sandbox
escalation; local cache overrides are execution details and do not become repo
configuration. Preserve the original npm lockfile until conversion succeeds.

## Coordination

Implementation is sequential and owned by senior-developer. Orchestrator owns
loop/graph/ledger updates and browser evidence; reviewers own independent plan,
security, and code verdicts. Do not run concurrent writes, commits, or builds.
The ordered task checklist lives in this feature plan per repository convention.
