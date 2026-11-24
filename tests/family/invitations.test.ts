import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CookieJar, startServer } from '../auth/server.ts';
import { signInWithGoogle, provision } from '../auth/flow.ts';
import { openDatabase } from '../../lib/db/connection.ts';
test('member creates a recipient-bound hash-only invitation and cannot duplicate it', async () => {
    const server = await startServer({}, true);
    try {
        const owner = new CookieJar();
        await signInWithGoogle(server.origin, owner);
        await provision(server.origin, owner);
        const create = () => owner.request(server.origin, '/api/family/invitations', { method: 'POST', headers: { Origin: server.origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientEmail: ' Invitee@Example.test ' }) });
        const response = await create();
        assert.equal(response.status, 201);
        const value = await response.json();
        assert.equal(typeof value.url, 'string');
        const link = new URL(value.url);
        assert.equal(link.origin, server.origin);
        assert.equal(link.pathname, '/invite');
        assert.match(link.hash, /^#[A-Za-z0-9_-]{43}$/);
        assert.equal((await create()).status, 409);
        const db = (await openDatabase(server.databaseUrl));
        try {
            const row = (await db.one<{
                recipient_email: string;
                token_hash: string;
                expires_at: number;
                created_at: number;
            }>("SELECT * FROM family_invitations", []));
            assert.ok(row);
            assert.equal(row.recipient_email, 'invitee@example.test');
            assert.match(row.token_hash, /^[a-f0-9]{64}$/);
            assert.notEqual(row.token_hash, link.hash.slice(1));
            assert.equal(row.expires_at - row.created_at, 7 * 24 * 60 * 60 * 1000);
        }
        finally {
            (await db.close());
        }
        const forged = await owner.request(server.origin, '/api/family/invitations', { method: 'POST', headers: { Origin: server.origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientEmail: 'other@example.test', familyId: 'forged' }) });
        assert.equal(forged.status, 400);
    }
    finally {
        await server.stop();
    }
});
test('creation limits, JSON bounds and mutation origins cannot be overridden', async () => {
    const { invitationScenario, post } = await import('./http.ts');
    const fixture = await invitationScenario();
    try {
        for (let i = 1; i < 10; i++)
            assert.equal((await post(fixture.server.origin, fixture.owner, '/api/family/invitations', { recipientEmail: `recipient${i}@example.test` })).status, 201);
        assert.equal((await post(fixture.server.origin, fixture.owner, '/api/family/invitations', { recipientEmail: 'eleventh@example.test' })).status, 429);
        assert.equal((await fixture.owner.request(fixture.server.origin, '/api/family/invitations', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
        assert.equal((await post(fixture.server.origin, fixture.owner, '/api/family/invitations', { recipientEmail: 'a'.repeat(5000) })).status, 400);
        assert.equal((await fixture.owner.request(fixture.server.origin, '/api/family/invitations')).status, 405);
        (await fixture.db.execute("UPDATE family_invitations SET created_at=$1", [Date.now() - 7200000]));
        const member = (await fixture.db.one<{
            id: string;
            family_id: string;
        }>("SELECT id,family_id FROM app_users", []))!;
        for (let i = 10; i < 20; i++)
            (await fixture.db.execute("INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')", [`seed-${i}`, member.family_id, member.id, `seed${i}@example.test`, `hash-${i}`, Date.now() - 7200000, Date.now() + 60000]));
        assert.equal((await post(fixture.server.origin, fixture.owner, '/api/family/invitations', { recipientEmail: 'twenty-first@example.test' })).status, 429);
    }
    finally {
        await fixture.close();
    }
});
test('separate processes cannot create duplicate active invitations for one recipient', async () => {
    const { invitationScenario, post } = await import('./http.ts');
    const fixture = await invitationScenario();
    const second = await startServer({ DATABASE_URL: fixture.server.databaseUrl }, true);
    try {
        const otherOwner = new CookieJar();
        await signInWithGoogle(second.origin, otherOwner);
        const responses = await Promise.all([post(fixture.server.origin, fixture.owner, '/api/family/invitations', { recipientEmail: 'racing@example.test' }), post(second.origin, otherOwner, '/api/family/invitations', { recipientEmail: 'racing@example.test' })]);
        assert.deepEqual(responses.map((r) => r.status).sort(), [201, 409]);
        assert.equal((await fixture.db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM family_invitations WHERE recipient_email=$1", ['racing@example.test']))?.n, 1);
    }
    finally {
        await second.stop();
        await fixture.close();
    }
});
