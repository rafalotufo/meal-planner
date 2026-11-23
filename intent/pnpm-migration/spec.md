# Meal Planner — pnpm migration specification

- Derived from: accepted `intent/pnpm-migration/intent.md`
- Author: architect
- Status: Draft — independent peer review required
- Date: 2026-11-23

## Requirements

- Use exact stable `pnpm@10.33.0`, recorded as `packageManager` in
  `package.json`. Preserve `engines.node` (`>=22.0.0`), all existing scripts,
  and every direct dependency/development dependency version.
- Generate and commit `pnpm-lock.yaml`; remove `package-lock.json` only after
  conversion succeeds. A clean `pnpm install --frozen-lockfile` must work with
  the pinned manager and leave the lockfile unchanged.
- Update current contributor/agent instructions in `README.md`, `AGENTS.md`,
  and `CLAUDE.md`, plus `org/loop/config.yaml` acceptance commands. Keep the
  Python workflow test command and every lint/type/build check. No CI workflow
  exists in this checkout; adding CI is outside this change.
- Preserve the title-only home page and all application source/configuration.
  No database infrastructure, UI additions, dependency upgrades, weakened
  checks, or broad lifecycle-script permission is included.
- Preserve historical home-page specifications, intake, messages, reviews,
  ledger entries, and archived loop records. Append new audit evidence rather
  than rewriting previous approvals. Current feature references should identify
  `intent/pnpm-migration/` where instructions identify the active work item.
- Independent spec/plan approval precedes implementation; security and code
  reviews precede the human merge/release boundaries in `org/protocol.md`.

## Design

### Package manager and bootstrap

Choose pnpm 10.33.0 because it is an official stable release, already available
in this environment, and its release line supports Node.js 22 and 24. The
request does not require the newest major. This limits the migration to a
verified compatible manager rather than coupling it to a major-version change.
Record the actually tested Node.js/pnpm versions in current instructions.

Document an exact-version bootstrap for machines without pnpm, for example
`npm install --global pnpm@10.33.0`, followed by `pnpm --version`. This one-time
bootstrap is distinct from application installation; application commands use
pnpm. Existing pnpm/Corepack users can select the manifest's exact manager
without requiring a global install. Do not mutate global tooling as part of
repository implementation.

### Lockfile conversion and installs

Run `pnpm import` while the npm lockfile still exists. Preserve the direct
manifest versions exactly and prefer the imported resolution graph. Do not
hand-author the generated lockfile. Inspect conversion changes and record any
unavoidable transitive-resolution differences; unrelated upgrades are outside
scope. Use pnpm's default isolated linker unless an evidenced compatibility
failure requires a separately reviewed design revision.

Remove the npm lockfile after successful import. Verify from a clean dependency
directory, rather than reusing npm-installed modules, using
`pnpm install --frozen-lockfile`. A second frozen install must not change the
committed lockfile. Store/cache paths used only to accommodate the sandbox are
local execution details, not repository defaults.

### Dependency lifecycle scripts

pnpm 10 blocks dependency lifecycle scripts unless explicitly permitted.
Inspect the imported packages and use a small `pnpm-workspace.yaml` only for
necessary build-script decisions, without declaring additional packages.
Use the supported `allowBuilds` map, with exact-version selectors for allowed
builds where practical; never enable `dangerouslyAllowAllBuilds` or disable
checks to make installation pass. Record the reason for each allowed or denied
script in verification evidence. `strictDepBuilds: true` makes new, unreviewed
scripts fail installation rather than passing unnoticed.

The source npm lockfile marks esbuild 0.18.20, 0.25.12, and 0.28.2, and optional
fsevents 2.3.3, as having install scripts. These are inspection candidates, not
authorization to run arbitrary packages. Determine the exact imported script
set before recording narrow decisions; validate esbuild-backed Drizzle tooling
if its installation scripts are allowed. If a package can safely use its
prebuilt artifact or optional fallback, an explicit deny must explain why.

### Commands and documentation

Use `pnpm install --frozen-lockfile` for reproducible installation;
`pnpm run dev`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, and
`pnpm run start` for existing scripts. Keep the existing Webpack production
builder and strict lint/type settings. Replace active npm commands and lockfile
instructions, while retaining historical audit text verbatim.

## Verification and acceptance evidence

- Record `node --version` and `pnpm --version`; verify the manifest pin and
  unchanged direct dependency maps against the pre-migration manifest.
- Clean frozen install and a repeat frozen install both succeed; the second
  leaves `pnpm-lock.yaml` unchanged. Record script decisions and actual output.
- `python3 -m unittest discover -s tests`, `pnpm run lint`,
  `pnpm run typecheck`, and `pnpm run build` all exit zero.
- Start the built app with `pnpm run start`; verify HTTP 200 and use a real
  browser at 320 and 1440 CSS-pixel widths (additional original widths may be
  checked). Confirm English document language, `Meal Planner` document title,
  exactly one visible heading, title-only content, no horizontal overflow,
  and no application console/network errors. Save visual evidence.
- Run diff, org message/memory/loop, gate-ledger, active plan-sync, and staged
  secret checks. Record actual results and any tool limitations honestly.
- No redundant JavaScript test runner or tests mirroring static JSX are added.

## Risks and limits

pnpm's isolated links and dependency-script policy can expose assumptions in
existing tooling. Clean installation, lint/type/build, browser evidence, and
explicit lifecycle decisions are the proof. Network access and shared Git
metadata may require sandbox escalation. No merge or release is authorized.

## Official sources checked during Design

- [pnpm 10.33.0 release](https://github.com/pnpm/pnpm/releases/tag/v10.33.0):
  confirms the stable release selected here.
- [pnpm 10 installation](https://pnpm.io/10.x/installation): Node.js 22/24
  compatibility, exact manager pin, and npm bootstrap support.
- [pnpm 10 import](https://pnpm.io/10.x/cli/import): conversion from npm's lockfile.
- [pnpm 10 install](https://pnpm.io/10.x/cli/install): frozen-lockfile behavior.
- [pnpm 10 settings](https://pnpm.io/10.x/settings#allowbuilds): `allowBuilds`
  (available since 10.26), strict script review, and default isolated linking.

Sources accessed 2026-11-23. The versioned documentation contains later 10.x
settings too; this specification uses settings available by 10.33.0. A registry
CLI probe was attempted separately and is not required to establish the signed
official stable release; do not claim a successful probe without its output.
