# Remaining hosted verification — 2026-11-23

Scope: existing deployment dpl_GP3AMEcqCP7A3NGemnEc1hYZQWHB, project
prj_ntxXnJAVA977jHjLNDR7xJuwSx4V, rafalotufos-projects Hobby, stable origin
https://meal-planner-delta-six-55.vercel.app. No application/configuration,
allowlist, billing or security-setting changes.

Renewed authority: Rafael explicitly approved the bounded verification question;
org/messages/ceo-0011.md and committed ledger
release-vercel-verification-human-002. Resume succeeded at18:39:57UTC;
paused:false for the exact project. Maximum window ends19:09:57UTC
(14:09:57 Toronto). At most two additional nonpersonal provider searches;
pause again at completion or deadline, regardless of passing results.

## Independent cancellation timing — passed

The authenticated Vercel dashboard's Request Logs exposed the earlier real
disconnect invocation, avoiding another paid cancellation probe. Request ID
s2xx7-1795458204439-2b8930042d2e, POST /api/recipes/search, exact deployment
above. Request started18:23:24.439UTC. Function Invocation independently reports
Execution Duration11.03s / Maximum1m30s. The already-recorded browser navigation
to /sign-out began18:23:35.419UTC; CDN reported499 on disconnect. Inferred end
from rounded duration is18:23:35.469UTC, about50ms after navigation. This
correlates server execution ending promptly with client disconnect and effective
supportsCancellation:true, rather than treating499 alone as server evidence.
It does not establish provider-side billing cancellation or finer timing than
the dashboard's rounded measurement. Screenshot:
vercel-deployment-cancellation-timing.jpg. The90s maximum is now independently
observed in the dashboard, supplementing the earlier owner attestation.

## Local regression evidence

pnpm test:57 tests,57 pass,0 fail,0 skipped. Includes native transport address
policy, pinned credential-free TLS/Host, DNS/redirect/type/encoding/size failures,
stalled DNS/body deadline and parent abort, source-specific metadata selection,
optional enrichment failure preserving cards, global concurrency, photo parent
cancellation and provider deadline/caller-abort propagation. This deterministic
evidence is distinct from hosted publisher success. No deliberate unsafe live
transport probes or repeated provider spending is used to exercise every branch.

## Browser checks — in progress

The in-app browser has no offline/request-blocking capability. Native Chrome
access was not approved; it was not retried or bypassed. Offline submission and
broken-image injection were handed to the owner with exact procedures; results
must be labeled owner-attested. Google disallowed-account credentials stay in
the owner's private/incognito browser, not audit records.

Keyboard: hosted sign-in button obtained visible keyboard focus using Tab and
was activated using Return. Allowed Google session returned to the form.
Tab focused recipe-query with :focus-visible, next Tab focused Find recipes
with :focus-visible; Return started one nonpersonal potato-gnocchi search,
observed Searching/disabled controls. Additional provider calls used1/2.

An initial viewport change applied to the selected dashboard tab, not the app;
it is not counted. After closing that completed dashboard tab, the app's
read-only DOM measurement confirmed exact innerWidth390, innerHeight900,
scrollWidth390, with the textarea focused. Further result/desktop checks and
final recovery status will be recorded below.

### Exact geometry and keyboard results — passed

The keyboard-submitted live search completed with four real source-bound cards:
Love and Lemons, Inspired Taste, King Arthur Baking and Jamie Oliver. All four
publisher photos loaded after scrolling (natural dimensions500x500,
1200x1800,1248x832,1280x720). No image failure or fallback is inferred from a
previously offscreen lazy image. Each source link uses HTTPS, target=_blank and
rel=noopener noreferrer. Loading completed, controls restored, no alert.

At exact innerWidth390 and1440 (height900), scrollWidth matched innerWidth.
Full-page JPEG screenshots were saved as results-exact-390/-1440 and visually
inspected: single column on mobile, three columns on desktop, legible summaries,
times, usable links and images, no clipping. All four result links were reached
sequentially with Tab and matched :focus-visible; Shift+Tab moved backward on
desktop. Accessible link labels include recipe title and new-tab announcement.

A separate auth tab preserved the search results. Exact390/1440 sign-in and
sign-out screens each had scrollWidth equal to innerWidth; Tab reached their
sole action with :focus-visible. Screenshots sign-in-exact-390/-1440 and
sign-out-exact-390/-1440 saved. Actual logout will be activated by keyboard at
the end of the session to preserve the result cards for any fallback handoff.

Renewed anonymous smoke: status401,elapsedMs678,pass:true (root redirect,
sign-in200, protected session/search401 with no-store). No provider call.
At this point the renewed provider budget remains1/2.

