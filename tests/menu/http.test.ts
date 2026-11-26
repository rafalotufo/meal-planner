import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { request as httpRequest } from 'node:http';
import { test } from 'node:test';
import { symmetricDecodeJWT, symmetricEncodeJWT } from 'better-auth/crypto';
import { CookieJar, startServer } from '../auth/server.ts';
import { beginGoogle, provision, signInWithGoogle } from '../auth/flow.ts';
import { post } from '../family/http.ts';
import { parseSavedMenuEntry } from '../../lib/menu/validation.ts';
import { restrictedMenuDatabase } from './database.ts';

const recipe = { title: 'Lemony chickpeas', sourceUrl: 'https://example.test/recipe#method', imageUrl: 'https://images.example.test/photo.jpg', summary: 'Warm chickpeas and add lemon.', time: { kind: 'total', text: '20 minutes' } };
async function setup() {
  const fixture = await restrictedMenuDatabase();
  let server: Awaited<ReturnType<typeof startServer>> | undefined;
  try {
    server = await startServer({ DATABASE_URL: fixture.runtimeUrl }, true);
    const jar = new CookieJar(); await signInWithGoogle(server.origin, jar); assert.equal((await provision(server.origin, jar)).status, 200);
    const db = await fixture.open();
    return { fixture, server, jar, db, close: async () => { await db.close(); await server!.stop(); await fixture.cleanup(); } };
  } catch (error) { await server?.stop(); await fixture.cleanup(); throw error; }
}
async function errorResponse(response: Response, status: number, message: string) {
  assert.equal(response.status, status); assert.deepEqual(await response.json(), { error: message });
  assert.match(response.headers.get('cache-control') ?? '', /private.*no-store/);
}

