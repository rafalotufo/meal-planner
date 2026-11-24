---
artifact: intent/saved-recipe-menu/spec.md
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: approved
round: 1
---

# Saved recipe menu — independent Design security review

Verdict: clear for independent peer review and human specification review.
No blocking security finding. This reviews proposed contracts, not working code,
and grants no implementation, hosted migration, merge or release approval.

## Threat model and evidence

Assets are family recipe choices, session/admission boundaries and restricted
PostgreSQL credentials. Trust boundaries are authenticated browser JSON →
server validation, verified identity → family-scoped SQL, persisted rows → HTML,
and reviewed migration metadata → restricted runtime catalog.

- **Spoofing/elevation and tenant isolation:** spec.md:170–176 requires page and
  handler family context plus store-level admission checks, and mutation recheck
  after the common write lock. This matches `lib/session.ts:25–29`,
  `lib/identity-access.ts:41–59`, `lib/family-store.ts:19–24` and the transaction
  at `lib/db/connection.ts:48–63`. Spec.md:237–248 requires bound family predicates
  and no client ownership selector; missing/foreign deletion is indistinguishable
  (158–161). Planned isolation/admission-race tests cover those requirements
  (300–301). No new auth bypass or membership-only admission is proposed.
- **CSRF, tampering and resource exhaustion:** spec.md:178–187 preserves exact
  configured Origin and cross-site rejection from `lib/http.ts:5–17`, while
  explicitly adding actual-byte bounds, a total body deadline and cleanup.
  Authentication precedes parsing; parsing precedes locks. Snapshot fields and
  nested time are exact and bounded (57–68); the 200-entry cap, duplicate-first
  transaction and bounded 201-row read are explicit (239–254). These controls
  require implementation tests; this review does not assume the current helper
  already has the new deadline.
- **Stored XSS, unsafe links and SSRF:** spec.md:62–77 requires bounded text,
  literal React rendering and existing HTTPS URL normalization with an additional
  canonical byte bound. `lib/recipes/validation.ts:7–24` is consistent with the
  stated source-link syntax policy. Source links are never fetched by the save
  or list path. Spec.md:87–104 explicitly treats client snapshots as untrusted
  and stores no image URL/metadata, avoiding a new durable image-fetch surface.
  Persisted rows are validated before rendering (226–229). Search grounding and
  existing photo transport remain untouched.
- **Disclosure and least privilege:** spec.md:155–166 limits response fields and
  requires private/no-store behavior; 189–204 uses fixed errors without raw
  identity, query, URL or credential logs. Spec.md:258–274 requires reviewed
  catalog/metadata and only SELECT/INSERT/DELETE on the new table, with no DDL,
  TRUNCATE, migration-ledger writes or UPDATE. This accounts for the existing
  explicit grants in `scripts/migrate-db.ts:12–13` and hosted table allowlist in
  `scripts/postgres-hosted.ts:60–61`, rather than assuming grants propagate.
- **Operational integrity:** spec.md:276–285 correctly notes that the exact
  catalog contract (`lib/db/connection.ts:94–101`) makes both old-runtime/new-
  schema and new-runtime/old-schema incompatible. It requires a separately
  authorized coordinated hosted cutover/recovery plan; existing hosted setup
  authority is not reused as migration or deployment authority.

No new dependency, credential category, external service, CORS relaxation or
personal-identity field is introduced. Saved content remains family-owned until
explicit removal; no additional author identity is retained.

## Verification and remaining proof

Read the stable specification and relevant source boundaries above;
`git diff --check` passed. No live network, database, hosted or browser action was
performed by this reviewer. Build must prove the specified CSRF/body deadlines,
transactional rechecks, bound queries, restricted privileges, malformed-row
failure, no provider/photo effects and compiled deployment operation. The
specification's regression/browser matrix at 297–315 makes those obligations
explicit. Design approval does not establish their implementation.
