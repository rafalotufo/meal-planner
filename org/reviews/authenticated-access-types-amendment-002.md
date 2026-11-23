---
artifact: intent/authenticated-access/spec.md + intent/authenticated-access/plan.md
reviewer: reviewer
verdict: approved
round: 1
supersedes: org/reviews/authenticated-access-types-amendment-001.md
---

# Independent narrow SQLite declaration amendment review

## Verdict

Approved the superseding specification/plan amendment: replace direct
`@types/bun@1.4.5` with exact development-only `bun-types@1.4.5`, and load only
`bun-types/sqlite` in `compilerOptions.types` alongside `node`, `react` and
`react-dom`. Do not load the full Bun globals. Keep `skipLibCheck: false` and
all existing strict checks; no handwritten ambient shim, patched dependency,
Bun runtime, database, or diagnostic suppression is authorized.

## Independently verified evidence

- Full Bun ambient loading failed strict `tsc --noEmit` with conflicts in
  `process.browser`, `ImportMetaEnv`, Node utility types and Bun overrides.
  Next's global declarations were among the conflicting declarations.
- Inspected the installed official `bun-types@1.4.5/sqlite.d.ts`: it declares
  only the `bun:sqlite` module, has no imports or references loading full Bun
  globals, and uses existing Node `Buffer`/`NodeJS` and standard library types.
  The package metadata identifies the official `oven-sh/bun` repository,
  exact version `1.4.5`, and MIT license.
- Independently ran:
  `pnpm exec tsc --noEmit --types node,react,react-dom,./node_modules/.pnpm/bun-types@1.4.5/node_modules/bun-types/sqlite.d.ts`.
  It exited zero. This proves the published declaration resolves the original
  Better Auth `bun:sqlite` import without loading the incompatible globals.
- The amended plan retains `tsconfig.json` in its changed-file manifest and
  specifies the same exact dependency/subpath as the superseding specification.

## Required Build verification and limits

After the approved dependency substitution, run the normal full
`pnpm run typecheck` with the stable named `bun-types/sqlite` entry, then the
production build and the remaining required checks. The direct package pin
must make that named subpath resolvable; the store-specific prototype path
must not enter committed compiler configuration. Preserve the generated
pnpm lockfile and existing dependency script policy.

This replaces the earlier broad Bun type dependency approval because actual
strict verification disproved its compatibility. It does not weaken the
quality bar. No dependency/source/compiler mutation was performed by this
reviewer, and no final named-subpath build result is claimed here. Human
merge/release and independent implementation/security gates remain intact.
