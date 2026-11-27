# Classified weekly planning — independent security review

- Reviewer: security-researcher
- Date: 2026-11-27
- Verdict: Approved
- Reviewed baseline: `91c419e`
- Reviewed implementation: storage `fc9b12c`, backend `39fdc4a`, UI `72f726b`
- Verification record: `7d66352`; approved specification/plan in `intent/classified-weekly-planning/`
- Skill: security-and-hardening

## Threat model and conclusion

Trust boundaries are the authenticated menu query, plan action body, current
family admission, mutable menu category versus immutable plan snapshot, and the
native migration/catalog contract. Assets are family menu confidentiality, plan
integrity and approvals, current identity bindings, and database privileges.
Abuse cases include forged category/family selectors, duplicate parameters,
cross-family replacements, category correction between suggestion and acceptance,
a synthetic principal requesting stronger actions, and incompatible old artifacts
opening a changed schema. No blocking security finding was identified.

## Evidence

- `app/api/menu/route.ts:20–27` retains `menuApiResponse`, family context and
  identity checks before the optional category lookup. It rejects unknown keys
  and duplicate category keys. `lib/menu/store.ts:22–33` validates the enum and
  uses only bound values for family, cursor, title and category; category filtering
  occurs before the existing bounded page limit. No ownership selector is accepted.
- The unchanged `lib/menu/http.ts:21–57` binds current cryptographic sessions to
  Google JWE/session tokens or the current verification capability, checks the
  canonical Host before dispatch, and applies private/security headers on all
  responses. The new read is neither a public policy exception nor an auth bypass.
- `lib/plans/store.ts:33–43,48–58,63–81` retains current admission and family-scoped
  plan/menu reads inside the common locked transaction. Current ready menu category
  is compared with the stored slot category both when suggesting and accepting,
  before plan/approval/proposal writes. The unchanged transaction implementation
  `lib/db/connection.ts:110–125` obtains its advisory lock before decision reads,
  with READ COMMITTED and bounded timeouts. Category corrections use that same lock.
- Synthetic principals still pass current admission and only approve/suggest:
  `lib/plans/store.ts:38`. No identity, allowlist, session, public policy, Proxy,
  verification grant, provider or dependency code changes appear in this diff.
- `lib/plans/generate.ts:38–50` keeps Google-family eligibility and existing-plan
  checks, ready-state filtering and server-derived family binding. Its classified
  selection is bounded to eight snapshots; it makes no external requests.
- `drizzle/postgresql/80fd3d65-d202-462b-883d-6adc2eb565be.sql:1–9` first acquires
  the common lock and changes only array length to1–8 and slot index to0–7. It
  contains no row rewrite, grant, TEMP change, ledger edit or runtime migration.
  Independent JSON comparison against `91c419e` proves all eight prior descriptors,
  eight required-prefix entries, eleven profiles and two independence records are
  unchanged. The new profile grants exactly equal the previous profile grants.
  Its dependency is the existing classification identity; old SQL is unchanged.
- Grouped UI still uses framework text escaping and the original validated array
  indices. Its category filter is convenience only; server checks above enforce
  the invariant regardless of client payloads.

## Independently executed checks

- Focused owned disposable DB tests: `classified swaps`, `category filtering`,
  `eight-identity upgrade` —3/3 passed, exit0. These prove category-race409 leaves
  plan/revision/approval unchanged, filtered search/keyset pagination beyond50
  unrelated rows, preserved historical rows/ledgers, and old/new runtime rejection.
- Focused real HTTP tests: `stateless session guards`, `both exact menu shapes`,
  `protected GET category filter` —3/3 passed, exit0. They exercise current JWE/token
  binding, canonical Host/all-method protection, duplicate/invalid category queries,
  anonymous rejection and private/security response headers.
- `python3 scripts/scan_secrets.py --base 91c419e --head HEAD` —0 findings, exit0.
- `git diff --check` —exit0.
- Complete implementation suites and real Chrome observations were read in
  `intent/classified-weekly-planning/verification.md`; they are developer evidence,
  distinct from this reviewer's six independently executed focused checks.

## Operational boundary

Approval covers this local implementation review only. No development or hosted
migration, grant, deployment, merge or release was performed or authorized. The
new nine-identity runtime requires a separately authorized compatible migration
before deployment; older artifacts are unsafe rollback targets after migration.
No new dependency was introduced, and no release audit or live hosted validation
is claimed. The skill's optional shared security-checklist path is absent in this
installation; its primary threat-model and review controls above were applied.
