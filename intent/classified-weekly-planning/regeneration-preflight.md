# Classified plan regeneration — preparation and rollback rehearsal

- New owner authority:`e14dfbb`, ledger`classified-plan-regeneration-20261127`,
  expires2026-11-27T19:21:44Z. This is separate from consumed release authority.
- Fixed deployed source:`f0b8c1e3a8dd0ae55e8a7568c53cef00637bb8b5`.
- Actual sanitized proof: sibling`regeneration-preflight.json`.
- **Preparation complete; no replacement committed. Stop for independent helper
  review before executing commit mode.**

## Exact scope and helper

Only Production Neon`plain-pond-82425009` / `br-wild-dust-bbr2mvzw` /`meal_planner`,
family`43d6ebb2-8115-4c38-ad63-65b153cb128e`, old draft
`d8ad41c1-e840-401e-998f-88d5101c7781`, week2026-11-29 (Nov29–Dec5), is targeted.
Fresh provider inspection18:28:33Z confirms current READY Production5LXW/fixedf0.
Strict schema9/current migration checksums/descriptors, positive runtime grants
and TEMP denial pass using the owner connection; no grant is added or reconciled.

Temporary helper outside the repository:
`/private/tmp/classified-plan-regeneration-20261127/regenerate-plan.mts`.
SHA256:`c38fad8f4b03000580a22c31184d599f1cefa0725c39ef1aad6c4b5aacef5190`.
It is owner-only0600 in0700, with11 pinned-source file hash checks. Strict TypeScript
compilation passed using the repository's unchanged strict/skipLibCheck=false bar;
an ordinary private node_modules link resolves types outside the repository.
No application code, runtime API, compiler rule or deployment was changed.

The helper accepts only fixed `rehearse` or `commit` modes. It validates the finite
expiry, exact private owner target/TLS, deployed-source freshness and fixed scope.
Commit mode additionally requires a private independent-review receipt matching
helper SHA/source/old target/content digest/reviewer commit, and an exclusive attempt
marker prevents blind replay. Commit mode has not been invoked.

## Transaction and bounded effects

One reviewed `FamilyDatabase.transaction` uses READ COMMITTED and takes common
advisory lock73462901 before decision reads, with existing bounded local timeouts.
Under that lock the helper checks exact/latest family-week draft ID/revision1,
seven valid snapshots, no approvals/suggestions, current admission and ready pools
17main/3side/3veggie. It calls deployed`generateFamilyPlan` while the old row exists:
its required`existing` result proves the function's current eligibility check,
without duplicating admission or ranking policy. Insufficient or unexpected pools,
changed/finalized targets or other drift fail before deletion.

An exclusive0600 narrow backup of the original full plan and all dependents is
written privately before effects. Deletes name only the exact target dependents
and old ID/family/week/draft/revision guard. The SAME deployed generator then runs
for the SAME family/week with a real current `new Date()`, not a fake Wednesday or
global scheduler invocation. Assertions require one new UUID draft revision1,
eight unique sources, exactly4main/2side/2veggie, zero dependents, actual timestamp,
and unchanged all other tables/other weeks/schema/grants/roles/migration history.
Any failed assertion rolls the entire transaction back; no externally visible
empty-plan interval is intended. There is no restore or broad cleanup operation.

## Actual rollback-only proof

The one rehearsal completed2026-11-27T18:29:00.889Z, exit0. Every guarded replacement
and classification assertion passed inside the transaction; an explicit sentinel
then forced ROLLBACK. Its proposed UUID`6cb57c36-3f63-422a-bdc2-90a9626726ff` was
transaction-local and **is not a committed replacement**.
A second locked readback proved the exact original plan/dependents and full state
restored. Before and readback full-state digest are both
`c5a9ef7556f094a8d1ea95e20130f81539af3bc0044bef7a4651686acf0fc7df`.
All unrelated data, schema9, grants/roles and old migration history remained equal.
The private narrow backup is3980bytes, SHA256
`01758997c81e00046fe22a26e02375544665b049463f737e09d013f1092bf491`;
raw recipes/titles/URLs/emails/subjects were neither printed nor committed.

The original target remains its seven-recipe draft. Private connection handoff is
retained only for the already authorized post-review commit phase; no app session,
provider call, identity, schedule, schema/grant or deployment effect occurred.
Next: independent exact-helper/rehearsal review, then root dispatches commit mode
under this same finite owner scope and independent readback/final review.
