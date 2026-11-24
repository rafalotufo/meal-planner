# Retained search results — independent amendment review 001

Independent reviewer; writer: senior-developer. Date:2026-11-24.
Reviewed active loop and original spec/plan follow-up, prior stable-frame contract,
org protocol/reviewer role, REVIEW.md and code-review-and-quality skill.

Verdict: **Approve bounded owner-requested amendment. No required findings.** No
application or process edits were performed by this reviewer.

**Bugs:** Keeping a last-successful displayed snapshot distinct from requested
query/cursor is a coherent way to preserve visible recipes during debounce/fetch.
Snapshot page/query/cursor must commit together only after fully validated current
success. Immediate selection invalidation and disabled choices/paging/confirmation
ensure retained display cannot become a stale action. Displayed-query metadata,
counts/empty messages tied to that snapshot, fresh query cursor reset and Retry
of the latest requested page avoid mislabelling or cursor cross-contamination.
Ordinary errors retain a disabled display; successful empty results genuinely
replace it. No correctness design blocker.

**Security:** Existing body/UTF8/shape bounds, deadlines, abort/version/instance
guards and captured mutation target remain mandatory. Current401/403 clears
retained confidential recipes, unlike ordinary recoverable errors. New instances
retain nothing from earlier openings. Server family/admission/uniqueness checks,
API/store/schema and image boundaries remain unchanged. No new security surface
or authority is introduced; meaningful stale-choice/response tests remain needed.

**Compliance:** The owner explicitly requested retaining visible recipes until
replacement results are ready. The appendix clearly supersedes the prior
clear-page/loading-only directions while preserving stale-confirmation safety.
Scope is confined to existing dialog lifecycle/rendering and browser tests, with
stable geometry/CSS unchanged. No new feature helper, dependency, endpoint, data
operation or release authority is needed.

The proposed regression is stronger than a spinner/text assertion: actual
nonempty choice IDs must remain identical across physical typing/debounce/delayed
body, with immediate cleared selection and disabled old actions. Latest valid
success must atomically replace IDs/metadata; ordinary error retention/Retry,
401/403 clearing, empty success, cursor independence and request/close races must
be shown. Preserve previous malformed/oversized/UTF8, one-POST, captured revision,
native focus, unique planning/history and55 geometry checks at mobile/desktop/
short viewports. The old implementation must first fail this retained-ID check.

Approval is design-only. Private strict/build/full-browser checks, affected
regressions, fresh visually inspected images, exact source correspondence and
independent final review remain outstanding. Root owns isolation/copy-back/audit
and preserves the original dev server/cache/next-env bytes. Human merge/release,
hosted operations and scheduler activation remain separately gated.
