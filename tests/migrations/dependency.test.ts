import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { testDatabase } from '../family/database.ts';
import { connectDatabase, catalogSignature } from '../../lib/db/connection.ts';
import { migrateDatabase } from '../../lib/db/migrate.ts';

async function seedLegacy(url: string, order: number[]) {
  const db = connectDatabase(url);
  try {
    const migrations = readMigrationFiles({ migrationsFolder: 'drizzle/postgresql' });
    await db.transaction(async tx => {
      await tx.execute('CREATE TABLE __drizzle_migrations (id integer PRIMARY KEY, hash text NOT NULL, created_at bigint NOT NULL)');
      for (const id of order) {
        for (const sql of migrations[id].sql) await tx.execute(sql);
        await tx.execute('INSERT INTO __drizzle_migrations VALUES ($1,$2,$3)', [id, migrations[id].hash, migrations[id].folderMillis]);
      }
      await tx.execute("INSERT INTO families VALUES ('retained-family', 1)");
    }, 73462902);
  } finally { await db.close(); }
}

test('reviewed independent legacy migrations in either order converge without rewriting history or data', async () => {
  const left = await testDatabase(false), right = await testDatabase(false);
  const a = connectDatabase(left.url), b = connectDatabase(right.url);
  try {
    await seedLegacy(left.url, [0, 1, 4]);
    await seedLegacy(right.url, [0, 1, 2, 3]);
    const before = await a.all('SELECT * FROM __drizzle_migrations ORDER BY id');
    await migrateDatabase(left.url);
    await migrateDatabase(right.url);
    assert.deepEqual(await catalogSignature(a), await catalogSignature(b));
    assert.deepEqual(await a.all('SELECT * FROM __drizzle_migrations WHERE id IN (0,1,4) ORDER BY id'), before);
    assert.deepEqual(await a.all('SELECT * FROM families'), [{ id: 'retained-family', created_at: 1 }]);
    assert.deepEqual(await a.all('SELECT * FROM __drizzle_migrations ORDER BY id'), await b.all('SELECT * FROM __drizzle_migrations ORDER BY id'));
    await Promise.all([migrateDatabase(left.url), migrateDatabase(left.url), migrateDatabase(left.url)]);
    assert.equal((await a.one<{ n: number }>('SELECT count(*) AS n FROM __drizzle_migrations'))?.n, 5);
  } finally { await a.close(); await b.close(); await left.cleanup(); await right.cleanup(); }
});

test('unknown history and checksum changes fail closed without applying pending SQL', async () => {
  for (const sql of ["UPDATE __drizzle_migrations SET hash=repeat('a',64) WHERE id=0", "INSERT INTO __drizzle_migrations VALUES (99,repeat('b',64),99)"]) {
    const fixture = await testDatabase(false), db = connectDatabase(fixture.url);
    try {
      await seedLegacy(fixture.url, [0, 1]);
      await db.execute(sql);
      await assert.rejects(migrateDatabase(fixture.url));
      assert.equal((await db.one<{ name: string | null }>("SELECT to_regclass('meal_plan_weeks')::text AS name"))?.name, null);
    } finally { await db.close(); await fixture.cleanup(); }
  }
});
