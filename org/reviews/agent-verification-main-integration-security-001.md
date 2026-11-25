# Main integration — bounded security recheck 001

- Reviewer: security-researcher; date: 2026-11-25
- Inputs: reviewed feature `a8867b4`, main `cd60db4`, current combined indexed/
  working source after audit archive `f01407a`.
- Verdict: No blocking findings for combined-source integration and its remaining
  local checks. Exact-source staging/release acceptance remains a separate gate.
- Application inventory:139 files, content SHA256
  `50a6ada840fc087920bc84cf62cb3f99cb890aafb5392e20aa634b6de831cadf`.

## Source and policy assessment

The actual combined `lib/db/security.ts`, `platform-permissions.ts` and
`attribute-options.ts` match main `cd60db4` byte-for-byte. The finite Neon catalog-
context baseline is retained: privileged runtime flags remain denied, creator
membership/default ACLs must match the exact reviewed provider shape, and ordinary
non-provider databases retain the empty exception policy. Actual object/column
ACLs and effective runtime grants are still independently validated against the
selected schema profile (`security.ts:42–68`). The verification profiles do not
introduce a new platform permission exception.

The attribute validator permits only the reviewed canonical positive uint64
`pg_attver` marker on row-typed relations. Unknown options, malformed markers and
ordinary options remain rejected. The merged security test retains the real
`n_distinct=42` negative case alongside native-ledger/prefix/checksum/grant checks.
The new verification migration/grant and dump/restore tests pass with these
validators, including denied setup/retagging and historical ledger preservation.

Compared the actual shared sessions, cookies, verification store/HTTP/target,
Proxy and auth route to approved feature `a8867b4`: all match exactly. This
integration does not reopen the previously corrected raw-cookie/logout or
synthetic-family authority boundaries.

`lib/verification/build-manifest.ts:1–7` is the former generator with its import
adjusted for relocation; package dev/typecheck/build prefixes now invoke an
uploaded `lib/` path rather than excluded `scripts/`. `.vercelignore:33–34`
excludes locally generated policy; the build regenerates disabled ordinary/
Production policy from trusted inputs. Verified every inventory file hash and
recomputed the inventory content hash: no drift; the builder is included and
`.verification` contents are absent. The clean-source export regression explicitly
omits private state/scripts/tests/intent/org/local policy before building and
checks a regenerated disabled manifest plus BUILD_ID. Root reports its actual
clean-export RED then two-case GREEN; this review inspected the test and source
rather than repeating that build.

## Audit preservation

Main's152-record original ledger is the unchanged byte prefix of the155-record
canonical ledger. The three appended intent/spec/plan transcriptions preserve
original approver/artifact/commit/gate/decision/expiry, use current transcription
timestamps and explicitly cite the archived original decision time. They do not
create release authority. Verified all38 archived feature files against their
original `a8867b4` bytes and recorded hashes, including original151-record chain,
messages, state and memory. No drift found. Canonical ledger verification passes.

## Independently executed proof and remaining boundaries

- Platform/attribute validation tests:32 passed, exit0.
- Combined migration-security plus verification-migration tests:36 passed, exit0;
  only restricted-role owned random local databases were created and cleaned up.
- Inventory/archive/source equality checks and `git diff --check`: pass.
- `gate_ledger.py verify --record agent-verification-plan-2026-11-25`: exit0.

No hosted connection, mutation, secret inspection or deployment was performed by
this review. Root's separate read-only five-migration hosted baseline is not proof
that either hosted target already has the new verification catalog or that the
new flow is ready. Finish combined local checks, then bind deployment/configuration,
schema/grants, credential handling, synthetic evidence and any Google/provider/
browser gaps to the exact release source. Owner staging acceptance and concrete
Production release/recovery authority are not waived by this integration review.
