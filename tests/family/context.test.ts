import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CookieJar, startServer } from '../auth/server.ts';

test('public invitation context is uniform, bounded and cannot expose invitation data', async () => {
  const server = await startServer({}, true);
  try {
    const jar = new CookieJar();
    const set = (token: string, origin = server.origin) => jar.request(server.origin, '/api/invitation-context', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
    const response = await set('a'.repeat(43)); assert.equal(response.status, 204);
    assert.equal(await response.text(), '');
    const cookie = response.headers.getSetCookie()[0]; assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Lax/); assert.match(cookie, /Path=\//); assert.doesNotMatch(cookie, /Domain=/);
    assert.equal((await set('b'.repeat(43))).status, 204);
    assert.equal((await set('short')).status, 400);
    assert.equal((await set('a'.repeat(43), 'https://evil.example')).status, 403);
    assert.equal((await jar.request(server.origin, '/api/session')).status, 401);
    const shell = await jar.request(server.origin, '/invite'); assert.equal(shell.status, 200); assert.doesNotMatch(await shell.text(), /recipient_email|token_hash/);
  } finally { await server.stop(); }
});
