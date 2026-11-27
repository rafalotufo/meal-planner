import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { readMigrationFiles } from 'drizzle-orm/migrator';
import { testDatabase } from '../family/database.ts';
import { connectDatabase, catalogSignature } from '../../lib/db/connection.ts';
import { compatibility } from '../../lib/db/compatibility.ts';
import { repositorySources } from '../../lib/db/repository-migrations.ts';
import { migrateDatabase } from '../../lib/db/migrate.ts';

async function seedLegacy(url: string, order: number[]) {
  const db = connectDatabase(url);
  try {
    const migrations = readMigrationFiles({ migrationsFolder: 'drizzle/postgresql' });
    await db.transaction(async tx => {
      await tx.execute('CREATE TABLE public.__drizzle_migrations (id integer PRIMARY KEY, hash text NOT NULL, created_at bigint NOT NULL)');
      await tx.execute('SET LOCAL search_path = public, pg_catalog, pg_temp');
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
    assert.deepEqual(await a.all('SELECT * FROM families'), [{ id: 'retained-family', created_at: 1, identity_kind: 'google' }]);
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


test('seven-identity upgrades preserve rows, raw historical snapshots and ledgers, then require category identity', async () => {
  const id='6e36359b-9b16-4642-a487-e4e5411ce477';
  const excluded=new Set([id,'80fd3d65-d202-462b-883d-6adc2eb565be']);
  const previous=structuredClone(compatibility); previous.required=previous.required.filter(value=>!excluded.has(value));previous.migrations=previous.migrations.filter(value=>!excluded.has(value.id));previous.profiles=previous.profiles.filter(value=>value.applied.every(applied=>!excluded.has(applied)));
  const fixture=await testDatabase(false), db=connectDatabase(fixture.url);
  try {
    await migrateDatabase(fixture.url,{manifest:previous,sources:repositorySources()});
    await db.execute("INSERT INTO families(id,created_at) VALUES('category-preserved-family',1)");
    await db.execute("INSERT INTO menu_recipes(id,family_id,source_url,title,summary,saved_at) VALUES('category-preserved-recipe','category-preserved-family','https://example.test/preserved','Dinner','Cook it.',1)");
    const meals=JSON.stringify([{title:'Dinner',summary:'Cook it.',sourceUrl:'https://example.test/preserved',imageUrl:null,time:null}]);
    await db.execute("INSERT INTO meal_plan_weeks(id,family_id,week_start,meals,created_at) VALUES($1,'category-preserved-family','2026-11-29',$2,1)",[randomUUID(),meals]);
    const before=await db.one('SELECT meals FROM meal_plan_weeks'); const ledger=await db.all('SELECT * FROM __drizzle_migrations ORDER BY id');
    await assert.rejects(fixture.open(),/Storage unavailable/);
    await migrateDatabase(fixture.url); await migrateDatabase(fixture.url);
    assert.deepEqual(await db.one('SELECT category,category_overridden FROM menu_recipes'),{category:null,category_overridden:false});
    assert.deepEqual(await db.one('SELECT meals FROM meal_plan_weeks'),before);
    assert.deepEqual(await db.all('SELECT * FROM __drizzle_migrations ORDER BY id'),ledger);
    assert.equal((await db.one<{n:number}>('SELECT count(*) AS n FROM __app_migrations'))?.n,4);
    const opened=await fixture.open(); await opened.close();
  } finally { await db.close(); await fixture.cleanup(); }
});

test('eight-identity upgrade preserves plan snapshots, suggestions, approvals and ledgers while rejecting old runtime artifacts', async () => {
 const id='80fd3d65-d202-462b-883d-6adc2eb565be';
 const previous=structuredClone(compatibility);
 previous.required=previous.required.filter(value=>value!==id);previous.migrations=previous.migrations.filter(value=>value.id!==id);previous.profiles=previous.profiles.filter(value=>!value.applied.includes(id));
 const fixture=await testDatabase(false),db=connectDatabase(fixture.url);
 try {
  await migrateDatabase(fixture.url,{manifest:previous,sources:repositorySources()});
  const family=randomUUID(),user=randomUUID(),plan=randomUUID(),recipe=randomUUID();
  await db.execute('INSERT INTO families(id,created_at) VALUES($1,1)',[family]);
  await db.execute('INSERT INTO app_users(id,google_subject,verified_email,family_id,created_at) VALUES($1,$2,$3,$4,1)',[user,'preserved-eight-user','preserved@example.test',family]);
  await db.execute("INSERT INTO menu_recipes(id,family_id,source_url,title,summary,saved_at,category) VALUES($1,$2,'https://example.test/preserved-eight','Retained','Cook.',1,'main')",[recipe,family]);
  const content=JSON.stringify([{title:'Retained',sourceUrl:'https://example.test/preserved-eight',imageUrl:null,time:null,summary:'Cook.'}]);
  await db.execute('INSERT INTO meal_plan_weeks(id,family_id,week_start,meals,created_at) VALUES($1,$2,$3,$4,1)',[plan,family,'2026-11-29',content]);
  await db.execute('INSERT INTO meal_plan_approvals VALUES($1,$2,1,1)',[plan,user]);
  await db.execute('INSERT INTO meal_plan_suggestions(id,plan_id,user_id,base_revision,day_index,menu_recipe_id,recipe,created_at) VALUES($1,$2,$3,1,0,$4,$5,1)',[randomUUID(),plan,user,recipe,content.slice(1,-1)]);
  const tables=['meal_plan_weeks','meal_plan_approvals','meal_plan_suggestions','menu_recipes','__drizzle_migrations','__app_migrations'];
  const before=await Promise.all(tables.map(table=>db.all(`SELECT * FROM ${table} ORDER BY 1`)));
  await assert.rejects(fixture.open(),/Storage unavailable/,'new runtime rejects missing ninth identity');
  await migrateDatabase(fixture.url);await migrateDatabase(fixture.url);
  for(const [index,table]of tables.entries()) {
   const after=await db.all(`SELECT * FROM ${table} ORDER BY 1`);
   assert.deepEqual(table==='__app_migrations'?after.filter(row=>row.id!==id):after,before[index],table+' retained byte-equivalent decoded rows');
  }
  const {openDatabase}=await import('../../lib/db/connection.ts');
  const current=await fixture.open();await current.close();
  await assert.rejects(openDatabase(fixture.url,{manifest:previous,ownerTooling:true}),/Storage unavailable/,'old runtime artifact rejects ahead database');
  await assert.rejects(migrateDatabase(fixture.url,{manifest:previous,sources:repositorySources()}),/database-ahead/);
 } finally {await db.close();await fixture.cleanup();}
});
