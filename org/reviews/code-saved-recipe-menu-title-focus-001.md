---
artifact: saved-recipe-menu-title-focus-correction
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Menu title — focused independent follow-up review

Approved. No required findings. This supplemental verdict covers only the
menu-controls.tsx mount-focus removal and explicit pagination heading targets,
its scoped spec clarification and browser regression changes. It does not cover
any subsequent saved-button/membership change or grant merge/deployment authority.

## Evidence

- The cause is the unconditional menu-heading.focus() in MenuControls' mount
  effect. The diff removes that statement, preserving the effect's request-abort
  cleanup. Initial direct load, header navigation and ordinary reload no longer
  imperatively focus the title; no global focus-outline suppression is added.
- Deliberate Older/Newest links, including the older-empty-state link, now target
  #menu-heading natively. The existing focusable heading remains unchanged, so
  the approved paging accessibility behavior is preserved without an unconditional
  lifecycle focus. The scoped spec amendment distinguishes these user actions.
- Dialog initial Cancel focus, cancel/Escape/backdrop restoration, removal
  confirmation/retry behavior, request/version guards and next/previous/empty
  focus after refresh are unchanged. Source/time/photo cards and backend/auth/
  storage/provider behavior are untouched by this correction.
- Browser tests now wait on actual React-control hydration independently of
  title focus. They explicitly reject focused/selected title on direct/header/
  reload paths, retain intentional paging-focus assertions, and check normal
  Tab navigation has visible focus without a trap. Existing complete removal
  and fixture cleanup assertions remain. MENU_TEST_BUILD_DIRECTORY is read only
  by the test helper to select its isolated compiled fixture; no production test
  hook or application environment behavior is added.

## Verification and limits

Reviewed actual scoped code/test/spec diffs and the author's verification section
at verification.md:395 onward. Its real-browser RED run fails the new no-auto-
focus assertion with activeElement.id menu-heading against the old compiled
application. The GREEN record reports isolated strict typecheck/build, root
lint, recipe82, menu32, family34 and the full actual production Chrome matrix
passing, including390/1440 layouts and dialog320. Root separately reports7Python
checks passing. These commands were not redundantly rerun by this reviewer.

Independently ran git diff --check, which passed, and inspected the before/after
390px screenshots. Those frames show the stable menu layout without a visible
ring; they are not claimed as a pictured reproduction of the OS/browser-dependent
highlight. The actual activeElement RED/GREEN assertion supplies that evidence.

The active user's existing next-env.d.ts dev-types change was left untouched by
this reviewer. The author records byte-for-byte preservation while validation
used a private source/build copy, without stopping the user's server or changing
development/hosted schemas. No application/test edits, DB/browser operations,
merge or deployment were performed by the reviewer. Only this report was written.
