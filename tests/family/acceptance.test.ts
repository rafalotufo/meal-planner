import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomBytes, createHash } from 'node:crypto';
import { CookieJar, startServer } from '../auth/server.ts';
import { signInWithGoogle, provision } from '../auth/flow.ts';
import { openDatabase } from '../../lib/db/connection.ts';

test('verified unlisted invitee joins the existing family and retains access after consumed invitation', async () => {
  const server = await startServer({}, true);
  try {
    const owner = new CookieJar(); await signInWithGoogle(server.origin, owner); await provision(server.origin, owner);
    const db = openDatabase(server.databasePath); const token = randomBytes(32).toString('base64url');
    try {
      const member = db.prepare<[], { id: string; family_id: string }>('SELECT id, family_id FROM app_users').get(); assert.ok(member);
      db.prepare('INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES (?,?,?,?,?,?,?,?)').run('invitation', member.family_id, member.id, 'invitee@example.test', createHash('sha256').update(token).digest('hex'), Date.now(), Date.now() + 60000, 'pending');
      const invitee = new CookieJar(); invitee.values.set('meal.invitation', token);
      const { callback } = await signInWithGoogle(server.origin, invitee, 'invitee'); assert.equal(callback.headers.get('location'), `${server.origin}/onboarding`);
      assert.equal((await invitee.request(server.origin, '/api/session')).status, 403);
      assert.equal((await provision(server.origin, invitee)).status, 409);
      const accept = () => invitee.request(server.origin, '/api/invitations/accept', { method: 'POST', headers: { Origin: server.origin, 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal((await accept()).status, 200);
      assert.equal(invitee.values.has('meal.invitation'), false);
      assert.equal((await invitee.request(server.origin, '/api/session')).status, 200);
      assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM families').get()?.n, 1);
      const joined = db.prepare<[string], { family_id: string; invitation_granted_at: number | null }>('SELECT family_id, invitation_granted_at FROM app_users WHERE google_subject=?').get('invited-user'); assert.ok(joined);
      assert.equal(joined.family_id, member.family_id); assert.notEqual(joined.invitation_granted_at, null);
      const again = new CookieJar(); assert.equal((await signInWithGoogle(server.origin, again, 'invitee')).callback.headers.get('location'), `${server.origin}/onboarding`);
      assert.equal((await again.request(server.origin, '/api/session')).status, 200);
    } finally { db.close(); }
  } finally { await server.stop(); }
});

test('expired pending admission still denies acceptance uniformly and permits guarded logout', async () => {
  const { invitationScenario, post } = await import('./http.ts');
  const fixture = await invitationScenario();
  try {
    fixture.db.prepare('UPDATE family_invitations SET created_at=?,expires_at=? WHERE id=?').run(Date.now() - 10000, Date.now() - 1, fixture.invitation.id);
    const denied = await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept');
    assert.equal(denied.status, 409); assert.deepEqual(await denied.json(), { error: 'Invitation unavailable' });
    assert.equal((await fixture.invitee.request(fixture.server.origin, '/api/session')).status, 401);
    assert.equal((await fixture.invitee.request(fixture.server.origin, '/sign-out')).status, 200);
    assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/auth/sign-out')).status, 200);
    assert.equal(fixture.invitee.values.size, 0);
  } finally { await fixture.close(); }
});

test('wrong recipient, forged token and existing family cannot consume an invitation', async () => {
  const { invitationScenario, post } = await import('./http.ts'); const fixture = await invitationScenario();
  try {
    assert.equal((await post(fixture.server.origin, fixture.owner, '/api/family/invitations', { recipientEmail: 'wrong@example.test' })).status, 201);
    const wrong = new CookieJar(); wrong.values.set('meal.invitation', fixture.token); await signInWithGoogle(fixture.server.origin, wrong, 'wrong-recipient');
    const denied = await post(fixture.server.origin, wrong, '/api/invitations/accept'); assert.equal(denied.status, 409); assert.deepEqual(await denied.json(), { error: 'Invitation unavailable' });
    fixture.invitee.values.set('meal.invitation', randomBytes(32).toString('base64url'));
    assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept')).status, 409);
    fixture.owner.values.set('meal.invitation', fixture.token);
    assert.equal((await post(fixture.server.origin, fixture.owner, '/api/invitations/accept')).status, 409);
    assert.equal(fixture.db.prepare<[], { n: number }>('SELECT count(*) AS n FROM app_users').get()?.n, 1);
    assert.equal(fixture.db.prepare<[string], { status: string }>('SELECT status FROM family_invitations WHERE id=?').get(fixture.invitation.id)?.status, 'pending');
  } finally { await fixture.close(); }
});

test('revoked onboarding sessions cannot access data but can clear all cookies', async () => {
  const { invitationScenario, post } = await import('./http.ts'); const fixture = await invitationScenario();
  try {
    assert.equal((await post(fixture.server.origin, fixture.owner, `/api/family/invitations/${fixture.invitation.id}/revoke`)).status, 200);
    assert.equal((await fixture.invitee.request(fixture.server.origin, '/api/session')).status, 401);
    assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept')).status, 409);
    assert.equal((await fixture.invitee.request(fixture.server.origin, '/sign-out')).status, 200);
    assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/auth/sign-out')).status, 200);
    assert.equal(fixture.invitee.values.size, 0);
    assert.equal(fixture.db.prepare<[], { n: number }>('SELECT count(*) AS n FROM families').get()?.n, 1);
  } finally { await fixture.close(); }
});

test('acceptance rollback is atomic and exact retries do not create or switch membership', async () => {
  const { invitationScenario, post } = await import('./http.ts'); const fixture = await invitationScenario();
  try {
    fixture.db.exec("CREATE TRIGGER fail_invitee BEFORE INSERT ON app_users BEGIN SELECT RAISE(ABORT, 'fixture failure'); END");
    assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept')).status, 503);
    assert.equal(fixture.db.prepare<[string], { status: string }>('SELECT status FROM family_invitations WHERE id=?').get(fixture.invitation.id)?.status, 'pending');
    assert.equal(fixture.db.prepare<[], { n: number }>('SELECT count(*) AS n FROM app_users').get()?.n, 1);
    fixture.db.exec('DROP TRIGGER fail_invitee');
    assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept')).status, 200);
    fixture.invitee.values.set('meal.invitation', fixture.token);
    assert.equal((await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept')).status, 200);
    assert.equal(fixture.db.prepare<[], { n: number }>('SELECT count(*) AS n FROM app_users').get()?.n, 2);
    assert.equal((await post(fixture.server.origin, fixture.owner, `/api/family/invitations/${fixture.invitation.id}/revoke`)).status, 409);
    assert.equal((await fixture.invitee.request(fixture.server.origin, '/api/session')).status, 200);
  } finally { await fixture.close(); }
});

test('fresh verified email updates preserve Google identity and older cookies cannot rewrite it', async () => {
  const { invitationScenario, post } = await import('./http.ts'); const fixture = await invitationScenario();
  try {
    await post(fixture.server.origin, fixture.invitee, '/api/invitations/accept');
    const old = new CookieJar(); old.values = new Map(fixture.invitee.values);
    const renamed = new CookieJar(); const callback = (await signInWithGoogle(fixture.server.origin, renamed, 'invitee-renamed')).callback;
    assert.equal(callback.headers.get('location'), `${fixture.server.origin}/onboarding`);
    const email = () => fixture.db.prepare<[string], { verified_email: string }>('SELECT verified_email FROM app_users WHERE google_subject=?').get('invited-user')?.verified_email;
    assert.equal(email(), 'renamed@example.test');
    assert.equal((await old.request(fixture.server.origin, '/api/session')).status, 200); assert.equal(email(), 'renamed@example.test');
    // Keep the library's per-process OAuth rate limit active; a separate real
    // server tests the collision against the same durable database.
    const separate = await startServer({ DATABASE_PATH: fixture.server.databasePath }, true);
    try {
      const collision = new CookieJar(); await signInWithGoogle(separate.origin, collision, 'invitee-collision');
      assert.equal((await collision.request(separate.origin, '/api/session')).status, 401); assert.equal(email(), 'renamed@example.test');
    } finally { await separate.stop(); }
    assert.equal(fixture.db.prepare<[], { n: number }>('SELECT count(*) AS n FROM app_users').get()?.n, 2);
  } finally { await fixture.close(); }
});

test('two application processes accept one invitation exactly once', async () => {
  const { invitationScenario, post } = await import('./http.ts'); const fixture = await invitationScenario();
  const second = await startServer({ DATABASE_PATH: fixture.server.databasePath }, true);
  try {
    const other = new CookieJar(); other.values.set('meal.invitation', fixture.token); await signInWithGoogle(second.origin, other, 'invitee');
    const results = await Promise.all([post(fixture.server.origin, fixture.invitee, '/api/invitations/accept'), post(second.origin, other, '/api/invitations/accept')]);
    assert.deepEqual(results.map((r) => r.status), [200, 200]);
    assert.equal(fixture.db.prepare<[], { n: number }>('SELECT count(*) AS n FROM app_users').get()?.n, 2);
    assert.equal(fixture.db.prepare<[], { n: number }>('SELECT count(*) AS n FROM families').get()?.n, 1);
    assert.equal(fixture.db.prepare<[string], { status: string }>('SELECT status FROM family_invitations WHERE id=?').get(fixture.invitation.id)?.status, 'accepted');
  } finally { await second.stop(); await fixture.close(); }
});
