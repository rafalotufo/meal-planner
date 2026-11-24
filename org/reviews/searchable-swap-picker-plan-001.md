# Searchable swap picker — independent specification/plan review 001

- Independent reviewer; writer: architect. Date: 2026-11-24.
- Active work: `intent/searchable-swap-picker/intent.md`, plan-review turn3.
- Inputs: intent/spec/plan, approved visual reference, current menu route/store/validators and native removal-dialog pattern; AGENTS.md, org protocol/reviewer role, REVIEW.md and code-review-and-quality skill.
- Verdict: **Approve bounded specification and exact implementation plan. No blocking or required findings.** No source/document correction was performed by this reviewer.

## Review passes

**Bugs:** The full-menu search contract preserves existing no-query listing order/cursor behavior while applying a bounded literal case-insensitive title predicate and current-family scope in one query. Blank q compatibility, duplicate/unknown parameter rejection, strict cursor validation, stable descending pages and >50-result tests cover the relevant edges. Planned-source exclusion stays local to validated bounded result pages while server uniqueness remains authoritative. Empty/all-planned pages do not imply a global empty menu or prevent available pagination.

The async contract explicitly clears query/page selection before debounce, aborts old work, bounds body reads/decoding and uses instance/request tokens for success/error/finally after all parsing. A selection must remain in the current validated visible unplanned page. Captured plan/revision/slot and a shared mutation guard prevent silent retargeting/double submissions. Completion from a dismissed/reopened dialog cannot affect the newer instance. Dismissal does not claim cancellation of a sent mutation; parent outcome/refresh remains honest. No correctness design blocker.

**Security:** Existing exact menu-handler guard, current cryptographic identity/admission/family checks, canonical Host, private/security headers and protected methods remain unchanged. Optional q is read-only and rejected on POST. Bound literal substring SQL prevents punctuation becoming SQL/wildcard syntax; no schema/index/grant change is requested. Strict unknown-response parsing validates entries, bounds, canonical uniqueness/order and cursor consistency before rendering;512KiB body and12-second deadline/reader cancellation bound the new client read. Validated saved thumbnails use the existing unoptimized browser-only/no-referrer pattern and URL-scoped failure fallback, with no new provider/proxy/optimizer fetch surface. Safe error text stays bounded. No security design finding.

**Compliance:** Scope matches the accepted thumbnail/search modal and approved preview without copying sample assets or prototype scripts. Exact manifest covers the new client component, menu query/validation/store changes, bounded parent/page integration and existing strict tests/browser adaptation. No planning-store/action/schema/auth-policy/Proxy/dependency/deployment change is authorized. One-to-seven uniqueness, retained unrelated suggestions, duplicate409/reject, approval reset, stale conflicts, no-dates and immutable history are explicit preservation requirements. Private-copy QA preserves original next-env.d.ts/dev-server/cache and forbids development/hosted effects. Human merge/release remain separate.

## Accessibility, architecture and verification

Native showModal, labelled search/context, native selection buttons with pressed state, keyboard operation, Escape/Cancel/close/backdrop handling and connected-trigger/fallback focus restoration form a coherent accessible model. Dedicated scrollable viewport sizing,44px actions, mobile rows and desktop grid should be assessed in actual Chrome. Title-based choice names, decorative image alt and understandable failed/missing-image fallback avoid redundant announcements.

The plan keeps domain actions in their existing owner and adds one focused client dialog. Existing MenuPage shape/cursors and shared transaction/auth boundaries are reused; search is capped at50 results with existing statement timeouts and no whole-menu client load. No architectural or performance blocker is evident.

Required tests meaningfully address parser/store/HTTP behavior, Unicode/literal punctuation, full-menu pagination/isolation/read-only guards, invalid network payloads and async races. Real-browser tests must demonstrate physical search/selection/explicit confirmation, no POST from search Enter/selection/dismissal, one POST on repeated confirmation, pending-state behavior, retry/access/stale recovery, request supersession including post-fetch parsing and close/reopen races, saved/null/broken thumbnails, focus containment/return and320/1440 scrolling/no overflow. Existing planning assertions must be adapted rather than removed. Full strict/build/regression commands and fresh visually inspected screenshots remain required.

This is design approval only. Implementation, actual red/green evidence, independent security/final source review and root source-equivalence checks remain outstanding. No merge, deployment or other release authority is granted.
