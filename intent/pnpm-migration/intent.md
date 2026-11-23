# Meal Planner — pnpm migration

- Author: Rafael (request); product-manager (intent capture)
- Source: `org/intake/forms/pnpm-migration-001.md`
- Status: Accepted
- Accepted by: product-manager under the org intent gate
- Date: 2026-11-23

## Problem

The repository currently installs and verifies the application with npm. The
owner wants pnpm to be the package manager for contributors and the agent org.
Current instructions and automation must agree so installations are reproducible.

## Proposed outcome

Adopt a pinned stable pnpm release compatible with the supported Node.js runtime,
commit pnpm's generated lockfile, and replace the npm lockfile and current npm
commands with the corresponding pnpm workflow.

### Acceptance criteria

- `package.json` records an exact pnpm package-manager version; its existing
  application dependency and development dependency versions stay unchanged.
- A generated `pnpm-lock.yaml` is committed and `package-lock.json` is removed.
- A clean `pnpm install --frozen-lockfile` succeeds with the selected version.
- Contributor and agent instructions describe pnpm setup, installation,
  development, verification, and production preview consistently.
- Current workflow acceptance commands and any existing package-related CI use
  pnpm. Historical intake, reviews, messages, ledger, and loop history remain
  unchanged; no new CI system is required where none exists.
- Lint, typecheck, production build, and Python workflow tests all pass without
  weakened checks or dependency upgrades.
- A real-browser production preview retains the exact `Meal Planner` heading
  and existing title-only appearance at mobile and desktop widths.
- Independent spec, plan, code, and security review evidence is retained; the
  human merge and release gates remain intact.

## Affected users and systems

Contributors and the agent org use pnpm for local installs and verification.
The package manifest, lockfile, current setup documentation, and automated
acceptance configuration are affected. Visitors see the existing home page.

## Constraints

Preserve exact application dependency versions, Node.js support, existing
application scope, and org audit records. Select and verify a stable pnpm release
from official sources during Design. Document any necessary dependency build
script policy and validate installation rather than broadening trust blindly.
Follow `org/protocol.md` and use this folder for the feature's specifications.

## Out of scope

Application features, UI changes, database setup, dependency upgrades, new CI or
hosting infrastructure, publishing, merge, and production release.

## Open questions

The exact compatible pnpm version, bootstrap instructions, lockfile conversion
approach, and dependency build script policy are technical design decisions.
There is no product-scope ambiguity requiring CEO escalation.
