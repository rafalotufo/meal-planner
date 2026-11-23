---
artifact: recipe-photos-implementation
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved
round: 2
---

# Independent recipe-photo code rereview

## Findings

No unresolved blocking findings or nits. Approved corrected snapshot `76f44b4`
against the accepted photo intent, approved spec/plan and initial code/security
findings.

## Corrections and independent evidence

- `lib/recipes/photo-metadata.ts:111` resolves associated Recipe nodes before
  collecting images. The guard at line 125 admits Recipe images only when
  exactly one node qualifies. The gnocchi/cake fragment counterexample from
  `code-recipe-photos-001.md` therefore cannot pool competing photos. Approved
  page-bound OpenGraph and previous-image fallbacks remain; valid single-node
  cases retain existing precedence.
- `photo-metadata.ts:9` rejects raw C0 controls and DEL before trimming or URL
  construction. The shared helper covers relative/absolute image and page /
  Recipe identity fields. Invalid declared identities remain present in the
  `every` checks at lines 110 and 118, preventing malformed declarations from
  being reclassified as absent and rescued by name/canonical matching.
- Independently ran `npm test`: exit 0, **57 TypeScript tests, 57 pass, zero
  failures/skips/cancellations**. All previous 34 behavior regressions and the
  transport/enrichment tests remain. The two new regression groups cover
  conflicting source-matching Recipes, valid social fallback, raw/HTML-escaped
  controls and invalid Recipe/page identities.
- Independently mutated temporary copies of the emitted selector, without
  changing tracked files. Removing the single-associated-node guard made its
  new regression fail (10 metadata tests: 9 pass, 1 fail). Separately removing
  the raw-control guard made its new regression fail (9 pass, 1 fail). These
  tests detect both actual defects rather than merely mirroring output shape.
- Read final independent `security-recipe-photos-002.md`, verdict clear. It
  records 57 passing tests plus additional control/identity/fallback probes.
  Native DNS/HTTPS pinning, TLS identity, resource bounds, module-wide two-job
  admission, original-deadline/parent abort handling and server-only provider
  composition are unchanged from the whole-feature review. No new connection,
  provider call, public response field or UI state is introduced by the fixes.
- Read the updated verification report: all required lint/typecheck/build and
  seven Python checks pass, with staged secret/plan-sync/diff evidence. Those
  commands are the developer/orchestrator's recorded checks rather than reruns
  by this reviewer. `git diff --check` independently passed.

## Source/browser evidence and limits

Independently viewed the saved desktop, mobile and broken-fallback JPEGs:
three recipe photographs are visible with legible cards and consistent image
areas; a broken image retains the intentional fallback and recipe details.
The current plan already covers these `.jpg` artifacts; no manifest-format
change is required.

The orchestrator's real pinned metadata transport/selection and CUA measurements
report Love and Lemons improving from 150×150 to 500×500, Inspired Taste loading
1250×833, and King Arthur loading 1248×832, at desktop/mobile without overflow.
Provider cards were explicitly simulated from captured known results while
publisher metadata and browser image loads were real; zero additional model
calls occurred. After correction the orchestrator reran selection on the three
exact cached publisher HTML documents and obtained unchanged image URLs. This
is preserved target-case evidence, not a fresh provider search or a promise of
universal metadata/photo availability.

## Verdict

Approved for the org code-review gate. Changes stay within the reviewed
metadata-only network exception, exact dependency graph and image-only contract.
Ambiguous, inaccessible or unsafe sources still fail softly; original recipe
source/method/time validation and configurable provider behavior remain intact.
This reviewer made no application edits, dependency install, source/photo/model
network request, secret read, status/loop/graph/ledger mutation, commit, merge
or release. Human merge and release authorization remain separate.
