# Meal Planner — reliable recipe photos build plan

- Derived from: accepted `intent/recipe-photos/intent.md`, approved `spec.md`
- Evidence: `research.md`, `org/reviews/spec-recipe-photos-001.md`, `org/reviews/security-design-recipe-photos-001.md`
- Author: senior-developer
- Status: Approved
- Reviewed by: independent reviewer (`org/reviews/plan-recipe-photos-001.md`)
- Date: 2026-11-23

## Approach and ownership

Add deterministic metadata enrichment after validated provider results, using
one narrowly scoped pinned-address HTTPS transport. Change only `imageUrl`;
preserve all identity/method/time checks, card order, public types, parent abort
and original search deadline. No UI redesign, image proxy, extra model call,
cache, database, auth, redirect following, or ordinary fetch fallback.

Implementation is sequential and starts only after independent plan approval.
Each behavior starts with failing TypeScript tests, then the smallest fix and
focused/full checks. The orchestrator owns commits, org state/ledger, independent
reviews, real-source QA and CUA browser evidence. Track tasks below; no separate
task file. Preserve the existing 34 application and seven Python tests.

## Files that change

- package.json
- package-lock.json
- lib/recipes/photo-transport.ts
- lib/recipes/photo-metadata.ts
- lib/recipes/photos.ts
- lib/recipes/search.ts
- lib/recipes/server.ts
- tests/recipe-photo-transport.test.ts
- tests/recipe-photo-metadata.test.ts
- tests/recipe-photos.test.ts
- tests/recipe-photo-fixtures.ts
- tests/recipe-search.test.ts
- README.md
- AGENTS.md
- CLAUDE.md
- org/reviews/recipe-photos-dependencies.md
- org/reviews/recipe-photos-verification.md
- org/reviews/recipe-photos-*.jpg

