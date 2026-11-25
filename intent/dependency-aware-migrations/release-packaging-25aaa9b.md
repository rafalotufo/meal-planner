# Corrected fixed-source release packaging

- Engineer:senior-developer; date:2026-11-25.
- Fixed candidate source:25aaa9b0d8b948bc6f24710214c9eaefe0ee8dcb.
- Status: local upload packaging passed; no main merge, staging deployment or
  Production release is authorized or performed by this engineer.

## Exact source and upload set

A clean Git archive of the fixed full SHA was extracted under an owned private
`/private/tmp/meal-planner-release-25aaa9b-*` directory. No working-tree env,
operator credentials, dependencies, build output or uncommitted files entered it.
Later review/verification audit HEAD must not replace this fixed upload source.

Exact scripts-disabled Vercel CLI66.6.0 dry mode reported Next.js and
**126 files/738556 bytes**. Each CLI raw SHA1 matched both the export's bytes and
`git show <fixed SHA>:<path>`. A second SHA256 was recorded per file in
`release-upload-manifest-25aaa9b.json`. Every uploaded source hash was checked
again after the clean build and remained unchanged.

The local dry-run project binding contains only the already recorded project/
team identifiers in `.vercel/project.json`; that directory is excluded from
upload. No link, upload or deployment command was run. The earlier e4 source's
124-file evidence is historical and not reused as proof of this correction.

Required upload inventory includes both new strict helpers,
`lib/db/platform-permissions.ts` and `lib/db/attribute-options.ts`, together with
security, graph/compatibility/history/connection modules, metadata source
verifier, the reviewed compatibility/catalog/runtime JSON and original SQL/
journal, exact package/lock/build-script policy, compiler/Next/PostCSS/Vercel
configuration, application source/styles and public assets. Native explicit
migration/operator scripts and tests are deliberately excluded by the existing
upload policy; builds still contain their required metadata verifier under lib.
No env, `.vercel`, private `.data`, Git, audit/intention/test/helper state or
credentials appear in the126-file list. The required server-only admission list
remains server source; its values were not printed or copied into this record.

## Clean upload-only verification

A separate directory contained exactly the126 inventoried source files, with no
`.env.local`, `.vercel`, operator scripts, tests or audit state. Using explicit
Node24.15.0 and pnpm10.33.0:

| Check | Actual result |
| --- | --- |
| `pnpm install --frozen-lockfile` | Exit0; unchanged exact dependency pins and generated lock |
| `pnpm run build` | Exit0; reviewed migration metadata check and production compilation passed |
| Post-build source SHA256 verification | All126 unchanged |

Private receipts remain in the owned export directory. This proves the excluded
upload set can build without private source-tree state, not hosted function
behavior, real Google OAuth, provider success or staging acceptance.

## Fresh dependency audit

Fresh `pnpm audit --prod --json` on the same locked upload copy exited1:
1 moderate,0 high,0 critical (251 production dependency entries). The existing
esbuild GHSA-67mh-4wv8-2f99 finding follows Better Auth's optional Drizzle Kit/
@esbuild-kit tooling chain. It is not a zero-finding or clean audit.

No package/lock change or new serve path was introduced. The independent
reachability/deferral review remains
`org/reviews/security-saved-recipe-menu-release-audit-001.md`, due for review by
2026-12-01 or sooner if development-server/tooling exposure changes. No forced
upgrade, override or suppression was used for packaging or release readiness.

## Other gates remain distinct

Root's complete strict read-only validators passed both recorded hosted targets
for this exact corrected source, preserving five legacy rows and no native side
ledger, with matching catalog/history signatures. Root owns the exact receipt
and attribution; packaging did not connect to hosted databases or alter schema,
options, roles, grants or data. Local full regression/browser evidence is in
`attribute-options-verification.md`, including its completed328-Node/7-Python
and both-Chrome execution record.

Actual branch provenance must remain truthful: the stable staging lane's main
classification cannot be fabricated for an unmerged correction. Owner approval
of the reviewed source/main update precedes that staging use, then same-SHA
staging results and named gaps require their own acceptance before separate
Production packaging/promotion. Neither this packaging pass nor old release
approvals satisfy those gates. Production/main remain unchanged by this handoff.
