# Saved-menu hosted preflight — 2026-11-24

Read-only preflight verified existing Vercel project
`prj_ntxXnJAVA977jHjLNDR7xJuwSx4V`, team
`team_2c0O29FMb91g7L6sUChc9v6J`, Hobby, Node24, unpaused, no Git integration,
and automatic custom-domain assignment disabled. No configuration was changed.

Current Production is READY `dpl_J2oXFfPQNCx5Afzvyb74DytZYra5`, source
`d1b11652abb5cf59d2b0ddce2b2b01d02480b8fc`. Complete domain/alias inventories
confirm direct canonical `https://lotufo-meals.vercel.app`, the two existing
Production aliases on that same deployment, and isolated branch-qualified staging
`https://meal-planner-staging-rafalotufos.vercel.app` on Preview
`dpl_AxsWGqRYtY8BK2RfwAbUejdMa3zh`. No alias was moved.

Using existing restricted credentials, verified TLS, read-only transactions and
exact recorded hosts/databases, both hosted targets match the reviewed initial
catalog with one migration and no menu table. Each currently has1family,1user,
0invitations. Runtime roles remain restricted. No row content, secret, provider
request, persistent fake data or database mutation was used in these checks.
The Neon project inspection confirms the recorded Production project remains Free.

Before any hosted mutation, complete custom-format private backups were created
using direct mp_migrator credentials only in child environments, verified TLS,
read-only pg_dump, owner-only directories0700/files0600. Private receipt files
under ignored `.data/saved-menu-release/backups/` record complete paths/hash/size.
The backups were verified with expected table-data TOC entries and full
pg_restore archive decoding to `/dev/null`; no backup was restored or uploaded.
This proves archive readability, not a real-data restore rehearsal. Existing
synthetic backup/restore regressions provide separate restore behavior evidence.

- Preview backup:13825bytes, SHA256
  `4a108c9def30fb545283190e7a137ef154f9ac5ff2b5fe95d64e5c2c449ea668`,
  completed2026-11-24T18:42:15Z.
- Production backup:13824bytes, SHA256
  `fefb8c1842526ffbd27832560d7fccd094f292d433e07db3b0f603dc7139601b`,
  completed2026-11-24T18:42:21Z.

Production backup must be refreshed immediately before its later cutover. These
preservation copies are not authority for destructive restoration. Neither hosted
migration, Preview deployment/alias switch, Production build/promotion, pause,
credential/environment change nor paid/provider operation has occurred here.
See `hosted-cutover-plan.md` for the reviewable target-specific sequencing and
strict-schema compatibility boundary.
