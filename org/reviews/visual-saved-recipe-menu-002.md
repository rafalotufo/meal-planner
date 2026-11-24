---
artifact: intent/saved-recipe-menu/visual-design.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 2
---

# Removal confirmation — focused independent Design review

Approved for owner visual review. No required findings. Reviewed only the
owner-directed removal-confirmation amendment in intent.md, spec.md,
visual-design.md and mockups/menu-preview.html. Earlier no-confirmation wording
is superseded. This does not claim owner visual or implementation approval.

- **Dialog semantics:** preview lines 109–114 provide a native modal dialog with
  a labeled question, selected recipe text in its description, shared-family
  impact, Cancel and explicit Remove actions. Line 158 sets the selected title
  as text, calls showModal and focuses Cancel before returning. Native modality
  supplies background inertness and focus containment; Cancel also has autofocus.
- **No effect on cancellation:** the removal guard precedes feedback deletion,
  pending state, timer creation and any saved-array mutation (158). Cancel,
  Escape and geometric backdrop dismissal all call finishConfirmation(false)
  (134–148), clear the requested removal, close the dialog and restore its
  triggering control's focus. They do not start the removal path or save state.
- **Confirmation and retries:** only the confirm handler authorizes the selected
  ID and redispatches that recipe's original action. The action consumes and
  clears that one-time ID before pending work. Each later attempt, including
  a failed-removal retry, consequently opens the dialog again. Existing failure,
  success, page refill and post-removal focus behavior remains after confirmation.
  The new guard applies only to remove; Add to menu retains its prior path.
- **Responsive Design:** dialog width is bounded by viewport minus 32px,
  border-box sizing and the mobile maximum (84–91); title text wraps and actions
  wrap rather than forcing horizontal overflow. The opaque existing panel
  surface and 44px actions remain. These rules support the specified 320/390px
  contract; root's separate browser QA provides measured rendering evidence.
- **Specification coherence:** the amended user flow now requires confirmation
  before pending/request, no cancellation effects, initial Cancel focus and
  retry reconfirmation. Its browser matrix explicitly calls for those checks,
  focus trapping/restoration and 320px bounds. No API/storage/auth/photo change
  is introduced by this visual amendment.

Verification: extracted inline JavaScript parses with Node vm.Script;
git diff --check passed. Static control-flow, DOM and CSS review only; this
reviewer did not independently execute a browser or claim production behavior.
Root is running the real-browser checks separately. No application source,
global workflow records, database or deployment was changed by this review.
Owner visual approval and an approved implementation plan remain separate.
