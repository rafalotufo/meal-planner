import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CookieJar, startServer } from '../auth/server.ts';
import { provision, signInWithGoogle } from '../auth/flow.ts';
import { post } from './http.ts';

test('only current family members can access the imported recipe UI or provider boundary', async () => {
  const server = await startServer({ OPENAI_API_KEY: '', RECIPE_SEARCH_PROVIDER: 'openai' }, true);
  try {
    const owner = new CookieJar(); await signInWithGoogle(server.origin, owner);
    const spoofHeaders: Record<string, string>[] = [{}, { 'x-middleware-subrequest': 'proxy:proxy:proxy:proxy:proxy' }];
    for (const extra of spoofHeaders) {
      const denied = await owner.request(server.origin, '/api/recipes/search', { method: 'POST', headers: { Origin: server.origin, 'Content-Type': 'application/json', ...extra }, body: JSON.stringify({ query: 'family-only integration sentinel' }) });
      assert.equal(denied.status, 403); assert.deepEqual(await denied.json(), { error: 'Family membership required' });
    }
    const pendingHome = await owner.request(server.origin, '/'); assert.equal(pendingHome.status, 307); assert.equal(new URL(pendingHome.headers.get('location')!, server.origin).pathname, '/onboarding');
    assert.equal((await provision(server.origin, owner)).status, 200);
    const home = await owner.request(server.origin, '/'); assert.equal(home.status, 200); assert.match(await home.text(), /What would you like to cook/);
    assert.equal((await post(server.origin, owner, '/api/recipes/search', { query: '' })).status, 400, 'full members reach real input validation before provider setup');
    assert.equal((await post(server.origin, owner, '/api/recipes/search', { query: 'provider unavailable without credentials' })).status, 503);
    const invitation = await (await post(server.origin, owner, '/api/family/invitations', { recipientEmail: 'invitee@example.test' })).json();
    const invited = new CookieJar(); invited.values.set('meal.invitation', new URL(invitation.url).hash.slice(1)); await signInWithGoogle(server.origin, invited, 'invitee');
    assert.equal((await post(server.origin, invited, '/api/recipes/search', { query: 'no paid work before acceptance' })).status, 403);
    assert.equal((await post(server.origin, invited, '/api/invitations/accept')).status, 200);
    assert.equal((await post(server.origin, invited, '/api/recipes/search', { query: '' })).status, 400);
  } finally { await server.stop(); }
});
