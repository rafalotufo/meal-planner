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
