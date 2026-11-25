import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes, createHash } from 'node:crypto';
import { CookieJar, startServer } from '../auth/server.ts';
import { signInWithGoogle, provision } from '../auth/flow.ts';
import { openDatabase } from '../../lib/db/connection.ts';
test('verified unlisted invitee joins the existing family and retains access after consumed invitation', async () => {
    const server = await startServer({}, true);
    try {
        const owner = new CookieJar();
        await signInWithGoogle(server.origin, owner);
        await provision(server.origin, owner);
        const db = (await openDatabase(server.ownerDatabaseUrl!, { ownerTooling: true }));
        const token = randomBytes(32).toString('base64url');
        try {
            const member = (await db.one<{
                id: string;
                family_id: string;
            }>("SELECT id, family_id FROM app_users", []));
            assert.ok(member);
            (await db.execute("INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)", ['invitation', member.family_id, member.id, 'invitee@example.test', createHash('sha256').update(token).digest('hex'), Date.now(), Date.now() + 60000, 'pending']));
            const invitee = new CookieJar();
            invitee.values.set('meal.invitation', token);
            const { callback } = await signInWithGoogle(server.origin, invitee, 'invitee');
            assert.equal(callback.headers.get('location'), `${server.origin}/onboarding`);
            assert.equal((await invitee.request(server.origin, '/api/session')).status, 403);
            assert.equal((await provision(server.origin, invitee)).status, 409);
            const accept = () => invitee.request(server.origin, '/api/invitations/accept', { method: 'POST', headers: { Origin: server.origin, 'Content-Type': 'application/json' }, body: '{}' });
            assert.equal((await accept()).status, 200);
            assert.equal(invitee.values.has('meal.invitation'), false);
            assert.equal((await invitee.request(server.origin, '/api/session')).status, 200);
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM families", []))?.n, 1);
            const joined = (await db.one<{
                family_id: string;
                invitation_granted_at: number | null;
            }>("SELECT family_id, invitation_granted_at FROM app_users WHERE google_subject=$1", ['invited-user']));
            assert.ok(joined);
            assert.equal(joined.family_id, member.family_id);
            assert.notEqual(joined.invitation_granted_at, null);
            const again = new CookieJar();
            assert.equal((await signInWithGoogle(server.origin, again, 'invitee')).callback.headers.get('location'), `${server.origin}/onboarding`);
            assert.equal((await again.request(server.origin, '/api/session')).status, 200);
        }
        finally {
            (await db.close());
        }
    }
    finally {
        await server.stop();
    }
});
test('expired pending admission still denies acceptance uniformly and permits guarded logout', async () => {
    const { invitationScenario, post } = await import('./http.ts');
    const fixture = await invitationScenario();
    try {
        (await fixture.db.execute("UPDATE family_invitations SET created_at=$1,expires_at=$2 WHERE id=$3", [Date.now() - 10000, Date.now() - 1, fixture.invitation.id]));
        const denied = await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept');
        assert.equal(denied.status, 409);
        assert.deepEqual(await denied.json(), { error: 'Invitation unavailable' });
        assert.equal((await fixture.invitee.request(fixture.server.origin, '/api/session')).status, 401);
        assert.equal((await fixture.invitee.request(fixture.server.origin, '/sign-out')).status, 200);
        assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/auth/sign-out')).status, 200);
        assert.equal(fixture.invitee.values.size, 0);
    }
    finally {
        await fixture.close();
    }
});
test('wrong recipient, forged token and existing family cannot consume an invitation', async () => {
    const { invitationScenario, post } = await import('./http.ts');
    const fixture = await invitationScenario();
    try {
        assert.equal((await post(fixture.server.origin, fixture.owner, '/api/family/invitations', { recipientEmail: 'wrong@example.test' })).status, 201);
        const wrong = new CookieJar();
        wrong.values.set('meal.invitation', fixture.token);
        await signInWithGoogle(fixture.server.origin, wrong, 'wrong-recipient');
        const denied = await post(fixture.server.origin, wrong, '/api/invitations/accept');
        assert.equal(denied.status, 409);
        assert.deepEqual(await denied.json(), { error: 'Invitation unavailable' });
        fixture.invitee.values.set('meal.invitation', randomBytes(32).toString('base64url'));
        assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept')).status, 409);
        fixture.owner.values.set('meal.invitation', fixture.token);
        assert.equal((await post(fixture.server.origin, fixture.owner, '/api/invitations/accept')).status, 409);
        assert.equal((await fixture.db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM app_users", []))?.n, 1);
        assert.equal((await fixture.db.one<{
            status: string;
        }>("SELECT status FROM family_invitations WHERE id=$1", [fixture.invitation.id]))?.status, 'pending');
    }
    finally {
        await fixture.close();
    }
});
test('revoked onboarding sessions cannot access data but can clear all cookies', async () => {
    const { invitationScenario, post } = await import('./http.ts');
    const fixture = await invitationScenario();
    try {
        assert.equal((await post(fixture.server.origin, fixture.owner, `/api/family/invitations/${fixture.invitation.id}/revoke`)).status, 200);
        assert.equal((await fixture.invitee.request(fixture.server.origin, '/api/session')).status, 401);
        assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept')).status, 409);
        assert.equal((await fixture.invitee.request(fixture.server.origin, '/sign-out')).status, 200);
        assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/auth/sign-out')).status, 200);
        assert.equal(fixture.invitee.values.size, 0);
        assert.equal((await fixture.db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM families", []))?.n, 1);
    }
    finally {
        await fixture.close();
    }
});
test('acceptance rollback is atomic and exact retries do not create or switch membership', async () => {
    const { invitationScenario, post } = await import('./http.ts');
    const fixture = await invitationScenario();
    try {
        (await fixture.db.execute("ALTER TABLE family_invitations ADD CONSTRAINT fail_invitee CHECK (status <> 'accepted') NOT VALID"));
        assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept')).status, 503);
        assert.equal((await fixture.db.one<{
            status: string;
        }>("SELECT status FROM family_invitations WHERE id=$1", [fixture.invitation.id]))?.status, 'pending');
        assert.equal((await fixture.db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM app_users", []))?.n, 1);
        (await fixture.db.execute("ALTER TABLE family_invitations DROP CONSTRAINT fail_invitee"));
        assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept')).status, 200);
        fixture.invitee.values.set('meal.invitation', fixture.token);
        assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept')).status, 200);
        assert.equal((await fixture.db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM app_users", []))?.n, 2);
        assert.equal((await post(fixture.server.origin, fixture.owner, `/api/family/invitations/${fixture.invitation.id}/revoke`)).status, 409);
        assert.equal((await fixture.invitee.request(fixture.server.origin, '/api/session')).status, 200);
    }
    finally {
        await fixture.close();
    }
});
test('fresh verified email updates preserve Google identity and older cookies cannot rewrite it', async () => {
    const { invitationScenario, post } = await import('./http.ts');
    const fixture = await invitationScenario();
    try {
        await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept');
        const old = new CookieJar();
        old.values = new Map(fixture.invitee.values);
        const renamed = new CookieJar();
        const callback = (await signInWithGoogle(fixture.server.origin, renamed, 'invitee-renamed')).callback;
        assert.equal(callback.headers.get('location'), `${fixture.server.origin}/onboarding`);
        const email = async () => (await fixture.db.one<{
            verified_email: string;
        }>("SELECT verified_email FROM app_users WHERE google_subject=$1", ['invited-user']))?.verified_email;
        assert.equal(await email(), 'renamed@example.test');
        assert.equal((await old.request(fixture.server.origin, '/api/session')).status, 200);
        assert.equal(await email(), 'renamed@example.test');
        // Keep the library's per-process OAuth rate limit active; a separate real
        // server tests the collision against the same durable database.
        const separate = await startServer({ DATABASE_URL: fixture.server.databaseUrl }, true);
        try {
            const collision = new CookieJar();
            await signInWithGoogle(separate.origin, collision, 'invitee-collision');
            assert.equal((await collision.request(separate.origin, '/api/session')).status, 401);
            assert.equal(await email(), 'renamed@example.test');
        }
        finally {
            await separate.stop();
        }
        assert.equal((await fixture.db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM app_users", []))?.n, 2);
    }
    finally {
        await fixture.close();
    }
});
test('two application processes accept one invitation exactly once', async () => {
    const { invitationScenario, post } = await import('./http.ts');
    const fixture = await invitationScenario();
    const second = await startServer({ DATABASE_URL: fixture.server.databaseUrl }, true);
    try {
        const other = new CookieJar();
        other.values.set('meal.invitation', fixture.token);
        await signInWithGoogle(second.origin, other, 'invitee');
        const results = await Promise.all([post(fixture.server.origin, fixture.invitee, '/api/invitations/accept'), post(second.origin, other, '/api/invitations/accept')]);
        assert.deepEqual(results.map((r) => r.status), [200, 200]);
        assert.equal((await fixture.db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM app_users", []))?.n, 2);
        assert.equal((await fixture.db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM families", []))?.n, 1);
        assert.equal((await fixture.db.one<{
            status: string;
        }>("SELECT status FROM family_invitations WHERE id=$1", [fixture.invitation.id]))?.status, 'accepted');
    }
    finally {
        await second.stop();
        await fixture.close();
    }
});
test('a PostgreSQL dump restores invitation grants across complete server restart', async () => {
  const { restrictedMenuDatabase } = await import('../menu/database.ts'); const { post } = await import('./http.ts');
  const fixture = await restrictedMenuDatabase(); let restored: Awaited<ReturnType<typeof restrictedMenuDatabase>> | undefined;
  let server = await startServer({ DATABASE_URL: fixture.runtimeUrl }, true);
  try {
    const owner = new CookieJar(); await signInWithGoogle(server.origin, owner); await provision(server.origin, owner);
    const response = await post(server.origin, owner, '/api/family/invitations', { recipientEmail: 'invitee@example.test' }); assert.equal(response.status, 201);
    const invitation = await response.json(); const invitee = new CookieJar(); invitee.values.set('meal.invitation', new URL(invitation.url).hash.slice(1));
    await signInWithGoogle(server.origin, invitee, 'invitee'); assert.equal((await post(server.origin, invitee, '/api/invitations/accept')).status, 200);
    await server.stop();
    restored = await restrictedMenuDatabase(fixture.url);
    server = await startServer({ DATABASE_URL: restored.runtimeUrl }, true);
    const returning = new CookieJar(); await signInWithGoogle(server.origin, returning, 'invitee');
    assert.equal((await returning.request(server.origin, '/api/session')).status, 200);
    const summary = await (await returning.request(server.origin, '/api/family')).json(); assert.equal(summary.members.length, 2);
  } finally { await server.stop(); await fixture.cleanup(); await restored?.cleanup(); }
});
