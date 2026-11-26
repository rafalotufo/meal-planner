import assert from 'node:assert/strict';
import { test } from 'node:test';
import { schedulerResponse, type SchedulerDependencies } from '../../lib/plans/scheduler.ts';
import { dueWeek } from '../../lib/plans/calendar.ts';
import { openVerificationDatabase } from '../../lib/db/connection.ts';
import { provisionFamily } from '../../lib/family-store.ts';
import { saveMenuRecipe } from '../../lib/menu/store.ts';
import { actOnPlan } from '../../lib/plans/store.ts';
import { restrictedMenuDatabase } from '../menu/database.ts';

const secret = 'a'.repeat(64);
const origin = 'https://meal-planner-staging-rafalotufos.vercel.app';
const configuration = {
  MEAL_PLAN_SCHEDULER_ENABLED: 'true', CRON_SECRET: secret, MEAL_PLAN_DRAFT_DAY: 'Wednesday',
  MEAL_PLAN_SCHEDULER_ORIGIN: origin, BETTER_AUTH_URL: origin,
  VERCEL_PROJECT_ID: 'prj_ntxXnJAVA977jHjLNDR7xJuwSx4V', VERCEL_ENV: 'preview',
  VERCEL_URL: 'meal-planner-own-preview.vercel.app',
};
function request(method = 'GET', headers: Record<string, string> = {}, path = '/api/plans/generate') {
  return new Request(origin + path, { method, headers: { Host: new URL(origin).host, Authorization: 'Bearer ' + secret, ...headers } });
}
function dependencies(env: SchedulerDependencies['env'] = configuration): SchedulerDependencies {
  return { env, allowed: [], now: () => new Date('2026-11-26T14:00:00Z'), db: async () => { throw new Error('Unexpected database admission sensitive-fixture'); }, event: () => {} };
}
function protectedResponse(response: Response) {
  assert.match(response.headers.get('cache-control') ?? '', /private.*no-store/);
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.match(response.headers.get('content-security-policy') ?? '', /default-src 'none'/);
  assert.equal(response.headers.get('strict-transport-security'), 'max-age=31536000');
  assert.equal(response.headers.get('set-cookie'), null);
}
test('machine boundary fails closed before DB admission on all methods and malformed configuration', async () => {
  for (const method of ['GET', 'HEAD', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE']) {
    for (const authorization of ['', 'Bearer undefined', 'bearer ' + secret, 'Bearer ' + 'b'.repeat(64), 'Bearer ' + secret + ', Bearer ' + secret, 'Bearer ' + 'x'.repeat(1000)]) {
      const response = await schedulerResponse(request(method, { Authorization: authorization, Cookie: 'better-auth.session_data=forged; mp_verification=forged', 'User-Agent': 'vercel-cron/1.0' }), dependencies());
      assert.equal(response.status, 401); protectedResponse(response);
    }
    const wrongHost = await schedulerResponse(request(method, { Host: 'attacker.test', 'x-forwarded-host': new URL(origin).host }), dependencies());
    assert.equal(wrongHost.status, 421); protectedResponse(wrongHost);
    const response = await schedulerResponse(request(method), dependencies());
    assert.equal(response.status, method === 'GET' ? 200 : 405); protectedResponse(response);
    if (method !== 'GET') assert.equal(response.headers.get('allow'), 'GET');
  }
  for (const flag of [undefined, 'false']) {
    assert.equal((await schedulerResponse(request(), dependencies({ ...configuration, MEAL_PLAN_SCHEDULER_ENABLED: flag }))).status, 404);
  }
  for (const change of [
    { MEAL_PLAN_SCHEDULER_ENABLED: '' }, { MEAL_PLAN_SCHEDULER_ENABLED: 'TRUE' },
    { CRON_SECRET: '' }, { CRON_SECRET: 'undefined' }, { CRON_SECRET: 'x'.repeat(64) },
    { MEAL_PLAN_DRAFT_DAY: undefined }, { MEAL_PLAN_DRAFT_DAY: 'Thursday' },
    { VERCEL_PROJECT_ID: 'other-project' }, { VERCEL_ENV: 'development' },
    { MEAL_PLAN_SCHEDULER_ORIGIN: origin + '/' }, { MEAL_PLAN_SCHEDULER_ORIGIN: origin + ':443' },
    { MEAL_PLAN_SCHEDULER_ORIGIN: 'https://attacker.test' }, { BETTER_AUTH_URL: 'https://attacker.test' },
  ]) {
    const response = await schedulerResponse(request(), dependencies({ ...configuration, ...change }));
    assert.equal(response.status, 503); assert.doesNotMatch(await response.text(), /sensitive|fixture|undefined|project|secret/i);
  }
});
test('exact target and body declarations reject overrides; valid offday skips without opening storage', async () => {
  for (const path of ['/api/plans/generate/', '/api/plans/generate?date=2026-11-25', '/api/plans/generate?', '/api/plans/generate?family=forged', '/api/plans/GENERATE']) {
    assert.equal((await schedulerResponse(request('GET', {}, path), dependencies())).status, 400);
  }
  const declarations: Record<string, string>[] = [{ 'Content-Length': '0' }, { 'Transfer-Encoding': 'chunked' }];
  for (const headers of declarations) {
    assert.equal((await schedulerResponse(request('GET', headers), dependencies())).status, 400);
  }
  const response = await schedulerResponse(request(), dependencies());
  assert.deepEqual(await response.json(), { skipped: true, created: 0, existing: 0, empty: 0, ineligible: 0 });
  assert.equal((await schedulerResponse(request(), { ...dependencies(), allowed: ['invalid-policy'] })).status, 503);
  const controller = new AbortController(); controller.abort();
  const aborted = new Request(request(), { signal: controller.signal });
  assert.equal((await schedulerResponse(aborted, dependencies())).status, 503);
  const due = await schedulerResponse(request(), { ...dependencies(), now: () => new Date('2026-11-25T14:00:00Z') });
  assert.equal(due.status, 503); assert.doesNotMatch(await due.text(), /sensitive|fixture|database/i);
});
test('Wednesday 09 Eastern uses correct UTC boundary across seasons and year rollover', () => {
  for (const [before, at, week] of [
    ['2026-11-25T13:59:59Z', '2026-11-25T14:00:00Z', '2026-11-29'],
    ['2026-07-01T12:59:59Z', '2026-07-01T13:00:00Z', '2026-07-05'],
    ['2026-12-30T13:59:59Z', '2026-12-30T14:00:00Z', '2027-01-03'],
  ]) {
    assert.equal(dueWeek(new Date(before), 'Wednesday'), null);
    assert.equal(dueWeek(new Date(at), 'Wednesday'), week);
  }
  assert.equal(dueWeek(new Date('2026-11-26T14:00:00Z'), 'Wednesday'), null);
});
test('Production keeps its fixed service origin distinct from the browser canonical origin', async () => {
  const machine = 'https://meal-planner-rafalotufos-projects.vercel.app';
  const env = { ...configuration, VERCEL_ENV: 'production', BETTER_AUTH_URL: 'https://lotufo-meals.vercel.app', MEAL_PLAN_SCHEDULER_ORIGIN: machine };
  assert.equal((await schedulerResponse(request('GET', { Host: new URL(machine).host }), dependencies(env))).status, 200);
  assert.equal((await schedulerResponse(request('GET', { Host: 'lotufo-meals.vercel.app' }), dependencies(env))).status, 421);
  for (const invalidOrigin of ['https://lotufo-meals.vercel.app', 'https://arbitrary-deployment.vercel.app']) {
    assert.equal((await schedulerResponse(request(), dependencies({ ...env, MEAL_PLAN_SCHEDULER_ORIGIN: invalidOrigin }))).status, 503);
  }
});
test('only this deployment generated Host joins the stable machine Host before independent Bearer checks', async () => {
  for (const environment of ['preview', 'production']) {
    const stable = environment === 'preview' ? origin : 'https://meal-planner-rafalotufos-projects.vercel.app';
    const own = `meal-planner-own-${environment}.vercel.app`;
    const env = { ...configuration, VERCEL_ENV: environment, VERCEL_URL: own, MEAL_PLAN_SCHEDULER_ORIGIN: stable,
      BETTER_AUTH_URL: environment === 'preview' ? origin : 'https://lotufo-meals.vercel.app' };
    const deps = dependencies(env);
    const anonymous = await schedulerResponse(request('GET', { Host: own, Authorization: '' }), deps);
    assert.equal(anonymous.status, 401, 'the registered generated cron target must reach authentication instead of421');
    protectedResponse(anonymous);
    for (const host of [new URL(stable).host, own]) {
      for (const method of ['GET', 'HEAD', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE']) {
        const rejected = await schedulerResponse(request(method, { Host: host, Authorization: 'Bearer ' + 'b'.repeat(64) }), deps);
        assert.equal(rejected.status, 401); protectedResponse(rejected);
        const response = await schedulerResponse(request(method, { Host: host, 'x-forwarded-host': 'attacker.test' }), deps);
        assert.equal(response.status, method === 'GET' ? 200 : 405); protectedResponse(response);
        if (method === 'GET') assert.deepEqual(await response.json(), { skipped: true, created: 0, existing: 0, empty: 0, ineligible: 0 });
        else assert.equal(response.headers.get('allow'), 'GET');
      }
    }
    for (const host of ['meal-planner-other-deployment.vercel.app', 'sibling-project.vercel.app', own + '.attacker.test', 'attacker.test']) {
      const response = await schedulerResponse(request('GET', { Host: host, 'x-forwarded-host': own, 'x-vercel-forwarded-host': own }), deps);
      assert.equal(response.status, 421); protectedResponse(response);
    }
    assert.equal((await schedulerResponse(request('GET', { Host: own }, '/api/plans/generate?date=2026-11-25'), deps)).status, 400);
  }
});
test('missing or noncanonical generated deployment metadata fails closed for either machine Host', async () => {
  const own = configuration.VERCEL_URL;
  const invalid: (string | undefined)[] = [undefined, '', 'vercel.app', '.vercel.app', 'https://' + own, own + ':443',
    own + '/', 'user@' + own, own + '?query=1', own + '#fragment', own + '.', '.' + own, own.toUpperCase(),
    ' ' + own, own + ' ', own + '\n', '*.' + own, 'own..vercel.app', '-own.vercel.app', 'own-.vercel.app',
    'own_name.vercel.app', 'é.vercel.app', 'own\n.vercel.app', 'own\r.vercel.app', 'own\u2028.vercel.app',
    'a'.repeat(64) + '.vercel.app', `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(63)}.vercel.app`];
  for (const value of invalid) {
    for (const host of [new URL(origin).host, own]) {
      const response = await schedulerResponse(request('GET', { Host: host }), dependencies({ ...configuration, VERCEL_URL: value }));
      assert.equal(response.status, 503); protectedResponse(response);
      assert.deepEqual(await response.json(), { error: 'Scheduler unavailable' });
    }
  }
  const longestLabel = 'a'.repeat(63) + '.vercel.app';
  assert.equal((await schedulerResponse(request('GET', { Host: longestLabel }), dependencies({ ...configuration, VERCEL_URL: longestLabel }))).status, 200);
});
test('authorized due service uses restricted storage and concurrent retries preserve the final plan', async () => {
  const fixture = await restrictedMenuDatabase(); const db = await fixture.open();
  const identity = { googleSubject: 'scheduler-fixture', email: 'weekly.scheduler@gmail.com', emailVerified: true as const };
  const events: object[] = []; const now = new Date('2026-11-25T14:00:00Z');
  const opened: Awaited<ReturnType<typeof openVerificationDatabase>>[] = [];
  try {
    await provisionFamily(db, identity, [identity.email], false);
    await saveMenuRecipe(db, identity, [identity.email], { title: 'Private fixture dinner', summary: 'Private fixture method.', sourceUrl: 'https://example.test/scheduler', imageUrl: null, time: null });
    const deps: SchedulerDependencies = { env: configuration, allowed: [identity.email], now: () => now,
      db: async deadline => { const connection = await openVerificationDatabase(fixture.runtimeUrl, deadline); opened.push(connection); return connection; }, event: entry => events.push(entry) };
    const responses = await Promise.all([schedulerResponse(request('GET', { Host: configuration.VERCEL_URL }), deps), schedulerResponse(request(), deps)]);
    for (const response of responses) assert.equal(response.status, 200);
    const counts = await Promise.all(responses.map(response => response.json()));
    assert.equal(counts.reduce((total: number, result: { created: number }) => total + result.created, 0), 1);
    assert.equal(counts.reduce((total: number, result: { existing: number }) => total + result.existing, 0), 1);
    for (const connection of opened) await assert.rejects(connection.all('SELECT 1'), /pool after calling end/);
    const plan = await db.one<{ id: string }>('SELECT id FROM meal_plan_weeks'); assert.ok(plan);
    await actOnPlan(db, identity, [identity.email], plan.id, { action: 'finalize', revision: 1 }, now);
    const before = await db.one('SELECT * FROM meal_plan_weeks WHERE id=$1', [plan.id]);
    assert.equal((await (await schedulerResponse(request(), deps)).json()).existing, 1);
    assert.deepEqual(await db.one('SELECT * FROM meal_plan_weeks WHERE id=$1', [plan.id]), before);
    assert.equal(events.length, 3);
    assert.doesNotMatch(JSON.stringify(events), /Private|fixture|google|example.test|family|secret|postgres/);
    assert.doesNotMatch(JSON.stringify(events), new RegExp(secret));
  } finally { await db.close(); await fixture.cleanup(); }
});
