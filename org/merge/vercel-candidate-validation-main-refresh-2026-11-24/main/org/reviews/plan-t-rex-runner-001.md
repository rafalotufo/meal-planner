# T-Rex Runner — independent plan and provenance review

- Date: 2026-11-24
- Reviewer: reviewer (independent of senior-developer)
- Assignment: plan-t-rex-runner-001
- Verdict: Approved for human plan review; no required findings
- Reuse verdict: Selected pinned adaptation may proceed after human plan
  approval with the exact notices, source credits and asset checks below.

## Implementation plan

plan.md:17–54 names all application modules, asset/notice paths, replacement
tests and five obsolete Word Snack removals. Historical audits and unrelated
work stay intact. The existing compiler includes recipe-*.ts tests and follows
their imports; no test exclusion or unchecked-JS exception is proposed.

Tasks 2–5 give small test-first slices for immutable simulation, request-ID
session state, instance-owned canvas and integration. Fixed 600×150 physics,
50ms delta cap/substeps, measured jump/gap proof, exact original hitboxes and
crop-bound/DPR checks are explicit (73–123). Auto-start does not await assets;
success/zero unconditionally discard every mode. Initial focus is revocable,
Space stays scoped, Hide/Show is pending-only, and old-panel focus is retained
(125–144). Browser proof covers late images, resource ownership, modes,
reduced motion, native input, five widths and conditional completion focus
(146–165). No consequential behavior/test gap was found.

The clean-source QA procedure records matching source/lockfile hashes, preserves
the active dev cache and distinguishes baseline passes from new-code evidence
(167–182). The subsequent real-checkout runtime paragraph (184–197) is a narrow,
human-plan-authorized exception: isolate only verified owned generated dev
types, save the original next-env bytes, run unchanged strict commands, restore
in finally, and preserve/report concurrent-regeneration conflicts rather than
overwriting or claiming passes. It does not permit suppressions, source/config
edits or synthesized acceptance. No isolation was performed in this review.
Six-turn ownership remains explicit: plan 3, implementation 4, security 5,
review 6; no silent budget reset or merge/release authorization (199–216).

## Independent provenance and license checks

Read both complete local BSD notices, source/extraction headers, proposed
adaptation ranges and the research PNGs. Recomputed every research-file SHA-256,
byte count and PNG IHDR dimensions; all match provenance.md. Both original
sprite sheets were visually inspected with view_image. Key results:

| File | Bytes / dimensions | SHA-256 |
| --- | --- | --- |
| wayou index.js | 90,241 | e7a50d337bdbe4299068de034e4564cfe5fd45ca9257ded37b6ada9330cedf0f |
| wayou LICENSE | 1,517 | c6ba363b8d8d89eab0a8f4775e4fc5dc2dc1c3b649cbf2a0af4049699ee29533 |
| Chromium historical LICENSE | 1,559 | 845022e0c1db1abb41a6ba4cd3c4b674ec290f3359d9d3c78ae558d4c0ed9308 |
| 1× sprite | 2,645 / 1233×68 | e306705c996676db01f4072ed3d6f33d89089a848ab0b2a0ba07a2d866ec309f |
| 2× sprite | 3,244 / 2441×130 | b3011fd16e43cd860b9782c4eafe77c1cc40da2e0f6e2e5ea547d98d6efac879 |

Independently fetched pinned wayou source/license/sprites and historical
Chromium source/license/sprites; remote hashes match the local research copies.
The [upstream extraction commit](https://github.com/wayou/t-rex-runner/commit/f5659df799d6d5189a6b6e4bd6e0ca07cc124aab)
confirms the Chrome v55 origin; primary Gitiles release metadata resolves
55.0.2883.87 to 12203fa1bfc7f10c98bcbceaa11161fd1d1c17f8. Both sprites are
byte-identical at that Chromium commit. This independently supports the scoped
lineage claim in provenance.md:43–74 without asserting that all later wayou
source is identical to Chromium v55.

The pinned [wayou license](https://raw.githubusercontent.com/wayou/t-rex-runner/5455bfa408ec6b707c7300ff194b7390733a766d/LICENSE)
and [historical Chromium notice](https://raw.githubusercontent.com/chromium/chromium/12203fa1bfc7f10c98bcbceaa11161fd1d1c17f8/LICENSE)
both permit modified redistribution subject to retained source/binary notices,
non-endorsement conditions and disclaimers. The proposed two unchanged complete
license files, combined shipped notices and original Chromium/extraction
headers preserve these distinct attributions (provenance.md:76–89). This is
clearance of the selected documented reuse proposal, not a legal certification
of every upstream contribution. Additional reused material requires review.

Actual vendored hashes, adapted-source map, complete shipped notices and
authenticated local notice/image access still require final verification.
lib/auth-policy.ts currently protects these proposed paths; no new public
exception is needed. No application assets have been added yet.

## Limits

Read approved intent/spec, current plan/provenance, relevant current lifecycle,
test compiler/auth policy and research source ranges. git diff --check passed.
Primary web rendering initially failed; read-only HTTPS retrieval independently
verified the facts above. No downloaded code was executed. No app/code/cache,
build/typegen/auth, org-loop/graph/ledger or runtime changes were made. Human
plan approval, merge and production release remain separate gates.
