# Menu body deadline — pinned Next source consultation

- Author: architect
- Date: 2026-11-24
- Scope: read-only diagnosis; no runtime/configuration change or new approval.
- Trigger: senior developer's real HTTP stalled-body test did not receive 400
  within its 15-second ceiling; pure parser deadline tests passed.

## Root cause

The five-second parser deadline starts too late when this request traverses
Next16.4.6's Node Proxy. Installed source evidence:

- `node_modules/next/dist/server/next-server.js:1198` supplies the clonable body
  for non-GET/HEAD methods; line1227 clones it for the proxy adapter.
- The `finally` block at lines1231–1234 awaits `requestData.body.finalize()`.
- `node_modules/next/dist/server/body-streams.js:54` creates an end promise from
  the original IncomingMessage's `end`/`error` events; `finalize` at lines67–73
  awaits that original EOF before replacing its buffered body.
- The handler therefore cannot start its parser timer while an unfinished
  chunked client body holds that finalization open. Returning a timeout response
  or reading the clone inside Proxy would still cross the same finally/EOF wait.

The local official `proxyClientMaxBodySize.md:7–9` documents automatic cloning/
buffering, and lines71–76 explicitly say exceeding its byte limit truncates the
body and continues, rather than returning an error. This option is neither a
body-read timeout nor the application 16KiB/4KiB rejection boundary. The global
experimental proxyTimeout concerns outbound proxying and is not a scoped fix
for this original-request finalization. Do not change search's 90-second budget,
patch framework internals or use private IncomingMessage escape hatches.

## Scoped documented solution to verify

The official installed Proxy guide at
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md:75–101`
documents static negative matcher exclusions. Exclude only the two menu API
route shapes from framework Proxy dispatch, and enforce their existing protection
inside a small menu Route Handler wrapper. This is a dispatch change, **not a
public-route/authentication exception**. Keep `/menu`, search and every existing
non-menu route under the current proxy.

A matcher candidate is `/((?!api/menu(?:/[^/]+/remove)?/?$).*)`, excluding only
`/api/menu` and one-ID-segment removal paths (including normalized trailing slash).
Verify actual compiled matcher behavior with Next's supported test utility or
real HTTP; regex source alone is not proof. Unknown menu subpaths must retain
proxy coverage. Explicitly prove false prefixes/siblings such as `/api/menu-evil`,
`/api/menus`, `/api/menu/extra` and `/api/menu/id/remove/extra` remain covered. No header/cookie condition may let clients select dispatch.

Before any menu body read, the wrapper must preserve canonical configured Host
validation (421 on wrong Host), valid current admission/family context (401/403),
fail-closed configuration/session errors, exact Origin/fetch-site/JSON checks,
existing actual-byte/body deadlines and in-transaction member recheck. Preserve
private/no-store, nosniff, frame denial, referrer policy, CSP and HTTPS HSTS on
menu responses without exposing server configuration. Do not trust forwarded
headers or derive the canonical origin from input. Existing handlers already
recheck family context and identity; retain that protection rather than relying
on exclusion-side assumptions. Prefer one cohesive wrapper over a broad auth/
proxy refactor.

Account for every method: GET/HEAD, POST, OPTIONS, PUT, PATCH and DELETE;
return deliberate authenticated405 responses for unsupported methods instead
of relying on generated OPTIONS/405 behavior. Relying only on framework-generated 405
would leave those responses outside canonical-host/admission/header enforcement
that Proxy previously supplied. No body read or effect for HEAD/unsupported
methods. The API JSON wrapper does not need to forward an HTML nonce to a page;
it must retain the security response policy. Auth/public policy stays unchanged.

## Evidence required before accepting the fix

1. The existing unfinished raw chunked authenticated POST gets fixed400 before
   client EOF and without a menu write, under a bounded ceiling with scheduler/
   auth allowance. Do not end the client body to make the regression pass.
2. Equivalent removal-body deadline and actual-byte bounds still hold; streamed
   malformed/oversized requests fail without network/provider or database effects.
3. Wrong Host (including forged forwarded-host/origin), anonymous, pending,
   denied and valid-member cases preserve 421/401/403/success for both menu shapes.
   Unsupported methods and HEAD remain guarded, private and without mutation.
4. Existing proxy/auth/search/provider/photo/deployment tests remain passing;
   compiled package operation retains wrapper dependencies and runtime metadata.

This diagnosis is source-grounded, while the matcher/wrapper resolution remains
unverified until implementation and the failing real HTTP regression pass.
Application body timers begin when the request reaches its authorized parser;
upstream hosted infrastructure may separately buffer requests, so local HTTP
success cannot assert a wall-clock ingress timeout for an untested hosted layer.
Plan/spec amendment and independent review should record the narrow dispatch
change and these proof limits rather than weaken the accepted body-read contract.
