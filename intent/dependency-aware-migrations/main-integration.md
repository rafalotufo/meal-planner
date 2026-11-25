# Local main integration and adoption

- Owner authority: Rafael replied “Approved” to the proposed local main merge,
  followed by local rebuild/restart. No hosted operation, migration, push or
  deployment authority is included.
- Feature tip at intake: `4f44838`.
- Main tip at intake: `d26ea59`.
- Common base: `0c6a38b36e7652971ac95004df73b9040f878278`.
- Status: plan approved by independent review `2906f4a`; combined source
  `49e2a646` approved by `58c0933`; owner-authorized local main fast-forward,
  build/start and health checks completed in `local-main-result.md`.

## Integration contract

Both checkouts were clean at intake. Main advanced with T-Rex refinements:
shorter play area, gradual speed changes, associated TypeScript tests and
`tests/auth/browser.ts` QA. Preserve that exact main application/test delta.
It does not overlap the reviewed migration implementation. The historical
helper unused-binding correction is identical on both sides; retain the
original reviewed-source snapshot and SHA provenance already recorded here.

Merge the pinned main into the existing feature worktree first. Do not update
main until combined verification and independent review pass. Do not reset,
stash or overwrite pending unrelated work. If main advances again, incorporate
and verify the new delta before updating it. The actual reviewed database
implementation must remain byte-identical to feature source `ef5d85e`.

## Bounded work and checks

1. Independent reviewer approves this concrete integration plan.
2. Senior developer merges main into feature, resolves only necessary mechanical
   conflicts, verifies database source equality and preservation of the main
   T-Rex changes, and commits the combined source. Run frozen install, lint,
   typecheck, production build, all36 migration tests, family/menu/plans/auth/
   deployment/recipe tests and Python workflow checks. Run both real Chrome
   `tests/menu/browser.ts` and `tests/auth/browser.ts` for mobile/desktop menu,
   authentication and the refined T-Rex game. Preserve original screenshot bytes
   and save combined evidence under a new feature-specific path. No paid effects
   or real-user fixture bypasses; databases/servers/profiles are disposable-owned.
3. Independent reviewer checks exact combined source, actual evidence and audit
   preservation, including the restricted runtime fixture/auth-browser interaction.
4. Orchestrator rechecks both clean tips, then fast-forwards only local main to
   the reviewed integration. Inspect local configuration without printing secrets;
   require the recorded native loopback runtime target. Check compatibility
   read-only. Build in main and start/restart only the identified local app at
   its configured origin after verifying process ownership. Do not kill unrelated
   listeners. If no owned app is running, start the reviewed local application.
5. Verify anonymous local sign-in/routing health without provider calls or writes;
   record actual authenticated coverage separately as disposable-browser evidence.
   Do not claim real Google sign-in on the user's behalf. Record operational
   outcome, graph/main approval and independent final review. Audit-only outcome
   commits may also be fast-forwarded to local main; no source changes after the
   reviewed integration without affected revalidation.

Keep transaction/TLS/credential/schema/security contracts unchanged. A compatible
five-migration database needs no migration, and `db:migrate` will not run. If
read-only compatibility fails, preserve the data and stop local adoption with
sanitized evidence; migration authority is not implied by merge approval.

This is a new bounded integration/adoption loop, not an extension of the
completed implementation loop. Archive the previous solved workflow records
before initialization. Human hosted release gates remain closed.
