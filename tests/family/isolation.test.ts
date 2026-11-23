import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CookieJar, startServer } from '../auth/server.ts';
import { provision, signInWithGoogle } from '../auth/flow.ts';
test('two real families cannot enumerate or revoke each other or switch through an invitation', async () => {
    const server = await startServer({}, true);
    const post = (jar: CookieJar, path: string, body: object = {}) => jar.request(server.origin, path, { method: 'POST', headers: { Origin: server.origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    try {
        const first = new CookieJar();
        const second = new CookieJar();
        await signInWithGoogle(server.origin, first);
        await provision(server.origin, first);
        await signInWithGoogle(server.origin, second, 'second-member');
        await provision(server.origin, second);
        const created = await post(first, '/api/family/invitations', { recipientEmail: 'private@example.test' });
        assert.equal(created.status, 201);
        const invitation = await created.json();
        const summary = await second.request(server.origin, '/api/family');
        assert.equal(summary.status, 200);
        assert.doesNotMatch(await summary.text(), /private@example.test|googleSubject|tokenHash/);
        const foreign = await post(second, `/api/family/invitations/${invitation.id}/revoke`);
        const unknown = await post(second, '/api/family/invitations/unknown/revoke');
        assert.equal(foreign.status, 404);
        assert.equal(unknown.status, 404);
        assert.deepEqual(await foreign.json(), await unknown.json());
        second.values.set('meal.invitation', new URL(invitation.url).hash.slice(1));
        const onboarding = await second.request(server.origin, '/onboarding');
        assert.match(await onboarding.text(), /You already belong to a family/);
        assert.equal((await post(second, '/api/invitations/accept')).status, 409);
        assert.equal((await post(first, `/api/family/invitations/${invitation.id}/revoke`)).status, 200);
        assert.equal((await first.request(server.origin, '/family')).status, 200);
    }
    finally {
        await server.stop();
    }
});
test('a matching recipient already in a one-person family cannot accept a new pending invitation', async () => {
    const { randomBytes, createHash } = await import('node:crypto');
    const { openDatabase } = await import('../../lib/db/connection.ts');
    const { post } = await import('./http.ts');
    const server = await startServer({}, true);
    try {
        const owner = new CookieJar();
        await signInWithGoogle(server.origin, owner);
        await provision(server.origin, owner);
        const db = (await openDatabase(server.databaseUrl));
        try {
            const row = (await db.one<{
                id: string;
                family_id: string;
                verified_email: string;
            }>("SELECT id,family_id,verified_email FROM app_users", []))!;
            const token = randomBytes(32).toString('base64url');
            // Adversarial preexisting state: acceptance must enforce membership even
            // when the token and verified recipient both match.
            (await db.execute("INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')", ['existing-recipient', row.family_id, row.id, row.verified_email, createHash('sha256').update(token).digest('hex'), Date.now(), Date.now() + 60000]));
            owner.values.set('meal.invitation', token);
            assert.equal((await post(server.origin, owner, '/api/invitations/accept')).status, 409);
            assert.equal((await db.one<{
                status: string;
            }>("SELECT status FROM family_invitations WHERE id='existing-recipient'", []))?.status, 'pending');
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM app_users", []))?.n, 1);
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM families", []))?.n, 1);
        }
        finally {
            (await db.close());
        }
    }
    finally {
        await server.stop();
    }
});
