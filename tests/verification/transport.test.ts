import assert from 'node:assert/strict';
import { test } from 'node:test';
import { request as httpsRequest } from 'node:https';
import { startVerificationServer } from './server.ts';

test('real pinned Next exchange returns a bounded 408 before unfinished body EOF without redeeming a capability', { timeout: 240000 }, async () => {
  const fixture = await startVerificationServer();
  try {
    const wrongHost = await fixture.request('/verification', { headers: { Host: 'untrusted.invalid' } });
    assert.equal(wrongHost.status, 421);
    assert.equal(wrongHost.headers['set-cookie'], undefined, 'wrong Host cannot receive a preflight cookie');
    const entry = await fixture.request('/verification', { headers: { 'x-mp-verification-nonce': 'forged-client-value' } });
    assert.equal(entry.status, 200);
    assert.equal(entry.body.includes('forged-client-value'), false, 'Proxy overwrites an incoming nonce header');
    assert.ok(entry.headers['set-cookie']?.some(value => value.startsWith('__Host-mp-verification-nonce=')));
    const method = await fixture.request('/api/verification/session');
    assert.equal(method.status, 405);
    assert.equal(method.headers.allow, 'POST');
    assert.ok(method.headers['content-security-policy']);
    for (const runId of [fixture.run.runId, '00000000-0000-4000-8000-000000000000']) {
      const started = Date.now();
      const status = await new Promise<number>((resolve, reject) => {
        const req = httpsRequest({ hostname: '127.0.0.1', port: fixture.httpsPort, servername: fixture.host, rejectUnauthorized: false,
          method: 'POST', path: '/api/verification/session', headers: { Host: fixture.host, Origin: fixture.origin, 'Content-Type': 'application/x-www-form-urlencoded' } }, response => {
          response.resume();
          response.once('end', () => { resolve(response.statusCode ?? 0); req.destroy(); });
        });
        req.once('error', reject);
        req.setTimeout(7500, () => req.destroy(new Error('Unfinished request exceeded the fixture deadline')));
        req.write(`runId=${encodeURIComponent(runId)}&capability=`);
        // Deliberately never call end(): the server must respond without body EOF.
      });
      assert.equal(status, 408);
      assert.ok(Date.now() - started < 6500, 'five-second handler deadline plus measured loopback transport tolerance');
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    assert.equal((await fixture.ownerDb.one<{ n: number }>('SELECT count(*) AS n FROM verification_sessions WHERE run_id=$1', [fixture.run.runId]))?.n, 0);
    assert.equal((await fixture.ownerDb.one<{ n: number }>('SELECT count(*) AS n FROM verification_capabilities WHERE run_id=$1 AND consumed_at IS NOT NULL', [fixture.run.runId]))?.n, 0);
  } finally { await fixture.stop(); }
});


test('real Next server in simulated Production rejects copied Preview configuration without issuing nonce or app sessions', { timeout: 240000 }, async () => {
  const fixture = await startVerificationServer({ runtimeTarget: 'production' });
  try {
    const entry = await fixture.request('/verification');
    assert.equal(entry.status, 404);
    assert.equal(entry.headers['set-cookie'], undefined);
    const exchange = await fixture.request('/api/verification/session', { method: 'POST', headers: { Origin: fixture.origin, 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ runId: fixture.run.runId, capability: fixture.run.members[0].capability, nonce: 'invalid' }).toString() });
    assert.equal(exchange.status, 404);
    assert.equal(exchange.headers['set-cookie'], undefined);
    assert.equal(exchange.headers['referrer-policy'], 'no-referrer');
    assert.equal((await fixture.ownerDb.one<{ n: number }>('SELECT count(*) AS n FROM verification_sessions WHERE run_id=$1', [fixture.run.runId]))?.n, 0);
  } finally { await fixture.stop(); }
});
