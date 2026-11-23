---
artifact: intent/authenticated-access/plan.md
reviewer: reviewer
verdict: approved
round: 1
---

# Independent build-plan review — authenticated access

## Verdict

Approved for implementation under `org/protocol.md`. No blocking findings in
bugs, security, or compliance. This verdict approves the reviewed plan only;
independent implementation/security review and human merge/release gates remain.

## Evidence

- Bugs: `intent/authenticated-access/plan.md`, tasks 1–4, starts with a failing
  production-server regression, then incrementally closes pages and endpoints,
  completes Google callback/session creation, and verifies browser logout.
  The tests exercise real HTTP requests rather than UI-only session state.
- Security: tasks 2–4 require lazy fail-closed configuration, canonical origin,
  full session verification, exact public path/method policy, resource checks,
  CSRF/state/PKCE protections, cookie expiry/transport attributes, and denials
  for forged, wrong-secret and expired cookies. A test-only outbound network
  preloader supplies provider responses without introducing production bypasses.
  The risks section explicitly calls out encrypted account-token material,
  cookie lifetime/chunk deletion, and the copied-cookie revocation limit.
- Compliance: the manifest covers the source, tests, configuration and evidence
  required by the approved sibling specification. Dependencies are exact pins,
  existing versions and checks are retained, and the heading-only home page
  remains in scope. Task 5 requires frozen install, workflow and auth tests,
  lint/typecheck/build, native audit, secret and process checks, actual results,
  and visually inspected Chrome evidence at 320 and 1440 CSS-pixel widths.

## Verification of the plan

Reviewed the full 169-line plan against the accepted intent and independently
approved specification. Implementation order has explicit dependencies and
checkpoints. The production build precedes the workflow auth-regression command,
which owns its isolated server and cleanup. Google mocking remains in the test
process; live credentials/consent success is explicitly distinguished from local
integration evidence. The planned auth UI stays minimal, and no database,
production deployment, merge, push or release is authorized.

Implementation must demonstrate the pinned library's actual behavior and bring
material design departures back for review; this approval does not waive a
failed test or authorize broadening public exceptions. No runtime behavior or
security clearance is claimed at this planning gate.
