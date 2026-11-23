---
artifact: recipe-search-implementation
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: clear
round: 3
---

# Targeted security review — citation representation and browser authority

## Verdict

Clear for these bounded implementation corrections. No new required security
finding. Native citation display cleanup preserves the source authority and
candidate evidence boundaries; direct-origin handling preserves foreign-origin
rejection while supporting the actual browser authority. This does not approve
merge/release or substitute for the orchestrator's live source-fidelity evidence.

## Citation representation boundary

- `lib/recipes/openai.ts:59`–`:113` limits cleanup to each output-text part's
  native `url_citation` ranges with safe native URLs and safe integer offsets.
  Ranges must lie wholly within a JSON string and match a complete bounded
  display-only citation shape; actual field URLs and JSON delimiters cannot
  satisfy that shape. A quote/escape state is carried across text parts without
  treating a part-local offset as a global offset.
- Code-point and UTF-16 boundaries, plus inclusive/exclusive end variants, are
  resolved only when exactly one distinct display span is valid. Identical
  spans now deduplicate before overlap grouping; nonidentically overlapping or
  ambiguous ranges are left untouched. Removal proceeds right to left. The
  earlier conservative duplicate-policy mismatch is resolved and has its own
  regression, separate from genuine overlap rejection.
- Native annotation URLs are still collected independently
  (`openai.ts:136`–`:142`); display Markdown URLs are never parsed into the
  authority set. Candidate parsing still requires exact normalized membership,
  safe URLs, field bounds and server-assigned IDs (`:151`–`:180`). Curator
  source/title/ID and source-specific method/time/photo checks remain intact.
  Only surrounding whitespace in source URL/title is trimmed. Remaining bad
  JSON, unsupported field URLs or missing native citations still fail closed.
- The 20,000-character bound is checked on raw research text before cleanup;
  individual removable ranges are bounded to 4,096 code units. The preexisting
  1 MiB transport-body bound and fixed token/tool/request ceilings remain.
  Prompts still treat user/source text as untrusted data; the correction grants
  no new tool, execution, storage, credential, or server-fetch capability.

Independent TypeScript probe
`/private/tmp/recipe-citation-authority-recheck.ts` exited 0: a display link to a
native-cited URL could not make a different uncited underlying source URL pass;
only the research call occurred. A native range covering a plain underlying
field URL did not delete that URL, and the correctly cited recipe still passed.
These were injected transport fixtures, not paid requests.

## Direct browser origin boundary

`lib/recipes/search.ts:26`–`:44` parses the direct Host authority under the
request URL's HTTP(S) scheme. Empty, oversized, credential-bearing, path/query/
fragment, backslash, percent-encoded, whitespace, invalid-port and otherwise
non-authority hosts are rejected. Parser normalization must match the supplied
canonical authority; default ports and DNS case are normalized, with URL-parser
validation for bracketed IPv6. URL origin is used only when Host is absent.
The route compares the actual Origin to that result (`:110`–`:114`) before
intake/provider work. No forwarded-host/protocol header is consulted by this
application logic, and mismatches retain `FORBIDDEN_ORIGIN` 403.

The independent TypeScript probe
`/private/tmp/recipe-origin-security-recheck.ts` exited 0: a synthesized bind-host
URL with a direct 127.0.0.1 authority passed, as did IPv6 loopback and a canonical
HTTPS/default-port authority. Seven malformed authorities and two forwarded-
header/scheme spoof attempts returned 403 without invoking the injected provider.

This remains browser-origin filtering, not authentication or a deployment host
allowlist: a non-browser client controls its headers. The application already
permits anonymous recipe search by scope. Any public reverse proxy must preserve
or explicitly configure trustworthy public scheme/authority, constrain routing
hosts, and apply the previously recorded shared-usage/spending controls. The
correction does not silently trust arbitrary forwarding headers to solve proxy
configuration. Those public-deployment decisions retain the human release gate.

## Independent verification and limits

- `npm test`: exit 0; **34 tests, 34 pass**, zero failures/skips/cancellations.
  Includes citation contamination, unannotated display rejection, astral Unicode,
  end variants, part-local offsets, duplicate/overlap/ambiguity behavior,
  candidate grounding, direct Host/Origin validation, deadline/abort cleanup,
  and accepted-search accounting.
- Both additional authority probes above exited 0 with zero paid calls.
- Targeted source/test secret scan: exit 0, zero findings. `git diff --check`:
  exit 0.
- Read the updated architect-approved specification/plan and actual code/test
  corrections. Lint/typecheck/build/Python/browser/live results remain the
  orchestrator/developer's separately recorded evidence; they were not rerun
  as part of this targeted consultation.
- No dependency or lockfile changes, so the already-recorded audits were not
  repeated. Earlier release-header/dependency deferrals remain unchanged.
- No live provider request, secret read/output, application edit, status/loop/
  graph/ledger change, commit, merge, or release was performed in this review.
