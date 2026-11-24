---
artifact: intent/saved-recipe-menu/spec.md
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: approved
round: 1
---

# Shared saved recipe menu — independent specification review

Approved for human specification review. No required findings or nits.
The reviewer did not author the intent or specification. Applied the
code-review-and-quality skill and REVIEW.md's Bugs, Security and Compliance
passes to the Design artifact and its current repository interfaces.

## Evidence and assessment

- **Bugs / product behavior:** spec.md:11–24 and 106–145 cover the requested
  shared-family add/list/remove flows, discovery, durable feedback, empty/error
  states, navigation freshness and keyboard focus after deletion. URL identity,
  first-save snapshot retention, duplicate-at-capacity success and old-ID removal
  protection are explicit (70–85). These resolve the accepted intent's technical
  questions without introducing calendar, editing or provider features.
- **Architecture / correctness:** explicit Route Handlers and a shared server
  store (147–176) fit `app/api/family/route.ts` and `lib/family-store.ts:19–35`.
  `lib/session.ts:25–29` supplies both page redirects and API errors as required.
  The 200-entry bound, serialized duplicate/count/insert sequence and LIMIT 201
  (239–254) make the single-page list bounded without hidden truncation. The
  current transaction helper acquires the common advisory lock before running
  its action (`lib/db/connection.ts:48–63`), matching the proposed member recheck.
- **Security:** concur with the independent security report. Exact snapshot
  keys and bounded text, canonical URL validation, literal rendering and
  malformed-row failure (57–104, 223–229) address the existing card's URL parsing
  and text rendering in `app/recipe-card.tsx`. Persisted `imageUrl: null` uses
  its existing fallback and creates no saved-image fetch path. Exact Origin,
  actual-body bounds and a new read deadline (178–187) explicitly extend rather
  than falsely claim capabilities of the current `lib/http.ts` parser.
- **Compliance / operational readiness:** spec.md:258–285 correctly covers
  explicit migration grants (`scripts/migrate-db.ts:12–13`), runtime metadata,
  exact catalog compatibility and deployment packaging. It states that both
  old-runtime/new-schema and new-runtime/old-schema fail the current checks;
  separately authorized coordinated hosted cutover/recovery remains necessary.
  It preserves SQL history, strict checking and the independent human gates.
- **Verification:** spec.md:289–315 requires meaningful persistence, isolation,
  retry/capacity/concurrency, parsing/deadline, privilege/catalog and compiled
  deployment regressions, plus real-browser 390/1440 flows. It explicitly
  notices that the current recipe test command does not discover a future menu
  suite (`tsconfig.recipes-test.json` and package command), requiring an actual
  runner entry in the implementation plan rather than assuming coverage.

## Owner-visible choices and proof limits

The 200-entry cap and text/time/source snapshots with photo fallback are clear
proposed choices, consistent with the accepted intent's optional-photo scope.
They remain subject to human specification approval. No new menu implementation
exists, so runtime behavior, migrations and browser flows have not been proved.
Baseline verification in sibling design-verification.md is correctly labeled
as existing-code/workflow evidence, not menu acceptance evidence.

Read the specification, accepted intent, security report and source interfaces
above; `git diff --check` passed. No application code or tests changed, so code
mutation testing is inapplicable at this Design gate. No live database, external
network or browser operation was performed. This peer approval grants no human
specification approval, implementation-plan approval, code/merge approval,
hosted migration, deployment or release authority.
