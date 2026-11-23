import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { startServer } from './server.ts';

let server: Awaited<ReturnType<typeof startServer>>;
before(async () => { server = await startServer(); });
after(async () => { await server?.stop(); });

test('anonymous pages and direct endpoints require authentication', async () => {
  const requestHeaders: Record<string, string>[] = [{}, { RSC: '1', 'Next-Router-Prefetch': '1' }, { 'x-middleware-subrequest': 'proxy:proxy:proxy:proxy:proxy' }];
  for (const path of ['/', '/private.csv', '/unknown/nested', '/sign-out']) {
    for (const headers of requestHeaders) {
      const response = await fetch(`${server.origin}${path}`, { redirect: 'manual', headers });
      assert.equal(response.status, 307, path);
      assert.equal(new URL(response.headers.get('location') ?? '', server.origin).href, `${server.origin}/sign-in`);
      assert.doesNotMatch(await response.text(), /<h1[^>]*>Meal Planner/);
      assert.match(response.headers.get('cache-control') ?? '', /no-store/);
      const csp = response.headers.get('content-security-policy') ?? '';
      assert.match(csp, /script-src 'self' 'nonce-/);
      assert.doesNotMatch(csp, /unsafe-eval/);
    }
  }
  for (const path of ['/api', '/api/session', '/api/nested/private.json', '/api/auth/get-session']) {
    const response = await fetch(`${server.origin}${path}`, { redirect: 'manual' });
    assert.equal(response.status, 401, path);
    assert.deepEqual(await response.json(), { error: 'Unauthorized' });
  }
  const action = await fetch(server.origin, { method: 'POST', headers: { 'Next-Action': 'unknown' } });
  assert.equal(action.status, 401);
});

test('arbitrary cookies cannot grant access', async () => {
  for (const cookie of ['better-auth.session_token=made-up', 'better-auth.session_data=forged', 'better-auth.session_token=%E0%A4%A; better-auth.session_data=wrong']) {
    const response = await fetch(`${server.origin}/api/session`, { headers: { Cookie: cookie } });
    assert.equal(response.status, 401);
  }
});

test('missing or invalid authentication configuration fails closed', async () => {
  const invalidConfigs: Record<string, string>[] = [{ GOOGLE_CLIENT_SECRET: '' }, { BETTER_AUTH_SECRET: 'short' }, { BETTER_AUTH_URL: 'http://example.com' }];
  for (const overrides of invalidConfigs) {
    const unavailable = await startServer(overrides);
    try {
      for (const path of ['/', '/api/session', '/sign-in']) {
        const response = await fetch(`${unavailable.origin}${path}`, { redirect: 'manual' });
        assert.equal(response.status, 503);
        assert.deepEqual(await response.json(), { error: 'Authentication unavailable' });
      }
    } finally { await unavailable.stop(); }
  }
});

test('HTTPS configuration issues Secure, host-only HttpOnly OAuth state cookies', async () => {
  const secure = await startServer((origin) => ({ BETTER_AUTH_URL: origin.replace('http:', 'https:') }));
  try {
    const response = await fetch(`${secure.origin}/api/auth/sign-in/social`, {
      method: 'POST', headers: { Origin: secure.origin.replace('http:', 'https:'), 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'google' }),
    });
    assert.equal(response.status, 200);
    const cookies = response.headers.getSetCookie();
    assert.ok(cookies.length);
    for (const cookie of cookies) {
      assert.match(cookie, /; Secure(?:;|$)/i);
      assert.match(cookie, /HttpOnly/i);
      assert.match(cookie, /SameSite=Lax/i);
      assert.doesNotMatch(cookie, /Domain=/i);
    }
  } finally { await secure.stop(); }
});
