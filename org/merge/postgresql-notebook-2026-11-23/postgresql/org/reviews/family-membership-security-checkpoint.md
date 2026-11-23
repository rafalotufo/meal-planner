# Family membership — interim backend security assessment

- Reviewer: security-researcher (independent)
- Date: 2026-11-23
- Scope: early backend checkpoint while implementation and tests continue
- Verdict: storage-path finding independently resolved; no final security clearance

## Finding

**Important — prevent a multi-family database from entering a Next-served
directory.** The initial `lib/db/connection.ts` path validator accepted any
trimmed absolute path. That permits explicit migration into `public/` or
`.next/static/`, where the normal per-family SQL boundary is bypassed by static
file delivery. The proxy permits full members through ordinary file paths,
and `lib/auth-policy.ts:5` exempts `/_next/static/` from authentication.

The first developer fix rejects lexical and resolved paths in `public/` and
`.next/`, and tests direct paths and directory aliases. Independent recheck
found two remaining concrete cases in its `physicalPath`/root checks:

1. A dangling final-file symlink outside the checkout pointing to a nonexistent
   database under `public/` is accepted. `existsSync` follows the missing target,
   so the ancestor fallback drops the symlink's destination. An explicit native
   migration can subsequently create the forbidden target through that link.
2. The legacy checkout `static/` directory is accepted. Installed Next
   `dist/server/lib/router-utils/filesystem.js:214`, `:273`, and `:664` still
   enumerate and serve that directory, as well as `public/` and `.next/static/`.

Independent command: `node --import tsx --input-type=module -`, importing the
production validator and checking a test-owned temporary final-file symlink
plus the nonexistent legacy-static path. Actual output:

```text
dangling final file: ACCEPTED
legacy static: ACCEPTED
```

No database or application file was created or requested; the owned temporary
symlink was removed in `finally`. Sent the exact cases to the developer and
orchestrator. Reject dangling symlinks safely or resolve them with `lstat` and
`readlink`; include every currently supported Next-served root, with direct and
symlink regression coverage. No defense against an operator maliciously
rewriting files after validation is requested.

### Resolution and independent recheck

The developer added regression cases before the fix for the legacy static
root and final-file dangling symlink. The final guard uses `lstatSync` when
finding an existing ancestor, then `realpathSync`; a present dangling symlink
therefore fails closed rather than losing its destination. It rejects lexical
and physical paths under `public/`, all of `.next/`, and legacy `static/`.
Existing parent aliases are resolved before new files can be created.

Independently inspected that final source and ran:

```text
node --import tsx --test tests/family/storage.test.ts
tests 5; pass 5; fail 0; exit 0
```

Those real temporary-file tests cover schema/integrity, idempotent migrations,
changed history and dropped index refusal, DDL/history rollback, direct served
paths, directory aliases and the dangling final-file case. The reported path
finding is resolved in this checkpoint. Final snapshot review is still pending.

## Reviewed boundaries

The assets are family membership, verified identity, recipient emails,
invitation secrets and durable invitation grants. Untrusted inputs cross the
Google-token, cookie, HTTP JSON/path, browser-fragment and configured storage
boundaries. Reviewed current source against the accepted intent, approved
spec/plan and independently approved storage amendment.

- Google subject comes from the pinned signature/audience/issuer-verifying
  provider path and survives the encrypted library cache. Generic Better Auth
  mutation routes and caller subject fields remain unavailable.
- Admission checks current native storage and differentiates pending
  onboarding, current allowlist membership and durable invitation grants.
  Family membership alone does not grant eligibility. Session reads do not
  provision or update email; the verified callback owns metadata changes.
- Provisioning and invitation writes use short immediate transactions with
  bound parameters. Pending recipient lookup precedes automatic provisioning;
  acceptance binds token hash and verified recipient and rejects new invitations
  for existing members. Scoped list/revoke statements derive family ownership
  from current server-side membership.
- Fragment context is removed client-side and stored in a host-only HttpOnly
  cookie. Its public POST enforces Origin/shape/streamed size limits and performs
  no invitation lookup. Context alone grants no membership or protected data.
- Logout has a separate cryptographic-session guard at proxy/page/handler and
  clears invitation context as well as library cookies. Other routes retain
  admission/member checks after pending eligibility expires or is revoked.

No other concrete blocking backend finding was established in this checkpoint.
That is not an approval of unfinished UI, final attack/concurrency coverage,
dependency audit or final application behavior.

## Limits

Only this report was written. No app/dependency/schema/configuration, org loop,
ledger or gate was changed. The focused five-test storage suite used only owned
temporary files. No full build, HTTP suite, browser, live Google flow or
production data/configuration was used. Final security review will recheck
the completed snapshot and the storage-path fix with actual verification.
