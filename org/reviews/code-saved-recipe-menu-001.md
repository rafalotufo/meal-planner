---
artifact: saved-recipe-menu-implementation
reviewed_commit: dee38010b7e90c4e549a0d192a62c0bcc2a226fd
base_commit: 4bbe71f
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: changes
round: 1
---

# Shared saved menu — final independent code review

One required test-resource cleanup correction. No application correctness or
security blocker found in the remaining complete feature review. The reviewer
is independent of the implementation author. Applied REVIEW.md's Bugs, Security
and Compliance passes and the code-review-and-quality skill to the whole diff,
approved spec/plan/visuals and documented request-timeout amendment.

## Required finding

**[P2 / Bugs, Compliance] Protect owned browser-QA resources from startup and
cleanup failures.** `tests/menu/browser.ts:7–8` creates an owned random migrated
database, then awaits `openChrome()` before entering its try/finally at21. If
Chrome cannot start/connect, execution never reaches fixture.cleanup at170,
leaving the database behind. In the same new helper, sequential cleanup at167–170
also skips the later database cleanup if server.stop/browser.close/owner.close
throws. This violates the approved plan's guaranteed owned fixture cleanup and
makes a failed QA invocation retain test data/resources. Move browser startup
inside the protected region with an optional cleanup handle, and attempt every
cleanup even when another close fails; preserve failure reporting. Do not change
application/auth semantics or introduce a general testing framework to fix it.

## Application and architectural evidence

- **Client lifecycle / scope:** SaveRecipeButton guards overlap, aborts on
  unmount and checks controller identity before success/error updates; it validates
  the returned entry and uses fixed session/family/error guidance. MenuControls
  preserves entries until successful removal plus server refresh, aborts abandoned
  requests and version-gates post-refresh focus. RemoveRecipeDialog uses a named
  native modal, initial Cancel focus, cancel/Escape/backdrop no-effect paths and
  explicit confirmation. Each retry reopens it. Ordinary menu anchors ensure
  fresh navigation; paged server props replace rather than accumulate content.
- **Stored behavior and isolation:** lib/menu/store.ts uses typed bound queries,
  current requireMember-derived family IDs, LIMIT51 tuple pagination, canonical
  cursor validation and the unchanged common transaction helper. Duplicate save
  retains its first snapshot/time/ID. Removal is family+opaque-ID scoped and
  idempotent, so a delayed old-ID request cannot delete a re-added entry.
  Source/photo/text/time rows are validated again before public rendering; no
  family identifier or allowlist is serialized to clients.
- **Proxy amendment / HTTP:** lib/menu/http.ts preserves configured Host before
  session work, explicit current JWE validation, token/stable-identity binding,
  admission/family rechecks and private/security headers on all implemented
  methods including405. Both menu shapes declare every Next-supported method;
  body parsing precedes storage locks and retains byte/deadline bounds. The
  static matcher change is narrowly paired with this wrapper, while the real-HTTP
  tests cover sibling/encoded/trailing-slash shapes and stalled unfinished save
  and removal bodies. The pinned Next EOF-buffering diagnosis and proof limits
  are documented; no auth-policy public exception or broad proxy refactor occurs.
- **Database and packaging:** SQL adds required family FK, scoped unique/page
  indexes, bounded fields/time pairs/safe timestamps. Journal/runtime metadata
  and complete catalog advance together; original SQL/initial rollback remain
  unchanged. Explicit menu grants omit UPDATE/TRUNCATE/DDL. Tests cover initial
  upgrades, drift, actual restricted roles, dump/restore and disposable rollback.
  The compiled deployment test actually saves/lists/renders/removes with no
  repository lib/drizzle directory. Hosted-tool changes are source-only; exact
  catalog incompatibility still requires separate hosted cutover/recovery authority.
- **Preserved behavior:** verified no diff in lib/recipes, search Route Handler,
  shared auth/session/identity/auth-policy, DB connection/transaction, vercel.json,
  Next config, upload exclusions, lockfile, initial PostgreSQL SQL or initial
  rollback. RecipeCard gains only its optional action slot; existing text/source/
  time and unoptimized/no-referrer/failure-fallback image behavior remains.
  Search notebook only supplies the save action. New fixture interception remains
  test-only; production gains no fake identity, provider or image bypass.

## Verification and meaningful coverage

Independently executed:

- `node --import tsx --test tests/menu/validation.test.ts`:5 passed,0 failed.
- `node --import tsx lib/db/verify-runtime-metadata.ts`: exit0, SQL/journal match.
- A temporary isolated copy of validation.ts with its text maximum condition
  removed was tested against the actual validation suite: exit1, exactly the
  text-limit regression failed (4passed/1failed). Original repository code was
  never modified and the temporary directory was removed. This confirms the
  boundary test detects the intended defect rather than mirroring successful code.
- `git diff --check`: exit0.

Inspected the actual menu HTTP/store/isolation/migration/browser/compiled-package
regressions and plan/spec amendments; examined the390px hostile-text/fallback
screenshot and320px confirmation screenshot. They show literal escaped recipe
text, wrapped content and an opaque, fitting confirmation with wrapping controls.
The root/developer record reports194Node tests,7Python tests, frozen install,
lint/typecheck/build and production Chrome390/1440 plus dialog320 passing.
Those complete suites/browser sessions were not redundantly rerun by this
reviewer; baseline checks and screenshots alone are not menu runtime proof.

After the cleanup correction, only affected verification and a focused recheck
are needed. This report grants no merge, hosted migration, deployment or release
authority; no such operation was performed during this review.
