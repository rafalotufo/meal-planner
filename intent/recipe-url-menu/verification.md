# Recipe URL menu — implementation verification

Date: 2026-11-24. Scope: local approved save-first URL curation implementation.
No development/hosted migration, hosted grant/configuration, deployment, push,
merge, paid provider call or release was performed. Tests own random local
mp_test databases, private servers and Chrome profiles; paid keys are empty.

## Implementation and test-first evidence

- Public curation contract RED: the old strict entry parser rejected the new
  curation field. GREEN: 7 validation tests, including exact status/retry shape
  and rejection of private/extra task fields.
- Parser RED: missing import parser module. GREEN: 13 import parser tests;
  existing recipe/photo suite passed 82. Existing photo parser and pinned safe
  transport remain byte-identical.
- Migration RED: curation companion did not exist. Generated the full catalog
  and public-loader metadata from an owned migrated random test database only.
  Migration/grant/restore tests passed 6, curation store tests passed 3.
- Actual dump/restore exposed PostgreSQL CHECK formatting drift from BETWEEN;
  changed new checks to equivalent explicit comparisons, regenerated reviewed
  metadata, and verified exact catalog equality after restore. No bound weakened.
- Existing family rollback initially failed on the new dependent table. Added
  only new disposable companion rollback before preserved menu/initial rollback;
  no CASCADE shortcut or historical migration/rollback rewrite.
- Import/retry bounded-body RED rejected the newly specified modes. GREEN: 7
  body tests; existing reader limits, Origin and five-second deadline retained.
- Worker RED: missing module. GREEN: 4 worker tests including two active slots,
  late identity change, deadline abort propagation/capacity reuse, and failed
  post-commit registration retaining the link with explicit Retry.
- Genuine compiled HTTP RED: old exact import query returned400 instead of200
  before route activation. GREEN: 6 real protected curation HTTP tests exercise
  actual Next after, native transport fixture, parser, transactions and updates.
  Success API responses are never fabricated. Coverage includes response before
  stalled publisher release; same ID/order; duplicate/no extra acquisition;
  failure/manual Retry; removal/resave; min(session expiry,JWE expiry) on save
  and Retry; interruption reads; current membership loss; private/mixed DNS.
- Real Chrome UI RED: prior shared menu lacked a labelled Recipe URL field.
  This was observed after actual isolated Google sign-in/provisioning. Its owned
  dev server stopped; only inactive generated dev/types was privately backed up.

## Completed repository checks

- `pnpm run lint`: passed.
- `pnpm run build`: passed after activating guarded import/retry (compile3.5s,
  TypeScript1.57s); final post-registration-helper build recorded below.
- `pnpm exec tsc --noEmit`: passed.
- `pnpm test`: 82 passed.
- `pnpm run test:menu`: 63 passed (27.14s), before adding the fourth registration
  worker test; final affected-suite rerun recorded below.
- `pnpm run test:family`: 34 passed (14.75s).
- `pnpm run test:auth`: 16 passed (10.07s).
- Targeted existing menu/isolation/deployment metadata command: 20 passed.
- Targeted packaged-runtime plus OAuth command: 5 passed; actual compiled URL
  save and background parser/transport/update operate without source/migration files.
- `python3 -m unittest discover -s tests`: 7 passed (1.67s).
- `git diff --check`: passed at tested checkpoints.
- Root owns staged secret/plan-sync/audit checks and independent final reviews.

## Independently approved baseline correction

Full packaging/family/auth proof exposed old expected home-label text retained
from before the approved weekly-copy change. Current app source was unchanged
by this feature. Independent scope review
`org/reviews/recipe-url-menu-copy-scope-001.md` approved adding only the relevant
OAuth/browser/family test paths before editing. Corrected their exact expected
label and packaging's exact expected label to “What would you like to eat this
week?”. Assertion methods, family/provider/admission/heading/Origin checks and
all surrounding coverage remain intact. No alternative wording or skip added.

The touched real authentication browser helper passed at320/390/768/1024/1440:
authentication, form label, search/notebook/history/filters, loading/error
retention, long content, T-Rex, photos, keyboard, overflow, reload and logout.
Console/network error list was empty. The private backup/restore command confirmed358 tracked image files restored
byte-for-byte after this helper.

## Browser curation coverage and limits

Actual curation browser runs have passed immediate link save while publisher is
stalled, ready title/photo/summary/time, duplicate/no acquisition, genuine failure
and manual Retry (including an intentionally failed retry HTTP response), honest
missing-field fallback, expired state without read effects followed by Retry,
confirmed pending removal and52-entry pagination/newest navigation.

The first cap scenario used CDP virtual time. It advanced45000ms and issued7
real GETs, but React's populated-page scheduled DOM update was not committed
before virtual budget exhaustion. Minimal populated/one-entry diagnostics passed;
this was not claimed as successful final cap evidence. Final helper uses real
wall-clock budget proof, with its first successful poll hitting the actual API
and subsequent intentional poll failures explicitly identified, rather than
fabricating successful API responses. Final command result is recorded below.