test('bounded saved lookup finds older entries without listing, exposes only current-family matches and never writes', async () => {
  const s = await setup();
  try {
    for (let index = 0; index < 53; index++) assert.equal((await post(s.server.origin, s.jar, '/api/menu', { ...recipe, sourceUrl: `https://example.test/lookup/${index}` })).status, 200);
    const first = await (await s.jar.request(s.server.origin, '/api/menu')).json();
    assert.equal(first.entries.some((entry: {recipe: {sourceUrl: string}}) => entry.recipe.sourceUrl === 'https://example.test/lookup/0'), false);
    const lookup = await post(s.server.origin, s.jar, '/api/menu?lookup=saved', { sourceUrls: ['https://EXAMPLE.test/lookup/0#method', 'https://example.test/missing'] });
    assert.equal(lookup.status, 200);
    assert.deepEqual(await lookup.json(), { savedSourceUrls: ['https://example.test/lookup/0'] });
    securityHeaders(lookup.headers);
    const other = new CookieJar(); await signInWithGoogle(s.server.origin, other, 'second-member'); await provision(s.server.origin, other);
    assert.deepEqual(await (await post(s.server.origin, other, '/api/menu?lookup=saved', { sourceUrls: ['https://example.test/lookup/0'] })).json(), { savedSourceUrls: [] });
    for (const query of ['?lookup=wrong', '?lookup=saved&lookup=saved', '?lookup=saved&after=bad', '?lookup=saved&familyId=forged']) await errorResponse(await post(s.server.origin, s.jar, '/api/menu' + query, { sourceUrls: [recipe.sourceUrl] }), 400, 'Invalid request');
    for (const sourceUrls of [[], Array(7).fill(recipe.sourceUrl), [null], ['http://example.test/recipe'], ['https://127.0.0.1/recipe'], ['https://example.test/' + 'x'.repeat(2048)]]) await errorResponse(await post(s.server.origin, s.jar, '/api/menu?lookup=saved', { sourceUrls }), 400, 'Invalid request');
    for (const body of [{ sourceUrls: [recipe.sourceUrl], familyId: 'forged' }, recipe]) await errorResponse(await post(s.server.origin, s.jar, '/api/menu?lookup=saved', body), 400, 'Invalid request');
    await errorResponse(await post(s.server.origin, new CookieJar(), '/api/menu?lookup=saved', { sourceUrls: [recipe.sourceUrl] }), 401, 'Unauthorized');
    const forbidden = await s.jar.request(s.server.origin, '/api/menu?lookup=saved', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://attacker.test' }, body: JSON.stringify({ sourceUrls: [recipe.sourceUrl] }) });
    await errorResponse(forbidden, 403, 'Forbidden');
    assert.equal((await s.db.one<{n:number}>('SELECT count(*) AS n FROM menu_recipes'))?.n, 53);
  } finally { await s.close(); }
});
function securityHeaders(headers: Headers) {
  assert.match(headers.get('cache-control') ?? '', /private.*no-store/);
  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.equal(headers.get('referrer-policy'), 'no-referrer');
  assert.match(headers.get('content-security-policy') ?? '', /default-src 'self'/);
  assert.match(headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/);
}

test('real protected menu HTTP saves and lists persistent snapshots, deduplicates, and removes idempotently', async () => {
  const s = await setup();
  try {
    const created = await post(s.server.origin, s.jar, '/api/menu', recipe);
    assert.equal(created.status, 200); assert.match(created.headers.get('cache-control') ?? '', /private.*no-store/);
    const result = await created.json(); assert.equal(result.created, true); assert.ok(parseSavedMenuEntry(result.entry));
    assert.equal(result.entry.recipe.sourceUrl, 'https://example.test/recipe'); assert.equal(result.entry.recipe.imageUrl, recipe.imageUrl);
    const duplicate = await (await post(s.server.origin, s.jar, '/api/menu', { ...recipe, title: 'Replacement title', imageUrl: null })).json();
    assert.deepEqual(duplicate, { created: false, entry: result.entry });
    const page = await s.jar.request(s.server.origin, '/api/menu'); assert.equal(page.status, 200);
    assert.deepEqual(await page.json(), { entries: [result.entry], nextCursor: null });
    assert.equal((await s.jar.request(s.server.origin, '/api/menu', { method: 'HEAD' })).status, 200);
    assert.equal((await s.jar.request(s.server.origin, '/api/menu', { method: 'PUT' })).status, 405);
    assert.equal((await s.jar.request(s.server.origin, `/api/menu/${result.entry.id}/remove`)).status, 405);
    assert.equal((await s.db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 1);
    const restart = await startServer({ DATABASE_URL: s.fixture.runtimeUrl }, true);
    try {
      const fresh = new CookieJar(); await signInWithGoogle(restart.origin, fresh);
      assert.deepEqual(await (await fresh.request(restart.origin, '/api/menu')).json(), { entries: [result.entry], nextCursor: null });
    } finally { await restart.stop(); }
    for (let index = 0; index < 2; index++) {
      const removed = await post(s.server.origin, s.jar, `/api/menu/${result.entry.id}/remove`);
      assert.equal(removed.status, 200); assert.deepEqual(await removed.json(), { removed: true });
    }
    assert.deepEqual(await (await s.jar.request(s.server.origin, '/api/menu')).json(), { entries: [], nextCursor: null });
  } finally { await s.close(); }
});

test('anonymous, pending, denied and expired identities cannot access menu before body parsing', async () => {
  const s = await setup();
  try {
    for (const path of ['/api/menu', `/api/menu/${randomUUID()}/remove`]) {
      await errorResponse(await fetch(s.server.origin + path, { method: 'POST', headers: { 'Content-Type': 'text/plain', 'x-middleware-subrequest': 'proxy:proxy:proxy:proxy:proxy' }, body: 'bad' }), 401, 'Unauthorized');
    }
    await errorResponse(await fetch(s.server.origin + '/api/menu'), 401, 'Unauthorized');
    const pending = new CookieJar(); await signInWithGoogle(s.server.origin, pending, 'second-member');
    await errorResponse(await pending.request(s.server.origin, '/api/menu'), 403, 'Family membership required');
    await errorResponse(await post(s.server.origin, pending, '/api/menu', { deliberately: 'malformed' }), 403, 'Family membership required');
    const denied = new CookieJar(); await signInWithGoogle(s.server.origin, denied, 'unlisted');
    await errorResponse(await denied.request(s.server.origin, '/api/menu'), 401, 'Unauthorized');
    const cookie = s.jar.values.get('better-auth.session_data'); assert.ok(cookie);
    const decoded = await symmetricDecodeJWT<Record<string, unknown>>(decodeURIComponent(cookie), s.server.secret, 'better-auth-session'); assert.ok(decoded);
    const expired = new CookieJar(); expired.values = new Map(s.jar.values);
    expired.values.set('better-auth.session_data', await symmetricEncodeJWT(decoded, s.server.secret, 'better-auth-session', -60));
    await errorResponse(await expired.request(s.server.origin, '/api/menu'), 401, 'Unauthorized');
    assert.equal((await s.db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 0);
  } finally { await s.close(); }
});

test('menu stateless session guards reject missing/tampered caches and mismatched signed session tokens', async () => {
  const s = await setup();
  try {
    const cookie = s.jar.values.get('better-auth.session_data'); assert.ok(cookie);
    const decoded = await symmetricDecodeJWT<{ session: Record<string, unknown>; user: Record<string, unknown> }>(decodeURIComponent(cookie), s.server.secret, 'better-auth-session'); assert.ok(decoded);
    const replacements = [undefined, 'tampered-session-cache', await symmetricEncodeJWT(decoded, randomUUID() + randomUUID(), 'better-auth-session', 3600), await symmetricEncodeJWT({ ...decoded, session: { ...decoded.session, expiresAt: new Date(Date.now() - 60000).toISOString() } }, s.server.secret, 'better-auth-session', 3600), await symmetricEncodeJWT({ ...decoded, user: { ...decoded.user, googleSubject: undefined } }, s.server.secret, 'better-auth-session', 3600), await symmetricEncodeJWT({ ...decoded, user: { ...decoded.user, emailVerified: false } }, s.server.secret, 'better-auth-session', 3600)];
    for (const replacement of replacements) {
      const invalid = new CookieJar(); invalid.values = new Map(s.jar.values);
      if (replacement === undefined) invalid.values.delete('better-auth.session_data'); else invalid.values.set('better-auth.session_data', replacement);
      await errorResponse(await invalid.request(s.server.origin, '/api/menu'), 401, 'Unauthorized');
    }
    const other = new CookieJar(); await signInWithGoogle(s.server.origin, other, 'second-member'); await provision(s.server.origin, other);
    const mixed = new CookieJar(); mixed.values = new Map(other.values); mixed.values.set('better-auth.session_data', cookie);
    await errorResponse(await mixed.request(s.server.origin, '/api/menu'), 401, 'Unauthorized');
    const sameUser = new CookieJar(); await signInWithGoogle(s.server.origin, sameUser);
    sameUser.values.set('better-auth.session_data', cookie);
    await errorResponse(await sameUser.request(s.server.origin, '/api/menu'), 401, 'Unauthorized');
    const chunked = new CookieJar(); chunked.values = new Map(s.jar.values); chunked.values.delete('better-auth.session_data');
    const middle = Math.floor(cookie.length / 2);
    chunked.values.set('better-auth.session_data.0', cookie.slice(0, middle)); chunked.values.set('better-auth.session_data.1', cookie.slice(middle));
    const validChunks = await chunked.request(s.server.origin, '/api/menu'); assert.equal(validChunks.status, 200); assert.equal(validChunks.headers.getSetCookie().length, 0);
    chunked.values.delete('better-auth.session_data.1');
    await errorResponse(await chunked.request(s.server.origin, '/api/menu'), 401, 'Unauthorized');
    assert.equal((await s.db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 0);
  } finally { await s.close(); }
});

test('configured secure-prefixed JWE cookies and their chunks authorize without refresh', async () => {
  const s = await setup();
  const secure = await startServer(origin => ({ DATABASE_URL: s.fixture.runtimeUrl, BETTER_AUTH_URL: origin.replace('http:', 'https:') }), true);
  try {
    const jar = new CookieJar();
    const initial = await beginGoogle(secure.origin, jar, {}, { Origin: secure.origin.replace('http:', 'https:') }); assert.equal(initial.status, 200);
    const authorization = new URL((await initial.json()).url);
    const callback = await jar.request(secure.origin, `/api/auth/callback/google?code=test-code&state=${encodeURIComponent(authorization.searchParams.get('state') ?? '')}`); assert.equal(callback.status, 302);
    const name = '__Secure-better-auth.session_data'; const cookie = jar.values.get(name); assert.ok(cookie);
    const response = await jar.request(secure.origin, '/api/menu'); assert.equal(response.status, 200); assert.equal(response.headers.getSetCookie().length, 0);
    assert.equal(response.headers.get('strict-transport-security'), 'max-age=31536000');
    jar.values.delete(name); const middle = Math.floor(cookie.length / 2);
    jar.values.set(name + '.0', cookie.slice(0, middle)); jar.values.set(name + '.1', cookie.slice(middle));
    const chunks = await jar.request(secure.origin, '/api/menu'); assert.equal(chunks.status, 200); assert.equal(chunks.headers.getSetCookie().length, 0);
  } finally { await secure.stop(); await s.close(); }
});

test('real HTTP family isolation, accepted invite membership and foreign removal remain scoped', async () => {
  const s = await setup();
  try {
    const saved = await (await post(s.server.origin, s.jar, '/api/menu', recipe)).json();
    const other = new CookieJar(); await signInWithGoogle(s.server.origin, other, 'second-member'); await provision(s.server.origin, other);
    assert.deepEqual(await (await other.request(s.server.origin, '/api/menu')).json(), { entries: [], nextCursor: null });
    const foreign = await post(s.server.origin, other, `/api/menu/${saved.entry.id}/remove`);
    const missing = await post(s.server.origin, other, `/api/menu/${randomUUID()}/remove`);
    assert.equal(foreign.status, 200); assert.equal(missing.status, 200); assert.deepEqual(await foreign.json(), await missing.json());
    assert.equal((await s.db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 1);
    const invitation = await (await post(s.server.origin, s.jar, '/api/family/invitations', { recipientEmail: 'invitee@example.test' })).json();
    const invited = new CookieJar(); invited.values.set('meal.invitation', new URL(invitation.url).hash.slice(1));
    await signInWithGoogle(s.server.origin, invited, 'invitee');
    await errorResponse(await invited.request(s.server.origin, '/api/menu'), 403, 'Family membership required');
    assert.equal((await post(s.server.origin, invited, '/api/invitations/accept')).status, 200);
    assert.deepEqual(await (await invited.request(s.server.origin, '/api/menu')).json(), { entries: [saved.entry], nextCursor: null });
    assert.equal((await post(s.server.origin, invited, `/api/menu/${saved.entry.id}/remove`)).status, 200);
    assert.equal((await s.db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 0);
  } finally { await s.close(); }
});

test('menu HTTP rejects ownership selectors, unsafe payloads, query ambiguity and cross-origin writes', async () => {
  const s = await setup();
  try {
    for (const path of ['/api/menu?familyId=forged', '/api/menu?after=', '/api/menu?after=a&after=b', '/api/menu?limit=100000']) await errorResponse(await s.jar.request(s.server.origin, path), 400, 'Invalid request');
    const malformed = [{ ...recipe, familyId: randomUUID() }, { ...recipe, sourceUrl: 'javascript:alert(1)' }, { ...recipe, imageUrl: 'https://127.0.0.1/private' }, { ...recipe, title: 'x'.repeat(161) }];
    for (const body of malformed) await errorResponse(await post(s.server.origin, s.jar, '/api/menu', body), 400, 'Invalid request');
    await errorResponse(await post(s.server.origin, s.jar, '/api/menu?after=forged', recipe), 400, 'Invalid request');
    await errorResponse(await post(s.server.origin, s.jar, '/api/menu/not-uuid/remove'), 400, 'Invalid request');
    await errorResponse(await post(s.server.origin, s.jar, `/api/menu/${randomUUID()}/remove?extra=1`), 400, 'Invalid request');
    const headers = { Origin: s.server.origin, 'Content-Type': 'application/json' };
    const forbidden: Record<string, string>[] = [{ Origin: 'https://attacker.test' }, { 'Sec-Fetch-Site': 'cross-site' }];
    for (const changes of forbidden) await errorResponse(await s.jar.request(s.server.origin, '/api/menu', { method: 'POST', headers: { ...headers, ...changes }, body: JSON.stringify(recipe) }), 403, 'Forbidden');
    await errorResponse(await s.jar.request(s.server.origin, '/api/menu', { method: 'POST', headers: { ...headers, 'Content-Type': 'text/plain' }, body: '{}' }), 400, 'Invalid request');
    await errorResponse(await s.jar.request(s.server.origin, '/api/menu', { method: 'POST', headers, body: '{' }), 400, 'Invalid request');
    const oversized = new ReadableStream<Uint8Array>({ start(c) { c.enqueue(new Uint8Array(16385)); c.close(); } });
    await errorResponse(await s.jar.request(s.server.origin, '/api/menu', { method: 'POST', headers, body: oversized, duplex: 'half' } as RequestInit), 400, 'Invalid request');
    assert.equal((await s.db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 0);
  } finally { await s.close(); }
});

test('HTTP keyset pages stay bounded and foreign positions never expose another family', async () => {
  const s = await setup();
  try {
    const member = await s.db.one<{ familyId: string }>('SELECT family_id AS "familyId" FROM app_users WHERE google_subject=$1', ['fixture-user']); assert.ok(member);
    await s.db.execute("INSERT INTO menu_recipes (id,family_id,source_url,title,summary,saved_at) SELECT gen_random_uuid()::text,$1,'https://example.test/recipe/'||n::text,'Chickpeas '||n::text,'Cook them.',n::bigint FROM generate_series(1,52) n", [member.familyId]);
    const first = await (await s.jar.request(s.server.origin, '/api/menu')).json();
    assert.equal(first.entries.length, 50); assert.equal(typeof first.nextCursor, 'string');
    await post(s.server.origin, s.jar, `/api/menu/${first.entries.at(-1).id}/remove`);
    const next = await (await s.jar.request(s.server.origin, `/api/menu?after=${encodeURIComponent(first.nextCursor)}`)).json();
    assert.equal(next.entries.length, 2); assert.equal(next.nextCursor, null);
    const other = new CookieJar(); await signInWithGoogle(s.server.origin, other, 'second-member'); await provision(s.server.origin, other);
    assert.deepEqual(await (await other.request(s.server.origin, `/api/menu?after=${encodeURIComponent(first.nextCursor)}`)).json(), { entries: [], nextCursor: null });
  } finally { await s.close(); }
});

test('a stalled real HTTP body expires without leaving a menu entry or requiring client EOF', async () => {
  const s = await setup();
  try {
    const result = await new Promise<{ status: number | undefined; body: string }>((resolve, reject) => {
      const req = httpRequest(s.server.origin + '/api/menu', { method: 'POST', headers: { Origin: s.server.origin, 'Content-Type': 'application/json', Cookie: s.jar.header() } }, response => {
        let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; });
        response.on('end', () => { resolve({ status: response.statusCode, body }); req.destroy(); });
      });
      req.on('error', reject); req.setTimeout(15000, () => req.destroy(new Error('Owned slow-body request timed out'))); req.write('{');
    });
    assert.equal(result.status, 400); assert.deepEqual(JSON.parse(result.body), { error: 'Invalid request' });
    assert.equal((await s.db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 0);
  } finally { await s.close(); }
});

test('both exact menu shapes guard Host and every method while sibling paths retain compiled Proxy coverage', async () => {
  const s = await setup();
  try {
    const remove = `/api/menu/${randomUUID()}/remove`;
    const methods = ['GET', 'HEAD', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'];
    const pending = new CookieJar(); await signInWithGoogle(s.server.origin, pending, 'second-member');
    for (const path of ['/api/menu', remove]) {
      for (const method of methods) {
        const anonymous = await fetch(s.server.origin + path, { method });
        assert.equal(anonymous.status, 401, `${method} anonymous ${path}`); securityHeaders(anonymous.headers);
        const onboarding = await pending.request(s.server.origin, path, { method });
        assert.equal(onboarding.status, 403, `${method} pending ${path}`); securityHeaders(onboarding.headers);
        const hostile = await new Promise<{ status: number | undefined; headers: Headers }>((resolve, reject) => {
          const req = httpRequest(s.server.origin + path, { method, headers: { Host: 'evil.example', 'X-Forwarded-Host': new URL(s.server.origin).host, Origin: s.server.origin, Cookie: s.jar.header() } }, response => {
            const headers = new Headers(); for (const [key, value] of Object.entries(response.headers)) if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(',') : value);
            response.resume(); response.on('end', () => resolve({ status: response.statusCode, headers }));
          }); req.on('error', reject); req.end();
        });
        assert.equal(hostile.status, 421, `${method} hostile Host ${path}`); securityHeaders(hostile.headers);
      }
    }
    for (const path of ['/api/menu-evil', '/api/menus', '/api/menu/extra', '/api/menu/id/remove/extra', '/api/menu/id/else', '/api/menu/./extra', '/api/menu/id/remove/../extra', '/api/%6denu']) {
      const guarded = await fetch(s.server.origin + path); assert.equal(guarded.status, 401, path); securityHeaders(guarded.headers);
    }
    for (const path of ['/api/menu/', `/api/menu/${randomUUID()}/remove/`, '/api/menu/%61%62%63/remove', '/api/menu?after=forged']) {
      const guarded = await fetch(s.server.origin + path); assert.equal(guarded.status, 401, path); securityHeaders(guarded.headers);
    }
    for (const path of ['/api/menu', remove]) {
      for (const method of methods.filter(method => method !== 'POST')) {
        const response = await s.jar.request(s.server.origin, path, { method });
        assert.equal(response.status, path === '/api/menu' && ['GET', 'HEAD'].includes(method) ? 200 : 405, `${method} member ${path}`); securityHeaders(response.headers);
      }
    }
    assert.equal((await s.db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 0);
  } finally { await s.close(); }
});

test('menu wrapper fails closed on invalid configuration and preserves HTTPS HSTS policy', async () => {
  const unavailable = await startServer({ BETTER_AUTH_SECRET: 'short' });
  try {
    for (const path of ['/api/menu', `/api/menu/${randomUUID()}/remove`]) {
      for (const method of ['GET', 'OPTIONS']) {
        const response = await fetch(unavailable.origin + path, { method });
        await errorResponse(response, 503, 'Authentication unavailable'); securityHeaders(response.headers);
      }
    }
  } finally { await unavailable.stop(); }
  const secure = await startServer(origin => ({ BETTER_AUTH_URL: origin.replace('http:', 'https:') }));
  try {
    for (const path of ['/api/menu', `/api/menu/${randomUUID()}/remove`]) {
      const response = await fetch(secure.origin + path);
      await errorResponse(response, 401, 'Unauthorized'); securityHeaders(response.headers);
      assert.equal(response.headers.get('strict-transport-security'), 'max-age=31536000');
    }
  } finally { await secure.stop(); }
});

test('stalled real HTTP removal expires before client EOF and never removes the selected recipe', async () => {
  const s = await setup();
  try {
    const saved = await (await post(s.server.origin, s.jar, '/api/menu', recipe)).json();
    const result = await new Promise<{ status: number | undefined; body: string }>((resolve, reject) => {
      const req = httpRequest(s.server.origin + `/api/menu/${saved.entry.id}/remove`, { method: 'POST', headers: { Origin: s.server.origin, 'Content-Type': 'application/json', Cookie: s.jar.header() } }, response => {
        let body = ''; response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; });
        response.on('end', () => { resolve({ status: response.statusCode, body }); req.destroy(); });
      });
      req.on('error', reject); req.setTimeout(15000, () => req.destroy(new Error('Owned slow removal request timed out'))); req.write('{');
    });
    assert.equal(result.status, 400); assert.deepEqual(JSON.parse(result.body), { error: 'Invalid request' });
    assert.equal((await s.db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 1);
  } finally { await s.close(); }
});

test('malformed stored rows and failed database writes produce generic private failures with rollback', async () => {
  const s = await setup();
  try {
    const saved = await (await post(s.server.origin, s.jar, '/api/menu', recipe)).json();
    await s.db.execute('UPDATE menu_recipes SET image_url=$1 WHERE id=$2', ['javascript:alert(1)', saved.entry.id]);
    await errorResponse(await s.jar.request(s.server.origin, '/api/menu'), 503, 'Service unavailable');
    await s.db.execute('UPDATE menu_recipes SET image_url=$1 WHERE id=$2', [null, saved.entry.id]);
    await s.db.execute('ALTER TABLE menu_recipes ADD CONSTRAINT fail_menu CHECK (false) NOT VALID');
    try { await errorResponse(await post(s.server.origin, s.jar, '/api/menu', { ...recipe, sourceUrl: 'https://example.test/new-recipe' }), 503, 'Service unavailable'); }
    finally { await s.db.execute('ALTER TABLE menu_recipes DROP CONSTRAINT fail_menu'); }
    assert.equal((await s.db.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 1);
  } finally { await s.close(); }
});


test('protected title query searches beyond50 with bounded literal pages and unchanged guards/read-only effects',async()=>{
 const s=await setup();try{
  const member=await s.db.one<{family:string}>('SELECT family_id AS family FROM app_users WHERE google_subject=$1',['fixture-user']);assert.ok(member);
  await s.db.execute("INSERT INTO menu_recipes (id,family_id,source_url,title,summary,saved_at) SELECT gen_random_uuid()::text,$1,'https://example.test/modal/'||n::text,CASE WHEN n<=55 THEN 'Older Lemon '||n::text ELSE 'Unrelated recent '||n::text END,'Saved dinner.',n::bigint FROM generate_series(1,110) n",[member.family]);
  const first=await s.jar.request(s.server.origin,'/api/menu?q=%20older%20LEMON%20');assert.equal(first.status,200);securityHeaders(first.headers);const page=await first.json();assert.equal(page.entries.length,50);assert.ok(page.nextCursor);
  const second=await (await s.jar.request(s.server.origin,'/api/menu?q=older%20lemon&after='+encodeURIComponent(page.nextCursor))).json();assert.equal(second.entries.length,5);assert.equal(second.nextCursor,null);
  assert.deepEqual(await (await s.jar.request(s.server.origin,'/api/menu?q=')).json(),await (await s.jar.request(s.server.origin,'/api/menu')).json());
  for(const query of ['?q=a&q=b','?q='+encodeURIComponent('x'.repeat(101)),'?q=%00','?q=a&after=bad','?q=a&familyId=forged'])await errorResponse(await s.jar.request(s.server.origin,'/api/menu'+query),400,'Invalid request');
  assert.equal((await s.jar.request(s.server.origin,'/api/menu?q=lemon',{method:'HEAD'})).status,200);await errorResponse(await new CookieJar().request(s.server.origin,'/api/menu?q=lemon'),401,'Unauthorized');
  const pending=new CookieJar();await signInWithGoogle(s.server.origin,pending,'second-member');await errorResponse(await pending.request(s.server.origin,'/api/menu?q=lemon'),403,'Family membership required');await provision(s.server.origin,pending);assert.deepEqual(await (await pending.request(s.server.origin,'/api/menu?q=lemon')).json(),{entries:[],nextCursor:null});
  await errorResponse(await post(s.server.origin,s.jar,'/api/menu?q=lemon',recipe),400,'Invalid request');assert.equal((await s.db.one<{n:number}>('SELECT count(*) AS n FROM menu_recipes'))?.n,110);assert.equal((await s.db.one<{n:number}>('SELECT count(*) AS n FROM meal_plan_suggestions'))?.n,0);
 }finally{await s.close();}
});


test('category-only HTTP writes are exact, protected, family-scoped and durable', async () => {
  const s = await setup();
  try {
    const saved = await (await post(s.server.origin, s.jar, '/api/menu', { ...recipe, category: 'main' })).json();
    const body = { id: saved.entry.id, category: 'veggie' };
    const result = await post(s.server.origin, s.jar, '/api/menu?category=update', body);
    assert.equal(result.status, 200); securityHeaders(result.headers);
    assert.equal((await result.json()).entry.recipe.category, 'veggie');
    assert.equal((await (await s.jar.request(s.server.origin, '/api/menu')).json()).entries[0].recipe.category, 'veggie');
    for (const query of ['?category=wrong', '?category=update&category=update', '?category=update&after=x', '?category=update&familyId=x']) await errorResponse(await post(s.server.origin, s.jar, '/api/menu' + query, body), 400, 'Invalid request');
    for (const value of [{ ...body, familyId: 'forged' }, { id: body.id }, { ...body, category: 'vegan' }, { ...body, category: null }, { ...body, category: ['main'] }]) await errorResponse(await post(s.server.origin, s.jar, '/api/menu?category=update', value), 400, 'Invalid request');
    await errorResponse(await post(s.server.origin, new CookieJar(), '/api/menu?category=update', body), 401, 'Unauthorized');
    const foreign = new CookieJar(); await signInWithGoogle(s.server.origin, foreign, 'second-member'); await provision(s.server.origin, foreign);
    await errorResponse(await post(s.server.origin, foreign, '/api/menu?category=update', body), 404, 'Recipe unavailable');
    const forbidden = await s.jar.request(s.server.origin, '/api/menu?category=update', { method: 'POST', headers: { Origin: 'https://attacker.test', 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await errorResponse(forbidden, 403, 'Forbidden');
    const wrongHost = await new Promise<{status:number;body:string;headers:Headers}>((resolve,reject)=>{
      const req=httpRequest(s.server.origin+'/api/menu?category=update',{method:'POST',headers:{Host:'attacker.test',Origin:s.server.origin,'Content-Type':'application/json',Cookie:s.jar.header()}},response=>{
        let text='';response.setEncoding('utf8');response.on('data',chunk=>{text+=chunk;});
        const headers=new Headers();for(const [key,value] of Object.entries(response.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):value);
        response.on('end',()=>resolve({status:response.statusCode??0,body:text,headers}));
      });req.on('error',reject);req.end(JSON.stringify(body));
    });
    assert.equal(wrongHost.status,421);assert.deepEqual(JSON.parse(wrongHost.body),{error:'Misdirected request'});securityHeaders(wrongHost.headers);
    assert.equal((await s.db.one<{category:string}>('SELECT category FROM menu_recipes WHERE id=$1',[body.id]))?.category,'veggie');
    const unsupported = await s.jar.request(s.server.origin, '/api/menu?category=update', { method: 'PUT' });
    assert.equal(unsupported.status, 405); securityHeaders(unsupported.headers);
  } finally { await s.close(); }
});


test('category bodies expire or exceed limits before EOF without changing a saved category', async () => {
  const s=await setup();
  try {
    const saved=await (await post(s.server.origin,s.jar,'/api/menu',{...recipe,category:'main'})).json();
    for(const oversized of [false,true]) {
      const started=Date.now();
      const result=await new Promise<{status:number|undefined;body:string;headers:Headers}>((resolve,reject)=>{
        const req=httpRequest(s.server.origin+'/api/menu?category=update',{method:'POST',headers:{Origin:s.server.origin,'Content-Type':'application/json',Cookie:s.jar.header()}},response=>{
          let body='';response.setEncoding('utf8');response.on('data',chunk=>{body+=chunk;});
          const headers=new Headers();for(const [key,value] of Object.entries(response.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):value);
          response.on('end',()=>{resolve({status:response.statusCode,body,headers});req.destroy();});
        });
        req.on('error',reject);req.setTimeout(15000,()=>req.destroy(new Error('Owned category body request timed out')));req.write(oversized?' '.repeat(4097):'{');
      });
      assert.equal(result.status,400);assert.deepEqual(JSON.parse(result.body),{error:'Invalid request'});securityHeaders(result.headers);
      assert.ok(Date.now()-started<10000,'bounded handler replies before unfinished client body EOF');
      assert.equal((await s.db.one<{category:string}>('SELECT category FROM menu_recipes WHERE id=$1',[saved.entry.id]))?.category,'main');
    }
  }finally{await s.close();}
});
