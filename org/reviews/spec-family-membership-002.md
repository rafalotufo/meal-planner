---
artifact: intent/family-membership/spec.md
reviewed_at: 2026-11-23
reviewer: reviewer
verdict: approved-for-human-review
round: 2
---

# Independent specification re-review — identity and logout fixes

## Verdict

Approved for human specification review. The two round-1 findings and the
library-cache clarification are resolved. No new blocking inconsistency was
found in this focused delta. This peer verdict is not human approval and does
not authorize Build planning, implementation, merge or release.

## Resolved findings

- **Fresh-login email update:** `intent/family-membership/spec.md:35` explicitly
  separates read-only admission checks from the verified callback update.
  `:170` places the write in the post-admission `getUserInfo` callback path;
  `:173` requires an immediate transaction, subject/uniqueness rechecks and
  generic failure without session issuance. It cannot create membership,
  invitations or grants. `:179` excludes session reads, older copied cookies
  and existing-member provisioning from rewriting stored email. `:394` adds
  changed-email, collision and stale-cookie proof requirements. This establishes
  a concrete trusted write boundary without an additional login-proof protocol.
- **Logout after eligibility loss:** `intent/family-membership/spec.md:260`
  defines a cryptographic-session-only helper independent of database and
  admission policy. `:263` applies it to exact sign-out routes at proxy, page and
  handler, with CSRF/Origin protection and no family-data access. `:267` clears
  invitation context and library cookie chunks. The HTTP table at `:313` and
  verification matrix at `:400` carry the exception through implementation and
  regression requirements. Other routes retain normal admission guards.
- **Subject survives stateless cache:** `intent/family-membership/spec.md:140`
  explicitly retains `returned: true` or its default so library output filtering
  cannot remove `googleSubject` before JWE caching. Application response
  allowlists, rather than a library output flag, prevent public JSON exposure.
  `:394` requires verification of both properties.
- **Callback request protection:** the HTTP contract limits the canonical
  Origin requirement to JSON mutations. This avoids requiring a browser Origin
  on the verified Google GET callback while preserving the library's OAuth
  state/PKCE/provider checks for that explicit metadata-update exception.

## Evidence and limits

Read the revised identity, lifecycle, HTTP and verification contracts against
round-1 findings and the previously inspected pinned library behavior. No
additional research or runtime proof was needed for these document fixes.
Only this review record was written. No application source, dependencies,
schema, plan, messages, workflow state or human gate records were changed.
No build, test suite, native smoke test, browser flow, database or live Google
sign-in was executed or claimed. Spec status correctly remains a draft awaiting
human approval.