- .worktreeinclude
- tsconfig.recipes-test.json
- lib/recipes/types.ts
- lib/recipes/errors.ts
- lib/recipes/validation.ts
- lib/recipes/openai.ts
- app/api/recipes/search/route.ts
- app/recipe-search.tsx
- app/page.tsx
- tests/recipe-validation.test.ts
- tests/recipe-openai.test.ts
- tests/recipe-fixtures.ts
- org/loop/config.yaml
- org/reviews/recipe-search-verification.md
- org/reviews/recipe-search-*.png
- pnpm-lock.yaml
- pnpm-workspace.yaml
- org/reviews/pnpm-migration*.md
- org/reviews/pnpm-migration*.jpg
- org/reviews/pnpm-migration*.png
- tsconfig.json
- .gitignore
- .env.example
- lib/auth.ts
- lib/auth-client.ts
- lib/allowed-google-emails.json
- lib/google-access.ts
- lib/session.ts
- lib/auth-policy.ts
- proxy.ts
- app/layout.tsx
- app/api/auth/[[]...all]/route.ts
- app/api/session/route.ts
- app/sign-in/page.tsx
- app/sign-in/sign-in-button.tsx
- app/sign-out/page.tsx
- app/sign-out/sign-out-button.tsx
- tests/auth/*.ts
- tests/auth/package.json
- org/reviews/authenticated-access*
- org/reviews/*authenticated-access*.md

The existing test compiler/glob already includes these TypeScript files; no new
test runner, compiler configuration, npm script, or org budget/gate change is
planned. The feature-specific review label is already configured by the org.

## 1. Verify and install the exact dependency graph

**Dependencies:** plan approval before application mutation. **Scope:** small.

- [x] Resolve/review prospective exact `htmlparser2@10.1.0` and `ipaddr.js@2.5.0`
  lock graph in private temporary storage using `--package-lock-only
  --ignore-scripts`; inspect added lifecycle scripts/exports/types and audit.
  Record evidence before implementation approval; no candidate scripts execute.
- [x] After approval, add exact runtime dependencies and npm-generated lockfile
  with scripts disabled. Compare actual graph with the reviewed prospective
  delta; unexpected scripts/packages or new reachable high/critical findings
  return to review. Preserve unrelated existing versions and advisory records.

**Files:** package.json, package-lock.json, dependency evidence.
**Verify:** graph/integrity/lifecycle inspection, `npm audit --json` and
`npm audit --omit=dev --json`; imports work in Node16-compiled native tests.
The prospective graph has eight added packages, no version changes/removals,
no install-script flags and no installed node_modules; full evidence is recorded
in `org/reviews/recipe-photos-dependencies.md` before code dispatch.

## 2. Implement the SSRF-safe HTML boundary first

**Dependencies:** task 1. **Scope:** transport and focused fixtures/tests.

- [x] Write failing tests for all-answer A/AAAA validation (including mixed
  public/private, mapped/tunnel/documentation/special IPv6), family mismatch,
  resolver errors/count/timeout, rebinding, redirects, TLS identity, and cleanup.
- [x] Implement per-fetch Resolver plus a dedicated HTTPS agent: validate every
  address, pin one through custom lookup with correct all/family callback shape,
  preserve original Host/SNI/certificate verification, disable reuse and proxy
  routing, and send only fixed credential-free GET headers. Never connect before
  both families are checked or retry/resolve/follow redirects after pinning.
- [x] Enforce total DNS/connect/body deadline, 16-KiB headers, actual 1-MiB body,
  HTML/charset/identity encoding and strict UTF-8. Test dishonest lengths,
  chunked/slow bodies, compressed/binary content, caller abort and resource
  destruction/resolver cancellation on every path, with no live private network.

**Files:** photo-transport.ts, recipe-photo-transport.test.ts,
recipe-photo-fixtures.ts. **Seams:** injected Resolver/request factories and
clock for tests; production defaults are native Node implementations only.
**Checkpoint:** focused transport tests, npm test, lint/typecheck/build. Check
the pinned classifier's actual modern special-range behavior; `unicast` alone
must not bypass the spec's explicit IPv6 global/range policy.

## 3. Select publisher-grounded recipe photos

**Dependencies:** task 1; task 2 remains isolated from parsing. **Scope:** pure.

- [x] Write failing synthetic metadata tests for Recipe string/array/ImageObject,
  root/@graph discovery, exact identities, sole unidentified Recipe + exact page
  identity/title match, conflicting/related/multiple recipes and Open Graph
  grouping. Verify source binding before collecting/ranking images.
- [x] Parse bounded event callbacks with htmlparser2, no DOM/runtime execution.
  Enforce script/head/traversal/candidate limits from the spec; resolve relative
  URLs against the exact source, ignoring base tags. Test escaped/unsafe URLs,
  malformed/deep/oversized input and that remote contexts/body images do nothing.
- [x] Implement exact spec precedence and declared-dimension thresholds/ties,
  with deterministic dedup/publisher ordering and existing-image fallback.
  Test unknown/invalid/tiny dimensions without filename-size inference or URL
  rewriting, and confirm unrelated logos/other recipes cannot contribute images.

**Files:** photo-metadata.ts, recipe-photo-metadata.test.ts, shared fixtures.
**Verify:** focused metadata tests then npm test/lint/typecheck; real sites are
separate QA, never deterministic unit-test dependencies.

## 4. Integrate fail-soft, provider-independent enrichment

**Dependencies:** tasks 2–3. **Scope:** one decorator plus handler composition.

- [x] Write failing tests for <=6 deduplicated exact sources, unchanged non-photo
  fields/order/card count, metadata failures retaining prior images, and one
  shared two-job limit including DNS across simultaneous searches. Saturation
  skips work; bounded batches launch only acquired slots, with no waiting queue.
- [x] Export testable `createPhotoEnricher` from photos.ts, backed by module-wide
  two-slot admission shared across factory instances, and compose one production
  enricher in the server-only root,
  after `provider.search`. Handler computes `deadlineAt` once at original timer
  start and passes it plus the same parent signal through an injectable typed
  enrichment seam. Existing handler tests avoid network via explicit injection;
  no environment fixture switch or provider-specific integration is added.
- [x] Enforce <1-second-remaining skip, <=6-second soft stage and <=3-second
  per-fetch budgets including <=1-second single-try DNS. Test that optional
  timeout settles with original/already-enriched cards before the hard deadline,
  aborts outstanding work and releases slots/listeners/timers; late callbacks
  cannot change returned cards. Parent cancellation still fails the full search.

**Files:** photos.ts, search.ts, server.ts, recipe-photos.test.ts,
recipe-search.test.ts. **Checkpoint:** npm test, Python tests, lint/types/build;
existing 34 application regressions still pass and no request happens at build
or initial page rendering. No public Recipe/API shape or UI change.

## 5. Verify sources, browser behavior and final handoff

**Dependencies:** task 4. **Scope:** documentation/evidence, owned with root.

- [x] Update README/agent guidance for the approved metadata-only network
  exception, exact dependencies, bounds, fail-soft behavior and current feature.
  Preserve ignored credentials and every historical workflow/audit record.
- [x] Orchestrator runs the real safe transport/selector on the three exact
  research URLs without an LLM call. Record selected URL, metadata reason/declared
  size, HTTP/access outcome, elapsed time and any fallback. Use known cards or a
  clearly labeled simulated provider response; metadata and photo loads are real.
- [x] Orchestrator uses CUA at mobile/desktop to inspect actual natural dimensions
  (>150×150 for Love and Lemons), Inspired Taste/King Arthur loaded photos where
  accessible, legible/stable cards and broken-image fallback. Save screenshots
  and separate simulated-provider evidence from real publisher/photo evidence.
- [x] Run all required checks, plan-sync, org consistency, diff and staged zero-
  finding secret scan. Record red/green output, source-access limitations and
  independent security/code verdicts before human merge/release handoff.

**Files:** README/AGENTS/CLAUDE, verification evidence/screenshots.
**Verify:** npm test, Python seven regressions, lint/typecheck/build exit zero;
independent reviewers inspect exact native connection and failure paths.
Source blocking/unsafe metadata remain explicit failures/fallbacks, never cause
weakened SSRF rules or a claim of universal coverage. No extra paid model call,
credential inspection, production deployment, merge or release is authorized.


## Merge integration amendment — 2026-11-23

Rafael explicitly requested "merge to main" after final photo verification.
Main advanced independently with approved pnpm migration and authenticated access.
This amendment supersedes the earlier no-merge handoff restriction for the local
merge only; production release remains a separate human gate.

Preserve both approved capabilities and all existing dependency versions. Generate
pnpm's lockfile with the same eight approved photo dependencies and retain the
reviewed strict lifecycle policy. Remove the superseded npm lockfile. Keep both
TypeScript native-runner test commands, using pnpm as the package manager.
The manifest above includes the inherited approved file sets so merge checks
cover both sides; it does not authorize unrelated changes.

Compose the protected server home page with the recipe form. The recipe endpoint
must read the shared allowed-Google session before parsing input or invoking the
provider, fail closed with401/503, and retain existing request/usage/photo bounds.
Allow HTTPS images in CSP for approved external recipe photos; preserve nonce
scripts, same-origin connections, frame denial and no-referrer behavior.

Preserve both original audit chains byte-for-byte in a provenance archive. Extend
main's canonical chain with imports citing original record hashes and the explicit
human merge approval. Keep historical test evidence unchanged and record combined
pnpm results separately. Independently review the integration, run recipe/auth/
workflow tests and lint/typecheck/build, and verify authenticated cards and HTTPS
photos in a real browser at320/1440 before completing the local merge.

Evidence: org/reviews/recipe-merge-review-001.md and
org/reviews/recipe-merge-verification.md; authority: org/messages/ceo-0006.md.
