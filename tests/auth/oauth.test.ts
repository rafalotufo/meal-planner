import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { CookieJar, startServer } from './server.ts';
import { symmetricDecodeJWT, symmetricEncodeJWT } from 'better-auth/crypto';
import { randomBytes } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { beginGoogle, signInWithGoogle, provision } from './flow.ts';

let server: Awaited<ReturnType<typeof startServer>>;
before(async () => { server = await startServer({}, true); });
after(async () => { await server?.stop(); });

function begin(jar: CookieJar, changes: Record<string, unknown> = {}, headers: Record<string, string> = {}) { return beginGoogle(server.origin, jar, changes, headers); }

test('Google OAuth completes with provider HTTP fixtures and creates bounded encrypted sessions', async () => {
  const jar = new CookieJar();
  const initial = await begin(jar);
  assert.equal(initial.status, 200);
  const { url } = await initial.json();
  const authorization = new URL(url);
  assert.equal(authorization.origin, 'https://accounts.google.com');
  assert.equal(authorization.searchParams.get('redirect_uri'), `${server.origin}/api/auth/callback/google`);
  assert.deepEqual(new Set((authorization.searchParams.get('scope') ?? '').split(' ')), new Set(['openid', 'email', 'profile']));
  assert.equal(authorization.searchParams.get('include_granted_scopes'), null);
  assert.notEqual(authorization.searchParams.get('access_type'), 'offline');
  assert.ok(authorization.searchParams.get('code_challenge'));
  assert.equal(authorization.searchParams.get('code_challenge_method'), 'S256');
  const callback = await jar.request(server.origin, `/api/auth/callback/google?code=test-code&state=${encodeURIComponent(authorization.searchParams.get('state') ?? '')}`);
  assert.equal(callback.status, 302);
  assert.equal(callback.headers.get('location'), `${server.origin}/onboarding`);
  assert.equal((await provision(server.origin, jar)).status, 200);
  const cookies = callback.headers.getSetCookie().filter((cookie) => !/max-age=0(?:;|$)/i.test(cookie));
  assert.ok(cookies.length >= 2);
  for (const cookie of cookies) {
    assert.match(cookie, /HttpOnly/i);
    assert.match(cookie, /SameSite=Lax/i);
    assert.match(cookie, /Path=\//i);
    assert.doesNotMatch(cookie, /Domain=/i);
    const age = /Max-Age=(\d+)/i.exec(cookie)?.[1];
    if (age) assert.ok(Number(age) <= 3600);
  }
  const home = await jar.request(server.origin, '/');
  assert.equal(home.status, 200);
  const homeHtml = await home.text();
  assert.match(homeHtml, /<h1[^>]*>Meal Planner<\/h1>/);
  assert.match(homeHtml, /What would you like to cook/);
  const csp = home.headers.get('content-security-policy') ?? '';
  assert.match(csp, /(?:^|; )img-src 'self' data: https:(?:;|$)/);
  assert.match(csp, /script-src 'self' 'nonce-/);
  assert.match(csp, /connect-src 'self'(?:;|$)/);
  assert.match(csp, /frame-ancestors 'none'/);
  const recipeRequest = () => ({ method: 'POST', headers: { Origin: server.origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: '' }) });
  // Invalid descriptions stop before provider discovery, so these checks never call an LLM.
  const allowedSearch = await jar.request(server.origin, '/api/recipes/search', recipeRequest());
  assert.equal(allowedSearch.status, 400);
  assert.match(allowedSearch.headers.get('cache-control') ?? '', /no-store/);
  const hostStatus = await new Promise((resolve, reject) => {
    const request = httpRequest(`${server.origin}/api/session`, { headers: { Host: 'evil.example', Cookie: jar.header() } }, (response) => { response.resume(); resolve(response.statusCode); });
    request.once('error', reject); request.end();
  });
  assert.equal(hostStatus, 421);
  const api = await jar.request(server.origin, '/api/session');
  assert.equal(api.status, 200);
  assert.deepEqual(await api.json(), { authenticated: true });
  assert.match(api.headers.get('cache-control') ?? '', /no-store/);
  assert.equal(api.headers.getSetCookie().length, 0, 'session reads must not refresh cookies');
  const dataCookie = jar.values.get('better-auth.session_data');
  assert.ok(dataCookie);
  const data = decodeURIComponent(dataCookie);
  const decoded = await symmetricDecodeJWT<{ session: Record<string, unknown> & { expiresAt: string }; user: Record<string, unknown> & { email: string; emailVerified: boolean }; exp: number; iat: number }>(data, server.secret, 'better-auth-session');
  assert.ok(decoded);
  assert.equal(decoded.user.googleSubject, "fixture-user");
  assert.notEqual(decoded.user.id, decoded.user.googleSubject);
  assert.equal(decoded.exp - decoded.iat, 3600);
  assert.ok(new Date(decoded.session.expiresAt).getTime() - Date.now() <= 3600000);
  for (const replacement of [
    `${data.slice(0, -6)}tamper`,
    await symmetricEncodeJWT(decoded, randomBytes(48).toString('base64url'), 'better-auth-session', 3600),
    await symmetricEncodeJWT(decoded, server.secret, 'better-auth-session', -60),
    await symmetricEncodeJWT({ ...decoded, session: { ...decoded.session, expiresAt: new Date(Date.now() - 60000).toISOString() } }, server.secret, 'better-auth-session', 3600),
    await symmetricEncodeJWT({ ...decoded, user: { ...decoded.user, email: 'removed.member@gmail.com' } }, server.secret, 'better-auth-session', 3600),
    await symmetricEncodeJWT({ ...decoded, user: { ...decoded.user, googleSubject: undefined } }, server.secret, 'better-auth-session', 3600),
    await symmetricEncodeJWT({ ...decoded, user: { ...decoded.user, emailVerified: false } }, server.secret, 'better-auth-session', 3600),
  ]) {
    const invalid = new CookieJar();
    invalid.values = new Map(jar.values);
    invalid.values.set('better-auth.session_data', replacement);
    assert.equal((await invalid.request(server.origin, '/api/session')).status, 401);
    assert.equal((await invalid.request(server.origin, '/')).status, 307);
    assert.equal((await invalid.request(server.origin, '/api/recipes/search', recipeRequest())).status, 401);
  }
  const onlyToken = new CookieJar();
  const signedToken = jar.values.get('better-auth.session_token');
  assert.ok(signedToken);
  onlyToken.values.set('better-auth.session_token', signedToken);
  assert.equal((await onlyToken.request(server.origin, '/api/session')).status, 401);
  assert.equal((await jar.request(server.origin, '/api/auth/get-session')).status, 404);
  assert.equal((await jar.request(server.origin, '/api/auth/sign-out')).status, 404);
  assert.equal((await jar.request(server.origin, '/api/auth/sign-out', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
  for (const name of ['better-auth.session_data', 'better-auth.account_data']) {
    const value = jar.values.get(name);
    assert.ok(value);
    jar.values.delete(name);
    jar.values.set(`${name}.0`, value.slice(0, Math.ceil(value.length / 2)));
    jar.values.set(`${name}.1`, value.slice(Math.ceil(value.length / 2)));
  }
  assert.equal((await jar.request(server.origin, '/api/session')).status, 200);
  const logout = await jar.request(server.origin, '/api/auth/sign-out', { method: 'POST', headers: { Origin: server.origin, 'Content-Type': 'application/json' }, body: '{}' });
  assert.equal(logout.status, 200);
  assert.equal(jar.values.size, 0, 'logout clears every cookie');
  assert.equal((await jar.request(server.origin, '/api/session')).status, 401);
  assert.equal((await jar.request(server.origin, '/')).status, 307);
});

test('provider, request-shape, destination and Origin restrictions cannot be overridden', async () => {
  for (const changes of [{ provider: 'github' }, { callbackURL: 'https://evil.example' }, { errorCallbackURL: '//evil.example' }, { idToken: { token: 'forged' } }, { googleSubject: 'injected' }, { familyId: 'injected' }, { scopes: ['https://www.googleapis.com/auth/drive'] }, { additionalParams: { access_type: 'offline' } }]) {
    assert.equal((await begin(new CookieJar(), changes)).status, 400);
  }
  assert.equal((await begin(new CookieJar(), {}, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await begin(new CookieJar(), {}, { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  const callback = await fetch(`${server.origin}/api/auth/callback/google?code=attacker&state=wrong`, { redirect: 'manual' });
  assert.equal(callback.status, 302);
  assert.equal(callback.headers.get('location'), `${server.origin}/sign-in?error=1`);
  const absent = await fetch(`${server.origin}/api/auth/callback/google?code=attacker`, { redirect: 'manual' });
  assert.equal(absent.headers.get('location'), `${server.origin}/sign-in?error=1`);
});

test('Google signature/audience verification and OAuth state binding remain active', async () => {
  for (const code of ['bad-signature', 'wrong-audience', 'wrong-issuer', 'expired-token']) {
    const isolated = await startServer({}, true);
    try {
      const jar = new CookieJar();
      const { callback } = await signInWithGoogle(isolated.origin, jar, code);
      assert.equal(callback.status, 302);
      assert.equal(callback.headers.get('location'), `${isolated.origin}/sign-in?error=1`);
      assert.equal((await jar.request(isolated.origin, '/api/session')).status, 401);
    } finally { await isolated.stop(); }
  }
  const jar = new CookieJar();
  const initial = await begin(jar);
  assert.equal(initial.status, 200);
  const invalidState = await jar.request(server.origin, '/api/auth/callback/google?code=test-code&state=mismatch');
  assert.equal(invalidState.headers.get('location'), `${server.origin}/sign-in?error=1`);
  assert.equal((await jar.request(server.origin, '/api/session')).status, 401);
});

test('only configured, verified Gmail identities create sessions', async () => {
  for (const code of ['unlisted', 'unverified', 'string-verified', 'wrong-domain', 'plus-alias', 'dot-alias']) {
    const isolated = await startServer({}, true);
    try {
      const jar = new CookieJar();
      const { callback } = await signInWithGoogle(isolated.origin, jar, code);
      assert.equal(callback.headers.get('location'), `${isolated.origin}/sign-in?error=1`);
      assert.equal(jar.values.has('better-auth.session_token'), false);
      assert.equal(jar.values.has('better-auth.session_data'), false);
      assert.equal((await jar.request(isolated.origin, '/api/session')).status, 401);
    } finally { await isolated.stop(); }
  }
});
