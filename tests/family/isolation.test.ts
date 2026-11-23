import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CookieJar, startServer } from '../auth/server.ts';
import { provision, signInWithGoogle } from '../auth/flow.ts';

test('two real families cannot enumerate or revoke each other or switch through an invitation', async () => {
  const server = await startServer({}, true);
  const post = (jar: CookieJar, path: string, body: object = {}) => jar.request(server.origin, path, { method: 'POST', headers: { Origin: server.origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    const first = new CookieJar(); const second = new CookieJar();
    await signInWithGoogle(server.origin, first); await provision(server.origin, first);
    await signInWithGoogle(server.origin, second, 'second-member'); await provision(server.origin, second);
    const created = await post(first, '/api/family/invitations', { recipientEmail: 'private@example.test' }); assert.equal(created.status, 201);
    const invitation = await created.json();
    const summary = await second.request(server.origin, '/api/family'); assert.equal(summary.status, 200); assert.doesNotMatch(await summary.text(), /private@example.test|googleSubject|tokenHash/);
    const foreign = await post(second, `/api/family/invitations/${invitation.id}/revoke`);
    const unknown = await post(second, '/api/family/invitations/unknown/revoke');
    assert.equal(foreign.status, 404); assert.equal(unknown.status, 404); assert.deepEqual(await foreign.json(), await unknown.json());
    second.values.set('meal.invitation', new URL(invitation.url).hash.slice(1));
    const onboarding = await second.request(server.origin, '/onboarding'); assert.match(await onboarding.text(), /You already belong to a family/);
    assert.equal((await post(second, '/api/invitations/accept')).status, 409);
    assert.equal((await post(first, `/api/family/invitations/${invitation.id}/revoke`)).status, 200);
    assert.equal((await first.request(server.origin, '/family')).status, 200);
  } finally { await server.stop(); }
});