All source acquisition is deterministic local test transport; publisher images
are browser test fixtures. No universal-site compatibility, live Google/provider
success or durable unattended queue is claimed. Static Recipe JSON-LD/final HTTPS
limitations and explicit Retry after best-effort execution are the approved scope.

## Final verification checkpoint

Final app source is frozen after the post-commit registration helper extraction
and the Cancel-focus correction described below.

- `pnpm run lint`: passed on final source.
- `pnpm run typecheck`: passed, generated route types then strict TypeScript.
- `pnpm run build`: passed; reviewed runtime metadata matches SQL/journal,
  compile3.5s and TypeScript1.65s, all existing routes retain expected modes.
- `pnpm run test:menu`: 64 passed in44.13s, zero failures/skips.
- `node --import tsx --test tests/deployment/*.test.ts`: 32 passed in11.48s.
- `pnpm test`: 82 passed in0.97s.
- `node --import tsx tests/menu/curation-browser.ts`: passed on final compiled
  source at320/390/1440, including actual save/curation/Retry/removal/pagination
  and the Cancel-focus regression. Cap coverage uses actual40s wall-clock timing:
  first successful poll reaches the actual server; subsequent intentional503
  poll failures model interruption. At most8 reads, explicit Refresh, no publisher
  request and unchanged persisted pending state were asserted. No successful
  API response was intercepted or invented.
- Existing menu/auth Chrome helpers passed as described above. Final curation
  resources were fully stopped/cleaned. Screenshots use10 feature-specific paths.
- Final photo parser hash is
  `0a8a23fef49decd463f5dfe2de7bc79da05f2fe67ccff3e795ac30a9c25a8bc7`;
  native transport hash is
  `5924cf27a8a22f35c1ae98b54333ca52458220f946e8a45547aedde38b34e0ba`,
  matching the unchanged baseline.

A further real UI race was reproduced before fixing it: opening pending entry
removal, allowing background curation to replace its card, then Cancel left focus
on no current remove control. The focused browser assertion failed (null versus
entry ID). Cancel now resolves the current per-entry button before connected
trigger/fallback. The same real regression passed after rebuilding, alongside
ordinary removal/dismissal/focus cases; no assertion was weakened.

The implementation lead visually inspected final pending390, ready1440 and
failed320 screenshots using the image viewer: source wrapping, controls, status,
metadata and failure/Retry are readable, with no visible horizontal overflow.
The UI developer additionally inspected empty320, ready320/1440, pending390 and
failed320. Browser overflow and console assertions passed.

No direct hosted/provider execution or unattended recovery was verified or
claimed. Interruption proof covers persisted expiry/read-only derivation,
registration failure, manual Retry and stale-work fencing; it is not a claim
that a terminated server continues running background work. Formal independent
security/code review and final staged checks are orchestrator-owned gates.

## Independent review correction — strict curation state types

Independent code review `org/reviews/code-recipe-url-menu-001.md` identified one
P2 boundary defect at the previously verified source742ce99: String(state)
coerced JSON arrays such as ["ready"] into accepted enum labels, while returning
the original array. Added a regression before source edits and observed RED:
seven existing validation tests passed, new eighth failed because that array was
returned instead of null. No prior pass is presented as covering this missing case.

The correction changes only the public and persisted enum membership checks to
require `typeof state === 'string'` and compare the string without coercion. Exact
keys, enum/status-pair rules and recipe/ID/timestamp checks remain intact.
Regression cases cover arrays, numbers, booleans and objects at both boundaries,
plus publicnull rejection. Persistednull from an absent LEFTJOIN task remains the
specified legacy/search ready state and is explicitly covered.

Actual corrected-source checks:

- Focused parser/body/validation: 28 passed, zero failures/skips.
- `pnpm run lint`: passed.
- `pnpm run typecheck`: passed.
- `pnpm run build`: passed; compile3.3s and TypeScript1.72s.
- `pnpm run test:menu`: 65 passed in27.45s, zero failures/skips.
- `node --import tsx --test tests/deployment/*.test.ts`: 32 passed in2.14s.
- Targeted real Chrome smoke on the rebuilt client: actual protected URL save,
  ready metadata accepted, exactly one source acquisition and no console errors.
  It used owned isolated native publisher/database/server/profile fixtures with
  normal successful API responses, never a fabricated success response.
- `git diff --check`: passed.

The correction only rejects previously malformed non-string values. Existing
full Chrome proof for valid string states and visual behavior remains applicable;
the targeted rebuilt smoke confirms the shared client validator's valid path.
No broad visual/polling rerun or new screenshots were needed for this two-check
correction. All correction fixtures stopped and cleaned. Source is frozen for
independent exact-source security reconfirmation and final code re-review;
those approvals remain orchestrator-owned and are not asserted here.
