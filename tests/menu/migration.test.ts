import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { testDatabase } from '../family/database.ts';
import { connectDatabase, openDatabase } from '../../lib/db/connection.ts';
import { migrateDatabase } from '../../lib/db/migrate.ts';
import { restrictedMenuDatabase } from './database.ts';

test('menu migration enforces ownership, deduplication, snapshot bounds and complete time pairs', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    const family = randomUUID();
    await db.execute('INSERT INTO families (id, created_at) VALUES ($1, $2)', [family, 1]);
    const insert = (overrides: Record<string, unknown> = {}) => {
      const row = { id: randomUUID(), familyId: family, sourceUrl: 'https://example.test/' + randomUUID(), imageUrl: null, title: 'Chickpeas', summary: 'Cook them.', timeKind: null, timeText: null, savedAt: 1795450000001, ...overrides };
      return db.execute('INSERT INTO menu_recipes (id,family_id,source_url,image_url,title,summary,time_kind,time_text,saved_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', Object.values(row));
    };
    const sourceUrl = 'https://example.test/recipe';
    await insert({ sourceUrl, imageUrl: 'https://images.example.test/photo.jpg', timeKind: 'total', timeText: '20 minutes' });
    const row = await db.one<{ image_url: string; saved_at: number }>('SELECT image_url,saved_at FROM menu_recipes WHERE source_url=$1', [sourceUrl]);
    assert.deepEqual(row, { image_url: 'https://images.example.test/photo.jpg', saved_at: 1795450000001 });
    await assert.rejects(insert({ sourceUrl }), { code: '23505' });
    for (const overrides of [{ familyId: randomUUID() }, { familyId: null }, { title: '' }, { title: ' padded ' }, { title: 'x'.repeat(161) }, { summary: 'x'.repeat(601) }, { sourceUrl: '' }, { sourceUrl: 'x'.repeat(2049) }, { imageUrl: '' }, { imageUrl: 'x'.repeat(2049) }, { timeKind: 'cook' }, { timeText: '20 minutes' }, { timeKind: 'guessed', timeText: '20 minutes' }, { timeKind: 'total', timeText: '' }, { timeKind: 'total', timeText: 'x'.repeat(81) }, { savedAt: -1 }, { savedAt: '9007199254740992' }]) await assert.rejects(insert(overrides));
    await assert.rejects(db.execute('DELETE FROM families WHERE id=$1', [family]), { code: '23503' });
    const indexes = await db.all<{ name: string }>("SELECT indexname AS name FROM pg_indexes WHERE tablename='menu_recipes' ORDER BY indexname");
    assert.deepEqual(indexes.map(row => row.name), ['menu_family_saved', 'menu_family_source_unique', 'menu_recipes_pkey']);
  } finally { await db.close(); await fixture.cleanup(); }
});

test('initial schema upgrades preserve existing data and migrations repeat without changing history', async () => {
  const fixture = await testDatabase(false); const db = connectDatabase(fixture.url);
  try {
    const initial = readMigrationFiles({ migrationsFolder: 'drizzle/postgresql' })[0];
    await db.transaction(async tx => {
      await tx.execute('CREATE TABLE __drizzle_migrations (id integer PRIMARY KEY, hash text NOT NULL, created_at bigint NOT NULL)');
      for (const sql of initial.sql) await tx.execute(sql);
      await tx.execute('INSERT INTO __drizzle_migrations VALUES ($1,$2,$3)', [0, initial.hash, initial.folderMillis]);
      await tx.execute('INSERT INTO families VALUES ($1,$2)', ['preserved-initial-family', 1]);
    }, 73462902);
    await assert.rejects(openDatabase(fixture.url), /Storage unavailable/);
    await migrateDatabase(fixture.url); await migrateDatabase(fixture.url);
    const runtime = await openDatabase(fixture.url); await runtime.close();
    assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM families'))?.n, 1);
    assert.equal((await db.one<{ n: number }>('SELECT count(*) AS n FROM __drizzle_migrations'))?.n, 4);
    await db.execute('DROP INDEX menu_family_saved');
    await assert.rejects(openDatabase(fixture.url), /Storage unavailable/);
    await assert.rejects(migrateDatabase(fixture.url));
  } finally { await db.close(); await fixture.cleanup(); }
});

