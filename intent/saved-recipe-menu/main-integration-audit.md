# Current-main integration audit

Owner authorized merging the saved recipe menu into main and deploying to
Production in canonical `org/messages/ceo-0050.md`. Current-main integration is
being verified before merge; staging-first acceptance and target-specific schema
cutover/recovery remain required before Production effects.

Feature source before integration: `6458023`. Main input: `6efc2cf`.
Both diverged from `fce96bf` and allocated overlapping org message IDs and
independent append-only ledger tails. Concatenating their ledger chains or
silently treating conflicting message IDs as equivalent would corrupt evidence.

The complete original feature org/messages, loop, memory, status, gates and root
workflow files are preserved unchanged under
`org/archive/saved-recipe-menu-pre-main-6458023/`. Its manifest records the exact
source commit and SHA256 of every original archived file. Existing feature
reviews remain at their unique original paths. Feature documents that linked
original message paths now link to their archived copies. Archived internal text
and ledger chains remain unchanged and retain their original historical meaning.

Canonical root messages, ledger, active loop/memory/status and workflow graph
retain main's versions. Feature-only canonical message files were removed only
after their exact committed originals were archived. New merge/release decisions
use newly allocated canonical IDs and refer to the preserved feature evidence.
No approval is fabricated by this reconciliation. Main's newer shared layout,
AGENTS guidance and staging-first release runbooks are retained.

The merge resolves the menu into main's shared navigation/layout and retains the
reviewed saving, family isolation, confirmation, paging, photo and disabled-save
behavior. Fresh combined verification and independent reviews are required;
previous feature-only reviews do not certify integration changes. The user's
existing next-env.d.ts and running development server remain untouched.

## Fresh integration verification and review

The combined source passed frozen isolated installation, lint, strict typecheck,
production build and199Node regressions (82recipe,35menu,34family,16auth,
32deployment). Full menu browser acceptance passed at390/1440 and dialog320;
authentication browser checks passed across five widths and family browser checks
passed against production/dev fixtures. The original inherited shared-layout
browser process stalled and was terminated143; that run is inconclusive, not a
pass or proof of application failure. A bounded private rerun with unchanged
assertions, diagnostic CDP deadlines/phase labels and owned cleanup passed six
shared-layout routes at320/1440. No repository/runtime fix was invented from the
stall. Author evidence and cleanup details are in verification.md.

Fresh independent integration code and security verdicts are approved in
`org/reviews/saved-recipe-menu-main-integration-001.md` and
`org/reviews/security-saved-recipe-menu-main-integration-001.md`.
Both independently checked the366archived files against exact original Git bytes
and hashes, plus main's canonical ledger prefix. Root archive/operations secret
scan and diff checks passed. Source/read-only hosted preflight and backups grant
no hosted migration or destructive recovery authority.

Automatic approval review rejected reinstalling dependencies in the active
checkout due to potential disruption of the user's running dev server. The
required frozen install instead succeeded in a private copy with its own real
node_modules; no active checkout dependency change or approval bypass occurred.
