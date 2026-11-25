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
        const db = (await openDatabase(server.ownerDatabaseUrl!, { ownerTooling: true }));
        try {
            for (const path of ['/onboarding', '/'])
                await jar.request(server.origin, path);
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM families", []))?.n, 0);
            assert.equal((await jar.request(server.origin, '/api/session')).status, 403);
            assert.equal((await provision(server.origin, jar)).status, 200);
            assert.equal((await provision(server.origin, jar)).status, 200);
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM families", []))?.n, 1);
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM app_users", []))?.n, 1);
            assert.equal((await jar.request(server.origin, '/api/session')).status, 200);
            assert.equal((await jar.request(server.origin, '/')).status, 200);
        }
        finally {
            (await db.close());
        }
    }
    finally {
        await server.stop();
    }
});
test('two application processes provision the same Google subject without duplicates', async () => {
    const { restrictedMenuDatabase } = await import('../menu/database.ts');
    const fixture = await restrictedMenuDatabase();
    const servers = await Promise.all([startServer({ DATABASE_URL: fixture.runtimeUrl }, true), startServer({ DATABASE_URL: fixture.runtimeUrl }, true)]);
    try {
        const jars = [new CookieJar(), new CookieJar()];
        await Promise.all(servers.map((server, i) => signInWithGoogle(server.origin, jars[i])));
        const responses = await Promise.all(servers.map((server, i) => provision(server.origin, jars[i])));
        assert.deepEqual(responses.map((response) => response.status), [200, 200]);
        const db = (await fixture.open());
        try {
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM families", []))?.n, 1);
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM app_users", []))?.n, 1);
        }
        finally {
            (await db.close());
        }
    }
    finally {
        await Promise.all(servers.map((server) => server.stop()));
        await fixture.cleanup();
    }
});
test('provisioning rejects cross-origin and presented invalid invitations and rolls back real insert failure', async () => {
    const server = await startServer({}, true);
    try {
        const jar = new CookieJar();
        await signInWithGoogle(server.origin, jar);
        assert.equal((await jar.request(server.origin, '/api/onboarding/provision')).status, 405);
        assert.equal((await jar.request(server.origin, '/api/onboarding/provision', { method: 'POST', headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' }, body: '{}' })).status, 403);
        jar.values.set('meal.invitation', 'malformed');
        assert.equal((await provision(server.origin, jar)).status, 409);
        jar.values.delete('meal.invitation');
        const db = (await openDatabase(server.ownerDatabaseUrl!, { ownerTooling: true }));
        try {
            (await db.execute("ALTER TABLE app_users ADD CONSTRAINT fail_user CHECK (false) NOT VALID"));
            assert.equal((await provision(server.origin, jar)).status, 503);
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM families", []))?.n, 0);
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM app_users", []))?.n, 0);
            (await db.execute("ALTER TABLE app_users DROP CONSTRAINT fail_user"));
            assert.equal((await provision(server.origin, jar)).status, 200);
        }
        finally {
            (await db.close());
        }
    }
    finally {
        await server.stop();
    }
});
test('PostgreSQL advisory lock timeout returns 503 without leaving a partial family', async () => {
    const server = await startServer({}, true);
    try {
        const jar = new CookieJar();
        await signInWithGoogle(server.origin, jar);
        const db = (await openDatabase(server.ownerDatabaseUrl!, { ownerTooling: true }));
        const { Client } = await import('pg');
        const lock = new Client({connectionString: server.databaseUrl}); await lock.connect();
        try {
            await lock.query('BEGIN'); await lock.query('SELECT pg_advisory_xact_lock(73462901)');
            assert.equal((await provision(server.origin, jar)).status, 503);
            await lock.query('ROLLBACK');
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM families", []))?.n, 0);
            assert.equal((await provision(server.origin, jar)).status, 200);
        }
        finally {
            await lock.query('ROLLBACK'); await lock.end();
            (await db.close());
        }
    }
    finally {
        await server.stop();
    }
});
test('invitation creation racing provisioning has exactly one serialized outcome', async () => {
    const { readFileSync } = await import('node:fs');
    const { restrictedMenuDatabase } = await import('../menu/database.ts');
    const { post } = await import('./http.ts');
    const allowed: unknown = JSON.parse(readFileSync(new URL('../../lib/allowed-google-emails.json', import.meta.url), 'utf8'));
    assert.ok(Array.isArray(allowed) && typeof allowed[1] === 'string');
    const fixture = await restrictedMenuDatabase();
    const first = await startServer({ DATABASE_URL: fixture.runtimeUrl }, true);
    const second = await startServer({ DATABASE_URL: fixture.runtimeUrl }, true);
    try {
        const owner = new CookieJar();
        await signInWithGoogle(first.origin, owner);
        await provision(first.origin, owner);
        const recipient = new CookieJar();
        await signInWithGoogle(second.origin, recipient, 'second-member');
        const [invitation, provisioning] = await Promise.all([post(first.origin, owner, '/api/family/invitations', { recipientEmail: allowed[1] }), provision(second.origin, recipient)]);
        assert.ok(invitation.status === 201 && provisioning.status === 409 || invitation.status === 409 && provisioning.status === 200);
        const db = (await fixture.open());
        try {
            const expected = provisioning.status === 200 ? 2 : 1;
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM families", []))?.n, expected);
            assert.equal((await db.one<{
                n: number;
            }>("SELECT count(*) AS n FROM app_users", []))?.n, expected);
        }
        finally {
            (await db.close());
        }
    }
    finally {
        await first.stop();
        await second.stop();
        await fixture.cleanup();
    }
});
