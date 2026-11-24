---
artifact: intent/saved-recipe-menu/request-timeout-note.md
reviewed_at: 2026-11-24
reviewer: security-researcher
verdict: approved
round: 1
---

# Menu body deadline — focused security consultation

Verdict: the proposed narrow dispatch change is acceptable to implement as a
plan/spec amendment, subject to the equivalence checks below. No design blocker
found. This is approval of the proposed security boundary, not acceptance of an
unimplemented matcher/wrapper or a claim that the stalled HTTP regression passes.

Confirmed the source diagnosis: Next's Node proxy clones non-GET/HEAD bodies
(`node_modules/next/dist/server/next-server.js:1198,1227`) and unconditionally
awaits finalization (`1231–1234`); the buffered clone's finalizer waits for the
original end event (`body-streams.js:54–56,67–73`). A parser-only timer cannot
bound that preceding wait. The installed official proxy guide documents static
negative matchers. No vendor patch or weaker application limit is required.

The protected menu route wrapper can enforce the same security decisions before
parsing without framework Proxy dispatch. Keep `lib/auth-policy.ts` unchanged:
these routes remain protected, and the exclusion is not a public-route rule.
Retain current store-level checks after the common transaction lock. The existing
handlers already obtain family context and verified identity before parsing
(`app/api/menu/route.ts:24–30`, removal route:14–20); preserve that order.

## Required equivalence and tests

1. Use a constant, path-only exclusion for `/api/menu` and exactly one ID segment
   followed by `/remove`, accounting for Next's normalization. Verify compiled
   matcher behavior, not just a standalone regular expression. `/api/menu-evil`,
   `/api/menus`, `/api/menu/extra`, `/api/menu/id/remove/extra`, `/menu` and search
   must stay under Proxy. Test encoded/normalized/trailing-slash route variants
   that actually resolve to a menu handler: every resolved handler must receive
   the wrapper. No cookie/header/query dispatch condition or public exception.
2. Before body reads on both excluded route shapes, derive canonical origin only
   from `authConfiguration`, enforce exact Host equality and return421 on wrong
   Host (`proxy.ts:8–14`), ignoring forged forwarding headers. Preserve fail-closed
   config/session failures, cryptographic identity/current admission and family
   401/403 decisions. Run member, anonymous, pending, denied and expired cases.
   The wrapper must cover every exported handler and every Next-supported HTTP
   method: GET, HEAD, POST, OPTIONS, PUT, PATCH and DELETE. Explicit protected405
   handlers replace framework-generated OPTIONS/405 responses. On the removal
   shape, GET/HEAD are protected nonmutating unsupported methods. HEAD must not
   accidentally reuse a mutation handler or parse a body.
3. Every wrapper exit, including denied identity, unsupported method, invalid
   query/body and thrown operation, remains private/no-store and gets nosniff,
   frame denial, no-referrer and the existing restrictive CSP policy. Retain HSTS
   when the configured origin is HTTPS. JSON endpoints need no forwarded HTML
   nonce; if the existing CSP nonce expression is reused, generate it server-side.
   Do not expose configured origin, allowlist, session or raw exceptions in JSON.
   Current Proxy returns early on invalid config/Host before adding its full
   header set; adding consistent security headers on those wrapper errors is
   acceptable and does not require weakening their failure status.
4. Keep exact configured Origin, cross-site rejection, JSON/actual-byte bounds
   (16KiB/4KiB), five-second parser deadline, cancellation and transaction recheck.
   The unfinished real authenticated chunked save request must receive fixed400
   before client EOF, with no write; add equivalent removal coverage. Do not end
   the client body to satisfy timing. Test oversized, malformed and stalled
   requests plus unsupported-method bodies without effects. Preserve the pure
   parser tests, including uncooperative cancellation/abort cases.
5. Re-run existing auth/proxy/search/photo/deployment regressions and compiled
   menu operation without source/migration files. Prove wrapper code is bundled;
   keep all other Proxy behavior, search90s/cancellation and provider bounds
   untouched. No global body/truncation option is a substitute for the boundary.

