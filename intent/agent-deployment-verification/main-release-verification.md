# Main integration — local verification evidence

- Date: 2026-11-25; author: senior-developer
- Candidate: feature a8867b4 integrated with main cd60db4 plus the reviewed packaging correction. Root binds the final merge SHA after audit reconciliation.
- Application upload inventory:139 regular files, canonical content digest `50a6ada840fc087920bc84cf62cb3f99cb890aafb5392e20aa634b6de831cadf`; full paths/SHA256 in `main-release-upload-inventory.json`.

## Actual packaging correction

The regression exported tracked application files through the actual Vercel
exclusions into a new owned temporary directory, without env files, generated
policy, scripts, tests, intent/org artifacts or local build output. Its RED was
the real package build failing `ERR_MODULE_NOT_FOUND` for the excluded
`scripts/build-verification-manifest.ts`. A second RED showed the missing
`.verification` upload exclusion. No cached policy or uploaded operator tool hid
those failures.

The generator now lives under uploaded `lib/verification/build-manifest.ts`;
all three package prefixes use it. Local `.verification` is upload-excluded.
The same clean-export regression then passed2/2, including an actual Next build
and a newly generated exact `{enabled:false}` ordinary/Production policy, with
no database or provider connection and matching pinned dependency links.
Main's finite hosted-permission and attribute-option validators and their full
tests remain present; no validator relaxation or historical migration edit occurred.

## Command results

All commands below exited0. No skipped/deleted assertions were used.

| Command | Actual result |
| --- | --- |
| `pnpm run lint` | Clean |
| `pnpm run typecheck` | Strict type checking passed |
| `pnpm run build` | Pinned metadata check and Next16.4.6 webpack build passed |
| `pnpm run test:migrations` |69/69, including main's finite platform/attribute tests and real combined security fixture |
| `pnpm run test:family` |35/35 |
| `pnpm run test:menu` |69/69 |
| `pnpm run test:plans` |23/23 |
| `pnpm run test:auth` |16/16 |
| `pnpm test` |84/84 recipe/photo/provider/runner regressions |
| `node --import tsx --test --test-concurrency=1 tests/deployment/*.test.ts` |40/40, including clean upload and compiled runtime without source/SQL |
| `node --import tsx --test --test-concurrency=1 tests/verification/*.test.ts` |29/29, including real unfinished-body, copied-configuration Production denial, conflict logout and stripped verification runtime |
| `python3 -m unittest discover -s tests` |7/7 |

The Node suite total is365, without double-counting the focused32 main validator
checks or the standalone2 upload checks already included above. Tests used only
owned random local PostgreSQL databases, isolated servers/builds and empty paid
keys. No shared development data, hosted database, configuration or deployment
was changed by this worker.

## Actual Chrome results

All three real helpers exited0: verification browser, menu browser and plans
browser. Chrome158.0.8127.88 completed native verification form/server-cookie entry,
home/menu/family/plans at390/1440, stored-session revocation and private redirects,
with zero Google/provider calls and no browser errors. Menu390/1440 and
plan320/1440 regression flows passed; additional modal geometry checks at768,
1024 and320x568 reported maximum frame delta0px.

Fresh screenshot evidence is under `org/reviews/agent-verification-main-integration/`
(35 files from the exact current helper screenshot calls). Historical images were
snapshotted before execution and their bytes restored after the new evidence was
copied; unused historical copies were not presented as fresh observations.
The entry390 and authenticated home1440 screenshots were also visually inspected: readable form/labels, intact navigation and no clipping. Firefox is unavailable and Safari automation was not executed. These remain
explicit coverage gaps, not inferred passes.

## Operational limits

This is local combined-source/package proof. It is not hosted staging acceptance,
real Google OAuth/provider success, Vercel deployment-protection proof, migration
execution or Production health. Root retains exact-source staging acceptance,
review/merge, separately scoped migrations/grants/data/issuance, private handoff,
manual release/promotion and bounded recovery gates. Both new native migrations
and their current catalog/grants must be handled explicitly before serving this
new application against either recorded hosted database.
