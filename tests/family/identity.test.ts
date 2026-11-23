import assert from 'node:assert/strict';
import { test } from 'node:test';
import { testDatabase } from './database.ts';
import { classifyAccess, verifiedIdentity } from '../../lib/identity-access.ts';
test('invitation access is independent of membership and an empty allowlist', async () => {
    const fixture = await testDatabase();
    const db = (await fixture.open());
    try {
        const identity = verifiedIdentity({ googleSubject: 'subject', email: 'person@example.test', emailVerified: true });
        assert.ok(identity);
        assert.equal((await classifyAccess(db, identity, [])), null);
        (await db.execute("INSERT INTO families VALUES ($1,$2)", ['family', Date.now()]));
        (await db.execute("INSERT INTO app_users VALUES ($1,$2,$3,$4,$5,$6)", ['user', 'subject', identity.email, 'family', Date.now(), null]));
        assert.equal((await classifyAccess(db, identity, [])), null, 'membership alone grants no eligibility');
        (await db.execute("UPDATE app_users SET invitation_granted_at=$1 WHERE id=$2", [Date.now(), 'user']));
        assert.equal((await classifyAccess(db, identity, []))?.kind, 'member');
        await assert.rejects(() => classifyAccess(db, identity, ['malformed']));
        assert.equal(verifiedIdentity({ googleSubject: 'subject', email: identity.email, emailVerified: false }), null);
        assert.equal(verifiedIdentity({ id: 'ephemeral', email: identity.email, emailVerified: true }), null);
    }
    finally {
        (await db.close());
        await fixture.cleanup();
    }
});
test('a pending verified recipient is admitted to onboarding even with an empty allowlist', async () => {
    const fixture = await testDatabase();
    const db = (await fixture.open());
    try {
        (await db.execute("INSERT INTO families VALUES ($1,$2)", ['family', Date.now()]));
        (await db.execute("INSERT INTO app_users VALUES ($1,$2,$3,$4,$5,$6)", ['owner', 'owner-subject', 'owner@gmail.com', 'family', Date.now(), null]));
        (await db.execute("INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')", ['invitation', 'family', 'owner', 'invitee@example.test', 'hash', Date.now(), Date.now() + 60000]));
        const identity = verifiedIdentity({ googleSubject: 'new-subject', email: 'invitee@example.test', emailVerified: true });
        assert.ok(identity);
        assert.equal((await classifyAccess(db, identity, []))?.kind, 'invited');
        assert.equal((await db.one<{
            n: number;
        }>("SELECT count(*) AS n FROM app_users", []))?.n, 1);
    }
    finally {
        (await db.close());
        await fixture.cleanup();
    }
});