Read the note, pinned source and current handlers/parser; `git diff --check`
passed. No code, configuration, database, hosted or browser action performed.
Post-change real HTTP and compiled-package evidence are still required. The
five-second contract starts at the authenticated application parser; it does not
prove an end-to-end hosted ingress timeout where an untested platform buffers.

## Follow-on: preserve the stateless cookie precondition in the handler instance

Verdict: acceptable as part of the same menu-specific equivalence amendment,
with the tests below. No blocker to using the public `better-auth/cookies`
`getCookieCache` verifier before any call that can invoke `getSession`.
Do not change shared auth configuration, use custom cryptography, patch the
adapter or weaken the one-hour/no-refresh contract.

Source evidence confirms the relevant fallback: Better Auth's session route
verifies the signed session token, attempts the configured cache, and falls
through to `internalAdapter.findSession(sessionCookieToken)` when the cache is
unusable (`node_modules/better-auth/dist/api/routes/session.mjs:41–58,155–165`).
A handler sharing the callback's in-memory adapter can therefore find a session
where the separately instantiated Proxy previously had no fallback row.
An expired/tampered/missing cache must not gain menu access through that path.

The public helper selects the secure prefix from explicit `isSecure`, handles
chunked cache cookies, verifies the JWE with the configured secret and checks
embedded expiry (`cookies/index.mjs:278–318`). Its decoder performs authenticated
JWE decryption and expiry validation (`crypto/jwt.mjs:100–140`); do not replace
that verification with a raw decode or trust request-supplied strategy/secret.
The helper is a mandatory precondition, not an alternative family authorizer.

Required implementation shape:

- After configured Host validation but **before** `requireFamilyContext`,
  `requireIdentity`, or `readCryptographicSession`, call the public verifier
  using `authConfiguration().secret`, `strategy: 'jwe'` and
  `isSecure: configuredOrigin.startsWith('https:')`. Missing/invalid cache returns
  fixed401 with the same protected headers, without body parsing or a menu read/
  write. Catch malformed-cookie/verification exceptions without raw logging.
- Validate cached user through existing `verifiedIdentity`; require a nonempty
  cached session token and finite, unexpired embedded session timestamp.
  Then call existing `readCryptographicSession` and require an exact match of
  session token and the verified stable identity (subject, normalized email and
  verified-email status). Do not substitute the ephemeral Better Auth user ID.
  A different valid signed token can otherwise make `getSession` return a
  fallback session. Comparing both token and identity rejects that mismatch.
- Continue all existing current admission/family/context/store checks, including
  in-transaction `requireMember`. Every exported method, including guarded405
  and HEAD, receives this precondition. Do not refresh/reissue cookies or retain
  request/session values in module-global state.

Required focused evidence before accepting the change:

1. A genuine current complete session succeeds without any Set-Cookie refresh;
   signed-token-only, missing token/cache, malformed/tampered/wrong-key JWE,
   expired outer JWE and expired embedded session all return401, even while the
   callback's same-process fallback adapter still has the unexpired session row.
2. Missing/invalid Google subject, false/nonboolean emailVerified and invalid
   email are rejected. A valid cached session A combined with signed token B
   fails, including the same user's different sessions; family/database state
   cannot make that combination eligible. An invalid/missing embedded expiry
   or token must also fail closed.
3. Correctly prefixed HTTPS cookies and chunked cache cookies succeed; wrong
   secure prefix, tampered/missing/reordered-invalid chunks fail or reconstruct
   only through the library's authenticated parser. Preserve HTTP loopback's
   unprefixed behavior. Prefix selection comes from configured origin, never
   NODE_ENV, request Host or forwarded headers.
4. Run the rejection precondition on both menu shapes and unsupported methods,
   retain401/403 admission distinctions for valid cache identities, and verify no
   parsing/writes for rejected credentials. Rerun the raw stalled-body timeout,
   menu HTTP, existing auth/session, and compiled-package regressions.

This is a source-grounded consultation; the proposed follow-on was not executed
or verified by this reviewer. Existing library JWE expiry tolerance remains the
library's policy; no new extension or refresh is introduced. The independent
final code review must inspect the implemented comparisons and actual evidence.
