# Family first-login checkpoint

Date: 2026-11-23. Scope: approved plan tasks 4–8.

- HTTP regression before implementation observed Google callback destination `/`
  instead of `/onboarding`; saved at `/tmp/family-provision-red.txt`.
- Actual Google handler now populates only verified `googleSubject`; its encrypted
  cache survives fresh reads. Existing tests explicitly assert that this subject
  differs from the library-generated user ID. Injected subject/family/direct-token
  fields are rejected, and cookies missing the subject cannot authorize access.
- Admission validates current allowlist/invitation grants and membership from
  SQLite. Pure policy proof covers intentionally empty and malformed lists,
  including membership without a grant failing closed.
- Complete HTTP flow now reaches onboarding, proves GETs/session checks create
  no family, denies member-only API access until the protected provisioning POST,
  and returns exactly one family/user after repeated POSTs.
- Two separate Next server processes using the same temporary database provision
  the same verified Google subject concurrently: both return success and exactly
  one family/user remains. A real SQLite trigger aborts user insertion and proves
  its preceding family insertion rolls back. Cross-origin requests and a
  presented malformed invitation context cannot create a family.
- Strict typecheck, zero-warning lint and production build pass without DB/secrets.
  Family checkpoint suite: 8 tests passed; existing authentication suite: 11 passed.
- The test harness owns migrated temporary databases and removes them after
  stopping its server. No production test bypass or fixture import was added.
- Invitation handlers/UI are the next slice. No browser or live Google proof is
  claimed by this checkpoint; those remain required before final handoff.
