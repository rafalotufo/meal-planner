// Explicit isolated-tooling experiment. Install exact RC packages in a private
// temporary folder and generate the fixtures described in tooling-assessment.md.
import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Client } from 'pg';
import { testDatabase } from '../family/database.ts';

async function main() {
  const root = resolve(process.argv[2] ?? '');
  if (!root.startsWith('/private/tmp/mp-drizzle-rc.')) throw new Error('Owned temporary RC experiment path required');
  const driverPath: string = pathToFileURL(join(root, 'node_modules/drizzle-orm/node-postgres/index.js')).href;
  const migrationPath: string = pathToFileURL(join(root, 'node_modules/drizzle-orm/node-postgres/migrator.js')).href;
  const loaderPath: string = pathToFileURL(join(root, 'node_modules/drizzle-orm/migrator.js')).href;
  const adapter = await import(driverPath) as { drizzle(config: { client: Client }): unknown };
  const migrator = await import(migrationPath) as {
    migrate(db: unknown, config: { migrationsFolder: string; migrationsSchema: string }): Promise<void>;
  };
  const loader = await import(loaderPath) as {
    readMigrationFiles(config: { migrationsFolder: string }): { hash: string; folderMillis: number; sql: string[] }[];
  };
  for (const first of ['independent-a', 'independent-b']) {
    const fixture = await testDatabase(false);
    const client = new Client({ connectionString: fixture.url });
    client.on('error', () => { /* Keep experiment connection failures sanitized. */ });
    try {
      await client.connect();
      const db = adapter.drizzle({ client });
      await migrator.migrate(db, { migrationsFolder: join(root, first), migrationsSchema: 'prototype_history' });
      await migrator.migrate(db, { migrationsFolder: join(root, 'independent-merged'), migrationsSchema: 'prototype_history' });
      assert.equal((await client.query('SELECT count(*)::int AS n FROM prototype_history.__drizzle_migrations')).rows[0].n, 3);
      for (const table of ['prototype_base', 'prototype_independent_a', 'prototype_independent_b']) {
        assert.equal((await client.query('SELECT to_regclass($1) IS NOT NULL AS present', [table])).rows[0].present, true);
      }
      const before = (await client.query('SELECT * FROM prototype_history.__drizzle_migrations ORDER BY id')).rows;
      await migrator.migrate(db, { migrationsFolder: join(root, 'independent-merged'), migrationsSchema: 'prototype_history' });
      assert.deepEqual((await client.query('SELECT * FROM prototype_history.__drizzle_migrations ORDER BY id')).rows, before);
      console.log(`RC6 ${first} then merged: both independent tables present; three history rows; repeat unchanged.`);
    } finally { await client.end(); await fixture.cleanup(); }
  }
  const legacy = await testDatabase(false);
  const client = new Client({ connectionString: legacy.url });
  client.on('error', () => { /* Keep experiment connection failures sanitized. */ });
  try {
    await client.connect();
    const first = loader.readMigrationFiles({ migrationsFolder: join(root, 'migrations') })[0];
    await client.query('CREATE TABLE public.__drizzle_migrations (id integer PRIMARY KEY,hash text NOT NULL,created_at bigint NOT NULL)');
    for (const sql of first.sql) await client.query(sql);
    await client.query('INSERT INTO public.__drizzle_migrations VALUES (0,$1,$2)', [first.hash, first.folderMillis]);
    await assert.rejects(migrator.migrate(adapter.drizzle({ client }), { migrationsFolder: join(root, 'independent-merged'), migrationsSchema: 'public' }));
    assert.deepEqual((await client.query('SELECT id,hash,created_at FROM public.__drizzle_migrations')).rows,
      [{ id: 0, hash: first.hash, created_at: String(first.folderMillis) }]);
    console.log('RC6 custom integer-PK legacy ledger: direct upgrade rejected; historical tuple retained.');
  } finally { await client.end(); await legacy.cleanup(); }
}
main().catch(() => { console.error('Isolated RC experiment failed; raw database diagnostics withheld.'); process.exitCode = 1; });
