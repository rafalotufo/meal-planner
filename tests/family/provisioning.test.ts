import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CookieJar, startServer } from '../auth/server.ts';
import { signInWithGoogle, provision } from '../auth/flow.ts';
import { openDatabase } from '../../lib/db/connection.ts';

test('first Google login stays read-only until guarded POST creates exactly one family', async () => {
  const server = await startServer({}, true);
  try {
    const jar = new CookieJar();
    const { callback } = await signInWithGoogle(server.origin, jar);
    assert.equal(callback.headers.get('location'), `${server.origin}/onboarding`);
    const db = openDatabase(server.databasePath);
    try {
      for (const path of ['/onboarding', '/']) await jar.request(server.origin, path);
      assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM families').get()?.n, 0);
      assert.equal((await jar.request(server.origin, '/api/session')).status, 403);
      assert.equal((await provision(server.origin, jar)).status, 200);
      assert.equal((await provision(server.origin, jar)).status, 200);
      assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM families').get()?.n, 1);
      assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM app_users').get()?.n, 1);
      assert.equal((await jar.request(server.origin, '/api/session')).status, 200);
      assert.equal((await jar.request(server.origin, '/')).status, 200);
    } finally { db.close(); }
  } finally { await server.stop(); }
});

test('two application processes provision the same Google subject without duplicates', async () => {
  const { testDatabase } = await import('./database.ts');
  const fixture = await testDatabase();
  const servers = await Promise.all([startServer({ DATABASE_PATH: fixture.path }, true), startServer({ DATABASE_PATH: fixture.path }, true)]);
  try {
    const jars = [new CookieJar(), new CookieJar()];
    await Promise.all(servers.map((server, i) => signInWithGoogle(server.origin, jars[i])));
    const responses = await Promise.all(servers.map((server, i) => provision(server.origin, jars[i])));
    assert.deepEqual(responses.map((response) => response.status), [200, 200]);
    const db = fixture.open();
    try { assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM families').get()?.n, 1); assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM app_users').get()?.n, 1); }
    finally { db.close(); }
  } finally { await Promise.all(servers.map((server) => server.stop())); await fixture.cleanup(); }
});

test('provisioning rejects cross-origin and presented invalid invitations and rolls back real insert failure', async () => {
  const server = await startServer({}, true);
  try {
    const jar = new CookieJar(); await signInWithGoogle(server.origin, jar);
    assert.equal((await jar.request(server.origin, '/api/onboarding/provision')).status, 405);
    assert.equal((await jar.request(server.origin, '/api/onboarding/provision', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
    jar.values.set('meal.invitation', 'malformed');
    assert.equal((await provision(server.origin, jar)).status, 409);
    jar.values.delete('meal.invitation');
    const db = openDatabase(server.databasePath);
    try {
      db.exec("CREATE TRIGGER fail_user BEFORE INSERT ON app_users BEGIN SELECT RAISE(ABORT, 'fixture failure'); END");
      assert.equal((await provision(server.origin, jar)).status, 503);
      assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM families').get()?.n, 0);
      assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM app_users').get()?.n, 0);
      db.exec('DROP TRIGGER fail_user');
      assert.equal((await provision(server.origin, jar)).status, 200);
    } finally { db.close(); }
  } finally { await server.stop(); }
});

test('SQLite busy timeout returns 503 without leaving a partial family', async () => {
  const server = await startServer({}, true);
  try {
    const jar = new CookieJar(); await signInWithGoogle(server.origin, jar);
    const db = openDatabase(server.databasePath);
    try {
      db.exec('BEGIN IMMEDIATE');
      assert.equal((await provision(server.origin, jar)).status, 503);
      db.exec('ROLLBACK');
      assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM families').get()?.n, 0);
      assert.equal((await provision(server.origin, jar)).status, 200);
    } finally { if (db.inTransaction) db.exec('ROLLBACK'); db.close(); }
  } finally { await server.stop(); }
});

test('invitation creation racing provisioning has exactly one serialized outcome', async () => {
  const { readFileSync } = await import('node:fs'); const { testDatabase } = await import('./database.ts'); const { post } = await import('./http.ts');
  const allowed: unknown = JSON.parse(readFileSync(new URL('../../lib/allowed-google-emails.json', import.meta.url), 'utf8')); assert.ok(Array.isArray(allowed) && typeof allowed[1] === 'string');
  const fixture = await testDatabase(); const first = await startServer({ DATABASE_PATH: fixture.path }, true); const second = await startServer({ DATABASE_PATH: fixture.path }, true);
  try {
    const owner = new CookieJar(); await signInWithGoogle(first.origin, owner); await provision(first.origin, owner);
    const recipient = new CookieJar(); await signInWithGoogle(second.origin, recipient, 'second-member');
    const [invitation, provisioning] = await Promise.all([post(first.origin, owner, '/api/family/invitations', { recipientEmail: allowed[1] }), provision(second.origin, recipient)]);
    assert.ok(invitation.status === 201 && provisioning.status === 409 || invitation.status === 409 && provisioning.status === 200);
    const db = fixture.open(); try { const expected = provisioning.status === 200 ? 2 : 1; assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM families').get()?.n, expected); assert.equal(db.prepare<[], { n: number }>('SELECT count(*) AS n FROM app_users').get()?.n, expected); } finally { db.close(); }
  } finally { await first.stop(); await second.stop(); await fixture.cleanup(); }
});
