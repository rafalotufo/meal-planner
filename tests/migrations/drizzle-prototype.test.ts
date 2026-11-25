import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { testDatabase } from '../family/database.ts';

// Tooling experiment only. Dynamic loading isolates the pinned adapter's known
// incompatible ORM declarations from our SQL-first application's type graph.
const adapterModule: string = 'drizzle-orm/node-postgres';
const migratorModule: string = 'drizzle-orm/node-postgres/migrator';
test('pinned Drizzle migrator skips older independent work and does not detect timestamp collisions', async () => {
  const adapter = await import(adapterModule) as { drizzle(client: Client): unknown };
  const migrator = await import(migratorModule) as {
    migrate(db: unknown, config: { migrationsFolder: string; migrationsSchema: string }): Promise<void>;
  };
  const fixture = await testDatabase(false);
  const directory = await mkdtemp(join(tmpdir(), 'mp-drizzle-prototype-'));
  const client = new Client({ connectionString: fixture.url });
  try {
    await client.connect();
    await mkdir(join(directory, 'meta'));
    const journal = async (entries: { idx: number; when: number; tag: string }[]) => {
      await writeFile(join(directory, 'meta/_journal.json'), JSON.stringify({ version: '7', dialect: 'postgresql', entries: entries.map(row => ({ ...row, version: '7', breakpoints: true })) }));
    };
    await writeFile(join(directory, 'later.sql'), 'CREATE TABLE public.prototype_later (id integer PRIMARY KEY);');
    await writeFile(join(directory, 'earlier.sql'), 'CREATE TABLE public.prototype_earlier (id integer PRIMARY KEY);');
    await journal([{ idx: 0, when: 2000, tag: 'later' }]);
    const db = adapter.drizzle(client);
    await migrator.migrate(db, { migrationsFolder: directory, migrationsSchema: 'prototype_history' });
    await journal([{ idx: 0, when: 1000, tag: 'earlier' }, { idx: 1, when: 2000, tag: 'later' }]);
    await migrator.migrate(db, { migrationsFolder: directory, migrationsSchema: 'prototype_history' });
    assert.equal((await client.query("SELECT to_regclass('prototype_earlier') AS relation")).rows[0].relation, null);
    await journal([{ idx: 0, when: 2000, tag: 'earlier' }]);
    const collision = readMigrationFiles({ migrationsFolder: directory });
    const applied = (await client.query<{ hash: string }>('SELECT hash FROM prototype_history.__drizzle_migrations')).rows[0];
    assert.notEqual(collision[0].hash, applied.hash);
    await migrator.migrate(db, { migrationsFolder: directory, migrationsSchema: 'prototype_history' });
    assert.equal((await client.query("SELECT to_regclass('prototype_earlier') AS relation")).rows[0].relation, null);
    assert.equal((await client.query('SELECT count(*)::int AS n FROM prototype_history.__drizzle_migrations')).rows[0].n, 1);
  } finally {
    await client.end();
    await rm(directory, { recursive: true, force: true });
    await fixture.cleanup();
  }
});
