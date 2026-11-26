import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';
import { test } from 'node:test';
import { startServer } from '../auth/server.ts';
import { SCHEDULER_PREVIEW_ORIGIN, SCHEDULER_PROJECT } from '../../lib/plans/scheduler.ts';
import { dueWeek } from '../../lib/plans/calendar.ts';
import { GET } from '../../app/api/plans/generate/route.ts';

function call(url: string, headers: Record<string, string>, method = 'GET'): Promise<Response> {
  return new Promise((resolve, reject) => {
    const request = httpRequest(url, { method, headers }, response => {
      const chunks: Buffer[] = []; response.on('data', (part: Buffer) => chunks.push(part));
      response.on('end', () => resolve(new Response(Buffer.concat(chunks), { status: response.statusCode, headers: response.headers as Record<string, string> })));
    });
    request.on('error', reject); request.end();
  });
}

const secret = 'c'.repeat(64);
const generatedHost = 'meal-planner-own-http-fixture.vercel.app';
const env = { MEAL_PLAN_SCHEDULER_ENABLED: 'true', MEAL_PLAN_DRAFT_DAY: 'Wednesday', CRON_SECRET: secret,
  MEAL_PLAN_SCHEDULER_ORIGIN: SCHEDULER_PREVIEW_ORIGIN, BETTER_AUTH_URL: SCHEDULER_PREVIEW_ORIGIN,
  VERCEL_ENV: 'preview', VERCEL_PROJECT_ID: SCHEDULER_PROJECT, VERCEL_URL: generatedHost,
  DATABASE_URL: 'postgresql://fixture:unreachable@127.0.0.1:1/unavailable' };
test('route retains exactly the same bounded response work in the Fluid request lifetime', async () => {
  const key = Symbol.for('@vercel/request-context'); const prior = Reflect.get(globalThis, key);
  const flag = process.env.MEAL_PLAN_SCHEDULER_ENABLED; const pending: Promise<unknown>[] = [];
  Reflect.set(globalThis, key, { get: () => ({ waitUntil: (work: Promise<unknown>) => { pending.push(work); } }) });
  process.env.MEAL_PLAN_SCHEDULER_ENABLED = 'false';
  try {
    const work = GET(new Request('https://example.test/api/plans/generate'));
    assert.equal(pending.length, 1); assert.equal(pending[0], work, 'no duplicate generator or detached cleanup task');
    assert.equal((await work).status, 404); await Promise.all(pending);
  } finally {
    if (prior === undefined) Reflect.deleteProperty(globalThis, key); else Reflect.set(globalThis, key, prior);
    if (flag === undefined) delete process.env.MEAL_PLAN_SCHEDULER_ENABLED; else process.env.MEAL_PLAN_SCHEDULER_ENABLED = flag;
  }
});
test('built exact scheduler route owns all-method machine guards while neighboring paths retain Proxy', async () => {
  const server = await startServer(env);
  try {
    const headers = { Host: new URL(SCHEDULER_PREVIEW_ORIGIN).host, Authorization: 'Bearer ' + secret };
    for (const method of ['GET', 'HEAD', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE']) {
      const anonymous = await call(server.origin + '/api/plans/generate', { Host: headers.Host }, method);
      assert.equal(anonymous.status, 401); assert.equal(anonymous.headers.get('x-frame-options'), 'DENY');
      const authorized = await call(server.origin + '/api/plans/generate', headers, method);
      // Actual Wednesday enters storage and returns503 against the intentionally unreachable URL.
      assert.equal(authorized.status, method === 'GET' ? dueWeek(new Date(), 'Wednesday') ? 503 : 200 : 405, method);
      assert.equal(authorized.headers.get('x-frame-options'), 'DENY');
      assert.match(authorized.headers.get('content-security-policy') ?? '', /default-src 'none'/);
      if (method !== 'GET') assert.equal(authorized.headers.get('allow'), 'GET');
      else if (authorized.status === 200) assert.deepEqual(await authorized.json(), { skipped: true, created: 0, existing: 0, empty: 0, ineligible: 0 });
      const generatedAnonymous = await call(server.origin + '/api/plans/generate', { Host: generatedHost }, method);
      assert.equal(generatedAnonymous.status, 401); assert.equal(generatedAnonymous.headers.get('x-frame-options'), 'DENY');
      const generated = await call(server.origin + '/api/plans/generate', { ...headers, Host: generatedHost }, method);
      assert.equal(generated.status, authorized.status); assert.equal(generated.headers.get('x-frame-options'), 'DENY');
      assert.match(generated.headers.get('content-security-policy') ?? '', /default-src 'none'/);
    }
    assert.equal((await call(server.origin + '/api/plans/generate', { ...headers, Host: 'attacker.test', 'x-forwarded-host': headers.Host })).status, 421);
    assert.equal((await call(server.origin + '/api/plans/generate?date=2026-11-25', headers)).status, 400);
    assert.equal((await call(server.origin + '/api/plans/generate', { ...headers, Host: 'another-deployment.vercel.app', 'x-forwarded-host': generatedHost })).status, 421);
    assert.equal((await call(server.origin + '/api/plans/generate?date=2026-11-25', { ...headers, Host: generatedHost })).status, 400);
    for (const path of ['/', '/menu', '/api/menu', '/api/session', '/sign-in']) {
      assert.equal((await call(server.origin + path, { Host: generatedHost })).status, 421, 'ordinary canonical-host guards stay unchanged');
    }
    for (const path of ['/api/plans/generate/extra', '/api/plans/generatE']) {
      const response = await call(server.origin + path, headers);
      assert.equal(response.status, 401, path);
      assert.doesNotMatch(response.headers.get('content-security-policy') ?? '', /default-src 'none'/);
    }
    // Leave an anonymous upload unfinished: the exact handler must reject before body EOF.
    const status = await new Promise<number>((resolve, reject) => {
      const call = httpRequest(server.origin + '/api/plans/generate', { method: 'POST', headers: { Host: headers.Host, 'Content-Length': '1000000' } }, response => { resolve(response.statusCode ?? 0); response.resume(); call.destroy(); });
      call.on('error', error => { if (!call.destroyed) reject(error); });
      call.setTimeout(2500, () => { call.destroy(); reject(new Error('Exact scheduler guard buffered an unfinished body')); });
      call.write('x');
    });
    assert.equal(status, 401);
    assert.doesNotMatch(server.output(), new RegExp(secret));
  } finally { await server.stop(); }
});
test('built machine route rejects malformed own-deployment metadata for stable and generated Hosts', async () => {
  const server = await startServer({ ...env, VERCEL_URL: 'https://' + generatedHost });
  try {
    for (const Host of [new URL(SCHEDULER_PREVIEW_ORIGIN).host, generatedHost]) {
      const response = await call(server.origin + '/api/plans/generate', { Host, Authorization: 'Bearer ' + secret });
      assert.equal(response.status, 503); assert.equal(response.headers.get('x-frame-options'), 'DENY');
      assert.deepEqual(await response.json(), { error: 'Scheduler unavailable' });
    }
  } finally { await server.stop(); }
});