Additional validation check (no provider request): clearing the textarea and
keyboard-submitting shows the length-validation role=alert, aria-invalid=true,
focus returned to recipe-query with :focus-visible, four existing cards retained.
Exact390/1440 error screenshots saved as validation-error-exact-390/-1440.
Restored the nonpersonal query without resubmitting. This is validation evidence,
not a substitute for offline submission. Captured hosted console diagnostics:
0 errors,0 warnings.

Independent reviewer assessed the timing screenshot/report and exact geometry
claims:0 Blocker,0 Major,0 Minor; READY FOR HUMAN REVIEW, evidence only. The
review explicitly preserves the pending three owner checks and mandatory pause
at completion or19:09:57UTC.

## Owner-performed live checks — passed by attestation

Rafael answered the three exact procedures during this live window:

- Real Google identity outside the allowlist in a private/incognito window,
  followed by attempting the root: “Denied; recipe form stays inaccessible.”
  The stated criterion distinguishes app rejection from Google's own consent/
  test-user denial. Identity and credentials were not disclosed or recorded.
- DevTools Network Offline before submitting, then restore Online without
  resubmitting: “Error shown; controls restored; back online.” This induced
  client-side network failure makes no provider call.
- Existing real result card, browser-only replacement of one img src with
  https://example.invalid/blocked-photo.jpg: “Fallback appears; card remains
  usable.” Expected fallback was Photo unavailable; title, summary, time and
  source link remain usable. No new search, source/config or persisted change.

These are owner-attested real hosted results, not agent-observed screenshots
or fixture runs. The independently observed checks remain separately labeled.
One additional live search used out of two authorized; no cancellation retry
was required, and the unused allowance is not spent.

## Final logout and recovery — passed

At exact390px, Tab reached Sign out with visible focus. The initial native
Return produced no observed state change; no successful action was inferred.
After inspecting the settled state, the documented button.press(Enter)
keyboard action showed Signing out, then /sign-in. Fresh navigation to the
protected root returned /sign-in again. Screenshot keyboard-logout saved.
Temporary viewport overrides reset.

Rafael then confirmed “Paused in my terminal” in response to the exact scoped
CLI procedure. At18:48:18UTC, read-only project metadata independently returned
the exact project ID/name and paused:true; live browser reload displayed503
DEPLOYMENT_PAUSED, saved as remaining-checks-paused.jpg. This is before the
19:09:57UTC deadline; the run lasted under nine minutes. Source is unchanged.
Owner results and pause receipt: org/messages/ceo-0012.md.

## Acceptance disposition

All browser/cancellation checks listed in the prior user-facing summary are
now supported: independent
function cancellation timing, exact390/1440 layouts, keyboard operation,
owner-attested real denied identity, offline submission and broken-photo
fallback. Publisher photos succeeded live; deterministic local transport
branches remain explicitly local evidence. Hosted60s/504 remains unobserved
under the already-approved ceo-0009 nonblocking amendment, not claimed passed.

The same deployment is retained and paused as required by ceo-0011. No rebuild,
redeploy, environment/allowlist/security change, billing adjustment or automatic
resume occurred. Additional model searches1/2; total agent live searches across
both windows3. These results close the listed functional verification gaps.
Final independent review found one earlier checklist item omitted from that
list: D4 requires effective existing OpenAI model/rate/spend/alert controls to
be verified and recorded (first release report lines77-78, spec D4/C2). Keeping
settings unchanged and successful model access do not establish those limits.
Owner verification has been requested, without billing changes or credential
access. Overall production readiness remains pending that inventory; the
hosted-timeout limitation remains accepted as nonblocking. Production resumption also
requires owner release authorization; the release graph remains in_progress
while paused.

### Provider inventory follow-up

Rafael answered “Budge will stop requests” to the controls verification request
(ceo-0013): budget enforcement is owner-attested, not independently inspected.
Rafael subsequently confirmed the current monthly budget is $20 (ceo-0014;
currency unspecified). Amount and enforcement are owner-attested existing
configuration. Alert thresholds and effective gpt-6.2-sol requests/minute and
tokens/minute remain unrecorded. No setting is changed and production remains
paused without resume authorization.

Official provider documentation distinguishes enforced spend limits from
alerts and notes tracking delays; the existing spec already preserves delayed
overshoot exposure. Reference:
https://developers.openai.com/api/docs/guides/spend-limits.

Final independent rereview of the corrected records:0 Blocker,0 Major,0 Minor;
the readiness-overstatement Minor is resolved by keeping D4 inventory pending.
Documentation is READY FOR HUMAN REVIEW, not production-completion approval.
