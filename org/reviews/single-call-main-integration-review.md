---
artifact: single-call-main-integration
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 1
---

# Independent integration review — single-call search into main

## Verdict

Approved for the explicitly authorized local main integration. No required
findings remain. Reviewed application bytes and both original audit namespaces
are preserved, the family acceptance guard is restored, and combined test and
browser evidence passed. The orchestrator must record the actual one-turn
verification and confirm main is clean at the expected input tip before moving
it. This approval does not authorize deployment or push.

## Application boundaries

Read current main AGENTS.md, the approved family/PostgreSQL plans and single-call
intent/spec/plan/reviews, current protected search/home/session code, the merged
README, input commits and integration record. Compared the merged tree against
reviewed feature 7144a0f and main 68e1931, sharing ancestor 7cbe321.

- The recipe provider, recipe fixtures and provider tests match the reviewed
  feature byte-for-byte. Main made no recipe provider/test changes since the
  ancestor. The original code review, red/green proof and isolated mutation
  challenge therefore remain applicable without new paid model calls.
- Family/auth/PostgreSQL source, protected routes/UI, AGENTS.md, dependency
  pins/lockfile, proxy and Vercel settings match main. The search route awaits
  requireFamilyContext before searchRecipes, and the home page requires family
  context before rendering search. No auth/session/admission, DB privilege,
  migration, photo transport or paid-usage boundary was overwritten.
- README retains main's family/PostgreSQL operating instructions and the
  reviewed one-call source/evidence/5,000-token description. No application
  conflict resolution or new source behavior was introduced by integration.

## Independent audit preservation checks

Independently recomputed all 190 manifest snapshot lengths and SHA-256 hashes,
and compared every snapshot's bytes with git show of its exact source commit.
Every comparison passed. The archived main and feature ledgers and the active
ledger each passed gate_ledger.py verification against their terminal record.

Confirmed the complete original main ledger and memory streams remain exact
byte prefixes of the active streams. All original main messages remain exact.
For each of nine imported historical feature decisions, independently compared
gate, artifact, approver, decision, commit and expiry with the archived original;
original hash/time match the import map, and import evidence expressly states
that it is not new approval. No old release decision is repurposed.

Checked all 34 main review-queue entries remain exact. Eighteen aliased feature
messages retain role, recipient, kind, status, blocking/severity, response
requirements, creation time and correctly remapped reply relationships. Both
original message namespaces remain immutable in the snapshots. Original feature
loop state/history and main's completed PostgreSQL loop/graph are preserved in
their separate immutable namespaces. Canonical document reference updates do
not rewrite the archived source bytes.

Read fresh owner authority in ceo-0026.md and code_owner_approve-008: local merge
of the reviewed feature with this main only. The integrated release gate remains
not_started; no remote push, new production release or hosted migration follows
from that authority.

## Administrative regression guard

Initial resolved config copied the completed feature's acceptance list and
omitted main's test:family command. Main AGENTS.md and the approved family/
PostgreSQL plans require that guard. The reviewer required retaining it rather
than merely archiving the former config.

Accepted the orchestrator's narrow correction: preserve both original completed
loops/configs in immutable snapshots, then create a distinct merge.md integration
verification work item with all eight current acceptance commands, including
family regression after build. Exactly one real bounded reviewer verification
turn may record actual combined checks; do not invent new PM/design turns or
rewrite either original six-turn history. No application/script change or
expanded implementation authority is implied. Inspected the actual merge.md,
configuration and initialized zero-turn state: max_turns is one, the existing
runtime's initial phase routes directly to reviewer:verify_integration, all
eight acceptance commands are strings, and test:family follows build. The
separate work item records the explicit owner authority and both input tips.
The corrected active configuration preserves the family regression guard
without claiming that an old historical loop ran the combined checks.

## Final verification

Combined checks passed: 66 recipe/photo tests, 7 workflow tests, 12 deployment
smoke tests, lint, strict typecheck, production build, 12 post-build auth tests
and 34 post-build family/PostgreSQL tests. The first family run had 33 passes and
one failure: roles.test.ts could not read the
per-worktree .data/postgres/development.env. The missing local config was not
weakened into a skipped assertion. A scoped ignored owner-only file using the
existing restricted loopback runtime/test configuration permits the unchanged
test to exercise its original role-privilege boundary. Independently checked
the local prerequisite file's mode is 0600. The actual unchanged rerun passed;
both outcomes remain in checks.json and the initial failure is disclosed.

The recipe/auth Chrome harness passed all five widths, with fixture searches,
zero unexpected console/network errors and no horizontal overflow. Family
production flows passed at 320/1440 pixels. The development StrictMode
invitation navigation initially timed out without a reported application
exception; the unchanged isolated dev-only scenario passed on retry in 13.317s.
No test, timeout, assertion, suppression or application change was used. The
initial failure and successful retry remain separately disclosed, with no
unproven root-cause claim.

Independent review also identified a capture-collector error: broad globs copied
historical screenshots under run-specific aliases although the named run had
not produced them. The orchestrator removed the 134 extraneous aliases from
the deliverable into ignored scratch, corrected only the ignored collector,
and reran the unchanged auth harness successfully in 9.612s. Final evidence has
exactly 27 captures: 19 current auth outputs, six actual family-production
outputs, one initial dev failure and one dev-only success. This evidence fix is
disclosed in the integration record rather than presenting historical copies as
new visual proof.

Independently viewed the actual new recipe-result captures at 320/1440 and the
family-management captures at 320/1440. Forms and controls fit their viewports;
recipe history/count/sort and family invitation controls remain visible without
horizontal overflow. Independently confirmed there are 27 final capture files
and zero changed pre-existing main PNGs. All original main screenshots remain
restored. The screenshots and browser intercepts are fixture proof, not new
paid provider or hosted-app evidence.

Rechecked all 190 snapshots against exact source Git bytes and manifest hashes,
both canonical main prefixes, current reviewed application boundaries, the
eight-command configuration and closed release gate after the corrections.
The handoff records zero staged-secret findings, approved-plan synchronization
passing, and zero message/loop/memory violations; the final staged whitespace
check also passed. The source manifest explicitly names unchanged files imported
from main, with literal route brackets escaped for the existing fnmatch checker.

This reviewer changed only this review artifact: no application, credentials,
database, org state, ledger, Git history or paid API action.
