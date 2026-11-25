import assert from 'node:assert/strict';
import { access, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { startVerificationServer } from './server.ts';
import type { VerificationHandoff } from '../../lib/verification/operator.ts';
import { NONCE_COOKIE, VERIFICATION_COOKIE } from '../../lib/verification/cookies.ts';

test('compiled verification login, admission and conflict logout work without application, issuer, test or migration source', { timeout: 240000 }, async () => {
  // Historical override exists only in this test-process-owned build copy for a red reproduction.
  const revision = process.env.VERIFICATION_REPRO_AUTH_ROUTE_REVISION;
  if (revision !== undefined && revision !== 'd71806a') throw new Error('Unknown bounded logout reproduction revision');
  const fixture = await startVerificationServer({ stripRuntimeSources: true, overrideLogoutFromCommit: revision });
  try {
    for (const name of ['app', 'lib', 'scripts', 'tests', 'types', 'drizzle', 'proxy.ts']) await assert.rejects(access(join(fixture.runtimeDirectory, name)));
    await access(join(fixture.runtimeDirectory, '.next'));
    const entry = await fixture.request('/verification');
    assert.equal(entry.status, 200, 'compiled Proxy and page issue the native form');
    const nonce = entry.body.match(/<input[^>]*name="nonce"[^>]*value="([^"]+)"/)?.[1];
    assert.ok(nonce, 'server-rendered nonce exists');
    const nonceCookie = entry.headers['set-cookie']?.find(value => value.startsWith(`${NONCE_COOKIE}=`))?.split(';')[0];
    assert.ok(nonceCookie, 'server supplied its preflight cookie');
    const handoff = JSON.parse(await readFile(fixture.handoffPath, 'utf8')) as VerificationHandoff;
    const exchange = await fixture.request('/api/verification/session', { method: 'POST', headers: { Origin: fixture.origin, 'Content-Type': 'application/x-www-form-urlencoded', Cookie: nonceCookie }, body: new URLSearchParams({ runId: handoff.runId, capability: handoff.members[0].capability, nonce }).toString() });
    assert.equal(exchange.status, 303, 'compiled exchange consumes the issuer credential');
    await unlink(fixture.handoffPath);
    const copiedCookie = exchange.headers['set-cookie']?.find(value => value.startsWith(`${VERIFICATION_COOKIE}=`))?.split(';')[0];
    assert.ok(copiedCookie, 'server supplied a verification session');
    assert.equal((await fixture.request('/api/session', { headers: { Cookie: copiedCookie } })).status, 200);
    const home = await fixture.request('/', { headers: { Cookie: copiedCookie } });
    assert.equal(home.status, 200);
    assert.match(home.body, /recipe-query/);
    const conflicting = `${copiedCookie}; __Secure-better-auth.session_data.0=stale-google-cookie`;
    assert.equal((await fixture.request('/api/session', { headers: { Cookie: conflicting } })).status, 401, 'conflicting identities never gain admission');
    const logout = await fixture.request('/api/auth/sign-out', { method: 'POST', headers: { Origin: fixture.origin, 'Content-Type': 'application/json', Cookie: conflicting }, body: '{}' });
    assert.equal(logout.status, 200, 'same-origin logout remains possible despite lost admission');
    assert.equal((await fixture.request('/api/session', { headers: { Cookie: copiedCookie } })).status, 401, 'the copied verification cookie must lose admission after conflicting-cookie logout');
    assert.equal((await fixture.ownerDb.one<{ n: number }>('SELECT count(*) AS n FROM verification_sessions WHERE run_id=$1 AND revoked_at IS NOT NULL', [fixture.run.runId]))?.n, 1, 'logout revoked the actual persisted verification session');
  } finally { await fixture.stop(); }
});
