---
artifact: intent/saved-recipe-menu/plan.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: changes
round: 1
---

# Saved menu — independent Build plan review

One required correction before the human engineer gate. No implementation or
operational approval is granted. Reviewed the stable plan, approved spec/visual
contracts, independent plan security report and actual repository interfaces.

## Required finding

**[P2 / Compliance] Escape the literal dynamic-route bracket in the manifest.**
Plan.md:81 lists `app/api/menu/[id]/remove/route.ts`. The mandatory plan-sync
checker treats every manifest entry as a Python fnmatch pattern
(`scripts/check_plan_sync.py:324–327`), so `[id]` matches a single i/d character,
not the literal Next route folder. No other manifest pattern covers this path.
Consequently task6's prescribed file will fail the required final plan-sync
check even when implemented exactly as approved. Change this manifest entry to
`app/api/menu/[[]id]/remove/route.ts` (a literal bracket escape), or an equivalently
narrow matching pattern. This is an artifact fix, not a reason to weaken checks.

Reproduction using the repository's `_manifest_entries` parser and fnmatch:
parsed literal entry exists; matching entries for the actual
`app/api/menu/[id]/remove/route.ts` path are `[]`.

## Other assessed contracts

- Identity handoff (29–38) matches requireFamilyContext's ID-only result and the
  existing family route/page's subsequent verified-session read; store writes
  rederive membership/family after the unchanged shared transaction lock.
- Tasks1–2 explicitly discover strict TypeScript menu tests via tsx and leave
  family parser behavior intact while proving the new deadline and byte bounds.
  Root tsconfig includes all new tests; no test exclusion is required.
- Tasks3–4 account for SQL/journal/runtime metadata/catalog coupling, fresh and
  initial-schema upgrades, explicit restricted grants, new disposable-only
  rollback before the historic family rollback, and current storage table-list
  assertions. Candidate catalog preparation is explicitly isolated from normal
  builds/tests and development/hosted databases.
- Tasks5–6 cover tuple pagination, duplicates/retries/concurrency, cross-family
  isolation and admission races with store plus real HTTP tests. The existing
  startServer fixture can accept an explicitly owned DB for a restart, forces
  paid keys empty, and exposes verified test-process OAuth without a production
  auth bypass. Existing metadata regression cases remain compatible with an
  appended migration list.
- Tasks7–8 preserve photos, source/time and approved layout, require a real
  save/reload flow and confirmation before every removal attempt, and specify
  no request on Cancel/Escape/backdrop plus focus after refreshed content.
  Existing Chrome helper exposes CDP send/evaluate/request interception needed
  by a feature-owned helper; any shared-helper change first needs the documented
  manifest amendment, rather than silently modifying auth fixtures.
- Task9 extends the actual isolated compiled app test, which copies `.next`,
  package.json and node_modules while omitting source/SQL; migrations remain
  owned by its outer test fixture. Hosted-tool changes are source-only and the
  strict catalog's separately authorized cutover/recovery boundary is preserved.

`git diff --check` passed. No application code, migrations, database, browser or
hosted operation was executed. Baseline checks do not establish menu behavior;
full implementation/browser/packaging proof remains the planned Build/Test work.
