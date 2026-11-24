# Design-stage verification

Date: 2026-11-24. Scope: intent, specification and org audit artifacts only.
No menu implementation, migration execution, hosted operation or UI change.

- Node.js `v24.15.0`; pnpm `10.33.0`.
- `pnpm install --frozen-lockfile`: exit 0, lockfile unchanged. Initial sandbox
  registry DNS failed; the authorized installation completed from pnpm cache.
- `pnpm run lint`: exit 0, zero warnings. First attempt before dependency
  installation failed because eslint was absent; rerun after installation passed.
- `pnpm run typecheck`: exit 0, route types generated and strict tsc passed.
  First attempt before installation failed because next was absent; rerun passed.
- `pnpm run build`: exit 0, reviewed runtime migration metadata verified,
  optimized Next.js 16.4.6 production build compiled successfully.
- `pnpm test`: exit 0, 82 tests passed, 0 failed/skipped/cancelled.
- `python3 -m unittest discover -s tests`: exit 0, 7 tests passed.
- `python3 scripts/org_message.py check`, `org_loop.py check`, and
  `org_memory.py check`: exit 0, zero violations at the intent handoff.
- `python3 scripts/scan_secrets.py --staged`: zero findings at intent commit.
- `git diff --check`: passed at intent handoff.

These are baseline checks of existing application code and checks of workflow
records. They do not prove menu behavior. Menu persistence, auth/family/deployment
regressions and real-browser QA at mobile/desktop widths remain required during
the separately approved Build/Test run. No menu UI exists to inspect in Design.

## Owner amendment

The owner removed the proposed saved-recipe count maximum and requested keeping
available photos, with fallback only when missing or failed. The amended draft
uses bounded page navigation without a collection cap and retains validated
publisher photo URLs using the existing browser image boundary. Initial review
reports describe the previous draft; the focused review
`org/reviews/spec-saved-recipe-menu-002.md` assesses these changed contracts.
Only documentation/audit files changed; baseline application checks above are
not new menu or pagination/photo runtime evidence.

## Interactive visual preview QA

Owner approved the amended specification and requested visual Design previews.
The preview changes only feature documentation, a self-contained conversation
fragment and workflow records; no application UI/schema behavior was implemented.

Root inspected the rendered preview in the real in-app browser:

- Desktop1440×1100: three recipe-card columns, final desktop shell1200px,
  current stone/emerald styling, readable menu layout and actions.
- Mobile390×844: one-column cards and stacked search form; measured root
  clientWidth358 and scrollWidth358, no horizontal overflow.
- Search save showed disabled pending action and success feedback; menu link
  showed the saved card. Older/Newest navigation replaced the displayed cards.
- Removal kept the page populated from remaining sample entries and announced
  success. Source links remained visible; external sample source links were not
  opened. No console warnings/errors were captured.
- Desktop final width correction was reloaded and inspected; viewport override
  reset after QA. No real auth, provider, image, database or hosted effect.

Images are clearly labeled sample illustrations. These checks establish local
mockup layout/interaction only; real photo delivery, production focus handling,
full failure matrix, authorization and persistence remain Build/Test obligations.
Independent visual review is recorded in
`org/reviews/visual-saved-recipe-menu-001.md`.
