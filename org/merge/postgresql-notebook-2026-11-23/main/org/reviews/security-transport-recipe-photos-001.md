---
artifact: lib/recipes/photo-transport.ts
reviewed_at: 2026-11-23
reviewer: security-researcher
verdict: clear
round: 1
---

# Early security consultation — pinned recipe HTML transport

## Verdict and limits

**Clear for the transport slice; no required security finding.** Reviewed
`e22a8ee` and current `lib/recipes/photo-transport.ts` against the approved
recipe-photos spec/plan and independent security design. This is an early
consultation while implementation continues, not the final feature security
phase. Metadata identity/selection, provider composition, shared cross-search
admission and photo-stage fail-soft behavior still require final review.

## Concrete boundary assessment

- `photo-transport.ts:13`–`:16` validates the native IP family before parsing,
  rejects scoped/noncanonical inputs, requires the pinned classifier's public
  unicast result, and restricts IPv6 to `2000::/3`. Focused tests exercise actual
  ipaddr.js `2.5.0` behavior for private/loopback/link-local/CGNAT/documentation,
  mapped, Teredo, 6to4 and translation ranges, including `3fff::1`.
- `:38`–`:42` reuses safe source syntax and additionally excludes local-network
  suffixes before DNS. `:65`–`:83` waits for both A and AAAA results, checks every
  answer and family, rejects mixed public/private sets and unexpected errors,
  permits only the specified missing-family cases, and bounds the total count.
  No connection begins before these checks complete.
- `:86`–`:101` constructs a dedicated Agent with no keepalive or TLS session
  cache and an explicit proxy environment containing no proxy URLs. The HTTPS
  request retains original hostname/Host/SNI, port 443, native certificate
  identity checking and `rejectUnauthorized: true`. Custom lookup returns only
  the selected already-validated address in the requested callback shape;
  changed DNS answers cannot change the socket target. Family mismatch and
  wrong-host lookup requests fail. There is no global agent, redirect handler,
  alternate connection, browser/provider credential, custom CA, or socket path.
- The single fixed-header GET includes only HTML/identity encoding acceptance,
  application User-Agent, original Host and connection-close. Query/path identity
  is retained; no search description or incoming authentication headers are
  forwarded. `:19`–`:29` and `:105`–`:118` reject redirects, non-HTML,
  unsupported encoding/charset, excessive headers, and oversized actual bodies.
  `Content-Length` is only an early check; streaming byte accounting and strict
  UTF-8 decoding remain authoritative.
- `:41` and `:49`–`:67` cap the entire resolver/connect/body operation at the
  smaller remaining deadline or three seconds. The resolver has one try and
  at most one second per DNS timeout. Completion/abort/failure cancels resolver
  work and destroys request, response and agent. A settled flag prevents late
  DNS completion from opening a connection; late response callbacks destroy
  the received stream instead of consuming it (`:102`–`:104`). Request/response
  error and aborted/close paths settle softly. No image binary is requested.

## Independently run evidence

`node --test build/recipe-tests/tests/recipe-photo-transport.test.js` exited 0:
**6 focused tests, 6 pass**, zero failures/skips/cancellations. Tests cover actual
classifier behavior, all-answer rejection, missing-family policy, captured
native lookup/TLS/Host/options, rebinding, redirected/private location refusal,
TLS failure, dishonest lengths, type/charset/compression/UTF-8 errors, header/
body caps, and parent-abort/total-deadline cancellation. They use native-boundary
fixtures without connecting to private networks or invoking a model.

Additional TypeScript probe
`/private/tmp/recipe-photo-transport-security.ts` exited 0. It verified:

- a successful DNS answer arriving after the total timeout cannot invoke the
  request factory;
- a response callback arriving after parent abort has its stream destroyed;
- the actual Agent instance is not the global Agent, has reuse/session caching
  disabled, and has no HTTP/HTTPS proxy setting;
- abort destroys the captured request and Agent. No live connection was made.

The installed Node 24 HTTP Agent implementation was inspected to confirm that
its proxy configuration reads the supplied `options.proxyEnv`, supporting the
non-proxy interpretation of the explicit object used here. No environment
secret values were inspected.

A targeted secret scan of transport/tests/fixtures exited 0 with zero findings.
The parent's full 40-test/lint/typecheck/build and three-publisher live transport
results were reported and read, not independently replayed. The full test suite
was intentionally not run while another agent writes unfinished metadata files.

## Exact dependency graph evidence

The current package manifest pins htmlparser2 `10.1.0` and ipaddr.js `2.5.0`.
Independent `shasum -a 256 package-lock.json` returned
`8fecdb77b122d956f14f6fb2d6ee075c5a17cbd0ebbc3545b1cb6fd5e53fdc82`, exactly the
prospective graph fingerprint recorded in `recipe-photos-dependencies.md`.
That record documents eight additions, no existing version changes/removals,
reviewed lifecycle metadata, script-disabled installation, a clean runtime audit
and unchanged four moderate development-only findings. Its matching graph
supports reusing that audit rather than repeating an unchanged network audit.
The import/classifier tests provide actual compatibility evidence; no package
scripts or dependency upgrades were executed during this consultation.

The final security phase must still check that only validated exact recipe
sources reach this internal loader, that global two-job admission begins before
DNS across searches, and that optional enrichment cannot discard valid cards,
outlive its soft budget or swallow parent cancellation. This report does not
claim those not-yet-reviewed integration properties are already implemented.
No application edit, secret read, paid call, state/ledger/graph mutation,
commit, merge, or release occurred in this consultation.
