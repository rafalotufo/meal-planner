---
artifact: intent/recipe-photos/spec.md
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: clear
round: 1
---

# Independent security design review — recipe-photo metadata

## Verdict and scope

**Clear for the proposed network boundary. No required design change.** The
specification explicitly authorizes a narrowly bounded exception to the prior
no-source-fetch policy (`intent/recipe-photos/spec.md:11`–`:19`), rather than
silently weakening recipe-search grounding or adding a general URL fetcher.
Implementation and its dependency graph still require the planned independent
security/code review and actual adversarial test evidence. This design verdict
is not approval of unreviewed dependency scripts, merge, or public release.

## Threat model and boundary decisions

Assets: server/network isolation, API credentials and visitor queries, process
availability, valid recipe identity, and the accuracy of photo attribution.
Untrusted values are the previously validated recipe source URL, DNS answers,
remote HTTP/TLS responses, publisher HTML/JSON-LD/Open Graph, and image URLs.
A native citation does not make a host safe to connect to; the new transport
must enforce its own network checks after recipe grounding has succeeded.

- **SSRF, DNS rebinding, and connection reuse:** `spec.md:96`–`:119` requires
  HTTPS/443, safe source syntax, both A and AAAA resolution, rejection if any
  answer is non-public or malformed, and a maximum answer count. IPv6 must also
  lie within global unicast `2000::/3`, with mapped/transition/special ranges
  rejected. One approved address is pinned through custom lookup; there is no
  second lookup, address retry, redirect, proxy, global agent or pooled socket.
  These controls address the check/use gap that a DNS precheck followed by
  ordinary fetch would leave open.
- **TLS and host identity:** the connection keeps the original hostname for
  HTTP Host, SNI and certificate identity, with verification enabled. Pinning an
  address must not turn certificate verification into an IP-identity check or
  disable it. A dedicated request/agent with explicit verification and no
  application-supplied CA/client certificate is consistent with Node's HTTPS
  [request/agent options](https://github.com/nodejs/node/blob/v22.0.0/doc/api/https.md).
  Implementation tests must inspect the actual native options/custom lookup,
  including the lookup callback's requested family/all-address shape.
- **Redirect, credential and binary isolation:** `:121`–`:133` permits one fixed-
  header GET, sends no browser/provider credentials or query text, rejects every
  redirect, and accepts only uncompressed HTML with the specified charset.
  The server never fetches the selected image. Thus an HTML response cannot
  redirect the transport into a protected network or induce remote context,
  script, image, or secondary-page fetches through parsing.
- **Resource abuse:** `:127`–`:159` bounds actual streamed bytes, headers,
  parser collection/traversal, source count, total/per-fetch time, and globally
  admitted DNS-plus-connection jobs across searches. The two-slot limit starts
  before DNS, has no waiting queue, and includes cleanup on every path. Optional
  photo work has a soft deadline before the existing parent deadline and may
  fail without discarding valid recipes; parent cancellation remains
  authoritative. The Node [Resolver API](https://github.com/nodejs/node/blob/v22.0.0/doc/api/dns.md)
  supports per-instance resolver configuration and cancellation, which the
  transport must use instead of assuming socket idle timeout also bounds DNS.
- **Metadata injection and cross-recipe confusion:** `:40`–`:92` limits parsing
  to nonexecuted structured/head metadata. Exact source identity or the narrow
  unique-Recipe/canonical/title rule binds each selected image to its card;
  conflicting or ambiguous identities are ignored. HTML base tags, remote
  contexts, body-image scans and filename rewriting cannot widen selection.
  Relative image URLs are resolved against the fetched source and revalidated.
  Existing recipe source/citation/method/time evidence and React text rendering
  remain unchanged.

## Implementation evidence required by this approval

The proposed tests in `spec.md:177`–`:192` cover the relevant attack surfaces.
During implementation/review, verify them against real boundary functions,
not a production mock path. In particular:

1. Assert mixed public/private A+AAAA rejection, mapped/tunnel/documentation
   ranges in both families, all-answer checking, and a changed later DNS answer
   that never alters the pinned connection. Test the exact pinned ipaddr.js
   release's classifications, including modern documentation/special IPv6
   ranges; its default `unicast` result is not a substitute for the explicit
   policy in this spec.
2. Inspect TLS hostname/verification, original Host, fixed credential-free
   headers, fresh agent ownership, no environment proxy routing, no redirects,
   and no second connection/fallback resolution. Cancel resolver and native
   request/response/agent resources on every failure and completion.
3. Exercise partial/slow/chunked responses, dishonest lengths, compression and
   encoding rejection, oversized metadata and adversarial nesting. A photo
   deadline must settle with an unchanged valid recipe even if DNS/body work
   stalls; late callbacks must not mutate a result already returned. Parent
   abort must still abort the search rather than becoming optional-photo success.
4. Run concurrent enrichment fixtures across searches to prove the shared
   two-job limit includes DNS, skips saturation, attempts no more than six exact
   sources, and releases admission/timers/listeners after cancellation/failure.
   Assert every non-image field and result order stays identical on failure.

These are concrete checks of the approved contract, not added product scope.
Metadata is publisher evidence, not proof of image contents or availability;
real-source/browser natural-dimension checks remain necessary to establish the
requested photo improvement. Browser image hosts still receive ordinary image
requests under the existing no-referrer and fallback policy.

## Dependency and review limits

The design limits additions to exact htmlparser2 `10.1.0` and ipaddr.js `2.5.0`,
with registry compatibility evidence recorded by the orchestrator. Dependency
source/install-script inspection, generated lockfile review and audit of the
new transitive graph remain required before implementation approval; no
previous dependency audit is presented as evidence for that future graph.
Nothing in this verdict authorizes executing unreviewed scripts or replacing
failed SSRF/encoding/identity checks to improve coverage.

Read active `org/loop/state.yaml`, accepted photo intent, draft specification,
source research, prior recipe-search network boundary and security evidence,
and the security skill. Checked official Node HTTPS/DNS documentation. No
application changes, dependency installation, dependency-script execution,
secret reads, paid calls, live source/image downloads, status/loop/graph/ledger
mutation, commit, merge or release occurred in this design consultation.