test('disposable menu rollback precedes preserved initial rollback and permits fresh migration', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    await db.transaction(async tx => {
      await tx.execute(await readFile('drizzle/postgresql/rollback-unique-plans-test.sql','utf8'));
      await tx.execute(await readFile('drizzle/postgresql/rollback-plans-test.sql', 'utf8'));
      await tx.execute(await readFile('drizzle/postgresql/rollback-menu-test.sql', 'utf8'));
      await tx.execute(await readFile('drizzle/postgresql/rollback-initial.sql', 'utf8'));
    });
    assert.deepEqual(await db.all("SELECT tablename FROM pg_tables WHERE schemaname='public'"), []);
    await migrateDatabase(fixture.url);
    const reopened = await fixture.open(); await reopened.close();
  } finally { await db.close(); await fixture.cleanup(); }
});

test('explicit migration grants allow menu read/insert/delete but deny update, truncate, DDL and history writes', async () => {
  const fixture = await restrictedMenuDatabase();
  const owner = await fixture.open(); const runtime = connectDatabase(fixture.runtimeUrl);
  try {
    const family = randomUUID(), id = randomUUID();
    await owner.execute('INSERT INTO families VALUES ($1,$2)', [family, 1]);
    await runtime.execute('INSERT INTO menu_recipes (id,family_id,source_url,title,summary,saved_at) VALUES ($1,$2,$3,$4,$5,$6)', [id, family, 'https://example.test/recipe', 'Chickpeas', 'Cook them.', 1]);
    assert.equal((await runtime.one<{ id: string }>('SELECT id FROM menu_recipes WHERE id=$1', [id]))?.id, id);
    for (const sql of ['UPDATE menu_recipes SET title=title', 'TRUNCATE menu_recipes', 'CREATE TABLE forbidden_menu (id text)', "UPDATE __drizzle_migrations SET hash='forbidden'", 'DELETE FROM __drizzle_migrations']) await assert.rejects(runtime.execute(sql), { code: '42501' });
    await runtime.execute('DELETE FROM menu_recipes WHERE id=$1', [id]);
    assert.equal((await runtime.one<{ n: number }>('SELECT count(*) AS n FROM menu_recipes'))?.n, 0);
    const opened = await openDatabase(fixture.runtimeUrl); await opened.close();
    assert.deepEqual(await runtime.one('SELECT rolsuper,rolcreatedb,rolcreaterole,rolbypassrls FROM pg_roles WHERE rolname=current_user'), { rolsuper: false, rolcreatedb: false, rolcreaterole: false, rolbypassrls: false });
  } finally { await runtime.close(); await owner.close(); await fixture.cleanup(); }
});

test('a PostgreSQL dump restores menu snapshots with an exactly compatible runtime catalog', async () => {
  const source = await testDatabase(); const db = await source.open();
  let target: Awaited<ReturnType<typeof restrictedMenuDatabase>> | undefined;
  try {
    const family = randomUUID(), id = randomUUID();
    await db.execute('INSERT INTO families VALUES ($1,$2)', [family, 1]);
    await db.execute('INSERT INTO menu_recipes (id,family_id,source_url,image_url,title,summary,saved_at) VALUES ($1,$2,$3,$4,$5,$6,$7)', [id, family, 'https://example.test/recipe', 'https://images.example.test/photo.jpg', 'Chickpeas', 'Cook them.', 1795450000001]);
    target = await restrictedMenuDatabase(source.url);
    const restored = await openDatabase(target.runtimeUrl);
    try {
      assert.deepEqual(await restored.one('SELECT id,image_url,saved_at FROM menu_recipes WHERE family_id=$1', [family]), { id, image_url: 'https://images.example.test/photo.jpg', saved_at: 1795450000001 });
    } finally { await restored.close(); }
  } finally { await db.close(); await source.cleanup(); await target?.cleanup(); }
});
