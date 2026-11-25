---
artifact: recipe-url-menu-implementation
reviewed_at: 2026-11-24
reviewer: reviewer
verdict: changes
round: 1
source_commit: 742ce99492868f1e3ec9bb223c6afc4532fc6ea8
base_commit: 2513046
---

# Recipe URL menu — independent final code review

Verdict: **Changes requested** for one P2 strict-validation defect. Reviewed
application/library/SQL/script/test changes from `2513046` to exact source
`742ce99492868f1e3ec9bb223c6afc4532fc6ea8` against the approved asynchronous
specification, implementation plan and independently approved copy-scope
amendments. No merge, hosted migration or release authorization is implied.

## Finding

- **[P2][Bugs/Compliance] Require a string before accepting curation enum values —
  `lib/menu/validation.ts:61`.** `String(curation.state)` permits a JSON array such
  as `["ready"]` or `["pending"]` to pass the enum membership test. With
  `retryable:false`, `parseSavedMenuEntry` then returns that array cast as a
  `CurationState`. Independently reproduced with a valid recipe/ID/time and
  `curation:{state:["ready"],retryable:false}`: the parser returned the entry,
  rather than null. The strict public contract explicitly requires an enum
  string, and UI predicates compare directly against strings; a malformed array
  would be treated as neither ready nor pending, bypassing normal ready display/
  polling behavior while still being accepted as a valid response. The existing
  seven validation tests pass but omit wrong state types. Require
  `typeof curation.state === 'string'` before enum membership, avoid coercion,
  and add negative array/object/null/number state cases. Apply the same explicit
  string requirement to the persisted state check at line69 so that the related
  fail-closed boundary does not repeat the coercion.

## Other reviewed boundaries

- Guard extraction retains current JWE/session-token/subject/email checks,
  effective min(session/JWE) expiry, canonical Host, protected405 and private
  headers. New route modes recheck authority after bounded exact Origin/body
  parsing. Query combinations do not schedule work; Proxy/auth-policy and other
  authentication behavior are unchanged.
- Save/task insertion commits before `after()` registration. Registration failure
  retains the link. Task claims and completions use current admission, stored
  verified email, owning family, effective expiry and the existing advisory-lock
  transaction; entry ID/generation/lease fence retries and removal/resave. Late
  workers cannot insert or resurrect entries. Fetch occurs outside transactions.
- Parser limits, exact Recipe association, ambiguity rejection, missing-value
  labels, text escaping, safe image selection and unchanged native HTTPS loader
  conform to the approved supported-page boundary. No publisher scripts, remote
  contexts, secondary metadata/image-byte fetches or paid provider work appear.
- The explicit companion migration constrains state/lease and bounded delegation;
  grants allow only companion SELECT/INSERT/UPDATE and menu metadata-column
  UPDATE. Full catalog/journal/runtime metadata and disposable rollback evidence
  are present; old catalog incompatibility and future hosted gates remain explicit.
- UI separates durable save from curation failure/interruption, validates successful
  response structure, preserves source/removal and offers explicit Retry. Polling
  is read-only, capped by a shared non-resetting request/time budget, aborted on
  cleanup/hidden state and refreshed only after a validated changed result. The
  Cancel handler resolves the current per-entry button after card replacement.
- Test-only native transport preload checks the production request's pinned
  options and remaps only fixed fixture hosts to an owned server. Successful
  menu responses exercise real parsing/storage/Next after. The final cap scenario
  explicitly identifies intentional503 failures after its genuine successful poll.
  Expected-label changes match the narrow scope review; assertions are retained.

## Independently checked evidence and limits

- Verified exact HEAD and `git diff --exit-code HEAD -- app lib drizzle scripts
  tests`: no working application/source/test differences from the frozen source.
- Read the implementation, migration/grants/catalog deltas, relevant parser/body/
  worker/store/HTTP/browser/packaging tests, approved artifacts and the separate
  exact-source security review.
- Ran `node --import tsx --test tests/menu/recipe-metadata.test.ts
  tests/menu/validation.test.ts tests/menu/body.test.ts`: **27 passed**, zero
  failures or skips (134ms). The malformed-state reproduction above demonstrates
  a gap that those passing tests do not yet catch.
- `git diff --check` passed. No code, test, plan, status, ledger or runtime state
  was edited during review.
- Reviewed the lead's final verification record: lint/typecheck/build, menu64,
  deployment32, recipe/photo82, family34, auth16, Python7 and real Chrome menu/auth/
  curation evidence. Those broader runs are reported evidence, not independently
  rerun here. No hosted data, live provider or deployment was checked or claimed.

The finding is narrow and does not require design or scope changes. Re-review
its correction and regression proof against the new exact source before final
approval; prior source-specific security evidence must remain distinguished.
