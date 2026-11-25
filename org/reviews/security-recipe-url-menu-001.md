---
artifact: recipe-url-menu-implementation
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: clear
source_commit: 742ce99492868f1e3ec9bb223c6afc4532fc6ea8
---

# Recipe URL menu — independent security review

**Clear for local implementation/merge review. No blocking security findings.**
Reviewed the approved intent/spec/plan and implementation from baseline `2513046`
through the exact source commit above. Application, library, migration, script and
 test files had no working-tree differences from that commit at final assessment.
This verdict is not merge, hosted-migration, deployment or release authorization.

## Threat model and assessment

Trust boundaries are the authenticated URL/Retry request, delegated post-response
job, untrusted publisher DNS/HTML/metadata, family-owned PostgreSQL records and
public menu response/browser rendering. Assets are session credentials, current
family authority, other families' data and the server's network/resources.

- **Request identity and effects:** `lib/menu/http.ts:20`–`30` retains verified
  current JWE, token/subject/email binding and current family checks, returning
  only server-side identity and the earlier session/JWE expiry. Host and protected
  method/security-header handling remain at lines34–48. The import/Retry branches
  recheck this authority after bounded body reading before their transactions
  (`app/api/menu/route.ts:35`–`47`). `lib/menu/body.ts:5`–`34` preserves exact Origin,
  media type, actual-byte limits, fatal decoding and the total body deadline.
  Unknown/combined query modes do not schedule work. No Proxy/public-policy
  exception was added.
- **Delegation and current ownership:** `lib/menu/store.ts:56`–`90` commits a
  placeholder and task atomically, derives the family server-side and limits a
  generation to30 seconds and effective credential expiry. No bearer token,
  cookie or raw publisher HTML is persisted. `authorizedTask` at lines103–108
  checks current admission, original verified email, owning family and expiry
  before claim/effect and again before metadata completion. The task is narrow
  server-created authority for that entry, not a reusable session or public worker
  bypass. Public entry validation returns only state/retryable, not task authority.
- **Concurrency, deletion and stale work:** Claim/completion/failure use the
  existing common-lock READ COMMITTED transaction boundary. Store lines116–133
  match entry ID, generation, processing state and lease, recheck authority/deadline
  after lock acquisition and update metadata/status atomically. Workers never
  insert/upsert entries. Retry rotates only expired/failed work; duplicate active
  retries do not reset its lifetime. The companion FK cascades on entry deletion,
  so late work cannot restore a removed ID or update a later replacement.
- **Persistence versus scheduling failure:** `registerMenuCuration` at
  `lib/menu/curation.ts:37`–`53` receives only server-derived entry/generation,
  registers after the transaction returns, and preserves the committed link on
  registration failure. Its callback catches private errors while durable failed
  or expired state supplies Retry. Worker lines8–31 bound work to two non-waiting
  process slots and a finally-cleaned deadline, propagate worker abort, and fetch
  outside DB transactions. The per-process bound is not presented as a global
  limiter or durable queue.
- **Publisher isolation:** The existing native photo HTML loader is unchanged.
  It still validates all DNS answers, rejects private/mixed/reserved results,
  pins TLS address/hostname verification, refuses redirects/proxies/credentials,
  and bounds HTML, headers, encoding and total acquisition time. Import parses
  only bounded source-associated Recipe JSON-LD (`lib/menu/recipe-metadata.ts:76`–
  `135`), rejects ambiguous/over-limit input, validates the final exact snapshot
  and never fetches declared contexts, metadata URLs or image bytes. UI text is
  rendered through React escaping; source links use safe URL validation and
  noopener/noreferrer. No HTML execution or raw publisher errors were introduced.
- **Database privileges and compatibility:** `0002_recipe_url_curation.sql`
  constrains task state/lease, bounded authority fields and timestamp relationships.
  `scripts/migrate-db.ts` adds only companion SELECT/INSERT/UPDATE and explicit
  menu metadata-column UPDATE; ID/family/source/savedAt are not granted UPDATE.
  The journal/catalog/runtime metadata are explicit; runtime migration behavior,
  historical SQL and restricted migration-ledger privileges remain unchanged.
- **Browser changes:** Source/Retry responses are strictly validated; controllers
  and deadlines prevent stale component responses from claiming success. Polling
  is authenticated, read-only and capped; it cannot claim or retry work. The final
  Cancel-focus correction resolves the current entry's control after background
  card replacement and does not alter authorization or removal requests.

## Independently checked evidence

- Read the actual guard, route, body reader, store, worker, parser, migration,
  restricted grants, public validation, menu components and relevant new tests.
- Final source identity verified with `git rev-parse HEAD` and
  `git diff --exit-code HEAD -- app lib drizzle scripts tests`.
- Independently ran parser/validation tests: **20 passed**, zero failures/skips.
- Independently ran `node --import tsx --test tests/menu/curation.test.ts
  tests/menu/curation-store.test.ts`: **7 passed**, zero failures/skips. These use
  owned isolated local databases and exercise authority loss, expiry, duplicate
  Retry, stale generation/removal fences, two slots, abort/capacity reuse and
  post-commit registration failure retaining the saved link.
- Confirmed no baseline differences in photo transport/parser, Proxy/auth policy,
  package manifest or lockfile. Final SHA-256 values match the recorded baseline:
  photo parser `0a8a23fef49decd463f5dfe2de7bc79da05f2fe67ccff3e795ac30a9c25a8bc7`;
  transport `5924cf27a8a22f35c1ae98b54333ca52458220f946e8a45547aedde38b34e0ba`.
- `git diff --check` passed.

Separately read the implementation lead's `verification.md`, which records final
lint/typecheck/build, menu64, deployment32, recipe/photo82, family34, auth16,
Python7, real protected curation HTTP and real Chrome evidence. Those full-suite
and browser runs are developer-reported proof reviewed here; they are not claimed
as independently rerun by this reviewer. The real HTTP test source exercises
actual native loading/parsing/storage and protected APIs rather than fabricating
successful responses. Final deltas for registration failure and the Cancel-focus
race are covered explicitly in that record and source.

The approved limitations remain explicit: static structured Recipe metadata,
final HTTPS links, bounded best-effort background execution, retained links and
manual Retry after failure/interruption. No unattended recovery, live provider,
hosted migration/grant change or deployed result is claimed.
