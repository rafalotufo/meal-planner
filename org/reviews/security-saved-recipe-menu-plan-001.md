---
artifact: intent/saved-recipe-menu/plan.md
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: approved
round: 1
---

# Saved recipe menu — independent plan security review

Verdict: approved for peer review and the human engineer gate. No execution-
blocking security defect found. This reviews the implementation instructions,
not implemented menu behavior; it authorizes no code or operational action.

- **Verified identity and ownership:** plan.md:29–38 correctly accounts for
  `requireFamilyContext` returning IDs (`lib/session.ts:25–29`) and follows the
  existing `app/api/family/route.ts:8–13` verified-session handoff. Store writes
  derive the current member's family after the unchanged common transaction
  lock (`lib/db/connection.ts:48–63`), rather than trusting stale context IDs.
  Tasks5–6 require two-family, admission-race and real-HTTP proof (209–238).
- **Inputs, cursor and mutation boundaries:** tasks1–2 require exact bounded
  snapshot fields, validated source/photo URLs, canonical UUID/cursor parsing,
  actual byte limits and a body deadline that finishes even for an uncooperative
  stream (137–156). Pagination uses bound tuple values and a family predicate,
  without a count-all scan or client-controlled page size (48–51,216–218).
  Unknown/duplicate query, CSRF, unauthorized and no-GET-mutation cases are
  explicit HTTP obligations (227–238). No public test bypass is added.
- **Photos and confirmation:** plan.md:52–59 retains the approved direct,
  unoptimized/no-referrer publisher-image boundary already present in
  `app/recipe-card.tsx:13–15`; it adds no server fetch/proxy or provenance claim.
  The accepted browser DNS/redirect limitation remains explicit in spec.md:
  105–125. Task8 requires Cancel/Escape/backdrop to send no removal request and
  retries to reconfirm, while the plan correctly distinguishes UI confirmation
  from server authorization (264–274,385–387).
- **Schema, privileges and rollback:** tasks3–4 couple SQL/journal/catalog/runtime
  metadata, require fresh and initial-schema upgrades and drift rejection, and
  preserve historic SQL (163–193). This matches the migrator's post-migration
  catalog validation (`lib/db/migrate.ts:7–16`). Menu grants are only SELECT,
  INSERT and DELETE; denied UPDATE/TRUNCATE/DDL/history operations must be tested.
  The new rollback is disposable-only and precedes the original initial
  rollback, avoiding its new foreign-key dependency without rewriting evidence.
- **Test target isolation:** plan.md:185–189 and353–359 restrict new privilege
  work to the existing random database fixture and DB-local grants to existing
  `mp_runtime`, with no cluster-role creation/alteration or development grants.
  `tests/family/database.ts:10–11,17–18,26–28` pins loopback `mp_test`, owned random
  names and ownership-checked cleanup. Existing development privilege inspection
  remains separately disclosed; it is not represented as new disposable-only
  menu testing. Neither setup/migration nor hosted tools are automatic test
  prerequisites.
- **Packaging and operations:** task9 extends actual compiled route/page/API
  coverage without source SQL, preserving private/test upload exclusions
  (292–302). The current package test already verifies absence of source and
  migration directories (`tests/deployment/postgres-packaging.test.ts:11–15`).
  Hosted tooling changes are source compatibility only; exact catalog
  incompatibility requires separately authorized cutover/recovery, and test
  rollback SQL is prohibited for Production (295–299,373–379).

The command list explicitly discovers the new strict TypeScript suite, runs
compiled deployment tests and a real browser fixture, and retains existing
checks (331–345). Read the plan, approved specification and relevant repository
interfaces above; `git diff --check` passed. No database, hosted, browser or
application-runtime action was executed by this reviewer. Passing planned
checks, final implementation review and actual privilege/cleanup evidence
remain Build/Test obligations; baseline checks are not menu acceptance.
