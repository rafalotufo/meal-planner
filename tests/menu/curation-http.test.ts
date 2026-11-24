import assert from 'node:assert/strict';
import { test } from 'node:test';
import { symmetricDecodeJWT, symmetricEncodeJWT } from 'better-auth/crypto';
import { CookieJar } from '../auth/server.ts';
import { provision, signInWithGoogle } from '../auth/flow.ts';
import { post } from '../family/http.ts';
import { startCurationServer } from './curation-server.ts';
import { parseMenuPage, parseSavedMenuEntry } from '../../lib/menu/validation.ts';

async function member(s: Awaited<ReturnType<typeof startCurationServer>>, code = 'test-code') {
  const jar = new CookieJar(); await signInWithGoogle(s.server.origin, jar, code);
  assert.equal((await provision(s.server.origin, jar)).status, 200); return jar;
}
async function entry(s: Awaited<ReturnType<typeof startCurationServer>>, jar: CookieJar, id: string) {
  const response = await jar.request(s.server.origin, '/api/menu'); assert.equal(response.status, 200);
  const page = parseMenuPage(await response.json()); assert.ok(page); return page.entries.find(item => item.id === id);
}
async function settled(s: Awaited<ReturnType<typeof startCurationServer>>, jar: CookieJar, id: string, state: string) {
  for (let attempt = 0; attempt < 100; attempt++) {
    const value = await entry(s, jar, id); if (value?.curation.state === state) return value;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  assert.fail('Curation did not reach expected state: ' + state);
}
function privateHeaders(response: Response) {
  assert.match(response.headers.get('cache-control') ?? '', /private.*no-store/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'DENY');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
}

test('real HTTP commits a saved link before stalled publisher finishes, then fills that same entry', async () => {
  const s = await startCurationServer();
  try {
    const jar = await member(s); s.set('/stalled', 'stall');
    const response = await post(s.server.origin, jar, '/api/menu?import=url', { sourceUrl: s.source('/stalled') });
    assert.equal(response.status, 200); privateHeaders(response);
    const saved = await response.json(); assert.equal(saved.created, true);
    assert.ok(parseSavedMenuEntry(saved.entry)); assert.equal(saved.entry.curation.state, 'pending');
    await s.waitForRequest('/stalled');
    assert.equal((await entry(s, jar, saved.entry.id))?.recipe.title, 'Saved recipe link');
    const duplicate = await post(s.server.origin, jar, '/api/menu?import=url', { sourceUrl: s.source('/stalled') });
    assert.equal((await duplicate.json()).created, false); assert.equal(s.requests('/stalled'), 1);
    s.release('/stalled');
    const ready = await settled(s, jar, saved.entry.id, 'ready');
    assert.equal(ready.id, saved.entry.id); assert.equal(ready.savedAt, saved.entry.savedAt);
    assert.equal(ready.recipe.title, 'Imported fixture recipe'); assert.equal(ready.recipe.summary, 'A fixture recipe summary.');
    assert.deepEqual(ready.recipe.time, { kind: 'total', text: '20 minutes' });
    assert.equal(ready.recipe.imageUrl, 'https://images.recipe-fixture.test/photo.svg');
    assert.equal(s.requests('/stalled'), 1);
  } finally { await s.stop(); }
});

test('failed background details retain link, Retry runs once, and removal prevents stale completion', async () => {
  const s = await startCurationServer();
  try {
    const jar = await member(s); s.set('/recover', 'failure');
    const saved = await (await post(s.server.origin, jar, '/api/menu?import=url', { sourceUrl: s.source('/recover') })).json();
    await settled(s, jar, saved.entry.id, 'failed');
    s.set('/recover', 'stall');
    const retries = await Promise.all(Array.from({ length: 4 }, () => post(s.server.origin, jar, '/api/menu?curate=retry', { id: saved.entry.id })));
    const replies = await Promise.all(retries.map(response => response.json()));
    assert.equal(replies.filter(value => value.started).length, 1);
    await s.waitForRequest('/recover', 2); assert.equal(s.requests('/recover'), 2);
    assert.equal((await post(s.server.origin, jar, `/api/menu/${saved.entry.id}/remove`)).status, 200);
    s.release('/recover');
    assert.equal(await entry(s, jar, saved.entry.id), undefined);
    const replacement = await (await post(s.server.origin, jar, '/api/menu?import=url', { sourceUrl: s.source('/recover') })).json();
    assert.notEqual(replacement.entry.id, saved.entry.id); s.release('/recover');
    await settled(s, jar, replacement.entry.id, 'ready');
  } finally { await s.stop(); }
});

test('import/retry guards reject unsafe methods, cross-family IDs and malformed bodies before publisher work', async () => {
  const s = await startCurationServer();
  try {
    const jar = await member(s);
    for (const body of [{ sourceUrl: 'https://127.0.0.1/recipe' }, { sourceUrl: s.source('/never'), familyId: 'forged' }, { sourceUrl: s.source('/never'), extra: true }]) {
      const response = await post(s.server.origin, jar, '/api/menu?import=url', body); assert.equal(response.status, 400); privateHeaders(response);
    }
    for (const query of ['?import=url&import=url', '?import=url&lookup=saved', '?curate=retry&import=url']) assert.equal((await post(s.server.origin, jar, '/api/menu' + query, { sourceUrl: s.source('/never') })).status, 400);
    const anonymous = await post(s.server.origin, new CookieJar(), '/api/menu?import=url', { sourceUrl: s.source('/never') }); assert.equal(anonymous.status, 401); privateHeaders(anonymous);
    const foreignOrigin = await jar.request(s.server.origin, '/api/menu?import=url', { method: 'POST', headers: { Origin: 'https://attacker.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceUrl: s.source('/never') }) });
    assert.equal(foreignOrigin.status, 403);
    for (const method of ['GET', 'HEAD', 'PUT', 'OPTIONS']) {
      const response = await jar.request(s.server.origin, '/api/menu?import=url', { method }); assert.equal(response.status, method === 'GET' || method === 'HEAD' ? 400 : 405); privateHeaders(response);
    }
    assert.equal(s.requests('/never'), 0);
    s.set('/failed', 'failure'); const saved = await (await post(s.server.origin, jar, '/api/menu?import=url', { sourceUrl: s.source('/failed') })).json();
    await settled(s, jar, saved.entry.id, 'failed');
    const other = await member(s, 'second-member');
    const hidden = await post(s.server.origin, other, '/api/menu?curate=retry', { id: saved.entry.id }); assert.equal(hidden.status, 404);
    assert.equal(s.requests('/failed'), 1);
  } finally { await s.stop(); }
});

async function limitedCredentials(jar: CookieJar, secret: string, sessionMilliseconds: number, jwtSeconds: number) {
  const cookie = jar.values.get('better-auth.session_data'); assert.ok(cookie);
  const decoded = await symmetricDecodeJWT<{ session: Record<string, unknown>; user: Record<string, unknown> }>(decodeURIComponent(cookie), secret, 'better-auth-session'); assert.ok(decoded);
  const sessionExpiry = Date.now() + sessionMilliseconds;
  const replacement = await symmetricEncodeJWT({ ...decoded, session: { ...decoded.session, expiresAt: new Date(sessionExpiry).toISOString() } }, secret, 'better-auth-session', jwtSeconds);
  const verified = await symmetricDecodeJWT<{ exp: number }>(replacement, secret, 'better-auth-session'); assert.ok(verified);
  const copy = new CookieJar(); copy.values = new Map(jar.values); copy.values.set('better-auth.session_data', replacement);
  return { jar: copy, expiry: Math.min(sessionExpiry, verified.exp * 1000) };
}

test('real save and Retry delegate only through the earlier verified session or JWE expiry', async () => {
  const s = await startCurationServer();
  try {
    const original = await member(s);
    for (const [kind, sessionMs, jwtSeconds] of [['session', 10000, 60], ['jwe', 60000, 10]] as const) {
      const first = await limitedCredentials(original, s.server.secret, sessionMs, jwtSeconds);
      const path = '/expiry-' + kind; s.set(path, 'stall');
      const response = await post(s.server.origin, first.jar, '/api/menu?import=url', { sourceUrl: s.source(path) });
      assert.equal(response.status, 200); const saved = await response.json(); await s.waitForRequest(path);
      const task = await s.db.one<{ expires_at: number; credential_expires_at: number }>('SELECT expires_at,credential_expires_at FROM menu_recipe_curations WHERE entry_id=$1', [saved.entry.id]);
      assert.ok(task); assert.equal(task.credential_expires_at, first.expiry); assert.ok(task.expires_at <= first.expiry);
      await s.db.execute('UPDATE menu_recipe_curations SET expires_at=scheduled_at WHERE entry_id=$1', [saved.entry.id]);
      const interrupted = await entry(s, original, saved.entry.id); assert.equal(interrupted?.curation.state, 'interrupted');
      assert.equal((await s.db.one<{state:string}>('SELECT state FROM menu_recipe_curations WHERE entry_id=$1', [saved.entry.id]))?.state, 'processing', 'GET derives interruption without persisting it');
      const next = await limitedCredentials(original, s.server.secret, sessionMs, jwtSeconds);
      const retry = await post(s.server.origin, next.jar, '/api/menu?curate=retry', { id: saved.entry.id }); assert.equal(retry.status, 200); assert.equal((await retry.json()).started, true);
      await s.waitForRequest(path, 2);
      const retried = await s.db.one<{ credential_expires_at: number }>('SELECT credential_expires_at FROM menu_recipe_curations WHERE entry_id=$1', [saved.entry.id]);
      assert.equal(retried?.credential_expires_at, next.expiry);
      s.release(path); await settled(s, original, saved.entry.id, 'ready');
    }
  } finally { await s.stop(); }
});

test('membership changing during publisher acquisition prevents stale metadata completion', async () => {
  const s = await startCurationServer();
  try {
    const jar = await member(s); s.set('/lost-family', 'stall');
    const response = await post(s.server.origin, jar, '/api/menu?import=url', { sourceUrl: s.source('/lost-family') });
    assert.equal(response.status, 200); const saved = await response.json(); await s.waitForRequest('/lost-family');
    await s.db.execute('INSERT INTO families (id,created_at) VALUES ($1,$2)', ['changed-curation-family', Date.now()]);
    await s.db.execute('UPDATE app_users SET family_id=$1 WHERE google_subject=$2', ['changed-curation-family', 'fixture-user']);
    s.release('/lost-family');
    for (let attempt = 0; attempt < 100; attempt++) {
      const task = await s.db.one<{state:string}>('SELECT state FROM menu_recipe_curations WHERE entry_id=$1', [saved.entry.id]);
      if (task?.state === 'failed') break;
      await new Promise(resolve => setTimeout(resolve, 25));
    }
    assert.equal((await s.db.one<{state:string}>('SELECT state FROM menu_recipe_curations WHERE entry_id=$1', [saved.entry.id]))?.state, 'failed');
    assert.equal((await s.db.one<{title:string}>('SELECT title FROM menu_recipes WHERE id=$1', [saved.entry.id]))?.title, 'Saved recipe link');
    assert.deepEqual((await (await jar.request(s.server.origin, '/api/menu')).json()).entries, []);
  } finally { await s.stop(); }
});

test('saved links resolving privately or to mixed DNS never start native publisher requests', async () => {
  const s = await startCurationServer();
  try {
    const jar = await member(s);
    for (const host of ['private-recipes.example.test', 'mixed-recipes.example.test']) {
      const response = await post(s.server.origin, jar, '/api/menu?import=url', { sourceUrl: 'https://' + host + '/unsafe-dns' });
      assert.equal(response.status, 200); const saved = await response.json();
      const failed = await settled(s, jar, saved.entry.id, 'failed');
      assert.equal(failed.recipe.sourceUrl, 'https://' + host + '/unsafe-dns');
      assert.equal(failed.recipe.title, 'Saved recipe link');
    }
    assert.equal(s.requests('/unsafe-dns'), 0);
  } finally { await s.stop(); }
});
