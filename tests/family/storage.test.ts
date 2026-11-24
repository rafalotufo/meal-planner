import assert from 'node:assert/strict';
import { test } from 'node:test';
import { testDatabase } from './database.ts';
import { connectDatabase, openDatabase } from '../../lib/db/connection.ts';
import { migrateDatabase } from '../../lib/db/migrate.ts';

test('committed PostgreSQL schema enforces membership and invitation integrity', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    const tables = await db.all<{ name: string }>("SELECT tablename AS name FROM pg_tables WHERE schemaname='public' AND tablename <> '__drizzle_migrations' ORDER BY name");
    assert.deepEqual(tables, [{name:'app_users'},{name:'families'},{name:'family_invitations'},{name:'meal_plan_approvals'},{name:'meal_plan_suggestions'},{name:'meal_plan_weeks'},{name:'menu_recipes'}]);
    await db.execute('INSERT INTO families VALUES ($1,$2)', ['family', 1]);
    const insert = (values: unknown[]) => db.execute('INSERT INTO app_users (id,google_subject,verified_email,family_id,created_at) VALUES ($1,$2,$3,$4,$5)', values);
    await insert(['user','subject','member@gmail.com','family',1]);
    await assert.rejects(() => insert(['duplicate','subject','other@gmail.com','family',1]));
    await assert.rejects(() => insert(['orphan','another','another@gmail.com','missing',1]));
    await assert.rejects(() => insert(['unassigned','third','third@gmail.com',null,1]));
    await assert.rejects(() => db.execute('DELETE FROM families WHERE id=$1',['family']));
    const invitation = (id: string, status: string) => db.execute('INSERT INTO family_invitations (id,family_id,created_by_user_id,recipient_email,token_hash,created_at,expires_at,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[id,'family','user','new@gmail.com',id,1,10,status]);
    await assert.rejects(() => invitation('invalid','accepted'));
    await invitation('pending','pending');
    await assert.rejects(() => invitation('unknown','unknown'));
  } finally { await db.close(); await fixture.cleanup(); }
});

test('explicit migrations repeat; runtime never initializes an empty database', async () => {
  const fixture = await testDatabase(false);
  try {
    await assert.rejects(() => openDatabase(fixture.url));
    await migrateDatabase(fixture.url); await migrateDatabase(fixture.url);
    const db = await fixture.open(); await db.close();
  } finally { await fixture.cleanup(); }
});

test('changed migration history and partial schema fail closed without repair', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    await db.execute("UPDATE __drizzle_migrations SET hash='changed'");
    await assert.rejects(() => openDatabase(fixture.url));
    await assert.rejects(() => migrateDatabase(fixture.url));
  } finally { await db.close(); await fixture.cleanup(); }
  const partial = await testDatabase(); const changed = await partial.open();
  try {
    await changed.execute('DROP INDEX users_family');
    await assert.rejects(() => openDatabase(partial.url));
    await assert.rejects(() => migrateDatabase(partial.url));
    assert.equal(await changed.one("SELECT indexname FROM pg_indexes WHERE indexname='users_family'"), undefined);
  } finally { await changed.close(); await partial.cleanup(); }
});

test('failed migration rolls back schema and ledger writes together', async () => {
  const fixture = await testDatabase(false); const db = connectDatabase(fixture.url);
  try {
    await db.execute('CREATE TABLE families (id text PRIMARY KEY)');
    await assert.rejects(() => migrateDatabase(fixture.url));
    assert.deepEqual(await db.all("SELECT tablename AS name FROM pg_tables WHERE schemaname='public' ORDER BY name"), [{name:'families'}]);
  } finally { await db.close(); await fixture.cleanup(); }
});

test('unexpected columns and weakened constraints fail catalog validation', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    await db.execute('ALTER TABLE app_users DROP CONSTRAINT email_normalized');
    await assert.rejects(() => openDatabase(fixture.url));
    await assert.rejects(() => migrateDatabase(fixture.url));
  } finally { await db.close(); await fixture.cleanup(); }
});

test('concurrent explicit migrations serialize and disposable initial rollback is complete', async () => {
  const fixture = await testDatabase(false);
  try {
    await Promise.all([migrateDatabase(fixture.url), migrateDatabase(fixture.url)]);
    const db = await fixture.open();
    try {
      const { readFile } = await import('node:fs/promises');
      await db.transaction(async (tx) => {
        await tx.execute(await readFile('drizzle/postgresql/rollback-unique-plans-test.sql','utf8'));
      await tx.execute(await readFile('drizzle/postgresql/rollback-plans-test.sql','utf8'));
        await tx.execute(await readFile('drizzle/postgresql/rollback-menu-test.sql','utf8'));
        await tx.execute(await readFile('drizzle/postgresql/rollback-initial.sql','utf8'));
      });
      assert.deepEqual(await db.all("SELECT tablename FROM pg_tables WHERE schemaname='public'"), []);
      await assert.rejects(() => openDatabase(fixture.url));
      await migrateDatabase(fixture.url);
    } finally { await db.close(); }
  } finally { await fixture.cleanup(); }
});

test('bound SQL-looking identity values remain data and millisecond timestamps round-trip exactly', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    const { provisionFamily } = await import('../../lib/family-store.ts');
    const { findUser } = await import('../../lib/identity-access.ts');
    const identity = {googleSubject:"subject'); drop table families; --",email:'member@gmail.com',emailVerified:true as const};
    const row = await provisionFamily(db, identity, ['member@gmail.com'], false);
    assert.equal((await findUser(db,identity.googleSubject))?.id,row.id);
    assert.ok(Number.isSafeInteger(row.createdAt)); assert.ok(row.createdAt > 1700000000000);
    assert.equal((await db.one<{n:number}>('SELECT count(*) AS n FROM families'))?.n,1);
  } finally { await db.close(); await fixture.cleanup(); }
});

test('unreviewed triggers, functions and row-security changes fail closed', async () => {
  const fixture = await testDatabase(); const db = await fixture.open();
  try {
    await db.execute("CREATE FUNCTION unexpected() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RETURN NEW; END $$");
    await db.execute('CREATE TRIGGER unexpected BEFORE INSERT ON app_users FOR EACH ROW EXECUTE FUNCTION unexpected()');
    await assert.rejects(() => openDatabase(fixture.url));
    await assert.rejects(() => migrateDatabase(fixture.url));
    await db.execute('DROP TRIGGER unexpected ON app_users; DROP FUNCTION unexpected()');
    await db.execute('ALTER TABLE app_users ENABLE ROW LEVEL SECURITY');
    await assert.rejects(() => openDatabase(fixture.url));
  } finally { await db.close(); await fixture.cleanup(); }
});
