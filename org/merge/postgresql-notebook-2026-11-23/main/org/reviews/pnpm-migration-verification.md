# pnpm migration implementation verification

- Implementer: senior-developer
- Date: 2026-11-23
- Specification: `intent/pnpm-migration/spec.md`
- Plan: `intent/pnpm-migration/plan.md`
- Tested runtime: Node.js `v24.15.0`, pnpm `10.33.0`

## Conversion and reproducibility

`pnpm import` completed successfully against the original npm lockfile before
its removal. Existing dependency/devDependency maps, scripts, and Node.js
engine requirement compare exactly equal to the pre-migration manifest; only
`packageManager: pnpm@10.33.0` was added.

The source npm lockfile contains 520 unique package/version pairs; pnpm's
package table contains 515. No versions were added or upgraded. All 515
nonbundled package integrity hashes match the npm source. The five entries
absent from pnpm's package table are already bundled inside the optional
`@tailwindcss/oxide-wasm32-wasi` package: `@emnapi/core@1.11.3`,
`@emnapi/wasi-threads@1.2.3`, `@napi-rs/wasm-runtime@1.2.2`,
`@tybys/wasm-util@0.10.3`, and `tslib@2.8.1`. The npm source marks them
`inBundle: true`; no separate resolution is required. pnpm records its own
peer-context snapshots, while retaining the imported package versions.

`node_modules` did not exist before installation. Clean
`pnpm install --frozen-lockfile`: exit 0, installed 372 packages, completed in
7.5 seconds. Repeat frozen install: exit 0, "Already up to date", 527 ms.
Lockfile SHA-256 before installation, after clean installation, and after repeat:
`d2c46c8a72db6aaf1fae9dfffcb5e769a367cd97019d98772eb745a5db2c87f9`.

Sandbox registry resolution initially returned `ENOTFOUND`; the attempt was
cancelled and import/install succeeded with escalated network access. A repeat
install in the restricted sandbox reported `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`
while requesting module-directory replacement; rerunning in the same escalated context
as the successful clean install passed without replacement or lockfile edits.
No sandbox-specific store setting or global tool change was committed.

## Dependency lifecycle policy

`pnpm-workspace.yaml` enables `strictDepBuilds: true` and uses exact-version
`allowBuilds` selectors. Only `esbuild@0.18.20`, `esbuild@0.25.12`, and
`esbuild@0.28.2` may run their `node install.js` postinstall hooks. These verify
or prepare esbuild's platform executable used by Drizzle's loader/CLI and its
transitive tooling. All three hooks completed successfully. An inspection of
installed package manifests found these esbuild versions as the lifecycle
script set. `pnpm exec drizzle-kit --version`: exit 0, reported Drizzle Kit
`0.31.11` and ORM `0.45.4`, without database setup or access.

`fsevents@2.3.3` is explicitly denied: it is an optional native filesystem
watcher, not required by this static app's build or production runtime; tooling
can use its standard watcher fallback. No broad script trust or unchecked
install/build flag is enabled. New unreviewed hooks fail installation.
Sources: [pnpm v10 lifecycle policy](https://pnpm.io/10.x/settings#allowbuilds),
[pnpm import](https://pnpm.io/10.x/cli/import).

## Application and workflow checks

- `python3 -m unittest discover -s tests`: exit 0; 7 tests, `OK`.
- `pnpm run lint`: exit 0; ESLint with `--max-warnings 0`, no findings.
- `pnpm run typecheck`: exit 0; route type generation succeeded and strict
  TypeScript completed without errors.
- `pnpm run build`: exit 0; Next.js 16.4.6 Webpack compiled successfully in
  3.3 seconds, TypeScript completed, 3/3 static pages generated, `/` prerendered.
- `pnpm run start --hostname 127.0.0.1 --port 39171`: sandbox first returned
  loopback `EPERM`; escalated port 3100 was occupied (`EADDRINUSE`), so
  escalated port 39171 started successfully, ready in 118 ms. Browser QA uses
  this final build.
- Application source, framework configuration, direct dependency versions,
  script definitions, and strict checking flags are unchanged.
- `git diff --check`: passed. Org message, memory, and loop checks: zero
  violations. Workflow graph check: consistent (6 nodes, 8 ledger records).
  Gate ledger verified through `plan-pnpm-migration-001`.
- Staged active plan-sync (`--hook --ledger gates/ledger.jsonl`): passed after
  normalizing the plan approval metadata to the checker-required exact
  `Status: Approved` line and retaining the independent reviewer link separately.
  No checker or approval requirement changed. Staged secret scan: zero findings.

## Browser verification

Verified by orchestrator in the real in-app browser against the stable
production build at `http://127.0.0.1:39171/`. At 320x720 and 1440x900 CSS pixels:
English document, title `Meal Planner`, exactly one main and one h1, visible
body text exactly `Meal Planner`, zero links/buttons/form fields/images.
Document scrollWidth matched viewport width (320 and 1440); no horizontal
overflow. Mobile background computed as rgb(255, 255, 255). Screenshots visually
inspected and saved as `pnpm-migration-mobile.jpg` and
`pnpm-migration-desktop.jpg`; the temporary viewport override was reset.
Browser warning/error logs were empty. HTTP probes of `/` and all six local
CSS/script URLs observed in the DOM returned 200. Restricted local socket
probe needed an escalated retry; no application requests failed.
