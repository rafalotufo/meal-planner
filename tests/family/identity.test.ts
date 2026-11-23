import assert from 'node:assert/strict';
import { test } from 'node:test';
import { testDatabase } from './database.ts';
import { classifyAccess, verifiedIdentity } from '../../lib/identity-access.ts';

test('invitation access is independent of membership and an empty allowlist', async () => {
  const fixture = await testDatabase(); const db = fixture.open();
  try {
    const identity = verifiedIdentity({ googleSubject: 'subject', email: 'person@example.test', emailVerified: true }); assert.ok(identity);
    assert.equal(classifyAccess(db, identity, []), null);
    db.prepare('INSERT INTO families VALUES (?,?)').run('family', Date.now());
    db.prepare('INSERT INTO app_users VALUES (?,?,?,?,?,?)').run('user', 'subject', identity.email, 'family', Date.now(), null);
    assert.equal(classifyAccess(db, identity, []), null, 'membership alone grants no eligibility');
    db.prepare('UPDATE app_users SET invitation_granted_at=? WHERE id=?').run(Date.now(), 'user');
    assert.equal(classifyAccess(db, identity, [])?.kind, 'member');
    assert.throws(() => classifyAccess(db, identity, ['malformed']));
    assert.equal(verifiedIdentity({ googleSubject: 'subject', email: identity.email, emailVerified: false }), null);
    assert.equal(verifiedIdentity({ id: 'ephemeral', email: identity.email, emailVerified: true }), null);
  } finally { db.close(); await fixture.cleanup(); }
});

test('a pending verified recipient is admitted to onboarding even with an empty allowlist', async () => {
  const fixture = await testDatabase(); const db = fixture.open();
  try {
    db.prepare('INSERT INTO families VALUES (?,?)').run('family', Date.now());
    db.prepare('INSERT INTO app_users VALUES (?,?,?,?,?,?)').run('owner', 'owner-subject', 'owner@gmail.com', 'family', Date.now(), null);
    db.prepare("INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES (?,?,?,?,?,?,?,'pending')").run('invitation', 'family', 'owner', 'invitee@example.test', 'hash', Date.now(), Date.now() + 60000);
    const identity = verifiedIdentity({ googleSubject: 'new-subject', email: 'invitee@example.test', emailVerified: true }); assert.ok(identity);
    assert.equal(classifyAccess(db, identity, [])?.kind, 'invited');
    assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM app_users').get()?.n, 1);
  } finally { db.close(); await fixture.cleanup(); }
});
