import assert from 'node:assert/strict';
import { CookieJar, startServer } from '../auth/server.ts';
import { provision, signInWithGoogle } from '../auth/flow.ts';
import { openDatabase } from '../../lib/db/connection.ts';
export function post(origin: string, jar: CookieJar, path: string, body: object = {}) {
    return jar.request(origin, path, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
}
export async function invitationScenario() {
    const server = await startServer({}, true);
    const owner = new CookieJar();
    await signInWithGoogle(server.origin, owner);
    assert.equal((await provision(server.origin, owner)).status, 200);
    const response = await post(server.origin, owner, '/api/family/invitations', { recipientEmail: 'invitee@example.test' });
    assert.equal(response.status, 201);
    const invitation: {
        id: string;
        url: string;
    } = await response.json();
    const token = new URL(invitation.url).hash.slice(1);
    const db = (await openDatabase(server.databaseUrl));
    const invitee = new CookieJar();
    invitee.values.set('meal.invitation', token);
    assert.equal((await signInWithGoogle(server.origin, invitee, 'invitee')).callback.headers.get('location'), `${server.origin}/onboarding`);
    return { server, owner, invitee, db, token, invitation, close: async () => { (await db.close()); await server.stop(); } };
}
